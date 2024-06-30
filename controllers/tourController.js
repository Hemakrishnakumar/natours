const Tour = require('../models/tourModel');

exports.getAllTours = async (req, res) => {
  try {
    const query = { ...req.query };
    ['page', 'sort', 'limit', 'fields'].forEach((element) => {
      if (query[element]) delete query[element];
    });
    //Filtering
    let queryString = JSON.stringify(query);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`,
    );
    let queryRes = Tour.find(JSON.parse(queryString));

    //Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      queryRes = queryRes.sort(sortBy);
    }

    //limit the fields
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      queryRes = queryRes.select(fields);
    } else {
      queryRes = queryRes.select('-__v');
    }

    const tours = await queryRes;

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: tours,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'No tours found',
    });
  }
};

exports.getTour = async (req, res) => {
  const { id } = req.params;
  try {
    const tour = await Tour.findById(id);
    if (tour)
      res.status(200).json({
        status: 'Sucess',
        data: tour,
      });
  } catch (err) {
    res.status(404).json({
      status: 'Fail',
      message: 'Invalid Id',
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json({
      status: 'Sucess',
      data: tour,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
    });
  }
};

exports.deleteTour = async (req, res) => {
  const { id } = req.params;
  try {
    await Tour.deleteOne({ _id: id });
    res.status(200).json({ status: 'Deleted successfully' });
  } catch (err) {
    res.status(204).json({
      status: 'Fail',
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({ status: 'success', data: { tour: newTour } });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
