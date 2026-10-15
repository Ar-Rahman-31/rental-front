
import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (_req, file, callback) => {
  if (!file.mimetype.startsWith('image/')) {
    return callback(new Error('Only image files are allowed.'));
  }

  callback(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    files: 8,
    fileSize: 5 * 1024 * 1024,
  },
});
