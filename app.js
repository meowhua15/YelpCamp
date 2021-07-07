const express = require('express');
const app = express();
const path = require('path')
const ejs = require('ejs');
const ejsMate = require('ejs-mate');
const mongoose = require('mongoose')
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const { campgroundSchema, reviewSchema } = require('./schemas')
const Review = require('./models/review');

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

const db = mongoose.connection;
db.on("error", console.error.bind('MONGO CONNECTION ERROR:'));
db.once("open", () => {
    console.log('MONGO CONNECTION OPEN');
})

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

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

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else {
        next();
    }
}

// home page route
app.get('/', (req, res) => {
    res.render('home');
})

// all campground route
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}))

// form to create new campground route
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

// create new campground route
app.post('/campgrounds', validateCampground, catchAsync(async (req, res) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const newCampground = new Campground(req.body.campground);
    await newCampground.save();
    res.redirect(`/campgrounds/${newCampground._id}`)
}))

// edit campground route
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const updatedCampground = await Campground.findByIdAndUpdate(id, req.body.campground, { new: true });
    res.redirect(`/campgrounds/${updatedCampground._id}`)
}))

// delete campground route
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds")
}))

// form to edit campground route
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const { id } = req.params;
    const foundCampground = await Campground.findById(id);
    res.render('campgrounds/edit', { foundCampground });
}))

// detail campground info route 
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const foundCampground = await Campground.findById(id).populate('reviews');
    res.render('campgrounds/show', { foundCampground });
}))

// create review route
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

// delete review route
app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))

app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404))
})

// error handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) {
        err.message = 'Awww, Something went wrong';
    }
    res.status(statusCode).render('error', { err })
})


app.listen(3000, () => {
    console.log('Serving on port 3000');
})