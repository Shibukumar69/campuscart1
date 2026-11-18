import { Product } from '../models/Product.js';
import { InventoryLedger } from '../models/InventoryLedger.js';
import { Shop } from '../models/Shop.js';

export const getInventory = async (req, res, next) => {
  try {
    let shopId = req.query.shopId;
    if (!shopId && req.user.role === 'SHOP_OWNER') {
      const shop = await Shop.findOne({ ownerId: req.user._id });
      shopId = shop?._id;
    }

    if (!shopId) {
      return res.status(400).json({ success: false, message: 'Shop ID is required.' });
    }

    const products = await Product.find({ shopId, isActive: true })
      .populate('categoryId', 'name slug')
      .sort({ currentStock: 1 });

    const enrichedProducts = products.map((prod) => {
      let status = 'HEALTHY'; // GREEN
      if (prod.currentStock <= 0) {
        status = 'CRITICAL'; // RED
      } else if (prod.currentStock <= prod.minStockThreshold) {
        status = 'WARNING'; // AMBER
      }

      return {
        ...prod.toObject(),
        stockHealth: status,
        reorderPoint: prod.safetyStock + (prod.leadTimeDays * 5), // basic baseline before ML
      };
    });

    res.json({
      success: true,
      data: enrichedProducts,
    });
  } catch (error) {
    next(error);
  }
};

export const getLowStockAlerts = async (req, res, next) => {
  try {
    let shopId = req.query.shopId;
    if (!shopId && req.user.role === 'SHOP_OWNER') {
      const shop = await Shop.findOne({ ownerId: req.user._id });
      shopId = shop?._id;
    }

    const products = await Product.find({
      shopId,
      isActive: true,
      $expr: { $lte: ['$currentStock', '$minStockThreshold'] },
    }).populate('categoryId', 'name');

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

export const getLedger = async (req, res, next) => {
  try {
    let shopId = req.query.shopId;
    if (!shopId && req.user.role === 'SHOP_OWNER') {
      const shop = await Shop.findOne({ ownerId: req.user._id });
      shopId = shop?._id;
    }

    const { productId, limit = 50 } = req.query;
    const filter = { shopId };
    if (productId) filter.productId = productId;

    const ledger = await InventoryLedger.find(filter)
      .populate('productId', 'title SKU')
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({
      success: true,
      data: ledger,
    });
  } catch (error) {
    next(error);
  }
};

export const restockProduct = async (req, res, next) => {
  try {
    const { productId, quantity, notes = 'Restock replenishment' } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Valid productId and positive quantity are required.' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const balanceBefore = product.currentStock;
    product.currentStock += Number(quantity);
    const balanceAfter = product.currentStock;
    await product.save();

    const ledgerEntry = await InventoryLedger.create({
      productId: product._id,
      shopId: product.shopId,
      transactionType: 'RESTOCK',
      quantityChanged: Number(quantity),
      balanceBefore,
      balanceAfter,
      referenceType: 'MANUAL_COUNT',
      performedBy: req.user._id,
      notes,
    });

    res.json({
      success: true,
      message: `Successfully restocked ${quantity} units.`,
      data: {
        product,
        ledgerEntry,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const adjustStock = async (req, res, next) => {
  try {
    const { productId, newStock, reason = 'Inventory audit adjustment' } = req.body;

    if (!productId || newStock === undefined || newStock < 0) {
      return res.status(400).json({ success: false, message: 'Valid productId and non-negative newStock required.' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const balanceBefore = product.currentStock;
    const quantityChanged = Number(newStock) - balanceBefore;
    product.currentStock = Number(newStock);
    const balanceAfter = product.currentStock;
    await product.save();

    const ledgerEntry = await InventoryLedger.create({
      productId: product._id,
      shopId: product.shopId,
      transactionType: 'ADJUSTMENT',
      quantityChanged,
      balanceBefore,
      balanceAfter,
      referenceType: 'MANUAL_COUNT',
      performedBy: req.user._id,
      notes: reason,
    });

    res.json({
      success: true,
      message: `Inventory updated from ${balanceBefore} to ${balanceAfter}.`,
      data: {
        product,
        ledgerEntry,
      },
    });
  } catch (error) {
    next(error);
  }
};
