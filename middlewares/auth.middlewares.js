import jwt from 'jsonwebtoken'
import {UserModel, AdminModel} from '../db/db.js'

export const verifyToken = async (req, res, next) => {
    try {
        // Get the token from the Authorization header (expecting format: Bearer <token>)
        const token = req.headers.token;

        if (!token) {
            return res.status(401).json({ message: "Access Denied. No token provided." });
        }

        // Verify and decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the token belongs to a User
        const user = await UserModel.findById(decoded.id);
        if (user) {
            req.user = user; // Attach user info to the request
            return next();
        }

        // Check if the token belongs to an Admin
        const admin = await AdminModel.findById(decoded.id);
        if (admin) {
            req.admin = admin; // Attach admin info to the request
            return next();
        }

        return res.status(401).json({ message: "Invalid token or user/admin not found." });
    } catch (error) {
        console.error("Error verifying token:", error);
        return res.status(403).json({ message: "Invalid token or authorization failed." });
    }
};

