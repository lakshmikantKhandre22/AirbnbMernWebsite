const express = require("express");

const router = express.Router({ mergeParams: true });
//“Take the parameters from the parent route and make them available inside this router too.”

const Listing = require("../models/listing.js");

const Review = require("../models/review.js");

const wrapAsync = require("../Utils/wrapAsync.js");

const CustomErrorclass = require("../Utils/CustomErrorclass.js");

const { reviewSchema } = require("../schema.js");

const { validateReview, isLoggedIn } = require("../middleware.js");


//extracting only one property from object 
const { isReviewAuthor } = require("../middleware.js");




//Extracting whole objcet of modules 
const reviewController = require("../controllers/review.js");



//Router decides the path of the request 
//It handles how request comes and how to manage and send the response 




// Add Review Route
router.post(
    "/", isLoggedIn,
    validateReview,
    wrapAsync(reviewController.createReview)

);




// Delete Review Route
router.delete(
    "/:reviewId", isLoggedIn, isReviewAuthor,
    wrapAsync(reviewController.deleteReview)

);




module.exports = router; 
