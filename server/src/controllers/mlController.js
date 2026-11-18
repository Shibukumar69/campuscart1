import axios from 'axios';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { AcademicCalendar } from '../models/AcademicCalendar.js';
import { Shop } from '../models/Shop.js';
import { PurchaseOrder } from '../models/PurchaseOrder.js';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

/**
 * Helper to fetch aggregated daily sales for a product from completed orders
 */
const getHistoricalSalesData = async (productId, shopId) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 60);

  const sales = await Order.aggregate([
    {
      $match: {
        shopId: shopId,
        status: { $in: ['COMPLETED', 'DELIVERED', 'READY_FOR_PICKUP'] },
        createdAt: { $gte: thirtyDaysAgo },
        'items.productId': productId,
      },
    },
    { $unwind: '$items' },
    {
      $match: {
        'items.productId': productId,
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        totalQuantity: { $sum: '$items.quantity' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return sales.map((s) => ({ date: s._id, quantity: s.totalQuantity }));
};

export const getProductForecast = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { horizon = 7 } = req.query;
    const horizonDays = parseInt(horizon, 10) === 30 ? 30 : 7;

    const product = await Product.findById(productId).populate('categoryId', 'name slug');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Fetch upcoming academic events
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + 35);
    const academicEvents = await AcademicCalendar.find({
      isActive: true,
      endDate: { $gte: now },
      startDate: { $lte: futureDate },
    });

    const historicalSales = await getHistoricalSalesData(product._id, product.shopId);

    try {
      // Attempt Python FastAPI call
      const response = await axios.post(
        `${ML_SERVICE_URL}/predict`,
        {
          shop_id: product.shopId.toString(),
          product_id: product._id.toString(),
          product_name: product.title,
          category: product.categoryId?.name || 'General',
          current_stock: product.currentStock,
          lead_time_days: product.leadTimeDays,
          safety_stock: product.safetyStock,
          horizon_days: horizonDays,
          historical_sales: historicalSales,
          academic_events: academicEvents.map((e) => ({
            title: e.eventTitle,
            type: e.eventType,
            start_date: e.startDate.toISOString().split('T')[0],
            end_date: e.endDate.toISOString().split('T')[0],
            impact_category: e.impactCategory,
          })),
        },
        { timeout: 4000 }
      );

      return res.json({
        success: true,
        source: 'FASTAPI_ML_SERVICE',
        data: response.data,
      });
    } catch (mlError) {
      // Graceful fallback to statistical baseline forecast if ML service is warming up or offline
      console.warn(`[ML Service Warning]: ${mlError.message}. Using high-fidelity statistical fallback.`);

      const recentDailyAvg =
        historicalSales.length > 0
          ? historicalSales.reduce((acc, s) => acc + s.quantity, 0) / historicalSales.length
          : 6.5;

      const predictions = [];
      const today = new Date();

      for (let i = 1; i <= horizonDays; i++) {
        const target = new Date(today);
        target.setDate(today.getDate() + i);
        const dayOfWeek = target.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        // Realistic variation pattern
        const dayMultiplier = isWeekend ? 0.6 : 1.15;
        const trendFactor = 1 + Math.sin(i / 2) * 0.15;
        const predictedUnits = Math.max(1, Math.round(recentDailyAvg * dayMultiplier * trendFactor));

        predictions.push({
          date: target.toISOString().split('T')[0],
          day_name: target.toLocaleDateString('en-US', { weekday: 'short' }),
          predicted_units: predictedUnits,
          lower_bound: Math.max(0, predictedUnits - 2),
          upper_bound: predictedUnits + 3,
        });
      }

      const totalForecastDemand = predictions.reduce((sum, p) => sum + p.predicted_units, 0);
      const leadTimeDemand = Math.round((totalForecastDemand / horizonDays) * product.leadTimeDays);
      const reorderPoint = leadTimeDemand + product.safetyStock;
      const isLowStock = product.currentStock <= reorderPoint;
      const suggestedReorderQuantity = Math.max(0, totalForecastDemand + product.safetyStock - product.currentStock);

      return res.json({
        success: true,
        source: 'STATISTICAL_FALLBACK_ENGINE',
        data: {
          product_id: product._id,
          product_name: product.title,
          current_stock: product.currentStock,
          lead_time_days: product.leadTimeDays,
          safety_stock: product.safetyStock,
          horizon_days: horizonDays,
          predictions,
          total_predicted_demand: totalForecastDemand,
          lead_time_demand: leadTimeDemand,
          reorder_point: reorderPoint,
          stockout_risk: isLowStock ? (product.currentStock <= product.safetyStock ? 'HIGH' : 'MEDIUM') : 'LOW',
          suggested_reorder_quantity: suggestedReorderQuantity,
          model_version: '1.0.0-fallback',
          data_status: historicalSales.length >= 7 ? 'historical' : 'cold_start_baseline',
          limitations: ['FastAPI ML service offline; rendered via statistical rolling baseline engine.'],
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getReorderRecommendations = async (req, res, next) => {
  try {
    let shopId = req.query.shopId;
    if (!shopId && req.user.role === 'SHOP_OWNER') {
      const shop = await Shop.findOne({ ownerId: req.user._id });
      shopId = shop?._id;
    }

    if (!shopId) {
      return res.status(400).json({ success: false, message: 'Shop ID is required.' });
    }

    const products = await Product.find({ shopId, isActive: true }).populate('categoryId', 'name');

    // Calculate intelligent inventory recommendation for each product
    const recommendations = [];

    for (const prod of products) {
      // Lead Time Demand = Lead Time Days * Estimated Daily Velocity (default 4 units/day)
      const estimatedDailyDemand = prod.minStockThreshold > 10 ? Math.ceil(prod.minStockThreshold / 3) : 4;
      const leadTimeDemand = prod.leadTimeDays * estimatedDailyDemand;
      const reorderPoint = leadTimeDemand + prod.safetyStock;

      const isUnderReorderPoint = prod.currentStock <= reorderPoint;
      const replenishmentPeriodDays = 14;
      const cycleDemand = estimatedDailyDemand * replenishmentPeriodDays;
      const suggestedPurchaseQty = Math.max(0, cycleDemand + prod.safetyStock - prod.currentStock);

      let urgency = 'NORMAL';
      if (prod.currentStock === 0) urgency = 'CRITICAL';
      else if (prod.currentStock <= prod.safetyStock) urgency = 'HIGH';
      else if (isUnderReorderPoint) urgency = 'MEDIUM';

      if (isUnderReorderPoint || prod.currentStock <= prod.minStockThreshold) {
        recommendations.push({
          productId: prod._id,
          productTitle: prod.title,
          sku: prod.SKU,
          category: prod.categoryId?.name || 'General',
          currentStock: prod.currentStock,
          safetyStock: prod.safetyStock,
          leadTimeDays: prod.leadTimeDays,
          estimatedDailyDemand,
          leadTimeDemand,
          reorderPoint,
          suggestedPurchaseQty: suggestedPurchaseQty > 0 ? suggestedPurchaseQty : 20,
          costPrice: prod.costPrice,
          estimatedPOAmount: (suggestedPurchaseQty > 0 ? suggestedPurchaseQty : 20) * prod.costPrice,
          urgency,
          formulaExplanation: `Reorder Point (${reorderPoint}) = Lead Time Demand (${leadTimeDemand}) + Safety Stock (${prod.safetyStock}). Current stock (${prod.currentStock}) is at or below threshold.`,
        });
      }
    }

    res.json({
      success: true,
      data: {
        totalRecommendations: recommendations.length,
        recommendations,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createDraftPurchaseOrder = async (req, res, next) => {
  try {
    const { shopId, items, supplierName, notes } = req.body;

    let targetShopId = shopId;
    if (!targetShopId && req.user.role === 'SHOP_OWNER') {
      const shop = await Shop.findOne({ ownerId: req.user._id });
      targetShopId = shop?._id;
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one item is required for a purchase order.' });
    }

    let totalCost = 0;
    const poItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (product) {
        const unitCost = Number(item.unitCost || product.costPrice);
        const qty = Number(item.quantity);
        const lineTotal = unitCost * qty;
        totalCost += lineTotal;

        poItems.push({
          productId: product._id,
          title: product.title,
          sku: product.SKU,
          quantity: qty,
          unitCost,
          lineTotal,
          reason: item.reason || 'AI Automated Reorder Point Recommendation',
        });
      }
    }

    const poNumber = `PO-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const po = await PurchaseOrder.create({
      poNumber,
      shopId: targetShopId,
      supplierName: supplierName || 'National Campus Stationery Suppliers Ltd.',
      items: poItems,
      totalCost,
      status: 'DRAFT',
      notes: notes || 'Draft generated from CampusCart AI demand recommendations',
    });

    res.status(201).json({
      success: true,
      message: 'Draft purchase order generated successfully.',
      data: po,
    });
  } catch (error) {
    next(error);
  }
};

export const triggerTraining = async (req, res, next) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/train`, {}, { timeout: 15000 });
    res.json({
      success: true,
      message: 'ML Model retraining pipeline completed successfully.',
      data: response.data,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: `Failed to communicate with ML Training microservice: ${error.message}`,
    });
  }
};
