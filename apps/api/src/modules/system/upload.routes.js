import { Router } from 'express';
import { upload } from '../../config/multer.js';
import { isAuthenticated } from '../../middleware/auth.js';

const router = Router();

// Upload a single file
router.post('/', isAuthenticated, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    // Construct the full URL
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

    res.json({
      success: true,
      message: 'File uploaded successfully',
      url: fileUrl,
      filename: req.file.filename,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
