const Review = require('../models/reviewModel');

const catchAsync = (fn) => (req, res, next) => fn(req, res, next).catch(next);

const getAllReviews = catchAsync(async (req, res, next) => {
  if (req.params.tourId) {
    const reviews = await Review.find({ tour: req.params.tourId });
    return res.status(200).json({
      status: 'success',
      results: reviews.length,
      reviews,
    });
  }
  const reviews = await Review.find();
  return res.status(200).json({
    status: 'success',
    results: reviews.length,
    reviews,
  });
});

const addReview = catchAsync(async (req, res, next) => {
  //Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user._id;
  const { review, rating, tour, user } = req.body;
  const newReview = await Review.create({
    review,
    rating,
    user,
    tour,
  });
  res.status(201).json({
    status: 'created',
    newReview,
  });
});

module.exports = {
  addReview,
  getAllReviews,
};
