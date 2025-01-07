const User = require("../models/User");
const getAllUsers = async(req,res)=>{
    const users = await User.find().select("-password").lean();
    if(!users.length){
        res.status(404).json({message:"no users found"});
    }
    res.json(users)
};


module.exports = {
    getAllUsers
}