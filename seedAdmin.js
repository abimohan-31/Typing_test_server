import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

// Load environment variables
dotenv.config();

const seedAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("Error: MONGO_URI is not defined in your .env file.");
      process.exit(1);
    }

    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    const adminEmail = "admin01@gmail.com";
    const adminPassword = "Admin1234";

    // Check if admin already exists
    const adminExists = await User.findOne({ email: adminEmail });

    if (adminExists) {
      console.log(`Admin user with email ${adminEmail} already exists. Skipping insertion.`);
    } else {
      console.log("Admin user not found. Seeding database...");

      // Note: The User model has a pre("save") hook that automatically hashes 
      // the password using bcryptjs before inserting it into the database.
      await User.create({
        email: adminEmail,
        password: adminPassword,
        role: "admin",
        isActive: true,
      });

      console.log(`Successfully seeded admin user: ${adminEmail}`);
    }

    // Disconnect and exit gracefully
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin user:", error);
    process.exit(1);
  }
};

seedAdmin();
