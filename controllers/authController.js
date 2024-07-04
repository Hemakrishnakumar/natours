const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');

const catchAsync = (fn) => (req, res, next) => fn(req, res, next).catch(next);

const assignToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    photo: req.body.photo,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });

  const token = assignToken(newUser._id);
  res.status(200).json({
    status: 'success',
    data: {
      user: newUser,
      token,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //check if email and passwords are provided
  if (!email || !password)
    return next(new AppError('please provide email and password', 400));

  //check if user exists in db and password is correct
  const user = await User.findOne({ email: email }).select('+password');
  if (!user.email || !(await user.validatePassword(password, user.password)))
    return next(new AppError('Incorrect email or password', 401));

  //send the 200 response if everything is fine
  const token = assignToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  //check if token exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    console.log(token);
  }
  if (!token)
    return next(
      new AppError('you are not logged in, please login to get access', 401),
    );
  //validate the token

  //check if user is still there

  // check if password had been modified after token generation
  next();
});
