const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please tell us your name'],
  },
  email: {
    type: String,
    required: [true, 'please enter an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'please provide a valid email'],
  },
  photo: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'guid', 'lead-guid', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'please provide a password'],
    minlength: 8,
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, 'please confirm your password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'passwords are not same',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre('save', async function (next) {
  //only encrypting the password when user is created or password is modified
  if (!this.isModified('password')) return next();

  //Encrypting the password using bcrypt hash
  this.password = await bcrypt.hash(this.password, 12);
  //deleting the confirmPassword field as we don't have to store in db
  this.confirmPassword = undefined;
  next();
});

userSchema.methods.validatePassword = async (userPassword, dbPassword) =>
  await bcrypt.compare(userPassword, dbPassword);

userSchema.methods.hasPasswordChangedAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return changedTimeStamp > JWTTimeStamp;
  }
  return false;
};

userSchema.methods.createResetPWDToken = function () {
  //Generating a token using crypto
  const resetToken = crypto.randomBytes(32).toString('hex');
  //Encrypt and store it in db to validate in future
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  //storing reset time as well as 10 minutes so that after 10 minutes this token will get expired
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  //Saving the changes in the DB
  this.save({ validateBeforeSave: false });
  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
