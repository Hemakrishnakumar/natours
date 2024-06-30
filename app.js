const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const express = require('express');
const morgan = require('morgan');

const app = express();

//Middlewares
app.use(morgan('dev'));
//Middleware to get the data from client for post requests
app.use(express.json());

//ROUTERS
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
