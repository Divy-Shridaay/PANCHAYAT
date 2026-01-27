import CashMel from "../models/CashMel.js";
import XLSX from "xlsx";
import ejs from "ejs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";

export const createEntry = async (req, res, next) => {
  try {
    
    const { date, name, receiptPaymentNo, vyavharType, category, amount, paymentMethod, bank, ddCheckNum, remarks } = req.body;
    const panchayatId = req.user.gam;

    const entry = await CashMel.create({
      panchayatId,
      date,
      name,
      receiptPaymentNo,
      vyavharType,
      category,
      amount: Number(amount),
      
      paymentMethod,
      bank,
      ddCheckNum,
      remarks,
    });

    return res.status(201).json({ success: true, data: entry });
  } catch (err) {
    next(err);
  }
};

export const getEntry = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ success: false, message: 'Missing id' });
    let query = { _id: id, isDeleted: false };
    if (req.user.role !== 'admin') {
      query.panchayatId = req.user.gam;
    }
    const entry = await CashMel.findOne(query).lean();
    if (!entry) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, data: entry });
  } catch (err) {
    next(err);
  }
};

// Get all entries
// Duplicate removed

// Get all entries
export const getAllEntries = async (req, res, next) => {
  try {
    let query = { isDeleted: false };
    if (req.user.role !== 'admin') {
      query.panchayatId = req.user.gam;
    }
    const entries = await CashMel.find(query).sort({ date: -1 }).lean();
    return res.json({ success: true, data: entries });
  } catch (err) {
    next(err);
  }
};

export const updateEntry = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ success: false, message: 'Missing id' });
    const { date, name, receiptPaymentNo, vyavharType, category, amount, paymentMethod, bank, ddCheckNum, remarks } = req.body;
    const update = { date, name, receiptPaymentNo, vyavharType, category, paymentMethod, bank, ddCheckNum, remarks };
    if (typeof amount !== 'undefined') update.amount = Number(amount);

    let query = { _id: id, isDeleted: false };
    if (req.user.role !== 'admin') {
      query.panchayatId = req.user.gam;
    }
    const updated = await CashMel.findOneAndUpdate(query, update, { new: true }).lean();
    if (!updated) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

const mapVyavhar = (val = "") => {
  val = val.toString().trim();

  // Gujarati → English enum mapping
  if (val === "આવક") return "aavak";
  if (val === "જાવક") return "javak";

  // fallback
  return val.toLowerCase();
};

