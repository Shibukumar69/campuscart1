import { Shop } from '../models/Shop.js';

export const getAllShops = async (req, res, next) => {
  try {
    const { approvedOnly = 'true' } = req.query;
    const filter = {};
    if (approvedOnly === 'true') {
      filter.approvalStatus = 'APPROVED';
      filter.isActive = true;
    }

    const shops = await Shop.find(filter).populate('ownerId', 'name email phone');
    res.json({
      success: true,
      data: shops,
    });
  } catch (error) {
    next(error);
  }
};

export const getShopById = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.shopId).populate('ownerId', 'name email phone');
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }
    res.json({
      success: true,
      data: shop,
    });
  } catch (error) {
    next(error);
  }
};

export const updateShop = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.shopId);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    // Must be shop owner or admin
    if (req.user.role !== 'ADMIN' && shop.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not own this shop.' });
    }

    const { name, description, campusLocation, supportedDeliveryAreas, operatingHours, offersPrinting } = req.body;
    if (name) shop.name = name;
    if (description !== undefined) shop.description = description;
    if (campusLocation) shop.campusLocation = campusLocation;
    if (supportedDeliveryAreas) shop.supportedDeliveryAreas = supportedDeliveryAreas;
    if (operatingHours) shop.operatingHours = operatingHours;
    if (offersPrinting !== undefined) shop.offersPrinting = offersPrinting;

    await shop.save();

    res.json({
      success: true,
      message: 'Shop updated successfully.',
      data: shop,
    });
  } catch (error) {
    next(error);
  }
};
