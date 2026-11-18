import { User } from '../models/User.js';
import { Shop } from '../models/Shop.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { PrintJob } from '../models/PrintJob.js';
import { AuditLog } from '../models/AuditLog.js';

export const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalVendors,
      totalShops,
      approvedShops,
      pendingShops,
      totalOrders,
      ordersAgg,
      totalPrintJobs,
      totalProducts,
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'STUDENT', isActive: true }),
      User.countDocuments({ role: 'SHOP_OWNER', isActive: true }),
      Shop.countDocuments(),
      Shop.countDocuments({ approvalStatus: 'APPROVED' }),
      Shop.countDocuments({ approvalStatus: 'PENDING' }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: 'CANCELLED' } } },
        {
          $group: {
            _id: null,
            grossMerchandiseValue: { $sum: '$totalAmount' },
            completedOrders: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] } },
          },
        },
      ]),
      PrintJob.countDocuments(),
      Product.countDocuments({ isActive: true }),
    ]);

    const gmv = ordersAgg[0]?.grossMerchandiseValue || 0;
    const completedOrders = ordersAgg[0]?.completedOrders || 0;
    const platformCommission = gmv * 0.05; // 5% standard commission

    res.json({
      success: true,
      data: {
        totalUsers,
        totalStudents,
        totalVendors,
        totalShops,
        approvedShops,
        pendingShops,
        totalOrders,
        completedOrders,
        orderCompletionRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 100,
        grossMerchandiseValue: Number(gmv.toFixed(2)),
        platformCommission: Number(platformCommission.toFixed(2)),
        totalPrintJobs,
        totalProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { collegeId: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: Number(page),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { isActive, role } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (isActive !== undefined) user.isActive = isActive;
    if (role && ['STUDENT', 'SHOP_OWNER', 'DELIVERY_AGENT', 'ADMIN'].includes(role)) {
      user.role = role;
    }

    await user.save();

    await AuditLog.create({
      action: 'UPDATE_USER_STATUS',
      performedBy: req.user._id,
      role: req.user.role,
      resourceType: 'USER',
      resourceId: user._id.toString(),
      details: { isActive, role },
    });

    res.json({
      success: true,
      message: 'User updated successfully.',
      data: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

export const getPendingVendors = async (req, res, next) => {
  try {
    const shops = await Shop.find({ approvalStatus: 'PENDING' }).populate('ownerId', 'name email phone collegeId');
    res.json({ success: true, data: shops });
  } catch (error) {
    next(error);
  }
};

export const updateVendorApproval = async (req, res, next) => {
  try {
    const { shopId } = req.params;
    const { approvalStatus, notes } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(approvalStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be APPROVED or REJECTED.' });
    }

    const shop = await Shop.findById(shopId).populate('ownerId');
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found.' });
    }

    shop.approvalStatus = approvalStatus;
    if (approvalStatus === 'APPROVED') {
      shop.isActive = true;
    }
    await shop.save();

    await AuditLog.create({
      action: `VENDOR_${approvalStatus}`,
      performedBy: req.user._id,
      role: req.user.role,
      resourceType: 'SHOP',
      resourceId: shop._id.toString(),
      details: { approvalStatus, notes },
    });

    res.json({
      success: true,
      message: `Shop has been ${approvalStatus.toLowerCase()}.`,
      data: shop,
    });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find().populate('performedBy', 'name email role').sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};
