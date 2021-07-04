const express = require('express');
const app = express();
const path = require('path')
const ejs = require('ejs');
const ejsMate = require('ejs-mate');
const mongoose = require('mongoose')
const methodOverride = require('method-override');
const Campground = require('./models/campground');

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

// home page route
app.get('/', (req, res) => {
    res.render('home');
})

// all campground route
app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
})

// form to create new campground route
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

// create new campground route
app.post('/campgrounds', async (req, res) => {
    const newCampground = new Campground(req.body.campground);
    await newCampground.save();
    res.redirect(`/campgrounds/${newCampground._id}`)
})

// edit campground route
app.put('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    const updatedCampground = await Campground.findByIdAndUpdate(id, req.body.campground, { new: true });
    res.redirect(`/campgrounds/${updatedCampground._id}`)
})

// delete campground route
app.delete('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndRemove(id);
    res.redirect("/campgrounds")
})

// form to edit campground route
app.get('/campgrounds/:id/edit', async (req, res) => {
    const { id } = req.params;
    const foundCampground = await Campground.findById(id);
    res.render('campgrounds/edit', { foundCampground });
})

// detail campground info route 
app.get('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    const foundCampground = await Campground.findById(id);
    res.render('campgrounds/show', { foundCampground });
})

app.listen(3000, () => {
    console.log('Serving on port 3000');
})