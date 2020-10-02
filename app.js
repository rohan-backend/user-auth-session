const express = require("express");
const mongoose = require("mongoose");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");

const app = express();

// load environment vars to process.env
require("dotenv").config();

// your MongoUri
const MONGO_URI = process.env.MONGO_URI;

// connect to mongodb
mongoose.connect(
  MONGO_URI,
  { useUnifiedTopology: true, useNewUrlParser: true },
  () => console.log("MongoDB connected")
);

// Configure your template engine
app.use(expressLayouts);
app.set("view engine", "ejs");

// BodyParser
app.use(express.urlencoded({ extended: false }));

// express-session
app.use(
  session({
    secret: "randomStuff",
    resave: true,
    saveUninitialized: false,
  })
);

// Routes
app.use("/", require("./Routes/users"));

// Start your server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("listening on port", PORT));
