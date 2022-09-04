const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");

//Requiring the model
const Campground = require('../models/campground');

//Mongoose Setup: 
main().catch((err) => console.log('MONGO CONNECTION ERROR',err));
async function main() {
  await mongoose.connect("mongodb://localhost:27017/yelp-camp");
  console.log("MONGO CONNECTION OPEN!!");
}

//To pick a random element from the array
const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async() => {
    await Campground.deleteMany({});
    // const c = new Campground({ title: 'Purple Field' });
    // await c.save();
    for (let i = 0; i <50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
        });
        await camp.save();
    }
}

seedDB()
    .then(() => {
        mongoose.connection.close();
    })