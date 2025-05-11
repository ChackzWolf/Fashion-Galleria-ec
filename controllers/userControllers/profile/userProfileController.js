const UserModel = require("../../../models/User");
const AddressModel = require("../../../models/Address");



const userProfile = async(req,res)=>{
    try{
        console.log('user profile');
        const userId = req.session.user._id
        const userDetails = await UserModel.findById({_id:userId});
        const newAddress = await AddressModel.findOne({userId:userId});
        // if(newAddress){
            const cartCount = await userFunc.getCartCount(userId);
            res.render('user/user-profile',{userDetails,newAddress,cartCount});
        // }
     } catch (error) {
         console.error("Error in changeProductQuantity:", error);
         res.status(500).json({error: "Internal Server Error"});
     }
}



const editProfile = async(req,res)=>{
    try{
        const userId = req.session.user._id;
        const {name,email,number} = req.body;
        console.log(name,'name');
        const isNameValid = userFunc.validateName(name);
        const isEmailValid = userFunc.validateEmail(email);
        const isNumberValid = userFunc.validatePhoneNumber(number);
        const userDetails = await UserModel.findOne({_id:userId});
        const newAddress = await AddressModel.findOne({userId:userId});
        console.log(isNameValid,'is name valid');
        if(isEmailValid){
            console.log('email valid passed')
            if(isNameValid.length > 1 && isNumberValid.length>1){
                console.log(isNameValid.length,isNumberValid.length);
                const update = await UserModel.updateOne({_id:userId},{
                    $set:{
                        name:name,
                        email:email,
                        number:number
                    }
                })
                if(update){
                    const msgProfile = true
                    res.render('user/user-profile',{msgProfile,userDetails,newAddress})
                }else{
                    const errOccured = true
                    res.render('user/user-profile',{errOccured,userDetails,newAddress});
                }
            }else{
                console.log(isNameValid.length,isNumberValid.length, "else");

                res.render('user/user-profile',{isNameValid,userDetails,newAddress,isNumberValid});

            }
        }else{
            const invalidEmail = "Please enter a valid email."
            res.render('user/user-profile',{invalidEmail,userDetails,newAddress});

        }
    } catch (error) {
        res.status(500).json({error: "Internal Server Error. Failed to update profile."});
    }
}



const addNewAddress = async(req,res)=>{
    try{
        const details = req.body;
        const userId = req.session.user._id
        const userDetails = await UserModel.findById({_id:userId});
        const newAddress = await AddressModel.findOne({userId:userId})
        const validation = userFunc.detailsValidation(details);
        if(validation.length<5){
            const updateAddress = await userFunc.newAddressManagement(details,userId);
            console.log('update address 1', updateAddress)
            if(updateAddress){
                const newAddress = await AddressModel.findOne({userId:userId});
                mesgAddressNew = true;
                res.render("user/user-profile",{mesgAddressNew, userDetails, newAddress});
            }else{
                errOccured =true
                res.render("user/user-profile",{errOccured, userDetails,newAddress})
            }   
        }else{
            res.render("user/user-profile",{validation, userDetails,newAddress})
        }
        
    } catch (error) {
        console.error("Error in changeProductQuantity:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
}





const addNewAddressCheckout = async(req,res)=>{
    try{
        const details = req.body;
        const userId = req.session.user._id
        console.log(details,'detailss');
        
        console.log('update address 1', updateAddress)
        const cartItems = await userFunc.getProducts(userId);
        const newAddress = await AddressModel.findOne({userId:userId});
        const userDetails = await UserModel.findById({_id:userId});
        const coupons = await CouponModel.find();  
        const validation = await userFunc.detailsValidation(details);
        let total = await userFunc.getTotalAmount(userId)
        total = total[0] ? total[0].total : 0;

        if(validation.length <5){
            const updateAddress = await userFunc.newAddressManagement(details,userId);
            if(updateAddress){
                mesgAddressNew = true;
                res.render("user/checkout",{mesgAddressNew, userDetails, newAddress,total,coupons,cartItems});
            }else{
                errOccured =true
                res.render("user/checkout",{errOccured, userDetails,newAddress,total,coupons,cartItems})
            }
        }else{
            console.log(validation,'validation')
            res.render("user/checkout",{validation, userDetails, newAddress,total,coupons,cartItems})
        }

    } catch (error) {
        console.error("Error in changeProductQuantity:", error);
        res.status(500).json({error: "Internal Server Error"});
    }      
}



const removeAddress = async (req,res)=>{
    try{
        console.log('start')
        const addressId = req.query.id;
        const userId = req.session.user._id;
        console.log('kkkkkkkkkkkkkkk')
        const cartCount = await userFunc.getCartCount(userId);

        const removeAddress = await AddressModel.updateOne({userId:userId},{$pull:{address:{_id:addressId}}});
        console.log(removeAddress,'kkkkkkkkkkkkkkk')
        if(removeAddress){
            console.log("removed address");
            const mesgAddressRemove = true
            const userDetails = await UserModel.findOne({_id:userId});
            const newAddress = await AddressModel.findOne({userId:userId});
            res.render('user/user-profile',{mesgAddressRemove,userDetails,newAddress,cartCount});
        }else{
            const errOccured = true
            const userDetails = await UserModel.findOne({_id:userId});
            const newAddress = await AddressModel.find({userId:userId})
            res.render("user/user-profile",{errOccured,userDetails,newAddress,cartCount});
        }
    } catch (error) {
        console.error("Error in changeProductQuantity:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
};




const removeAddressCheckout = async (req,res)=>{
    try{
        const userId = req.session.user._id;
        const coupons = await CouponModel.find();  
        let total = await userFunc.getTotalAmount(userId)
        total = total[0] ? total[0].total : 0;
        const addressId = req.query.id;
        const removeAddress = await AddressModel.updateOne({userId:userId},{$pull:{address:{_id:addressId}}});
    if(removeAddress){
        const mesgAddressRemove = true
        const userDetails = await UserModel.findOne({_id:userId});
        const newAddress = await AddressModel.findOne({userId:userId});
        res.render('user/checkout',{mesgAddressRemove,userDetails,newAddress,coupons,total});
    }else{
        const errOccured = true
        const userDetails = await UserModel.findOne({_id:userId});
        const newAddress = await AddressModel.find({userId:userId})
        res.render("user/checkout",{errOccured,userDetails,newAddress,total,coupons});
    }

    } catch (error) {
        console.error("Error in changeProductQuantity:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
}




const defaultAddress = async (req,res)=>{
    try{
        const userId = req.session.user._id;
        const addressId = req.query.id;
        const defaultAddress = await AddressModel.updateOne({'address._id':addressId},{$set:{"address.$.default":true}});
        const cartCount = await userFunc.getCartCount(userId);
        // setting current address to  not default;
        await AddressModel.updateOne({"address.default":true},{$set:{"address.$.default":false}});

        if(defaultAddress){
            const userDetails = await UserModel.findById({_id:userId})
            const newAddress = await AddressModel.findOne({userId:userId})
            res.render('user/user-profile',{userDetails,newAddress,cartCount})
        }
        else{
            const errOccured = true
            const userDetails = await UserModel.findOne({_id:userId})
            const newAddress = await AddressModel.find({userId:userId})
            res.render("user/user-profile",{userDetails,newAddress,errOccured,cartCount});
        }
    } catch (error) {
        console.error("Error in changeProductQuantity:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
}

module.exports = {
    userProfile,
    addNewAddress,
    addNewAddressCheckout,
    removeAddress,
    removeAddressCheckout,
    defaultAddress,
    editProfile
};
