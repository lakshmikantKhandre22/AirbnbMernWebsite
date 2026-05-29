// this program is used to insert bulk data into database

require("dotenv").config({ path: "../.env" });


const mongoose = require("mongoose");

const initdata = require("./data.js");

const Listing = require("../models/listing.js");


// MongoDB Atlas URL
const dburl = process.env.ATLASDB_URL;


// connect database
async function main() {

   await mongoose.connect(dburl);

}


// connect mongoose
main()
.then(() => {

   console.log("Database Connected Successfully");

   initDB();

})
.catch((err) => {

   console.log(err);

});


// initialize database
const initDB = async () => {

   // delete old data
   await Listing.deleteMany({});

   // add owner to every listing
   const listingsWithOwner = initdata.data.map((obj) => ({
      ...obj,
      owner: "6a01704dfb6ffdf2c299f11c"
   }));


   // insert new data
   await Listing.insertMany(listingsWithOwner);

   console.log("Data Initialized");

};
