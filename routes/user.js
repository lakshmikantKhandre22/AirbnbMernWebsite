const express = require("express");
const router = express.Router();
const User = require("../models/user.js");  //to create a object of the module class i.e to create the user 
const wrapAsync = require("../Utils/wrapAsync.js");

const passport = require("passport");


//the user uses the passport middleware for the authentication 


//Authentication setup in Express + MongoDB apps using Passport. and sessiojn management  

//passport middlewares  (passport automatically handle authentication methods)

// Passport-Local Mongoose will add a username,
// hash and salt field to store the username, Automatically 



//ERxportring the controlling 

const UserController = require("../controllers/user.js");



//1. signup Route  -->> Register(Create) the user 
// after the user request for the signup send a form for signup 

router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");

})


//2. post route Store the user in database 

//after filling the form user post request to store the information 
//Signup Route

router.post("/signup", wrapAsync(UserController.signupuser)
);






//3. Login Route (Get the user)  
//User is already Registered now login 

router.get("/login", UserController.renderloginform);



module.exports = router;  //means we can use this route in main express app 








//4. post request 
// to check if the user with the given inofrmation is present or not 


// Login POST Route
//usr must redirect to thst page from where it has loggrd in 

const { saveRedirectUrl } = require("../middleware");
const { signupuser } = require("../controllers/user.js");



router.post(
  "/login",

  saveRedirectUrl,

  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  UserController.AutomaticLoginAfterSignup
);



//5.   Logout Route
//user will logout from the session 

router.get("/logout", UserController.Logout);










