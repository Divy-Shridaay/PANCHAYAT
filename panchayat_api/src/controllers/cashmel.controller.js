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
    // Support filtering by category
    if (req.query.category) {
      query.category = req.query.category;
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

// export const uploadExcel = async (req, res, next) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: "No file uploaded",
//       });
//     }

//     const buffer = req.file.buffer;
//     const wb = XLSX.read(buffer, { cellDates: true });
//     const ws = wb.Sheets[wb.SheetNames[0]];
//     const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

//     // ===============================
//     // 🔁 MAPPINGS
//     // ===============================
//     const vyavharTypeMap = {
//       "આવક": "aavak",
//       "જાવક": "javak",
//       "aavak": "aavak",
//       "javak": "javak",
//     };

//     const paymentMethodMap = {
//       "બેંક": "bank",
//       "રોકડ": "rokad",
//       "bank": "bank",
//       "rokad": "rokad",
//     };

//     const mapVyavhar = (v) =>
//       vyavharTypeMap[String(v || "").trim()] || "";

//     const mapPaymentMethod = (v) =>
//       paymentMethodMap[String(v || "").trim()] || "";

//     // ===============================
//     // 📅 DATE PARSER
//     // ===============================
//     function parseExcelDate(val) {
//       if (!val) return null;

//       let dt = null;

//       if (val instanceof Date && !isNaN(val)) {
//         dt = val;
//       }
//       else if (
//         typeof val === "string" &&
//         /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(val.trim())
//       ) {
//         const [d, m, y] = val.split("/");
//         dt = new Date(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`);
//       }
//       else if (
//         typeof val === "string" &&
//         /^\d{4}-\d{2}-\d{2}$/.test(val.trim())
//       ) {
//         dt = new Date(val);
//       }
//       else if (!isNaN(Number(val))) {
//         dt = new Date(Math.round((Number(val) - 25569) * 86400 * 1000));
//       }

//       if (!dt || isNaN(dt)) return null;

//       dt.setHours(0, 0, 0, 0);
//       return dt;
//     }

//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     // ===============================
//     // ✅ PRE-VALIDATION: બધી ROWS ચેક કરો
//     // ===============================
//     const validationErrors = [];

//     for (let i = 0; i < rows.length; i++) {
//       const r = rows[i];
//       const rowNum = i + 2; // Excel row number

//       const entryDate = parseExcelDate(r.date);
//       const name = String(r.name || "").trim();
//       const receiptPaymentNo = String(r.receiptPaymentNo || "").trim();
//       const vyavharType = mapVyavhar(r.vyavharType);
//       const category = String(r.category || "").trim();
//       const amount = Number(r.amount || 0);
//       const paymentMethod = mapPaymentMethod(r.paymentMethod);
//       const bank = String(r.bank || "").trim();
//       const ddCheckNum = String(r.ddCheckNum || "").trim();

//       const missingFields = [];

//       // Check all required fields
//       if (!entryDate) missingFields.push("તારીખ");
//       if (!name) missingFields.push("આપનાર અથવા લેનાર નું નામ");
//       if (!receiptPaymentNo) missingFields.push("રસીદ / ચુકવણી નંબર");
//       if (!vyavharType) missingFields.push("વ્યવહાર પ્રકાર");
//       if (!category) missingFields.push("કેટેગરી");
//       if (!amount || amount <= 0) missingFields.push("રકમ");
//       if (!paymentMethod) missingFields.push("કેવી રીતે આપ્યા");

//       if (missingFields.length > 0) {
//         validationErrors.push({
//           // row: rowNum,
//           reason: `જરૂરી ફીલ્ડ ખૂટે છે: ${missingFields.join(", ")}`,
//         });
//         continue;
//       }

//       // Future date check
//       if (entryDate > today) {
//         validationErrors.push({
//           row: rowNum,
//           reason: "ભવિષ્યની તારીખ માન્ય નથી",
//         });
//       }

//       // Rokad with bank details check
//       if (paymentMethod === "rokad" && (bank || ddCheckNum)) {
//         validationErrors.push({
//           row: rowNum,
//           reason: "રોકડ ચુકવણીમાં બેંક વિગતો માન્ય નથી",
//         });
//       }
//     }

//     // ❌ જો કોઈ પણ validation error હોય તો UPLOAD નહીં કરો
//     if (validationErrors.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Excel માં ભૂલો મળી આવી. કૃપા કરીને સુધારો અને ફરી પ્રયાસ કરો.",
//         errors: validationErrors,
//       });
//     }

//     // ===============================
//     // 💾 હવે SAVE કરો (બધું valid છે)
//     // ===============================
//     const saved = [];
//     const skipped = [];

//     for (let i = 0; i < rows.length; i++) {
//       const r = rows[i];

//       const entryDate = parseExcelDate(r.date);
//       const dateISO = entryDate.toISOString().split("T")[0];
//       const name = String(r.name || "").trim();
//       const receiptPaymentNo = String(r.receiptPaymentNo || "").trim();
//       const vyavharType = mapVyavhar(r.vyavharType);
//       const category = String(r.category || "").trim();
//       const amount = Number(r.amount || 0);
//       const paymentMethod = mapPaymentMethod(r.paymentMethod);
//       const bank = String(r.bank || "").trim();
//       const ddCheckNum =
//         paymentMethod === "bank" ? String(r.ddCheckNum || "").trim() : "";
//       const remarks = String(r.remarks || "").trim();

//       // Duplicate check
//       const alreadyExists = await CashMel.findOne({
//         panchayatId: req.user.gam,
//         date: dateISO,
//         name,
//         receiptPaymentNo,
//         vyavharType,
//         category,
//         amount,
//         isDeleted: false,
//       });

//       if (alreadyExists) {
//         skipped.push({
//           row: i + 2,
//           reason: "ડુપ્લિકેટ એન્ટ્રી",
//         });
//         continue;
//       }

//       await CashMel.create({
//         panchayatId: req.user.gam,
//         date: dateISO,
//         name,
//         receiptPaymentNo,
//         vyavharType,
//         category,
//         amount,
//         paymentMethod,
//         bank,
//         ddCheckNum,
//         remarks,
//         isDeleted: false,
//       });

//       saved.push(r);
//     }

//     // ===============================
//     // 📤 RESPONSE
//     // ===============================
//     return res.json({
//       success: true,
//       message: "Excel સફળતાપૂર્વક અપલોડ થઈ ગયું!",
//       savedCount: saved.length,
//       skippedCount: skipped.length,
//       skipped,
//     });

//   } catch (err) {
//     next(err);
//   }
// };




// export const uploadExcel = async (req, res, next) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: "No file uploaded",
//       });
//     }

//     const buffer = req.file.buffer;
//     const wb = XLSX.read(buffer, { cellDates: true });
//     const ws = wb.Sheets[wb.SheetNames[0]];
 

    
//     // ROJMEL_NAMUNO.xlsx ના header row 2 પર છે
//     const data = XLSX.utils.sheet_to_json(ws, { 
//       range: 3, // Start from row 4 (index 3)
//       header: [
//         "date",              // Column 1: તારીખ
//         "receiptPaymentNo",  // Column 2: ક્રમ/પાવતી નંબર
//         "name",              // Column 3: કોના તરફ થી આવી
//         "anyaVero",          // Column 4: અન્ય વેરા (grant name)
//         "gharVero",          // Column 5: ઘર વેરો
//         "samanyaPaniVero",   // Column 6: સામાન્ય પાણી વેરો
//         "khasPaniVero",      // Column 7: ખાસ પાણી વેરો
//         "lightVero",         // Column 8: લાઈટ વેરો
//         "safaiVero",         // Column 9: સફાઈ વેરો
//         "gutarVero",         // Column 10: ગટર/કુંડી વેરો
//         "vyavsayVero",       // Column 11: વ્યવસાય વેરો
//         "anyaAavak",         // Column 12: અન્ય વેરા ની આવક
//         "kulRakam",          // Column 13: કુલ રકમ
//         "paymentMethod",     // Column 14: વ્યવહાર (rokad/bank)
//         "bank",              // Column 15: bank
//         "ddCheckNum",        // Column 16: ddCheckNum
//         "remarks"            // Column 17: remarks
//       ],
//       defval: "" 
//     });

//     // ===============================
//     // 🔁 MAPPINGS
//     // ===============================
//     const paymentMethodMap = {
//       "બેંક": "bank",
//       "રોકડ": "rokad",
//       "bank": "bank",
//       "rokad": "rokad",
//     };

//     const mapPaymentMethod = (v) =>
//       paymentMethodMap[String(v || "").trim()] || "rokad";

//     // Static વેરો category mapping
//     const staticCategoryMapping = {
//       gharVero: "ઘર વેરો",
//       samanyaPaniVero: "સામાન્ય પાણી વેરો",
//       khasPaniVero: "ખાસ પાણી વેરો",
//       lightVero: "લાઈટ વેરો",
//       safaiVero: "સફાઈ વેરો",
//       gutarVero: "ગટર/કુંડી વેરો",
//       vyavsayVero: "વ્યવસાય વેરો"
//     };

//     // ===============================
//     // 📅 DATE PARSER
//     // ===============================
//     function parseExcelDate(val) {
//       if (!val) return null;

//       let dt = null;

//       if (val instanceof Date && !isNaN(val)) {
//         dt = val;
//       }
//       else if (
//         typeof val === "string" &&
//         /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(val.trim())
//       ) {
//         const [d, m, y] = val.split("/");
//         dt = new Date(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`);
//       }
//       else if (
//         typeof val === "string" &&
//         /^\d{4}-\d{2}-\d{2}$/.test(val.trim())
//       ) {
//         dt = new Date(val);
//       }
//       else if (!isNaN(Number(val))) {
//         dt = new Date(Math.round((Number(val) - 25569) * 86400 * 1000));
//       }

//       if (!dt || isNaN(dt)) return null;

//       dt.setHours(0, 0, 0, 0);
//       return dt;
//     }

//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     // ===============================
//     // 🎯 GROUP ROWS BY MAIN ENTRY
//     // ===============================
//     // Excel માં એક main entry ના વધારે rows હોઈ શકે છે
//     // Example:
//     // Row 4: date=2025-01-01, name=raj, grants="જીલ્લા પંચાયત...", amount=200
//     // Row 5: date=empty, name=empty, grants="સફાઈ ગ્રાન્ટ", amount=300
//     // Row 5 એ Row 4 નો ભાગ છે
    
//     const groupedEntries = [];
//     let currentEntry = null;

//     for (let i = 0; i < data.length; i++) {
//       const r = data[i];
//       const rowNum = i + 4;

//       const entryDate = parseExcelDate(r.date);
//       const name = String(r.name || "").trim();
//       const receiptPaymentNo = String(r.receiptPaymentNo || "").trim();

//       // Check if this is a new main entry or continuation
//       const isNewEntry = entryDate && name && receiptPaymentNo;

//       if (isNewEntry) {
//         // Save previous entry if exists
//         if (currentEntry) {
//           groupedEntries.push(currentEntry);
//         }

//         // Start new entry
//         currentEntry = {
//           rowNum,
//           date: entryDate,
//           name,
//           receiptPaymentNo,
//           paymentMethod: mapPaymentMethod(r.paymentMethod),
//           bank: String(r.bank || "").trim(),
//           ddCheckNum: String(r.ddCheckNum || "").trim(),
//           remarks: String(r.remarks || "").trim(),
//           staticVeros: {},
//           anyaVeroGrants: []
//         };

//         // Add static વેરો amounts
//         for (const [field, categoryName] of Object.entries(staticCategoryMapping)) {
//           const amount = Number(r[field] || 0);
//           if (amount > 0) {
//             currentEntry.staticVeros[categoryName] = amount;
//           }
//         }

//         // Add અન્ય વેરો grant if present
//         const anyaVeroName = String(r.anyaVero || "").trim();
//         const anyaAavakAmount = Number(r.anyaAavak || 0);
        
//         if (anyaAavakAmount > 0) {
//           currentEntry.anyaVeroGrants.push({
//             grantName: anyaVeroName || "અન્ય આવક",
//             amount: anyaAavakAmount
//           });
//         }

//       } else {
//         // Continuation row - add to current entry
//         if (currentEntry) {
//           const anyaVeroName = String(r.anyaVero || "").trim();
//           const anyaAavakAmount = Number(r.anyaAavak || 0);
          
//           if (anyaAavakAmount > 0) {
//             currentEntry.anyaVeroGrants.push({
//               grantName: anyaVeroName || "અન્ય આવક",
//               amount: anyaAavakAmount
//             });
//           }
//         }
//       }
//     }

//     // Don't forget the last entry
//     if (currentEntry) {
//       groupedEntries.push(currentEntry);
//     }

//     // ===============================
//     // ✅ PRE-VALIDATION
//     // ===============================
//     const validationErrors = [];
//     const entriesToCreate = [];

//     for (const entry of groupedEntries) {
//       const dateISO = entry.date.toISOString().split("T")[0];

//       // Validation
//       if (!entry.date) {
//         validationErrors.push({
//           row: entry.rowNum,
//           reason: "તારીખ ખૂટે છે અથવા અયોગ્ય છે",
//         });
//         continue;
//       }

//       if (!entry.name) {
//         validationErrors.push({
//           row: entry.rowNum,
//           reason: "નામ ખૂટે છે",
//         });
//         continue;
//       }

//       if (!entry.receiptPaymentNo) {
//         validationErrors.push({
//           row: entry.rowNum,
//           reason: "રસીદ/પાવતી નંબર ખૂટે છે",
//         });
//         continue;
//       }

//       if (entry.date > today) {
//         validationErrors.push({
//           row: entry.rowNum,
//           reason: "ભવિષ્યની તારીખ માન્ય નથી",
//         });
//         continue;
//       }

//       let hasAnyAmount = false;

//       // 1️⃣ Create entries for static વેરો
//       for (const [categoryName, amount] of Object.entries(entry.staticVeros)) {
//         hasAnyAmount = true;
        
//         entriesToCreate.push({
//           rowNum: entry.rowNum,
//           date: dateISO,
//           name: entry.name,
//           receiptPaymentNo: entry.receiptPaymentNo,
//           vyavharType: "aavak",
//           category: categoryName,
//           amount,
//           paymentMethod: entry.paymentMethod,
//           bank: entry.bank,
//           ddCheckNum: entry.ddCheckNum,
//           remarks: entry.remarks,
//         });
//       }

//       // 2️⃣ Create entries for અન્ય વેરો grants
//       for (const grant of entry.anyaVeroGrants) {
//         hasAnyAmount = true;
        
//         entriesToCreate.push({
//           rowNum: entry.rowNum,
//           date: dateISO,
//           name: entry.name,
//           receiptPaymentNo: entry.receiptPaymentNo,
//           vyavharType: "aavak",
//           category: grant.grantName,
//           amount: grant.amount,
//           paymentMethod: entry.paymentMethod,
//           bank: entry.bank,
//           ddCheckNum: entry.ddCheckNum,
//           remarks: entry.remarks,
//         });
//       }

//       if (!hasAnyAmount) {
//         validationErrors.push({
//           row: entry.rowNum,
//           reason: "કોઈ પણ કેટેગરીમાં રકમ નથી",
//         });
//       }
//     }

//     // ❌ જો કોઈ પણ validation error હોય તો UPLOAD નહીં કરો
//     if (validationErrors.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Excel માં ભૂલો મળી આવી. કૃપા કરીને સુધારો અને ફરી પ્રયાસ કરો.",
//         errors: validationErrors,
//       });
//     }

//     // ===============================
//     // 💾 હવે SAVE કરો (બધું valid છે)
//     // ===============================
//     const saved = [];
//     const skipped = [];

//     for (const entry of entriesToCreate) {
//       // Duplicate check
//       const alreadyExists = await CashMel.findOne({
//         panchayatId: req.user.gam,
//         date: entry.date,
//         name: entry.name,
//         receiptPaymentNo: entry.receiptPaymentNo,
//         vyavharType: entry.vyavharType,
//         category: entry.category,
//         amount: entry.amount,
//         isDeleted: false,
//       });

//       if (alreadyExists) {
//         skipped.push({
//           row: entry.rowNum,
//           category: entry.category,
//           reason: "ડુપ્લિકેટ એન્ટ્રી",
//         });
//         continue;
//       }

//       await CashMel.create({
//         panchayatId: req.user.gam,
//         date: entry.date,
//         name: entry.name,
//         receiptPaymentNo: entry.receiptPaymentNo,
//         vyavharType: entry.vyavharType,
//         category: entry.category,
//         amount: entry.amount,
//         paymentMethod: entry.paymentMethod,
//         bank: entry.bank,
//         ddCheckNum: entry.ddCheckNum,
//         remarks: entry.remarks,
//         isDeleted: false,
//       });

//       saved.push(entry);
//     }

//     // ===============================
//     // 📤 RESPONSE
//     // ===============================
//     return res.json({
//       success: true,
//       message: "Excel સફળતાપૂર્વક અપલોડ થઈ ગયું!",
//       savedCount: saved.length,
//       skippedCount: skipped.length,
//       totalProcessedEntries: groupedEntries.length,
//       skipped,
//     });

//   } catch (err) {
//     next(err);
//   }
// };
export const uploadExcel = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const buffer = req.file.buffer;
    // ✅ Read WITHOUT cellDates first to see the raw values
    const wb = XLSX.read(buffer, { cellDates: false });

    console.log("📊 Total sheets found:", wb.SheetNames.length);
    console.log("📋 Sheet names:", wb.SheetNames);

    if (wb.SheetNames.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Excel file માં કોઈ sheet નથી",
      });
    }

    // ===============================
    // 🔁 MAPPINGS
    // ===============================
    const paymentMethodMap = {
      "બેંક": "bank",
      "રોકડ": "rokad",
      "bank": "bank",
      "rokad": "rokad",
    };

    const mapPaymentMethod = (v) => {
      const mapped = paymentMethodMap[String(v || "").trim()];
      return mapped || null;
    };

    const staticCategoryMapping = {
      gharVero: "ઘર વેરો",
      samanyaPaniVero: "સા.પા વેરો",
      khasPaniVero: "ખા.પા વેરો",
      lightVero: "વીજળી વેરો",
      safaiVero: "સફાઈ વેરો",
      gutarVero: "ગટર/કુંડી વેરો",
      vyavsayVero: "વ્યવસાય વેરો"
    };

    // ===============================
    // 🔍 HELPER: Check if value is truly empty
    // ===============================
    const isTrulyEmpty = (val) => {
      if (val === null || val === undefined) return true;
      if (typeof val === 'string' && val.trim() === '') return true;
      if (typeof val === 'number' && val === 0) return true;
      return false;
    };

    // ===============================
    // 📅 EXCEL DATE PARSER (RAW VALUES)
    // ===============================
    function parseExcelDate(val) {
      if (!val && val !== 0) return null;
      
      console.log(`   🔍 Raw value: ${val}, type: ${typeof val}`);

      // Case 1: String in DD/MM/YYYY format (e.g., "1/1/2010")
      if (typeof val === "string") {
        const trimmed = val.trim();
        
        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
          const [d, m, y] = trimmed.split("/");
          const day = parseInt(d, 10);
          const month = parseInt(m, 10);
          const year = parseInt(y, 10);
          
          const dt = new Date(year, month - 1, day, 0, 0, 0, 0);
          console.log(`   ✅ Parsed string date: ${day}/${month}/${year} → ${dt.toISOString().split('T')[0]}`);
          
          if (isNaN(dt.getTime())) return null;
          return dt;
        }
        
        // Try parsing as ISO format
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
          const dt = new Date(trimmed + "T00:00:00");
          if (!isNaN(dt.getTime())) return dt;
        }
        
        return null;
      }
      
      // Case 2: Excel serial number (NUMBER)
      if (typeof val === "number") {
        // Excel serial number to Date
        // Jan 1, 1900 = serial 1
        // But account for Excel's leap year bug
        let serial = Math.floor(val); // Use integer part only
        
        console.log(`   🔢 Excel serial: ${serial}`);
        
        // Create date from serial
        // Formula: (serial - 1) days + Jan 1, 1900
        // But: Excel thinks 1900 is leap year, so dates after Feb 28, 1900 are off by 1
        
        let daysToAdd = serial - 1; // Jan 1, 1900 is serial 1
        
        // Bug fix: dates after Feb 28, 1900 (which is serial 60) need adjustment
        if (serial > 60) {
          daysToAdd -= 1;
        }
        
        // Calculate from Jan 1, 1900
        const baseDate = new Date(1900, 0, 1, 0, 0, 0, 0);
        const resultMs = baseDate.getTime() + (daysToAdd * 86400000);
        const result = new Date(resultMs);
        
        const resultStr = result.toISOString().split('T')[0];
        console.log(`   ✅ Parsed serial ${serial}: ${resultStr}`);
        
        if (isNaN(result.getTime())) return null;
        return result;
      }
      
      // Case 3: Already a Date object (shouldn't happen with cellDates: false)
      if (val instanceof Date && !isNaN(val.getTime())) {
        return val;
      }
      
      return null;
    }

    // ===============================
    // 📅 TIMEZONE-SAFE DATE TO STRING
    // ===============================
    function getDateString(dt) {
      if (!dt || isNaN(dt.getTime())) return null;
      
      // ✅ Use local date components, NOT UTC
      const year = dt.getFullYear();
      const month = String(dt.getMonth() + 1).padStart(2, '0');
      const day = String(dt.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ===============================
    // 🎯 PROCESS AAVAK SHEET
    // ===============================
    function processAavakSheet(ws) {
      console.log(`\n🔍 Processing આવક sheet...`);
      
      const data = XLSX.utils.sheet_to_json(ws, {
        range: 2,
        header: [
          "date", "receiptPaymentNo", "name", "anyaVero",
          "gharVero", "samanyaPaniVero", "khasPaniVero", "lightVero",
          "safaiVero", "gutarVero", "vyavsayVero", "anyaAavak",
          "kulRakam", "paymentMethod", "bank", "ddCheckNum", "remarks"
        ],
        defval: ""
      });

      console.log(` 📝 Total rows parsed: ${data.length}`);

      const allEntries = [];

      for (let i = 0; i < data.length; i++) {
        const r = data[i];
        const rowNum = i + 3;
        
        const allFields = [
          r.date, r.receiptPaymentNo, r.name, r.anyaVero,
          r.gharVero, r.samanyaPaniVero, r.khasPaniVero, r.lightVero,
          r.safaiVero, r.gutarVero, r.vyavsayVero, r.anyaAavak,
          r.kulRakam, r.paymentMethod, r.bank, r.ddCheckNum, r.remarks
        ];

        const isCompletelyEmpty = allFields.every(field => isTrulyEmpty(field));

        if (isCompletelyEmpty) {
          console.log(`⏭️ Row ${rowNum}: Completely empty, skipping`);
          continue;
        }

        const entryDate = parseExcelDate(r.date);
        const name = String(r.name || "").trim();
        const receiptPaymentNo = String(r.receiptPaymentNo || "").trim();
        const paymentMethod = mapPaymentMethod(r.paymentMethod);
        const bank = String(r.bank || "").trim();
        const ddCheckNum = String(r.ddCheckNum || "").trim();
        const remarks = String(r.remarks || "").trim();
        
        console.log(`📝 Row ${rowNum}: Date=${entryDate ? entryDate.toISOString().split('T')[0] : 'null'}, Name=${name}`);

        const staticVeros = {};
        for (const [field, catName] of Object.entries(staticCategoryMapping)) {
          const amt = Number(r[field] || 0);
          if (amt > 0) {
            staticVeros[catName] = amt;
          }
        }

        const anyaVeroName = String(r.anyaVero || "").trim();
        const anyaAavakAmt = Number(r.anyaAavak || 0);
        
        for (const [catName, amt] of Object.entries(staticVeros)) {
          allEntries.push({
            rowNum,
            date: entryDate,
            name,
            receiptPaymentNo,
            vyavharType: "aavak",
            category: catName,
            amount: amt,
            paymentMethod,
            bank,
            ddCheckNum,
            remarks,
          });
        }

        if (anyaAavakAmt > 0) {
          allEntries.push({
            rowNum,
            date: entryDate,
            name,
            receiptPaymentNo,
            vyavharType: "aavak",
            category: anyaVeroName || "અન્ય આવક",
            amount: anyaAavakAmt,
            paymentMethod,
            bank,
            ddCheckNum,
            remarks,
          });
        }

        const hasNoAmounts = Object.keys(staticVeros).length === 0 && anyaAavakAmt === 0;
        
        if (hasNoAmounts) {
          console.log(`⚠️ Row ${rowNum}: Has data but no amounts`);
          allEntries.push({
            rowNum,
            date: entryDate,
            name,
            receiptPaymentNo,
            vyavharType: "aavak",
            category: anyaVeroName || "",
            amount: 0,
            paymentMethod,
            bank,
            ddCheckNum,
            remarks,
          });
        }
      }

      console.log(` ✅ Total entries: ${allEntries.length}`);
      return allEntries;
    }

    // ===============================
    // 🎯 PROCESS JAVAK SHEET
    // ===============================
    function processJavakSheet(ws) {
      console.log(`\n🔍 Processing જાવક sheet...`);

      const data = XLSX.utils.sheet_to_json(ws, {
        range: 2,
        header: [
          "date", "receiptPaymentNo", "name", "remarks",
          "category", "paymentMethod", "bank", "ddCheckNum", "amount"
        ],
        defval: ""
      });

      console.log(` 📝 Total rows parsed: ${data.length}`);

      const entries = [];
      for (let i = 0; i < data.length; i++) {
        const r = data[i];
        const rowNum = i + 3;

        console.log(`\n🔍 Processing Row ${rowNum}:`, {
          date_raw: r.date,
          date_type: typeof r.date,
          receiptPaymentNo: r.receiptPaymentNo,
          name: r.name
        });

        const allFields = [
          r.date, r.receiptPaymentNo, r.name, r.remarks,
          r.category, r.paymentMethod, r.bank, r.ddCheckNum, r.amount
        ];

        const isCompletelyEmpty = allFields.every(field => isTrulyEmpty(field));

        if (isCompletelyEmpty) {
          console.log(`⏭️ Row ${rowNum}: Completely empty, skipping`);
          continue;
        }

        const entryDate = parseExcelDate(r.date);
        const name = String(r.name || "").trim();
        const receiptPaymentNo = String(r.receiptPaymentNo || "").trim();
        const category = String(r.category || "").trim();
        const remarks = String(r.remarks || "").trim();
        const paymentMethod = mapPaymentMethod(r.paymentMethod);
        const bank = String(r.bank || "").trim();
        const ddCheckNum = String(r.ddCheckNum || "").trim();
        let amount = Number(r.amount || 0);

        if (isNaN(amount)) {
          amount = 0;
        }

        console.log(`✅ Parsed Row ${rowNum}:`, {
          date: entryDate,
          paymentMethod,
          remarks,
          amount
        });

        entries.push({
          rowNum,
          date: entryDate,
          name,
          receiptPaymentNo,
          vyavharType: "javak",
          category,
          amount,
          paymentMethod,
          bank,
          ddCheckNum,
          remarks,
        });
      }

      console.log(` ✅ Entries created: ${entries.length}`);
      return entries;
    }

    // ===============================
    // 📊 AUTO-DETECT (આવક અથવા જાવક)
    // ===============================
    let allEntries = [];
    const ws = wb.Sheets[wb.SheetNames[0]];
    
    const headerRow = XLSX.utils.sheet_to_json(ws, { range: 1, header: 1 })[0] || {};
    const headers = Object.values(headerRow).map(v => String(v || "").toLowerCase());
    
    console.log("🔍 Detected headers:", headers);
    
    const isJavakSheet = headers.some(h => 
      h.includes("કેટેગરી") || 
      h.includes("category") || 
      h.includes("કોને આપ્યા")
    );
    
    if (isJavakSheet) {
      console.log("📋 Detected: જાવક file");
      allEntries = processJavakSheet(ws);
    } else {
      console.log("📋 Detected: આવક file");
      allEntries = processAavakSheet(ws);
    }

    console.log(`\n📊 Total entries for validation: ${allEntries.length}`);

    // ===============================
    // ✅ VALIDATION
    // ===============================
    const validationErrors = [];
    const entriesToCreate = [];

    const fieldNamesGJ = {
      date: "તારીખ",
      name: "નામ",
      receiptPaymentNo: "પાવતી/વાઉચર નંબર",
      category: "કેટેગરી",
      amount: "રકમ",
      paymentMethod: "વ્યવહાર",
      bank: "બેંક",
      ddCheckNum: "ચેક નંબર",
      remarks: "રીમાર્ક્સ"
    };

    for (const entry of allEntries) {
      // Ensure vyavharType is always a valid string
      const validVyavharType = entry.vyavharType || "javak";
      const sheetType = validVyavharType === "aavak" ? "આવક" : "જાવક";
      const errorsForRow = [];

      if (!entry.date || isNaN(entry.date.getTime())) {
        errorsForRow.push(`${fieldNamesGJ.date || "તારીખ"} ખૂટે છે`);
      } else if (entry.date > today) {
        errorsForRow.push("ભવિષ્યની તારીખ માન્ય નથી");
      }

      if (!entry.receiptPaymentNo?.trim()) {
        errorsForRow.push(`${fieldNamesGJ.receiptPaymentNo || "પાવતી/વાઉચર નંબર"} ખૂટે છે`);
      }

      // if (!entry.name?.trim()) {
      //   const nameField = entry.vyavharType === "aavak" ? "કોના તરફ થી આવી" : "કોને આપ્યા";
      //   errorsForRow.push(`${nameField} ખૂટે છે`);
      // }

      // ❌ Name validation ONLY for JAVAK
if (validVyavharType === "javak") {
  if (!entry.name?.trim()) {
    errorsForRow.push("કોને આપ્યા ખૂટે છે");
  }
}


      if (!entry.paymentMethod) {
        errorsForRow.push(`${fieldNamesGJ.paymentMethod || "વ્યવહાર"} ખૂટે છે (rokad અથવા bank)`);
      } else if (!["rokad", "bank"].includes(entry.paymentMethod)) {
        errorsForRow.push(`${fieldNamesGJ.paymentMethod || "વ્યવહાર"} ખોટું છે`);
      }

      if (entry.paymentMethod === "bank") {
        if (!entry.bank?.trim()) {
          errorsForRow.push(`${fieldNamesGJ.bank || "બેંક"} જરૂરી છે (વ્યવહાર = bank)`);
        }
        if (!entry.ddCheckNum?.trim()) {
          errorsForRow.push(`${fieldNamesGJ.ddCheckNum || "ચેક નંબર"} જરૂરી છે (વ્યવહાર = bank)`);
        }
      }

      if (entry.paymentMethod === "rokad") {
        if (entry.bank?.trim()) {
          errorsForRow.push(`${fieldNamesGJ.bank || "બેંક"} નહીં હોવું જોઈએ (વ્યવહાર = rokad)`);
        }
        if (entry.ddCheckNum?.trim()) {
          errorsForRow.push(`${fieldNamesGJ.ddCheckNum || "ચેક નંબર"} નહીં હોવી જોઈએ (વ્યવહાર = rokad)`);
        }
      }

      if (!entry.remarks?.trim()) {
        errorsForRow.push(`${fieldNamesGJ.remarks || "રીમાર્ક્સ"} જરૂરી છે`);
      }

      if (!entry.category?.trim()) {
        errorsForRow.push(`${fieldNamesGJ.category || "કેટેગરી"} ખૂટે છે`);
      }

      const amt = Number(entry.amount);
      if (isNaN(amt) || amt <= 0) {
        errorsForRow.push(`${fieldNamesGJ.amount || "રકમ"} ખૂટે છે અથવા 0 છે`);
      }

      if (errorsForRow.length > 0) {
        validationErrors.push({
          type: sheetType || "જાવક",
          row: entry.rowNum,
          reasons: errorsForRow
        });
      } else {
        entriesToCreate.push({
          type: sheetType,
          rowNum: entry.rowNum,
          date: getDateString(entry.date),  // ✅ Timezone-safe conversion
          name: entry.name,
          receiptPaymentNo: entry.receiptPaymentNo,
          vyavharType: entry.vyavharType,
          category: entry.category,
          amount: amt,
          paymentMethod: entry.paymentMethod,
          bank: entry.bank,
          ddCheckNum: entry.ddCheckNum,
          remarks: entry.remarks,
        });
      }
    }

    console.log(`\n📋 Validation Summary:`);
    console.log(` ✅ Valid: ${entriesToCreate.length}`);
    console.log(` ❌ Errors: ${validationErrors.length}`);

    if (validationErrors.length > 0) {
      const formattedErrors = validationErrors.map(e => {
        const errorType = e.type && e.type.trim() ? e.type : "અજ્ઞાત";
        const rowNum = e.row || "અજ્ઞાત";
        const reasons = Array.isArray(e.reasons) && e.reasons.length > 0 
          ? e.reasons.map(r => `   • ${r || "અજ્ઞાત ભૂલ"}`).join("\n")
          : "   • કોઈ કારણ નથી";
        return `${errorType} - પંક્તિ ${rowNum}:\n${reasons}`;
      }).join("\n\n");

      return res.status(400).json({
        success: false,
        message: `Excelમાં ${validationErrors.length} ભૂલો છે.`,
        details: validationErrors,
        userFriendlyMessage: formattedErrors + "\n\n✅ સુધારીને ફરી અપલોડ કરો."
      });
    }

    if (entriesToCreate.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Excel માં કોઈ માન્ય data નથી"
      });
    }

    // ===============================
    // 💾 SAVE TO DATABASE
    // ===============================
    const saved = [];
    const skipped = [];

    for (const entry of entriesToCreate) {
      const exists = await CashMel.findOne({
        panchayatId: req.user.gam,
        date: entry.date,
        name: entry.name,
        receiptPaymentNo: entry.receiptPaymentNo,
        vyavharType: entry.vyavharType,
        category: entry.category,
        amount: entry.amount,
        isDeleted: false,
      });

      if (exists) {
        skipped.push({ row: entry.rowNum, category: entry.category });
        continue;
      }

      await CashMel.create({
        panchayatId: req.user.gam,
        date: entry.date,
        name: entry.name,
        receiptPaymentNo: entry.receiptPaymentNo,
        vyavharType: entry.vyavharType,
        category: entry.category,
        amount: entry.amount,
        paymentMethod: entry.paymentMethod,
        bank: entry.bank,
        ddCheckNum: entry.ddCheckNum,
        remarks: entry.remarks,
        isDeleted: false,
      });

      saved.push(entry);
    }

    const aavakSaved = saved.filter(e => e.vyavharType === "aavak").length;
    const javakSaved = saved.filter(e => e.vyavharType === "javak").length;

    console.log(`\n✅ Saved: ${saved.length} (આવક: ${aavakSaved}, જાવક: ${javakSaved})`);

    if (saved.length === 0 && skipped.length > 0) {
      return res.status(200).json({
        success: true,
        warning: true,
        message: "⚠️ બધી entries પહેલેથી છે",
        savedCount: 0,
        aavakCount: 0,
        javakCount: 0,
        skippedCount: skipped.length
      });
    }

    return res.json({
      success: true,
      message: "Excel સફળતાપૂર્વક અપલોડ થઈ ગયું!",
      savedCount: saved.length,
      aavakCount: aavakSaved,
      javakCount: javakSaved,
      skippedCount: skipped.length
    });
  } catch (err) {
    console.error("❌ Upload Error:", err);
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

