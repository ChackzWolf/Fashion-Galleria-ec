const OrderModel = require('../../../models/Coupon')
const UserModel = require('../../../models/User');

const dashboardView = async (req, res) => {
    try {
        const pageNum =  req.query.page;
        const perPage = 6 ;
        let docCount
        let pages
        const documents = await OrderModel.countDocuments({ status: 'delivered' }).populate('userId')

        let TotalDeliveredAmount = 0;
        // const recentOrders = await OrderModel.find({ status: 'delivered' })
        const recentOrders = await OrderModel.find({ status: 'delivered' }).populate('userId').skip((pageNum - 1) * perPage).limit(perPage);
        const countOfDeliveredOrders = await OrderModel.countDocuments({ status: 'delivered' });
        const countOfUsers = await UserModel.countDocuments();
        const user = await UserModel.find({_id:recentOrders.userId});
        let countPages = []
        // pagination function
        docCount = documents
        pages = Math.ceil(docCount / perPage)
        for (let i = 0; i < pages; i++) {

            countPages[i] = i + 1
        }
        ///
        recentOrders.forEach(order => {
            TotalDeliveredAmount += order.amount;
        });
        let totalDeliveredAmount = Math.floor(TotalDeliveredAmount);
        res.render("admin/index", { recentOrders, countOfDeliveredOrders, totalDeliveredAmount, countOfUsers,user,countPages })
    } catch (err) {
        res.status(500).render("user/error-handling");
    }
}

const adminChartLoad = async (req, res) => {
    try {
        const data = await OrderModel.find()
        res.json(data);
    } catch (error) {
        res.status(500).render("user/error-handling");
    }
};


const generateReport = async (req, res) => {
    try{
        const browser = await puppeteer.launch({
          headless: false //
        });
        const page = await browser.newPage();
        await page.goto(`${req.protocol}://${req.get("host")}` + "/report", {
          waitUntil: "networkidle2"
        })
        await page.setViewport({ width: 1680, height: 1050 })
        const todayDate = new Date()
        const pdfn = await page.pdf({
          path: `${path.join(__dirname, "../public/files", todayDate.getTime() + ".pdf")}`,
          printBackground: true,
          format: "A4"
        })
        if (browser) await browser.close()
        console.log('if browser')
        const pdfURL = path.join(__dirname, "../public/files", todayDate.getTime() + ".pdf")
        res.download(pdfURL, function (err) {
            if (err) {
                console.log('err')
                  res.status(500).render("user/error-handling");
            }
        })
    }catch(error) {
        res.status(500).json({ status: false, error: 'Something went wrong on the server.' });
    }
}

module.exports = {
    generateReport,
    adminChartLoad,
    dashboardView,
}  