
import React, { useEffect, useState, useCallback } from "react";
import {
    Box,
    Heading,
    VStack,
    FormControl,
    FormLabel,
    Input,
    Select,
    Button,
    useToast,
    Flex,
    Collapse,
    
    HStack,
    
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    IconButton,
  } from "@chakra-ui/react";
import CashMelReport from "./CashMelReport.jsx";
import * as XLSX from "xlsx";
import { FiArrowLeft } from "react-icons/fi";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { useRef } from "react";


import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { FiPrinter } from "react-icons/fi";


import "react-datepicker/dist/react-datepicker.css";

import DateInput from "./DateInput.jsx";




/* ---------- Excel Serial Date → DD/MM/YYYY ---------- */
const excelSerialToDDMMYYYY = (serial) => {
  if (typeof serial !== "number") return serial;

  const excelEpoch = new Date(1899, 11, 30);
  const date = new Date(excelEpoch.getTime() + serial * 86400000);

  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();

  return `${dd}/${mm}/${yyyy}`;
};


/* ---------------- Format DD/MM/YYYY ---------------- */
const formatDisplayDate = (input) => {
    const digits = input.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4);
};

/* --------------- Convert DD/MM/YYYY → ISO ------------ */
const convertToISO = (display) => {
    const [d, m, y] = display.split("/");
    if (!d || !m || !y || y.length !== 4) return "";
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
};

/* ---------- Gujarati Digits → English Digits ---------- */
const gujaratiToEnglishDigits = (str) => {
    if (!str) return str;
    const guj = "૦૧૨૩૪૫૬૭૮૯";
    const eng = "0123456789";
    return str
        .split("")
        .map((char) => {
            const idx = guj.indexOf(char);
            return idx !== -1 ? eng[idx] : char;
        })
        .join("");
};

/* ---------- English → Gujarati Digits (Display) ---------- */
const toGujaratiDigits = (num) => {
    if (!num && num !== 0) return "";
    const guj = ["૦", "૧", "૨", "૩", "૪", "૫", "૬", "૭", "૮", "૯"];
    return String(num).split("").map(d => guj[d] || d).join("");
};

const CashMelForm = () => {
   
  const API_BASE = (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"))
      ? "http://localhost:5000/api"
      : "https://panchayat.shridaay.com/api";
   
    
  
  const { t } = useTranslation();
  
    const toast = useToast();
    const navigate = useNavigate();
   const { id } = useParams();
const isEditMode = Boolean(id); // ✅ edit mode flag
const [submitLoading, setSubmitLoading] = useState(false);     // for single entry submit
const [bulkLoading, setBulkLoading] = useState(false);

    
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const [excelFile, setExcelFile] = useState(null);
const fileInputRef = useRef(null);


    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        date: "",
        dateDisplay: "",
        name: "",
        receiptPaymentNo: "",
        vyavharType: "",
        category: "",
        amount: "",
        paymentMethod: "",
        bank: "",
        ddCheckNum: "",
        remarks: "",
        excelFile: null,
        excelData: [],
    });

    const [customCategories, setCustomCategories] = useState({ aavak: [], javak: [] });
    const [banks, setBanks] = useState([]);
 
    const [showAddBank, setShowAddBank] = useState(false);
    const [newBankName, setNewBankName] = useState("");

    // Bank deposit modal state
    const { isOpen: isOpenBankDeposit, onOpen: onOpenBankDeposit, onClose: onCloseBankDeposit } = useDisclosure();
    const [bankDepositForm, setBankDepositForm] = useState({
      date: "",
      dateDisplay: "",
      bank: "",
      remarks: "",
      amount: "",
    });
    const [bankDepositSubmitting, setBankDepositSubmitting] = useState(false);
    const [editingDepositId, setEditingDepositId] = useState(null);

    // Opening balance (ઉઘડતી સિલક) modal state
    const { isOpen: isOpenOpening, onOpen: onOpenOpening, onClose: onCloseOpening } = useDisclosure();
    const [openingForm, setOpeningForm] = useState({
      date: "",
      dateDisplay: "",
      rokadAmount: "",
      banks: [],
      remarks: "ઉઘડતી સિલક",
    });
    const [openingSubmitting, setOpeningSubmitting] = useState(false);
    const [existingOpening, setExistingOpening] = useState(null);
    const [openingEditMode, setOpeningEditMode] = useState(false);
    const [existingOpeningIds, setExistingOpeningIds] = useState([]);

    // Bank deposits list state
    const [bankDeposits, setBankDeposits] = useState([]);
    const [loadingDeposits, setLoadingDeposits] = useState(false);

    // const [showBulkUpload, setShowBulkUpload] = useState(false);
    // const [showReports, setShowReports] = useState(false);

 const [activeSection, setActiveSection] = useState(null);
