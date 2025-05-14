
const UserModel = require("../../../models/User");
const userHelper = require("../../../utils/userHelpers");

const walletHistory = async(req,res)=>{
    try{
        const userId = req.session.user._id
        const user = await UserModel.findOne({_id:userId});
        const cartCount = await userHelper.getCartCount(userId);
        console.log('suer', user)
        res.render("user/wallet-history",{user,cartCount});
    }catch(error){
        res.status(500).json({error: "Internal server Error"});
    }
}

module.exports = {
    walletHistory
};
