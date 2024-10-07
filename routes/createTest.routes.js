import { Router } from "express";
const testRouter = Router();
import { TestModel, TeamModel } from "../db/db.js";
import { verifyToken } from "../middlewares/auth.middlewares.js";

testRouter.post("/create-test", verifyToken, async (req, res) => {
    try {
        const { title, questions, teamCode, duedate } = req.body;
        const createdBy = req.body.admin._id;

        let teamId = null;
        
        // If a teamCode is provided, find the team
        if (teamCode) {
            const team = await TeamModel.findOne({ creationCode: teamCode });

            // If no team is found, return an error
            if (!team) {
                return res.status(404).json({ message: "Team not found with the provided team code." });
            }

            teamId = team._id;
        }

        // Ensure questions array is valid and contains objects with a 'question' field
        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ message: "A valid array of questions is required." });
        }

        // Create the test object with the provided data
        const newTest = new TestModel({
            title,
            questions, // questions should already be in the correct format (array of objects with 'question' field)
            createdBy,
            team: teamId || null, // Team ID is optional, only included if teamCode is provided
            duedate
        });

        // Save the new test document in the database
        await newTest.save();

        // Define a dynamic schema and model for storing user responses for this specific test
        const responseSchema = new mongoose.Schema({
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User ID
            answers: { type: Array, required: true }, // Array of answers submitted by the user
            grading: { type: Number, required: false } // Grading for the answers (if applicable)
        });

        // Create a dynamic model using the test title (e.g., 'TestTitle_Responses')
        const modelName = `${title.replace(/\s+/g, '_')}_Responses`; // Replace spaces in title with underscores for collection name
        const TestResponseModel = mongoose.model(modelName, responseSchema);

        // Create a new collection with this model (optional step; Mongoose will create collection when data is added)
        await TestResponseModel.createCollection();

        // Return success response including the dynamically created model/collection name
        res.status(201).json({ 
            message: "Test and associated answer collection created successfully",
            test: newTest,
            responseCollection: modelName
        });
    } catch (error) {
        console.error("Error creating test:", error);
        res.status(500).json({ message: "Failed to create test", error: error.message });
    }
});


testRouter.delete("/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Find and delete the test by ID
        const deletedTest = await TestModel.findByIdAndDelete(id);

        if (!deletedTest) {
            return res.status(404).json({ message: "Test not found!" });
        }

        res.json({ message: "Test deleted successfully!" });
    } catch (error) {
        console.error("Error deleting test:", error);
        res.status(500).json({ message: "Failed to delete test", error: error.message });
    }
});

testRouter.put("/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, questions, teamId } = req.body;

        const updatedTest = await TestModel.findByIdAndUpdate(
            id,
            {
                title,
                questions: questions.map((q) => ({
                    questionText: q.questionText,
                    answerType: q.answerType,
                    maxMarks: q.maxMarks,
                })),
                team: teamId || null,
            },
            { new: true, runValidators: true }
        );

        if (!updatedTest) {
            return res.status(404).json({ message: "Test not found!" });
        }

        res.json({ message: "Test updated successfully!", test: updatedTest });
    } catch (error) {
        console.error("Error updating test:", error);
        res.status(500).json({ message: "Failed to update test", error: error.message });
    }
});

testRouter.get("/", verifyToken, async (req, res) => {
    try {
        const tests = await TestModel.find()
            .populate('createdBy') // Populate createdBy field with admin details
            .populate('team'); // Populate team field with team details
        res.json(tests);
    } catch (error) {
        console.error("Error retrieving tests:", error);
        res.status(500).json({ message: "Failed to retrieve tests", error: error.message });
    }
})

testRouter.post("/team-tests", verifyToken, async (req, res) => {
    try {
        const { teamCode } = req.body;
        console.log(req.body)

        if (!teamCode) {
            return res.status(400).json({ message: "Team code is required to retrieve tests for the team." });
        }

        const team = await TeamModel.findOne({ creationCode: teamCode });

        if (!team) {
            return res.status(404).json({ message: "No team found with the provided team code." });
        }

        const teamId = team._id;

        const teamTests = await TestModel.find({ team: teamId })
            .populate('createdBy') 
            .populate('team'); 

        return res.status(200).json({
            message: "Tests retrieved successfully for the specified team.",
            tests: teamTests,
        });
    } catch (error) {
        console.error("Error retrieving tests for the team:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
})

testRouter.post("/questions-by-title", verifyToken, async (req, res) => {
    try {
        const { title } = req.body;

        // Ensure a title is provided
        if (!title) {
            return res.status(400).json({ message: "Test title is required." });
        }

        // Find the test by the provided title
        const test = await TestModel.findOne({ title });

        // If no test is found, return an error
        if (!test) {
            return res.status(404).json({ message: "Test not found with the provided title." });
        }

        // Return only the questions of the test
        return res.status(200).json({
            message: "Test questions retrieved successfully.",
            questions: test.questions,
            
        });
    } catch (error) {
        console.error("Error retrieving questions by title:", error);
        return res.status(500).json({ message: "Failed to retrieve questions", error: error.message });
    }
})

export default testRouter;