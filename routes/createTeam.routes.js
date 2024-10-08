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
        console.log(req.body)
        const { teamName, description } = req.body;

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
            createdBy: req.body.admin._id,
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

teamRouter.get("/all-members", verifyToken, async (req, res) => {
    try {

        const userId = req.body.user._id;

        const teams = await TeamModel.find({ 
            teamMembers: userId 
        }).populate("teamMembers", "name email rollNo branch year");

        if (!teams.length) {
            return res.status(404).json({ message: "No teams found for this user." });
        }

        const teamsWithMembers = teams.map(team => ({
            teamName: team.teamName,
            description: team.description,
            members: team.teamMembers,
        }));

        return res.status(200).json({
            message: "Teams and members retrieved successfully",
            teams: teamsWithMembers,
        });
    } catch (error) {
        console.error("Error retrieving members:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
})

teamRouter.delete("/remove-member", verifyToken, async (req, res) => {
    try {
        const { teamId, memberId } = req.body;

        // Find the team and update it by removing the specified member
        const team = await TeamModel.findByIdAndUpdate(
            teamId,
            { $pull: { teamMembers: memberId } },
            { new: true }
        ).populate("teamMembers", "name email rollNo branch year");

        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }

        return res.status(200).json({
            message: "Member removed successfully",
            team,
        });
    } catch (error) {
        console.error("Error removing member:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
})

export default teamRouter