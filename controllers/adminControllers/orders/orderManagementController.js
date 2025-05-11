const OrderModel = require('../../../models/Order')
const UserModel = require("../../../models/User");
const formatDate = require("../../../utils/dateGenerator");
const adminFunc = require("../../../utils/adminHelpers");




 
const searchPendingOrders = async (req,res)=>{
    console.log('reached')
    let payload = req.body.payload.trim();
    console.log(payload)
    let search = await OrderModel.find({             
        products: {
            $elemMatch: {
                status: { $in: ['pending', 'shipped'] }
            }
        },"products.name": { $regex: new RegExp('^' + payload + '.*', 'i') } }).exec();   
    console.log(search,'search')
    console.log(typeof search,search)
    res.send({payload: search});
}

const searchDeliveredOrders = async (req,res)=>{
    console.log('reached')
    let payload = req.body.payload.trim();
    console.log(payload)
    let search = await OrderModel.find({             
        products: {
            $elemMatch: {
                status: "delivered"
            }
        },"products.name": { $regex: new RegExp('^' + payload + '.*', 'i') } }).exec();   
    console.log(search,'search')
    console.log(typeof search,search)
    res.send({payload: search});
}

const searchCancelledOrders = async(req,res)=>{
    console.log('reached')
    let payload = req.body.payload.trim();
    console.log(payload)
    let search = await OrderModel.find({             
        products: {
            $elemMatch: {
                status: "cancelled"
            }
        },"products.name": { $regex: new RegExp('^' + payload + '.*', 'i') } }).exec();   
    console.log(search,'search')
    console.log(typeof search,search)
    res.send({payload: search});
}



const orderDelivered = async(req,res)=>{
    try{
        const pageNum =  req.query.page;
        const perPage = 6 ;
        let docCount
        let pages
        const documents = await OrderModel.countDocuments({
            products: {
                $elemMatch: {
                    status: { $in: ['pending', 'shipped'] }
                }
            }    
        });

        const orderId = req.query.id;
        const productId = req.query.pro_id
        console.log(orderId);
        const product = await OrderModel.findOne({_id:orderId})
        if(product){
          console.log('order found',product)
        //   const deliveredOrder = await OrderModel.updateOne({_id:pendingOrderId},{$set:{status:'delivered'}});
            const deliveredOrder = await OrderModel.updateOne(
                {
                    _id:orderId,  'products._id':productId
                },
                { 
                    $set: { 'products.$.status': 'delivered' }
                });
    
            if(deliveredOrder){ 
                console.log('order Delivered')
                // const pendingOrders = await OrderModel.find({status:{$in:['pending','shipped']}});
                const pendingOrders = await OrderModel.find({
                    products: {
                        $elemMatch: {
                            status: { $in: ['pending', 'shipped'] }
                        }
                    }
                }).skip((pageNum - 1) * perPage).limit(perPage);
                docCount = documents
                pages = Math.ceil(docCount / perPage)
        
                let countPages = []
                for (let i = 0; i < pages; i++) {
        
                    countPages[i] = i + 1
                }
                
                res.render("admin/pending-orders",{pendingOrders,countPages});
            }
        }else{
            console.log('order not found')
        }
    }catch(error){
        res.status(500).render("user/error-handling")
    }
}


const orderShipped = async(req,res)=>{
    try{
        const pageNum =  req.query.page;
        const perPage = 6 ;
        let docCount
        let pages
        const orderId = req.query.id;
        const productId = req.query.pro_id;
        const documents = await OrderModel.countDocuments({
            products: {
                $elemMatch: {
                    status: { $in: ['pending', 'shipped'] }
                }
            }    
        });

        console.log(orderId);
        const order = await OrderModel.findOne({_id:orderId})
        if(order){
            console.log('order found',order);
            const shippedOrders = await OrderModel.updateOne({_id:orderId,'products._id':productId},{ $set: { 'products.$.status': 'shipped' }});
            if(shippedOrders){ 
                console.log('order has been shipped');
                // const pendingOrders = await OrderModel.find({status:{$in:['pending','shipped']}});
                const pendingOrders = await OrderModel.find({
                    products: {
                        $elemMatch: {
                            status: { $in: ['pending', 'shipped'] }
                        }
                    }
                }).skip((pageNum - 1) * perPage).limit(perPage);

                docCount = documents
                pages = Math.ceil(docCount / perPage)
        
                let countPages = []
                for (let i = 0; i < pages; i++) {
        
                    countPages[i] = i + 1
                }


                res.render("admin/pending-orders",{pendingOrders,countPages});
            }
        }
    }catch(error){
        res.status(500).render("user/error-handling")
    }
}


