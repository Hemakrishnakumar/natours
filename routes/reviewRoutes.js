const express = require('express');
const reviewController = require('../controllers/reviewController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(restrictTo('user'), reviewController.addReview);

router
  .route('/:id')
  .get(reviewController.getReview)
  .delete(restrictTo('user', 'admin'), reviewController.deleteReview)
  .put(restrictTo('user', 'admin'), reviewController.updateReview);

module.exports = router;
