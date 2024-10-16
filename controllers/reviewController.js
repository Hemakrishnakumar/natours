const Review = require('../models/reviewModel');
const factory = require('./factoryFunctions');

const catchAsync = (fn) => (req, res, next) => fn(req, res, next).catch(next);

const getAllReviews = factory.getAllDocs(Review);

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

const deleteReview = factory.deleteOne(Review);
const updateReview = factory.updateOne(Review);
const getReview = factory.getDoc(Review);
module.exports = {
  addReview,
  getAllReviews,
  deleteReview,
  updateReview,
  getReview,
};
