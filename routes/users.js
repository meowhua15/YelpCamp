const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const passport = require('passport');

// form to register route
router.get('/register', (req, res) => {
    res.render('users/register')
})

// create new user route
router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email });
        const registeredUser = await User.register(user, password);
        // 在註冊後就幫忙登入
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Successfully registered, welcome to Yelp Camp');
            res.redirect('/campgrounds');
        });
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('register')
    }
}))

// form to login route
router.get('/login', (req, res) => {
    res.render('users/login');
})

//login route
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'Welcome back to Yelp Camp :->');
    const redirectUrl = req.session.returnTo || '/campgrounds'
    delete req.session.returnTo
    res.redirect(redirectUrl);
})

// logout route
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'Logged out successfully');
    res.redirect('/campgrounds');
})

module.exports = router;

