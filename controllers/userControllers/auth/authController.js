const bcrypt = require("bcryptjs");
const saltRounds = 10;
const UserModel = require("../../../models/User");
const session = require("express-session");
const sendMail = require("../../../utils/nodeMailer");
const { sendMessage } = require("fast-two-sms");





const loginUser = async (req,res) => {
    try{

    console.log(req.body, 'login user rq.boyd')
  
        const {email,password} = req.body;
        const user = await UserModel.findOne({email})
        console.log(user, 'user')
        console.log(email)
        if(email !=''|| password !=''){
            if(user){
                console.log("email matched")
                
                if(password === user.password){
                    console.log("password matched.")
                    if(user.status == true){
                        req.session.user = user;
                        console.log("session: ", req.session.user)
                        res.redirect('/')
                    }else{
                        res.render("user/login")
                        console.log("User blocked")
                    }
                 
                }else{
                    const failedPassword = true
                    res.redirect(`/login?failedPassword=${failedPassword}`);
    
                    console.log("Wrong password.")
                }
            }
            else {
                const failedEmail = true
                res.redirect(`/login?failedEmail=${failedEmail}`)
                console.log("Wrong email.")
            }
        }else{
            const emptyField = true;
            res.redirect(`/login?emptyField=${emptyField}`);
            console.log("empty form");
        }
    }catch(error){
        res.status(500).json({ status: false, error: 'Something went wrong on the server.' });
    }
}




const signupUser  = async (req,res) =>{
    try{
        const {name,email,number,password,referenceId}= req.body;
        const isPasswordValid = userFunc.validatePassword(password);
        const isNameValid = userFunc.validateName(name);
        const isEmailValid = userFunc.validateEmail(email);
        const isNumberValid = userFunc.validatePhoneNumber(number);
        if(isEmailValid){
            if(isPasswordValid.length < 1 && isNumberValid.length < 1 && isNameValid.length < 1){
                const currentDate = new Date();
                const formattedDate = formatDate(currentDate);
            
                let wallet = 50;
                let walletHistory=[{transaction:'credited',amount:50,orderId:'Joining bonus',date:formattedDate}];
                if(referenceId){
                    var referralOffer = await userFunc.referenceIdApplyOffer(referenceId);
                    if(referralOffer){
                        wallet = wallet+100
                        const dataHistory = {
                                            transaction:'credited',
                                            amount:100,
                                            orderId:'Referral joining bonus',
                                            date:formattedDate
                                        }
                        walletHistory.push(dataHistory);
                    }
                } 
                sendMail(email)
                session.email = email
                
                UserModel.findOne({email: req.body.email}).then(async (user)=> {
                    if(user){
                        console.log("Email already exists.");
                        const emailExists = 'Email already exists'
                        res.render("user/signup",{emailExists})
                    }else{
                        const data = {
                            name: req.body.name,
                            number: req.body.number,
                            email : req.body.email,
                            password : req.body.password,
                            status: true,
                            wallet:wallet,
                            walletHistory:walletHistory,
                            referenceId: userFunc.generateRandomReferenceId()
                        }
                        // data.password = await bcrypt.hash(data.password,saltRound)
                        // await UserModel.insertMany([data])
                        console.log("data inserted")
                        session.userData = data;
                        if(session.userData){
                            res.render("user/otp")
                        }
                    }
                })
            }else{
                res.render("user/signup",{isNumberValid,isNameValid,isPasswordValid})
            }
        }else{
            const errorMessage = "Please enter a valid email."
            res.render("user/signup",{errorMessage,isPasswordValid,isNumberValid,isNameValid})
        }
    }catch(error){
        res.status(500).json({ status: false, error: 'Something went wrong on the server.' });
    }
}




const loginView = (_req,res) => {
    try{
        return res.render("user/login");
    }catch(error){
        res.status(500).json({ status: false, error: "Something went wrong on the server. Can't login try again later" });
    }

}  

const signupView = (req,res) => {
    try{
        return res.render("user/signup");
    }catch(error){
        console.log(error, 'signup view')
        res.status(500).json({ status: false, error: "Something went wrong on the server." });
    }
}


const otpView = (req,res)=>{
    try{
        const email = session.email
        sendMail(email)
        return res.redirect("user/otp");
    }catch(error){
        res.status(500).json({ status: false, error: 'Something went wrong on the server.' });
    }
};

const otpViewPass = async(req,res)=>{
    try{
        const email = session.email
        sendMail(email);
        return res.render("user/forgot-password-otp");
    }catch(error){
        res.status(500).json({ status: false, error: 'Something went wrong on the server.' });
    }
};


const otpVerification = async(req,res)=>{
    try{
        const {otpNum1,otpNum2,otpNum3,otpNum4,otpNum5,otpNum6} =  req.body;
        const fullOTP = otpNum1 + otpNum2 + otpNum3 + otpNum4 + otpNum5 + otpNum6;
        if(fullOTP == session.otp){
            data = session.userData;
            
            const user = await UserModel.create(data);
            req.session.user = user
            console.log(req.session.user,'req.session.user');
            console.log(user,"user");
            res.redirect('/');
        }else{
            msg = true
             res.render("user/otp",{msg});
        }
    }catch(error){
        res.status(500).json({ status: false, error: 'Something went wrong on the server.' });
    }
}

