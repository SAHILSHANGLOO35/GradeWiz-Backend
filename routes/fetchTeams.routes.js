import { Router } from "express";
import { TeamModel } from "../db/db.js";
import { verifyToken } from "../middlewares/auth.middlewares.js";

const fetchTeamsRouter = Router();

fetchTeamsRouter.get("/", verifyToken, async (req, res) => {
    try {
        const adminId = req.body.admin?._id;

        if (!adminId) {
            return res.status(400).json({ message: "Admin ID not found in the request." });
        }

        const teams = await TeamModel.find({ createdBy: adminId });

        if (!teams.length) {
            return res.status(404).json({ message: "No teams found for this admin!" });
        }

        res.status(200).json({ teams });
    } catch (error) {
        console.error("Error fetching teams:", error);
        res.status(500).json({ message: "Failed to fetch teams", error: error.message });
    }
});

export default fetchTeamsRouter;