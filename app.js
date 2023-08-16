const express = require('express');
const fs = require('fs');
const http = require('http');
const bodyParser = require('body-parser');



const mongoose = require('mongoose');

var cors = require('cors');
const dotenv = require('dotenv');   // to access environment variables

const app = express();

dotenv.config();

app.use(cors());          //required to build web applications that access APIs hosted on a different domain or origin.

app.use(express.json());

const userRoutes = require('./routes/user');
const expenseRoutes = require('./routes/expense');


app.use(bodyParser.urlencoded({ extended: false }));      // helps in parsing form data

app.use('/user', userRoutes);
app.use('/expense',expenseRoutes);



const username = process.env.USERNAME_MONGO;
const password = process.env.PASSWORD;

mongoose
.connect(
  //`mongodb+srv://${username}:${password}@mongoshop.7jh66kb.mongodb.net/?retryWrites=true&w=majority`
  `mongodb+srv://salkutiswethareddy:salkutiswethareddy@mongoshop.7jh66kb.mongodb.net/?retryWrites=true&w=majority`
)
  .then(result => {
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });


