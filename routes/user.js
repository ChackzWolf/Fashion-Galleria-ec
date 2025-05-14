const express = require("express")
const {userLoginVarify,userLoginChecker,otpSend,userStatusCheck} = require("../middlewares/middlewares");
const userManagementController = require("../controllers/adminControllers/user/userManagementController")
const router = express.Router();

const authController = require('../controllers/userControllers/auth/authController');
const cartController = require('../controllers/userControllers/cart/cartController');
const cmsController = require('../controllers/userControllers/cms/cmsController');
const orderController = require('../controllers/userControllers/order/orderController');
const profileController = require('../controllers/userControllers/profile/userProfileController');
const reportController = require('../controllers/userControllers/report/reportController');
const walletController = require('../controllers/userControllers/wallet/walletController');
const withlistController = require('../controllers/userControllers/wishlist/whishlistController');
const productController = require('../controllers/userControllers/product/productController');


//________________Get methods

// index page
router.get("/",userStatusCheck,cmsController.indexView);

// user logs
router.get("/login",userLoginChecker,authController.loginView);
router.get("/signup",userLoginChecker,authController.signupView);
router.get("/otp",authController.otpView);
router.get("/userLogout",userLoginVarify,authController.userLogout);


// products page
router.get("/shop",userStatusCheck,productController.shopView);
router.get("/product-details",userStatusCheck,productController.productDetailsView);
router.get("/search", productController.search);


router.get("/searchUser", userManagementController.searchUser);

//cart
router.get("/cart",userLoginVarify,userStatusCheck,cartController.cartView);
router.get("/addToCart",userLoginVarify,cartController.addToCart);
router.get("/delete-cart-item",userStatusCheck,userLoginVarify,cartController.deleteCartItem);

//check-out
router.get("/checkout",userStatusCheck,userLoginVarify,orderController.checkout);
router.get("/remove-new-address-checkout",userLoginVarify,userStatusCheck,profileController.removeAddressCheckout);
router.get("/order-response",userStatusCheck,userLoginVarify,orderController.orderResponseView);

//user profile
router.get("/user-profile",userStatusCheck,userLoginVarify, profileController.userProfile);
router.get("/default-address",userLoginVarify,userStatusCheck, profileController.defaultAddress);
router.get("/remove-new-address-user",userStatusCheck,userLoginVarify, profileController.removeAddress);
router.get('/email-verify',authController.emailVerify);
router.get("/wallet-history",userStatusCheck,userLoginVarify,walletController.walletHistory);
router.get("/transaction-order-details-view",userStatusCheck,userLoginVarify,orderController.transactionOrderDetailView);

//order management
router.get("/orders",userLoginVarify,userStatusCheck,orderController.ordersView);
router.get("/order-detail-view",userStatusCheck,userLoginVarify,orderController.orderDetailView);
router.get("/cancel-user-order",userStatusCheck,userLoginVarify,orderController.cancelUserOrder);
router.get("/return-user-order",userStatusCheck,userLoginVarify,orderController.returnUserOrder);
router.get("/otp-pass",otpSend,authController.otpViewPass);

//reports
router.get("/report",reportController.loadReport) //should work on it
router.get("/report-generate",reportController.generateReport) // should work on it

// others 
router.get("/blog",userLoginVarify,userStatusCheck,cmsController.blogView);
router.get("/contact",userStatusCheck,cmsController.contactView);


//post methods  ------------------
router.post("/signupUser",authController.signupUser);
router.post("/loginUser",authController.loginUser);
// router.post("/otpVerification",userControllers.otpVerification)
router.post("/change-product-quantity",userLoginVarify,cartController.changeProductQuantity);
router.post("/add-new-address",userLoginVarify,profileController.addNewAddress);
router.post("/edit-profile",userLoginVarify,profileController.editProfile);
router.post("/change-password",userLoginVarify,authController.changePassword);
router.post("/place-order",userLoginVarify,orderController.placeOrder);
router.post("/email-verify-otp",authController.emailVerifyOtp);
router.post("/changePassword",authController.createNewPasswrod); 
router.post("/otp-verify-passwordChange",authController.otpVerificationPassword);
router.post("/verify-payment",orderController.verifyPayment);
router.post("/add-new-address-checkout",profileController.addNewAddressCheckout);
router.post("/coupon-validate",cartController.couponValidate);

router.post("/otpVerification",authController.verifyOTP)
// router.post("/change-password",userControllers.changePassword);

module.exports = router;