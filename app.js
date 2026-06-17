  
 if(process.env.NODE_ENV !== "production") {
  require('dotenv').config();
    }
   

   console.log("Cloudinary Name:", process.env.CLOUD_NAME);
 const admin = require("firebase-admin");

// const {isLogged,isOwner,validateListing} = require("./middlewear.js");
const {isLogged} = require("./middlewear.js");
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
const Order = require("./Models/orders.js");

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
  io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});
// socketSetup(io);
const dbUrl = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mobile-repair-services';
// const dbUrl = 'mongodb://127.0.0.1:27017/mobile-repair-services';
mongoose.connect(dbUrl)
.then(() => {
  console.log("MongoDB connected");

  const store = MongoStore.create({
    client: mongoose.connection.getClient(),
    collectionName: "sessions",
    autoRemove: "native",
    touchAfter: 24 * 3600,
  });

  store.on("error", (err) => {
    console.log("Session store error:", err);
  });

  server.listen(8080, () => {
    socketSetup(io);
    console.log("Server + Socket.io running on port 8080");
  });
})
.catch((err) => {
  console.log("DB error:", err);
});


const store = MongoStore.create({
  client: mongoose.connection.getClient(),
   collectionName: "sessions",
   autoRemove: "native",        
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
   expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
   maxAge: 7 * 24 * 60 * 60 * 1000,
   httpOnly: true,
},

};

// const sessionMiddleware = session(sessionOptions);
// app.use(sessionMiddleware);


  const sessionMiddleware = session(sessionOptions);

  app.use(sessionMiddleware);
  app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");

  res.locals.currentUser = null;
  res.locals.currentRestaurant = null;

  if (req.user) {
    if (req.user.constructor.modelName === "User") {
      res.locals.currentUser = req.user;
    } else if (req.user.constructor.modelName === "Restaurant") {
      res.locals.currentRestaurant = req.user;
    }
  }

  next();
});





passport.use('user-local',
  new LocalStrategy(User.authenticate())
);

passport.use('restaurant-local',
  new LocalStrategy({ usernameField: 'email' },
    Restaurant.authenticate()
  )
);

// Serialize by ID + model type
passport.deserializeUser(async (obj, done) => {
  if (obj.type === 'User') {
    const user = await User.findById(obj.id);
    done(null, user);
  } else if (obj.type === 'Restaurant') {
    const restaurant = await Restaurant.findById(obj.id);
    done(null, restaurant);
  }
});





app.use(cors());
app.use(bodyParser.json());

app.get("/ping", (req, res) => {
  res.status(200).send("alive");
});






app.get("/", async(req, res) => {
res.set("Cache-Control", "no-store");
   const restaurants = await Restaurant.find();
  res.render("listings/showServices.ejs", { restaurants } );
});

app.get('/mobileShops', (req, res) => {
  res.set("Cache-Control", "no-store");
    res.render('listings/mobileShops.ejs');
});


app.get("/shop/:id", isLogged,async (req, res) => {
  
  const restaurant = await Restaurant.findById(req.params.id);
  res.render("listings/singleShops.ejs", { restaurant, cloudName: process.env.CLOUD_NAME});
});


app.get("/listings", async(req, res) => {
res.set("Cache-Control", "no-store");
  console.log("You are awesome");
   const restaurants = await Restaurant.find();
  res.render("listings/showServices.ejs", { restaurants} );
});




// const AI_Flow= require("./routes/AI-flow.js");
// app.use("/AI-flow", AI_Flow);
const usersRouter = require("./routes/users.js");

app.use("/users", usersRouter);
const ordersRouter = require('./routes/orders.js');
app.use('/api/orders', ordersRouter);
const restaurantsRouter = require('./routes/mobileShops.js');
app.use('/api/restaurants', restaurantsRouter);
app.use('/mobileShop', restaurantsRouter);

const fcmRouter = require("./routes/fcm.js");
app.use("/api/fcm", fcmRouter);  // save token / testing endpoints

const etaRoutes = require("./routes/eta.js");
app.use("/", etaRoutes);

const allNearbyTech = require("./routes/allNearbyTechnician.js");
app.use("/allNearbyTechnician", allNearbyTech);


const bookingRoutes = require("./routes/booking.js");
app.use("/api/orders/booking", bookingRoutes);




app.get("/delivery/:orderId", async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  res.render("listings/viewTechnician.ejs", { order });
});




const firebaseKeyPath = process.env.RENDER
  ? "/etc/secrets/firebase-admin.json"      // Render
  : path.join(__dirname, "firebase-admin.json"); // Local

admin.initializeApp({
  credential: admin.credential.cert(firebaseKeyPath),
});
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);   // ✅ VERY IMPORTANT
  }

  const { message = "Not valid", statusCode = 500 } = err;

  return res.status(statusCode).render("error.ejs", { err });
});

app.locals.admin = admin;
app.locals.io = io;

// server.listen(8080, () => {
//   console.log("Server + Socket.io running on port 8080");
// });

 
// const { GoogleGenAI } = require("@google/genai");

// const ai = new GoogleGenAI({
//   apiKey: process.env.GEMINI_API_KEY
// });

// async function test() {
//   try {
//     const res = await ai.models.generateContent({
//       model: "gemini-2.5-flash",
//       contents: "Say hello"
//     });

//     console.log("✅ SUCCESS:", res.text);
//   } catch (err) {
//     console.error("❌ ERROR:", err.message);
//   }
// }

// test();



