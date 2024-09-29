const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); // Import CORS
const { userRouter } = require("./routes/user.routes");
const { adminRouter } = require("./routes/admin.routes");

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies

// Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);

// MongoDB connection and server start
async function main() {
    try {
        await mongoose.connect("mongodb+srv://sahilshangloo35:root@cluster0.ulniw.mongodb.net/GradeWiz", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to MongoDB");

        app.listen(8000, () => {
            console.log("SERVER STARTED");
        });
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

main();
