const { Router } = require("express");
const adminRouter = Router();
const { AdminModel } = require("../db/db")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

adminRouter.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await AdminModel.create({ name, email, password: hashedPassword, isAdmin: true }); // Assuming all admins are isAdmin: true
        res.status(201).json({ message: "Signed up successfully!" });
    } catch (error) {
        res.status(400).json({ message: `ERROR: ${error.message}` });
    }
});

adminRouter.post("/create-test", function(req, res){

})

adminRouter.post("/delete-test", function(req, res){

})

adminRouter.put("/test", function(req, res){

})

adminRouter.get("/test/bulk", function(req, res){
    res.json({
        message: "All tests"
    })
})

module.exports = {
    adminRouter: adminRouter
}
