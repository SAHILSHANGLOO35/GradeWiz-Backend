import { Router } from "express";
const teamRouter = Router();
import { TeamModel } from "../db/db.js";
import { verifyToken } from "../middlewares/auth.middlewares.js";

const generateUniqueCode = async () => {
    let code;
    let isUnique = false;

    while (!isUnique) {
        code = Math.floor(10000000 + Math.random() * 90000000).toString();

        const existingTeam = await TeamModel.findOne({ creationCode: code });
        if (!existingTeam) {
            isUnique = true;
        }
    }
    return code;
}

teamRouter.post("/create", verifyToken, async (req, res) => {
    try {
        const { teamName, description, createdBy, teamMembers } = req.body;

        const existingTeam = await TeamModel.findOne({ teamName });
        if (existingTeam) {
            return res.status(400).json({
                message: "A team with this name already exists. Please choose a different name.",
            });
        }

        const creationCode = await generateUniqueCode();

        const newTeam = await TeamModel.create({
            teamName,
            description,
            createdBy,
            teamMembers,
            creationCode
        });

        return res.status(201).json({
            message: "Team created successfully",
            team: newTeam,
        });
    } catch (error) {
        console.error("Error creating team:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
})

export default teamRouter