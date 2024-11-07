const { Router } = require('express');
const { getOverview, getTour } = require('../controllers/viewsContoller');
const { isLoggedIn, protect } = require('../controllers/authController');

const router = Router();

router.get('/', isLoggedIn, getOverview);
router.get('/tour/:slug', protect, getTour);
router.get('/login', (req, res) => res.render('login'));
router.get('/logout', (req, res) => {
  res.clearCookie('jwt');
  return res.redirect('/');
});

module.exports = router;
