import { Center, HStack, Select, Text, VStack } from '@chakra-ui/react'
import React, { useState } from 'react'
import PageHeader from '../components/PageHeader'
import { t } from 'i18next'
import { CustomButton, CustomInput, getGlobalApiCaller } from 'component-library-iboon'
import { useVillage } from '../../ports/context/VillageContext'
import { useFinancialYear } from '../../ports/context/FinancialYearContext'
import { convertToCurrencyWords } from '../../utils/convertToCurrencyWords'
import { convertEngToGujNumber } from '../../utils/convertEngToGujNumber'
import { convertSlashesToDashes } from '../../utils/dateFunction'

const MANSA_VILLAGE_ID = "68c7d1981282f7ea1caf1cbe";

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

    // ✅ Common template fill function
    const fillTemplate = (template, data) => {
        return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => data[key] ?? "");
    };

    // ✅ Common function to process template - replace rowspan, fill placeholders, remove local fund row
  const processTemplate = (htmlTemplate, record) => {
    let filledTemplate = htmlTemplate;

    if (record.hideLocalFund === "true") {
        // ✅ Local Fund row remove karo (pure <tr>...</tr> including empty account cell)
        filledTemplate = filledTemplate.replace(
            /<tr class="local-fund-row">[\s\S]*?<\/tr>/,
            ""
        );
    }

    // ✅ Placeholders fill karo
    filledTemplate = fillTemplate(filledTemplate, record);

    return filledTemplate;
};
    const handlePreview152 = async (finalReports) => {
        try {
            const response = await fetch("/reports/JameenMaangnuNotice.html");
            const htmlTemplate = await response.text();

            let combinedHTML = "";
            finalReports.forEach((data) => {
                const filledTemplate = processTemplate(htmlTemplate, data);
                combinedHTML += `<div style="page-break-after: always;">${filledTemplate}</div>`;
            });

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
                      <body>${combinedHTML}</body>
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
            const response = await fetch("/reports/landRequisitionFailedNotice.html");
            const htmlTemplate = await response.text();

            let combinedHTML = "";
            finalReports.forEach((record) => {
                const filledTemplate = processTemplate(htmlTemplate, record);
                combinedHTML += `<div style="page-break-after: always;">${filledTemplate}</div>`;
            });

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
                    <body>${combinedHTML}</body>
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
            const response = await fetch("/reports/landRevenue154.html");
            const htmlTemplate = await response.text();

            let combinedHTML = "";
            finalReports.forEach((record) => {
                const filledTemplate = processTemplate(htmlTemplate, record);
                combinedHTML += `<div style="page-break-after: always;">${filledTemplate}</div>`;
            });

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
                    <body>${combinedHTML}</body>
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
            const response = await fetch("/reports/NoticeMujab.html");
            const htmlTemplate = await response.text();

            let combinedHTML = "";
            finalReports.forEach((record) => {
                const filledTemplate = processTemplate(htmlTemplate, record);
                combinedHTML += `<div style="page-break-after: always;">${filledTemplate}</div>`;
            });

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
                    <body>${combinedHTML}</body>
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

    const [notice, setNotice] = useState(152);
    const [total, setTotal] = useState(0);

    const handleLimitChange = (e) => {
        setNotice(Number(e.target.value));
    };

const handlePrint = async (notice, total) => {
    if (!notice) return;

    const noticeFee = 1;
    const isMansa = village === MANSA_VILLAGE_ID;
    const response = await getMainReport(village, financialYear, total);

    if (response && response.data && Array.isArray(response.data.data)) {
        const resultArray = response.data.data;

        const finalReports = resultArray.map((result) => {

            const sourceLandPachhliBaki = Number(result.left || 0);
            const sourceLandSivay = Number(result.landData?.sivay || 0);
            const sourceLandRotating = Number(result.landData?.rotating || 0);
            const sourceLocalPending = Number(result.localFundData?.localFourFivePanding || 0);
            const computedEducationLeft = Number((sourceLandPachhliBaki * 0.25).toFixed(2));

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

                landLeft:    isMansa ? sourceLandPachhliBaki : (result.landData?.collumnTwentyOne || 0),
                landPending: isMansa ? sourceLandSivay + sourceLocalPending : (result.landData?.sivay || 0),
                landRotating: isMansa ? sourceLandRotating : (result.landData?.rotating || 0),

                localLeft:    result.localFundData?.collumnFourteenlocal || 0,
                localPending: result.localFundData?.localFourFivePanding || 0,
                localRotating: result.localFundData?.localRotating || 0,

                educationLeft:    isMansa ? computedEducationLeft : (result.educationData?.collumnFourteenEducation || 0),
                educationPending: result.educationData?.educationFourFivePanding || 0,
                educationRotating: result.educationData?.educationRotating || 0,

                noticeFee:   Number(noticeFee) || 0,
                noticeTotal: Number(noticeFee) || 0,

                hideLocalFund: isMansa ? "true" : "false",
            };

            // ✅ STEP 1: Individual fields pehle round karo
            const individualKeys = [
                'landLeft', 'landPending', 'landRotating',
                'localLeft', 'localPending', 'localRotating',
                'educationLeft', 'educationPending', 'educationRotating',
                'noticeFee', 'noticeTotal'
            ];
            individualKeys.forEach(key => {
                data[key] = Math.round(Number(data[key]) || 0);
            });

            // ✅ STEP 2: Totals rounded values se calculate karo (horizontal correct)
            data.landTotal      = data.landLeft      + data.landPending      + data.landRotating;
            data.localTotal     = data.localLeft     + data.localPending     + data.localRotating;
            data.educationTotal = data.educationLeft + data.educationPending + data.educationRotating;
            data.noticeTotal    = data.noticeFee; // notice row: left=0, pending=noticeFee, rotating=0

            // ✅ STEP 3: Vertical totals (kul row) - rounded values se calculate karo
            data.totalLeft     = data.landLeft     + data.localLeft     + data.educationLeft;
            data.totalPending  = data.landPending  + data.localPending  + data.educationPending  + data.noticeFee;
            data.totalRotating = data.landRotating + data.localRotating + data.educationRotating;
            data.total         = data.landTotal    + data.localTotal    + data.educationTotal    + data.noticeTotal;

            // ✅ STEP 4: Words aur quarter
            data.totalWord   = convertToCurrencyWords(data.total);
            data.quarter     = Math.round(data.total / 4);
            data.quarterWord = convertToCurrencyWords(data.quarter);
            data.total2      = data.total + data.quarter;

            // ✅ STEP 5: Gujarati conversion
            const gujaratiData = {};
            for (const [key, value] of Object.entries(data)) {
                if (key === "date") {
                    gujaratiData[key] = convertEngToGujNumber(convertSlashesToDashes(value));
                } else if (key === "hideLocalFund") {
                    gujaratiData[key] = value;
                } else if (typeof value === 'number') {
                    gujaratiData[key] = convertEngToGujNumber(String(value));
                } else if (typeof value === 'string') {
                    gujaratiData[key] = convertEngToGujNumber(value);
                } else {
                    gujaratiData[key] = value;
                }
            }

            return gujaratiData;
        });

        if (notice == 152) handlePreview152(finalReports);
        else if (notice == 148) handlePreview148(finalReports);
        else if (notice == 154) handlePreview154(finalReports);
        else if (notice == 200) handlePreview200(finalReports);
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
    );
}

export default MainReports;