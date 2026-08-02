/**
 * documentController.js
 * Controller for Document OCR extraction and AI Analysis.
 */

const { Document } = require('../models');
const ocrService = require('../services/ocrService');
const documentAnalysisService = require('../services/documentAnalysisService');

/**
 * POST /api/documents/upload
 * Processes document upload (PDF or Image), performs OCR, generates AI summary, and saves Document model.
 */
const uploadDocumentHandler = async (req, res, next) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : null;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required for document upload.',
      });
    }

    const file = req.file || (req.files && req.files.length > 0 ? req.files[0] : null);
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No document file attached. Please upload a file with field name "document" or "file".',
      });
    }

    // 1. OCR text extraction
    const extractedText = await ocrService.extractTextFromDocument(file, file.mimetype || file.originalname);

    // 2. AI document summary analysis
    const summary = await documentAnalysisService.analyzeDocument(extractedText);

    // 3. Save Document model to database
    const fileName = file.originalname || file.filename || 'uploaded_document';
    const fileType = file.mimetype || (fileName.endsWith('.pdf') ? 'application/pdf' : 'image/png');
    const fileUrl = `/uploads/${file.filename || fileName}`;

    const doc = new Document({
      userId,
      fileName,
      fileType,
      fileUrl,
      extractedText,
      summary,
    });

    await doc.save();

    return res.status(201).json({
      success: true,
      message: 'Document processed and analyzed successfully.',
      document: doc,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/documents/:id
 * Retrieves document by ID for authenticated user.
 */
const getDocumentByIdHandler = async (req, res, next) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : null;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to retrieve document.',
      });
    }

    const doc = await Document.findOne({ _id: id, userId });
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: `Document with ID '${id}' not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      document: doc,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/documents
 * Retrieves all documents uploaded by authenticated user.
 */
const getDocumentsHandler = async (req, res, next) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : null;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to list documents.',
      });
    }

    const documents = await Document.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadDocumentHandler,
  getDocumentByIdHandler,
  getDocumentsHandler,
};
