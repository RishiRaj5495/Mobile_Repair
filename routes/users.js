const express = require("express");

const router = express.Router(); // mergeParams allows us to access params from the parent route
const User = require("../Models/users.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const passport = require("passport");
const { saveRidirectUrl } = require("../middlewear.js");
//const {signupPage, signupForUserRegister, loginPage, loginAuthentication, logoutHere} =  require("../controllers/listings.js");
const usersController = require("../controllers/users.js"); // Import the functions from the controller



router
.route("/signup")
.get(usersController.signupPage)
.post(wrapAsync(usersController.signupForUserRegister) );



router
.route("/login")
.get(usersController.loginPage)
.post(
  saveRidirectUrl,
  passport.authenticate("local", {
  failureRedirect: "/users/login",
  failureFlash: true,
}), 
wrapAsync(usersController.loginAuthentication)
);

router.get("/logout",usersController.logoutHere);



module.exports = router;