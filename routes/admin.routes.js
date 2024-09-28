const { Router } = require("express");
const adminRouter = Router();
const { AdminModel } = require("../db")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const JWT_SECRET = "143secretKEY"

adminRouter.post("/signup", async function(req, res){
    const { name, email, password } = req.body;
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await AdminModel.create({
            name,
            email, 
            password: hashedPassword
        })
        res.json({
            message: "Signed Up successfully!"
        })

    } catch (error) {
        res.json({
            message: `ERROR: ${error}`
        })
    }
})

adminRouter.post("/signin", async function(req, res){
    const { email, password } = req.body;

    const admin = await AdminModel.findOne({
        email : email
    })

    if (!admin) {
        res.json({
            message: "Admin not found"
        })
        return
    }

    const passwordMatch = await bcrypt.compare(password, admin.password)

    if (passwordMatch) {
        const token = jwt.sign({
            id: admin._id
        }, JWT_SECRET)
        res.json({
            token: token
        })
    }
    else {
        res.status(403).json({
            message: "Incorrect credentials!"
        })
    }
})

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