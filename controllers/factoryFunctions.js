const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

const catchAsync = (fn) => (req, res, next) => fn(req, res, next).catch(next);

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const doc = await Model.findByIdAndDelete({ _id: id });

    if (!doc) {
      next(
        new AppError(`No document found with the Id: ${req.params.id}`, 404),
      );
      return;
    }
    res.status(200).json({ status: 'Deleted successfully' });
  });

exports.createDoc = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);
    return res.status(201).json({
      status: 'created',
      newDoc,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      next(
        new AppError(`No document found with the Id: ${req.params.id}`, 404),
      );
      return;
    }
    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

exports.getDoc = (Model, populate = '') =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id).populate(populate);
    if (!doc) {
      next(
        new AppError(`No document found with the Id: ${req.params.id}`, 404),
      );
      return;
    }
    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

exports.getAllDocs = (Model, paramFilter = {}) =>
  catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Model.find(paramFilter), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();
    const docs = await features.query;
    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: docs,
    });
  });
