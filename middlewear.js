const ExpressError = require("./utils/ExpressError.js");




module.exports.isLogged = (req, res, next) => {
  // console.log(req);
 

  if (!req.isAuthenticated()) {
     req.session.redirectUrl = req.originalUrl; // Save the original URL to redirect after login
    req.flash("error", "You must be signed in first!");
    return res.redirect("/users/login");
  }

    next();

};




module.exports.saveRidirectUrl = (req, res, next) => {



if(req.session.redirectUrl) {
  res.locals.redirectUrl = req.session.redirectUrl ;} // Make current user available in views
 next();


}