const pendingOrdersView = async(req,res)=>{
    try{
        const pageNum =  req.query.page;
        const perPage = 6 ;
        let docCount
        let pages
        
        const documents = await OrderModel.countDocuments({
            products: {
                $elemMatch: {
                    status: { $in: ['pending', 'shipped'] }
                }
            }    
        });

        const pendingOrders = await OrderModel.find({
            products: {
                $elemMatch: {
                    status: { $in: ['pending', 'shipped'] }
                }
            }
        }).skip((pageNum - 1) * perPage).limit(perPage);


        docCount = documents
        pages = Math.ceil(docCount / perPage)

        let countPages = []
        for (let i = 0; i < pages; i++) {

            countPages[i] = i + 1
        }


        res.render("admin/pending-orders",{pendingOrders,countPages});
    }catch(error){
        res.status(500).render("user/error-handling") 
    }
}


const deliveredOrdersView = async(req,res)=>{
    try{
        const pageNum =  req.query.page;
        const perPage = 6 ;
        let docCount
        let pages

        const deliveredOrders = await OrderModel.find({status:"delivered"}).skip((pageNum - 1) * perPage).limit(perPage)
        const documents = await OrderModel.countDocuments({status:"delivered"});
        docCount = documents
        pages = Math.ceil(docCount / perPage)

        let countPages = []
        for (let i = 0; i < pages; i++) {
            countPages[i] = i + 1
        }

        res.render("admin/delivered-orders",{deliveredOrders,countPages});
    }catch(error){
        res.status(500).render("user/error-handling") 
    }
}


const cancelledOrdersView = async(req,res)=>{
    try{
        const pageNum =  req.query.page;
        const perPage = 6 ;
        let docCount
        let pages
        const cancelledOrders = await OrderModel.find({status: "cancelled"}).skip((pageNum - 1) * perPage).limit(perPage);
        const documents = await OrderModel.countDocuments({status:"cancelled"});
        docCount = documents
        pages = Math.ceil(docCount / perPage)

        let countPages = []
        for (let i = 0; i < pages; i++) {
            countPages[i] = i + 1
        }
        res.render("admin/cancelled-orders",{cancelledOrders,countPages});
    }catch(error){
        res.status(500).render("user/error-handling") 
    }
}


const orderDetailView = async(req,res)=>{
    try{
        const orderId = req.query.id;
        const orderDetails = await OrderModel.findById({_id:orderId});
        res.render("admin/order-details",{orderDetails})
    }catch(error){
        res.status(500).render("user/error-handling")
    }
}



const returnPending =  async (req,res)=>{
    try{
        const pageNum =  req.query.page;
        const perPage = 6
        let docCount
        let pages
        const returnPending = await OrderModel.find({// matching only return defective and non defective.
            products: {
                $elemMatch: {
                    status: { $in: ['returnNonDefective', 'returnDefective'] }
                }
            }
        }).skip((pageNum - 1) * perPage).limit(perPage)
        const documents = await OrderModel.countDocuments({// matching only return defective and non defective.
            products: {
                $elemMatch: {
                    status: { $in: ['returnNonDefective', 'returnDefective'] }
                }
            }
        });

        docCount = documents
        pages = Math.ceil(docCount / perPage)

        let countPages = []
        for (let i = 0; i < pages; i++) {
            countPages[i] = i + 1
        }

        res.render("admin/return-pending",{returnPending,countPages})
    }catch(error){
        res.status(500).render("user/error-handling")
    }
}


const returnDefective = async(req,res)=>{
    try{
        const pageNum =  req.query.page;
        const perPage = 6
        let docCount
        let pages
        // const returnDefective = await OrderModel.find({status:'returnAcceptDef'}).skip((pageNum - 1) * perPage).limit(perPage)
        const returnDefective = await OrderModel.find({
            products: {
                $elemMatch: {
                    status:'returnAcceptDef'
                }
            }
        }).skip((pageNum - 1) * perPage).limit(perPage);
        const documents = await OrderModel.countDocuments({
            products: {
                $elemMatch: {
                    status:'returnAcceptDef'
                }
            }
        })
        docCount = documents
        pages = Math.ceil(docCount / perPage)

        let countPages = []
        for (let i = 0; i < pages; i++) {
            countPages[i] = i + 1
        }
        res.render("admin/return-defective",{returnDefective,countPages})
    }catch(error){
        res.status(500).render("user/error-handling") 
    }
}


