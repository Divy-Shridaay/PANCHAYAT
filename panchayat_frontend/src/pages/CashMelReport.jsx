
import React, { useState } from "react";
import {
    Box,
    HStack,
    Select,
    Button,
    useToast,
    Icon,
} from "@chakra-ui/react";
import { FiPrinter } from "react-icons/fi";
import { useRef } from "react";

// DateInput component (simplified for this artifact)
const DateInput = ({ label, name, value, onDateChange, formatDisplayDate, convertToISO }) => {
   
    return (
        <Box>
            <label style={{ fontSize: '14px', fontWeight: 600 }}>{label}</label>
            <input
                type="text"
                placeholder="DD/MM/YYYY"
                value={value}
                onChange={(e) => {
                    const display = formatDisplayDate(e.target.value);
                    const iso = convertToISO(display);
                    onDateChange(name, display);
                }}
                style={{
                    width: '150px',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    marginTop: '4px'
                }}
            />
        </Box>
    );
};

const CashMelReport = ({ apiBase, customCategories, banks, user }) => {
    const toast = useToast();
    const [loading, setLoading] = useState(false);

    // 🔥 Function to generate financial years (last 5 years)
    const getFinancialYears = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = 5; i >= 0; i--) {
            const startYear = currentYear - i;
            const endYear = startYear + 1;
            years.push({
                value: `${startYear}`,
                label: `${startYear}-${String(endYear).slice(-2)}`
            });
        }
        return years;
    };

    // 🔥 Function to get date range from financial year
    const getDateRangeFromFY = (fyValue) => {
        if (!fyValue) return { from: "", to: "" };
        const year = parseInt(fyValue);
        const fromDate = `${year}-04-01`;
        const toDate = `${year + 1}-03-31`;
        
        // Convert to display format (DD/MM/YYYY)
        return {
            from: `01/04/${year}`,
            to: `31/03/${year + 1}`
        };
    };

    const [report, setReport] = useState({
        from: "",
        to: "",
        type: "aavak",
        fy: ""
    });

    const dateErrorShownRef = useRef(false);

    // 🔥 Utility Functions (moved to top for proper ordering)
    const convertToISO = (display) => {
        const [d, m, y] = display.split("/");
        if (!d || !m || !y || y.length !== 4) return "";
        return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    };

    const guj = (num) => {
        if (num === null || num === undefined || num === "") return "";
        const gujaratiDigits = ["૦", "૧", "૨", "૩", "૪", "૫", "૬", "૭", "૮", "૯"];
        return String(num).replace(/\d/g, (d) => gujaratiDigits[parseInt(d)]);
    };

    const formatDateToGujarati = (display) => {
        if (!display) return "";
        return display.replace(/\d/g, (d) => guj(d));
    };

    const formatDisplayDate = (input) => {
        const digits = input.replace(/\D/g, "").slice(0, 8);
        if (digits.length <= 2) return digits;
        if (digits.length <= 4) return digits.slice(0, 2) + "/" + digits.slice(2);
        if (digits.length <= 6) {
            // If DDMMYY entered, convert to DDMMYYYY
            const yy = digits.slice(4, 6);
            const yyyy = parseInt(yy) > 30 ? "19" + yy : "20" + yy;
            return digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + yyyy;
        }
        return digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4);
    };

    const hasRecordsInRange = (records, fromDate, toDate) => {
        // 🔥 fromDate and toDate are ISO format (YYYY-MM-DD)
        // r.date is also ISO format
        return records.some(r => {
            if (!r.date) return false;
            const recordDate = r.date.slice(0, 10); // Get just YYYY-MM-DD part
            return recordDate >= fromDate && recordDate <= toDate;
        });
    };

    const isFromAfterTo = (from, to) => {
        if (!from || !to) return false;
        if (from.length !== 10 || to.length !== 10) return false;

        const fromISO = convertToISO(from);
        const toISO = convertToISO(to);
        if (!fromISO || !toISO) return false;

        const f = new Date(fromISO);
        const t = new Date(toISO);

        f.setHours(0,0,0,0);
        t.setHours(0,0,0,0);

        return f > t;
    };

    const isFutureDate = (date) => {
        if (!date || date.length !== 10) return false;

        const iso = convertToISO(date);
        if (!iso) return false;

        const selected = new Date(iso);
        const today = new Date();

        selected.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        return selected > today;
    };

    const handleReportChange = (key, value) => {
        setReport((prev) => {
            const updated = { ...prev, [key]: value };

            // 🔥 If FY is selected, auto-set from and to dates
            if (key === "fy" && value) {
                const { from, to } = getDateRangeFromFY(value);
                updated.from = from;
                updated.to = to;
                return updated;
            }

            if ((key === "from" || key === "to") && value.length < 10) {
                dateErrorShownRef.current = false;
                return updated;
            }

            if (isFutureDate(value)) {
                if (!dateErrorShownRef.current) {
                    toast({
                        title: "તારીખ માન્ય નથી",
                        description: "ભવિષ્યની તારીખ પસંદ કરી શકાતી નથી",
                        status: "error",
                        duration: 2500,
                        position: "top",
                    });
                    dateErrorShownRef.current = true;
                }
                return prev;
            }

            if (
                updated.from?.length === 10 &&
                updated.to?.length === 10 &&
                isFromAfterTo(updated.from, updated.to)
            ) {
                if (!dateErrorShownRef.current) {
                    toast({
                        title: "તારીખ ખોટી છે",
                        description: "From તારીખ To તારીખથી મોટી હોઈ શકે નહીં",
                        status: "error",
                        duration: 2500,
                        position: "top",
                    });
                    dateErrorShownRef.current = true;
                }
                return prev;
            }

            dateErrorShownRef.current = false;
            return updated;
        });
    };

    const getGujaratiFinancialYear = (isoDate) => {
        if (!isoDate) return "";

        const d = new Date(isoDate);
        const year = d.getFullYear();
        const month = d.getMonth() + 1;

        let fyStart, fyEnd;

        if (month < 4) {
            fyStart = year - 1;
            fyEnd = year;
        } else {
            fyStart = year;
            fyEnd = year + 1;
        }

        return `${guj(fyStart)}–${guj(fyEnd)}`;
    };

    const handlePrintReport = async () => {
        if (!report.from || !report.to) {
            toast({
                title: "તારીખ પસંદ કરો",
                status: "error",
                duration: 2000,
                position: "top",
            });
            return;
        }

        setLoading(true);

        try {
            let templateFile = "/aavak/aavak.html";
            if (report.type === "javak") templateFile = "/javak/javak.html";
            else if (report.type === "tarij") templateFile = "/tarij/tarij.html";
            else if (report.type === "checkIssue") templateFile = "/check-details/check-details.html";
            else if (report.type === "rojmel") templateFile = "/rojmel/rojmel.html";

            const fromDate = convertToISO(report.from);
            const toDate = convertToISO(report.to);
            
            const talukoName = user?.gam || "ગ્રામ પંચાયત";

            // CHECK ISSUE REPORT
            if (report.type === "checkIssue") {
                const qs = `?from=${fromDate}&to=${toDate}`;
                const url = `${apiBase}/cashmel/report${qs}`;
                const token = localStorage.getItem("token");
                const recordsRes = await fetch(url, {
                    headers: {
                        ...(token && { Authorization: `Bearer ${token}` }),
                    }
                });
                const resJson = await recordsRes.json();
                const allRecords = Array.isArray(resJson.rows) ? resJson.rows : [];

                const checkedRows = allRecords.filter(r =>
                    r.vyavharType === "javak" &&
                    r.paymentMethod === "bank"
                );

                if (checkedRows.length === 0) {
                    toast({
                        title: "ચેક ઈશ્યૂ રેકોર્ડ નથી",
                        status: "warning",
                    });
                    setLoading(false);
                    return;
                }

                let rowsHtml = "";
                checkedRows.forEach((r, i) => {
                    rowsHtml += `
<tr>
    <td>${guj(i + 1)}</td>
    <td>${formatDateToGujarati(r.date?.slice(0, 10))}</td>
    <td>${r.ddCheckNum || ""}</td>
    <td class="text-right">${guj(r.amount || 0)}</td>
    <td>${r.receiptPaymentNo || ""}</td>
    <td>${r.name || ""}</td>
    <td>${r.remarks || ""}</td>
</tr>`;
                });

                const templateRes = await fetch(templateFile);
                if (!templateRes.ok) throw new Error("Template missing");

                let htmlTemplate = await templateRes.text();
                const fyGujarati = getGujaratiFinancialYear(fromDate);

                htmlTemplate = htmlTemplate
                    .replace("{{taluko}}", talukoName)
                    .replace("{{userTaluko}}", user?.taluko || "")
                    .replace("{{userJillo}}", user?.jillo || "")
                    .replace("{{yearRange}}", fyGujarati)
                    .replace(
                        "{{dateRange}}",
                        `${formatDateToGujarati(report.from)} થી ${formatDateToGujarati(report.to)}`
                    )
                    .replace("{{rows}}", rowsHtml);

                const win = window.open("", "_blank", "width=900,height=700");
                setLoading(false);

                win.document.write(htmlTemplate);
                win.document.close();
                setTimeout(() => {
                    win.focus();
                    win.print();
                }, 500);

                setLoading(false);
                return;
            }

            // ROJMEL REPORT
            if (report.type === "rojmel") {
                // 🔥 FIX: Fetch ALL records from beginning for proper account balances
                const qs = `?to=${toDate}`;
                const url = `${apiBase}/cashmel/report${qs}`;
                const token = localStorage.getItem("token");
                const recordsRes = await fetch(url, {
                    headers: {
                        ...(token && { Authorization: `Bearer ${token}` }),
                    }
                });
                const resJson = await recordsRes.json();
                const allRecords = Array.isArray(resJson.rows) ? resJson.rows : [];
                
                // Filter only selected date range for main table
                const selectedDateRecords = allRecords.filter(r => {
                    if (!r.date) return false;
                    const recordDate = r.date.slice(0, 10);
                    return recordDate >= fromDate && recordDate <= toDate;
                });

                const filteredRecords =
                    report.type === "aavak" || report.type === "javak"
                        ? selectedDateRecords.filter(r => r.vyavharType === report.type)
                        : selectedDateRecords;

                const hasValidRecords = hasRecordsInRange(
                    filteredRecords,
                    fromDate,
                    toDate
                );

                if (!hasValidRecords) {
                    toast({
                        title: "કોઈ રેકોર્ડ નથી",
                        description: "પસંદ કરેલી તારીખ માટે કોઈ માહિતી ઉપલબ્ધ નથી",
                        status: "warning",
                        duration: 2500,
                        position: "top",
                    });
                    setLoading(false);
                    return;
                }

                if (selectedDateRecords.length === 0) {
                    toast({
                        title: "કોઈ રેકોર્ડ નથી",
                        status: "warning",
                        duration: 2000,
                    });
                    setLoading(false);
                    return;
                }

                /* ================= OPENING BALANCE ================= */
                // 🔥 FIX: Opening balance = Previous day's closing balance (from start of time, not FY start)
                let openingBalance = 0;
                try {
                    const prevToDate = new Date(fromDate);
                    prevToDate.setDate(prevToDate.getDate() - 1);
                    const prevTo = prevToDate.toISOString().slice(0, 10);

                    // Fetch ALL records from beginning till previous day
                    const prevQs = `?to=${prevTo}`;
                    const token = localStorage.getItem("token");
                    const prevRes = await fetch(`${apiBase}/cashmel/report${prevQs}`, {
                        headers: {
                            ...(token && { Authorization: `Bearer ${token}` }),
                        }
                    });
                    const prevJson = await prevRes.json();

                    const prevRecords = Array.isArray(prevJson.rows) ? prevJson.rows : [];

                    let prevAavak = 0;
                    let prevJavak = 0;

                    prevRecords.forEach(r => {
                        if (r.vyavharType === "aavak") prevAavak += r.amount || 0;
                        else prevJavak += r.amount || 0;
                    });

                    openingBalance = prevAavak - prevJavak;
                } catch (err) {
                    console.error("Error calculating opening balance:", err);
                }

                /* ================= AAVAK CATEGORIES ================= */
                const allAavakCategories = (customCategories?.aavak || [])
                    .filter(cat => !cat.isDeleted)
                    .map(cat => cat.name);

                if (allAavakCategories.length === 0) {
                    const fallbackSet = new Set();
                    selectedDateRecords.forEach(r => {
                        if (r.vyavharType === "aavak" && r.category) {
                            fallbackSet.add(r.category);
                        }
                    });
                    allAavakCategories.push(...Array.from(fallbackSet));
                }

                const incomeColspan = allAavakCategories.length + 1;
                const totalIncomeCols = incomeColspan;

                const incomeHeadersHTML = allAavakCategories.map(cat => `<th>${cat}</th>`).join("");

                /* ================= DATE MAP ================= */
                const dateMap = {};
                selectedDateRecords.forEach(r => {
                    const d = r.date.slice(0, 10);
                    if (!dateMap[d]) dateMap[d] = { aavak: [], javak: [] };

                    if (r.vyavharType === "aavak") dateMap[d].aavak.push(r);
                    else dateMap[d].javak.push(r);
                });

                /* ================= TOTALS ================= */
                let totalAavakAmount = openingBalance;
                let totalJavakAmount = 0;

                const categoryTotals = {};
                allAavakCategories.forEach(cat => categoryTotals[cat] = 0);

                const sortedDates = Object.keys(dateMap).sort();
                let tableRows = "";

                /* ================= DAILY ROWS ================= */
                sortedDates.forEach(dateKey => {
                    const day = dateMap[dateKey];
                    const maxRows = Math.max(day.aavak.length + 1, day.javak.length);

                    for (let i = 0; i < maxRows; i++) {
                        let a = null;
                        if (i === 0) {
                            a = { name: "ઉઘડતી સિલક", amount: openingBalance };
                        } else {
                            a = day.aavak[i - 1];
                        }

                        const j = day.javak[i];

                        let categoryCells = "";

                        if (a && a.name !== "ઉઘડતી સિલક") {
                            categoryCells = allAavakCategories.map(cat => {
                                if (a.category === cat) {
                                    categoryTotals[cat] += a.amount;
                                    totalAavakAmount += a.amount;
                                    return `<td class="text-right">${guj(a.amount)}</td>`;
                                }
                                return `<td class="text-right">૦</td>`;
                            }).join("");
                        } else {
                            categoryCells = allAavakCategories
                                .map(() => `<td class="text-right">૦</td>`)
                                .join("");
                        }

                        if (j) totalJavakAmount += j.amount;

                        tableRows += `
<tr>
    <td>${a?.receiptPaymentNo ? guj(a.receiptPaymentNo) : ""}</td>
    <td>${a?.name || ""}</td>
    ${categoryCells}
    <td class="text-right">${a ? guj(a.amount || 0) : ""}</td>

    <td>${j?.ddCheckNum ? guj(j.ddCheckNum) : ""}</td>
    <td>${j?.receiptPaymentNo ? guj(j.receiptPaymentNo) : ""}</td>
    <td>${j?.name || ""}</td>
    <td>${j?.remarks || ""}</td>
    <td>${j?.category || ""}</td>
    <td class="text-right">${j ? guj(j.amount || 0) : ""}</td>
</tr>`;
                    }
                    
                    // 🔥 NEW: Update opening balance for next date
                    // Calculate day's total income and expense
                    let dayAavak = 0;
                    let dayJavak = 0;
                    
                    day.aavak.forEach(a => dayAavak += a.amount || 0);
                    day.javak.forEach(j => dayJavak += j.amount || 0);
                    
                    // Next date's opening = current opening + today's income - today's expense
                    openingBalance = openingBalance + dayAavak - dayJavak;
                });

                /* ================= TOTAL ROW ================= */
                const totalCategoryCells = allAavakCategories.map(cat =>
                    `<td class="text-right"><b>${guj(categoryTotals[cat])}</b></td>`
                ).join("");

                tableRows += `
<tr style="font-weight:bold;">
    <td></td>
    <td>કુલ આવક</td>
    ${totalCategoryCells}
    <td class="text-right">${guj(totalAavakAmount)}</td>
    <td colspan="5"></td>
    <td class="text-right">${guj(totalJavakAmount)}</td>
</tr>`;

                const bandhSilak = totalAavakAmount - totalJavakAmount;

                tableRows += `
<tr>
<td colspan="100%" style="font-weight:bold;text-align:right;">
    કુલ આવક : ${guj(totalAavakAmount)}<br/>
    કુલ જાવક : ${guj(totalJavakAmount)}<br/>
    બંધ સિલક : ${guj(bandhSilak)}
</td>
</tr>`;

                /* ================= ACCOUNT TRANSFER TABLE ================= */
                // 🔥 Get ALL banks from allRecords (which now contains records from beginning to toDate)
                const uniqueBanks = new Set();
                
                allRecords.forEach(r => {
                    if (r.paymentMethod === "bank" && r.bank) {
                        uniqueBanks.add(r.bank);
                    }
                });

                async function getAccountBalanceBefore(accountType, accountName, date) {
                    const prevToDate = new Date(date);
                    prevToDate.setDate(prevToDate.getDate() - 1);
                    const prevTo = prevToDate.toISOString().slice(0, 10);

                    // 🔥 FIX: Fetch ALL records from beginning till previous day
                    const prevQs = `?to=${prevTo}`;
                    const token = localStorage.getItem("token");
                    const prevRes = await fetch(`${apiBase}/cashmel/report${prevQs}`, {
                        headers: {
                            ...(token && { Authorization: `Bearer ${token}` }),
                        }
                    });
                    const prevJson = await prevRes.json();
                    const records = Array.isArray(prevJson.rows) ? prevJson.rows : [];

                    let total = 0;
                    records.forEach(r => {
                        const match = 
                            (accountType === "cash" && r.paymentMethod !== "bank") ||
                            (accountType === "bank" && r.paymentMethod === "bank" && r.bank === accountName);

                        if (match) {
                            if (r.vyavharType === "aavak") total += r.amount || 0;
                            else total -= r.amount || 0;
                        }
                    });
                    return total;
                }

                function getPeriodAccountFlow(accountType, accountName) {
                    let income = 0, expense = 0;
                    selectedDateRecords.forEach(r => {
                        const match = 
                            (accountType === "cash" && r.paymentMethod !== "bank") ||
                            (accountType === "bank" && r.paymentMethod === "bank" && r.bank === accountName);

                        if (match) {
                            if (r.vyavharType === "aavak") income += r.amount || 0;
                            else expense += r.amount || 0;
                        }
                    });
                    return { income, expense };
                }

                let accountTransferRows = "";
                let srNo = 1;

                const cashOpening = await getAccountBalanceBefore("cash", null, fromDate);
                const { income: cashIncome, expense: cashExpense } = getPeriodAccountFlow("cash", null);
                const cashClosing = cashOpening + cashIncome - cashExpense;

                let totalOpening = cashOpening;
                let totalIncome = cashIncome;
                let totalExpense = cashExpense;
                let totalClosing = cashClosing;

                accountTransferRows += `
<tr>
    <td>${guj(srNo++)}</td>
    <td>રોકડ</td>
    <td class="text-right">${guj(cashOpening)}</td>
    <td class="text-right">${guj(cashIncome)}</td>
    <td class="text-right">${guj(cashExpense)}</td>
    <td class="text-right">${guj(cashClosing)}</td>
</tr>`;

                for (const bankName of uniqueBanks) {
                    const bankOpening = await getAccountBalanceBefore("bank", bankName, fromDate);
                    const { income: bankIncome, expense: bankExpense } = getPeriodAccountFlow("bank", bankName);
                    const bankClosing = bankOpening + bankIncome - bankExpense;

                    totalOpening += bankOpening;
                    totalIncome += bankIncome;
                    totalExpense += bankExpense;
                    totalClosing += bankClosing;

                    accountTransferRows += `
<tr>
    <td>${guj(srNo++)}</td>
    <td>${bankName}</td>
    <td class="text-right">${guj(bankOpening)}</td>
    <td class="text-right">${guj(bankIncome)}</td>
    <td class="text-right">${guj(bankExpense)}</td>
    <td class="text-right">${guj(bankClosing)}</td>
</tr>`;
                }

                accountTransferRows += `
<tr style="font-weight: bold; background: #f2f2f2;">
    <td colspan="2" class="text-center">કુલ રકમ</td>
    <td class="text-right">${guj(totalOpening)}</td>
    <td class="text-right">${guj(totalIncome)}</td>
    <td class="text-right">${guj(totalExpense)}</td>
    <td class="text-right">${guj(totalClosing)}</td>
</tr>`;

                /* ================= PRINT ================= */
                const templateRes = await fetch(templateFile);
                let htmlTemplate = await templateRes.text();

                const fyGujarati = getGujaratiFinancialYear(fromDate);

                htmlTemplate = htmlTemplate
                    .replace("{{taluko}}", talukoName)
                    .replace("{{yearRange}}", fyGujarati)
                    .replace(
                        "{{dateRange}}",
                        `${formatDateToGujarati(report.from)} થી ${formatDateToGujarati(report.to)}`
                    )
                    .replace("{{incomeHeaders}}", incomeHeadersHTML)
                    .replace("{{tableRows}}", tableRows)
                    .replace("{{totalIncomeCols}}", totalIncomeCols)
                    .replace("{{incomeColspan}}", incomeColspan)
                    .replace("{{accountTransferRows}}", accountTransferRows);

                const win = window.open("", "_blank", "width=1200,height=800");
                setLoading(false);

                win.document.write(htmlTemplate);
                win.document.close();
                setTimeout(() => {
                    win.focus();
                    win.print();
                }, 500);

                setLoading(false);
                return;
            }

        // ======================================================
        // ======= AAVAK / JAVAK / TARIJ REPORTS ===============
        // ======================================================
        const templateRes = await fetch(templateFile);
        if (!templateRes.ok) throw new Error("Template missing");
        let htmlTemplate = await templateRes.text();

        // 🔥 fromDate and toDate are already ISO format from line 248-249
        const fromDateObj = new Date(fromDate + "T00:00:00Z");

        // Fetch data from beginning of the year for accurate carry-forward
        const fyStartYear =
    fromDateObj.getMonth() + 1 < 4
        ? fromDateObj.getFullYear() - 1
        : fromDateObj.getFullYear();

const yearStart = new Date(fyStartYear, 3, 1); // April 1 ✅

        const historicalFromDate = yearStart.toISOString().slice(0, 10);

        // 🔥 FIX: For tarij, don't filter by vyavharType (need both aavak and javak)
        const historicalQs = report.type === "tarij" 
            ? `?from=${historicalFromDate}&to=${toDate}` 
            : `?vyavharType=${report.type}&from=${historicalFromDate}&to=${toDate}`;
        
        const historicalUrl = `${apiBase}/cashmel/report${historicalQs}`;
        const token = localStorage.getItem("token");
        const recordsRes = await fetch(historicalUrl, {
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
            }
        });
        const resJson = await recordsRes.json();
        const allRecords = Array.isArray(resJson.rows) ? resJson.rows : [];

       const filteredRecords =
  report.type === "aavak" || report.type === "javak"
    ? allRecords.filter(r => r.vyavharType === report.type)
    : allRecords;

const hasValidRecords = hasRecordsInRange(
  filteredRecords,
  fromDate,
  toDate
);


if (!hasValidRecords) {
    toast({
        title: "કોઈ રેકોર્ડ નથી",
        description: "પસંદ કરેલી તારીખ માટે કોઈ માહિતી ઉપલબ્ધ નથી",
        status: "warning",
        duration: 2500,
        position: "top",
    });
    setLoading(false);
    return;
}


        if (allRecords.length === 0) {
            toast({ title: "કોઈ રેકોર્ડ નથી", status: "warning", duration: 2000 });
            setLoading(false);
            return;
        }

        // ================================
        // TARIJ REPORT (તરીજ પત્રક)
        // ================================
        if (report.type === "tarij") {
            const fromDateObj = new Date(fromDate + "T00:00:00Z");
            const toDateObj = new Date(toDate + "T23:59:59Z");
            
            const selectedRecords = allRecords.filter(r => {
                if (!r.date) return false;
                const d = new Date(r.date);
                if (isNaN(d.getTime())) return false;
                // 🔥 fromDate and toDate are already ISO format
                return d >= fromDateObj && d <= toDateObj;
            });

            const aavakRecords = selectedRecords.filter(r => r.vyavharType === "aavak");
            const javakRecords = selectedRecords.filter(r => r.vyavharType === "javak");

            const aavakMap = {};
            const javakMap = {};

            aavakRecords.forEach(rec => {
                const cat = customCategories?.[rec.category] || rec.category;
                aavakMap[cat] = (aavakMap[cat] || 0) + Number(rec.amount || 0);
            });
            javakRecords.forEach(rec => {
                const cat = customCategories?.[rec.category] || rec.category;
                javakMap[cat] = (javakMap[cat] || 0) + Number(rec.amount || 0);
            });

            const aCats = Object.keys(aavakMap).sort();
            const jCats = Object.keys(javakMap).sort();
            const max = Math.max(aCats.length, jCats.length);

            let tableRows = "";
            let totalA = 0;
            let totalJ = 0;

            for (let i = 0; i < max; i++) {
                const ac = aCats[i] || "";
                const ja = jCats[i] || "";
                const aAmt = aavakMap[ac] || 0;
                const jAmt = javakMap[ja] || 0;
                totalA += aAmt;
                totalJ += jAmt;

                tableRows += `
                <tr>
                    <td>${ac ? i + 1 : ""}</td>
                    <td>${ac}</td>
                    <td class="text-right">${guj(aAmt) || ""}</td>
                    <td>${ja ? i + 1 : ""}</td>
                    <td>${ja}</td>
                    <td class="text-right">${guj(jAmt) || ""}</td>
                </tr>`;
            }

            // Opening Balance Calculation (Previous Year)
            let openingBalance = 0;
            try {
                // 🔥 fromDate and toDate are already ISO format from line 244-245
                const prevFrom = new Date(fromDate);
                prevFrom.setFullYear(prevFrom.getFullYear() - 1);
                const prevTo = new Date(toDate);
                prevTo.setFullYear(prevTo.getFullYear() - 1);

                const prevQs = `?from=${prevFrom.toISOString().slice(0,10)}&to=${prevTo.toISOString().slice(0,10)}`;
                const token = localStorage.getItem("token");
                const prevRes = await fetch(`${apiBase}/cashmel/report${prevQs}`, {
                    headers: {
                        ...(token && { Authorization: `Bearer ${token}` }),
                    }
                });
                const prevJson = await prevRes.json();
                const prevRows = Array.isArray(prevJson.rows) ? prevJson.rows : [];

                let prevAavak = 0, prevJavak = 0;
                prevRows.forEach(r => {
                    const amt = Number(r.amount || 0);
                    if (r.vyavharType === "aavak") prevAavak += amt;
                    if (r.vyavharType === "javak") prevJavak += amt;
                });

                // Previous year's opening balance
                const prevPrevFrom = new Date(prevFrom);
                prevPrevFrom.setFullYear(prevPrevFrom.getFullYear() - 1);
                const prevPrevTo = new Date(prevTo);
                prevPrevTo.setFullYear(prevPrevTo.getFullYear() - 1);

                const prevPrevRes = await fetch(`${apiBase}/cashmel/report?from=${prevPrevFrom.toISOString().slice(0,10)}&to=${prevPrevTo.toISOString().slice(0,10)}`, {
                    headers: {
                        ...(token && { Authorization: `Bearer ${token}` }),
                    }
                });
                const prevPrevJson = await prevPrevRes.json();
                const prevPrevRows = Array.isArray(prevPrevJson.rows) ? prevPrevJson.rows : [];

                let prevPrevAavak = 0, prevPrevJavak = 0;
                prevPrevRows.forEach(r => {
                    const amt = Number(r.amount || 0);
                    if (r.vyavharType === "aavak") prevPrevAavak += amt;
                    if (r.vyavharType === "javak") prevPrevJavak += amt;
                });

                const prevYearOpening = prevPrevAavak - prevPrevJavak;
                openingBalance = prevYearOpening + prevAavak - prevJavak;
            } catch (e) {
                openingBalance = 0;
            }

            const totalWithOpening = openingBalance + totalA;
            const closingBalance = totalWithOpening - totalJ;

            const fyGujarati = getGujaratiFinancialYear(fromDate);

            htmlTemplate = htmlTemplate
                .replace("{{taluko}}", talukoName)
                .replace("{{userTaluko}}", user?.taluko || "")
                .replace("{{userJillo}}", user?.jillo || "")
                .replace("{{yearRange}}", fyGujarati)
                .replace("{{dateRange}}",
                    `${formatDateToGujarati(report.from)} થી ${formatDateToGujarati(report.to)}`
                )
                .replace("{{tableRows}}", tableRows)
                .replace(/{{totalAavak}}/g, guj(totalA))
                .replace(/{{totalJavak}}/g, guj(totalJ))
                .replace(/{{grandTotal}}/g, guj(closingBalance))
                .replace(/{{openingBalance}}/g, guj(openingBalance))
                .replace(/{{totalWithOpening}}/g, guj(totalWithOpening))
                .replace(/{{closingBalance}}/g, guj(closingBalance));

            const win = window.open("", "_blank", "width=1200,height=800");
            setLoading(false);

            win.document.write(htmlTemplate);
            win.document.close();
            setTimeout(() => {
  win.focus();   // 🔥 IMPORTANT LINE
  win.print();
}, 500);

            setLoading(false);
            return;
        }

        // ================================
        // AAVAK / JAVAK MONTHLY REPORT
        // ================================
        const records = allRecords.filter(r => r.vyavharType === report.type);
        const monthGroups = {};
        const allCategories = new Set();

        records.forEach(rec => {
            const catKey = rec.category;
            const cat = customCategories?.[catKey] || catKey;
            const amount = Number(rec.amount) || 0;
            if (!rec.date) return;
            const d = new Date(rec.date);
            if (isNaN(d)) return;

            const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            const day = d.getDate();

            if (!monthGroups[monthKey]) {
                monthGroups[monthKey] = {
                    categoriesMap: {},
                    dayTotals: Array(31).fill(0),
                    monthTotal: 0,
                };
            }

            const mg = monthGroups[monthKey];
            if (!mg.categoriesMap[catKey]) {
                mg.categoriesMap[catKey] = {
                    title: cat,
                    rowDays: Array(31).fill(0),
                    currentTotal: 0,
                };
            }

            mg.categoriesMap[catKey].rowDays[day - 1] += amount;
            mg.categoriesMap[catKey].currentTotal += amount;
            mg.dayTotals[day - 1] += amount;
            mg.monthTotal += amount;
            allCategories.add(catKey);
        });

        // Carry forward calculation
        const allSortedMonths = Object.keys(monthGroups).sort();
        const carryForward = {};
        const firstSelectedMonth = `${fromDateObj.getFullYear()}-${String(fromDateObj.getMonth() + 1).padStart(2, "0")}`;

        allSortedMonths.forEach(monthKey => {
            if (monthKey >= firstSelectedMonth) return;
            const mg = monthGroups[monthKey];
            allCategories.forEach(catKey => {
                const entry = mg.categoriesMap[catKey];
                const chaluMas = entry ? entry.currentTotal : 0;
                const gatMas = carryForward[catKey] || 0;
                carryForward[catKey] = chaluMas + gatMas;
            });
        });

        // Generate pages only for selected months
        const toDateObj = new Date(toDate + "T00:00:00Z");
        const selectedMonths = allSortedMonths.filter(mk =>
            mk >= firstSelectedMonth &&
            mk <= `${toDateObj.getFullYear()}-${String(toDateObj.getMonth() + 1).padStart(2, "0")}`
        );

        const monthNameGuj = [
            "જાન્યુઆરી", "ફેબ્રુઆરી", "માર્ચ", "એપ્રિલ", "મે", "જૂન",
            "જુલાઈ", "ઓગસ્ટ", "સપ્ટેમ્બર", "ઓક્ટોબર", "નવેમ્બર", "ડિસેમ્બર"
        ];

        let allPagesHTML = "";

        selectedMonths.forEach((monthKey, mIdx) => {
            const mg = monthGroups[monthKey];
            const [year, m] = monthKey.split("-");
          const fyGujarati = getGujaratiFinancialYear(`${year}-${m}-01`);


            let pageHTML = htmlTemplate
                .replace(/{{yearRange}}/g, fyGujarati)
                .replace(/{{taluko}}/g, talukoName)
                .replace(/{{userTaluko}}/g, user?.taluko || "")
                .replace(/{{userJillo}}/g, user?.jillo || "");

            const monthName = monthNameGuj[parseInt(m) - 1];
            let tableRows = "";
            let idx = 1;
            let totalGatMas = 0;
            let totalKulRakam = 0;

            allCategories.forEach(catKey => {
                const entry = mg.categoriesMap[catKey];
                const title = entry?.title || customCategories?.[catKey] || catKey;
                const chaluMas = entry ? entry.currentTotal : 0;
                const gatMas = carryForward[catKey] || 0;
                const kul = chaluMas + gatMas;

                totalGatMas += gatMas;
                totalKulRakam += kul;

                const dayCells = entry
                    ? entry.rowDays.map(v => `<td>${guj(v)}</td>`).join("")
                    : Array(31).fill("<td>૦</td>").join("");

                tableRows += `
                <tr>
                    <td>${idx}</td>
                    <td style="text-align:left">${title}</td>
                    ${dayCells}
                    <td>${guj(chaluMas)}</td>
                    <td>${guj(gatMas)}</td>
                    <td>${guj(kul)}</td>
                </tr>`;
                idx++;

                // Update carry forward for next month
                carryForward[catKey] = kul;
            });

            // Total row
            const totalDayCells = mg.dayTotals.map(v => `<td>${guj(v)}</td>`).join("");
            tableRows += `
            <tr style="font-weight:bold;background:#f7f7f7">
                <td colspan="2">એકાંકરે કુલ રકમ</td>
                ${totalDayCells}
                <td>${guj(mg.monthTotal)}</td>
                <td>${guj(totalGatMas)}</td>
                <td>${guj(totalKulRakam)}</td>
            </tr>`;

            pageHTML = pageHTML
                .replace("{{dateRange}}", `${monthName} ${guj(year)}`)
                .replace("{{tableRows}}", tableRows)
                .replace("{{grandTotal}}", guj(mg.monthTotal));

            allPagesHTML += pageHTML;
            if (mIdx < selectedMonths.length - 1) {
                allPagesHTML += `<div style="page-break-after: always"></div>`;
            }
        });

        const win = window.open("", "_blank", "width=1200,height=800");
        setLoading(false);

        win.document.write(allPagesHTML);
        win.document.close();
        setTimeout(() => {
  win.focus();   // 🔥 IMPORTANT LINE
  win.print();
}, 500);


    } catch (err) {
        console.error("Print error:", err);
        console.error("Error stack:", err.stack);
        toast({
            title: "કૃપા કરીને યોગ્ય તારીખ પસંદ કરો",
            description: err.message || "કંઈક ખોટું થયું",
            status: "error",
            duration: 3000,
        });
    }

    setLoading(false);
};

    return (
        <Box mt={4} p={3} bg="gray.50" rounded="md">
           <HStack spacing={3} mb={3} flexWrap="wrap">

    <Select
        width="180px"
        value={report.type}
        onChange={(e) => handleReportChange("type", e.target.value)}
    >
        <option value="aavak">આવક</option>
        <option value="javak">જાવક</option>
        <option value="checkIssue">ચેક ઈશ્યૂ</option>
        <option value="tarij">તારીજ પત્રક</option>
        <option value="rojmel">રોજમેળ</option>
    </Select>

   {/* 🔥 FY Dropdown - Show ONLY for tarij */}
{report.type === "tarij" && (
    <Select
        width="180px"
        value={report.fy}
        onChange={(e) => handleReportChange("fy", e.target.value)}
        placeholder="આર્થિક વર્ષ પસંદ કરો"
    >
        <option value="">આર્થિક વર્ષ પસંદ કરો</option>
        {getFinancialYears().map((fy) => (
            <option key={fy.value} value={fy.value}>
                {fy.label}
            </option>
        ))}
    </Select>
)}



    {/* રોજમેળ માટે ખાસ સિંગલ ડેટ પિકર */}
    {report.type === "rojmel" ? (
        <DateInput
            label="તારીખ "
            name="singleDate"
            value={report.singleDate || report.from}
            onDateChange={(name, value) => {
                handleReportChange("from", value);
                handleReportChange("to", value);
                handleReportChange("singleDate", value); // ઓપ્શનલ tracking
            }}
            formatDisplayDate={formatDisplayDate}
            convertToISO={convertToISO}
        />
    ) : (
        <>
            {/* 🔥 Hide date inputs when FY is selected for tarij/aavak/javak */}
           {report.type !== "tarij" && report.type !== "rojmel" && (
                <>
                    <DateInput
                        label="From "
                        name="from"
                        value={report.from}
                        onDateChange={handleReportChange}
                        formatDisplayDate={formatDisplayDate}
                        convertToISO={convertToISO}
                    />

                    <DateInput
                        label="To "
                        name="to"
                        value={report.to}
                        onDateChange={handleReportChange}
                        formatDisplayDate={formatDisplayDate}
                        convertToISO={convertToISO}
                    />
                </>
            )}
        </>
    )}

    <Button
        colorScheme="green"
        isLoading={loading}
        onClick={handlePrintReport}
        leftIcon={<Icon as={FiPrinter} />}
    >
        પ્રિન્ટ / PDF
    </Button>
</HStack>
        </Box>
    );
};

export default CashMelReport;