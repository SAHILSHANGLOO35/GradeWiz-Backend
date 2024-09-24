const { Router } = require("express");
const userRouter = Router();
const { UserModel } = require("../db")

userRouter.post("/signup", function(req, res){
    res.json({
        message: "signup endpoint"
    })
})

userRouter.post("/signin", function(req, res){
    res.json({
        message: "signin endpoint"
    })
})

module.exports = {
    userRouter: userRouter
}