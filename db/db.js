import mongoose from 'mongoose'

export const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    rollNo: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: true
    },
    teams: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team'
    }],
})

export const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

export const teamSchema = new mongoose.Schema({
    teamName: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
    },
    teamMembers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true,
    },
    creationCode: {
        type: String,
        required: true,
        unique: true,  
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

export const testSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    questions: [
        {
            questionText: { type: String, required: true },
            answerType: { type: String, required: true },
            maxMarks: { type: Number, required: true },
        }
    ],
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    team: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Team', 
        default: null 
    },
}, { 
    timestamps: true 
})

export const UserModel = mongoose.model("User", userSchema);
export const AdminModel = mongoose.model("Admin", adminSchema);
export const TeamModel = mongoose.model("Team", teamSchema);
export const TestModel = mongoose.model("Test", testSchema)