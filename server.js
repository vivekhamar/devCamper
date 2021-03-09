const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const fileupload = require('express-fileupload');
const path = require('path');

// Middleware
// const { logger } = require('./middleware/logger');

// Routes to different module
const bootcamp = require('./routes/bootcamp');
const course = require('./routes/course');
const auth = require('./routes/auth');
const cookieParser = require('cookie-parser');

// Loading env variables
dotenv.config({ path:'./config/config.env' });

// Connect to database
connectDB();

const app = express();

// Body Parser
app.use(express.json());
app.use(cookieParser());

// Dev logging middleware
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

app.use(express.static(path.join(__dirname+'/public')));

app.use(fileupload());

app.use('/api/v1/bootcamps', bootcamp);
app.use('/api/v1/courses', course);
app.use('/api/v1/auth', auth);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`));