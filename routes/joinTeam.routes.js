import { Router } from "express";
const joinTeamRouter = Router();
import { TeamModel, UserModel } from "../db/db.js";
import { verifyToken } from "../middlewares/auth.middlewares.js";

joinTeamRouter.post("/join", verifyToken, async (req, res) => {
    try {
        // Get the user from the request (added by the verifyToken middleware)
        const user = req.body.user;

        // If the user is not found in the request (authentication issue), return error
        if (!user) {
            return res.status(401).json({ message: "Unauthorized. Please log in as a user to join a team." });
        }

        // Extract the team code from the request body
        const { teamCode } = req.body;

        // Validate the team code
        if (!teamCode) {
            return res.status(400).json({ message: "Team code is required to join a team." });
        }

        // Check if the team with the provided code exists
        const team = await TeamModel.findOne({ creationCode: teamCode });

        // If team is not found, return an error
        if (!team) {
            return res.status(404).json({ message: "No team found with the provided team code." });
        }

        // Check if the user is already a member of the team
        const isAlreadyMember = team.teamMembers.includes(user._id);

        if (isAlreadyMember) {
            return res.status(400).json({ message: "You are already a member of this team." });
        }

        // Add the user to the team's members list
        team.teamMembers.push(user._id);

        // Save the updated team document to the database
        await team.save();

        // Fetch the user document from the database
        const userDoc = await UserModel.findById(user._id);

        if (!userDoc) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check if the user has already joined this team
        const hasJoinedTeam = userDoc.joinedTeams.includes(team._id);

        if (!hasJoinedTeam) {
            // Add the team to the user's joinedTeams array
            userDoc.joinedTeams.push(team._id);
            // Save the updated user document to the database
            await userDoc.save();
        }

        return res.status(200).json({
            message: "Successfully joined the team!",
            team,
        });
    } catch (error) {
        console.error("Error joining team:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});





export default joinTeamRouter