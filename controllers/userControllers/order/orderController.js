const OrderModel = require("../../../models/Order");
const Razorpay = require("razorpay");
const generateRandomOrderId = require("../../../utils/orderIdGenerator");
const formatDate = require("../../../utils/dateGenerator");
const moment = require("moment");


const checkout = async(req,res)=>{
    try{
        const userId = req.session.user._id;
        const userDetails = await UserModel.findById({_id:userId})
        const newAddress = await AddressModel.findOne({userId:userId})
        const coupons = await CouponModel.find();
        const cartItems = await userFunc.getProducts(userId);
        let total = await userFunc.getTotalAmount(userId)
        total = total[0] ? total[0].total : 0;

        res.render("user/checkout",{newAddress,userDetails,total,coupons,cartItems});
    } catch (error) {
        console.error("Error in changeProductQuantity:", error);
        res.status(500).json({error: "Internal Server Error"});
    } 
}



 const placeOrder = async(req,res)=>{
    try{ 
        let response; 
        const userId = req.session.user._id;
        const selectedAddressId = req.body.selectedAddressId; 
        const randomOrderId = generateRandomOrderId();
        const currentDate = new Date(); 
        const formattedDate = formatDate(currentDate);
        const finalAmount = req.body.finalAmount;

        let userAddress = await  AddressModel.findOne({userId: userId});

        console.log('userAddress',userAddress) 
        const address = userAddress.address.find(address => address._id.equals(selectedAddressId));

        const cartItems = await userFunc.getProducts(userId);

        // const products = cartItems.map(({ product, count, size }) => ({
        //     productId: product._id,
        //     name: product.name,
        //     price: product.price,
        //     count: count,
        //     size: size,     
        //     status: 'pending'
        // }));

        const products = cartItems.flatMap(({ product, count, size }) => {
            // Create an array of objects, each representing a single instance of the product
            const productInstances = Array.from({ length: count }, () => ({
                productId: product._id,
                name: product.name,
                price: product.price,
                size: size,
                quantity: 1, // Each instance has a quantity of 1
                status: 'pending'
            }));
            return productInstances;
        });

        console.log("==========",products)
        const data = {
            "userId":userId,
            "orderId":randomOrderId,
            "address":address,
            "date":formattedDate,
            products:products,
            "amount":finalAmount,
            "paymentMethod":'COD',   
            "status":"pending"
        }
        const transaction = {
            transaction:'debited',
            amount:finalAmount,
            orderId:randomOrderId,
            date:formattedDate
        }
        const order = await OrderModel.create(data)
        if(order){
            if(req.body.paymentMethod == 'Wallet'){
                let stockUpdate = userFunc.stockQuantityUpdate();
                if(stockUpdate){
                    await UserModel.updateOne({_id:userId},{$inc:{wallet: -finalAmount}})
                    await UserModel.updateOne({_id:userId},{$push:{walletHistory:transaction}})
                    const pendingOrders = await OrderModel.findOne({orderId:order.orderId})
                    const updateDetails = await OrderModel.updateOne({orderId:order.orderId},{$set:{paymentMethod: 'Wallet'}});
                
                    if(updateDetails){
                        response ={status:true,pendingOrders}
                        res.json(response);
                    }else{
                        response = {status:false}
                        res.json(response);
                    }
                }
            }else if(req.body.paymentMethod == 'Online'){
                const order = await generateRazorpay(randomOrderId,finalAmount);

                response = {status:true,order}
                console.log(response)
                res.json(response);
            }else{
                let stockUpdate = userFunc.stockQuantityUpdate();
                if(stockUpdate){
                    const pendingOrders = await OrderModel.findOne({orderId:order.orderId});
                    console.log("pending order//:",pendingOrders)
                    const deleteCart = await CartModel.deleteMany({});
                    if(deleteCart){
                        console.log('cart deleted');
                        response = {status:true,pendingOrders}
                        res.json(response);
                    }
                }
            }
        }
    }catch(error){
        console.error("", error);
        res.status(500).json({error: "Internal Server Error"});
    }
}



