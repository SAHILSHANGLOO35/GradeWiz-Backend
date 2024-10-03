import { Router } from "express";
const userRouter = Router();
import { UserModel, AdminModel } from "../db/db.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

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

export default userRouter