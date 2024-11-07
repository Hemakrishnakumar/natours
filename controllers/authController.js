const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const cookieOptions = {
  expires: new Date(
    Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
  ),

  httpOnly: true,
};

const catchAsync = (fn) => (req, res, next) => fn(req, res, next).catch(next);

const assignToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const sendToken = (newUser, statusCode, res) => {
  const token = assignToken(newUser._id);
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  res.locals.user = newUser;
  res.redirect('/');
};

exports.signup = catchAsync(async (req, res, next) => {
  const {
    name,
    email,
    photo,
    password,
    passwordChangedAt,
    confirmPassword,
    role,
  } = req.body;
  const newUser = await User.create({
    name,
    email,
    photo,
    password,
    confirmPassword,
    role,
    passwordChangedAt,
  });
  newUser.password = undefined;
  //generate and send a token
  sendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //check if email and passwords are provided
  if (!email || !password)
    return next(new AppError('please provide email and password', 400));
  //check if user exists in db and password is correct
  const user = await User.findOne({ email: email }).select('+password');
  if (!user.email || !(await user.validatePassword(password, user.password)))
    return res.render('login', { error: 'Incorrect email or password' });
  //send the 200 response if everything is fine
  sendToken(user, 200, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //check if user exists in the db
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new AppError('There is no user with that email address', 404));
  //generate a reset token
  const resetToken = user.createResetPWDToken();
  // Send it user via email
  const reqURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? please send  PATCH request with your new password and confirmPassword to: ${reqURL}.\nIf you don't forget your password, please ignore this email`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid only for 10 minutes)',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'token has been sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending email, please try again later',
        500,
      ),
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //check if the resetToken is valid or not
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) return next(new AppError('Token has expired or Invalid', 400));
  //update the password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  await user.save();
  //log the user in and send the jwt
  const token = assignToken(user._id);
  res.status(200).json({
    status: 'success',
    message: 'password has been modified successfully',
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
  } else if (req.cookies) token = req.cookies.jwt;
  if (!token)
    return next(
      new AppError('you are not logged in, please login to get access', 401),
    );
  //validate the token, an error will be automatically thrown if there is any issue with token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //check if user is still there
  const loggedInUser = await User.findById(decoded.id);
  if (!loggedInUser)
    return next(
      new AppError(
        'user no longer exists in the system, please signup again',
        401,
      ),
    );
  // check if password had been modified after token generation
  if (loggedInUser.hasPasswordChangedAfter(decoded.iat))
    return next(
      new AppError(
        'password has been updated recently, please login again',
        401,
      ),
    );
  //Grant Access
  req.user = loggedInUser;
  res.locals.user = loggedInUser;
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError(
          'You do not have permission to perform this operation',
          403,
        ),
      );
    next();
  };

exports.isLoggedIn = (req, res, next) => {
  if (req.cookies && req.cookies.jwt) {
    res.locals.user = { name: 'krishna' };
    next();
  } else next();
};

exports.updatePassword = catchAsync(async (req, res, next) => {
  //Get the user
  const { password, newPassword, confirmPassword } = req.body;
  if (!password || !newPassword || !confirmPassword)
    return next(
      new AppError(
        'please enter the old password, new password and confirm password',
        400,
      ),
    );
  const user = await User.findById(req.user._id).select('+password');
  //validate the password
  if (!(await user.validatePassword(password, user.password)))
    return next(new AppError('Incorrect password, please try again', 401));
  //update the password
  user.password = newPassword;
  user.confirmPassword = confirmPassword;
  await user.save();
  //log the user in and send the jwt
  const token = assignToken(user._id);
  res.status(201).json({
    status: 'success',
    message: 'password has been modified successfully',
    token,
  });
});
