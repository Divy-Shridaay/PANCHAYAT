import Pedhinamu from "../models/Pedhinamu.js";
import PedhinamuFormDetails from "../models/PedhinamuFormDetails.js";

export const createPedhinamu = async (req, res) => {
  try {
    const d = req.body;

    if (!d.mukhya || !d.mukhya.name) {
      return res.status(400).json({ error: "Mukhya name is required" });
    }

    const data = {
      mukhya: {
        name: d.mukhya.name,
        age: d.mukhya.age,
        dob: d.mukhya.dob || "",
        dobDisplay: d.mukhya.dobDisplay || "",
        isDeceased: d.mukhya.isDeceased || false,
        dod: d.mukhya.dod || "",
        dodDisplay: d.mukhya.dodDisplay || "",
        mobile: d.mukhya.mobile || ""
      },

      heirs: (d.heirs || [])
        .filter(h => h.name?.trim())
        .map(h => ({
          name: h.name || "",
          relation: h.relation || "",
          age: h.age || "",
          dob: h.dob || "",
          dobDisplay: h.dobDisplay || "",
          mobile: h.mobile || "",
          isDeceased: h.isDeceased || false,
          dod: h.isDeceased ? (h.dod || "") : "",
          dodDisplay: h.isDeceased ? (h.dodDisplay || "") : "",

          subFamily: {
            spouse: {
              name: h.subFamily?.spouse?.name || "",
              age: h.subFamily?.spouse?.age || "",
              relation: h.subFamily?.spouse?.relation || "",
              relation2: h.subFamily?.spouse?.relation2 || "",
              dob: h.subFamily?.spouse?.dob || "",
              dobDisplay: h.subFamily?.spouse?.dobDisplay || "",
              isDeceased: h.subFamily?.spouse?.isDeceased || false,
              dod: h.subFamily?.spouse?.isDeceased ? (h.subFamily?.spouse?.dod || "") : "",
              dodDisplay: h.subFamily?.spouse?.isDeceased ? (h.subFamily?.spouse?.dodDisplay || "") : "",
            },

            children: (h.subFamily?.children || []).map(c => ({
              name: c.name || "",
              age: c.age || "",
              relation: c.relation || "",
              dob: c.dob || "",
              dobDisplay: c.dobDisplay || "",
              isDeceased: c.isDeceased || false,
              dod: c.isDeceased ? (c.dod || "") : "",
              dodDisplay: c.isDeceased ? (c.dodDisplay || "") : "",

              spouse: {
                name: c.spouse?.name || "",
                age: c.spouse?.age || "",
                relation: c.spouse?.relation || "",
                dob: c.spouse?.dob || "",
                dobDisplay: c.spouse?.dobDisplay || "",
                isDeceased: c.spouse?.isDeceased || false,
                dod: c.spouse?.isDeceased ? (c.spouse?.dod || "") : "",
                dodDisplay: c.spouse?.isDeceased ? (c.spouse?.dodDisplay || "") : "",
              },

              children: (c.children || []).map(gc => ({
                name: gc.name || "",
                age: gc.age || "",
                relation: gc.relation || "",
                dob: gc.dob || "",
                dobDisplay: gc.dobDisplay || "",
                isDeceased: gc.isDeceased || false,
                dod: gc.isDeceased ? (gc.dod || "") : "",
                dodDisplay: gc.isDeceased ? (gc.dodDisplay || "") : "",
              }))
            }))
          }
        }))
    };

    const saved = await Pedhinamu.create(data);

    res.json({
      success: true,
      message: "Pedhinamu saved successfully",
      data: saved
    });

  } catch (err) {
    console.log("PEDHINAMU SAVE ERROR:", err);
    res.status(500).json({ error: "Failed to save pedhinamu" });
  }
};

export const getPedhinamus = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { isDeleted: false };

    const total = await Pedhinamu.countDocuments(filter);
    let totalPages = Math.ceil(total / limit);
    if (totalPages < 1) totalPages = 1;
    if (page > totalPages) page = totalPages;

    const data = await Pedhinamu.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      page,
      limit,
      total,
      totalPages,
      data
    });

  } catch (err) {
    console.log("GET LIST ERROR:", err);
    res.status(500).json({ error: "Failed to load records" });
  }
};

