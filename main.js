const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const cors = require('cors');
app.use(cors());

mongoose.connect(
    'mongodb+srv://'+ process.env.MONGODB_USERNAME +':'+ process.env.MONGODB_PASSWORD +'@cluster0.c3wky.azure.mongodb.net/jwttraining?retryWrites=true&w=majority', 
    { 
        useNewUrlParser: true,
        useUnifiedTopology: true
    },
    () => console.log('connection to database success') 
);

const userRoutes = require('./api/routes/user');

app.use(express.json());

app.use('/user', userRoutes); 

app.use((req, res, next) => {
    const err = new Error('Not Found')
    err.status = 404
    next(err)
})

app.use(function (err, req, res, next) {
    console.error(err);
    console.error(err.stack);
    res.status(err.status || 500)
    res.send(err.message || 'Internal server error.');
});

module.exports = app;