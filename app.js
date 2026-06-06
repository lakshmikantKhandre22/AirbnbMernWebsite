if (process.env.NODE_ENV != "Production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const CustomErrorclass = require("./utils/CustomErrorclass.js");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const wrapAsync = require("./utils/wrapAsync.js");
const listingController = require("./controllers/listing.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dburl = process.env.ATLASDB_URL;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

function logConnectionHelp(err) {
  console.error("\n--- MongoDB connection failed ---");
  console.error(err.message);
  if (err.code === 8000 || String(err.message).includes("bad auth")) {
    console.error("\n→ Wrong username/password in ATLASDB_URL.");
    console.error("  Atlas → Database Access → Edit user → Reset password");
    console.error("  Atlas → Connect → Drivers → copy string into .env");
  } else if (
    err.name === "MongooseServerSelectionError" ||
    String(err.message).includes("whitelist")
  ) {
    console.error("\n→ IP not whitelisted. Atlas → Network Access → Add IP Address.");
  }
  console.error("");
}

async function start() {
  if (!dburl) {
    console.error("ATLASDB_URL is missing from .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(dburl);
    console.log("database connected successfully");
  } catch (err) {
    logConnectionHelp(err);
    process.exit(1);
  }

  const store = MongoStore.create({
    client: mongoose.connection.getClient(),
    crypto: { secret: process.env.SECRET },
    touchAfter: 24 * 3600,
  });
  store.on("error", (err) => console.log("Error in Mongo Session Store", err));

  // Order matters: session → flash → passport → routes
  app.use(
    session({
      store,
      secret: process.env.SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      },
    })
  );

  app.use(flash());

  app.use(passport.initialize());
  app.use(passport.session());
  passport.use(new LocalStrategy(User.authenticate()));
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());

  app.use((req, res, next) => {
    res.locals.success = req.flash("success") || [];
    res.locals.failure = req.flash("failure") || [];
    res.locals.currUser = req.user || null;
    next();
  });

  // Home page — show all listings
  app.get("/", wrapAsync(listingController.index));

  app.use("/listings", listingRouter);
  app.use("/listings/:id/reviews", reviewRouter);
  app.use("/", userRouter);

  app.all(/.*/, (req, res, next) => {
    next(new CustomErrorclass(404, "Page not found"));
  });

  app.use((err, req, res, next) => {
    const { statuscode = 500 } = err;
    res.status(statuscode).render("error.ejs", { err, ...res.locals });
  });

  app.listen(8080, () => {
    console.log("server is running on port 8080");
  });
}

start();

