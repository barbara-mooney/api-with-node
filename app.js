const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');

mongoose.connect('mongodb://localhost/node-shop', { useNewUrlParser: true });

app.use(morgan('dev'));
//urlencoded specifies that we are 
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Accept, Content-type, Authorization');
    if (req.method ==='OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

app.get('/', (req, res) => {
    res.status(200).send('Hello World!')
})

app.get('/', (req, res) => {
    res.status(200).send('Hello World!')
})

//routes that should handle products and orders
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);

app.use('*', (req, res, next) => {
    const error = new Error('Not found');
    error.status= 404;
    next(error);
});

//this will handle all error happening elsewhere in the app.
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;