
const UserModel = require("../../../models/User");
const moment = require("moment");

const walletHistory = async(req,res)=>{
    try{
        const userId = req.session.user._id
        const user = await UserModel.findOne({_id:userId});
        const cartCount = await userFunc.getCartCount(userId);

        res.render("user/wallet-history",{user,cartCount});
    }catch(error){
        res.status(500).json({error: "Internal server Error"});
    }
}

module.exports = {
    walletHistory
};
