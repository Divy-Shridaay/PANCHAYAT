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
    Text,
    HStack,
    IconButton,
    Icon,
} from "@chakra-ui/react";
import CashMelReport from "./CashMelReport.jsx";
import * as XLSX from "xlsx";
import { FiArrowLeft } from "react-icons/fi";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { FiPrinter } from "react-icons/fi";


import "react-datepicker/dist/react-datepicker.css";

import DateInput from "./DateInput.jsx";

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
    const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000') + '/api';
    const { t } = useTranslation();
    const toast = useToast();
    const navigate = useNavigate();
    const { id } = useParams();
    const user = JSON.parse(localStorage.getItem("user") || "null");

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
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryType, setNewCategoryType] = useState("aavak");
    const [showAddBank, setShowAddBank] = useState(false);
    const [newBankName, setNewBankName] = useState("");
    const [editingCatId, setEditingCatId] = useState(null);
    const [editingCatName, setEditingCatName] = useState("");
    // const [showBulkUpload, setShowBulkUpload] = useState(false);
    // const [showReports, setShowReports] = useState(false);

 const [activeSection, setActiveSection] = useState(null);
// values: "bulk" | "report" | null



    const handleChange = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
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

    useEffect(() => {
        fetchCategories();
        fetchBanks();
    }, [fetchCategories, fetchBanks]);

    const createCategoryApi = async (name, type) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/categories`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: JSON.stringify({ name, type }),
            });
            if (!res.ok) {
                const txt = await res.text();
                throw new Error(txt || 'Create failed');
            }
            await fetchCategories();
            toast({ title: 'કેટેગરી સંગ્રહીત', status: 'success', duration: 2000 });
            return true;
        } catch (err) {
            console.error(err);
            toast({ title: 'કેટેગરી સેવ થઈતી નથી', status: 'error' });
            return false;
        }
    };

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

    const updateCategoryApi = async (id, name) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/categories/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: JSON.stringify({ name }),
            });
            if (!res.ok) throw new Error('Update failed');
            await fetchCategories();
            toast({ title: 'સુધારાશે', status: 'success', duration: 2000 });
            return true;
        } catch (err) {
            console.error(err);
            toast({ title: 'સુધારવામાં ભૂલ', status: 'error' });
            return false;
        }
    };

    const deleteCategoryApi = async (id) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/categories/${id}`, { 
                method: 'DELETE',
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` }),
                }
            });
            if (!res.ok) throw new Error('Delete failed');
            await fetchCategories();
            toast({ title: 'કેટેગરી હટાવી દીધી', status: 'info', duration: 2000 });
            return true;
        } catch (err) {
            console.error(err);
            toast({ title: 'હટાવવામાં ભૂલ', status: 'error' });
            return false;
        }
    };

    const addCustomCategory = async () => {
        if (!newCategoryName.trim()) return;
        const ok = await createCategoryApi(newCategoryName.trim(), newCategoryType);
        if (ok) {
            setNewCategoryName("");
            setShowAddCategory(false);
        }
    };

 

    const handleExcelFileChange = async (e) => {
        const f = e.target.files[0];
        if (!f) return;
        setForm((p) => ({ ...p, excelFile: f }));
        const data = await f.arrayBuffer();
        const wb = XLSX.read(data);
        const first = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(first, { header: 0 });
        setForm((p) => ({ ...p, excelData: json }));
        toast({ title: "Excel ફાઇલ વાંચાઈ ગઈ", status: "info", duration: 2000 });
    };

    const downloadSampleExcel = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE}/cashmel/sample-excel`, {
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` }),
                }
            });
            if (!response.ok) throw new Error("Download failed");
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "sample_cashmel.xlsx";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            toast({ title: "Sample Excel ડાઉનલોડ થયું!", status: "success" });
        } catch (err) {
            console.error(err);
            toast({ title: "ડાઉનલોડમાં ભૂલ", status: "error" });
        }
    };

    const uploadExcelToServer = async () => {
        if (!form.excelFile) {
            toast({ title: "પહેલા ફાઇલ પસંદ કરો", status: "error" });
            return;
        }
        const fd = new FormData();
        fd.append("file", form.excelFile);
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/cashmel/upload-excel`, { method: "POST", body: fd });
            if (!res.ok) throw new Error("Upload failed");
            toast({ title: "Excel અપલોડ થઈ ગયું!", status: "success" });
        } catch (err) {
            console.error(err);
            toast({ title: "અપલોડમાં ભૂલ", status: "error" });
        }
        setLoading(false);
    };

    /* ------------------ Submit --------------------- */
    const handleSubmit = async () => {
        if (!form.date || !form.name || !form.receiptPaymentNo || !form.vyavharType || !form.category || !form.amount || !form.paymentMethod || (form.paymentMethod === "bank" && !form.bank)) {
            toast({
                title: "કૃપા કરીને બધા જરૂરી ફીલ્ડ ભરો",
                status: "error",
                duration: 5000,
                position: "top",
            });
            return;
        }

        setLoading(true);
        try {
            const fd = new FormData();
            fd.append("date", form.date);
            fd.append("name", form.name);
            fd.append("receiptPaymentNo", form.receiptPaymentNo); // English digits में है
            fd.append("vyavharType", form.vyavharType);
            fd.append("category", form.category);
            fd.append("amount", form.amount); // English digits में है
            fd.append("paymentMethod", form.paymentMethod);
            if (form.paymentMethod === "bank") fd.append("bank", form.bank);
            fd.append("ddCheckNum", form.ddCheckNum);
            fd.append("remarks", form.remarks);
            if (form.excelFile) fd.append("excel", form.excelFile);

            const url = `${API_BASE}/cashmel${id ? '/' + id : ''}`;
            const token = localStorage.getItem("token");
            const res = await fetch(url, { 
                method: id ? "PUT" : "POST", 
                body: fd,
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` }),
                }
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Failed");
            }

            toast({ title: "સફળતાપૂર્વક સેવ થયું!", status: "success", duration: 3000 });

            // Reset form
            setForm({
                date: "", dateDisplay: "", name: "", receiptPaymentNo: "",
                vyavharType: "", category: "", amount: "", paymentMethod: "", bank: "", ddCheckNum: "", remarks: "", excelFile: null, excelData: []
            });

        } catch (err) {
            console.error(err);
            toast({ title: "ડેટા સેવ કરવામાં ભૂલ", status: "error" });
        }
        setLoading(false);
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
            onClick={() => navigate("/dashboard")}
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
        {t("cashMelForm")}
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
                <Heading size="md" mb={4} color="green.700" borderLeft="4px solid #2A7F62" pl={3}>
                    {t("entryDetails")}
                </Heading>

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
    <HStack align="start">
        <Select
            size="lg"
            bg="gray.100"
            value={form.category}
            isDisabled={!form.vyavharType}
            onChange={(e) => handleChange("category", e.target.value)}
        >
            <option value="">{t("selectCategory")}</option>

            {/* AAVAK (આવક) */}
            {form.vyavharType === "aavak" && (
                <>
                   

                    {customCategories.aavak.map((c) => (
                        <option key={c._id} value={c.name}>
                            {c.name}
                        </option>
                    ))}
                </>
            )}

            {/* JAVAK (જાવક) */}
            {form.vyavharType === "javak" && (
                <>
                   
                    {customCategories.javak.map((c) => (
                        <option key={c._id} value={c.name}>
                            {c.name}
                        </option>
                    ))}
                </>
            )}
        </Select>

        <Button size="sm" onClick={() => setShowAddCategory((s) => !s)}>
            {t("addcategory")}
        </Button>
    </HStack>

    <Collapse in={showAddCategory} animateOpacity>
        <HStack spacing={3} mt={2} align="start">
            <Select
                width="160px"
                value={newCategoryType}
                onChange={(e) => setNewCategoryType(e.target.value)}
            >
                <option value="aavak">આવક</option>
                <option value="javak">જાવક</option>
            </Select>

            <Input
    placeholder="નવું કેટેગરી નામ"
    value={newCategoryName}
    maxLength={50}               // ⭐ MAX 50 characters
    onChange={(e) => {
        const val = e.target.value;

        // ⭐ Prevent leading spaces + limit min 1 char
        if (val.length === 0) {
            setNewCategoryName("");
            return;
        }

        // ⭐ Allow only if length <= 50
        if (val.length <= 50) {
            setNewCategoryName(val);
        }
    }}
    bg="gray.100"
/>

            <Button colorScheme="blue" onClick={addCustomCategory}>ઉમેરો</Button>
        </HStack>

        <Box mt={3}>
            <Text fontWeight={600} mb={2}>
                અધિક સમૂહ: {newCategoryType === "aavak" ? "આવક" : "જાવક"}
            </Text>

            <Box>
                {(customCategories[newCategoryType] || []).map((c) => (
                    <HStack key={c._id} spacing={3} mb={2}>
                        {editingCatId === c._id ? (
                            <>
                                <Input
                                    size="sm"
                                    bg="gray.100"
                                    value={editingCatName}
                                    onChange={(e) => setEditingCatName(e.target.value)}
                                />
                                <Button
                                    size="sm"
                                    colorScheme="green"
                                    onClick={async () => {
                                        if (!editingCatName.trim()) return;
                                        const ok = await updateCategoryApi(
                                            c._id,
                                            editingCatName.trim()
                                        );
                                        if (ok) {
                                            setEditingCatId(null);
                                            setEditingCatName("");
                                        }
                                    }}
                                >
                                    Save
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        setEditingCatId(null);
                                        setEditingCatName("");
                                    }}
                                >
                                    Cancel
                                </Button>
                            </>
                        ) : (
                            <>
                                <Text flex="1">{c.name}</Text>
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        setEditingCatId(c._id);
                                        setEditingCatName(c.name);
                                    }}
                                >
                                    Edit
                                </Button>
                                <Button
                                    size="sm"
                                    colorScheme="red"
                                    onClick={async () => {
                                        if (!window.confirm("Delete category?")) return;
                                        await deleteCategoryApi(c._id);
                                    }}
                                >
                                    Delete
                                </Button>
                            </>
                        )}
                    </HStack>
                ))}

                {(customCategories[newCategoryType] || []).length === 0 && (
                    <Text fontSize="sm" color="gray.500">
                        No custom categories
                    </Text>
                )}
            </Box>
        </Box>
    </Collapse>
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
                                const englishValue = gujaratiToEnglishDigits(e.target.value);
                                const onlyNumbers = englishValue.replace(/\D/g, ""); 
                                handleChange("amount", onlyNumbers);
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

                   {/* Bulk Upload & Reports Buttons */}
<HStack spacing={4} width="100%" pt={2}>
  <Button
    size="md"
    colorScheme="teal"
    onClick={() =>
      setActiveSection(activeSection === "bulk" ? null : "bulk")
    }
  >
    Bulk Upload (Excel)
  </Button>

  <Button
    size="md"
    colorScheme="purple"
    onClick={() =>
      setActiveSection(activeSection === "report" ? null : "report")
    }
  >
    રિપોર્ટ્સ
  </Button>
</HStack>

{/* ================= BULK UPLOAD SECTION ================= */}
<Collapse in={activeSection === "bulk"} animateOpacity>
  <Box mt={4} p={4} bg="gray.50" rounded="md">

    <HStack mb={3} spacing={3} align="stretch">
     <Button
  colorScheme="blue"
  onClick={downloadSampleExcel}
  width="70%"
  whiteSpace="normal"
>
  સેમ્પલ એક્સેલ ડાઉનલોડ
</Button>


      <Input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleExcelFileChange}
      />

      <Button
        colorScheme="green"
        onClick={uploadExcelToServer}
        isLoading={loading}
        whiteSpace="normal"
        textAlign="center"
        px={4}
  width="50%"

      >
        Upload to File
      </Button>
    </HStack>

    {form.excelData.length > 0 && (
      <Box maxH="200px" overflowY="auto" fontSize="sm" mt={3}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {Object.keys(form.excelData[0]).map((h) => (
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
    )}
  </Box>
</Collapse>

{/* ================= REPORTS SECTION ================= */}
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