export const saveFullForm = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    console.log("🟢 SAVE FULL FORM STARTED");
    console.log("🆔 Pedhinamu ID:", id);
    console.log("📦 RAW BODY:", body);
    console.log("📁 FILES:", req.files);

    const parseJson = (value) => {
      if (!value) return undefined;
      if (typeof value === "object") return value;
      if (typeof value === "string") {
        try {
          return JSON.parse(value);
        } catch (e) {
          console.error("❌ JSON parse error:", e.message, value);
          return undefined;
        }
      }
      return value;
    };

    const panch = parseJson(body.panch);
    const deceasedPersons = parseJson(body.deceasedPersons);
    const heirs = parseJson(body.heirs);
    const documents = parseJson(body.documents);

    console.log("👥 Panch parsed:", panch);
    console.log("☠️ Deceased parsed:", deceasedPersons);
    console.log("🧬 Heirs parsed:", heirs);
    console.log("📄 Documents parsed:", documents);

    if (!Array.isArray(panch)) {
      console.error("❌ Panch is not an array:", typeof panch, panch);
      return res.status(400).json({
        error: "Invalid panch data format",
        received: typeof panch,
        value: panch
      });
    }

    // =====================================================
    // ✅ FILE UPLOAD HANDLING
    // =====================================================

    let applicantPhotoPath;

    // ---------- APPLICANT PHOTO ----------
    if (req.files?.applicantPhoto?.length > 0) {
      applicantPhotoPath = `/uploads/${req.files.applicantPhoto[0].filename}`;
      console.log("✅ Applicant photo saved:", applicantPhotoPath);
    } else {
      console.log("ℹ️ No new applicant photo uploaded");
      
      // 🔥 FIX: Keep existing photo if no new upload
      const existingForm = await PedhinamuFormDetails.findOne({ pedhinamuId: id });
      if (existingForm?.applicantPhoto) {
        applicantPhotoPath = existingForm.applicantPhoto;
        console.log("📷 Using existing applicant photo:", applicantPhotoPath);
      }
    }

    // ---------- PANCH PHOTOS ----------
    if (req.files?.panchPhotos?.length > 0) {
      console.log(`📷 Panch photos received: ${req.files.panchPhotos.length}`);

      req.files.panchPhotos.forEach((file, index) => {
        if (panch[index]) {
          panch[index].photo = `/uploads/${file.filename}`;
          console.log(
            `✅ Panch[${index}] photo assigned:`,
            panch[index].photo
          );
        } else {
          console.warn(`⚠️ Panch index ${index} not found`);
        }
      });
    } else {
      console.log("ℹ️ No new panch photos uploaded");
      
      // 🔥 FIX: Keep existing panch photos if no new upload
      const existingForm = await PedhinamuFormDetails.findOne({ pedhinamuId: id });
      if (existingForm?.panch) {
        panch.forEach((p, index) => {
          if (!p.photo && existingForm.panch[index]?.photo) {
            p.photo = existingForm.panch[index].photo;
            console.log(`📷 Using existing panch[${index}] photo:`, p.photo);
          }
        });
      }
    }

    // =====================================================
    // ✅ UPDATE DATA BUILD
    // =====================================================

    const updateData = {
      pedhinamuId: id,
      heirType: "alive",

      panch: panch,
      deceasedPersons: deceasedPersons || [],
      heirs: heirs || [],
      documents: documents || {},

      applicantName: body.applicantName || "",
      applicantSurname: body.applicantSurname || "",
      applicantMobile: body.applicantMobile || "",
      applicantAadhaar: body.applicantAadhaar || "",
      applicationDate: body.applicationDate || "",

      mukhyaName: body.mukhyaName || "",
      mukhyaAge: body.mukhyaAge || "",

      notaryName: body.notaryName || "",
      notaryBookNo: body.notaryBookNo || "",
      notaryPageNo: body.notaryPageNo || "",
      notarySerialNo: body.notarySerialNo || "",
      notaryDate: body.notaryDate || "",

      referenceNo: body.referenceNo || "",
      mukkamAddress: body.mukkamAddress || "",
      jaminSurveyNo: body.jaminSurveyNo || "",
      jaminKhatano: body.jaminKhatano || "",
      reasonForPedhinamu: body.reasonForPedhinamu || "",

      talatiName: body.talatiName || "",
      varasdarType: body.varasdarType || "alive",
      totalHeirsCount: parseInt(body.totalHeirsCount) || 0,
      javadNo: body.javadNo || "",

      totalDeceasedCount: parseInt(body.totalDeceasedCount) || 0,
    };

    // 🔥 FIX: Always include applicant photo if it exists
    if (applicantPhotoPath) {
      updateData.applicantPhoto = applicantPhotoPath;
      console.log("🖼️ Applicant photo added to updateData:", applicantPhotoPath);
    } else {
      console.log("⚠️ No applicant photo available");
    }

    console.log("🧾 FINAL UPDATE DATA:", updateData);

    const saved = await PedhinamuFormDetails.findOneAndUpdate(
      { pedhinamuId: id },
      updateData,
      { upsert: true, new: true }
    );

    console.log("✅ FORM SAVED IN DB:", saved?._id);

    await Pedhinamu.findByIdAndUpdate(id, { hasFullForm: true });
    console.log("✅ Pedhinamu marked hasFullForm = true");

    res.json({
      success: true,
      message: "Full form saved successfully",
      data: saved
    });

  } catch (err) {
    console.error("❌ SAVE FULLFORM ERROR:", err);
    res.status(500).json({
      error: "Failed to save full form",
      details: err.message
    });
  }
};



export const getFullPedhinamu = async (req, res) => {
  try {
    const { id } = req.params;

    const pedhinamu = await Pedhinamu.findById(id);
    const form = await PedhinamuFormDetails.findOne({ pedhinamuId: id });

    res.json({
      success: true,
      pedhinamu,
      form
    });

  } catch (err) {
    console.log("GET FULL ERROR:", err);
    res.status(500).json({ error: "Failed to get pedhinamu" });
  }
};

export const updatePedhinamuTree = async (req, res) => {
  try {
    const { id } = req.params;
    const { mukhya, heirs } = req.body;

    if (!mukhya || !mukhya.name) {
      return res.status(400).json({ error: "Mukhya is required" });
    }

    const cleanedHeirs = (heirs || []).filter(h => h.name?.trim());

    const updated = await Pedhinamu.findByIdAndUpdate(
      id,
      {
        mukhya,
        heirs: cleanedHeirs
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Pedhinamu updated successfully",
      data: updated
    });

  } catch (err) {
    console.log("UPDATE TREE ERROR:", err);
    res.status(500).json({ error: "Failed to update Pedhinamu" });
  }
};

export const softDeletePedhinamu = async (req, res) => {
  try {
    const { id } = req.params;

    await Pedhinamu.findByIdAndUpdate(id, { isDeleted: true });
    await PedhinamuFormDetails.findOneAndUpdate(
      { pedhinamuId: id },
      { isDeleted: true }
    );

    res.json({ success: true, message: "Deleted successfully" });

  } catch (err) {
    console.log("DELETE ERROR:", err);
    res.status(500).json({ error: "Failed to delete record" });
  }
};