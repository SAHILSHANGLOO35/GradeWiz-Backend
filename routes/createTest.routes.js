import { Router } from "express";
const testRouter = Router();
import { TestModel, TeamModel } from "../db/db.js";
import { verifyToken } from "../middlewares/auth.middlewares.js";

testRouter.post("/create-test", verifyToken, async (req, res) => {
    try {
        const { title, questions, createdBy, teamCode } = req.body;

        const team = await TeamModel.findOne({ creationCode: teamCode });
        const teamId = team._id

        const newTest = new TestModel({
            title,
            questions: questions.map((q) => ({
                questionText: q.questionText,
                answerType: q.answerType,
                maxMarks: q.maxMarks,
            })),
            createdBy,
            team: teamId || null,
        });

        await newTest.save();

        res.status(201).json({ message: "Test created successfully", test: newTest });
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
});

export default testRouter;