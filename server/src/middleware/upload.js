import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const uploadDir = path.resolve(process.cwd(), 'uploads', 'print_jobs');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate secure randomized filename to prevent collision and directory traversal
    const randomHex = crypto.randomBytes(16).toString('hex');
    cb(null, `print_${Date.now()}_${randomHex}.pdf`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMime = 'application/pdf';
  const ext = path.extname(file.originalname).toLowerCase();

  if (file.mimetype === allowedMime && ext === '.pdf') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF (.pdf) documents are accepted for printing.'), false);
  }
};

const maxFileSizeMB = parseInt(process.env.UPLOAD_MAX_SIZE_MB || '25', 10);

export const uploadPrintPdf = multer({
  storage,
  limits: {
    fileSize: maxFileSizeMB * 1024 * 1024, // 25 MB limit
    files: 1,
  },
  fileFilter,
});