const returnNonDefective = async(req,res)=>{
    try{
        const pageNum =  req.query.page;
        const perPage = 6
        let docCount
        let pages
        const returnAcceptNonDef = await OrderModel.find({status:'returnAcceptNonDef'}).skip((pageNum - 1) * perPage).limit(perPage)
        const documents = await OrderModel.countDocuments({status:'returnAcceptNonDef'})
        docCount = documents
        let countPages = []
        for (let i = 0; i < pages; i++) {
            countPages[i] = i + 1
        }
        res.render("admin/return-non-defective",{returnAcceptNonDef,countPages});
    }catch(error){
        res.status(500).render("user/error-handling") 
    }
}


const orderCancel = async(req,res)=>{//// I have made some terribl changes here 
    try{
        
        const orderId = req.query.orderId;
        const productId = req.query.productId;
        
        console.log(orderId,'orderId')
        console.log(productId,'proudctId')

        const defective = await OrderModel.find({
            products: {
                $elemMatch: {
                    status:'returnDefective'
                }
            }
        });
        if(defective){
            // const updated = await OrderModel.updateOne({orderId:orderId},{$set:{status:'returnAcceptDef'}})
            const updated = await OrderModel.updateOne(
                {
                    _id:orderId,  'products._id':productId
                },
                { 
                    $set: { 'products.$.status': 'returnAcceptDef' }
                });
        }else{
            // updating  non defenctive products
            await OrderModel.updateOne({orderId:orderId},{$set:{status:'returnAcceptNonDef'}})
        }
    }catch(error){
        res.status(500).render("user/error-handling")
    }
}//// I have made some terribl changes here 


const returnAccept = async (req, res) => {
    // try {
        const pageNum =  req.query.page;
        const perPage = 6 ;
        let docCount
        let pages

        const {orderId,productId,status} = req.query;
        console.log(productId,'productId');
        console.log(orderId,'orderId');
        console.log(status,'status')
        const orderDetails = await OrderModel.findOne({_id:orderId});
        const currentDate = new Date();
        const formattedDate = formatDate(currentDate);

        
        // Access the price of the first matching product
        const price = await adminFunc.getOrderPrice(orderId,productId)
        console.log(price,'price')


        if(status === 'returnDefective'){
            console.log('defective order ')
            // updating order status here to return accept defective product (returnAcceptDef) 
            // const check = await OrderModel.updateOne(
            //     {
            //         _id:orderId,  'products._id':productId
            //     },
            //     { 
            //         $set: { 'products.$.status': 'returnAcceptDef' }
            //     });
            const check = await OrderModel.updateOne(
                {
                    _id:orderId,'products._id':productId
                },
                {
                     $set: { 'products.$.status': 'returnAcceptDef' }
                    });
            console.log(check, 'update?')
        }else{
            console.log('order nondefective')
          // updating order status here ot return accept non-defective product (returnAcceptNonDef)
          const check = await OrderModel.updateOne(
            {
                _id:orderId,  'products._id':productId
            },
            { 
                $set: { 'products.$.status': 'returnAcceptNonDef' }
            });
            console.log(check, 'update?')
        }
        const transaction = {
            transaction:"Credited",
            amount:price,
            reason:"Return Refund",
            date:formattedDate,
            orderId:orderDetails.orderId
        }
        console.log(price,'price')
        const walletUpdate = await UserModel.updateOne({ _id: orderDetails.userId }, { $inc: { wallet: orderDetails.amount } }); // Here I'm adding back the amount to the user's wallet.
        await UserModel.updateOne({_id:orderDetails.userId},{$push:{walletHistory:transaction}}) // here I'm journaling transaction history to the user model



        const documents = await OrderModel.countDocuments({
            products: {
                $elemMatch: {
                    status: { $in: ['returnNonDefective', 'returnDefective'] }
                }
            }
        })

        const returnPending = await OrderModel.find({
            products: {
                $elemMatch: {
                    status: { $in: ['returnNonDefective', 'returnDefective'] }
                }
            }
        }).skip((pageNum - 1) * perPage).limit(perPage);
        docCount = documents
        pages = Math.ceil(docCount / perPage)

        let countPages = []
        for (let i = 0; i < pages; i++) {

            countPages[i] = i + 1
        }


        // Check the result of the update
        if (walletUpdate) {
          console.log(walletUpdate)
            res.render("admin/return-pending",{returnPending});
        } else {
            res.render("admin/return-pending",{returnPending});
        }
    // } catch (err) {
    //     console.error(err);
    //     res.status(500).render("user/error-handling");
    // }
}

module.exports = {
    returnPending,
    returnDefective,
    returnNonDefective,
    pendingOrdersView,
    deliveredOrdersView,
    cancelledOrdersView,
    orderDelivered,
    orderShipped,
    orderDetailView,
    orderCancel,
    returnAccept,
    searchPendingOrders,
    searchDeliveredOrders,
    searchCancelledOrders
}  