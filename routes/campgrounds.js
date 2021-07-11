const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const { campgroundSchema } = require('../schemas')
const isLoggedIn = require('../middleware');

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else {
        next();
    }
}

// all campground route
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}))

// form to create new campground route
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
})

// create new campground route
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const newCampground = new Campground(req.body.campground);
    await newCampground.save();
    req.flash('success', 'Successfully make a new campground');
    res.redirect(`/campgrounds/${newCampground._id}`)
}))

// edit campground route
router.put('/:id', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const updatedCampground = await Campground.findByIdAndUpdate(id, req.body.campground, { new: true });
    req.flash('success', 'Successfully update the campground');
    res.redirect(`/campgrounds/${updatedCampground._id}`)
}))

// delete campground route
router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('warning', 'Successfully delete the campground');
    res.redirect("/campgrounds")
}))

// form to edit campground route
router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const foundCampground = await Campground.findById(id);
    if (!foundCampground) {
        req.flash('error', 'Sorry, cannot find this campground')
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { foundCampground });
}))

// detail campground info route 
router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const foundCampground = await Campground.findById(id).populate('reviews');
    if (!foundCampground) {
        req.flash('error', 'Sorry, cannot find this campground')
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { foundCampground });
}))

module.exports = router;