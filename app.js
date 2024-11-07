const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const path = require('path');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewsRouter = require('./routes/viewRoutes');

const app = express();

//Global Middlewares
//set security headers
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        'https://api.mapbox.com',
        'https://fonts.googleapis.com',
      ], // Allow scripts from Mapbox
      styleSrc: [
        "'self'",
        'https://api.mapbox.com',
        'https://fonts.googleapis.com',
      ], // Allow styles from Mapbox
      // Add any other required directives here
    },
  }),
);
app.set('view engine', 'pug');
app.use(express.static(path.resolve('public')));
app.set('views', path.resolve('views'));
app.use(cookieParser());

//logging in dev env
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

//to limit the requests from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again later',
});
app.use('/api', limiter);

app.use(mongoSanitize());
app.use(xss());

//Middleware to get the data from client for post requests - body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

//ROUTERS
app.use('/', viewsRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

//Unhandled routes
app.all('*', (req, res, next) => {
  const err = new AppError(`Can't find ${req.originalUrl} on this server`, 404);
  next(err);
});

// Global error handling middleware, whenever there is an error in the application this middleware will be executed
app.use(globalErrorHandler);

module.exports = app;
