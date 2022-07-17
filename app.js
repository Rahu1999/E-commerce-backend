const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors =require('cors');
const app = express();
require('dotenv/config');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');

app.use(cors());
app.options('*',cors())


// middelware
app.use(express.json())
app.use(morgan('tiny'));
app.use(authJwt());
app.use('/public/uploads',express.static(__dirname +'/public/uploads'));
app.use(errorHandler);

// Routes...
const categoriesRoutes = require('./routers/categories');
const ordersRoutes = require('./routers/orders')
const productsRoutes = require('./routers/products')
const usersRoutes = require('./routers/users')


const api = process.env.API_URL;

app.use(`${api}/categories`,categoriesRoutes);
app.use(`${api}/orders`,ordersRoutes);
app.use(`${api}/products`,productsRoutes);
app.use(`${api}/users`,usersRoutes);



mongoose.connect(process.env.CONNECTION_STRING,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    dbName: 'eshop-database'
})
.then(()=>{
    console.log('Databse connected successfully....');
})
.catch((err)=>{
    console.log(err);
})

app.listen(3000,()=>{
     
    console.log('Server is Running http://localhost:3000');
})