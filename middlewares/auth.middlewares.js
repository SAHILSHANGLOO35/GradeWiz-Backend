const jwt = require("jsonwebtoken");
const { UserModel, AdminModel } = require("../db/db");

// Middleware to verify JWT for both users and admins
const verifyToken = async (req, res, next) => {
    try {
        // Get the token from the request headers
        const token = req.headers.token;

        // Check if token is present
        if (!token) {
            return res.status(401).json({ message: "Access Denied. No token provided." });
        }

        // Verify and decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use your JWT secret here

        // Check if the token belongs to a User
        const user = await UserModel.findById(decoded.id);
        if (user) {
            req.user = user; // Attach user information to the request object
            return next();
        }

        // Check if the token belongs to an Admin
        const admin = await AdminModel.findById(decoded.id);
        if (admin) {
            req.admin = admin; // Attach admin information to the request object
            return next();
        }

        // If neither a user nor an admin was found, return unauthorized
        return res.status(401).json({ message: "Invalid token or user/admin not found." });
    } catch (error) {
        console.error("Error verifying token:", error);
        return res.status(403).json({ message: "Invalid token or authorization failed." });
    }
};

module.exports = verifyToken;
