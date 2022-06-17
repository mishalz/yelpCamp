const mongoose = require('mongoose')
const Campground = require('../models/campground')
const cities = require('./cities')
const { places, descriptors } = require('./seedhelpers')

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp'), {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
}


mongoose.connection.on("error", console.error.bind(console, "connection error: "))
mongoose.connection.once("open", () => {
    console.log('database connected')
})

const sample = (array) => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
    await Campground.deleteMany({})
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000)
        const randPrice = Math.floor(Math.random() * 30)
        const camp = new Campground({
            author: '61d8493f9dcfa136e0f676f7',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Veniam culpa corrupti, eos nesciunt fugit exercitationem! Ipsam incidunt labore praesentium neque maxime optio amet rem quibusdam iste illo. Dolore, deserunt explicabo!',
            price: randPrice,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            image: [
                {
                    url: 'https://res.cloudinary.com/dnfym5uci/image/upload/v1650102517/YelpCamp/xua0n7flfi7chae32lbn.jpg',
                    filename: 'YelpCamp/xua0n7flfi7chae32lbn'
                },
                {
                    url: 'https://res.cloudinary.com/dnfym5uci/image/upload/v1650102514/YelpCamp/ynysxlw0drvafklmqprr.jpg',
                    filename: 'YelpCamp/ynysxlw0drvafklmqprr'
                }
            ]
        })
        await camp.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close()
    console.log('seeding done, closing connection!')
})