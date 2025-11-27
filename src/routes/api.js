const express = require('express');
const router = express.Router();
const controller = require('../controllers/linkController');

// api endpoints
router.post('/links', controller.createLink);
router.get('/links', controller.getLinks);
router.get('/links/:code', controller.getLinkStats);
router.delete('/links/:code', controller.deleteLink);

module.exports = router;