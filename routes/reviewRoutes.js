const express = require('express');
const reviewController = require('../controllers/reviewController');
const { protect } = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(protect, reviewController.getAllReviews)
  .post(protect, reviewController.addReview);

module.exports = router;
