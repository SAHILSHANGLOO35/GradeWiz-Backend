import { Router } from "express";
const teamRouter = Router();
import { TeamModel, UserModel } from "../db/db.js";
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


teamRouter.post("/all-members", verifyToken, async (req, res) => {
    try {
        console.log("allmembers api", req.body);
        const teamCode = req.body.teamCode; // This is the creationCode

        // Find the team using creationCode
        const team = await TeamModel.findOne({ 
            creationCode: teamCode // Use creationCode to find the team
        }).populate("teamMembers", "name email rollNo branch year"); // Optionally populate user details

        if (!team) {
            return res.status(404).json({ message: "No team found with this creation code." });
        }

        // Fetch details of all members from the Users collection based on member IDs
        const members = await UserModel.find({
            _id: { $in: team.teamMembers }
        }).select("name email rollNo branch year");

        // Construct the response
        const teamWithMembers = {
            teamName: team.teamName,
            description: team.description,
            members: members // Return the fetched member details
        };

        console.log(teamWithMembers, "line 71 @@@@");

        return res.status(200).json({
            message: "Team and members retrieved successfully",
            team: teamWithMembers,
        });
    } catch (error) {
        console.error("Error retrieving members:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});


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