 
 if(process.env.NODE_ENV !== "production") {
  require('dotenv').config();
    }
 

const {isLogged,isOwner,validateListing} = require("./middlewear.js");
  const admin = require("firebase-admin");
  const express = require("express");
  const app = express();
  const mongoose = require("mongoose");
const http = require('http');////
  const path = require("path");
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "views"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  const methodOverride = require("method-override");
  app.use(methodOverride("_method"));
  const ejsMate = require("ejs-mate");
  app.engine("ejs", ejsMate);
  app.use(express.static(path.join(__dirname, "/public")));

const ExpressError = require("./utils/ExpressError.js"); 
const session = require("express-session");
 const MongoStore = require("connect-mongo");

// const MongoStore = require('connect-mongo');

const flash = require("connect-flash");
const passport = require("passport");
const User = require("./Models/users.js");
const Restaurant = require("./Models/mobileShops.js");
const LocalStrategy = require("passport-local");
const bodyParser = require('body-parser');//
const cors = require('cors');//
const socketSetup = require('./sockets.js');//
const server = http.createServer(app);
// const io = require('socket.io')(server, { cors: { origin: process.env.FRONTEND_URL || '*' } });
const io = require("socket.io")(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});
// serve admin and restaurant pages
//connect sockets
socketSetup(io);
////


// SECRET =695579334c509796d8ed20b04a18e3fd1aaf05fbd05031c08d66b530daeb7196d8176ea409f48aa5
//58c0ee88cc9c89cbba0501e8e44bc89cad29fb9ed6237c50 
const dbUrl = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mobile-repair-services';
// const dbUrl = 'mongodb://127.0.0.1:27017/mobile-repair-services';
main()
  .then(() => console.log("MongoDB connection successful"))
  .catch((err) => console.log("DB error:", err));

async function main() {
  await mongoose.connect(dbUrl);
}


const store = MongoStore.create({
  mongoUrl: dbUrl,
   collectionName: "sessions",
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});
store.on("error", (err) => {
  console.log("Session store error:", err);
})
const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,

  cookie: {
   expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
   maxAge: 7 * 24 * 60 * 60 * 1000,
   httpOnly: true,
},

};



// const sessionOptions = {
//   // store,
// secret : process.env.SECRET,
//   resave : false,         
//   saveUninitialized : true ,
//   cookie: {
//     expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 day
//     maxAge: 7 * 24 * 60 * 60 * 1000, // 1 day
//     httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
 
//   },


// };


// middlewares
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); // Use the LocalStrategy for authentication
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(cors());
app.use(bodyParser.json());






app.use((req,res,next) => {

res.locals.success = req.flash("success");
res.locals.error = req.flash("error");
res.locals.currentUser = req.user; // Set the current user in locals for use in views
next();
});   



app.get("/", async(req, res) => {
  console.log("You are awesome");
   const restaurants = await Restaurant.find();
  // console.log("ls"+listings); 
  res.render("listings/showServices.ejs", { restaurants } );

});

app.get('/mobileShops', (req, res) => {
    res.render('listings/mobileShops.ejs');
});

app.get('/admin',isLogged, (req, res) => {
    res.render('listings/admin.ejs');
});


app.get("/listings", async(req, res) => {
  console.log("You are awesome");
   const restaurants = await Restaurant.find();
  // console.log("ls"+listings); 
  res.render("listings/showServices.ejs", { restaurants } );
});






const usersRouter = require("./routes/users.js");
// const { Console } = require('console');
app.use("/users", usersRouter);
const ordersRouter = require('./routes/orders.js');//
const restaurantsRouter = require('./routes/mobileShops.js');//
const fcmRouter = require("./routes/fcm.js");
app.use("/api/fcm", fcmRouter);                // save token / testing endpoints

app.use('/api/orders', ordersRouter);//
app.use('/api/restaurants', restaurantsRouter);//

  



io.on("connection", (socket) => {
  console.log("Restaurant connected", socket.id);
});


const firebaseKeyPath = process.env.RENDER
  ? "/etc/secrets/firebase-admin.json"      // Render
  : path.join(__dirname, "firebase-admin.json"); // Local

admin.initializeApp({
  credential: admin.credential.cert(firebaseKeyPath),
});


  
//   main()
// .then(() => {
//   console.log("MongoDb connection successful Rishi Raj Chandra");
// })
// .catch((err) => console.log (err));


// async function main(){

//   await mongoose.connect(, {
   
//   });
// }


app.use((err,req,res,next) =>{
  let {message ="Not valid",statusCode = 400} = err;
//  res.status(statusCode).send(message);
// console.log("my errr"+err);
 res.render("error.ejs",{err});
});

//  app.listen(8080, () => {
//     console.log("Server is running on port 8080");
//   });
app.locals.admin = admin;
app.locals.io = io;
server.listen(8080, () => {
  console.log("Server + Socket.io running on port 8080");
});

