const UserModel = require("../models/User")

const fast2sms = require("fast-two-sms");

const adminLoginChecker = (req,res,next)=>{
    try{
        if(req.session.admin){
            next()
        }else{
            return res.redirect("/admin/login")
        }
    }catch(error){
        res.status(500).json({error: "Failed to check "});

    }
}


const userStatusCheck = async(req,res,next)=>{
    try{
        console.log('User',req.session.user)
        if(req.session.user === undefined) return next()


        const userId = req.session.user._id || null;
        console.log(userId, 'userID')
        
        const userDetails = await UserModel.findOne({_id:userId})
        if(userDetails.status == true){
            next()
        }else{
            return res.redirect("/admin/login")
        }
    }catch(error){
        console.log(error, ' error in userStatusCheck middleware')
        res.status(500).json({error: "Failed to check permission status "});
    }
}



const adminLoginVarify = (req,res,next) =>{
    try{
        if(req.session.admin){
            return res.redirect("/admin")
        }else{
            next()
        }
    }catch(error){
        res.status(500).json({error: "Login verification error."});
    }

}

const userLoginVarify = (req,res,next)=>{
    try{
        if(req.session.user){
            console.log(req.session.user, 'from middle ware login verify');
            next()
        }else{
            return res.redirect('/login')
        }
    }catch(error){
        res.status(500).json({error: "Login verification error. "});

    }
}

const userLoginChecker = (req,res,next) =>{
    try{
        if(req.session.user){
            return res.redirect("/")
        }else{
            next()
        }
    }catch(error){
        res.status(500).json({error: "Login checker error."});
    }
}

const otpSend = (req,res,next) =>{

    fast2sms.sendMessage(options)
        .then((response)=>{
            console.log(response)   
            next()
        })
        .catch((error)=>{
            res.status(500).json({error: "Internal error. Failed to send OTP."});
        })
} 

module.exports = {
    otpSend,
    adminLoginChecker,
    adminLoginVarify,
    userLoginChecker,
    userLoginVarify,
    userStatusCheck
}