/**
 * documentRoutes.js
 * Express router for Document upload, OCR extraction, and AI analysis.
 */

const express = require('express');
const multer = require('multer');
const {
  uploadDocumentHandler,
  getDocumentByIdHandler,
  getDocumentsHandler,
} = require('../controllers/documentController');
const { authenticateJWT } = require('../middleware/authMiddleware');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
});

// Middleware to normalize multer single/any file fields
const uploadMiddleware = (req, res, next) => {
  const handler = upload.any();
  handler(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (req.files && req.files.length > 0) {
      req.file = req.files[0];
    }
    next();
  });
};

// Authenticate user for document routes
router.use(authenticateJWT);

// POST /api/documents/upload
router.post('/upload', uploadMiddleware, uploadDocumentHandler);

// GET /api/documents
router.get('/', getDocumentsHandler);

// GET /api/documents/:id
router.get('/:id', getDocumentByIdHandler);

module.exports = router;
