import { Center, HStack, Input, Select, Text, VStack } from '@chakra-ui/react'
import React, { useState } from 'react'
import PageHeader from '../components/PageHeader'
import { t } from 'i18next'
import { CustomButton, CustomInput, getGlobalApiCaller } from 'component-library-iboon'
import { useVillage } from '../../ports/context/VillageContext'
import { useFinancialYear } from '../../ports/context/FinancialYearContext'
import numberToWords from "number-to-words";
import { convertToCurrencyWords } from '../../utils/convertToCurrencyWords'
import { convertEngToGujNumber } from '../../utils/convertEngToGujNumber'
import { convertSlashesToDashes } from '../../utils/dateFunction'
function MainReports() {
    const { village, talukaName, villageName, districtName } = useVillage();
    const { financialYear } = useFinancialYear();

    const BASE_URL = `${import.meta.env.VITE_SERVER_URL}`;
    const getMainReport = async (village, financialYear, total) => {
        const callApi = getGlobalApiCaller();
        if (!callApi) return { data: null, status: false };
        const response = await callApi({
            url: `${BASE_URL}/mainReport?village=${village}&financialYear=${financialYear}&noticeFees=1&total=${total}`,
            method: "GET",
            Token: localStorage.getItem("accessToken"),
            showSuccessToast: false,
        });
        return response.data;
    };

    const handlePreview152 = async (finalReports) => {
        try {
            const response = await fetch("/reports/JameenMaangnuNotice.html");
            const htmlTemplate = await response.text();

            let combinedHTML = "";

            // Loop through each report and replace placeholders
            finalReports.forEach((data) => {
                let htmlBlock = htmlTemplate;

                Object.entries(data).forEach(([key, value]) => {
                    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
                    htmlBlock = htmlBlock.replace(regex, value);
                });

                // Add a page break between each notice
                combinedHTML += `<div style="page-break-after: always;">${htmlBlock}</div>`;
            });

            // Open a new tab with all combined content
            const printWindow = window.open("", "_blank", "width=900,height=700");
            if (printWindow) {
                printWindow.document.open();
                printWindow.document.write(`
        <html>
          <head>
            <title>જમીન મહેસૂલ ન આપનારને નોટીસ</title>
            <style>
              @media print {
                body { margin: 0; padding: 0; }
                .page-break { page-break-after: always; }
              }
            </style>
          </head>
          <body>
            ${combinedHTML}
          </body>
        </html>
      `);
                printWindow.document.close();
            } else {
                console.error("Popup blocked. Please allow popups.");
            }
        } catch (error) {
            console.error("Failed to load or process template:", error);
        }
    };

    const handlePreview148 = async (finalReports) => {
        try {
            // 1. Fetch the raw HTML template
            const response = await fetch("/reports/landRequisitionFailedNotice.html");
            const htmlTemplate = await response.text();

            let combinedHTML = "";

            // 2. Loop through each data record and fill the template
            finalReports.forEach((record) => {
                let htmlBlock = htmlTemplate;

                // Replace {{ key }} with actual values from each record
                Object.entries(record).forEach(([key, value]) => {
                    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
                    htmlBlock = htmlBlock.replace(regex, value ?? "");
                });

                // Add page break after each notice
                combinedHTML += `
        <div style="page-break-after: always;">
          ${htmlBlock}
        </div>
      `;
            });

            // 3. Open the new window with the combined content
            const printWindow = window.open("", "_blank", "width=900,height=700");
            if (printWindow) {
                printWindow.document.open();
                printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="gu">
        <head>
          <meta charset="UTF-8">
          <title>Notice</title>
          <style>
            @media print {
              .page-break { page-break-after: always; }
              body { margin: 0; padding: 0; }
            }
          </style>
        </head>
        <body>
          ${combinedHTML}
        </body>
        </html>
      `);
                printWindow.document.close();
            } else {
                console.error("Popup blocked");
            }
        } catch (error) {
            console.error("Failed to load template:", error);
        }
    };

    const handlePreview154 = async (finalReports) => {
        try {
            // 1. Fetch the raw HTML file as a string
            const response = await fetch("/reports/landRevenue154.html");
            const htmlTemplate = await response.text();

            let combinedHTML = "";

            // 2. Loop through each report and fill the template
            finalReports.forEach((record) => {
                let filledTemplate = htmlTemplate;

                Object.entries(record).forEach(([key, value]) => {
                    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
                    filledTemplate = filledTemplate.replace(regex, value ?? "");
                });

                // Wrap each notice in a page-break section
                combinedHTML += `
        <div style="page-break-after: always;">
          ${filledTemplate}
        </div>
      `;
            });

            // 3. Open a new window and write the processed HTML
            const printWindow = window.open("", "_blank", "width=900,height=700");
            if (printWindow) {
                printWindow.document.open();
                printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="gu">
        <head>
          <meta charset="UTF-8">
          <title>જમીન મહેસૂલ નોટીસ - કલમ ૧૫૪</title>
          <style>
            @media print {
              .page-break { page-break-after: always; }
              body { margin: 0; padding: 0; }
            }
          </style>
        </head>
        <body>
          ${combinedHTML}
        </body>
        </html>
      `);
                printWindow.document.close();
            } else {
                console.error("Popup blocked");
            }
        } catch (error) {
            console.error("Failed to load template:", error);
        }
    };

    const handlePreview200 = async (finalReports) => {
        try {
            // 1. Fetch the raw HTML template
            const response = await fetch("/reports/NoticeMujab.html");
            const htmlTemplate = await response.text();

            let combinedHTML = "";

            // 2. Loop through all records and inject values
            finalReports.forEach((record) => {
                let filledTemplate = htmlTemplate;

                Object.entries(record).forEach(([key, value]) => {
                    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
                    filledTemplate = filledTemplate.replace(regex, value ?? "");
                });

                combinedHTML += `
        <div style="page-break-after: always;">
          ${filledTemplate}
        </div>
      `;
            });

            // 3. Open new tab and inject full HTML with multiple pages
            const printWindow = window.open("", "_blank", "width=900,height=700");
            if (printWindow) {
                printWindow.document.open();
                printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="gu">
        <head>
          <meta charset="UTF-8">
          <title>નોટીસ મુજાબ</title>
          <style>
            @media print {
              .page-break { page-break-after: always; }
              body { margin: 0; padding: 0; }
            }
          </style>
        </head>
        <body>
          ${combinedHTML}
        </body>
        </html>
      `);
                printWindow.document.close();
            } else {
                console.error("Popup blocked");
            }
        } catch (error) {
            console.error("Failed to load template:", error);
        }
    };




    const [notice, setNotice] = useState(152)
    const [total, setTotal] = useState(0)
    const handleLimitChange = (e) => {
        setNotice(Number(e.target.value));
    }

    // function convertToCurrencyWords(amount) {
    //     if (isNaN(amount)) return "";

    //     const rupees = Math.floor(amount);
    //     const paise = Math.round((amount - rupees) * 100);

    //     const rupeesWord = numberToWords.toWords(rupees);
    //     const paiseWord = paise > 0 ? numberToWords.toWords(paise) : null;

    //     let result = "";

    //     if (rupees > 0) {
    //         result += `${rupeesWord} rupee${rupees === 1 ? "" : "s"}`;
    //     }

    //     if (paise > 0) {
    //         if (rupees > 0) result += " and ";
    //         result += `${paiseWord} paise`;
    //     }

    //     result += " only";

    //     // Capitalize first letter
    //     return result.charAt(0).toUpperCase() + result.slice(1);
    // }

    const handlePrint = async (notice, total) => {

        if (!notice) {
            return;
        }
        const noticeFee = 1;
        const response = await getMainReport(village, financialYear, total);


        if (response && response.data && Array.isArray(response.data.data)) {
            const resultArray = response.data.data;

            const finalReports = resultArray.map((result) => {
                let data = {
                    taluka: talukaName,
                    date: new Date().toLocaleDateString("en-GB"),
                    time: new Date().toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                    village: villageName,
                    accountNo: result.accountNo || "-",
                    name: result.name || "-",
                    district: districtName,

                    landLeft: result.landData?.collumnTwentyOne || 0,
                    landPending: result.landData?.sivay || 0,
                    landRotating: result.landData?.rotating || 0,

                    localLeft: result.localFundData?.collumnFourteenlocal || 0,
                    localPending: result.localFundData?.localFourFivePanding || 0,
                    localRotating: result.localFundData?.localRotating || 0,

                    educationLeft: result.educationData?.collumnFourteenEducation || 0,
                    educationPending: result.educationData?.educationFourFivePanding || 0,
                    educationRotating: result.educationData?.educationRotating || 0,
                    noticeFee: Number(noticeFee) || 0,
                    noticeTotal: Number(noticeFee) || 0,
                };

                // Calculate totals
                data.landTotal = result.landData?.landTotal || 0;
                data.localTotal = result.localFundData?.localTotal || 0;
                data.educationTotal = result.educationData?.educationTotal || 0;

                data.totalLeft = data.landLeft + data.localLeft + data.educationLeft;
                data.totalPending = data.landPending + data.localPending + data.educationPending + data.noticeFee;
                data.totalRotating = data.landRotating + data.localRotating + data.educationRotating;

                data.total = data.landTotal + data.localTotal + data.educationTotal + data.noticeTotal;

                data.educationPending = data.educationPending.toFixed(2);
                data.landTotal = data.landTotal.toFixed(2);
                data.localTotal = data.localTotal.toFixed(2);
                data.educationTotal = data.educationTotal.toFixed(2);
                data.totalPending = data.totalPending.toFixed(2);
                data.totalLeft = data.totalLeft.toFixed(2);
                data.total = data.total.toFixed(2);

                // Convert total and quarter to words
                data.totalWord = convertToCurrencyWords(data.total);
                data.quarter = (data.total / 4).toFixed(2);
                data.quarterWord = convertToCurrencyWords(data.quarter);
                data.total2 = Number(data.total) + Number(data.quarter);

                for (let key in data) {
                    if (typeof data[key] === 'number') {
                        data[key] = data[key].toFixed(2);
                    }
                }
                const gujaratiData = {};
                for (const [key, value] of Object.entries(data)) {
                    if (key === "date") {
                        gujaratiData[key] = convertEngToGujNumber(convertSlashesToDashes(value));
                    } else if (typeof value === "number" || typeof value === "string" || /^\d+$/.test(value)) {
                        gujaratiData[key] = convertEngToGujNumber(value);
                    } else {
                        gujaratiData[key] = value;
                    }
                }


                return data = gujaratiData;
            });

            if (notice == 152) {
                handlePreview152(finalReports)
            } else if (notice == 148) {
                handlePreview148(finalReports);
            } else if (notice == 154) {
                handlePreview154(finalReports);
            } else if (notice == 200) {
                handlePreview200(finalReports);
            }

        }
    };


    return (
        <Center w={"90%"}>
            <VStack spacing={0} w="100%" align="stretch">
                <PageHeader>{t("topbar.mainReport")}</PageHeader>
                <HStack spacing={4}>
                    <Text></Text>
                    <Select
                        value={notice}
                        onChange={handleLimitChange}
                        w="200px"
                        size="sm"
                    >
                        <option value="0">Select notice</option>
                        {[
                            { label: "152 notice", value: 152 },
                            { label: "148 notice", value: 148 },
                            { label: "154 notice", value: 154 },
                            { label: "200 notice", value: 200 }
                        ].map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </Select>

                    <CustomInput
                        w={"200px"}
                        type="number"
                        value={total}
                        onChange={(e) => setTotal(e.target.value)}
                        placeholder="0.00"
                    />
                    <Text>થી વધુ</Text>
                    <CustomButton onClick={() => handlePrint(notice, total)} colorScheme="teal">
                        Print
                    </CustomButton>
                </HStack>
            </VStack>
        </Center>
    )
}

export default MainReports