const CartModel = require("../../../models/Cart");
const CouponModel = require("../../../models/Coupon");
const ProductModel = require("../../../models/Product");
const userHelper = require("../../../utils/userHelpers");

const cartView = async(req,res) =>{
   try{
        const stockLimit = req.query.stockLimit;
        const userId = req.session.user._id;
        const cartExists = await CartModel.findOne({userId:userId});
        let cartItems;

        if(cartExists){

            cartItems = await userHelper.getProducts(userId);
            console.log(cartItems,'cartItems')
            let total = await userHelper.getTotalAmount(userId);       
            total = total[0]?total[0].total:0;
            console.log('cartItems',cartItems)
            const cartCount = await userHelper.getCartCount(userId)
            res.render("user/cart",{cartItems,total,stockLimit,cartCount});
        }else{
            console.log('reached else')
            const data = {
                userId :userId,
                cart:[]
            };
            cartItems = await CartModel.create(data);
            console.log('cartItems',cartItems)
            const cartCount = await userHelper.getCartCount(userId)
            res.render("user/cart",{cartItems,stockLimit,cartCount});
        }
        console.log(cartItems,'cartitems')
 //pass tthe cart Object to the render function
   
    }catch(err){
        console.error(err)
        res.status(500).render("user/error-handling");
   }
}





const  addToCart = async(req,res)=>{
    try{
        const userId = req.session.user._id;
        console.log("add to cart start.")
        const productId = req.query.id;
        console.log(productId);
        const products = await ProductModel.aggregate([{$match:{listStatus:true,deleteStatus:false}}]).limit(4);
        const singleProduct = await ProductModel.findOne({_id:req.query.id});
        const quantity = parseInt(req.query.count, 10)
        let size = req.query.size;
        console.log(quantity,'///////////////////////////////////////')
        const product = await ProductModel.findOne({_id:productId});
        console.log(product)
        if(product.offerPrice > 0){
            var price = product.offerPrice
        }else{
            var price = product.price
        }
        const data = {
            productId:productId,
            count:quantity,
            size:size,
            price:price
        };
        console.log(data,'data crt')

        const cart = await CartModel.findOne({userId: userId});
        if(cart){
            
            const productExists = cart.cart.some(item=> item.productId === productId && item.size === size);
            if(productExists){
                const productDetails = await ProductModel.findOne({_id:productId});

                //declaring count before using it.
                let count = count
                for(const item of cart.cart){///changed cart to cart.cart
                    if(item.productId === productId && item.size === size){
                        console.log("Match is found.")
                        count = item.count;
                        break; //breaking once the match is found
                    }
                }
                if(productDetails.sizeStock[size].stock > count){
                    console.log('stock>count')
                    console.log(quantity)
                    await CartModel.updateOne(
                        {userId: userId,'cart.productId': productId, 'cart.size':size},
                        {$inc:{'cart.$.count':quantity},}
                    );

                    const addedToCart = true
                    const cartCount = await userHelper.getCartCount(userId)
                    return res.render("user/product-details",{singleProduct,products,cartCount,addedToCart}); 
                }else{
                    const cartCount = await userHelper.getCartCount(userId)
                    let stockLimit = true;
                    return res.render("user/product-details",{singleProduct,products,cartCount,stockLimit});
                }
            }else{
                const cartCount = await userHelper.getCartCount(userId)
                await CartModel.updateOne({userId:userId},{$push:{cart:{productId,count:quantity,size}}})
                const addedToCart = true
                return res.render("user/product-details",{singleProduct,products,cartCount,addedToCart});

    
            }
        }else{
            console.log("reached cart else.")
            const cartData = {
                userId: userId,
                cart : [data]
            };
            console.log(cartData)
            const newCart = await CartModel.create(cartData);
            if(newCart){ 
                console.log("if new cart")
                const addedToCart = true
                return res.render("user/product-details",{singleProduct,products,cartCount,addedToCart});

            }else{
                console.log("reached newcart else error.")
                res.status(404).render("user/error-handling");
            }
        }
    }catch(err){
        console.log(err)
        res.status(500).render("user/error-handling")
    }
}



const deleteCartItem = async(req,res)=>{
    try{
        const productId = req.query.id
        const size = req.query.size 
        const userId =  req.session.user._id;
        const cart = await CartModel.updateOne({userId:userId},{$pull:{'cart':{productId:productId,size:size}}})

        res.redirect("/cart")
           } catch (error) {
        console.error("Error in changeProductQuantity:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
}


const changeProductQuantity = async (req, res) => {
    try {
        console.log('change product function');
        let { cart, product, size, count, quantity } = req.body;
        count = parseInt(count);
        quantity = parseInt(quantity);
        const requestedSize = size;
        let response;

        if (count === -1 && quantity === 1) {
            console.log("quantity below 1");
            const removeProduct = await CartModel.updateOne({_id: cart}, {$pull: {"cart": {productId: product, size: size}}});

            if (removeProduct) {
                console.log("product removed");
                response = {removeProduct: true};
            } else {
                response = {removeProduct: false};
            }
        } else {
            const productDetails = await ProductModel.findOne({_id: product});

            if (productDetails.sizeStock[requestedSize].stock >= quantity + count) {
                const updated = await CartModel.updateOne({_id: cart, 'cart.productId': product, 'cart.size': requestedSize}, {$inc: {'cart.$.count': count}});

                if (updated) {
                    const userId = req.session.user._id;
                    let total = await userHelper.getTotalAmount(userId);
                    response = {status: true, total};
                } else {
                    response = {status: false};
                }
            } else {
                response = {stockLimit: true};
            }
        }
        res.json(response);
    } catch (error) {
        console.error("Error in changeProductQuantity:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
};




const couponValidate = async (req,res)=>{
    try{
        let response
        const couponCode = req.body.couponCode; // code from user side
        const totalAmount = req.body.totalAmount 
        const userId = req.session.user._id;
        const couponValidate = await CouponModel.findOne({couponCode:couponCode}); //checking if coupon code exists
        if(couponValidate){
            const usedCoupon = await OrderModel.findOne({userId:userId,couponCode:couponCode}) //checking if coupon is already userd by coupon
            if(usedCoupon){
                //if the coupon already exists. It will not be used
                response = {status:false} 
            }else{
                //if coupon havent used before by user
                const couponDiscount = (totalAmount * couponValidate.offerPercentage)/100 //finding discount price
                const discountTotal = (totalAmount-couponDiscount); //creating discounted price
                response = {status:true,discountTotal}
            }
        }else{
            response={status:false};
        }
        res.json(response);
    }catch(error){
        res.status(500).json({error: "Internal server Error"});
    }   
}
module.exports = {
    cartView,
    addToCart,
    deleteCartItem,
    changeProductQuantity,
    couponValidate
};
