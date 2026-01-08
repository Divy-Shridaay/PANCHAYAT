import mongoose from "mongoose";

const PedhinamuFormDetailsSchema = new mongoose.Schema(
  {
    pedhinamuId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pedhinamu",
      required: true
    },

    /* -------------------- Applicant -------------------- */
    applicantName: String,
    applicantSurname: String,
    applicantMobile: String,
    applicantAadhaar: String,
    applicantPhoto: String,
    applicationDate: String,

    /* -------------------- Mukhya -------------------- */
    mukhyaName: String,
    mukhyaAge: String,
    mukhyaIsDeceased: { type: Boolean, default: false },

    /* -------------------- Deceased -------------------- */
    deceasedPersons: [
      {
        name: String,
        age: String,
        date: String
      }
    ],
    totalDeceasedCount: { type: Number, default: 0 },

    /* -------------------- Panch -------------------- */
    panch: [
      {
        name: String,
        age: String,
        occupation: String,
        aadhaar: String,
        mobile: String,
        photo: String
      }
    ],

    /* -------------------- Heirs (🔥 MISSING FIXED) -------------------- */
    heirs: { type: Array, default: [] },

    /* -------------------- Documents -------------------- */
    documents: {
      affidavit: { type: Boolean, default: false },
      satbara: { type: Boolean, default: false },
      aadhaarCopy: { type: Boolean, default: false },
      govtForm: { type: Boolean, default: false },
      deathCertificate: { type: Boolean, default: false },
      panchResolution: { type: Boolean, default: false },
      panchWitness: { type: Boolean, default: false },
      otherDocument: { type: String, default: "" }
    },

    /* -------------------- Notary -------------------- */
    notaryName: String,
    notaryBookNo: String,
    notaryPageNo: String,
    notarySerialNo: String,
    notaryDate: String,

    /* -------------------- Purpose -------------------- */
    referenceNo: String,
    mukkamAddress: String,
    jaminSurveyNo: String,
    jaminKhatano: String,
    makanMilkatAkarniNo: {
  type: String,
  default: ""
},

any: {
  type: String,
  default: ""
},

    reasonForPedhinamu: String,

    /* -------------------- Talati -------------------- */
    talatiName: String,
    varasdarType: String,
    totalHeirsCount: { type: Number, default: 0 },
    javadNo: String,

    heirType: { type: String, default: "alive" },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model(
  "PedhinamuFormDetails",
  PedhinamuFormDetailsSchema
);
