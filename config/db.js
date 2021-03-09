const mongoose = require('mongoose');

const ConnectDB = () => {
    const conn = mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    });

    console.log(`MongoDB connected`);

}

module.exports = ConnectDB;