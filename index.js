const express = require('express');
const app = express();
const connectDB = require('./config/connection')
connectDB()
const path = require('path')
require('dotenv/config')
//view Engine
app.set('view engine','ejs')

app.use(express.static(path.join(__dirname+'/public')));

//parsing


app.use(express.json())



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
