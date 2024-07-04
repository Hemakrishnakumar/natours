const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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

module.exports = mongoose.model('User', userSchema);
