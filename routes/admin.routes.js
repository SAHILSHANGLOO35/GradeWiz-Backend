const { Router } = require("express");
const adminRouter = Router();
const { AdminModel } = require("../db")

adminRouter.post("/signup", function(req, res){
    
})

adminRouter.post("/signin", function(req, res){

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