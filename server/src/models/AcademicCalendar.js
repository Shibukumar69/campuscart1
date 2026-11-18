import mongoose from 'mongoose';

const academicCalendarSchema = new mongoose.Schema(
  {
    eventTitle: {
      type: String,
      required: true,
      trim: true,
    },
    eventType: {
      type: String,
      enum: [
        'MID_TERM_EXAMS',
        'END_SEM',
        'INTERNAL_ASSESSMENT',
        'PROJECT_SUBMISSION',
        'HOLIDAY',
        'OTHER',
      ],
      required: true,
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
      index: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    campusId: {
      type: String,
      default: 'CAMPUS-MAIN',
    },
    description: {
      type: String,
      default: '',
    },
    impactCategory: {
      type: String,
      enum: ['EXAM_STATIONERY', 'PROJECT_PRINTING', 'GENERAL'],
      default: 'GENERAL',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const AcademicCalendar = mongoose.model('AcademicCalendar', academicCalendarSchema);
