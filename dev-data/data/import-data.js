const mongoose = require('mongoose');
const fs = require('fs');

const Tour = require('../../models/tourModel');
const Review = require('../../models/reviewModel');
const User = require('../../models/userModel');

// const connectionString = process.env.DATABASE_CONNECTIONsTRING.replace(
//   '<PASSWORD>',
//   process.env.DATABASEPASSWORD,
// );

const connectionString =
  'mongodb+srv://krishna:FfCxYHhqeKm7Pmog@natours.kfyjtoa.mongodb.net/natours?retryWrites=true&w=majority&appName=natours';
//Connecting to the database
mongoose
  .connect(connectionString, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB Connection is successful'));

//const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

//import data into database

const importData = async () => {
  try {
    await User.create(users, { validateBeforeSave: false });
    console.log('successfull uploaded');
  } catch (err) {
    console.log(err);
  }
};

importData();
