const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
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
    }
})

const adminSchema = new mongoose.Schema({
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

const teamSchema = new mongoose.Schema({
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
        unique: true,  // Ensure the creation code is unique
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

const UserModel = mongoose.model("User", userSchema)
const AdminModel = mongoose.model("Admin", adminSchema)
const TeamModel = mongoose.model("Team", teamSchema)

module.exports = {
    UserModel: UserModel,
    AdminModel: AdminModel,
    TeamModel: TeamModel
}