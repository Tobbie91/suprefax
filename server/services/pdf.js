// puppeteer must be installed separately: npm install puppeteer
// It is excluded from default install due to its ~300MB Chromium download.
let puppeteer;
try { puppeteer = (await import("puppeteer")).default; } catch { puppeteer = null; }

export const generatePDF = async (application) => {
  if (!puppeteer) throw new Error("Puppeteer not installed. Run: npm install puppeteer");
  const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage();

  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head><style>
      body { font-family: Arial, sans-serif; padding: 40px; }
      h1 { color: #1e40af; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      td, th { padding: 8px 12px; border: 1px solid #e5e7eb; text-align: left; }
      th { background: #f9fafb; font-weight: 600; }
    </style></head>
    <body>
      <h1>Suprefax Loan Agreement</h1>
      <table>
        <tr><th>Application ID</th><td>${application.id}</td></tr>
        <tr><th>Product</th><td>${application.product}</td></tr>
        <tr><th>Amount</th><td>₦${Number(application.amount).toLocaleString()}</td></tr>
        <tr><th>Status</th><td>${application.status}</td></tr>
        <tr><th>Date</th><td>${new Date(application.created_at).toLocaleDateString()}</td></tr>
      </table>
    </body>
    </html>
  `);

  const pdf = await page.pdf({ format: "A4" });
  await browser.close();

  return pdf;
};
