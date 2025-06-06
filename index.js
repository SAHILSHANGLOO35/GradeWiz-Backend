import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import userRouter from './routes/user.routes.js';
import adminRouter from './routes/admin.routes.js';
import teamRouter from './routes/createTeam.routes.js';
import joinTeamRouter from './routes/joinTeam.routes.js';
import testRouter from "./routes/createTest.routes.js";
import fetchTeamsRouter from "./routes/fetchTeams.routes.js"

const app = express();

app.use(cors());
app.use(express.json());
// Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/team", teamRouter);
app.use("/api/v1/join-team", joinTeamRouter);
app.use("/api/v1/tests", testRouter);
app.use("/api/v1/all-teams", fetchTeamsRouter);

async function main() {
    await mongoose.connect(process.env.MONGODB_URI)
    app.listen(process.env.PORT, () => {
        console.log(`SERVER STARTED AT PORT ${process.env.PORT}`);
    })
}

main();