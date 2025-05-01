const express = require("express")
const {userLoginVarify,userLoginChecker,otpSend,userStatusCheck} = require("../middlewares/middlewares");
const userControllers = require("../controllers/userControllers")
const userManagementController = require("../controllers/adminControllers/user/userManagementController")
const router = express.Router();

//________________Get methods

// index page
router.get("/",userStatusCheck,userControllers.indexView);

// user logs
router.get("/login",userLoginChecker,userControllers.loginView);
router.get("/signup",userLoginChecker,userControllers.signupView);
router.get("/otp",userControllers.otpView);
router.get("/userLogout",userLoginVarify,userControllers.userLogout);


// products page
router.get("/shop",userStatusCheck,userControllers.shopView);
router.get("/product-details",userStatusCheck,userControllers.productDetailsView);
router.get("/search", userControllers.search);


router.get("/searchUser", userManagementController.searchUser);

//cart
router.get("/cart",userLoginVarify,userStatusCheck,userControllers.cartView);
router.get("/addToCart",userLoginVarify,userControllers.addToCart);
router.get("/delete-cart-item",userStatusCheck,userLoginVarify,userControllers.deleteCartItem);

//check-out
router.get("/checkout",userStatusCheck,userLoginVarify,userControllers.checkout);
router.get("/remove-new-address-checkout",userLoginVarify,userStatusCheck,userControllers.removeAddressCheckout);
router.get("/order-response",userStatusCheck,userLoginVarify,userControllers.orderResponseView);

//user profile
router.get("/user-profile",userStatusCheck,userLoginVarify,userControllers.userProfile);
router.get("/default-address",userLoginVarify,userStatusCheck,userControllers.defaultAddress);
router.get("/remove-new-address-user",userStatusCheck,userLoginVarify,userControllers.removeAddress);
router.get('/email-verify',userControllers.emailVerify);
router.get("/wallet-history",userStatusCheck,userLoginVarify,userControllers.walletHistory);
router.get("/transaction-order-details-view",userStatusCheck,userLoginVarify,userControllers.transactionOrderDetailView);

//order management
router.get("/orders",userLoginVarify,userStatusCheck,userControllers.ordersView);
router.get("/order-detail-view",userStatusCheck,userLoginVarify,userControllers.orderDetailView);
router.get("/cancel-user-order",userStatusCheck,userLoginVarify,userControllers.cancelUserOrder);
router.get("/return-user-order",userStatusCheck,userLoginVarify,userControllers.returnUserOrder);
router.get("/otp-pass",otpSend,userControllers.otpViewPass);

//reports
router.get("/report",userControllers.loadReport) //should work on it
router.get("/report-generate",userControllers.generateReport) // should work on it

// others 
router.get("/blog",userLoginVarify,userStatusCheck,userControllers.blogView);
router.get("/contact",userStatusCheck,userControllers.contactView);


//post methods  ------------------
router.post("/signupUser",userControllers.signupUser);
router.post("/loginUser",userControllers.loginUser);
// router.post("/otpVerification",userControllers.otpVerification)
router.post("/change-product-quantity",userLoginVarify,userControllers.changeProductQuantity);
router.post("/add-new-address",userLoginVarify,userControllers.addNewAddress);
router.post("/edit-profile",userLoginVarify,userControllers.editProfile);
router.post("/change-password",userLoginVarify,userControllers.changePassword);
router.post("/place-order",userLoginVarify,userControllers.placeOrder);
router.post("/email-verify-otp",userControllers.emailVerifyOtp);
router.post("/changePassword",userControllers.createNewPasswrod);
router.post("/otp-verify-passwordChange",userControllers.otpVerificationPassword);
router.post("/verify-payment",userControllers.verifyPayment);
router.post("/add-new-address-checkout",userControllers.addNewAddressCheckout);
router.post("/coupon-validate",userControllers.couponValidate);

router.post("/otpVerification",userControllers.verifyOTP)
// router.post("/change-password",userControllers.changePassword);

module.exports = router;