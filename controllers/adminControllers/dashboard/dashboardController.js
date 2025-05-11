const OrderModel = require('../../../models/Order');
const UserModel = require('../../../models/User');

const dashboardView = async (req, res) => {
    try {
        const pageNum = parseInt(req.query.page) || 1;
        const perPage = 6;

        const docCount = await OrderModel.countDocuments({ status: 'delivered' });
        const pages = Math.ceil(docCount / perPage);
        const countPages = Array.from({ length: pages }, (_, i) => i + 1);

        const recentOrders = await OrderModel.find({ status: 'delivered' })
            .populate('userId')
            .skip((pageNum - 1) * perPage)
            .limit(perPage);

        const countOfDeliveredOrders = docCount;
        const countOfUsers = await UserModel.countDocuments();

        const totalDeliveredAmount = Math.floor(
            recentOrders.reduce((acc, order) => acc + order.amount, 0)
        );

        res.render("admin/index", {
            recentOrders,
            countOfDeliveredOrders,
            totalDeliveredAmount,
            countOfUsers,
            countPages
        });
    } catch (err) {
        console.error(err)
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