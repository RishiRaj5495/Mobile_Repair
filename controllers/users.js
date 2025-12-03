


const User = require("../Models/users.js");
const passport = require("passport");
module.exports.signupPage =  (req, res) => {
  console.log("Rendering signup page");
  // res.render("users/signup.ejs");
  res.render("users/signup");
};

module.exports.signupForUserRegister = async ( req,res,next) => {
  try{  
let {username, email, password, phone} = req.body;
const newUser = new User({username, email, phone});
const registerUser = await User.register(newUser,password);


 console.log("User registered successfully:", registerUser);
// Automatically log in the user after registration
   req.login(registerUser, (err) => {
  if (err) {
    return next(err);
  }
  req.flash("success", "Welcome to the app!");
  res.redirect("/listings");
  });

    }catch(e){
    req.flash("success", e.message);
     res.redirect("/users/signup");
    }};

  module.exports.loginPage =  (req, res) => {
  res.render("users/login.ejs");
  };
  module.exports.loginAuthentication = async (req, res) => {
  req.flash("success", "Welcome back!");
  // res.redirect("/listings");
  res.redirect(res.locals.redirectUrl || "/listings"); // Redirect to the original URL or listings page
 };


module.exports.logoutHere =  (req, res,next) => { 
  req.logout((err) => {
    if (err) {
    next(err);
    return;
    }
    req.flash("success", "You are logged out ,Goodbye!");
    res.redirect("/users/login");
  });
};