// values: "bulk" | "report" | null



   const handleChange = (key, value) => {
    setForm((prev) => {
        const updated = { ...prev, [key]: value };

        // 🔴 IMPORTANT FIX: reset category on type change
        if (key === "vyavharType") {
            updated.category = "";
        }

        // clear bank fields if not bank
        if (key === "paymentMethod" && value !== "bank") {
            updated.bank = "";
            updated.ddCheckNum = "";
        }

        return updated;
    });
};


    const fetchCategories = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/categories`, {
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` }),
                }
            });
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            const grouped = { aavak: [], javak: [] };
            data.forEach(c => {
                if (c.type === 'aavak') grouped.aavak.push(c);
                if (c.type === 'javak') grouped.javak.push(c);
            });
            setCustomCategories(grouped);
        } catch (err) {
            console.error(err);
        }
    }, [API_BASE]);

    const fetchBanks = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/banks`, {
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` }),
                }
            });
            if (!res.ok) throw new Error("Failed to fetch banks");
            const data = await res.json();
            setBanks(data);
        } catch (err) {
            console.error(err);
        }
    }, [API_BASE]);

    const fetchBankDeposits = useCallback(async () => {
        try {
            setLoadingDeposits(true);
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/cashmel?category=બેંક જમા`, {
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` }),
                }
            });
            if (!res.ok) throw new Error("Failed to fetch bank deposits");
            const data = await res.json();
            // Get only aavak entries (bank deposits), not javak
            const deposits = data.data ? data.data.filter(d => d.vyavharType === 'aavak') : [];
            setBankDeposits(deposits);
        } catch (err) {
            console.error(err);
            toast({ title: "બેંક જમા લોડ કરવામાં ભૂલ", status: "error", duration: 2000 });
        } finally {
            setLoadingDeposits(false);
        }
    }, [API_BASE, toast]);

    useEffect(() => {
        fetchCategories();
        fetchBanks();
    }, [fetchCategories, fetchBanks]);

    // Fetch bank deposits when modal opens
    useEffect(() => {
        if (isOpenBankDeposit) {
            fetchBankDeposits();
        }
    }, [isOpenBankDeposit, fetchBankDeposits]);

    // Fetch existing opening seal when modal opens
    useEffect(() => {
        if (isOpenOpening) {
            fetchExistingOpening();
        }
    }, [isOpenOpening]);

    const fetchExistingOpening = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/cashmel?category=ઉઘડતી%20સિલક`, {
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` }),
                }
            });
            if (!res.ok) throw new Error("Failed to fetch opening seal");
            const data = await res.json();
            const openings = data.data ? data.data.filter(d => d.category === "ઉઘડતી સિલક") : [];
            
            if (openings.length > 0) {
                // If opening seal exists, populate form for editing
                setExistingOpening(openings);
                setOpeningEditMode(true);
                setExistingOpeningIds(openings.map(o => o._id));
                
                // Get the first opening seal date to populate the date field
                const firstOpening = openings[0];
                const dateParts = firstOpening.date ? firstOpening.date.split("-") : [];
                const displayDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : "";
                
                // Get rokad and bank entries from existing openings
                const rokadEntry = openings.find(o => o.paymentMethod === "rokad");
                const bankEntries = openings.filter(o => o.paymentMethod === "bank");
                
                setOpeningForm({
                    date: firstOpening.date || "",
                    dateDisplay: displayDate,
                    rokadAmount: rokadEntry ? rokadEntry.amount.toString() : "",
                    banks: bankEntries.map(b => ({ name: b.bank, amount: b.amount.toString() })),
                    remarks: firstOpening.remarks || "ઉઘડતી સિલક",
                });
            } else {
                // No existing opening seal, set to create mode
                setExistingOpening(null);
                setOpeningEditMode(false);
                setExistingOpeningIds([]);
                setOpeningForm({
                    date: "",
                    dateDisplay: "",
                    rokadAmount: "",
                    banks: [],
                    remarks: "ઉઘડતી સિલક",
                });
            }
        } catch (err) {
            console.error(err);
            // On error, allow creating new opening
            setExistingOpening(null);
            setOpeningEditMode(false);
        }
    };

    // Fetch data for editing if id is present
    useEffect(() => {
        if (id) {
            setLoading(true);
            const token = localStorage.getItem("token");
            fetch(`${API_BASE}/cashmel/${id}`, {
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` }),
                }
            })
                .then((res) => {
                    if (!res.ok) throw new Error("Failed to fetch");
                    return res.json();
                })
                .then((data) => {
                    const entry = data.data;
                    const dateParts = entry.date ? entry.date.split("-") : [];
                    const displayDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : "";
                    setForm({
                        date: entry.date || "",
                        dateDisplay: displayDate,
                        name: entry.name || "",
                        receiptPaymentNo: entry.receiptPaymentNo || "",
                        vyavharType: entry.vyavharType || "",
                        category: entry.category || "",
                        amount: entry.amount || "",
                        paymentMethod: entry.paymentMethod || "",
                        bank: entry.bank || "",
                        ddCheckNum: entry.ddCheckNum || "",
                        remarks: entry.remarks || "",
                        excelFile: null,
                        excelData: [],
                    });
                })
                .catch((err) => {
                    console.error("Failed to load entry for editing:", err);
                    toast({
                        title: "Failed to load entry for editing",
                        status: "error",
                        duration: 3000,
                        position: "top",
                    });
                })
                .finally(() => setLoading(false));
        }
    }, [id, API_BASE, toast]);

   
    const createBankApi = async (name) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/banks`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: JSON.stringify({ name }),
            });
            if (!res.ok) {
                const txt = await res.text();
                throw new Error(txt || 'Create failed');
            }
            await fetchBanks();
            toast({ title: 'બેંક સંગ્રહીત', status: 'success', duration: 2000 });
            return true;
        } catch (err) {
            console.error(err);
            toast({ title: 'બેંક સેવ થઈતી નથી', status: 'error' });
            return false;
        }
    };
  
    const editBankDeposit = (deposit) => {
        const dateParts = deposit.date ? deposit.date.split("-") : [];
        const displayDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : "";
        setModalForm({
            date: deposit.date || "",
            dateDisplay: displayDate,
            bank: deposit.bank || "",
            remarks: deposit.remarks || "",
            amount: deposit.amount?.toString() || "",
        });
        setEditingDepositId(deposit._id);
    };

    const deleteBankDeposit = async (depositId) => {
        if (!window.confirm("શું તમે આ બેંક જમા રદ કરવા માંગો છો?")) return;
        
        try {
            setLoadingDeposits(true);
            const token = localStorage.getItem("token");
            
            // Find the aavak deposit to delete
            const aavakDeposit = bankDeposits.find(d => d._id === depositId);
            if (!aavakDeposit) throw new Error("Deposit not found");
            
            // Find corresponding javak entry by date and amount
            const res = await fetch(`${API_BASE}/cashmel?category=બેંક જમા`, {
                headers: { ...(token && { Authorization: `Bearer ${token}` }) }
            });
            const data = await res.json();
            const javakDeposit = data.data?.find(d => 
                d.vyavharType === 'javak' && 
                d.date === aavakDeposit.date && 
                d.amount === aavakDeposit.amount
            );
            
            // Delete aavak entry
            await fetch(`${API_BASE}/cashmel/delete/${depositId}`, {
                method: "DELETE",
                headers: { ...(token && { Authorization: `Bearer ${token}` }) }
            });
            
            // Delete javak entry if found
            if (javakDeposit) {
                await fetch(`${API_BASE}/cashmel/delete/${javakDeposit._id}`, {
                    method: "DELETE",
                    headers: { ...(token && { Authorization: `Bearer ${token}` }) }
                });
            }
            
            toast({ title: "બેંક જમા રદ કરવામાં આવી", status: "success", duration: 2000 });
            fetchBankDeposits();
        } catch (err) {
            console.error(err);
            toast({ title: "રદ કરવામાં ભૂલ", status: "error", duration: 2000 });
        } finally {
            setLoadingDeposits(false);
        }
    };
    //         toast({ title: 'બેંક સેવ થઈતી નથી', status: 'error' });
    //         return false;
    //     }
    // };
  
    const submitOpeningToServer = async () => {
      // Create opening balance entries (aavak) for rokad and all banks as provided
      const rokad = openingForm.rokadAmount || "";
      const hasBankAmounts = openingForm.banks && openingForm.banks.length > 0 && openingForm.banks.some(b => b.amount && Number(b.amount) > 0);
      
      if (!rokad && !hasBankAmounts) {
        toast({ title: "કૃપા કરીને રોકડ અથવા બેંક રકમ દાખલ કરો", status: "error", duration: 2500 });
        return;
      }

      setOpeningSubmitting(true);
      try {
        const dateIso = openingForm.date || convertToISO(openingForm.dateDisplay || "");
        const token = localStorage.getItem("token");

        // If in edit mode, delete old opening entries first
        if (openingEditMode && existingOpeningIds.length > 0) {
          for (const id of existingOpeningIds) {
            try {
              const res = await fetch(`${API_BASE}/cashmel/${id}`, {
                method: "DELETE",
                headers: {
                  ...(token && { Authorization: `Bearer ${token}` })
                }
              });
              if (!res.ok) {
                console.error(`Failed to delete old opening entry ${id}`);
              }
            } catch (err) {
              console.error(`Error deleting old opening entry: ${err}`);
            }
          }
        }

        // If rokad amount provided -> create AAVAK (income) to increase cash opening
        if (rokad && Number(rokad) > 0) {
          const p = new FormData();
          p.append("date", dateIso || "");
          p.append("name", (openingForm.remarks || "ઉઘડતી સિલક").slice(0, 100));
          p.append("receiptPaymentNo", "");
          p.append("vyavharType", "aavak");
          p.append("category", "ઉઘડતી સિલક");
          p.append("amount", rokad);
          p.append("paymentMethod", "rokad");
          p.append("bank", "");
          p.append("ddCheckNum", "");
          p.append("remarks", openingForm.remarks || "ઉઘડતી સિલક");

          const r1 = await fetch(`${API_BASE}/cashmel`, { method: "POST", body: p, headers: { ...(token && { Authorization: `Bearer ${token}` }) } });
          if (!r1.ok) {
            const txt = await r1.text();
            throw new Error(txt || "Failed to save rokad opening");
          }
        }

        // Create AAVAK entries for each bank with amount
        if (openingForm.banks && openingForm.banks.length > 0) {
          for (const bankEntry of openingForm.banks) {
            if (bankEntry.amount && Number(bankEntry.amount) > 0) {
              const p2 = new FormData();
              p2.append("date", dateIso || "");
              p2.append("name", (openingForm.remarks || "ઉઘડતી સિલક").slice(0, 100));
              p2.append("receiptPaymentNo", "");
              p2.append("vyavharType", "aavak");
              p2.append("category", "ઉઘડતી સિલક");
              p2.append("amount", bankEntry.amount);
              p2.append("paymentMethod", "bank");
              p2.append("bank", bankEntry.name || "");
              p2.append("ddCheckNum", "");
              p2.append("remarks", openingForm.remarks || "ઉઘડતી સિલક");

              const r2 = await fetch(`${API_BASE}/cashmel`, { method: "POST", body: p2, headers: { ...(token && { Authorization: `Bearer ${token}` }) } });
              if (!r2.ok) {
                const txt = await r2.text();
                throw new Error(txt || `Failed to save bank opening for ${bankEntry.name}`);
              }
            }
          }
        }

        toast({ title: openingEditMode ? "ઉઘડતી સિલક અપડેટ થઈ ગઈ" : "ઉઘડતી સિલક સેવ થઈ ગઈ", status: "success", duration: 2500 });
        setOpeningForm({ date: "", dateDisplay: "", rokadAmount: "", banks: [], remarks: "ઉઘડતી સિલક" });
        setExistingOpening(null);
        setOpeningEditMode(false);
        setExistingOpeningIds([]);
        onCloseOpening();
      } catch (err) {
        console.error(err);
        toast({ title: "સંગ્રહમાં ભૂલ", description: err.message || "કૃપા કરીને ફરી પ્રયાસ કરો", status: "error", duration: 4000 });
      } finally {
        setOpeningSubmitting(false);
      }
    };

    const submitBankDepositToServer = async () => {
      if (!bankDepositForm.bank || !bankDepositForm.amount || !bankDepositForm.dateDisplay) {
        toast({ title: "કૃપા કરીને તમામ ફીલ્ડ ભરો", status: "error", duration: 2500 });
        return;
      }

      setBankDepositSubmitting(true);
      try {
        // Prepare common values
        const dateIso = bankDepositForm.date || convertToISO(bankDepositForm.dateDisplay || "");
        const amount = bankDepositForm.amount;
        const remarks = bankDepositForm.remarks || "બેંક જમા";
        const bankName = bankDepositForm.bank || "";
        const token = localStorage.getItem("token");

        if (editingDepositId) {
          // UPDATE existing deposit
          const fd = new FormData();
          fd.append("date", dateIso || "");
          fd.append("bank", bankName);
          fd.append("remarks", remarks);
          fd.append("amount", amount);

          const res = await fetch(`${API_BASE}/cashmel/${editingDepositId}`, {
            method: "POST",
            body: fd,
            headers: { ...(token && { Authorization: `Bearer ${token}` }) },
          });

          if (!res.ok) {
            const txt = await res.text();
            throw new Error(txt || "Failed to update");
          }

          toast({ title: "બેંક જમા અપડેટ થયું", status: "success", duration: 2500 });
          setEditingDepositId(null);
          setBankDepositForm({ date: "", dateDisplay: "", bank: "", remarks: "", amount: "" });
          onCloseBankDeposit();
          fetchBankDeposits();
        } else {
          // CREATE new deposit entries
          // 1) Create a JAVAK entry to reduce cash (rokad) -> expense from cash
          const javakPayload = new FormData();
          javakPayload.append("date", dateIso || "");
          javakPayload.append("name", remarks.slice(0, 100));
          javakPayload.append("receiptPaymentNo", "");
          javakPayload.append("vyavharType", "javak");
          javakPayload.append("category", "બેંક જમા");
          javakPayload.append("amount", amount);
          javakPayload.append("paymentMethod", "rokad");
          javakPayload.append("bank", "");
          javakPayload.append("ddCheckNum", "");
          javakPayload.append("remarks", remarks);

          const res1 = await fetch(`${API_BASE}/cashmel`, {
            method: "POST",
            body: javakPayload,
            headers: { ...(token && { Authorization: `Bearer ${token}` }) },
          });

          if (!res1.ok) {
            const txt = await res1.text();
            throw new Error(txt || "Failed to save cash (javak) entry");
          }

          // 2) Create an AAVAK entry to add to bank -> income to bank
          const aavakPayload = new FormData();
          aavakPayload.append("date", dateIso || "");
          aavakPayload.append("name", remarks.slice(0, 100));
          aavakPayload.append("receiptPaymentNo", "");
          aavakPayload.append("vyavharType", "aavak");
          aavakPayload.append("category", "બેંક જમા");
          aavakPayload.append("amount", amount);
          aavakPayload.append("paymentMethod", "bank");
          aavakPayload.append("bank", bankName);
          aavakPayload.append("ddCheckNum", "");
          aavakPayload.append("remarks", remarks);

          const res2 = await fetch(`${API_BASE}/cashmel`, {
            method: "POST",
            body: aavakPayload,
            headers: { ...(token && { Authorization: `Bearer ${token}` }) },
          });

          if (!res2.ok) {
            const txt = await res2.text();
            throw new Error(txt || "Failed to save bank (aavak) entry");
          }

          toast({ title: "બેંક જમા સફળતાપૂર્વક નોંધાઈ ગઈ", status: "success", duration: 2500 });
          setBankDepositForm({ date: "", dateDisplay: "", bank: "", remarks: "", amount: "" });
          onCloseBankDeposit();
          fetchBankDeposits();
        }
      } catch (err) {
        console.error(err);
        toast({ title: "સંગ્રહમાં ભૂલ", description: err.message || "કૃપા કરીને ફરી પ્રયાસ કરો", status: "error", duration: 4000 });
      } finally {
        setBankDepositSubmitting(false);
      }
    };

  
  
 

  const handleExcelFileChange = async (e) => {
  const f = e.target.files?.[0];
  if (!f) return;

  // 🔹 store file in form
  setForm((p) => ({ ...p, excelFile: f }));

  const data = await f.arrayBuffer();
  const wb = XLSX.read(data);
  const first = wb.Sheets[wb.SheetNames[0]];
const json = XLSX.utils.sheet_to_json(first, { header: 0 });

const fixedJson = json.map((row) => {
  const newRow = {};

  Object.entries(row).forEach(([key, value]) => {
    // 🔹 Detect date columns by name OR value
    const isDateColumn =
      /date/i.test(key) ||              // header contains "date"
      /તારીખ/.test(key);                // Gujarati "date"

    if (isDateColumn && typeof value === "number") {
      newRow[key] = excelSerialToDDMMYYYY(value);
    } else {
      newRow[key] = value;
    }
  });

  return newRow;
});

setForm((p) => ({ ...p, excelData: fixedJson }));


  toast({
    title: "Excel ફાઇલ વંચાઈ ગઈ",
    status: "info",
    duration: 2000,
  });
};

const cancelExcelUpload = () => {
  setForm((prev) => ({
    ...prev,
    excelFile: null,
    excelData: [],
  }));

  // 🔥 reset file input
  if (fileInputRef.current) {
    fileInputRef.current.value = "";
  }

//   toast({
//     title: "Excel અપલોડ રદ કરવામાં આવ્યો",
//     status: "warning",
//     duration: 2000,
//   });
};



    const downloadSampleExcel = async () => {
      // Download both aavak.xlsx and javak.xlsx from the uploads folder
      try {
        const urls = [
          `${API_BASE}/uploads/aavak.xlsx`,
          `${API_BASE}/uploads/javak.xlsx`,
        ];

        const token = localStorage.getItem("token");

        const fetchOptions = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {};

        const results = await Promise.all(urls.map(u => fetch(u, fetchOptions)));

        for (let i = 0; i < results.length; i++) {
          const res = results[i];
          if (!res.ok) throw new Error(`Failed to download ${urls[i]}`);
          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          // set filename based on url
          const name = urls[i].split('/').pop() || `sample_${i}.xlsx`;
          a.download = name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }

        toast({ title: "Sample Excel દાવનલોડ થયું!", status: "success" });
      } catch (err) {
        console.error(err);
        toast({ title: "ડાઉનલોડમાં ભૂલ", status: "error" });
      }
    };

// 🔥 આ function તમારી CashMelForm.jsx માં replace કરો

const uploadExcelToServer = async () => {
  if (!form.excelFile) {
    toast({ title: "પહેલા ફાઇલ પસંદ કરો", status: "error" });
    return;
  }

  const fd = new FormData();
  fd.append("file", form.excelFile);

  const token = localStorage.getItem("token");
  if (!token) {
    toast({ title: "લૉગિન જરૂરી છે", status: "error" });
    return;
  }

  setBulkLoading(true);

  try {
    const res = await fetch(`${API_BASE}/cashmel/upload-excel`, {
      method: "POST",
      body: fd,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    // ❌ Error Response - Validation errors
    if (!res.ok || !data.success) {
      
      // 📋 If detailed validation errors exist
      if (data.details && data.details.length > 0) {
        const errorSummary = `${data.message || "Excel અપલોડમાં ભૂલ"}\n\n📊 કુલ ભૂલો: ${data.details.length}\n\n`;
        
        // Show first 8 errors in alert
        const errorDetails = data.details.slice(0, 8).map(err => {
          const errorType = err.type || err.sheet || "અજ્ઞાત";
          const rowNum = err.row || "અજ્ઞાત";
          const reasonsText = Array.isArray(err.reasons) && err.reasons.length > 0
            ? err.reasons.map(r => `   ❌ ${r || "અજ્ઞાત ભૂલ"}`).join('\n')
            : "   ❌ કોઈ કારણ નથી";
          return `📍 ${errorType} - પંક્તિ ${rowNum}:\n${reasonsText}`;
        }).join('\n\n');

        const moreErrors = data.details.length > 8 
          ? `\n\n... અને ${data.details.length - 8} વધુ ભૂલો` 
          : '';

        alert(errorSummary + errorDetails + moreErrors + "\n\n✅ આ બધી ભૂલો સુધારીને ફરી અપલોડ કરો.");
        
        console.log("📋 Validation Errors:");
        console.table(data.details);
      } 
      else {
        toast({
          title: data.message || "અપલોડમાં ભૂલ",
          description: data.userFriendlyMessage || "કૃપા કરીને ફાઇલ તપાસો",
          status: "error",
          duration: 5000,
        });
      }
      return;
    }

    // ⚠️ Warning Response - All duplicates, nothing saved
    if (data.success && data.warning && data.savedCount === 0) {
      toast({
        title: "⚠️ ચેતવણી!",
        description: `બધી ${data.skippedCount} entries પહેલેથી database માં છે.\n\nકંઈ નવું સેવ થયું નથી.`,
        status: "warning",
        duration: 6000,
        isClosable: true,
      });
      
      console.log("⚠️ All entries were duplicates:");
      console.table(data.skipped);
      
      cancelExcelUpload();
      return;
    }

    // ✅ Success Response
    let successMsg = `સફળતાપૂર્વક સેવ થયું!\n\n`;
    
    successMsg += `📥 આવક: ${data.aavakCount}\n`;
    successMsg += `📤 જાવક: ${data.javakCount}`;
    
    if (data.skippedCount > 0) {
      successMsg += `\n⏭️ ડુપ્લિકેટ: ${data.skippedCount}`;
    }

    toast({
      title: "સફળતા!",
      description: successMsg,
      status: "success",
      duration: 5000,
      isClosable: true,
    });

    // Show warning if some were duplicates
    if (data.skippedCount > 0) {
      setTimeout(() => {
        toast({
          title: "નોંધ",
          description: `${data.skippedCount} duplicates છોડી દેવામાં આવી`,
          status: "info",
          duration: 3000,
        });
      }, 1000);
    }

    cancelExcelUpload();

  } catch (err) {
    console.error("Upload error:", err);
    toast({
      title: "અપલોડમાં ભૂલ",
      description: "સર્વર સાથે જોડાણમાં સમસ્યા. ફરી પ્રયાસ કરો.",
      status: "error",
      duration: 5000,
    });
  } finally {
    setBulkLoading(false);
  }
};

  const isCategoryValidForType = (type, category) => {
    if (!type || !category) return false;
    const list = type === "aavak" ? customCategories.aavak : customCategories.javak;
    return list.some((c) => c.name === category);
  };

  const handleSubmit = async () => {
    if (
      !form.date ||
      !form.name ||
      !form.receiptPaymentNo ||
      !form.vyavharType ||
      !form.category ||
      !isCategoryValidForType(form.vyavharType, form.category) ||
      !form.amount ||
      !form.paymentMethod ||
      (form.paymentMethod === "bank" && !form.bank)
    ) {
      toast({
        title: "કૃપા કરીને બધી  જરૂરી ફીલ્ડ ભરો",
        status: "error",
        duration: 3000,
        position: "top",
      });
      return;
    }

    setSubmitLoading(true);

    try {
      const fd = new FormData();
      fd.append("date", form.date);
      fd.append("name", form.name);
      fd.append("receiptPaymentNo", form.receiptPaymentNo);
      fd.append("vyavharType", form.vyavharType);
      fd.append("category", form.category);
      fd.append("amount", form.amount);
      fd.append("paymentMethod", form.paymentMethod);
      if (form.paymentMethod === "bank") fd.append("bank", form.bank);
      fd.append("ddCheckNum", form.ddCheckNum);
      fd.append("remarks", form.remarks);
      if (form.excelFile) fd.append("excel", form.excelFile);

      const url = `${API_BASE}/cashmel${id ? "/" + id : ""}`;
      const token = localStorage.getItem("token");

      const res = await fetch(url, {
        method: "POST",
        body: fd,
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed");
      }

      toast({ title: "સફળતાપૂર્વક સેવ થયું!", status: "success", duration: 3000 });

      if (id) {
        navigate("/cashmel/details");
      } else {
        setForm({
          date: "",
          dateDisplay: "",
          name: "",
          receiptPaymentNo: "",
          vyavharType: "",
          category: "",
          amount: "",
          paymentMethod: "",
          bank: "",
          ddCheckNum: "",
          remarks: "",
          excelFile: null,
          excelData: [],
        });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "ડેટા સેવ કરવામાં ભૂલ", status: "error" });
    } finally {
      setSubmitLoading(false);
    }
  };

    const applyModalToForm = () => {
      if (!modalForm.amount) {
        toast({ title: "રકમ દાખલ કરો", status: "error", duration: 2000 });
        return;
      }

      handleChange("date", modalForm.date);
      handleChange("dateDisplay", modalForm.dateDisplay);
      handleChange("paymentMethod", "bank");
      handleChange("bank", modalForm.bank);
      handleChange("amount", modalForm.amount);
      handleChange("remarks", modalForm.remarks);

      onClose();
    };

    const submitModalToServer = async () => {
      if (!modalForm.amount) {
        toast({ title: "રકમ દાખલ કરો", status: "error", duration: 2000 });
        return;
      }

      setModalSubmitting(true);
      try {
        // Prepare common values
        const dateIso = modalForm.date || convertToISO(modalForm.dateDisplay || "");
        const amount = modalForm.amount;
        const remarks = modalForm.remarks || "બેંક જમા";
        const bankName = modalForm.bank || "";
        const token = localStorage.getItem("token");

        if (editingDepositId) {
          // UPDATE existing deposit
          const fd = new FormData();
          fd.append("date", dateIso || "");
          fd.append("bank", bankName);
          fd.append("remarks", remarks);
          fd.append("amount", amount);

          const res = await fetch(`${API_BASE}/cashmel/${editingDepositId}`, {
            method: "POST",
            body: fd,
            headers: { ...(token && { Authorization: `Bearer ${token}` }) },
          });

          if (!res.ok) {
            const txt = await res.text();
            throw new Error(txt || "Failed to update");
          }

          toast({ title: "બેંક જમા અપડેટ થયું", status: "success", duration: 2500 });
          setEditingDepositId(null);
          setModalForm({ date: "", dateDisplay: "", bank: "", remarks: "", amount: "" });
          onClose();
          fetchBankDeposits();
        } else {
          // CREATE new deposit entries
          // 1) Create a JAVAK entry to reduce cash (rokad) -> expense from cash
          const javakPayload = new FormData();
          javakPayload.append("date", dateIso || "");
          javakPayload.append("name", remarks.slice(0, 100));
          javakPayload.append("receiptPaymentNo", "");
          javakPayload.append("vyavharType", "javak");
          javakPayload.append("category", "બેંક જમા");
          javakPayload.append("amount", amount);
          javakPayload.append("paymentMethod", "rokad");
          javakPayload.append("bank", "");
          javakPayload.append("ddCheckNum", "");
          javakPayload.append("remarks", remarks);

          const res1 = await fetch(`${API_BASE}/cashmel`, {
            method: "POST",
            body: javakPayload,
            headers: { ...(token && { Authorization: `Bearer ${token}` }) },
          });

          if (!res1.ok) {
            const txt = await res1.text();
            throw new Error(txt || "Failed to save cash (javak) entry");
          }

          // 2) Create an AAVAK entry to add to bank -> income to bank
          const aavakPayload = new FormData();
          aavakPayload.append("date", dateIso || "");
          aavakPayload.append("name", remarks.slice(0, 100));
          aavakPayload.append("receiptPaymentNo", "");
          aavakPayload.append("vyavharType", "aavak");
          aavakPayload.append("category", "બેંક જમા");
          aavakPayload.append("amount", amount);
          aavakPayload.append("paymentMethod", "bank");
          aavakPayload.append("bank", bankName);
          aavakPayload.append("ddCheckNum", "");
          aavakPayload.append("remarks", remarks);

          const res2 = await fetch(`${API_BASE}/cashmel`, {
            method: "POST",
            body: aavakPayload,
            headers: { ...(token && { Authorization: `Bearer ${token}` }) },
          });

          if (!res2.ok) {
            const txt = await res2.text();
            throw new Error(txt || "Failed to save bank (aavak) entry");
          }

          toast({ title: "બેંક જમા સફળતાપૂર્વક નોંધાઈ ગઈ", status: "success", duration: 2500 });
          setModalForm({ date: "", dateDisplay: "", bank: "", remarks: "", amount: "" });
          onClose();
          fetchBankDeposits();
        }
      } catch (err) {
        console.error(err);
        toast({ title: "સંગ્રહમાં ભૂલ", description: err.message || "કૃપા કરીને ફરી પ્રયાસ કરો", status: "error", duration: 4000 });
      } finally {
        setModalSubmitting(false);
      }
    };

    const cancelEditDeposit = () => {
      setEditingDepositId(null);
      setModalForm({ date: "", dateDisplay: "", bank: "", remarks: "", amount: "" });
    };

    /* ==================== UI ==================== */
    return (
        <Box p={8} maxW="900px" mx="auto" bg="#F8FAF9" minH="100vh">
        <Flex align="center" mb={6}>
    {/* 🔙 LEFT */}
    <Box width="180px">
        <Button
            leftIcon={<FiArrowLeft />}
            colorScheme="green"
            variant="outline"
            onClick={() => navigate(id ? "/cashmel/details" : "/dashboard")}
        >
            પાછા જાવ
        </Button>
    </Box>

    {/* 🟢 CENTER */}
    <Heading
        flex="1"
        textAlign="center"
        color="#1E4D2B"
        fontWeight="700"
    >
        {id ? t("updateCashmel") : t("cashMelForm")}
    </Heading>

    {/* 👉 RIGHT */}
    <Box width="180px" textAlign="right">
        <Button
            colorScheme="green"
            rounded="lg"
            size="md"
            onClick={() => navigate("/cashmel/details")}
        >
            ક્રિયાઓ
        </Button>
    </Box>
</Flex>


            <Box p={6} bg="white" rounded="2xl" shadow="md" borderWidth="1px">

                <Flex mb={4} align="center" justify="space-between">
                  <Heading size="md" color="green.700" borderLeft="4px solid #2A7F62" pl={3}>
                    {t("entryDetails")}
                  </Heading>
                  <HStack spacing={2}>
                    <Button size="sm" colorScheme={openingEditMode ? "cyan" : "purple"} onClick={onOpenOpening}>
                      {openingEditMode ? "✓ ઉઘડતી સિલક (ફેર કરો)" : "ઉઘડતી સિલક"}
                    </Button>
                    <Button size="sm" colorScheme="blue" onClick={onOpenBankDeposit}>
                      બેંક જમા
                    </Button>
                  </HStack>
                </Flex>

                {/* Opening balance modal (ઉઘડતી સિલક) */}
                <Modal isOpen={isOpenOpening} onClose={onCloseOpening} size="lg">
                  <ModalOverlay />
                  <ModalContent>
                    <ModalHeader>
                      {openingEditMode ? "ઉઘડતી સિલક ફેરફાર" : "ઉઘડતી સિલક સમાવેશ"}
                      {openingEditMode && (
                        <Box fontSize="sm" color="blue.600" mt={1} fontWeight="normal">
                          (પહેલેથી અસ્તિત્વમાં છે)
                        </Box>
                      )}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                      <VStack spacing={4} align="stretch">
                        <DateInput
                          label={t("date")}
                          formValue={openingForm}
                          setFormValue={setOpeningForm}
                          formatDisplayDate={formatDisplayDate}
                          convertToISO={convertToISO}
                          t={t}
                        />

                        <FormControl>
                          <FormLabel fontWeight="600">રોકડ ઉઘડતી રકમ</FormLabel>
                          <Input size="lg" bg="gray.100" value={toGujaratiDigits(openingForm.rokadAmount)} onChange={(e) => {
                            const englishValue = gujaratiToEnglishDigits(e.target.value).replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
                            setOpeningForm(p => ({ ...p, rokadAmount: englishValue }));
                          }} />
                        </FormControl>

                        <Box borderTop="2px solid #e2e8f0" pt={4}>
                          <Flex justify="space-between" align="center" mb={3}>
                            <FormLabel fontWeight="600" mb={0}>બેંક ઉઘડતી રકમ</FormLabel>
                            <Button 
                              size="sm" 
                              colorScheme="green" 
                              onClick={() => {
                                setOpeningForm(p => ({
                                  ...p,
                                  banks: [...(p.banks || []), { name: "", amount: "" }]
                                }));
                              }}
                            >
                              + બેંક ઉમેરો
                            </Button>
                          </Flex>

                          {openingForm.banks && openingForm.banks.length > 0 && (
                            <VStack spacing={3} align="stretch">
                              {openingForm.banks.map((bankEntry, idx) => (
                                <HStack key={idx} spacing={2}>
                                  <Select 
                                    size="lg" 
                                    bg="gray.100" 
                                    placeholder="બેંક પસંદ કરો"
                                    value={bankEntry.name} 
                                    onChange={(e) => {
                                      const newBanks = [...openingForm.banks];
                                      newBanks[idx].name = e.target.value;
                                      setOpeningForm(p => ({ ...p, banks: newBanks }));
                                    }}
                                  >
                                    {banks.map(b => (
                                      <option key={b._id} value={b.name}>{b.name}</option>
                                    ))}
                                  </Select>
                                  <Input 
                                    size="lg" 
                                    bg="gray.100" 
                                    placeholder="રકમ"
                                    value={toGujaratiDigits(bankEntry.amount)} 
                                    onChange={(e) => {
                                      const englishValue = gujaratiToEnglishDigits(e.target.value).replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
                                      const newBanks = [...openingForm.banks];
                                      newBanks[idx].amount = englishValue;
                                      setOpeningForm(p => ({ ...p, banks: newBanks }));
                                    }}
                                  />
                                  <Button 
                                    colorScheme="red" 
                                    size="lg"
                                    onClick={() => {
                                      const newBanks = openingForm.banks.filter((_, i) => i !== idx);
                                      setOpeningForm(p => ({ ...p, banks: newBanks }));
                                    }}
                                  >
                                    −
                                  </Button>
                                </HStack>
                              ))}
                            </VStack>
                          )}
                        </Box>
                      </VStack>
                    </ModalBody>

                    <ModalFooter>
                      <Button mr={3} onClick={() => { onCloseOpening(); }}>
                        રદ કરો
                      </Button>
                      <Button colorScheme="purple" onClick={submitOpeningToServer} isLoading={openingSubmitting}>
                        {openingEditMode ? "અપડેટ" : "સેવ"}
                      </Button>
                    </ModalFooter>
                  </ModalContent>
                </Modal>

                {/* Bank Deposit Modal */}
                <Modal isOpen={isOpenBankDeposit} onClose={onCloseBankDeposit} size="2xl">
                  <ModalOverlay />
                  <ModalContent>
                    <ModalHeader>બેંક જમા સમાવેશ</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                      <VStack spacing={5} align="stretch">
                        {/* Input Form */}
                        <Box borderBottom="2px solid #e2e8f0" pb={4}>
                          <Heading size="sm" mb={4} color="blue.700">
                            {editingDepositId ? "બેંક જમા ફેરફાર" : "બેંક જમા ઉમેરો"}
                          </Heading>
                          
                          <VStack spacing={3}>
                            <DateInput
                              label={t("date")}
                              formValue={bankDepositForm}
                              setFormValue={setBankDepositForm}
                              formatDisplayDate={formatDisplayDate}
                              convertToISO={convertToISO}
                              t={t}
                            />

                            <FormControl isRequired>
                              <FormLabel fontWeight="600">બેંક</FormLabel>
                              <Select 
                                size="lg" 
                                bg="gray.100" 
                                placeholder="બેંક પસંદ કરો"
                                value={bankDepositForm.bank} 
                                onChange={(e) => setBankDepositForm(p => ({ ...p, bank: e.target.value }))}
                              >
                                {banks.map(b => (
                                  <option key={b._id} value={b.name}>{b.name}</option>
                                ))}
                              </Select>
                            </FormControl>

                            <FormControl isRequired>
                              <FormLabel fontWeight="600">રકમ</FormLabel>
                              <Input 
                                size="lg" 
                                bg="gray.100" 
                                placeholder="રકમ દાખલ કરો"
                                value={toGujaratiDigits(bankDepositForm.amount)} 
                                onChange={(e) => {
                                  const englishValue = gujaratiToEnglishDigits(e.target.value).replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
                                  setBankDepositForm(p => ({ ...p, amount: englishValue }));
                                }}
                              />
                            </FormControl>

                            <FormControl>
                              <FormLabel fontWeight="600">નોંધ</FormLabel>
                              <Input 
                                size="lg" 
                                bg="gray.100" 
                                placeholder="નોંધ (વૈકલ્પિક)"
                                value={bankDepositForm.remarks}
                                onChange={(e) => setBankDepositForm(p => ({ ...p, remarks: e.target.value }))}
                              />
                            </FormControl>

                            <HStack spacing={2} w="full">
                              {editingDepositId && (
                                <Button colorScheme="gray" flex={1} onClick={() => {
                                  setEditingDepositId(null);
                                  setBankDepositForm({ date: "", dateDisplay: "", bank: "", remarks: "", amount: "" });
                                }}>
                                  રદ કરો
                                </Button>
                              )}
                              <Button colorScheme="blue" flex={1} onClick={submitBankDepositToServer} isLoading={bankDepositSubmitting}>
                                {editingDepositId ? "અપડેટ" : "ઉમેરો"}
                              </Button>
                            </HStack>
                          </VStack>
                        </Box>

                        {/* Deposits List */}
                        {/* {bankDeposits.length > 0 && (
                          <Box>
                            <Heading size="sm" mb={3} color="green.700">
                              બેંક જમા યાદી ({bankDeposits.length})
                            </Heading>
                            <TableContainer>
                              <Table size="sm" variant="striped">
                                <Thead bg="green.50">
                                  <Tr>
                                    <Th>તારીખ</Th>
                                    <Th>બેંક</Th>
                                    <Th isNumeric>રકમ</Th>
                                    <Th>નોંધ</Th>
                                    <Th>ક્રિયા</Th>
                                  </Tr>
                                </Thead>
                                <Tbody>
                                  {bankDeposits.map((deposit) => (
                                    <Tr key={deposit._id}>
                                      <Td>{deposit.date}</Td>
                                      <Td>{deposit.bank}</Td>
                                      <Td isNumeric fontWeight="600" color="blue.600">
                                        {toGujaratiDigits(deposit.amount)}
                                      </Td>
                                      <Td fontSize="sm">{deposit.remarks}</Td>
                                      <Td>
                                        <HStack spacing={1}>
                                          <IconButton
                                            icon={<FiEdit2 />}
                                            size="sm"
                                            colorScheme="blue"
                                            variant="ghost"
                                            onClick={() => {
                                              const dateParts = deposit.date ? deposit.date.split("-") : [];
                                              const displayDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : "";
                                              setBankDepositForm({
                                                date: deposit.date || "",
                                                dateDisplay: displayDate,
                                                bank: deposit.bank || "",
                                                remarks: deposit.remarks || "",
                                                amount: deposit.amount?.toString() || "",
                                              });
                                              setEditingDepositId(deposit._id);
                                            }}
                                          />
                                          <IconButton
                                            icon={<FiTrash2 />}
                                            size="sm"
                                            colorScheme="red"
                                            variant="ghost"
                                            onClick={() => {
                                              if (window.confirm("શું તમે આ બેંક જમા રદ કરવા માંગો છો?")) {
                                                deleteBankDeposit(deposit._id);
                                              }
                                            }}
                                          />
                                        </HStack>
                                      </Td>
                                    </Tr>
                                  ))}
                                </Tbody>
                              </Table>
                            </TableContainer>
                          </Box>
                        )} */}
                      </VStack>
                    </ModalBody>

                    <ModalFooter>
                      <Button onClick={() => { 
                        onCloseBankDeposit();
                        setEditingDepositId(null);
                        setBankDepositForm({ date: "", dateDisplay: "", bank: "", remarks: "", amount: "" });
                      }}>
                        બંધ કરો
                      </Button>
                    </ModalFooter>
                  </ModalContent>
                </Modal>
                 
              

                <VStack spacing={4}>

                    {/* DATE */}
                    {/* <FormControl isRequired>
                        <FormLabel fontWeight="600">{t("date")}</FormLabel>
                        <Input
                            type="text"
                            placeholder="DD/MM/YYYY"
                            size="lg"
                            bg="gray.100"
                            value={form.dateDisplay}
                            onChange={(e) => {
                                const display = formatDisplayDate(e.target.value);
                                const iso = convertToISO(display);
                                handleChange("dateDisplay", display);
                                handleChange("date", iso);
                            }}
                        />
                    </FormControl> */}
                    
                    <DateInput
                    label={t("date")}
    formValue={form}
    setFormValue={setForm}
    formatDisplayDate={formatDisplayDate}
    convertToISO={convertToISO}
    t={t}
    
/>



                  

                    {/* NAME */}
                    <FormControl isRequired>
                        <FormLabel fontWeight="600">{t("giverandrecipient")}</FormLabel>
                        <Input
                            size="lg"
                            bg="gray.100"
                            value={form.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                        />
                    </FormControl>

                    {/* RECEIPT / PAYMENT NO */}
                    <FormControl isRequired>
                        <FormLabel fontWeight="600">{t("receiptPaymentNo")}</FormLabel>
                        <Input
                            type="text"  
                            size="lg"
                            bg="gray.100"
                            value={toGujaratiDigits(form.receiptPaymentNo)}  
                            onChange={(e) => {
                                const englishValue = gujaratiToEnglishDigits(e.target.value);
                                handleChange("receiptPaymentNo", englishValue);
                            }}
                            placeholder=""
                        />
                    </FormControl>

                

                    {/* VYAVHAR TYPE */}
                    <FormControl isRequired>
                        <FormLabel fontWeight="600">{t("vyavharType")}</FormLabel>
                        <Select
                            size="lg"
                            bg="gray.100"
                            value={form.vyavharType}
                            onChange={(e) => handleChange("vyavharType", e.target.value)}
                        >
                            <option value="">{t("select")}</option>
                            <option value="aavak">{t("aavak")}</option>
                            <option value="javak">{t("javak")}</option>
                        </Select>
                    </FormControl>

                    {/* CATEGORY */}
                 <FormControl isRequired>
  <FormLabel fontWeight="600">{t("selectCategory")}</FormLabel>

  <Select
    size="lg"
    bg="gray.100"
    value={form.category}
    isDisabled={!form.vyavharType}
    onChange={(e) => handleChange("category", e.target.value)}
  >
    <option value="">{t("selectCategory")}</option>

    {form.vyavharType === "aavak" &&
      customCategories.aavak.map((c) => (
        <option key={c._id} value={c.name}>
          {c.name}
        </option>
      ))}

    {form.vyavharType === "javak" &&
      customCategories.javak.map((c) => (
        <option key={c._id} value={c.name}>
          {c.name}
        </option>
      ))}
  </Select>
</FormControl>


                    {/* AMOUNT */}
                    <FormControl isRequired>
                        <FormLabel fontWeight="600">{t("amount")}</FormLabel>
                       <Input
    type="text"
    size="lg"
    bg="gray.100"
    value={toGujaratiDigits(form.amount)}
    onChange={(e) => {
        let englishValue = gujaratiToEnglishDigits(e.target.value);

        // ✅ Allow numbers + only ONE decimal
        englishValue = englishValue
            .replace(/[^0-9.]/g, "")     // numbers + dot allowed
            .replace(/(\..*)\./g, "$2"); // only two dot

        handleChange("amount", englishValue);
    }}
    placeholder=""
/>

                    </FormControl>

                    {/* PAYMENT METHOD */}
                    <FormControl isRequired>
                        <FormLabel fontWeight="600">કેવી રીતે આપ્યા</FormLabel>
                        <Select
                            size="lg"
                            bg="gray.100"
                            value={form.paymentMethod}
                            onChange={(e) => handleChange("paymentMethod", e.target.value)}
                        >
                            <option value="">{t("select")}</option>
                            <option value="rokad">રોકડ</option>
                            <option value="bank">બેંક</option>
                        </Select>
                    </FormControl>

                    {/* BANK - only if bank selected */}
                    {form.paymentMethod === "bank" && (
                        <FormControl isRequired>
                            <FormLabel fontWeight="600">બેંક</FormLabel>
                            <HStack spacing={2}>
                                <Select
                                    size="lg"
                                    bg="gray.100"
                                    value={form.bank}
                                    onChange={(e) => handleChange("bank", e.target.value)}
                                >
                                    <option value="">{t("select")}</option>
                                    {banks.map(bank => (
                                        <option key={bank._id} value={bank.name}>{bank.name}</option>
                                    ))}
                                </Select>
                                <Button size="lg" colorScheme="blue" onClick={() => setShowAddBank(!showAddBank)}>
                                    +
                                </Button>
                            </HStack>
                            {showAddBank && (
                                <VStack spacing={2} mt={2} align="stretch">
                                    <Input
                                        size="lg"
                                        bg="gray.100"
                                        placeholder="નવી બેંકનું નામ"
                                        value={newBankName}
                                        onChange={(e) => setNewBankName(e.target.value)}
                                    />
                                    <HStack spacing={2}>
                                        <Button
                                            size="sm"
                                            colorScheme="green"
                                            onClick={async () => {
                                                if (!newBankName.trim()) return;
                                                const ok = await createBankApi(newBankName.trim());
                                                if (ok) {
                                                    setNewBankName("");
                                                    setShowAddBank(false);
                                                }
                                            }}
                                        >
                                            ઉમેરો
                                        </Button>
                                        <Button size="sm" onClick={() => setShowAddBank(false)}>
                                            રદ કરો
                                        </Button>
                                    </HStack>
                                </VStack>
                            )}
                        </FormControl>
                    )}

                    {/* DD/CHECK NUM */}
                   {/* DD / CHECK NUMBER - ONLY IF BANK */}
{form.paymentMethod === "bank" && (
    <FormControl>
        <FormLabel fontWeight="600">DD/ચેક નં.</FormLabel>
        <Input
            size="lg"
            bg="gray.100"
            value={form.ddCheckNum}
            onChange={(e) => handleChange("ddCheckNum", e.target.value)}
            placeholder="DD અથવા ચેક નંબર"
        />
    </FormControl>
)}


                    {/* REMARKS */}
                    <FormControl>
                        <FormLabel fontWeight="600">વ્યવહાર બાબત ઉલ્લેખ</FormLabel>
                        <Input
                            size="lg"
                            bg="gray.100"
                            value={form.remarks}
                            onChange={(e) => handleChange("remarks", e.target.value)}
                        />
                    </FormControl>

                    {/* SUBMIT */}
                    <Button
                        colorScheme="green"
                        size="lg"
                        width="100%"
                        rounded="xl"
                        isLoading={loading}
                        onClick={handleSubmit}
                    >
                        {t("submit")}
                    </Button>

                  {!isEditMode && (
            <HStack spacing={4} width="100%" pt={2}>
              <Button
                size="md"
                colorScheme="teal"
                onClick={() => setActiveSection(activeSection === "bulk" ? null : "bulk")}
              >
                Bulk Upload (Excel)
              </Button>

              <Button
                size="md"
                colorScheme="purple"
                onClick={() => setActiveSection(activeSection === "report" ? null : "report")}
              >
                રિપોર્ટ્સ
              </Button>
            </HStack>
          )}

          {/* BULK UPLOAD SECTION */}
          <Collapse in={activeSection === "bulk"} animateOpacity>
            <Box mt={4} p={4} bg="gray.50" rounded="md">
              <VStack spacing={4} align="stretch">
                <HStack spacing={3} align="center">
                  <Button
                    colorScheme="blue"
                    onClick={downloadSampleExcel}
                    flex="1"
                    whiteSpace="normal"
                  >
                    સેમ્પલ એક્સેલ ડાઉનલોડ
                  </Button>

                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleExcelFileChange}
                    isDisabled={!!form.excelFile || bulkLoading}
                    flex="1"
                  />

                  {form.excelFile && (
                    <Button
                      colorScheme="red"
                      variant="outline"
                      onClick={cancelExcelUpload}
                      isDisabled={bulkLoading}
                    >
                      રદ કરો
                    </Button>
                  )}
                </HStack>

                <HStack justify="center">
                  <Button
                    colorScheme="green"
                    onClick={uploadExcelToServer}
                    isLoading={bulkLoading}
                    isDisabled={!form.excelFile || bulkLoading}
                    width="50%"
                  >
                    Upload Excel
                  </Button>
                </HStack>
              </VStack>

              {/* {form.excelData.length > 0 && (
                <Box maxH="200px" overflowY="auto" fontSize="sm" mt={3}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        {Object.keys(form.excelData[0] || {}).map((h) => (
                          <th
                            key={h}
                            style={{
                              border: "1px solid #ddd",
                              padding: 6,
                              background: "#f1f1f1",
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {form.excelData.map((r, i) => (
                        <tr key={i}>
                          {Object.values(r).map((v, j) => (
                            <td
                              key={j}
                              style={{
                                border: "1px solid #eee",
                                padding: 6,
                              }}
                            >
                              {String(v)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              )} */}
            </Box>
          </Collapse>

          {/* REPORT SECTION */}
<Collapse in={activeSection === "report"} animateOpacity>
  <CashMelReport
    apiBase={API_BASE}
    customCategories={customCategories}
    banks={banks}
    toGujaratiDigits={toGujaratiDigits}
    user={user}
  />
</Collapse>


                </VStack>
            </Box>
        </Box>
    );
};

export default CashMelForm;