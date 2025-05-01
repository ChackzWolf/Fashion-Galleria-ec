const express = require("express");
const  adminControllers = require("../controllers/adminControllers");

const authController = require("../controllers/adminControllers/auth/authController")
const dashboardController = require("../controllers/adminControllers/dashboard/dashboardController")
const userManagementController = require("../controllers/adminControllers/user/userManagementController");
const productManagementController = require("../controllers/adminControllers/products/productManagementController")
const categoryManagementController= require("../controllers/adminControllers/category/categoryManagementController")
const orderManagementController = require("../controllers/adminControllers/orders/orderManagementController")
const couponManagementController = require("../controllers/adminControllers/coupon/CouponManagementController")
const offerManagementController = require("../controllers/adminControllers/offers/offerManagementController")
const bannerManagementController = require("../controllers/adminControllers/banner/bannerManagementController")

const productControllers = require("../controllers/productControllers")
const {adminLoginChecker,adminLoginVarify} = require("../middlewares/middlewares");
const { upload } = require('../utils/imageHandler')

const router = express.Router();



 /////////////////////////////////////////////////////////////////////////////////////////////
//------------------------------------Get methods------------------------------------------//
router.get("/login", adminLoginVarify, authController.loginView);
router.get("/adminLogout", authController.adminLogout)

router.get("/block-unblock", adminLoginChecker, userManagementController.userBlockUnblock);

//dashboard
router.get("/", adminLoginChecker, dashboardController.dashboardView);
router.get("/adminChartLoad", dashboardController.adminChartLoad);

//user management
router.get("/userList",adminLoginChecker, userManagementController.userList);


//product management
router.get("/add-Product",adminLoginChecker,productManagementController.addProductView);
router.get("/edit-product",adminLoginChecker,productManagementController.editProductView);
router.get("/list-unlist-product/:id",adminLoginChecker,productControllers.listUnlistProduct);
router.get("/edit-productDetails",adminLoginChecker,productControllers.editProductDetailsView)
router.get("/delete-product/:id",adminLoginChecker,productControllers.deleteProduct);
router.get("/deleted-products",adminLoginChecker,productManagementController.deletedProductsView)

//category management
router.get("/add-category",adminLoginChecker,  categoryManagementController.addCategory);
router.get("/category-list",adminLoginChecker,  categoryManagementController.categoryListView);
router.get("/edit-category",adminLoginChecker,  categoryManagementController.editCategoryView);
router.get("/list-unlist-category/:id",adminLoginChecker,  categoryManagementController.listUnlistCategory)
router.get("/delete-category/:id",adminLoginChecker,  categoryManagementController.deleteCategory);

//order management
router.get("/pending-orders",adminLoginChecker,  orderManagementController.pendingOrdersView);
router.get("/delivered-orders",adminLoginChecker,  orderManagementController.deliveredOrdersView);
router.get("/cancelled-orders",adminLoginChecker,  orderManagementController.cancelledOrdersView);
router.get("/order-shipped",adminLoginChecker,  orderManagementController.orderShipped);
router.get("/order-delivered",adminLoginChecker,  orderManagementController.orderDelivered);
router.get("/order-detail-view",adminLoginChecker,  orderManagementController.orderDetailView)

//coupon management
router.get("/add-coupon",  couponManagementController.addCouponView);
router.get("/coupon-list",  couponManagementController.couponListView);
router.get("/list-unlist-coupon/:id",  couponManagementController.listUnlistCoupon);
router.get("/edit-couponDetails",  couponManagementController.editCouponDetails)
router.get("/delete-coupon/:id",  couponManagementController.deleteCoupon);

//return product managment
router.get("/return-pending",  orderManagementController.returnPending);
router.get("/return-defective",  orderManagementController.returnDefective);
router.get("/return-non-defective",  orderManagementController.returnNonDefective);
router.get("/order-cancelled",  orderManagementController.orderCancel);
router.get("/return-accept",  orderManagementController.returnAccept);

//offer management
router.get("/product-offer",  offerManagementController.productOfferList);
router.get("/add-product-offer",  offerManagementController.addPrdouctOfferView);
router.get("/edit-product-offer",  offerManagementController.editProductOfferView);
router.get("/remove-product-offer/:id",  offerManagementController.removeProductOffer);

//banner management
router.get("/add-banner-view", bannerManagementController.mainBannerView);
router.get("/banner-list", bannerManagementController.bannerListView)
router.get("/list-unlist-banner/:id", bannerManagementController.listUnlistBanner);
router.get("/delete-banner/:id", bannerManagementController.deleteBanner);


 /////////////////////////////////////////////////////////////////////////////////////////////
//------------------------------------post methods-----------------------------------------//

router.post("/loginAdmin", authController.loginAdmin);

//products
router.post("/addProduct",upload.array('image',3), productControllers.addProduct)
router.post("/edited-productDetails",upload.array('image',3), productControllers.editedProductDetails)

//category
router.post("/addCategory", productControllers.addCategory)
router.post("/editCategory", categoryManagementController.editCategory)

//coupon
router.post("/addNewCoupon",couponManagementController.addNewCoupon)
router.post("/edit-coupon",couponManagementController.editCoupon)

//offer
router.post("/add-product-offer",offerManagementController.addProductOffer);

//banner
router.post("/add-banner",upload.array('image',3), bannerManagementController.addBanner);

router.post("/searchUser", userManagementController.searchUser);
router.post("/searchPendingOrders", orderManagementController.searchPendingOrders)
router.post("/searchDeliveredOrders", orderManagementController.searchDeliveredOrders);
router.post("/searchCancelledOrders", orderManagementController.searchCancelledOrders);

module.exports = router 