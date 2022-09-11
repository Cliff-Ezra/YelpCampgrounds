const express = require('express');
const app = express();
const path = require('path');
const mongoose = require("mongoose");
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')

//Requiring the model
const Campground = require('./models/campground');

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


//Routes:
app.get('/', (req, res) => {
    res.render('home')
});
// **********************************
// INDEX - renders multiple campgrounds
// **********************************
app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
});
// **********************************
// NEW - renders a form for campgrounds
// **********************************
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
});
// **********************************
// CREATE - creates a new campground
// **********************************
app.post('/campgrounds', async (req, res) => {
    const campground = await Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
});
// **********************************
// SHOW - details about a particular campground
// **********************************
app.get('/campgrounds/:id', async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', { campground });
});
// *******************************************
// EDIT - renders a form to edit a campground
// *******************************************
app.get('/campgrounds/:id/edit', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
});
// *******************************************
// UPDATE - updates a particular campground
// *******************************************
app.put('/campgrounds/:id', async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`);
});
// *******************************************
// DELETE- removes a single campground
// *******************************************
app.delete('/campgrounds/:id', async(req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds')
});



app.listen(3000, () => {
    console.log('SERVING ON PORT 3000');
});