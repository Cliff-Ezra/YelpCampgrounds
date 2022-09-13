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
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251/in-the-woods',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Neque doloremque est excepturi earum, voluptas placeat nemo pariatur, suscipit corrupti velit eaque enim. Excepturi magni doloribus porro, non dolores temporibus assumenda!',
            price
        });
        await camp.save();
    }
}

seedDB()
    .then(() => {
        mongoose.connection.close();
    });
// image:  `https://source.unsplash.com/random/300x300?camping,${i}`,
// 'https://source.unsplash.com/collection/483251/in-the-woods'