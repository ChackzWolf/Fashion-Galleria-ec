const session = require("express-session");
const router = require("../routes/user");
const UserModel = require("../models/User");
const ProductModel = require("../models/Product");
const CategoryModel = require("../models/Category");
const Swal = require('sweetalert2');
const OrderModel = require("../models/Order");
const CouponModel = require("../models/Coupon");
const BannerModel = require("../models/Banner");
const { findOne } = require("../models/Address");
const formatDate = require("../utils/dateGenerator");
const adminFunc = require("../utils/adminHelpers");
const puppeteer = require("puppeteer")
const fileHandler = require("../utils/files")




 