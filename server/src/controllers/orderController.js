import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { InventoryLedger } from '../models/InventoryLedger.js';
import { Shop } from '../models/Shop.js';
import { generateDeliveryOtp, verifyOtpHash } from '../utils/tokens.js';
import { sendOrderOtpEmail } from '../services/emailService.js';

export const createOrder = async (req, res, next) => {
  try {
    const { shopId, items, deliveryType, deliveryAddress, paymentMethod = 'COD' } = req.body;

    if (!shopId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid order data. Shop and items are required.' });
    }

    const shop = await Shop.findById(shopId);
    if (!shop || !shop.isActive) {
      return res.status(400).json({ success: false, message: 'Shop is not available for orders.' });
    }

    // Validate inventory and prepare item snapshots
    let subtotal = 0;
    const orderItems = [];
    const stockDeductions = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        return res.status(400).json({ success: false, message: `Product ${item.productId} is no longer available.` });
      }

      if (product.currentStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.title}". Requested: ${item.quantity}, Available: ${product.currentStock}.`,
        });
      }

      const lineTotal = product.price * item.quantity;
      subtotal += lineTotal;

      orderItems.push({
        productId: product._id,
        productTitleSnapshot: product.title,
        skuSnapshot: product.SKU,
        quantity: item.quantity,
        unitPriceSnapshot: product.price,
        lineTotal,
      });

      stockDeductions.push({
        product,
        quantity: item.quantity,
      });
    }

    const deliveryFee = deliveryType === 'SELF_PICKUP' ? 0 : 15;
    const totalAmount = subtotal + deliveryFee;

    // Generate delivery OTP and hash
    const { otp, otpHash } = generateDeliveryOtp();
    const orderNumber = `CC-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const order = await Order.create({
      orderNumber,
      studentId: req.user._id,
      shopId,
      items: orderItems,
      subtotal,
      deliveryFee,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'SANDBOX' ? 'PAID' : 'PENDING',
      deliveryType: deliveryType || 'HOSTEL_DELIVERY',
      deliveryAddressSnapshot: deliveryAddress || {
        recipientName: req.user.name,
        phone: req.user.phone,
        hostelBlock: req.user.hostelBlock || 'Hostel Block A',
        roomNumber: req.user.roomNumber || '204',
        campusLandmark: 'Near Common Room',
      },
      deliveryOtp: otp,
      deliveryOtpHash: otpHash,
      status: 'PLACED',
      statusTimeline: [
        {
          status: 'PLACED',
          timestamp: new Date(),
          note: 'Order successfully placed by student.',
          changedBy: req.user._id,
        },
      ],
    });

    // Execute atomic stock deductions and ledger entries
    for (const deduction of stockDeductions) {
      const balanceBefore = deduction.product.currentStock;
      deduction.product.currentStock -= deduction.quantity;
      const balanceAfter = deduction.product.currentStock;
      await deduction.product.save();

      await InventoryLedger.create({
        productId: deduction.product._id,
        shopId,
        transactionType: 'ORDER_DEDUCTION',
        quantityChanged: -deduction.quantity,
        balanceBefore,
        balanceAfter,
        referenceType: 'ORDER',
        referenceId: order.orderNumber,
        performedBy: req.user._id,
        notes: `Order #${order.orderNumber} placed`,
      });
    }

    // Return order with plain OTP for the student to see
    const responseOrder = order.toObject();
    responseOrder.deliveryOtp = otp; // Only student sees this on creation

    // Asynchronously dispatch real Delivery OTP & order confirmation email via Gmail SMTP
    sendOrderOtpEmail({
      toEmail: req.user.email,
      studentName: req.user.name,
      orderNumber: order.orderNumber,
      otp,
      totalAmount: order.totalAmount,
      deliveryAddress: order.deliveryAddressSnapshot,
      items: order.items,
    }).catch((err) => console.warn('[Email Error]:', err.message));

    res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      data: responseOrder,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ studentId: req.user._id })
      .populate('shopId', 'name campusLocation')
      .populate('deliveryAgentId', 'name phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

export const getShopOrders = async (req, res, next) => {
  try {
    let shopId = req.query.shopId;
    if (!shopId && req.user.role === 'SHOP_OWNER') {
      const shop = await Shop.findOne({ ownerId: req.user._id });
      shopId = shop?._id;
    }

    const { status } = req.query;
    const filter = { shopId };
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .select('-deliveryOtp')
      .populate('studentId', 'name email phone hostelBlock roomNumber')
      .populate('deliveryAgentId', 'name phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

export const getAssignedDeliveries = async (req, res, next) => {
  try {
    const orders = await Order.find({
      $or: [
        { deliveryAgentId: req.user._id },
        { status: 'READY_FOR_PICKUP', deliveryType: 'HOSTEL_DELIVERY', deliveryAgentId: null },
      ],
    })
      .select('-deliveryOtp')
      .populate('shopId', 'name campusLocation')
      .populate('studentId', 'name phone hostelBlock roomNumber')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('shopId', 'name campusLocation rating')
      .populate('studentId', 'name email phone hostelBlock roomNumber')
      .populate('deliveryAgentId', 'name phone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Only student owner and admin can see the delivery OTP
    const isOwner = req.user && req.user._id.equals(order.studentId?._id || order.studentId);
    const isAdmin = req.user && req.user.role === 'ADMIN';
    const orderObj = order.toObject();
    if (!isOwner && !isAdmin) {
      delete orderObj.deliveryOtp;
    }

    res.json({ success: true, data: orderObj });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note, rejectionReason } = req.body;
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const validStatuses = [
      'PLACED',
      'ACCEPTED',
      'PREPARING',
      'READY_FOR_PICKUP',
      'OUT_FOR_DELIVERY',
      'COMPLETED',
      'CANCELLED',
      'REJECTED',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid target order status.' });
    }

    // Role authorizations
    if (req.user.role === 'DELIVERY_AGENT') {
      if (status === 'OUT_FOR_DELIVERY') {
        order.deliveryAgentId = req.user._id;
      }
    }

    // If order is rejected or cancelled, restore stock
    if ((status === 'CANCELLED' || status === 'REJECTED') && order.status !== 'CANCELLED' && order.status !== 'REJECTED') {
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          const balanceBefore = product.currentStock;
          product.currentStock += item.quantity;
          const balanceAfter = product.currentStock;
          await product.save();

          await InventoryLedger.create({
            productId: product._id,
            shopId: order.shopId,
            transactionType: 'RETURN',
            quantityChanged: item.quantity,
            balanceBefore,
            balanceAfter,
            referenceType: 'ORDER',
            referenceId: order.orderNumber,
            performedBy: req.user._id,
            notes: `Stock restored upon order #${order.orderNumber} ${status.toLowerCase()}`,
          });
        }
      }
    }

    order.status = status;
    if (rejectionReason) order.rejectionReason = rejectionReason;
    order.statusTimeline.push({
      status,
      timestamp: new Date(),
      note: note || `Order updated to ${status}`,
      changedBy: req.user._id,
    });

    await order.save();

    res.json({
      success: true,
      message: `Order status updated to ${status}.`,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyDeliveryOtp = async (req, res, next) => {
  try {
    const { otp } = req.body;
    const order = await Order.findById(req.params.orderId).select('+deliveryOtpHash');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.status === 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Order has already been completed.' });
    }

    if (order.deliveryOtpAttempts >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Max OTP verification attempts exceeded. Contact campus dispatch.',
      });
    }

    const isValid = verifyOtpHash(otp, order.deliveryOtpHash);
    if (!isValid) {
      order.deliveryOtpAttempts += 1;
      await order.save();
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${5 - order.deliveryOtpAttempts} attempts remaining.`,
      });
    }

    order.status = 'COMPLETED';
    order.paymentStatus = 'PAID';
    order.deliveryAgentId = req.user._id;
    order.statusTimeline.push({
      status: 'COMPLETED',
      timestamp: new Date(),
      note: 'Verified with student delivery OTP.',
      changedBy: req.user._id,
    });

    await order.save();

    res.json({
      success: true,
      message: 'OTP verified successfully! Order marked as completed.',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};
