const mongoose = require('mongoose');
const fs = require('fs');

const Tour = require('../../models/tourModel');

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

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

//import data into database

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('successfull uploaded');
  } catch (err) {
    console.log(err);
  }
};

importData();
