import { CustomButton } from "component-library-iboon";
import { useTranslation } from "react-i18next";
import { useVillage } from "../../ports/context/VillageContext";
import numberToWords from "number-to-words";
import { useFinancialYear } from "../../ports/context/FinancialYearContext";
import { getLandReport, getLocalFundReport } from "../../adapters/ReportApiAdapter";
import { fetchLandRevenuePage } from "../../adapters/LandRevenueApiAdapter";
import { formatToDDMMYYYY } from "dtf_package";
import { fetchLocalFundRevenuePage } from "../../adapters/LocalFundRevenueApiAdapter";
import { convertToCurrencyWords } from "../../utils/convertToCurrencyWords";
import { convertEngToGujNumber } from "../../utils/convertEngToGujNumber";
import { convertSlashesToDashes } from "../../utils/dateFunction";

const LandRequisitionNotice = ({ villager, accountNumber }) => {
  const { t } = useTranslation();
  const { village, villageName, talukaName, districtName } = useVillage();
  const { financialYear, financialYearName } = useFinancialYear();
  // function convertToCurrencyWords(amount) {
  //   if (isNaN(amount)) return "";

  //   const rupees = Math.floor(amount);
  //   const paise = Math.round((amount - rupees) * 100);

  //   const rupeesWord = numberToWords.toWords(rupees);
  //   const paiseWord = paise > 0 ? numberToWords.toWords(paise) : null;

  //   let result = "";

  //   if (rupees > 0) {
  //     result += `${rupeesWord} rupee${rupees === 1 ? "" : "s"}`;
  //   }

  //   if (paise > 0) {
  //     if (rupees > 0) result += " and ";
  //     result += `${paiseWord} paise`;
  //   }

  //   result += " only";

  //   // Capitalize first letter
  //   return result.charAt(0).toUpperCase() + result.slice(1);
  // }

  // 2. Replace placeholders with actual values
  const data = {
    taluka: talukaName,
    date: new Date().toLocaleDateString("en-GB"),
    time: new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    village: villageName,
    accountNo: villager.accountNo,
    name: villager.name,
    district: districtName,
    landLeft: villager.landMaangnu?.left || 0,
    landPending: villager.landMaangnu?.pending || 0,
    landRotating: villager.landMaangnu?.rotating || 0,
    localLeft: villager.localFundMaangnu?.left || 0,
    localPending: villager.localFundMaangnu?.pending || 0,
    localRotating: villager.localFundMaangnu?.rotating || 0,
    educationLeft: villager.educationCessMaangnu?.left || 0,
    educationPending: villager.educationCessMaangnu?.pending || 0,
    educationRotating: villager.educationCessMaangnu?.rotating || 0,
    noticeFee: 1.0,
    noticeTotal: 1.0, // Assuming notice fee is fixed at 1.0
  };

  data.landTotal = data.landLeft + data.landPending + data.landRotating;
  data.localTotal = data.localLeft + data.localPending + data.localRotating;
  data.educationTotal =
    data.educationLeft + data.educationPending + data.educationRotating;
  data.totalLeft = data.landLeft + data.localLeft + data.educationLeft;
  data.totalPending =
    data.landPending +
    data.localPending +
    data.educationPending +
    data.noticeFee;
  data.totalRotating =
    data.landRotating + data.localRotating + data.educationRotating;
  data.total =
    data.landTotal + data.localTotal + data.educationTotal + data.noticeTotal;

  data.totalWord = convertToCurrencyWords(data.total);
  data.quarter = (data.total / 4).toFixed(2);
  data.quarterWord = convertToCurrencyWords(data.quarter);
  data.total2 = Number(data.total) + Number(data.quarter);

  const handlePreviewClick = async () => {
    try {
      // 1. Fetch the raw HTML file as a string
      const response = await fetch("/reports/JameenMaangnuNotice.html");
      let htmlTemplate = await response.text();

      Object.entries(data).forEach(([key, value]) => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
        htmlTemplate = htmlTemplate.replace(regex, value);
      });

      // 3. Open a new window and write the processed HTML
      const printWindow = window.open("", "_blank", "width=800,height=600");
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(htmlTemplate);
        printWindow.document.close();
      } else {
        console.error("Popup blocked");
      }
    } catch (error) {
      console.error("Failed to load template:", error);
    }
  };

  const handleInsidePreviewClick = async () => {
    try {
      // 1. Fetch the raw HTML file as a string
      const response = await fetch("/reports/landRequisitionFailedNotice.html");
      let htmlTemplate = await response.text();

      Object.entries(data).forEach(([key, value]) => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
        htmlTemplate = htmlTemplate.replace(regex, value);
      });

      // 3. Open a new window and write the processed HTML
      const printWindow = window.open("", "_blank", "width=800,height=600");
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(htmlTemplate);
        printWindow.document.close();
      } else {
        console.error("Popup blocked");
      }
    } catch (error) {
      console.error("Failed to load template:", error);
    }
  };

  const handleLandRevenue154Click = async () => {
    try {
      // 1. Fetch the raw HTML file as a string
      const response = await fetch("/reports/landRevenue154.html");
      let htmlTemplate = await response.text();

      Object.entries(data).forEach(([key, value]) => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
        htmlTemplate = htmlTemplate.replace(regex, value);
      });
      // 3. Open a new window and write the processed HTML
      const printWindow = window.open("", "_blank", "width=800,height=600");
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(htmlTemplate);
        printWindow.document.close();
      }
    } catch (error) {
      console.error("Failed to load template:", error);
    }
  };

  const handleNoticeMujabClick = async () => {
    try {
      // 1. Fetch the raw HTML file as a string
      const response = await fetch("/reports/NoticeMujab.html");
      let htmlTemplate = await response.text();

      Object.entries(data).forEach(([key, value]) => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
        htmlTemplate = htmlTemplate.replace(regex, value);
      });
      // 3. Open a new window and write the processed HTML
      const printWindow = window.open("", "_blank", "width=800,height=600");
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(htmlTemplate);
        printWindow.document.close();
      }
    } catch (error) {
      console.error("Failed to load template:", error);
    }
  };

  const handleJameenVasulatClick = async () => {
    try {
      // 1. Fetch the raw HTML file as a string
      const response = await fetch("/reports/jameenVasulat.html");
      let htmlTemplate = await response.text();
      Object.entries(data).forEach(([key, value]) => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
        htmlTemplate = htmlTemplate.replace(regex, value);
      });
      // 3. Open a new window and write the processed HTML
      const printWindow = window.open("", "_blank", "width=800,height=600");
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(htmlTemplate);
        printWindow.document.close();
      } else {
        console.error("Popup blocked");
      }
    } catch (error) {
      console.error("Failed to load template:", error);
    }
  };

  const handleLocalVasulatClick = async () => {
    try {
      // 1. Fetch the raw HTML file as a string
      const response = await fetch("/reports/localVasulat.html");
      let htmlTemplate = await response.text();
      Object.entries(data).forEach(([key, value]) => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
        htmlTemplate = htmlTemplate.replace(regex, value);
      });
      // 3. Open a new window and write the processed HTML
      const printWindow = window.open("", "_blank", "width=800,height=600");
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(htmlTemplate);
        printWindow.document.close();
      } else {
        console.error("Popup blocked");
      }
    } catch (error) {
      console.error("Failed to load template:", error);
    }
  };

  const handleEducationVasulatClick = async () => {
    try {
      // 1. Fetch the raw HTML file as a string
      const response = await fetch("/reports/educationVasulat.html");
      let htmlTemplate = await response.text();
      Object.entries(data).forEach(([key, value]) => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
        htmlTemplate = htmlTemplate.replace(regex, value);
      });
      // 3. Open a new window and write the processed HTML
      const printWindow = window.open("", "_blank", "width=800,height=600");
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(htmlTemplate);
        printWindow.document.close();
      } else {
        console.error("Popup blocked");
      }
    } catch (error) {
      console.error("Failed to load template:", error);
    }
  };
  const handleEightBClick = async () => {
    try {
      const landReportData = await getLandReport(
        1,
        100000,
        village,
        financialYear
      );
      let LandReportResult = landReportData?.data?.data.filter((item) => item?.accountNo === accountNumber) || [];


      const localFundReportData = await getLocalFundReport(1, 100000, village, financialYear); // Replace with your actual API
      let localFundReportResult = localFundReportData?.data?.data.filter((item) => item?.accountNo === accountNumber) || [];
 


      const pipeline = [
        {
          $lookup: {
            from: "villagers",
            localField: "villager",
            foreignField: "_id",
            as: "villager",
          },
        },
        { $unwind: "$villager" },
      ];


      const landRevenueData = await fetchLandRevenuePage(
        1,
        100000,
        "",
        "villager",
        "",
        1,
        [
          ...pipeline,
          {
            $match: {
              $expr: {
                $eq: ["$financialYear", { $toObjectId: financialYear }],
              },
            },
          },
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$villager.village", { $toObjectId: village }] },
                  { $eq: ["$villager.accountNo", accountNumber] }
                ]
              }
            }
          },
        ]
      );


      const landRevenueDataResult = landRevenueData?.data?.data || [];

      const localFundRevenueData = await fetchLocalFundRevenuePage(
        1,
        100000,
        "",
        "villager",
        "",
        1,
        [
          ...pipeline,
          {
            $match: {
              $expr: {
                $eq: ["$financialYear", { $toObjectId: financialYear }],
              },
            },
          },
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$villager.village", { $toObjectId: village }] },
                  { $eq: ["$villager.accountNo", accountNumber] }
                ]
              }
            }
          },
        ]
      );


      const localFundRevenueDataResult = localFundRevenueData?.data?.data || [];




      let data = {
        name: LandReportResult[0]?.name || "",
        accountNumber: LandReportResult[0]?.accountNo || "",
        financialYear: financialYearName || '',
        landCollumnTwentyOne: LandReportResult[0]?.collumnTwentyOne || 0,
        localCollumnFourteen: localFundReportResult[0]?.collumnFourteen || 0,
        sarkari: Number(LandReportResult[0]?.sarkari || 0),
        sivay: Number(LandReportResult[0]?.sivay || 0),
        localSarkari: Number(localFundReportResult[0]?.sarkari || 0),
        localSivay: Number(localFundReportResult[0]?.sivay || 0),
        landRotating: Number(LandReportResult[0]?.rotating || 0),
        localRotating: Number(localFundReportResult[0]?.rotating || 0),
        landRevenueBillNo: landRevenueDataResult[0]?.billNo ? Number(landRevenueDataResult[0]?.billNo || 0) : "",
        landrevenueBillDate: landRevenueDataResult[0]?.billDate ? formatToDDMMYYYY(new Date(landRevenueDataResult[0]?.billDate)) : "",
        landRevenueLeft: Number(landRevenueDataResult[0]?.left || 0),
        landRevenuePending: Number(landRevenueDataResult[0]?.pending || 0),
        landRevenueRotating: Number(landRevenueDataResult[0]?.rotating || 0),
        localFundRevenueBillNo: landRevenueDataResult[0]?.billNo ? Number(landRevenueDataResult[0]?.billNo || 0) : "",
        localFundrevenueBillDate: localFundRevenueDataResult[0]?.billDate ? formatToDDMMYYYY(new Date(localFundRevenueDataResult[0]?.billDate)) : "",
        localFundRevenueLeft: Number(localFundRevenueDataResult[0]?.left || 0),
        localFundRevenuePending: Number(localFundRevenueDataResult[0]?.pending || 0),
        localFundRevenueRotating: Number(localFundRevenueDataResult[0]?.rotating || 0),
      }

      data.totalMulatviSayuktLand = data.landCollumnTwentyOne + data.localCollumnFourteen
      data.localFundFourFiveTotal = data.localSarkari + data.localSivay

      data.totalChaltiSayuktLand = data.sarkari + data.sivay + data.localFundFourFiveTotal

      data.TotalRotatingSayuktLand = data.landRotating + data.localRotating + data.sarkari

      data.totalEkndarLahenuSayuktLand = data.totalMulatviSayuktLand + data.totalChaltiSayuktLand + data.TotalRotatingSayuktLand

      data.totalLandRevenueSayuktLand = data.landRevenueLeft + data.landRevenuePending + data.landRevenueRotating

      data.totalLocalFundRevenueSayuktLand = data.localFundRevenueLeft + data.localFundRevenuePending + data.localFundRevenueRotating

      data.ekandarVasulSayuktLand = data.totalLandRevenueSayuktLand + data.totalLocalFundRevenueSayuktLand

      let y = data.totalEkndarLahenuSayuktLand - data.ekandarVasulSayuktLand


      data.A = 0
      data.B = 0
      if (y < 0) {
        data.A = Math.abs(y)
      }
      else {
        data.B = Math.abs(y)
      }

      for (let key in data) {
        if (typeof data[key] === 'number') {
          data[key] = data[key].toFixed(2);
        }
      }


      const gujaratiData = {};
      for (const [key, value] of Object.entries(data)) {
        if (key === "localFundrevenueBillDate" || key === "landrevenueBillDate") {
          gujaratiData[key] = convertEngToGujNumber(convertSlashesToDashes(value));
        } else if (typeof value === "number" || typeof value === "string" || /^\d+$/.test(value)) {
          gujaratiData[key] = convertEngToGujNumber(value);
        } else {
          gujaratiData[key] = value;
        }
      }

      data = gujaratiData;
      // 1. Fetch the raw HTML file as a string
      const response = await fetch("/reports/R.V.18.html");
      let htmlTemplate = await response.text();
      Object.entries(data).forEach(([key, value]) => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
        htmlTemplate = htmlTemplate.replace(regex, value);
      });
      // 3. Open a new window and write the processed HTML
      const printWindow = window.open("", "_blank", "width=800,height=600");
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(htmlTemplate);
        printWindow.document.close();
      } else {
        console.error("Popup blocked");
      }
    } catch (error) {
      console.error("Failed to load template:", error);
    }
  }
  return (
    <>
      <CustomButton
        size="md"
        onClick={() => {
          handlePreviewClick();
          handleLandRevenue154Click();
          handleInsidePreviewClick();
          handleNoticeMujabClick();
          handleJameenVasulatClick();
          handleLocalVasulatClick();
          handleEducationVasulatClick();
          // handleEightBClick();
        }}
      >
        {t("dashboard.landRequisitionNotice")}
      </CustomButton>
      <CustomButton
        size="md"
        onClick={() => {
          // handlePreviewClick();
          // handleLandRevenue154Click();
          // handleInsidePreviewClick();
          // handleNoticeMujabClick();
          // handleJameenVasulatClick();
          // handleLocalVasulatClick();
          // handleEducationVasulatClick();
          handleEightBClick();
        }}
      >
        ગામના નમુના નં. ૮ બ
      </CustomButton>
    </>

  );
};

export default LandRequisitionNotice;
