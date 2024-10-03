require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { userRouter } = require("./routes/user.routes");
const { adminRouter } = require("./routes/admin.routes");
const { teamRouter } = require("./routes/createTeam.routes");
const { joinTeamRouter } = require("./routes/joinTeam.routes");

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies

// Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/team", teamRouter);
app.use("/api/v1/join-team", joinTeamRouter);

// MongoDB connection and server start
async function main() {
    await mongoose.connect(process.env.MONGODB_URI)
    app.listen(process.env.PORT, () => {
        console.log(`SERVER STARTED AT PORT ${process.env.PORT}`);
    })
}

main();
