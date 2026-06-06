const express = require("express");

const router = express.Router();

const wrapAsync = require("../Utils/wrapAsync.js");

const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const listingController = require("../controllers/listing.js");

const multer = require('multer')  //import multer middleware for file uploads in express.js 

const { storage } = require("../cloudConfig.js");  //import cloudinary storage 


// const upload = multer({ dest: 'uploads/' })   //uploads files in the uploads folder  


const upload = multer({ storage });    //upload files in the cloudinary storage 


const Listing = require("../models/listing");




//controller is a middleman between model and view 
// Handles requests and decides:

// what data to fetch
// what model to use
// which view to render
// where to redirect



//Router decides the path of the request 



//router.route() in Express is used to handle multiple HTTP 
// methods for the same route path in a cleaner way. 






router.get("/search", async (req, res) => {

  let { q } = req.query;

  const allListings = await Listing.find({
    $or: [
      { title: { $regex: q, $options: "i" } },
      { location: { $regex: q, $options: "i" } },
      { country: { $regex: q, $options: "i" } },
      { category: { $regex: q, $options: "i" } }
    ]
  });

  res.render("listings/index.ejs", {
    allListings,
    searchQuery: q,
    activeCategory: null,
    success: `Search results for "${q}"`
  });

});





router.route("/")  // INDEX ROUTE
  .get(
    wrapAsync(listingController.index)
  )
  .post(   //Create New Listing Route 
    isLoggedIn,
    validateListing,
    upload.single('listing[image]'),  //upload image on cloudinary storage using multer middleware 

    wrapAsync(listingController.createNewListing)
  );






// NEW ROUTE
router.get(
  "/new",
  isLoggedIn,
  listingController.renderNewForm
);







// CREATE ROUTE
// router.post(
//     "/",
//     isLoggedIn,
//     validateListing,
//     wrapAsync(listingController.createNewListing)
// );




// SHOW ROUTE
router.get(
  "/:id",
  wrapAsync(listingController.showListing)
);


// EDIT ROUTE
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.rendereditForm)
);


// UPDATE ROUTE
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  upload.single('listing[image]'),   //Multer parse the image and upload on Cloudinary  
  validateListing,
  wrapAsync(listingController.updateListing)
);




// DELETE ROUTE
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.deleteListing)
);



//route handler for the listing with the filters 

router.get("/filter/:category", async (req, res) => {

  let { category } = req.params;

  const filteredListings = await Listing.find({
    category: category
  });

  res.render("listings/index.ejs", {
    allListings: filteredListings,
    activeCategory: category,
    searchQuery: null,
    success: `${category} Listings`
  });

});


module.exports = router;