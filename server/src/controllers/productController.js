import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { Shop } from '../models/Shop.js';
import { InventoryLedger } from '../models/InventoryLedger.js';

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      semester,
      shopId,
      minPrice,
      maxPrice,
      inStockOnly,
      isFeatured,
      sort = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 24,
    } = req.query;

    const query = { isActive: true };

    if (semester) {
      query.semester = Number(semester);
    }

    if (shopId) {
      query.shopId = shopId;
    }

    if (category) {
      // Find category by slug or id
      const cat = await Category.findOne({ $or: [{ slug: category }, { _id: category }] });
      if (cat) {
        query.categoryId = cat._id;
      }
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (inStockOnly === 'true') {
      query.currentStock = { $gt: 0 };
    }

    if (isFeatured === 'true') {
      query.isFeatured = true;
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortField = sort === 'price' ? 'price' : sort === 'title' ? 'title' : 'createdAt';

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('categoryId', 'name slug iconName')
        .populate('shopId', 'name campusLocation rating')
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    // Strip costPrice if not shop owner / admin
    const sanitizedProducts = products.map((p) => {
      const obj = p.toObject();
      if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SHOP_OWNER')) {
        delete obj.costPrice;
      }
      return obj;
    });

    res.json({
      success: true,
      data: {
        products: sanitizedProducts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.productId)
      .populate('categoryId', 'name slug iconName')
      .populate('shopId', 'name campusLocation rating operatingHours');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const obj = product.toObject();
    if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SHOP_OWNER')) {
      delete obj.costPrice;
    }

    res.json({
      success: true,
      data: obj,
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const {
      shopId,
      categoryId,
      title,
      description,
      SKU,
      price,
      costPrice,
      currentStock,
      minStockThreshold,
      leadTimeDays,
      safetyStock,
      images,
      tags,
      unit,
      isFeatured,
    } = req.body;

    const targetShopId = shopId || (await Shop.findOne({ ownerId: req.user._id }))?._id;
    if (!targetShopId) {
      return res.status(400).json({ success: false, message: 'Valid shop ID is required.' });
    }

    // Verify shop ownership if not admin
    if (req.user.role !== 'ADMIN') {
      const shop = await Shop.findById(targetShopId);
      if (!shop || shop.ownerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Forbidden: You do not own this shop.' });
      }
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const product = await Product.create({
      shopId: targetShopId,
      categoryId,
      title,
      slug,
      description: description || '',
      SKU: SKU || `SKU-${Date.now().toString().slice(-6)}`,
      price: Number(price),
      costPrice: Number(costPrice || price * 0.7),
      currentStock: Number(currentStock || 0),
      minStockThreshold: Number(minStockThreshold || 15),
      leadTimeDays: Number(leadTimeDays || 2),
      safetyStock: Number(safetyStock || 10),
      images: images || [],
      tags: tags || [],
      unit: unit || 'piece',
      isFeatured: Boolean(isFeatured),
    });

    // Record initial stock transaction in ledger if > 0
    if (product.currentStock > 0) {
      await InventoryLedger.create({
        productId: product._id,
        shopId: targetShopId,
        transactionType: 'RESTOCK',
        quantityChanged: product.currentStock,
        balanceBefore: 0,
        balanceAfter: product.currentStock,
        referenceType: 'INITIAL_STOCK',
        performedBy: req.user._id,
        notes: 'Initial catalog stocking',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check ownership
    if (req.user.role !== 'ADMIN') {
      const shop = await Shop.findById(product.shopId);
      if (!shop || shop.ownerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Forbidden: You do not own this product.' });
      }
    }

    const allowedUpdates = [
      'title',
      'description',
      'price',
      'costPrice',
      'categoryId',
      'minStockThreshold',
      'leadTimeDays',
      'safetyStock',
      'images',
      'unit',
      'isActive',
      'isFeatured',
      'tags',
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    if (req.body.title) {
      product.slug = req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully.',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (req.user.role !== 'ADMIN') {
      const shop = await Shop.findById(product.shopId);
      if (!shop || shop.ownerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Forbidden: You do not own this product.' });
      }
    }

    // Soft delete
    product.isActive = false;
    await product.save();

    res.json({ success: true, message: 'Product deactivated successfully.' });
  } catch (error) {
    next(error);
  }
};