const verifyPayment = async (req,res)=>{
    try{
        const verificationSuccess = await userFunc.paymentVarification(req.body);
        let response;
        console.log(verificationSuccess)
        if(verificationSuccess){
            const success = await userFunc.changePaymentStatus(req.body['order[receipt]'])
            if(success){
                const onlineDetails  = await OrderModel.findOne({ orderId: req.body['order[receipt]'] })
                const stockUpdate = await userFunc.stockQuantityUpdate()
                if(stockUpdate){
                    console.log('stock updated')
                    response = {status:true,onlineDetails}
                    res.json(response);
                }
            }else{
                console.log('Not success.')
                res.status(404).render("user/error-handling")
            }
    
        }
    }catch(error){
        res.status(500).json({error: "Internal Server Error"});
    }
}



const ordersView =  async(req,res) =>{
    try{
        const userId = req.session.user._id
        const pendingOrders = await OrderModel.find({userId:userId}).sort({$natural: -1});
        const cartCount = await userFunc.getCartCount(userId)
        res.render('user/orders',{pendingOrders,cartCount});
        
    } catch (error) {
        console.error("Error in changeProductQuantity:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
}


const orderDetailView = async(req,res)=>{
    try{
        const orderId = req.query.id;
        const orderDetails = await OrderModel.findById({_id:orderId});
        if(!orderDetails){
          return res.status(404).json({message:'Order not found.'});
        }
        const today = new Date();
        const formattedDeliveryDate = moment(orderDetails.date,'DD/MM/YYYY').format('YYYY-MM-DD');
        const deliveryDate = new Date(formattedDeliveryDate);
        if(isNaN(deliveryDate.getTime())){
          return res.status(404).json({message:"invalid delivery date."})
        }
        const daysDifference = Math.floor((today-deliveryDate)/(1000*60*60*24)) + 1;
        let orderReturn = false;
        if(daysDifference<=7){
            orderReturn = true;
        }
        res.render("user/order-detail-view",{orderDetails,orderReturn});
    }catch(error){
        console.error(error)
        res.status(500).json({error: "Internal Server Error"});
    }
}




const transactionOrderDetailView = async(req,res)=>{
    try{
        const orderId = req.query.id;
        const orderDetails = await OrderModel.findOne({orderId:orderId});
        const cartCount = await userFunc.getCartCount(userId);

        if(!orderDetails){
          return res.ststus(404).json({message:'Order not found.'});
        }
        const today = new Date();
        const formattedDeliveryDate = moment(orderDetails.date,'DD/MM/YYYY').format('YYYY-MM-DD');
        const deliveryDate = new Date(formattedDeliveryDate);
    
        if(isNaN(deliveryDate.getTime())){
          return res.status(404).json({message:"invalid delivery date."})
        }
    
        const daysDifference = Math.floor((today-deliveryDate)/(1000*60*60*24)) + 1;
        console.log(daysDifference)
        let orderReturn = false;
    
        if(daysDifference<=7){
          orderReturn = true;
        }
        res.render("user/order-detail-view",{orderDetails,orderReturn,cartCount});
    }catch(error){
        console.error(error);
        res.status(500).json({error: "Internal Server Error"});
    }

}




const cancelUserOrder = async(req,res)=>{
    try{
        const userId = req.session.user._id;
        const orderId = req.query.id; // this is Id of order doc
        const productId = req.query.pro_Id;// this is the Id of product Array in the Order
        const cartCount = await userFunc.getCartCount(userId)
        console.log(orderId,'orderId')
        console.log(productId,'productId');

        console.log(orderId,'orderId');
        console.log(productId,'productId');
        const orderDetails = await OrderModel.findById({_id: orderId});
        console.log(orderDetails,'orderDetails')

        const currentDate = new Date();
        const formattedDate = formatDate(currentDate);
        if(orderDetails.paymentMethod === 'Online'){
            const amount = orderDetails.amount
            const transaction = {// This is for wallet transaction history.
                transaction:'Credited',
                amount:amount,
                orderId:orderDetails.orderId,
                date:formattedDate
            }
             // Refunding money to the user's wallet.
            await UserModel.updateOne({_id:userId},{$inc:{wallet:amount}}); 
            //creating a transaction history of the wallet. Here I'm creating credit transaction history.
            await UserModel.updateOne({_id:userId},{$push:{walletHistory:transaction}})
        }

        console.log(updatedOrder,'updateorder')
    
            for(let product of orderDetails.products){
                console.log(product.productId,'productIDdddd')
                const productDetails = await ProductModel.findById(product.productId);
                console.log(productDetails, ' product detailssssssss')
                if(productDetails && productDetails.sizeStock[product.size].stock >= product.count){
                    //increasing the stock count for the specific size in the product model
                    const updatedStock = productDetails.sizeStock[product.size].stock+product.count;
                    productDetails.sizeStock[product.size].stock = updatedStock;
                    // save the updated product model
                    await productDetails.save()
                }
            }
            //updateing the orderModel
            const success = await OrderModel.updateOne(
                { _id: orderId, 'products._id': productId }, // Filter
                { $set: { 'products.$.status': 'cancelled' } } // Update
              );
            if(success){
                res.redirect("/orders",{cartCount});
            }     
    } catch (error) {
        console.error("Error in canceling order:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
}







const returnUserOrder = async(req,res)=>{
    try{
        const userId = req.session.user._id;
        const orderId = req.query.orderId;
        const productId =req.query.pro_id;    
        const returnType = req.query.returnType;
        const cartCount = await userFunc.getCartCount(userId)
        console.log(orderId,'orderId')
        console.log(productId,'productId');

        if(returnType === '1'){// if return type is non- defective
            const orderDetails = await OrderModel.findById({_id:orderId});
            console.log(productId,'productId')
            console.log("started return type 1 ")
            for(let product of orderDetails.products){
                const productDetails = await ProductModel.findById(product.productId);
                console.log(productDetails,'product details')
                if(productDetails && productDetails.sizeStock[product.size].stock >= product.count){
                    // increasing the stock count for that perticular size.
                    const updateStock = productDetails.sizeStock[product.size].stock + product.count;
                    console.log("updateStock",updateStock);
                    productDetails.sizeStock[product.size].stock = updateStock;
                    //saving updated product model
                    await productDetails.save();
                }else{ 
                    console.log("Prouct not found to update")
                    // I will handle insufficient stock scenario  here, eg. notify the user
                }
            }
            // const returnNonDefective = await OrderModel.updateOne({_id:orderId},{$set:{status:"returnNonDefective"}});
            // const returnNonDefective = await OrderModel.updateOne({_id:orderId,'products._id':productId},{ $set: { 'products.$.status': 'returnNonDefective' }});
            const success = await OrderModel.updateOne(
                { _id: orderId, 'products._id': productId }, // Filter
                { $set: { 'products.$.status': 'returnNonDefective' } } // Update
              );
            if(success){
                const orderDetails = await OrderModel.find() 
                res.render("user/orders",{returnSuccess:true,pendingOrders:orderDetails}); 
            }else{
                res.render("user/orders",{returnErr:true});
            }
        }else{ 
            // const returnDefective = await OrderModel.updateOne({_id:orderId},{$set:{status:"returnDefective"}})
            const returnDefective = await OrderModel.updateOne({_id:orderId,'products._id':productId},{ $set: { 'products.$.status': 'returnDefective' }});
            if(returnDefective){
                const orderDetails = await OrderModel.find({userId:userId}) 
                res.render("user/orders",{returnSuccess:true,pendingOrders:orderDetails,cartCount});
            }else{
                res.render("user/orders",{returnErr:true});
            }
        }
    }catch(error){
        res.status(500).json({error: "Internal server Error"});
    }

}



const orderResponseView =  (req,res)=>{
    try{
        res.render('user/order-response')
    }catch(error){
        res.status(500).json({error: "Internal Server Error"});
    }
}

var instance = new Razorpay({
    key_id: 'rzp_test_lc7R4jCpEpM90Q',
    key_secret: 'l23pXte67Ewz57CcDGSNANZd',
});


  


////////////////////////////////////////////////////////////////////////////////////     POST Methods     >>>>>>>>>>>>>>>>





const generateRazorpay = async (randomOrderId, finalAmount) => {
    try {
        const order = await instance.orders.create({
          amount: finalAmount * 100,
          currency: "INR",
          receipt: randomOrderId,
          notes: {
            key1: "value3",
            key2: "value2"
          }
        });
        console.log(order,'order-------------------')
        return order;
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Internal Server Error"});
    }
 };



module.exports = {
    checkout,
    placeOrder,
    verifyPayment,
    ordersView,
    orderDetailView,
    transactionOrderDetailView,
    orderResponseView,
    cancelUserOrder,
    returnUserOrder
};
