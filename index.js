require("dotenv").config();
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
    await mongoose.connect(process.env.MONGODB_URI)
    app.listen(process.env.PORT, () => {
        console.log(`SERVER STARTED AT PORT ${process.env.PORT}`);
    })
}

main();