export const uploadExcel = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const buffer = req.file.buffer;
    const wb = XLSX.read(buffer, { cellDates: true });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

    const saved = [];
    const skipped = [];
    const errors = [];

    // ===============================
    // 🔁 MAPPINGS
    // ===============================
    const vyavharTypeMap = {
      "આવક": "aavak",
      "જાવક": "javak",
      "aavak": "aavak",
      "javak": "javak",
    };

    const paymentMethodMap = {
      "બેંક": "bank",
      "રોકડ": "rokad",
      "bank": "bank",
      "rokad": "rokad",
    };

    const mapVyavhar = (v) =>
      vyavharTypeMap[String(v || "").trim()] || "";

    const mapPaymentMethod = (v) =>
      paymentMethodMap[String(v || "").trim()] || "";

    // ===============================
    // 📅 DATE PARSER (STRICT + SAFE)
    // ===============================
    function parseExcelDate(val) {
      if (!val) return null;

      let dt = null;

      // ✅ JS Date object
      if (val instanceof Date && !isNaN(val)) {
        dt = val;
      }

      // ✅ DD/MM/YYYY
      else if (
        typeof val === "string" &&
        /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(val.trim())
      ) {
        const [d, m, y] = val.split("/");
        dt = new Date(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`);
      }

      // ✅ YYYY-MM-DD
      else if (
        typeof val === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(val.trim())
      ) {
        dt = new Date(val);
      }

      // ✅ Excel serial number
      else if (!isNaN(Number(val))) {
        dt = new Date(Math.round((Number(val) - 25569) * 86400 * 1000));
      }

      if (!dt || isNaN(dt)) return null;

      // normalize time (important)
      dt.setHours(0, 0, 0, 0);
      return dt;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ===============================
    // ❌ PRE-VALIDATION: CHECK FOR FUTURE DATES
    // ===============================
    let hasFutureDate = false;
    let futureDateRow = -1;
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const entryDate = parseExcelDate(r.date);
      if (entryDate && entryDate > today) {
        hasFutureDate = true;
        futureDateRow = i + 2; // Row number (1-based, plus header)
        break;
      }
    }

    if (hasFutureDate) {
      return res.status(400).send("ભવિષ્યની તારીખ માન્ય નથી");
    }

    // ===============================
    // ❌ PRE-VALIDATION: CHECK FOR ROKAD WITH BANK DETAILS
    // ===============================
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const paymentMethod = mapPaymentMethod(r.paymentMethod);
      const bank = String(r.bank || "").trim();
      const ddCheckNum = String(r.ddCheckNum || "").trim();

      if (paymentMethod === "rokad" && (bank || ddCheckNum)) {
        return res.status(400).send(
          `રોકડ ચુકવણીમાં બેંક વિગતો માન્ય નથી (પંક્તિ ${i + 2})`
        );
      }
    }

    // ===============================
    // 🔁 ROW LOOP
    // ===============================
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];

      const entryDate = parseExcelDate(r.date);
      const name = String(r.name || "").trim();
      const receiptPaymentNo = String(r.receiptPaymentNo || "").trim();
      const vyavharType = mapVyavhar(r.vyavharType);
      const category = String(r.category || "").trim();
      const amount = Number(r.amount || 0);

      const paymentMethod = mapPaymentMethod(r.paymentMethod);
      const bank = String(r.bank || "").trim();
      const ddCheckNum =
        paymentMethod === "bank"
          ? String(r.ddCheckNum || "").trim()
          : "";
      const remarks = String(r.remarks || "").trim();

      // ===============================
      // ❌ DATE VALIDATION
      // ===============================
      if (!entryDate) {
        errors.push({
          row: i + 2,
          reason: "તારીખ માન્ય નથી",
          raw: r,
        });
        continue;
      }

      const dateISO = entryDate.toISOString().split("T")[0];

      // ===============================
      // ❗ REQUIRED FIELD VALIDATION
      // ===============================
      if (!name || !vyavharType || !category || !amount) {
        errors.push({
          row: i + 2,
          reason: "જરૂરી માહિતી અધૂરી છે",
          raw: r,
        });
        continue;
      }

      // ===============================
      // 🔍 DUPLICATE CHECK
      // ===============================
      const alreadyExists = await CashMel.findOne({
        panchayatId: req.user.gam,
        date: dateISO,
        name,
        receiptPaymentNo,
        vyavharType,
        category,
        amount,
        isDeleted: false
      });

      if (alreadyExists) {
        skipped.push({
          row: i + 2,
          reason: "ડુપ્લિકેટ એન્ટ્રી",
          raw: r,
        });
        continue;
      }

      // ===============================
      // 💾 SAVE
      // ===============================
      await CashMel.create({
        panchayatId: req.user.gam,
        date: dateISO,
        name,
        receiptPaymentNo,
        vyavharType,
        category,
        amount,
        paymentMethod,
        bank,
        ddCheckNum,
        remarks,
        isDeleted: false
      });

      saved.push(r);
    }

    // ===============================
    // 📤 RESPONSE
    // ===============================
    return res.json({
      success: true,
      savedCount: saved.length,
      skippedCount: skipped.length,
      errorCount: errors.length,
      skipped,
      errors,
    });

  } catch (err) {
    next(err);
  }
};






export const generatePDFReport = async (req, res, next) => {
  try {
    const { type, from, to } = req.query;
    const q = { isDeleted: false, panchayatId: req.user.gam };
    if (type) q.vyavharType = type;
    if (from) q.date = { $gte: from };
    if (to) q.date = q.date ? { ...q.date, $lte: to } : { $lte: to };

    const rows = await CashMel.find(q).sort({ date: 1 }).lean();

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // If a special form template exists for this type, use it. Otherwise fall back to default report.ejs
    const formTemplatePath = path.join(__dirname, "..", "views", "report_form.ejs");
    const defaultTemplatePath = path.join(__dirname, "..", "views", "report.ejs");

    let templatePath = defaultTemplatePath;
    let templateData = { rows, type, from, to };

    // If user requests a form-like PDF (e.g., aavak/tarij/passbook) and a form template exists, use it
    if (fs.existsSync(formTemplatePath)) {
      // try to detect types that need form template. You can adjust this condition as needed.
      if (type === 'aavak' || type === 'tarij' || type === 'passbook') {
        templatePath = formTemplatePath;

        // If a background image is present alongside the template, embed it as base64 data URI
        const bgImagePath = path.join(__dirname, "..", "views", "report_bg.png");
        if (fs.existsSync(bgImagePath)) {
          const imgBuf = fs.readFileSync(bgImagePath);
          const mime = 'image/png';
          const dataUri = `data:${mime};base64,${imgBuf.toString('base64')}`;
          templateData.imageData = dataUri;
        }
      }
    }

    const html = await ejs.renderFile(templatePath, templateData, { async: true });

    // Launch puppeteer and render PDF
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="report_${Date.now()}.pdf"`);
    return res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};

export const getReport = async (req, res, next) => {
  try {
    const { type, from, to } = req.query;
    // naive filter by date string inclusion or ISO comparison if provided
    const q = { isDeleted: false, panchayatId: req.user.gam };
    if (type) q.vyavharType = type;
    if (from) q.date = { $gte: from };
    if (to) q.date = q.date ? { ...q.date, $lte: to } : { $lte: to };

    const rows = await CashMel.find(q).sort({ date: 1 }).lean();

    // if client expects JSON preview, return rows
    return res.json({ success: true, rows });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// 6. SOFT DELETE (CashMel)
// ============================================================
export const softDeleteCashMel = async (req, res) => {
  try {
    const { id } = req.params;

    let query = { _id: id };
    if (req.user.role !== 'admin') {
      query.panchayatId = req.user.gam;
    }
    const entry = await CashMel.findOneAndUpdate(query, { isDeleted: true });

    if (!entry) return res.status(404).json({ success: false, message: 'Not found' });

    return res.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (err) {
    console.log("DELETE ERROR:", err);
    res.status(500).json({ error: "Failed to delete record" });
  }
};

