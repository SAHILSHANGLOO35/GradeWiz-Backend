const { Router } = require("express");
const userRouter = Router();
const { UserModel } = require("../db/db")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

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

userRouter.post("/signin", async function(req, res) {
    const { email, password } = req.body;

    // First search in AdminModel
    let user = await AdminModel.findOne({ email: email });

    // If not found in AdminModel, search in UserModel
    if (!user) {
        user = await UserModel.findOne({ email: email });

        // If not found in both models, return "Please signup first"
        if (!user) {
            return res.json({
                message: "Please signup first"
            });
        }
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
        const token = jwt.sign({
            id: user._id
        }, process.env.JWT_SECRET);

        res.json({
            token: token
        });
    } else {
        res.status(403).json({
            message: "Incorrect credentials!"
        });
    }
});

module.exports = { userRouter };
