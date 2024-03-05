const CartModel = require('../models/Cart');
const OrderModel = require('../models/Order');
const ProductModel = require('../models/Product');
const bcrypt = require("bcryptjs");
const saltRounds = 10;
const AddressModel = require("../models/Address");
const formatDate = require("./dateGenerator");
const UserModel = require("../models/User")

const detailsValidation= (details)=> {
    // Check if all required fields are present
    if (!details.name || !details.email || !details.number || !details.address || !details.state || !details.city || !details.pincode) {
        return { isValid: false, message: "All fields are required." };
    }
    const nameRegex = /^[a-zA-Z]+$/;
    if (!nameRegex.test(details.name)) {
        return "Name must contain only letters.";
    }

    // Name validation: At least 3 characters
    if (details.name.length < 3) {
        return "Name must be at least 3 characters long." ;
    }

    // Email validation: Simple regex check, consider using a more robust method for production
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(details.email)) {
        return "Please enter a valid email address." 
    }

    // Mobile number validation: 10 digits
    if (!/^\d{10}$/.test(details.number)) {
        return "Mobile number must be 10 digits long."
    }

    // Pincode validation: 6 digits
    if (!/^\d{6}$/.test(details.pincode)) {
        return  "Please enter a valid pincode"; 
    }
    // If all checks pass, return true
    return 'done'
}

function validateName(name) {
    try{    
        // Check if the name is empty
        if (!name.trim()) {
            return "Name cannot be empty";
        }

        // Check if the name contains only letters and spaces
        if (!/^[a-zA-Z\s]+$/.test(name)) {
            return "Name can only contain letters and spaces";
        }

        // Check if the name length is within the allowed range
        if (name.length < 3 || name.length > 50) {
            return "Name must be between 3 and 50 characters long";
        }

        // Name is valid
        return "";
    }catch(error){
        console.log("password validation error.")
        return false; // Return false in case of an error
    }
}


function validatePhoneNumber(phoneNumber) {
    try{    
        // Remove whitespace and hyphens from the phone number
        const cleanedPhoneNumber = phoneNumber.replace(/\s|-/g, '');
    
        // Check if the cleaned phone number contains only digits
        if (!/^\d+$/.test(cleanedPhoneNumber)) {
            return "Phone number can only contain digits";
        }
    
        // Check if the length of the phone number is valid (assuming a specific format)
        if (cleanedPhoneNumber.length !== 10) {
            return "Phone number must be 10 digits long";
        }
    
        // Phone number is valid
        return "";
    }catch(error){
        console.log("password validation error.")
        return false; // Return false in case of an error

    }
}

function validateEmail(email) {
    try{
        // Regular expression for validating an email address
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }catch(error){
        console.log("email validation error.")
        return false; // Return false in case of an error

    }

}

const validatePassword = (password)=> {
    try{
        // Define password requirements
        const minLength = 8;
        const uppercaseRegex = /[A-Z]/;
        const lowercaseRegex = /[a-z]/;
        const numberRegex = /[0-9]/;
        const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

        // Check length
        if (password.length < minLength) {
            return "Password must be at least " + minLength + " characters long.";
        }

        // Check for uppercase letters
        if (!uppercaseRegex.test(password)) {
            return "Password must contain at least one uppercase letter.";
        }

        // Check for lowercase letters
        if (!lowercaseRegex.test(password)) {
            return "Password must contain at least one lowercase letter.";
        }

        // Check for numbers
        if (!numberRegex.test(password)) {
            return "Password must contain at least one number.";
        }

        // Check for special characters
        if (!specialCharRegex.test(password)) {
            return "Password must contain at least one special character.";
        }

        // Password meets all requirements
        return "";
    }catch(error){
        console.log("password validation error.")
        return false; // Return false in case of an error

    }
}



