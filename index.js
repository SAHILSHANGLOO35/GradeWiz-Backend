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
    await mongoose.connect("mongodb+srv://sahilshangloo35:root@cluster0.ulniw.mongodb.net/GradeWiz")
    app.listen(8000, () => {
        console.log("SERVER STARTED");
    })
}

main();