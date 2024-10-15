const Tour = require('../models/tourModel');
const factory = require('./factoryFunctions');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  next();
};

const catchAsync = (fn) => (req, res, next) => fn(req, res, next).catch(next);

exports.getAllTours = factory.getAllDocs(Tour);

exports.getTour = factory.getDoc(Tour, 'reviews');

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

exports.createTour = factory.createDoc(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
  ]);
  res.status(201).json({ status: 'success', data: { stats } });
});