const getTotalAmount = async (req,res)=>{
    try{
        userId = req;
        let productId;
        let product;
        const cartDocument = await CartModel.findOne({userId:userId});
        
        if(cartDocument.cart.length !==  0  ){  // if cart is not empty
            productId = cartDocument.cart[0].productId;
            product = await ProductModel.findOne({_id:productId});

            if(product.offerPrice > 0){         // if offer price is greater than zero (not zero);
                    console.log(product.offerPrice, 'offerPrice')
                    const total = await CartModel.aggregate([
                    {
                        $match:{userId: userId}
                    },
                    {
                        $unwind:  '$cart'
                    },
                    {
                        $project:{
                            product: {$toObjectId: '$cart.productId'},
                            count: '$cart.count',
                        }
                    },
                    {
                        $lookup:{
                            from:'products',
                            localField: 'product',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $unwind: '$product'
                    },
                    {
                        $project:{
                            price:'$product.offerPrice',
                            name: '$product.name',
                            quantity: '$count'
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: {$sum: {$multiply: ['$quantity','$price']}}
                        },
                    
                    },
                    {
                        $unwind: '$total'
                    }    
                ])
                return total;
            }else{                                     // if cart is not empty and offer price is 0;
                const total = await CartModel.aggregate([
                    {
                        $match:{userId: userId}
                    },
                    {
                        $unwind:  '$cart'
                    },
                    {
                        $project:{
                            product: {$toObjectId: '$cart.productId'},
                            count: '$cart.count',
                        }
                    },
                    {
                        $lookup:{
                            from:'products',
                            localField: 'product',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $unwind: '$product'
                    },
                    {
                        $project:{
                            price:'$product.price',
                            name: '$product.name',
                            quantity: '$count'
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: {$sum: {$multiply: ['$quantity','$price']}}
                        },
                    },
                    {
                        $unwind: '$total'
                    }    
                ])
                return total
            }

        } else {
            const total = await CartModel.aggregate([
                {
                    $match:{userId: userId}
                },
                {
                    $unwind:  '$cart'
                },
                {
                    $project:{
                        product: {$toObjectId: '$cart.productId'},
                        count: '$cart.count',
                    }
                },
                {
                    $lookup:{
                        from:'products',
                        localField: 'product',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $unwind: '$product'
                },
                {
                    $project:{
                        price:'$product.price',
                        name: '$product.name',
                        quantity: '$count'
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: {$sum: {$multiply: ['$quantity','$price']}}
                    },
                },
                {
                    $unwind: '$total'
                }    
            ])
            return total
        }
    }catch(err){
        console.log(req,userId)

        console.log('total amount error.')
        res.status(500).render("user/error-handling");       
    }
}

const getProducts = async(userId)=>{
    try{
        const cartItems = await CartModel.aggregate([
            {
                $match: {userId: userId}
            },
            {
                $unwind: '$cart'
            },
            {
                $project:
                {
                    product: {$toObjectId:"$cart.productId"},
                    count: '$cart.count',
                    size: "$cart.size"
                },
            },
            {
                $lookup:
                {
                    from: "products",
                    localField: "product",
                    foreignField: "_id",
                    as: 'product'
                }
            },
            {          
                $unwind: '$product'
            }
        ])
        return cartItems
    }catch(error){
        console.log("gets products error.");
        return false; // Return false in case of an error

    }

}

const stockQuantityUpdate = async(req,res)=>{
    try{
        const cartItems = await getProducts(userId);
        const products = cartItems.map(cartItem =>({
            productId: cartItem.product._id,
            count: cartItem.count,
            size: cartItem.size
        }));
        console.log(products,"product___________")
        for(const product of products){
            const existingProduct = await ProductModel.findById(product.productId);
            if(existingProduct){
                console.log('existing product');
                //check if the requested size is available in the existing product
                const requestedSize = product.size;
                if(existingProduct.sizeStock[requestedSize] && existingProduct.sizeStock[requestedSize].stock>=product.count){
                    //updating the stock of the requested size
                    const updatedStock = existingProduct.sizeStock[requestedSize].stock-product.count;

                    //updating the product's sizeStock field
                    existingProduct.sizeStock[requestedSize].size = updatedStock;

                    //save the updated product
                    await existingProduct.save();
                }else{
                    return false
                    // should handle insufficient stock
                }
            }else{
                console.log('not existing')
                return false
                // should handle product not found here
            }
        };
        const cart = await CartModel.updateOne({userId:userId},{$set:{cart:[]}});
        if(cart){
            return true;
        }else{
            return false;
        };
    }catch(error) {
        console.error("Error in changeProductQuantity:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
}



/// this funciton is for update address and manage address.
// const newAddressManagement = async (details,userId)=>{
//     try{
//         const {name,email,number,address, city, state, pincode} = details;
//         const newAddress = {
//             name:name,
//             email:email,
//             number:number,
//             address:address,
//             city:city,
//             state:state,
//             pincode:pincode,
//         }
//         console.log(newAddress)
//         console.log('step1')
//         const addressExists = await AddressModel.findOne({userId:userId})
//         if(addressExists){
//             console.log('account exists')
//             const updateAddress = await AddressModel.updateOne({userId:userId},{$push:{address:newAddress}})
//             if(updateAddress){
//                 return true
//             }
//         }else{
//             console.log("account don't exists")
//             let data={
//                 userId: userId,
//                 address:[newAddress]
//             }
//             console.log(data);
//             const updateAddress = await AddressModel.create(data);
//             if(updateAddress){
//                 return true
//             }else{
//                 return false
//             }
//         }
//     } catch (error) {
//             console.error("Error in changeProductQuantity:", error);
//             return false; // Return false in case of an error
//         }    
// }

const newAddressManagement = async (details, userId) => {
    try {
        // Validate required fields
        const { name, email, number, address, city, state, pincode } = details;
        if (!name || !email || !number || !address || !city || !state || !pincode) {
            console.error("Missing required fields");
            return false;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.error("Invalid email format");
            return false;
        }

        // Optionally, validate phone number format
        // const phoneRegex = /^\d{10}$/; // Example for a 10-digit phone number
        // if (!phoneRegex.test(number)) {
        //     console.error("Invalid phone number format");
        //     return false;
        // }

        const newAddress = {
            name,
            email,
            number,
            address,
            city,
            state,
            pincode,
        };

        const addressExists = await AddressModel.findOne({ userId });
        if (addressExists) {
            console.log('Account exists');
            const updateAddress = await AddressModel.updateOne({ userId }, { $push: { address: newAddress } });
            return updateAddress.nModified > 0;
        } else {
            console.log("Account doesn't exist");
            const data = {
                userId,
                address: [newAddress],
            };
            const updateAddress = await AddressModel.create(data);
            return !!updateAddress;
        }
    } catch (error) {
        console.error("Error in newAddressManagement:", error);
        throw error; // Re-throw the error to be handled by the caller
    }
};


const paymentVarification = (details)=>{
    try{
        const crypto = require('crypto');
        let hmac = crypto.createHmac("sha256", "l23pXte67Ewz57CcDGSNANZd")
    
        hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
        hmac = hmac.digest('hex');
        if(hmac == details['payment[razorpay_signature]']){
            return true;
        }else{
            return false;
        }
    }catch(error){
        return false; // Return false in case of an error

    }
}



const changePaymentStatus = async (orderId) => {
    try {
        console.log(orderId);
        const updatedDetails = await OrderModel.updateOne({ orderId: orderId }, { $set: { paymentMethod: "Online" } });
        // const orderDetails = await OrderModel.findOne({ orderId: orderId });
        if (updatedDetails) {
            return true;
        } else {
            return false;
        }
    }catch (err) {
        console.log('It was an error:', err);
        return false; // Return false in case of an error
    }
};

const generateRandomReferenceId = () => {
    try{
        // Generate a 4-digit random number
        const randomNumber = Math.floor(Math.random() * 10000);

        // Generate 4 random uppercase letters
        const randomLetters = Array.from({ length: 4 }, () => String.fromCharCode(Math.floor(Math.random() * 26) + 65)).join('');

        // Combine the random number and random letters
        const referenceId = `${randomNumber}${randomLetters}`;

        return referenceId;
    }catch(error){
console.log(error)  
return false; // Return false in case of an error

 }

};


const referenceIdApplyOffer = async(referenceId)=>{
    try{
        const findReference = await UserModel.findOne({referenceId:referenceId});
        const currentDate = new Date();
        const formattedDate = formatDate(currentDate);
        if(findReference){
            const applyOffer = await UserModel.updateOne({referenceId:referenceId},{$inc:{wallet:200}});
            if(applyOffer){
                const walletData = {
                    transaction:'credited',
                    amount:200,
                    orderId:'Referral bonus',
                    date:formattedDate
                }
                const walletHistory = await UserModel.updateOne({referenceId:referenceId},{$push:{walletHistory:walletData}})
                if(walletHistory){
                    return true;
                }
                else{
                    console.log('failed updating wallet history.');
                    return false;
                }
            }else{
                console.log("failed applaying offer");
                return false;
            }
    
        }else{
            console.log('failed finding reference order')
            return false;
        }
    }
    catch(error){
        console.error(error)
        return false; // Return false in case of an error

    }
}


const getCartCount= async(userId)=>{
    try {
      // Use the $size operator to get the size of the cart array
      // and $match to filter by the userId
      const result = await CartModel.aggregate([
        { $match: { userId: userId } },
        { $project: { cartCount: { $size: "$cart" } } }
      ]);
  
      // The result will be an array of documents, each with a cartCount field
      // Since we're filtering by userId, we expect at most one document in the result
      // We'll take the first element of the result array and its cartCount field
      const cartCount = result.length >  0 ? result[0].cartCount :  0;
  
      return cartCount;
    } catch (error) {
      console.error('Error getting cart count:', error);
      return  0; // Return  0 if there's an error
    }
}

module.exports = {
    getTotalAmount,
    getProducts,
    stockQuantityUpdate,
    newAddressManagement,
    paymentVarification,
    changePaymentStatus,
    generateRandomReferenceId,
    referenceIdApplyOffer,
    validatePassword,
    validateEmail,
    validateName,
    validatePhoneNumber,
    getCartCount,
    detailsValidation
}