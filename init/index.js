// this program is used to insert bulk data into database
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");
const { geocodeAddress } = require("../Utils/geocode.js");

// MongoDB Atlas URL
const dburl = process.env.ATLASDB_URL;

if (!dburl) {
  console.error("ATLASDB_URL is missing in environment variables!");
  process.exit(1);
}

// connect mongoose
main()
  .then(() => {
    console.log("Database Connected Successfully");
    return initDB();
  })
  .then(() => {
    console.log("Data Initialized successfully");
    mongoose.disconnect();
  })
  .catch((err) => {
    console.log("Error occurred:", err);
    mongoose.disconnect();
  });

// connect database
async function main() {
  await mongoose.connect(dburl);
}

// initialize database
const initDB = async () => {
  // 1. Get or create Admin user
  let adminUser = await User.findOne({ username: "admin" });
  if (!adminUser) {
    console.log("Admin user not found. Creating default admin user...");
    // Register default admin user with passport-local-mongoose
    adminUser = await User.register(
      new User({ username: "admin", email: "admin@gmail.com" }),
      "admin123"
    );
    console.log("Admin user created with ID:", adminUser._id);
  } else {
    console.log("Found existing admin user with ID:", adminUser._id);
  }

  // 2. Clear old listings
  console.log("Deleting old listings...");
  await Listing.deleteMany({});
  console.log("Old listings deleted.");

  // 3. Geocode and prepare listings with owner
  console.log("Preparing listings (performing geocoding for each)...");
  const listingsToInsert = [];
  
  for (let item of initdata.data) {
    // Make a copy
    const listing = { ...item };
    
    // Set Owner with capital 'O' as defined in models/listing.js
    listing.Owner = adminUser._id;
    
    // Geocode listing location to set coordinates
    console.log(`Geocoding: ${listing.title} (${listing.location}, ${listing.country})`);
    const geometry = await geocodeAddress(listing);
    if (geometry) {
      listing.geometry = geometry;
      console.log(`  -> Found coordinates: ${geometry.coordinates}`);
    } else {
      console.log(`  -> Geocoding failed, map will fall back to client-side or error state`);
    }
    
    listingsToInsert.push(listing);
    
    // Add 1 second delay between Nominatim calls to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // 4. Insert listings
  console.log("Inserting new listings into MongoDB Atlas...");
  await Listing.insertMany(listingsToInsert);
  console.log("All listings inserted successfully!");
};

