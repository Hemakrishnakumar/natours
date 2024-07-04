const User = require('../models/userModel');
const AppError = require('../utils/appError');

const catchAsync = (fn) => (req, res, next) => fn(req, res, next).catch(next);

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: users,
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!user) {
    next(new AppError(`No user found with the Id: ${req.params.id}`, 404));
    return;
  }
  res.status(200).json({
    status: 'success',
    data: user,
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.deleteOne({ _id: id });
  if (!user) {
    next(new AppError(`No user found with the Id: ${req.params.id}`, 404));
    return;
  }
  res.status(200).json({ status: 'Deleted successfully' });
});

exports.createUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  res.status(201).json({ status: 'success', data: { tour: newUser } });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    next(new AppError(`No user found with the Id: ${req.params.id}`, 404));
    return;
  }
  res.status(200).json({
    status: 'success',
    data: user,
  });
});
