
require('dotenv').config(); 

const mongoose = require('mongoose');

const connectDB = () => {
    mongoose
        .connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => {
            console.log('MongoDB connected');
        })
        .catch((error) => {
            console.error('MongoDB connection error:', error);
            process.exit(1); // Exit process with failure
        });
};

module.exports = connectDB;


