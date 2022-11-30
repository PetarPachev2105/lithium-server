require('dotenv').config({ path: './.env' });

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const routes = require("./api/routes");
const connectToDb = require("./dbconfig/database");

const app = express();
require('./config/websockets');

const corsOptions = {
  origin: "*"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

connectToDb();

// set port, listen for requests
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

app.use('/api', routes);

/* Add our own error handler */
app.use((err, req, res, next) => {
  if (err.name === 'LithiumError') {
    res.status(err.statusCode).json({ message: err.message });
  } else {
    /* For any other error - send a generic error to ensure that we don't leak information */
    console.error(`error stack: ${err.stack}`);
    res.status(500).json({ message: 'Something went wrong' });
  }
});
