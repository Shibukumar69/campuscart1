import { AcademicCalendar } from '../models/AcademicCalendar.js';

export const getAcademicEvents = async (req, res, next) => {
  try {
    const { upcomingOnly = 'false' } = req.query;
    const filter = { isActive: true };

    if (upcomingOnly === 'true') {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      filter.endDate = { $gte: now };
    }

    const events = await AcademicCalendar.find(filter).sort({ startDate: 1 });
    res.json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
};

export const createAcademicEvent = async (req, res, next) => {
  try {
    const { eventTitle, eventType, startDate, endDate, campusId, description, impactCategory } = req.body;

    if (!eventTitle || !eventType || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Missing required academic event fields.' });
    }

    const event = await AcademicCalendar.create({
      eventTitle,
      eventType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      campusId: campusId || 'CAMPUS-MAIN',
      description: description || '',
      impactCategory: impactCategory || 'GENERAL',
    });

    res.status(201).json({
      success: true,
      message: 'Academic event scheduled successfully.',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAcademicEvent = async (req, res, next) => {
  try {
    const event = await AcademicCalendar.findByIdAndUpdate(req.params.eventId, req.body, {
      new: true,
      runValidators: true,
    });

    if (!event) {
      return res.status(404).json({ success: false, message: 'Academic event not found.' });
    }

    res.json({ success: true, message: 'Academic event updated.', data: event });
  } catch (error) {
    next(error);
  }
};

export const deleteAcademicEvent = async (req, res, next) => {
  try {
    const event = await AcademicCalendar.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Academic event not found.' });
    }

    event.isActive = false;
    await event.save();

    res.json({ success: true, message: 'Academic event deactivated.' });
  } catch (error) {
    next(error);
  }
};
