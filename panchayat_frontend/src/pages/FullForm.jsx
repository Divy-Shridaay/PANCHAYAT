"use client";

import { useState, useEffect, useRef } from "react";
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  HStack,
  VStack,
  Checkbox,
  Text,
  Radio,
  RadioGroup
} from "@chakra-ui/react";


import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import CameraCapture from "../components/CameraCapture";
import { apiFetch, API_BASE_URL } from "../utils/api.js";

const gujaratiToEnglishDigits = (str) => {
  if (typeof str !== 'string') str = String(str || "");
  return str.replace(/[૦-૯]/g, (d) => "૦૧૨૩૪૫૬૭૮૯".indexOf(d));
};

const formatMobile = (value) => {
  if (!value) return "";
  const eng = gujaratiToEnglishDigits(value);
  const normalized = eng.replace("+91", "").trim();
  const digits = normalized.replace(/\D/g, "").slice(0, 10);

  if (!digits) return "";

  if (digits.length <= 5) {
    return `+91 ${digits}`;
  }

  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
};

const formatAadhaar = (value) => {
  value = gujaratiToEnglishDigits(value);
  const digits = value.replace(/\D/g, "").slice(0, 12);
  return digits.replace(/(\d{4})(\d{1,4})?(\d{1,4})?/, (_, a, b, c) =>
    [a, b, c].filter(Boolean).join("-")
  );
};

