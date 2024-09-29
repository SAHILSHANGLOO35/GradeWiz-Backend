const { Router } = require("express");
const adminRouter = Router();
const { AdminModel } = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "143secretKEY"; // Use environment variable

adminRouter.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await AdminModel.create({ name, email, password: hashedPassword, isAdmin: true }); // Assuming all admins are isAdmin: true
        res.status(201).json({ message: "Signed up successfully!" });
    } catch (error) {
        res.status(400).json({ message: `ERROR: ${error.message}` });
    }
});

adminRouter.post("/signin", async (req, res) => {
    const { email, password } = req.body;

    const admin = await AdminModel.findOne({ email });

    if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);

    if (passwordMatch) {
        // Create a non-expiring token with isAdmin
        const token = jwt.sign({ id: admin._id, isAdmin: admin.isAdmin }, JWT_SECRET);
        res.json({ token, isAdmin: admin.isAdmin }); // Send isAdmin in the response if needed
    } else {
        res.status(403).json({ message: "Incorrect credentials!" });
    }
});

module.exports = { adminRouter };
