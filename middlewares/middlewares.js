const UserModel = require("../models/User")

const fast2sms = require("fast-two-sms");

const adminLoginChecker = (req,res,next)=>{
    try{
        if(req.session.admin){
            next()
        }else{
            return res.redirect("/admin/login")
        }
    }catch{
        res.status(500).json({error: "Failed to check "});

    }
}


const userStatusCheck = async(req,res,next)=>{
    try{
        const userId = req.session.user._id;
        const userDetails = await UserModel.findOne({_id:userId})
        if(userDetails.status == true){
            next()
        }else{
            return res.redirect("/admin/login")
        }
    }catch{
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
    }catch{
        res.status(500).json({error: "Login verification error."});
    }

}

const userLoginVarify = (req,res,next)=>{
    try{
        if(req.session.user){
            next()
        }else{
            return res.redirect('/login')
        }
    }catch{
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
    }catch{
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