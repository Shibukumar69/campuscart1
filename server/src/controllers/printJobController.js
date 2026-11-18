import path from 'path';
import fs from 'fs';
import { PrintJob } from '../models/PrintJob.js';
import { Shop } from '../models/Shop.js';
import { calculatePrintPrice, DEFAULT_PRINT_RATES } from '../utils/pricingEngine.js';

export const getRateCard = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: DEFAULT_PRINT_RATES,
    });
  } catch (error) {
    next(error);
  }
};

export const createPrintJob = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF document.' });
    }

    const {
      shopId,
      pageCount = 1,
      copies = 1,
      printColor = 'BW',
      paperSize = 'A4',
      sides = 'DOUBLE',
      bindingType = 'NONE',
      additionalNotes = '',
    } = req.body;

    const parsedPages = Math.max(1, parseInt(pageCount, 10) || 1);
    const parsedCopies = Math.max(1, parseInt(copies, 10) || 1);

    const priceBreakdown = calculatePrintPrice({
      pageCount: parsedPages,
      copies: parsedCopies,
      printColor,
      sides,
      paperSize,
      bindingType,
    });

    const jobCode = `PJ-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const printJob = await PrintJob.create({
      jobCode,
      studentId: req.user._id,
      shopId,
      originalFileName: req.file.originalname,
      storedFileName: req.file.filename,
      filePath: req.file.path,
      fileSize: req.file.size,
      pageCount: parsedPages,
      copies: parsedCopies,
      printColor,
      paperSize,
      sides,
      bindingType,
      additionalNotes,
      estimatedPrice: priceBreakdown.totalPrice,
      finalPrice: priceBreakdown.totalPrice,
      status: 'SUBMITTED',
    });

    res.status(201).json({
      success: true,
      message: 'Print job submitted successfully.',
      data: {
        printJob,
        priceBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyPrintJobs = async (req, res, next) => {
  try {
    const jobs = await PrintJob.find({ studentId: req.user._id })
      .populate('shopId', 'name campusLocation')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: jobs });
  } catch (error) {
    next(error);
  }
};

export const getShopPrintQueue = async (req, res, next) => {
  try {
    let shopId = req.query.shopId;
    if (!shopId && req.user.role === 'SHOP_OWNER') {
      const shop = await Shop.findOne({ ownerId: req.user._id });
      shopId = shop?._id;
    }

    const { status } = req.query;
    const filter = { shopId };
    if (status) filter.status = status;

    const jobs = await PrintJob.find(filter)
      .populate('studentId', 'name email phone hostelBlock roomNumber')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: jobs });
  } catch (error) {
    next(error);
  }
};

export const updatePrintJobStatus = async (req, res, next) => {
  try {
    const { status, finalPrice, rejectionReason } = req.body;
    const job = await PrintJob.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Print job not found.' });
    }

    const validStatuses = ['SUBMITTED', 'ACCEPTED', 'PRINTING', 'READY_FOR_PICKUP', 'DELIVERED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid target status.' });
    }

    job.status = status;
    if (finalPrice !== undefined) job.finalPrice = Number(finalPrice);
    if (rejectionReason) job.rejectionReason = rejectionReason;

    await job.save();

    res.json({
      success: true,
      message: `Print job updated to ${status}.`,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

export const downloadPrintFile = async (req, res, next) => {
  try {
    const job = await PrintJob.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Print job not found.' });
    }

    // Authorization check: Only student who uploaded, vendor of shop, or admin
    const isOwner = job.studentId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';
    let isAssignedVendor = false;

    if (req.user.role === 'SHOP_OWNER') {
      const shop = await Shop.findById(job.shopId);
      if (shop && shop.ownerId.toString() === req.user._id.toString()) {
        isAssignedVendor = true;
      }
    }

    if (!isOwner && !isAdmin && !isAssignedVendor) {
      return res.status(403).json({ success: false, message: 'Unauthorized file download access.' });
    }

    if (!fs.existsSync(job.filePath)) {
      return res.status(404).json({ success: false, message: 'Document file not found on disk.' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${job.originalFileName}"`);
    const fileStream = fs.createReadStream(job.filePath);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
};