const otpVerificationPassword = async(req,res)=>{
    try{
        const {otpNum1,otpNum2,otpNum3,otpNum4,otpNum5,otpNum6} =  req.body;
        const fullOTP = otpNum1 + otpNum2 + otpNum3 + otpNum4 + otpNum5 + otpNum6;
        console.log('entered Otp',fullOTP);
        console.log(session.otp);
        if(fullOTP == session.otp){
            email = session.email;
            res.render('user/forgot-password-change');
        }else{
            msg = true
             res.render("user/otp",{msg});
        }
    }catch(error){
        res.status(500).json({ status: false, error: 'Something went wrong on the server.' });
    }
}

const emailVerifyOtp = async (req,res)=>{
    try{
        const email = req.body.email;
        await sendMail(email)
        const userExist = await UserModel.findOne({email:email})
        session.email = email
        console.log(session.email)
        if(userExist){ 
            console.log('userExist');
            res.render("user/forgot-password-otp")
        }
    }catch(error){
        res.status(500).json({ status: false, error: 'Something went wrong on the server.' });
    }
}

const userLogout = (req,res)=>{
    try{
        req.session.destroy(()=>{
            res.redirect("/login")
        })
    }catch(error){
        res.status(500).json({ status: false, error: 'Something went wrong on the server.' });
    }
}

const createNewPasswrod = async(req,res)=>{ // for forgot password
    // try{

        const {newPassword,renewPassword} = req.body;
        const isPasswordValid = userFunc.validatePassword(newPassword);

        if(newPassword === renewPassword){
    
            const email = session.email;

                if(isPasswordValid.length < 1 ){
                    console.log('password updated')
                    const update = await UserModel.updateOne({email:email},{$set:{password:newPassword}})
                    if(update){
                        console.log('password really updated');
                        const successMessage = "Your Password has been succesfuly updated."
                        res.render("user/login", {successMessage})
                    }
                }else{
                    res.render("user/forgot-password-change", {isPasswordValid})
                }
        }else{
            const wrongPassword = "Password deos'nt match."
            res.render("user/forgot-password-change", {wrongPassword})
        }

    // }catch(error){
    //     res.status(500).json({error: "Internal Server Error"});
    // }

}



const changePassword = async (req, res) => { // changing existing password from user's profile
    try {
        const currentPassword = req.body.password
        const newPassword = req.body.newpassword
        const renewPassword = req.body.renewPassword
        const userId = req.session.user._id
        const userDetails = await UserModel.findById({ _id: userId })
        const currentPasswordT = currentPassword.trim();
        const userPassword = userDetails.password.trim()
        const checkPassword = await bcrypt.compare(currentPasswordT,userPassword);
        const isPasswordValid = userFunc.validatePassword(newPassword)
        if(newPassword === renewPassword){
            if (checkPassword) {
                if(isPasswordValid){
                    newPassword = await bcrypt.hash(newPassword, saltRounds)
                    const updated = await UserModel.updateOne({ _id: userId }, { $set: { password: newPassword } });
                    if (updated) {
                        msgNewPass = true;
                        res.render("user/user-profile", { successMessage, userDetails,isPasswordValid });
                    } else {
                        errNewPass = true;
                        res.render("user/user-profile", { errNewPass, userDetails,isPasswordValid });
                    }
                }
            } else {
                  errMatchPass = true
                  res.render("user/user-profile", { wrongPassword, userDetails,isPasswordValid })
            }
        }else{
            const noMatches = "Passwords deos'nt match."
            res.render("user/user-profile", { noMatches, userDetails,isPasswordValid })
        }
    } catch (error) {
        errOccurred = true
        res.render("user/user-profile", { errOccurred, userDetails })
    }
}





const verifyOTP = async (req, res) => {
    // try {
        console.log('triggered')
        const otp = req.body.otp;
        const intOtp = parseInt(otp);
        console.log(typeof session.otp,'1')
        console.log(typeof otp,'userotp')
        console.log(session.otp,'1')
        console.log(otp,'userotp')
        // Compare the OTPs
        if (intOtp == session.otp) {
            console.log('reached inside')
            // Assuming session.userData is already set and contains the necessary user information
            const data = session.userData;
            console.log(data)
            // Create the user in the database
            const user = await UserModel.create(data);
            req.session.user = user;
            console.log(req.session.user, 'req.session.user');
            console.log(user, "user");

            // Clear the OTP from the session
            req.session.otp = null;

            // Redirect the user to the home page or another appropriate page
            res.json({ success: true});
        } else {
            // If the OTPs don't match, send a failure response
            res.json({ success: false, message: 'OTP verification failed. Please try again.' });
        }
    // } catch (error) {
    //     console.error('Error verifying OTP:', error);
    //     // Handle the error appropriately, e.g., by sending a response with an error message
    //     res.status(500).json({ success: false, message: 'An error occurred while verifying the OTP. Please try again.' });
    // }
};



const emailVerify = (req,res)=>{
    try{
        res.render("user/email-verify");
    }catch(error){
        res.status(500).json({error: "Internal server Error"});
    }
}

module.exports = {
    signupView,
    signupUser,
    loginView,
    loginUser,
    otpView,
    otpVerification,
    otpViewPass,
    otpVerificationPassword,
    emailVerify,
    emailVerifyOtp,
    createNewPasswrod,
    changePassword,
    verifyOTP,
    userLogout
};
