import { Router } from "express";
import { TeamModel, UserModel } from "../db/db.js";
import { verifyToken } from "../middlewares/auth.middlewares.js";

const fetchTeamsRouter = Router();

fetchTeamsRouter.get("/", verifyToken, async (req, res) => {
    try {
        console.log(req.body)
        const user = req.body.user; // assuming the verifyToken middleware adds user here
        const admin = req.body.admin;

        // If the adminId exists, fetch teams created by the admin
        if (admin) {
            const teams = await TeamModel.find({ createdBy: admin._id });

            if (!teams.length) {
                return res.status(404).json({ message: "No teams found for this admin!" });
            }

            return res.status(200).json({ teams });
        }
        else {
            const populatedUser = await UserModel.findById(user._id).populate('joinedTeams');

            if (!populatedUser) {
                return res.status(404).json({ message: "User not found." });
            }

            return res.status(200).json({
                message: "Joined teams retrieved successfully!",
                teams: populatedUser.joinedTeams,
            });
        }

        // If neither admin nor user is found in the request
        return res.status(400).json({ message: "Invalid request. Admin or user information is required." });

    } catch (error) {
        console.error("Error fetching teams:", error);
        return res.status(500).json({ message: "Failed to fetch teams", error: error.message });
    }
});


export default fetchTeamsRouter;