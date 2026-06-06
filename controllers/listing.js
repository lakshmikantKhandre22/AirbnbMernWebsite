const Listing = require("../models/listing.js");
const { geocodeAddress } = require("../Utils/geocode.js");


// INDEX ROUTE
module.exports.index = async (req, res) => {

    const allListings = await Listing.find({});

    res.render("listings/index.ejs", { allListings, activeCategory: null, searchQuery: null });
};



//this is a module and 
//Async Callback Handler 





// NEW FORM                   //callback 
module.exports.renderNewForm = (req, res) => {

    res.render("listings/new.ejs");
};



// CREATE ROUTE                 //Async Callback Handler 
module.exports.createNewListing = async (req, res) => {

    let url=req.file.path;   //get url from the user requested to upload file 
    let filename=req.file.filename;
    console.log(url,"",filename);

     
    const newListing = new Listing(req.body.listing);

    // Save current logged-in user as owner
    newListing.Owner = req.user._id;

      
    newListing.image={url,filename};   //storing new image using url with path  in Listing Collection  mongoDBtabase  

    const geometry = await geocodeAddress(newListing);
    if (geometry) newListing.geometry = geometry;

    await newListing.save();

    req.flash("success", "New listing created!");

    res.redirect("/listings");
};



// SHOW ROUTE                async callback handler for controller 
module.exports.showListing = async (req, res) => {

    let { id } = req.params;

    const listing = await Listing.findById(id)
        .populate("Owner")
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            }
        });

    if (!listing) {

        req.flash("error", "Listing does not exist!");

        return res.redirect("/listings");
    }

    const mapAddress = [listing.location, listing.city, listing.country]
        .filter(Boolean)
        .join(", ");

    let mapLat = null;
    let mapLng = null;
    if (listing.geometry?.coordinates?.length === 2) {
        mapLng = listing.geometry.coordinates[0];
        mapLat = listing.geometry.coordinates[1];
    }

    res.render("listings/show.ejs", { listing, mapAddress, mapLat, mapLng });
                               //SEND LISTING with populated fields to 
                                
};






// EDIT FORM                    async callback handler for controller 
module.exports.rendereditForm = async (req, res) => {

    let { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {

        req.flash("error", "Listing does not exist!");

        return res.redirect("/listings");
    }

   let originalUrl=listing.image.url;
   originalUrl.replace("upload","/upload/h_300,w_250");
   


    res.render("listings/edit.ejs", { listing,originalUrl });
};








// UPDATE ROUTE                async callback handler for controller 
module.exports.updateListing = async (req, res) => {


    let { id } = req.params;

    let listing = await Listing.findByIdAndUpdate(
        id,
        { ...req.body.listing },
        { new: true, runValidators: true }
    );

    if (!listing) {
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings");
    }

    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
    }

    const geometry = await geocodeAddress(listing);
    if (geometry) listing.geometry = geometry;

    await listing.save();


    req.flash("success", "Listing updated successfully!");


    res.redirect(`/listings/${id}`);


    
};





// DELETE ROUTE                 async callback handler for controller 
module.exports.deleteListing = async (req, res) => {


    let { id } = req.params;

    await Listing.findByIdAndDelete(id);

    req.flash("success", "Listing deleted!");

    res.redirect("/listings");
  
};













