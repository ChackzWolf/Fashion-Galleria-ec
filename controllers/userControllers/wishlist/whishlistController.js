const WishlistModel = require("../../../models/Wishlist");

const wishlistView = async(req,res)=>{
    try{
        const userId = req.session.user._id;
        const wishlist = await WishlistModel.find({userId:userId});
        const productId = wishlist.wishlist.productId;
        console.log('Idddd',productId);
    
        const products = await ProductModel.find({_id:productId});
        console.log(products,'products')
        res.render("user/wishlist",{products});
    }catch(error){
        res.status(500).json({ status: false, error: 'Something went wrong on the server.' });
    }
} 

module.exports = {
    wishlistView
};