export default function FullForm() {
  const { id } = useParams();
  const { t } = useTranslation();
  const toast = useToast();
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    applicantName: "",
    applicantSurname: "",
    applicantMobile: "",
    applicantAadhaar: "",
    applicantPhotoFile: null,
    applicantPhotoPreview: null,
    applicantPhotoSource: null, // "camera" | "file" | "db"
    applicationDate: "",
    deceasedPersons: [],
    notaryName: "",
    notaryBookNo: "",
    notaryPageNo: "",
    notarySerialNo: "",
    notaryDate: "",
    referenceNo: "",
    mukkamAddress: "",
    jaminSurveyNo: "",
    jaminKhatano: "",
    makanMilkatAkarniNo: "",
    any: "",

    reasonForPedhinamu: "",
    panch: [],
    talatiName: "",
    varasdarType: "",
    totalHeirsCount: "",
    javadNo: "",
    mukhyaName: "",
    mukhyaAge: "",
    heirs: [],
    documents: {
      affidavit: false,
      satbara: false,
      // aadhaarCopy: false,
      govtForm: false,
      deathCertificate: false,
      // panchResolution: false,
      panchWitness: false,
      otherDocument: "",
    },
  });

  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [invalidFields, setInvalidFields] = useState({});
  const formRef = useRef({});
  const applicantFileRef = useRef(null);
  const panchFileRefs = useRef([]);
  const source = params.get("from");

  const handleBack = () => {
    if (source === "records") {
      navigate("/records");
    } else {
      navigate("/pedhinamu/list");
    }
  };

  const handleChange = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const updateDocument = (key, value) =>
    setForm((prev) => ({
      ...prev,
      documents: { ...prev.documents, [key]: value },
    }));

  const updatePanch = (index, key, value) => {
    setForm((prev) => {
      const updated = [...prev.panch];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, panch: updated };
    });
  };

  useEffect(() => {
    (async () => {
      const { response, data } = await apiFetch(`/api/pedhinamu/${id}`, {}, navigate, toast);

      const ped = data.pedhinamu;
      const savedForm = data.form || {};

      if (!ped) return;

      const mukhya = ped.mukhya || {};
      const heirs = ped.heirs || [];

      let deceasedCount = mukhya.isDeceased ? 1 : 0;

      heirs.forEach((h) => {
        if (h.isDeceased) deceasedCount++;
        if (h.subFamily?.spouse?.isDeceased) deceasedCount++;

        (h.subFamily?.children || []).forEach((c) => {
          if (c.isDeceased) deceasedCount++;
          if (c.spouse?.isDeceased) deceasedCount++;

          (c.children || []).forEach((gc) => {
            if (gc.isDeceased) deceasedCount++;
          });
        });
      });
      const applicantName = savedForm.applicantName || "";
      const applicantSurname = savedForm.applicantSurname || "";
      const applicantMobile = formatMobile(savedForm.applicantMobile || "");
      const applicantAadhaar = formatAadhaar(savedForm.applicantAadhaar || "");

      const mappedHeirs = heirs.map((h) => ({
        ...h,
        dob: h.dob || "",
        dobDisplay: h.dobDisplay || "",
        dod: h.dod || "",
        dodDisplay: h.dodDisplay || "",

        subFamily: {
          spouse: h.subFamily?.spouse
            ? {
              ...h.subFamily.spouse,
              dob: h.subFamily.spouse.dob || "",
              dobDisplay: h.subFamily.spouse.dobDisplay || "",
              dod: h.subFamily.spouse.dod || "",
              dodDisplay: h.subFamily.spouse.dodDisplay || "",
            }
            : {},

          children: (h.subFamily?.children || []).map((c) => ({
            ...c,
            dob: c.dob || "",
            dobDisplay: c.dobDisplay || "",
            dod: c.dod || "",
            dodDisplay: c.dodDisplay || "",

            spouse: c.spouse
              ? {
                ...c.spouse,
                dob: c.spouse.dob || "",
                dobDisplay: c.spouse.dobDisplay || "",
                dod: c.spouse.dod || "",
                dodDisplay: c.spouse.dodDisplay || "",
              }
              : null,

            children: (c.children || []).map((gc) => ({
              ...gc,
              dob: gc.dob || "",
              dobDisplay: gc.dobDisplay || "",
              dod: gc.dod || "",
              dodDisplay: gc.dodDisplay || "",
            })),
          })),
        },
      }));

      function getAllDeceased(mukhya, heirs) {
        const list = [];
        if (mukhya.isDeceased) list.push(mukhya);

        heirs.forEach((h) => {
          if (h.isDeceased) list.push(h);
          if (h.subFamily?.spouse?.isDeceased) list.push(h.subFamily.spouse);

          (h.subFamily?.children || []).forEach((c) => {
            if (c.isDeceased) list.push(c);
            if (c.spouse?.isDeceased) list.push(c.spouse);

            (c.children || []).forEach((gc) => {
              if (gc.isDeceased) list.push(gc);
            });
          });
        });

        return list;
      }

      const deceasedList = getAllDeceased(mukhya, heirs);

      function toISO(dateStr) {
        if (!dateStr) return "";
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
          const [dd, mm, yyyy] = dateStr.split("/");
          return `${yyyy}-${mm}-${dd}`;
        }
        return "";
      }

      // 🔥 FIX: Store BOTH DB path & preview URL separately
      const existingApplicantPhoto = savedForm.applicantPhoto || null;

      console.log("📷 Applicant Photo from DB:", existingApplicantPhoto);

      setForm((prev) => ({
        ...prev,
        ...savedForm,

        applicantName,
        applicantSurname,
        applicantMobile,
        applicantAadhaar,

        // 🔥 DB path (save ke liye)
        applicantPhoto: existingApplicantPhoto,

        // 🔥 Preview URL (display ke liye)
        //  applicantPhotoPreview: existingApplicantPhoto
        // ? `${API_BASE_URL}${existingApplicantPhoto}`


        applicantPhotoPreview: existingApplicantPhoto
          ? `${API_BASE_URL}${existingApplicantPhoto.startsWith('/uploads') ? '/api' + existingApplicantPhoto : existingApplicantPhoto}`

          : null,
        applicantPhotoSource: savedForm.applicantPhotoSource || (existingApplicantPhoto ?
          ((existingApplicantPhoto.toLowerCase().endsWith(".png") || existingApplicantPhoto.toLowerCase().endsWith(".webp")) ? "camera" : "db")
          : null),

        deceasedPersons: deceasedList.map((p) => ({
          name: p.name,
          age: p.age || "",
          date: toISO(p.dodDisplay || p.dod || ""),
        })),

        varasdarType:
          savedForm.varasdarType || "",


        mukhyaName: mukhya.name || "",
        mukhyaAge: mukhya.age || "",
        heirs: mappedHeirs,

        totalHeirsCount: heirs.length,
        totalDeceasedCount: deceasedCount,

        panch:
          savedForm.panch && savedForm.panch.length > 0
            ? savedForm.panch.map((p) => ({
              name: p.name || "",
              age: p.age || "",
              occupation: p.occupation || "",
              aadhaar: formatAadhaar(p.aadhaar || ""),
              mobile: formatMobile(p.mobile || ""),

              // 🔥 DB path
              photo: p.photo || null,

              // 🔥 Preview URL
              photoPreview: p.photo
                ? `${API_BASE_URL}${p.photo.startsWith('/uploads') ? '/api' + p.photo : p.photo}`

                : null,
              photoSource: p.photoSource || (p.photo ?
                ((p.photo.toLowerCase().endsWith(".png") || p.photo.toLowerCase().endsWith(".webp")) ? "camera" : "db")
                : null),
            }))
            : [
              { name: "", age: "", occupation: "", aadhaar: "", mobile: "", photoSource: null },
              { name: "", age: "", occupation: "", aadhaar: "", mobile: "", photoSource: null },
              { name: "", age: "", occupation: "", aadhaar: "", mobile: "", photoSource: null },
            ],
      }));

      setLoading(false);
    })();
  }, []);

  const hiddenDocuments = ["aadhaarCopy", "panchResolution"];

  const handleSave = async () => {
    const errors = [];
    const invalid = {};
    const isEmpty = (v) => !v || !String(v).trim();

    if (isEmpty(form.applicantName)) {
      errors.push(t("enterApplicantName"));
      invalid.applicantName = t("requiredField");
    }

    if (isEmpty(form.applicantSurname)) {
      errors.push(t("enterApplicantSurname"));
      invalid.applicantSurname = t("requiredField");
    }

    let mobileDigits = form.applicantMobile.replace(/\D/g, "");

    if (
      (mobileDigits.startsWith("91") || mobileDigits.startsWith("091")) &&
      mobileDigits.length > 10
    ) {
      mobileDigits = mobileDigits.slice(mobileDigits.length - 10);
    }

    if (mobileDigits.length !== 10) {
      errors.push(t("invalidMobile"));
      invalid.applicantMobile = t("invalidMobile");
    }

    const aadhaarDigits = form.applicantAadhaar.replace(/\D/g, "");
    if (aadhaarDigits === "" || aadhaarDigits.length !== 12) {
      errors.push(t("invalidAadhaar"));
      invalid.applicantAadhaar = t("invalidAadhaar");
    }

    const applicantA = form.applicantAadhaar.replace(/\D/g, "");
    const panchAadhaars = form.panch.map((p) => p.aadhaar.replace(/\D/g, ""));

    // ------------------------------------
    // DUPLICATE CHECKS
    // ------------------------------------

    // 1. Applicant Aadhaar vs Panch Aadhaars
    if (panchAadhaars.includes(applicantA)) {
      toast({
        title: t("error"),
        description: "અરજદાર અને પંચનો આધાર નંબર સમાન ન હોઈ શકે",
        status: "error",
        duration: 3000,
        position: "top",
      });
      return;
    }

    // 2. Panch vs Panch Aadhaar
    const duplicatePanchAadhar = panchAadhaars.find(
      (a, i) => a && panchAadhaars.indexOf(a) !== i
    );

    if (duplicatePanchAadhar) {
      toast({
        title: t("error"),
        description: "બે પંચના આધાર નંબર સમાન ન હોઈ શકે",
        status: "error",
        duration: 3000,
        position: "top",
      });
      return;
    }

    // 3. Applicant Mobile vs Panch Mobiles
    const applicantM = form.applicantMobile.replace(/\D/g, "").slice(-10);
    const panchMobiles = form.panch.map((p) => (p.mobile || "").replace(/\D/g, "").slice(-10));

    // Filter out empty mobile numbers just in case, though validation requires them
    if (applicantM && panchMobiles.includes(applicantM)) {
      toast({
        title: t("error"),
        description: "અરજદાર અને પંચનો મોબાઇલ નંબર સમાન ન હોઈ શકે",
        status: "error",
        duration: 3000,
        position: "top",
      });
      return;
    }

    // 4. Panch vs Panch Mobile
    const duplicatePanchMobile = panchMobiles.find(
      (m, i) => m && panchMobiles.indexOf(m) !== i
    );

    if (duplicatePanchMobile) {
      toast({
        title: t("error"),
        description: "બે પંચના મોબાઇલ નંબર સમાન ન હોઈ શકે",
        status: "error",
        duration: 3000,
        position: "top",
      });
      return;
    }

    form.panch.forEach((p, i) => {
      if (isEmpty(p.name)) {
        errors.push(`પંચ નં ${i + 1} નું નામ જરૂરી છે`);
        invalid[`panch_${i}_name`] = "required";
      }

      const pAge = String(p.age || "").trim();
      const ageNum = Number(pAge);

      if (!pAge) {
        errors.push(`પંચ નં ${i + 1} ની ઉંમર જરૂરી છે`);
        invalid[`panch_${i}_age`] = "required";
      } else if (isNaN(ageNum) || ageNum < 18) {
        errors.push(`પંચ નં ${i + 1} ની ઉંમર 18 વર્ષથી વધુ હોવી જોઈએ`);
        invalid[`panch_${i}_age`] = "18+ required";
      }

      if (isEmpty(p.occupation)) {
        errors.push(`પંચ નં ${i + 1} નો ધંધો ફરજિયાત છે`);
        invalid[`panch_${i}_occupation`] = true;
      }

      let pm = (p.mobile || "").replace(/\D/g, "");
      if ((pm.startsWith("91") || pm.startsWith("091")) && pm.length > 10) {
        pm = pm.slice(pm.length - 10);
      }

      if (!pm || pm.length !== 10) {
        errors.push(`પંચ નં ${i + 1} નો મોબાઇલ નંબર જરૂરી છે અને 10 આંકડાનો હોવો જોઈએ`);
        invalid[`panch_${i}_mobile`] = "invalid";
      }

      const pa = (p.aadhaar || "").replace(/\D/g, "");
      if (pa === "" || pa.length !== 12) {
        errors.push(`પંચ નં ${i + 1} નો આધાર નંબર ખોટો છે`);
        invalid[`panch_${i}_aadhaar`] = "invalid";
      }

      if (!p.photoPreview) {
        errors.push(`પંચ નં ${i + 1} નો ફોટો ફરજિયાત છે`);
      }
    });

    if (isEmpty(form.notaryName)) {
      errors.push(t("enterNotaryName"));
      invalid.notaryName = t("requiredField");
    }

    if (isEmpty(form.notaryBookNo)) {
      errors.push(t("enterNotaryBookNo"));
      invalid.notaryBookNo = t("requiredField");
    }

    if (isEmpty(form.notaryPageNo)) {
      errors.push(t("enterNotaryPageNo"));
      invalid.notaryPageNo = t("requiredField");
    }

    if (isEmpty(form.notarySerialNo)) {
      errors.push(t("enterNotarySerialNo"));
      invalid.notarySerialNo = t("requiredField");
    }

    if (isEmpty(form.notaryDate)) {
      errors.push(t("enterNotaryDate"));
      invalid.notaryDate = t("requiredField");
    }

    if (isEmpty(form.mukkamAddress)) {
      errors.push(t("enterAddress"));
      invalid.mukkamAddress = t("requiredField");
    }

    if (isEmpty(form.jaminSurveyNo)) {
      errors.push(t("enterSurveyNo"));
      invalid.jaminSurveyNo = t("requiredField");
    }

    if (isEmpty(form.jaminKhatano)) {
      errors.push(t("enterKhataNo"));
      invalid.jaminKhatano = t("requiredField");
    }

    if (isEmpty(form.reasonForPedhinamu)) {
      errors.push(t("enterReason"));
      invalid.reasonForPedhinamu = t("requiredField");
    }

    if (isEmpty(form.talatiName)) {
      errors.push(t("enterTalatiName"));
      invalid.talatiName = t("requiredField");
    }

    if (isEmpty(form.makanMilkatAkarniNo)) {
      errors.push("મકાનના મિલકત આકરણી નંબર ફરજિયાત છે");
      invalid.makanMilkatAkarniNo = true;
    }


    if (!form.varasdarType) {
      errors.push("વારસદારનો પ્રકાર પસંદ કરો");
      invalid.varasdarType = true;
    }

    if (!form.applicantPhotoPreview) {
      errors.push("અરજદારનો ફોટો ફરજિયાત છે");
    }


    if (isEmpty(form.javadNo)) {
      errors.push(t("enterJavadNo"));
      invalid.javadNo = t("requiredField");
    }

    setInvalidFields(invalid);

    if (errors.length > 0) {
      toast({
        title: t("error"),
        description: errors[0],
        status: "error",
        isClosable: true,
        duration: 3000,
        position: "top",
      });
      return;
    }

    const cleanForm = {
      ...form,
      applicantMobile: form.applicantMobile.replace(/\D/g, "").slice(-10),
      applicantAadhaar: form.applicantAadhaar.replace(/\D/g, ""),
      panch: form.panch.map((p) => ({
        ...p,
        mobile: (p.mobile || "").replace(/\D/g, "").slice(-10),
        aadhaar: (p.aadhaar || "").replace(/\D/g, ""),
      })),
    };

    const formData = new FormData();

    // 🔥 FIX: Send panch data with DB photo paths (not preview URLs)
    const panchDataForJson = cleanForm.panch.map((p) => {
      const { photoFile, photoPreview, ...panchData } = p;
      return panchData; // photoSource is already here
    });

    formData.append("panch", JSON.stringify(panchDataForJson));

    // 🔥 FIX: Send existing applicant photo path if no new file
    if (form.applicantPhoto && !form.applicantPhotoFile) {
      formData.append("existingApplicantPhoto", form.applicantPhoto);
    }

    Object.keys(cleanForm).forEach((key) => {
      if (key !== "panch" &&
        key !== "applicantPhotoFile" &&
        key !== "applicantPhotoPreview" &&
        key !== "applicantPhoto") {
        if (typeof cleanForm[key] === "object" && cleanForm[key] !== null) {
          formData.append(key, JSON.stringify(cleanForm[key]));
        } else {
          formData.append(key, cleanForm[key]);
        }
      }
    });

    // Add NEW applicant photo if uploaded
    if (form.applicantPhotoFile) {
      console.log('📸 Adding NEW applicant photo:', form.applicantPhotoFile.name);
      formData.append("applicantPhoto", form.applicantPhotoFile);
    }

    // Add NEW panch photos if uploaded
    form.panch.forEach((panch, index) => {
      if (panch.photoFile) {
        console.log(`📸 Adding NEW panch photo ${index}:`, panch.photoFile.name);
        formData.append("panchPhotos", panch.photoFile);
        formData.append("panchPhotoIndices", index);
      }
    });

    try {
      const { response: res, data: resData } = await apiFetch(
        `/api/pedhinamu/form/${id}`,
        {
          method: "POST",
          body: formData,
        },
        navigate,
        toast
      );

      if (!res.ok) {
        toast({
          title: t("error"),
          description: resData.error || t("failedToSave"),
          status: "error",
          duration: 3000,
          position: "top",
        });
        return;
      }

      toast({
        title: t("success"),
        status: "success",
        duration: 3000,
        position: "top",
      });

      setTimeout(() => {
        navigate("/records");
      }, 900);
    } catch (err) {
      console.error("SAVE ERROR:", err);
      toast({
        title: t("error"),
        description: t("connectionError"),
        status: "error",
        duration: 3000,
        position: "top",
      });
    }
  };
  if (loading) return <Text p={10}>Loading...</Text>;

  const boxStyle = {
    p: 5,
    borderWidth: "1px",
    rounded: "xl",
    mb: 6,
    bg: "white",
    borderColor: "#D8E8DD",
    boxShadow: "sm",
  };

  const inputStyle = {
    bg: "#F6FBF7",
    border: "1px solid #CFE5D8",
    size: "lg",
    rounded: "lg",
    _focus: { borderColor: "#2A7F62", bg: "white" },
  };

  const sectionTitle = {
    size: "md",
    color: "#1E4D2B",
    mb: 2,
    fontWeight: "700",
    borderLeft: "5px solid #2A7F62",
    pl: 3,
  };

  return (
    <Box p={8} maxW="1000px" mx="auto" bg="#F8FAF9">
      <Button
        leftIcon={<span>←</span>}
        colorScheme="green"
        variant="outline"
        mb={6}
        rounded="xl"
        fontWeight="700"
        onClick={handleBack}
      >
        {t("back")}
      </Button>

      <HStack justify="space-between" align="center" mb={10}>
        {/* {id && (
          <Button
  size="sm"
  variant="ghost"
  colorScheme="orange"
  rounded="md"
  border="1px solid"
  borderColor="orange.400"
  onClick={() => navigate(`/pedhinamu/edit/${id}`, { state: { step: 2 } })}
>
  વારસદાર એડિટ
</Button>

        )} */}

        <Heading textAlign="center" color="#1E4D2B" fontWeight="800" flex="1">
          {t("pedhinamu")}
        </Heading>

        <Box width="90px" />
      </HStack>

      {/* APPLICANT DETAILS */}
      <Heading {...sectionTitle}>{t("applicantDetails")}</Heading>
      <Box {...boxStyle}>
        <HStack spacing={6}>
          <FormControl isRequired>
            <FormLabel fontWeight="600">{t("applicantName")}</FormLabel>
            <Input
              {...inputStyle}
              borderColor={invalidFields.applicantName ? "red.500" : "#CBD5E0"}
              value={form.applicantName}
              onChange={(e) => handleChange("applicantName", e.target.value)}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel fontWeight="600">{t("applicantSurname")}</FormLabel>
            <Input
              {...inputStyle}
              borderColor={
                invalidFields.applicantSurname ? "red.500" : "#CBD5E0"
              }
              value={form.applicantSurname}
              onChange={(e) => handleChange("applicantSurname", e.target.value)}
            />
          </FormControl>
        </HStack>

        <HStack spacing={6} mt={4}>
          <FormControl isRequired>
            <FormLabel fontWeight="600">{t("applicantMobile")}</FormLabel>
            <Input
              {...inputStyle}
              borderColor={
                invalidFields.applicantMobile ? "red.500" : "#CBD5E0"
              }
              value={form.applicantMobile}
              onChange={(e) =>
                handleChange("applicantMobile", formatMobile(e.target.value))
              }
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel fontWeight="600">{t("applicantAadhaar")}</FormLabel>
            <Input
              {...inputStyle}
              borderColor={
                invalidFields.applicantAadhaar ? "red.500" : "#CBD5E0"
              }
              value={form.applicantAadhaar}
              onChange={(e) =>
                handleChange("applicantAadhaar", formatAadhaar(e.target.value))
              }
            />
          </FormControl>
        </HStack>

        {/* APPLICANT PHOTO UPLOAD */}
        {/* APPLICANT PHOTO UPLOAD / CAMERA */}
        <FormControl mt={4} isRequired>
          <FormLabel fontWeight="600">અરજદારની ફોટો</FormLabel>

          {/* File Upload */}
          <Input
            ref={applicantFileRef}
            type="file"
            accept="image/*"
            disabled={!!form.applicantPhotoPreview}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setForm(prev => ({
                  ...prev,
                  applicantPhotoFile: file,
                  applicantPhotoPreview: URL.createObjectURL(file),
                  applicantPhotoSource: "file"
                }));
              }
            }}
          />


          {/* Camera Capture */}
          <Box mt={2}>
            <CameraCapture
              src={form.applicantPhotoPreview}
              showRetake={form.applicantPhotoSource === "camera"}
              onCapture={(file, url) => {
                setForm(prev => ({
                  ...prev,
                  applicantPhotoFile: file,
                  applicantPhotoPreview: url,
                  applicantPhotoSource: "camera"
                }));
                if (applicantFileRef.current) applicantFileRef.current.value = "";
              }}
              onClear={() => {
                setForm(prev => ({
                  ...prev,
                  applicantPhotoFile: null,
                  applicantPhotoPreview: null,
                  applicantPhotoSource: null
                }));
                if (applicantFileRef.current) applicantFileRef.current.value = "";
              }}
            />
          </Box>

        </FormControl>

      </Box>

      {/* PANCH */}
      <Heading {...sectionTitle}>{t("panchDetails")}</Heading>
      <Box {...boxStyle}>
        {form.panch.map((p, i) => (
          <Box
            key={i}
            p={4}
            borderWidth="1px"
            rounded="md"
            borderColor="#DDEDE2"
            bg="#F8FBF9"
            mb={4}
          >
            <Text fontWeight="700" color="#1E4D2B" mb={3}>
              Panch #{i + 1}
            </Text>

            <HStack spacing={6}>
              <FormControl isRequired>
                <FormLabel fontWeight="600">{t("name")}</FormLabel>
                <Input
                  {...inputStyle}
                  borderColor={
                    invalidFields[`panch_${i}_name`] ? "red.500" : "#CBD5E0"
                  }
                  value={p.name}
                  onChange={(e) => updatePanch(i, "name", e.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="600">{t("age")}</FormLabel>
                <Input
                  {...inputStyle}
                  type="number"
                  min={18}
                  max={120}
                  maxLength={3}
                  borderColor={
                    invalidFields[`panch_${i}_age`] ? "red.500" : "#CBD5E0"
                  }
                  value={p.age}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 3);
                    updatePanch(i, "age", val);
                  }}
                  onKeyDown={(e) => {
                    if (["e", "E", "+", "-"].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />


              </FormControl>
            </HStack>

            <HStack spacing={6} mt={4}>
              <FormControl isRequired>
                <FormLabel fontWeight="600">{t("occupation")}</FormLabel>
                <Input
                  {...inputStyle}
                  borderColor={
                    invalidFields[`panch_${i}_occupation`]
                      ? "red.500"
                      : "#CBD5E0"
                  }
                  value={p.occupation}
                  onChange={(e) => updatePanch(i, "occupation", e.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="600">{t("aadhaarShort")}</FormLabel>
                <Input
                  {...inputStyle}
                  borderColor={
                    invalidFields[`panch_${i}_aadhaar`] ? "red.500" : "#CBD5E0"
                  }
                  value={p.aadhaar}
                  onChange={(e) =>
                    updatePanch(i, "aadhaar", formatAadhaar(e.target.value))
                  }
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="600">{t("mobile")}</FormLabel>
                <Input
                  {...inputStyle}
                  borderColor={
                    invalidFields[`panch_${i}_mobile`] ? "red.500" : "#CBD5E0"
                  }
                  value={p.mobile}
                  onChange={(e) =>
                    updatePanch(i, "mobile", formatMobile(e.target.value))
                  }
                />
              </FormControl>
            </HStack>

            {/* ✅ PHOTO UPLOAD / CAMERA (FIXED) */}
            <FormControl mt={4} isRequired>
              <FormLabel fontWeight="600">પંચની ફોટો</FormLabel>

              {/* File Upload */}
              <Input
                ref={(el) => (panchFileRefs.current[i] = el)}
                type="file"
                accept="image/*"
                disabled={!!p.photoPreview}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setForm(prev => {
                      const updated = [...prev.panch];
                      updated[i] = {
                        ...updated[i],
                        photoFile: file,
                        photoPreview: URL.createObjectURL(file),
                        photoSource: "file"
                      };
                      return { ...prev, panch: updated };
                    });
                  }
                }}
              />


              {/* Camera Capture */}
              <Box mt={2}>
                <CameraCapture
                  src={p.photoPreview}
                  showRetake={p.photoSource === "camera"}
                  onCapture={(file, url) => {
                    setForm(prev => {
                      const updated = [...prev.panch];
                      updated[i] = {
                        ...updated[i],
                        photoFile: file,
                        photoPreview: url,
                        photoSource: "camera"
                      };
                      return { ...prev, panch: updated };
                    });
                    if (panchFileRefs.current[i]) panchFileRefs.current[i].value = "";
                  }}
                  onClear={() => {
                    setForm(prev => {
                      const updated = [...prev.panch];
                      updated[i] = {
                        ...updated[i],
                        photoFile: null,
                        photoPreview: null,
                        photoSource: null
                      };
                      return { ...prev, panch: updated };
                    });
                    if (panchFileRefs.current[i]) panchFileRefs.current[i].value = "";
                  }}
                />
              </Box>
            </FormControl>
          </Box>
        ))}
      </Box>


      {/* DECEASED — NO STAR, NO REQUIRED MARKS */}
      <Heading {...sectionTitle}>{t("deceasedDetails")}</Heading>
      <Box {...boxStyle}>
        {form.deceasedPersons?.length === 0 && (
          <Text color="gray.600">
            {/* {t("noDeceasedFound")}  */}

            કુટુંબમાં કોઈ મૈયત  પામેલ સભ્ય નથી
          </Text>
        )}

        {form.deceasedPersons?.map((p, i) => (
          <Box
            key={i}
            p={4}
            mb={4}
            borderWidth="1px"
            rounded="lg"
            bg="#F8FBF9"
            borderColor="#DDEDE2"
          >
            <Text fontWeight="700" mb={3}>
              {t("deceased")} #{i + 1}
            </Text>

            {/* NAME */}
            <FormControl mb={3}>
              <FormLabel fontWeight="600">{t("deceasedPersonName")}</FormLabel>
              <Input
                {...inputStyle}
                value={p.name}
                onChange={(e) => {
                  const updated = [...form.deceasedPersons];
                  updated[i].name = e.target.value;
                  handleChange("deceasedPersons", updated);
                }}
              />
            </FormControl>

            <HStack spacing={6}>
              {/* DATE */}
              <FormControl>
                <FormLabel fontWeight="600">{t("deathDate")}</FormLabel>
                <Input
                  {...inputStyle}
                  type="date"
                  value={p.date}
                  onChange={(e) => {
                    const updated = [...form.deceasedPersons];
                    updated[i].date = e.target.value;
                    handleChange("deceasedPersons", updated);
                  }}
                />
              </FormControl>

              {/* AGE */}
              <FormControl>
                <FormLabel fontWeight="600">{t("deceasedPersonAge")}</FormLabel>
                <Input
                  {...inputStyle}
                  {...inputStyle}
                  value={p.age}
                  maxLength={3}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 3);
                    const updated = [...form.deceasedPersons];
                    updated[i].age = val;
                    handleChange("deceasedPersons", updated);
                  }}
                />
              </FormControl>
            </HStack>
          </Box>
        ))}
      </Box>

      {/* NOTARY */}
      <Heading {...sectionTitle}>{t("notaryDetails")}</Heading>
      <Box {...boxStyle}>
        <HStack spacing={6}>
          <FormControl isRequired>
            <FormLabel fontWeight="600">{t("notaryName")}</FormLabel>
            <Input
              {...inputStyle}
              borderColor={invalidFields.notaryName ? "red.500" : "#CBD5E0"}
              value={form.notaryName}
              onChange={(e) => handleChange("notaryName", e.target.value)}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel fontWeight="600">{t("notaryBookNo")}</FormLabel>
            <Input
              {...inputStyle}
              borderColor={invalidFields.notaryBookNo ? "red.500" : "#CBD5E0"}
              value={form.notaryBookNo}
              onChange={(e) => handleChange("notaryBookNo", e.target.value)}
            />
          </FormControl>
        </HStack>

        <HStack spacing={6} mt={4}>
          <FormControl isRequired>
            <FormLabel fontWeight="600">{t("notaryPageNo")}</FormLabel>
            <Input
              {...inputStyle}
              borderColor={invalidFields.notaryPageNo ? "red.500" : "#CBD5E0"}
              value={form.notaryPageNo}
              onChange={(e) => handleChange("notaryPageNo", e.target.value)}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel fontWeight="600">{t("notarySerialNo")}</FormLabel>
            <Input
              {...inputStyle}
              borderColor={invalidFields.notarySerialNo ? "red.500" : "#CBD5E0"}
              value={form.notarySerialNo}
              onChange={(e) => handleChange("notarySerialNo", e.target.value)}
            />
          </FormControl>

          {/* ✅ UPDATED DATE FIELD */}
          <FormControl isRequired>
            <FormLabel fontWeight="600">{t("notaryDate")}</FormLabel>
            <Input
              {...inputStyle}
              type="date"
              max={new Date().toISOString().split("T")[0]}   // ✅ today & past only
              borderColor={invalidFields.notaryDate ? "red.500" : "#CBD5E0"}
              value={form.notaryDate}
              onChange={(e) => handleChange("notaryDate", e.target.value)}
            />
          </FormControl>
        </HStack>
      </Box>

      {/* PURPOSE */}
      <Heading {...sectionTitle}>{t("useDetails")}</Heading>
      <Box {...boxStyle}>
        <FormControl isRequired mb={3}>
          <FormLabel fontWeight="600">{t("referenceNo")}</FormLabel>
          <Input
            {...inputStyle}
            borderColor={invalidFields.referenceNo ? "red.500" : "#CBD5E0"}
            value={form.referenceNo}
            onChange={(e) => handleChange("referenceNo", e.target.value)}
          />
        </FormControl>

        <FormControl isRequired mb={3}>
          <FormLabel fontWeight="600">{t("mukkamAddress")}</FormLabel>
          <Input
            {...inputStyle}
            borderColor={invalidFields.mukkamAddress ? "red.500" : "#CBD5E0"}
            value={form.mukkamAddress}
            onChange={(e) => handleChange("mukkamAddress", e.target.value)}
          />
        </FormControl>


        {/* 🔽 ADDITIONAL PROPERTY DETAILS (OPTIONAL) */}
        <HStack spacing={6} mt={4}>
          <FormControl isRequired flex={1}>
            <FormLabel fontWeight="600">
              મકાનના મિલકત આકરણી નંબર
            </FormLabel>
            <Input
              {...inputStyle}
              borderColor={invalidFields.makanMilkatAkarniNo ? "red.500" : "#CBD5E0"}
              value={form.makanMilkatAkarniNo || ""}
              onChange={(e) =>
                handleChange("makanMilkatAkarniNo", e.target.value)
              }

            />
          </FormControl>

          <FormControl flex={1}>
            <FormLabel fontWeight="600">અન્ય</FormLabel>
            <Input
              {...inputStyle}
              value={form.any || ""}
              onChange={(e) => handleChange("any", e.target.value)}

            />
          </FormControl>
        </HStack>


        <HStack spacing={6} mt={4}>
          <FormControl isRequired flex={1}>
            <FormLabel fontWeight="600">{t("surveyNo")}</FormLabel>
            <Input
              {...inputStyle}
              borderColor={invalidFields.jaminSurveyNo ? "red.500" : "#CBD5E0"}
              value={form.jaminSurveyNo}
              onChange={(e) => handleChange("jaminSurveyNo", e.target.value)}
            />
          </FormControl>

          <FormControl isRequired flex={1}>
            <FormLabel fontWeight="600">{t("khataNo")}</FormLabel>
            <Input
              {...inputStyle}
              borderColor={invalidFields.jaminKhatano ? "red.500" : "#CBD5E0"}
              value={form.jaminKhatano}
              onChange={(e) => handleChange("jaminKhatano", e.target.value)}
            />
          </FormControl>
        </HStack>

        <FormControl isRequired mt={3}>
          <FormLabel fontWeight="600">{t("reasonForPedhinamu")}</FormLabel>
          <Input
            {...inputStyle}
            borderColor={
              invalidFields.reasonForPedhinamu ? "red.500" : "#CBD5E0"
            }
            value={form.reasonForPedhinamu}
            onChange={(e) => handleChange("reasonForPedhinamu", e.target.value)}
          />
        </FormControl>
      </Box>

      {/* DOCUMENTS */}
      <Heading {...sectionTitle}>{t("documents")}</Heading>
      <Box {...boxStyle}>
        <VStack align="start">
          {Object.keys(form.documents).map((key) => {
            if (hiddenDocuments.includes(key)) return null;   // 🔥 REMOVE THESE

            return key !== "otherDocument" ? (
              <FormControl key={key} isRequired>
                <Checkbox
                  isChecked={form.documents[key]}
                  onChange={(e) => updateDocument(key, e.target.checked)}
                  colorScheme="green"
                  borderColor={
                    invalidFields[`doc_${key}`] ? "red.500" : undefined
                  }
                >
                  {t(key)}
                </Checkbox>
              </FormControl>
            ) : (
              <FormControl key={key} mt={3}>
                <FormLabel fontWeight="600">{t("otherDocument")}</FormLabel>
                <Input
                  {...inputStyle}
                  borderColor={invalidFields.otherDocument ? "red.500" : "#CBD5E0"}
                  value={form.documents.otherDocument}
                  onChange={(e) => updateDocument("otherDocument", e.target.value)}
                />
              </FormControl>
            );
          })}

        </VStack>
      </Box>

      {/* TALATI */}
      <Heading {...sectionTitle}>{t("talatiSection")}</Heading>
      <Box {...boxStyle}>
        <FormControl isRequired mb={3}>
          <FormLabel fontWeight="600">{t("talatiName")}</FormLabel>
          <Input
            {...inputStyle}
            borderColor={invalidFields.talatiName ? "red.500" : "#CBD5E0"}
            value={form.talatiName}
            onChange={(e) => handleChange("talatiName", e.target.value)}
          />
        </FormControl>

        <HStack spacing={6}>
          <FormControl isRequired>
            <FormLabel fontWeight="600">વારસાઈ નો પ્રકાર</FormLabel>

            <RadioGroup
              value={form.varasdarType}
              onChange={(val) => handleChange("varasdarType", val)}
            >
              <HStack spacing={6}>
                <Radio value="alive" colorScheme="green">
                  હયાત
                </Radio>

                <Radio value="deceased" colorScheme="red">
                  મૃત
                </Radio>
              </HStack>
            </RadioGroup>

            {invalidFields.varasdarType && (
              <Text fontSize="sm" color="red.500" mt={1}>
                જરૂરી છે
              </Text>
            )}
          </FormControl>


          <FormControl isRequired>
            <FormLabel fontWeight="600">{t("totalHeirsCount")}</FormLabel>
            <Input {...inputStyle} readOnly value={form.totalHeirsCount} />
          </FormControl>

          <FormControl isRequired>
            <FormLabel fontWeight="600">{t("javadNo")}</FormLabel>
            <Input
              {...inputStyle}
              borderColor={invalidFields.javadNo ? "red.500" : "#CBD5E0"}
              value={form.javadNo}
              onChange={(e) => handleChange("javadNo", e.target.value)}
            />
          </FormControl>
        </HStack>
      </Box>

      <Button
        size="lg"
        colorScheme="green"
        width="100%"
        rounded="xl"
        mt={8}
        onClick={handleSave}
      >
        {t("save")}
      </Button>
    </Box>
  );
}
