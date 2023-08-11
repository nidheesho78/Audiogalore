const express = require('express');
const app = express();
// const mongoose = require('mongoose')
// mongoose.connect('mongodb+srv://Audiogalore:Nidheesh7@cluster0.roubmtm.mongodb.net/Audiogalore')

require('dotenv').config(); // Load environment variables from .env file
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

const path = require('path')
require('dotenv/config')
//view Engine
app.set('view engine','ejs')

app.use(express.static(path.join(__dirname+'/public')));


// User Route

const userRoute = require('./routes/userRoute')
app.use('/',userRoute)


//Admin Route

const adminRoute = require('./routes/adminRoute')

app.use('/admin',adminRoute)






const port = process.env.PORT || 7000

app.listen(port, () =>{
    console.log(`Server running on ${port}`);
})
