const { Router } = require("express");
const userRouter = Router();
const { UserModel } = require("../db")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const JWT_SECRET = "secret143"


userRouter.post("/signup", async function(req, res){
    const { name, rollNo, email, password, branch, mobile, year } = req.body;
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        console.log(hashedPassword);

        await UserModel.create({
            name, 
            rollNo, 
            email, 
            password: hashedPassword, 
            branch, 
            mobile, 
            year
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

userRouter.post("/signin", async function(req, res){
    const { email, password } = req.body;

    const user = await UserModel.findOne({
        email : email
    })

    if (!user) {
        res.json({
            message: "User not found"
        })
        return
    }

    const passwordMatch = await bcrypt.compare(password, user.password)

    if (passwordMatch) {
        const token = jwt.sign({
            id: user._id
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

module.exports = {
    userRouter: userRouter
}