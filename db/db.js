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

// const testSchema = new mongoose.Schema({

// })

const UserModel = mongoose.model("User", userSchema)
const AdminModel = mongoose.model("Admin", adminSchema)
// const TestModel = mongoose.model("Test", testSchema)

module.exports = {
    UserModel: UserModel,
    AdminModel: AdminModel,
}