require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { userRouter } = require("./routes/user.routes");
const { adminRouter } = require("./routes/admin.routes");
const app = express();
app.use(express.json());

app.use("/api/v1/user", userRouter)
app.use("/api/v1/admin", adminRouter)


async function main() {
    await mongoose.connect(process.env.MONGODB_URI)
    app.listen(process.env.PORT, () => {
        console.log(`SERVER STARTED AT PORT ${process.env.PORT}`);
    })
}

main();