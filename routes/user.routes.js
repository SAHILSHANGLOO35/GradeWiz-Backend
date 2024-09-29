const { Router } = require("express");
const userRouter = Router();
const { UserModel } = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "secret143"; // Use environment variable

userRouter.post("/signup", async (req, res) => {
    const { name, rollNo, email, password, branch, mobile, year } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await UserModel.create({
            name,
            rollNo,
            email,
            password: hashedPassword,
            branch,
            mobile,
            year
        });
        res.status(201).json({ message: "Signed up successfully!" });
    } catch (error) {
        res.status(400).json({ message: `ERROR: ${error.message}` });
    }
});

userRouter.post("/signin", async (req, res) => {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
        // Create a non-expiring token with isAdmin set to false
        const token = jwt.sign({ id: user._id, isAdmin: false }, JWT_SECRET);
        res.json({ token });
    } else {
        res.status(403).json({ message: "Incorrect credentials!" });
    }
});

module.exports = { userRouter };
