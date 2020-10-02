const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const ensureAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
};

// User Model
const User = require("../models/User");

// *********************************************
// welcome Page
router.get("/", (req, res) => res.render("welcome"));

// *********************************************
// protected home page
router.get("/home", ensureAuthenticated, (req, res) => {
  user = req.session.user;
  res.render("home", { user });
});

// *********************************************
// Register Page
router.get("/register", (req, res) => res.render("register"));

// *********************************************
// login Page
router.get("/login", (req, res) => res.render("login"));

// *********************************************
// handle register
router.post("/register", (req, res) => {
  let errors = [];
  const { name, email, password } = req.body;

  // input validation
  if (!name || !email || !password) {
    errors.push({ message: "All fields are compulsory" });
  }
  if (password.length < 6) {
    errors.push({ message: "password must be atleast 6 characters long" });
  }

  // check if any errors exist
  if (errors.length > 0) {
    res.render("register", { errors, name, email });
  }

  // validations done then check if user is already registered
  else {
    User.findOne({ email: email }).then((user) => {
      //  check if already registered
      if (user) {
        errors.push({ message: "Email is already registered" });
        res.render("register", { errors, name, email });
      } else {
        //  hash the password before saving to database
        bcrypt
          .hash(password, 10)
          .then((hashedPassword) => {
            //  save user to the database with hashedPassword
            const newUser = new User({
              name,
              email,
              password: hashedPassword,
            });
            newUser
              .save()
              .then((user) => res.redirect("/login"))
              .catch((err) => {
                throw err;
              });
          })
          .catch((err) => {
            throw err;
          });
      }
    });
  }
});

// ***********************************************
// handle login
router.post("/login", (req, res) => {
  const errors = [];
  const { email, password } = req.body;
  // validate credentials
  if (!email || !password) {
    errors.push({ message: "missing credentials" });
    res.render("login", { errors });
  }
  User.findOne({ email: email })
    .then((user) => {
      // no user exist in database
      if (!user) {
        errors.push({ message: "email is not registered" });
        res.render("login", { errors });
      }
      // user exist
      else {
        // check for password
        bcrypt
          .compare(password, user.password)
          .then((match) => {
            // password dont match
            if (!match) {
              errors.push({ message: "your password is incorrect" });
              res.render("login", { errors });
            }
            // password matched
            else {
              //    save user to session
              req.session.user = user;
              res.redirect("/home");
            }
          })
          .catch((err) => {
            throw err;
          });
      }
    })
    .catch((err) => {
      throw err;
    });
});

//********************************************
//logout handler
router.get("/logout", ensureAuthenticated, (req, res) => {
  //   delete session for the logged user
  req.session.destroy((err) => {
    if (err) throw err;
    res.redirect("/");
  });
});

module.exports = router;
