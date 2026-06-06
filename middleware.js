const Listing = require("./models/listing");

const { listingSchema } = require("./schema.js");

const CustomErrorclass = require("./utils/CustomErrorclass.js");


const { reviewSchema } = require("./schema.js");


const Review = require("./models/review");





//MiddleWare 





module.exports.isLoggedIn = (req, res, next) => {

    if (!req.isAuthenticated()) {

        req.session.returnTo = req.originalUrl;

        req.flash("failure", "You must be logged in");

        return res.redirect("/login");
    }

    next();
};






module.exports.saveRedirectUrl = (req, res, next) => {

    if (req.session.returnTo) {
        res.locals.redirectUrl = req.session.returnTo;
    }

    next();
};






module.exports.isOwner = async (req, res, next) => {

    let { id } = req.params;

    // Authorization for updating the listing
    let listing = await Listing.findById(id);

    if (!listing.Owner.equals(res.locals.currUser._id)) {
        req.flash("failure", "you are not the owner of this listing so you are not allowed");
        return res.redirect(`/listings/${id}`);
    }

    next();  //if it user is valid then proceed 

}






module.exports.validateListing = (req, res, next) => {

    let { error } = listingSchema.validate(req.body);

    if (error) {

        const errMsg = error.details
            .map((el) => el.message)
            .join(",");

        throw new CustomErrorclass(400, errMsg);
    }

    next();
};







module.exports.validateReview = (req, res, next) => {

    let { error } = reviewSchema.validate(req.body);

    if (error) {

        const errMsg = error.details
            .map((el) => el.message)
            .join(",");

        throw new CustomErrorclass(400, errMsg);
    }

    next();
};





module.exports.isReviewAuthor = async (req, res, next) => {

    let { reviewId, id } = req.params;

    let review = await Review.findById(reviewId);

    if (!review.author.equals(res.locals.currUser._id)) {


        req.flash(
            "failure",
            "You are not the author of this review"
        );


        return res.redirect(`/listings/${id}`);
    }

    next();
};

