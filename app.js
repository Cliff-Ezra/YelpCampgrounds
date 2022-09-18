const express = require('express');
const app = express();
const path = require('path');
const mongoose = require("mongoose");
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utilities/catchAsync');
const ExpressError = require('./utilities/ExpressError');
const { campgroundSchema, reviewSchema } = require('./schemas.js');

//Requiring the models
const Campground = require('./models/campground');
const Review = require('./models/review');

//Mongoose Setup: 
main().catch((err) => console.log('MONGO CONNECTION ERROR',err));
async function main() {
  await mongoose.connect("mongodb://localhost:27017/yelp-camp");
  console.log("MONGO CONNECTION OPEN!!");
}

//Views folder and EJS setup:
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Middleware:
//To parse form data in POST request body
app.use(express.urlencoded({ extended: true }));
//To override the method in the form
app.use(methodOverride('_method'))
//To use the engine
app.engine('ejs', ejsMate);
// Validation using Joi middleware
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
};

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

// !CAMPGROUND ROUTES
app.get('/', (req, res) => {
    res.render('home')
});
// **********************************
// INDEX - renders multiple campgrounds
// **********************************
app.get('/campgrounds', catchAsync( async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}));
// **********************************
// NEW - renders a form for campgrounds
// **********************************
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
});
// **********************************
// CREATE - creates a new campground
// **********************************
app.post('/campgrounds',validateCampground, catchAsync( async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = await Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));
// **********************************
// SHOW - details about a particular campground
// **********************************
app.get('/campgrounds/:id', catchAsync( async(req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    // console.log(campground);
    res.render('campgrounds/show', { campground });
}));
// *******************************************
// EDIT - renders a form to edit a campground
// *******************************************
app.get('/campgrounds/:id/edit', catchAsync( async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}));
// *******************************************
// UPDATE - updates a particular campground
// *******************************************
app.put('/campgrounds/:id', validateCampground, catchAsync( async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`);
}));
// *******************************************
// DELETE- removes a single campground
// *******************************************
app.delete('/campgrounds/:id', catchAsync(async(req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds')
}));

// !REVIEWS ROUTES
// **********************************
// CREATE - creates a campground review
// **********************************
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));
// *******************************************
// DELETE- removes a single review
// *******************************************
app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}));


// *******************************************
// UNKNOWN ROUTE- Unknown route Handler
// *******************************************
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

// *******************************************
// ERROR- Error Handler
// *******************************************
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err });
})

// SERVER
app.listen(3000, () => {
    console.log('SERVING ON PORT 3000');
});
