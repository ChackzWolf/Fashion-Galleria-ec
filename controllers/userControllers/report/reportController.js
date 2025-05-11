const puppeteer = require("puppeteer");
const path = require("path");
const OrderModel = require("../../../models/Order");

const generateReport = async (req, res) => {

    // try {
        console.log('triggered generate report')
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
      const pdfURL = path.join(__dirname, "../public/files", todayDate.getTime() + ".pdf")
      res.download(pdfURL, function (err) {
        if (err) {
          res.status(500).render("user/error-handling");
        }
      })
    // } catch (error) {
    //   res.status(500).json({ status: false, error: 'Something went wrong on the server.' });
    // }
  }

  

const loadReport = async (req, res) => {

    try {
        const recentOrders = await OrderModel.find({// matching only return defective and non defective.
            products: {
                $elemMatch: {
                    status:'delivered'
                }
            }
        })
       // const recentOrders = await OrderModel.find({ status: 'delivered' })
        res.render("admin/sales-report", { recentOrders })
    } catch (err) {
        res.status(500).render("user/error-handling");
    }
}

module.exports = {
    generateReport,
    loadReport
};
