const path = require('path');
const multer  = require('multer');
const upload = multer({ dest: path.join(__dirname, '../temp') });

const express = require('express');

const adminController = require('../controller/adminController');

const router = express.Router();

// home page
router.post('/admin', upload.single('file'), adminController.addMultiUsers);

module.exports = router;
