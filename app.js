const mongoose = require('mongoose');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');

require('dotenv').config()

//import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

//app
const app = express();

//middleware
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());

//routes middleware
app.use("/api", authRoutes)
app.use("/api", userRoutes)

const port = process.env.PORT || 8000

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
})

//db connection
mongoose.connect(
    process.env.MONGO_URI,
    {useNewUrlParser: true}
  )
  .then(() => console.log('DB Connected'))
   
  mongoose.connection.on('error', err => {
    console.log(`DB connection error: ${err.message}`)
});