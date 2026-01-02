import { useRef } from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Box,
  Flex,
  Button,
  Select,
  Text,
  useDisclosure,
  HStack,
} from "@chakra-ui/react";
import { formatToDDMMYYYY } from "dtf_package";
import { CustomButton } from "component-library-iboon";
import { useFinancialYear } from "../../ports/context/FinancialYearContext";
import { useVillage } from "../../ports/context/VillageContext";
import { getEducationCessReport } from "../../adapters/ReportApiAdapter";
import { fetchChallansPage } from "../../adapters/ChallanApiAdapter";
import { convertEngToGujNumber } from "../../utils/convertEngToGujNumber";
import {
  convertSlashesToDashes,
  getLastDateofYearRange,
} from "../../utils/dateFunction";
import ReportsRemarksModal from "./ReportsRemarksModal";
import { fetchReportsRemarkPage } from "../../adapters/ReportsRemarkApiAdepter";
import { useUser } from "../../ports/context/UserContext";

const EducationReportTable = ({
  data,
  page,
  setPage,
  limit,
  setLimit,
  totalDocs,
  lastPage,
}) => {
  const { village, villageName, talukaName, districtName } = useVillage();
  const printRef = useRef();
  const { financialYear, financialYearName } = useFinancialYear();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useUser();
  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1); // reset page when limit changes
  };

  const handlePrint = async () => {
    const printWindow = window.open("", "_blank", "width=1500,height=800");
    if (!printWindow) {
      alert("Please allow popups for this site to print the report.");
      return;
    }

    // Step 1: Show loading message in print window
    printWindow.document.write(`
    <html>
      <head><title>મોજે. ${villageName} ગામ નમુનો નં. ૮(ક) શિક્ષણ ઉપકર ( ટાળા પત્રક )</title></head>
      <body><h2>લોડ થઈ રહ્યું છે...</h2></body>
    </html>
  `);
    printWindow.document.close();

    // Step 2: Fetch full report data
    let fullData = [];
    let challanData = [];
    let remark = "";
    try {
      const response = await getEducationCessReport(
        1,
        totalDocs,
        village,
        financialYear
      ); // Replace with your actual API
      fullData = response?.data?.data || [];

      const challanResponse = await fetchChallansPage(1, 10000, "", "", {
        type: "Education",
        village,
        financialYear,
      });

      challanData = challanResponse?.data?.data || [];

      const filter = {
        financialYear,
        village,
        type: "Education",
      };

      const remarkResponse = await fetchReportsRemarkPage(
        1,
        1,
        "",
        "",
        filter,
        1
      );
      remark = remarkResponse?.data?.data[0]?.remark;
    } catch (error) {
      printWindow.document.body.innerHTML = "<p>ડેટા લાવતી વખતે ભૂલ આવી.</p>";
      return;
    }

    // --- Utility: Wrap long Gujarati names ---
    function wrapGujaratiName(name) {
      if (!name) return "";
      const words = name.trim().split(/\s+/);
      if (words.length === 1) {
        // For single long words: wrap every 8 characters
        return name.match(/.{1,8}/g)?.join("<br>") || name;
      } else {
        // For multiple words: wrap every 4 words
        const parts = [];
        for (let i = 0; i < words.length; i += 4) {
          parts.push(words.slice(i, i + 4).join(" "));
        }
        return parts.join("<br>");
      }
    }

    // --- Utility: Count lines per Gujarati name ---
    function getLineCount(name) {
      if (!name) return 1;
      const words = name.trim().split(/\s+/);
      if (words.length === 1) return Math.ceil(name.length / 8);
      return Math.ceil(words.length / 4);
    }

    // --- Smart pagination based on line count ---
    const maxLinesPerPage = 17;
    const pages = [];
    let currentPage = [];
    let currentLineCount = 0;

    for (let i = 0; i < fullData.length; i++) {
      const item = fullData[i];
      const lineCount = getLineCount(item.name);

      if (currentLineCount + lineCount > maxLinesPerPage) {
        pages.push(currentPage);
        currentPage = [];
        currentLineCount = 0;
      }

      currentPage.push(item);
      currentLineCount += lineCount;
    }

    if (currentPage.length > 0) pages.push(currentPage);

    let pagesHtml = "";

    pages.forEach((chunk, pageIndex) => {
      const rowsHtml = chunk
        .map((item) => {
          const sarkariAmt = parseFloat(item.sarkari) || 0;
          const sivayAmt = parseFloat(item.sivay) || 0;
          const maangnuLeft = parseFloat(item.maangnuLeft) || 0;
          const maangnuRotating = parseFloat(item.maangnuRotating) || 0;
          const rotating = parseFloat(item.rotating) || 0;
          const left = parseFloat(item.left) || 0;
          const pending = parseFloat(item.pending) || 0;
          const fajal = parseFloat(item.fajal) || 0;

          const totalDemand = (
            maangnuLeft +
            sarkariAmt +
            sivayAmt +
            maangnuRotating
          ).toFixed(2);
          const totalPaid = (left + pending + fajal + rotating).toFixed(2);

          return `
      <tr>
        <td>${convertEngToGujNumber(item.accountNo)}</td>
        <td style="white-space: nowrap; width: 700px; max-width: 700px; text-align:left;">${wrapGujaratiName(
          item.name
        )}</td>
        <td>${convertEngToGujNumber(maangnuLeft.toFixed(2))}</td>
        <td>${convertEngToGujNumber(sarkariAmt.toFixed(2))}</td>
        <td>${convertEngToGujNumber(sivayAmt.toFixed(2))}</td>
        <td>${convertEngToGujNumber(maangnuRotating.toFixed(2))}</td>
        <td>${convertEngToGujNumber(totalDemand)}</td>
        <td>${convertEngToGujNumber(item.billNo || "")}</td>
        <td>${
          item.billDate
            ? convertEngToGujNumber(
                convertSlashesToDashes(
                  formatToDDMMYYYY(new Date(item.billDate))
                )
              )
            : ""
        }</td>
        <td>${convertEngToGujNumber(left.toFixed(2))}</td>
        <td>${convertEngToGujNumber(pending.toFixed(2))}</td>
        <td>${convertEngToGujNumber(rotating.toFixed(2))}</td>
        <td>${convertEngToGujNumber(fajal.toFixed(2))}</td>
        <td>${convertEngToGujNumber(totalPaid)}</td>
        <td>${convertEngToGujNumber(item.collumnFourteen.toFixed(2))}</td>
        <td>${convertEngToGujNumber(item.collumnFifteen.toFixed(2))}</td>
        <td></td>
      </tr>
    `;
        })
        .join("");

      pagesHtml += `
    <section class="print-page">
      <table>
        <thead>
          <tr>
            <th colspan="17" style="font-size:24px;">
              મોજે. ${villageName} ગામ નમુનો નં. ૮(ક) શિક્ષણ ઉપકર ( ટાળા પત્રક ) ${convertEngToGujNumber(
        financialYearName
      )}
            </th>
          </tr>
          <tr>
            <th colspan="2"></th>
            <th colspan="5">સંયુક્ત એકંદર માંગણું</th>
            <th colspan="6">વસુલાત</th>
            <th colspan="4"></th>
          </tr>
          <tr>
            <th rowspan="2"><div style="white-space: nowrap; transform: rotate(315deg);">ખાતા નંબર</div></th> 
            <th rowspan="2">નામ</th>
            <th rowspan="2">પાછલી બાકી</th>
            <th colspan="3">ચાલુ બાકી</th>
            <th rowspan="2">કુલ એકંદર માંગણું</th>
            <th rowspan="2">પહોંચ નં.</th>
            <th rowspan="2">તારીખ</th>
            <th rowspan="2">પાછલી</th>
            <th rowspan="2">ચાલુ</th>
            <th rowspan="2">ફરતી</th>
            <th rowspan="2">ગત સાલનું ફાજલ</th>
            <th rowspan="2">કુલ વસુલાત થયેલ રકમ</th>
            <th rowspan="2">બિનહુકમ</th>
            <th rowspan="2">જાહેર વસુલ</th>
            <th rowspan="2"><div style="white-space: nowrap; transform: rotate(315deg);">શેરો</div></th>
          </tr>
          <tr>
            <th>સરકારી</th>
            <th>ખેતી સિવાય</th>
            <th>ફરતી</th>
          </tr>
          <tr>
            ${[...Array(17)]
              .map((_, i) => `<th>${convertEngToGujNumber(i + 1)}</th>`)
              .join("")}
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      ${
        pageIndex === pages.length - 1 && remark
          ? `<div class="remark-section"><span>નોધ: ${remark}</span></div>`
          : ""
      }

      <div class="page-footer">
        <div class="footer-content">
          <span>શિવોહમ એન્ટરપ્રાઈઝ, ગાંધીનગર - ૭૦૪૧૭૧૭૩૯૫</span>
          <span>પેજ નંબર : ${convertEngToGujNumber(
            pageIndex + 1
          )} / ${convertEngToGujNumber(pages.length)}</span>
        </div>
      </div>
    </section>
  `;
    });

    // Inject into print window
    printWindow.document.open();
    printWindow.document.write(`
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>ગામ નમુનો નં. ૧૧ શિક્ષણ ઉપકર ( ટાળા પત્રક )</title>
      <style>
        body {
          font-family: "Noto Sans Gujarati", "Arial Unicode MS", "Noto Sans", sans-serif;
          margin: 0;
          margin-left: 50px;
        }
        table {
          width: 100%;
        }
        table, th, td {
          border: 1px solid black;
          border-collapse: collapse;
        }
        th, td {
          padding: 4px;
          font-size: 14px;
          text-align: center;
          width: 100px;
        }
        th {
          background-color: #d4d4d4ff;
        }
        h2 {
          text-align: center;
        }
        .print-page {
          page-break-after: always;
          position: relative;
          min-height: 100vh;
        }
        .page-footer {
          margin-top: 50px !important;
          display: flex;
          justify-content: space-between;
          font-size: 20px;
          padding: 10px;
        }
        @media print {
          .page-footer {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            display: flex;
            justify-content: space-between;
            font-size: 18px;
            padding: 10px;
            background: #fff;
          }
        }
        .footer-content {
          display: flex;
          justify-content: space-between;
          width: 100%;
        }
        .remark-section {
          font-size: 16px !important;
          margin-top: 10px;
        }
      </style>
    </head>
    <body>${pagesHtml}</body>
  </html>
`);
    printWindow.document.close();

    // 6. Now open second window after data load
    const secondWindow = window.open("", "_blank", "width=1000,height=700");

    if (!secondWindow) {
      alert("Please allow popups for summary view.");
      return;
    }

    fullData = fullData.filter((item) => item.isTotalRow);

    const mulatviNahiteviBakiLeft = fullData.reduce(
      (sum, item) => sum + parseFloat(item.maangnuLeft || 0),
      0
    );

    const mulatviNahiteviBakiTotal = mulatviNahiteviBakiLeft;
    const sarkariPending = fullData.reduce(
      (sum, item) => sum + parseFloat(item.sarkari || 0),
      0
    );
    const sarkariTotal = sarkariPending;
    const khetiSivayPending = fullData.reduce(
      (sum, item) => sum + parseFloat(item.sivay || 0),
      0
    );
    const khetiSivayTotal = khetiSivayPending;
    const rotating = fullData.reduce(
      (sum, item) => sum + parseFloat(item.rotating || 0),
      0
    );
    const rotatingTotal = rotating;
    const kulAkndarManganuLeft = mulatviNahiteviBakiLeft;

    const kulAkandarManganuPending =
      parseFloat(sarkariPending.toFixed(2)) +
      parseFloat(khetiSivayPending.toFixed(2));
    const kulAkandarManganuRotating = rotating;

    const kulAkandarManganuTotal =
      kulAkndarManganuLeft +
      kulAkandarManganuPending +
      kulAkandarManganuRotating;

    const nivadManganuLeft = kulAkndarManganuLeft;
    const nivadManganuPending = kulAkandarManganuPending;
    const nivadManganuRotating = kulAkandarManganuRotating;
    const nivadManganuTotal =
      nivadManganuLeft + nivadManganuPending + nivadManganuRotating;

    const totalChallanLeft = challanData.reduce(
      (sum, item) => sum + parseFloat(item.left || 0),
      0
    );
    const totalChallanPending = challanData.reduce(
      (sum, item) => sum + parseFloat(item.pending || 0),
      0
    );
    const totalChallanRotating = challanData.reduce(
      (sum, item) => sum + parseFloat(item.rotating || 0),
      0
    );
    const totalChallanTotal = challanData.reduce(
      (sum, item) => sum + parseFloat(item.total || 0),
      0
    );

    const umeroGatSalnuFajalLepsSivayPending = fullData.reduce(
      (total, item) => total + parseFloat(item.fajal || 0),
      0
    );

    const kulakandarVasulatLeft = totalChallanLeft;
    const kulakandarVasulatPending =
      totalChallanPending + umeroGatSalnuFajalLepsSivayPending;
    const kulakandarVasulatRotating = totalChallanRotating;
    const kulakandarVasulatTotal =
      kulakandarVasulatLeft +
      kulakandarVasulatPending +
      kulakandarVasulatRotating;

    const badAvtiSaleMajreApvaPatrFajalPennding = fullData.reduce(
      (total, item) => total + parseFloat(item.collumnFifteen || 0),
      0
    );

    const badAvtiSaleMajreApvaPatrFajalTotal =
      badAvtiSaleMajreApvaPatrFajalPennding;

    const kulFajalPending = badAvtiSaleMajreApvaPatrFajalPennding;

    const kulFajalTotal = kulFajalPending;

    let nivadvasulatLeft = kulakandarVasulatLeft - 0;
    let nivadvasulatPending =
      parseFloat(kulakandarVasulatPending.toFixed(2)) -
      parseFloat(kulFajalPending.toFixed(2));
    let nivadvasulatRotating = kulakandarVasulatRotating - 0;
    let nivadvasulatTotal =
      nivadvasulatLeft + nivadvasulatPending + nivadvasulatRotating;

    let herFerLeft = 0;
    let herFerPending = 0;
    let herFerRotating = 0;
    let herFerTotal = 0;
    let isHerFerBaadKulAkandarVasulat = false;

    let herFerBaadKulAkandarVasulatLeft = 0;
    let herFerBaadKulAkandarVasulatPending = 0;
    let herFerBaadKulAkandarVasulatRotating = 0;
    let herFerBaadKulAkandarVasulatTotal = 0;

    if (nivadvasulatLeft < 0 && nivadvasulatPending > 0) {
      isHerFerBaadKulAkandarVasulat = true;

      herFerLeft = -nivadvasulatLeft;
      herFerPending = nivadvasulatLeft;
      herFerRotating = 0;
      herFerTotal = herFerLeft + herFerPending + herFerRotating;

      herFerBaadKulAkandarVasulatLeft = kulakandarVasulatLeft + herFerLeft;
      herFerBaadKulAkandarVasulatPending =
        kulakandarVasulatPending + herFerPending;
      herFerBaadKulAkandarVasulatRotating =
        kulakandarVasulatRotating + herFerRotating;
      herFerBaadKulAkandarVasulatTotal =
        herFerBaadKulAkandarVasulatLeft +
        herFerBaadKulAkandarVasulatPending +
        herFerBaadKulAkandarVasulatRotating;

      nivadvasulatLeft = herFerBaadKulAkandarVasulatLeft - 0;
      nivadvasulatPending =
        herFerBaadKulAkandarVasulatPending - kulFajalPending;
      nivadvasulatRotating = herFerBaadKulAkandarVasulatRotating - 0;
      nivadvasulatTotal =
        nivadvasulatLeft + nivadvasulatPending + nivadvasulatRotating;
    } else if (nivadvasulatLeft > 0 && nivadvasulatPending < 0) {
      isHerFerBaadKulAkandarVasulat = true;
      herFerLeft = nivadvasulatPending;
      herFerPending = -nivadvasulatPending;
      herFerRotating = 0;
      herFerTotal = herFerLeft + herFerPending + herFerRotating;

      herFerBaadKulAkandarVasulatLeft = kulakandarVasulatLeft + herFerLeft;
      herFerBaadKulAkandarVasulatPending =
        kulakandarVasulatPending + herFerPending;
      herFerBaadKulAkandarVasulatRotating =
        kulakandarVasulatRotating + herFerRotating;
      herFerBaadKulAkandarVasulatTotal =
        herFerBaadKulAkandarVasulatLeft +
        herFerBaadKulAkandarVasulatPending +
        herFerBaadKulAkandarVasulatRotating;

      nivadvasulatLeft = herFerBaadKulAkandarVasulatLeft - 0;
      nivadvasulatPending =
        herFerBaadKulAkandarVasulatPending - kulFajalPending;
      nivadvasulatRotating = herFerBaadKulAkandarVasulatRotating - 0;
      nivadvasulatTotal =
        nivadvasulatLeft + nivadvasulatPending + nivadvasulatRotating;
    }

    let avtiSalevasulKarvaPatrabakiLeft = nivadManganuLeft - nivadvasulatLeft;
    let avtiSalevasulKarvaPatrabakiPending =
      nivadManganuPending - nivadvasulatPending;
    let avtiSalevasulKarvaPatrabakiRotating =
      nivadManganuRotating - nivadvasulatRotating;
    let avtiSalevasulKarvaPatrabakiTotal =
      avtiSalevasulKarvaPatrabakiLeft +
      avtiSalevasulKarvaPatrabakiPending +
      avtiSalevasulKarvaPatrabakiRotating;

    if (
      avtiSalevasulKarvaPatrabakiLeft < 0 &&
      avtiSalevasulKarvaPatrabakiPending > 0
    ) {
      isHerFerBaadKulAkandarVasulat = true;

      herFerLeft = avtiSalevasulKarvaPatrabakiLeft;
      herFerPending = -avtiSalevasulKarvaPatrabakiLeft;
      herFerRotating = 0;
      herFerTotal = herFerLeft + herFerPending + herFerRotating;

      herFerBaadKulAkandarVasulatLeft = kulakandarVasulatLeft + herFerLeft;
      herFerBaadKulAkandarVasulatPending =
        kulakandarVasulatPending + herFerPending;
      herFerBaadKulAkandarVasulatRotating =
        kulakandarVasulatRotating + herFerRotating;
      herFerBaadKulAkandarVasulatTotal =
        herFerBaadKulAkandarVasulatLeft +
        herFerBaadKulAkandarVasulatPending +
        herFerBaadKulAkandarVasulatRotating;

      nivadvasulatLeft = herFerBaadKulAkandarVasulatLeft - 0;
      nivadvasulatPending =
        herFerBaadKulAkandarVasulatPending - kulFajalPending;
      nivadvasulatRotating = herFerBaadKulAkandarVasulatRotating - 0;
      nivadvasulatTotal =
        nivadvasulatLeft + nivadvasulatPending + nivadvasulatRotating;

      avtiSalevasulKarvaPatrabakiLeft = nivadManganuLeft - nivadvasulatLeft;
      avtiSalevasulKarvaPatrabakiPending =
        nivadManganuPending - nivadvasulatPending;
      avtiSalevasulKarvaPatrabakiRotating =
        nivadManganuRotating - nivadvasulatRotating;
      avtiSalevasulKarvaPatrabakiTotal =
        avtiSalevasulKarvaPatrabakiLeft +
        avtiSalevasulKarvaPatrabakiPending +
        avtiSalevasulKarvaPatrabakiRotating;
    } else if (
      avtiSalevasulKarvaPatrabakiLeft > 0 &&
      avtiSalevasulKarvaPatrabakiPending < 0
    ) {
      isHerFerBaadKulAkandarVasulat = true;
      herFerLeft = -avtiSalevasulKarvaPatrabakiPending;
      herFerPending = avtiSalevasulKarvaPatrabakiPending;
      herFerRotating = 0;
      herFerTotal = herFerLeft + herFerPending + herFerRotating;

      herFerBaadKulAkandarVasulatLeft = kulakandarVasulatLeft + herFerLeft;
      herFerBaadKulAkandarVasulatPending =
        kulakandarVasulatPending + herFerPending;
      herFerBaadKulAkandarVasulatRotating =
        kulakandarVasulatRotating + herFerRotating;
      herFerBaadKulAkandarVasulatTotal =
        herFerBaadKulAkandarVasulatLeft +
        herFerBaadKulAkandarVasulatPending +
        herFerBaadKulAkandarVasulatRotating;

      nivadvasulatLeft = herFerBaadKulAkandarVasulatLeft - 0;
      nivadvasulatPending =
        herFerBaadKulAkandarVasulatPending - kulFajalPending;
      nivadvasulatRotating = herFerBaadKulAkandarVasulatRotating - 0;
      nivadvasulatTotal =
        nivadvasulatLeft + nivadvasulatPending + nivadvasulatRotating;

      avtiSalevasulKarvaPatrabakiLeft = nivadManganuLeft - nivadvasulatLeft;
      avtiSalevasulKarvaPatrabakiPending =
        nivadManganuPending - nivadvasulatPending;
      avtiSalevasulKarvaPatrabakiRotating =
        nivadManganuRotating - nivadvasulatRotating;
      avtiSalevasulKarvaPatrabakiTotal =
        avtiSalevasulKarvaPatrabakiLeft +
        avtiSalevasulKarvaPatrabakiPending +
        avtiSalevasulKarvaPatrabakiRotating;
    }

    secondWindow.document.write(`
      <!DOCTYPE html>
<html lang="gu">
<head>
  <meta charset="UTF-8">
  <title>ગામનો નમુનો નં. ૮(ક) શિક્ષણ ઉપકર લાવણી (ટાળા બાકી પત્રક) તારીજ</title>
  <style>
    body {
      font-family: "Noto Sans Gujarati", "Arial Unicode MS", "Noto Sans", sans-serif;
  
    }
    table {
      margin: auto;
      border-collapse: collapse;
      width: 100%;
    }
    th, td {
      border: 1px solid black;
      padding: 8px;
      text-align: center;
    }
    th {
    background-color: #d4d4d4ff;
    }
        .print-page {
       page-break-after: always;
  position: relative;
  min-height: 100vh; /* દરેક પેજ screen height જેટલું stretch થશે */
        }

        .page-footer {
         margin-top: 50px !important;
          display: flex;
          justify-content: space-between;
          font-size: 20px;
          padding: 10px;
        }
 @media print {
          .page-footer {
  position: absolute;   /* section અંદર absolute */
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  font-size: 18px;
  padding: 10px;
  background: #fff;
}
        }
        

        .footer-content {
          display: flex;
          justify-content: space-between;
          width: 100%;
           
        }
               .remark-section{
         font-size: 16px !important;
         margin-top: 10px ;
        }     
  </style>
</head>
<body>

  <h3 style="text-align: center;">ગામનો નમુનો નં. ૮(ક) શિક્ષણ ઉપકર લાવણી (ટાળા બાકી પત્રક) તારીજ સને ${convertEngToGujNumber(
    financialYearName
  )}<br>
  મોજે. ${villageName}, તા. ${talukaName}, જી. ${districtName}</h3>

  <table>
    <thead>
      <tr>
        <th>બાબત</th>
        <th>પાછલી બાકી</th>
        <th>ચાલુ</th>
        <th>ફરતી</th>
        <th>કુલ</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>મુલત્વી નહી તેવી બાકી</td>
        <td>${convertEngToGujNumber(mulatviNahiteviBakiLeft.toFixed(2))}</td>
        <td>${convertEngToGujNumber("0.00")}</td>
        <td>${convertEngToGujNumber("0.00")}</td>
        <td>${convertEngToGujNumber(mulatviNahiteviBakiTotal.toFixed(2))}</td>
      </tr>
      <tr>
        <td>સરકારી</td>
        <td>${convertEngToGujNumber("0.00")}</td>
        <td>${convertEngToGujNumber(sarkariPending.toFixed(2))}</td>
        <td>${convertEngToGujNumber("0.00")}</td>
        <td>${convertEngToGujNumber(sarkariTotal.toFixed(2))}</td>
      </tr>
      <tr>
        <td>ખેતી સિવાય</td>
        <td>${convertEngToGujNumber("0.00")}</td>
        <td>${convertEngToGujNumber(khetiSivayPending.toFixed(2))}</td>
        <td>${convertEngToGujNumber("0.00")}</td>
        <td>${convertEngToGujNumber(khetiSivayTotal.toFixed(2))}</td>
      </tr>
      <tr>
        <td>ફરતી</td>
        <td>${convertEngToGujNumber("0.00")}</td>
        <td>${convertEngToGujNumber("0.00")}</td>
        <td>${convertEngToGujNumber(rotating.toFixed(2))}</td>
        <td>${convertEngToGujNumber(rotatingTotal.toFixed(2))}</td>
      </tr> 
      <tr>
        <td>કુલ એકંદર માંગણું</td>
        <td>${convertEngToGujNumber(kulAkndarManganuLeft.toFixed(2))}</td>
        <td>${convertEngToGujNumber(kulAkandarManganuPending.toFixed(2))}</td>
        <td>${convertEngToGujNumber(kulAkandarManganuRotating.toFixed(2))}</td>
        <td>${convertEngToGujNumber(kulAkandarManganuTotal.toFixed(2))}</td>
      </tr>
      <tr>
        <td>નિવડ માંગણું</td>
        <td>${convertEngToGujNumber(nivadManganuLeft.toFixed(2))}</td>
        <td>${convertEngToGujNumber(nivadManganuPending.toFixed(2))}</td>
        <td>${convertEngToGujNumber(nivadManganuRotating.toFixed(2))}</td>
        <td>${convertEngToGujNumber(nivadManganuTotal.toFixed(2))}</td>
      </tr>
      <tr>
        <td>બાદ - નિવડ વસુલાત</td>
        <td><strong>${convertEngToGujNumber(
          nivadvasulatLeft.toFixed(2)
        )}</strong></td>
        <td><strong>${convertEngToGujNumber(
          nivadvasulatPending.toFixed(2)
        )}</strong></td>
        <td><strong>${convertEngToGujNumber(
          nivadvasulatRotating.toFixed(2)
        )}</strong></td>
        <td><strong>${convertEngToGujNumber(
          nivadvasulatTotal.toFixed(2)
        )}</strong></td>
      </tr>
      <tr>
        <td>આવતી સાલે વસુલ કરવા પાત્ર બાકી</td>
        <td>${convertEngToGujNumber(
          avtiSalevasulKarvaPatrabakiLeft.toFixed(2)
        )}</td>
        <td>${convertEngToGujNumber(
          avtiSalevasulKarvaPatrabakiPending.toFixed(2)
        )}</td>
        <td>${convertEngToGujNumber(
          avtiSalevasulKarvaPatrabakiRotating.toFixed(2)
        )}</td>
        <td>${convertEngToGujNumber(
          avtiSalevasulKarvaPatrabakiTotal.toFixed(2)
        )}</td>
      </tr>
    </tbody>
  </table>


  <br><br>
  <table style="margin: auto; border: none;">
    <tr style="border: none;">
      <td style="border: none;">તારીખ :  ${convertEngToGujNumber(
        getLastDateofYearRange(financialYearName)
      )}</td>
      <td style="border: none;">તલાટી કમ મંત્રી</td>
      <td style="border: none;">જુનીયર ક્લાર્ક<br>તાલુકા પંચાયત</td>
      <td style="border: none;">ના. તા. વિ. અધિકારી<br>તાલુકા પંચાયત</td>
      <td style="border: none;">તા. વિ. અધિકારી<br>તાલુકા પંચાયત</td>
    </tr>
  </table>


         ${
           remark
             ? `<div class="remark-section"><span>નોધ: ${remark}</span></div>`
             : ""
         }
  <div class="page-footer">
        <div class="footer-content">
          <span>શિવોહમ એન્ટરપ્રાઈઝ, ગાંધીનગર - ૭૦૪૧૭૧૭૩૯૫</span>
          <span>પેજ નંબર : ${convertEngToGujNumber(
            1
          )} / ${convertEngToGujNumber(1)} </span>
        </div>
      </div>

</body>
</html>
`);
    secondWindow.document.close();

    // 6. Now open second window after data load
    const thirdWindow = window.open("", "_blank", "width=1000,height=600");

    if (!thirdWindow) {
      alert("Please allow popups for summary view.");
      return;
    }

    const recordsPerPage = 10;
    const totalPages = Math.ceil(challanData.length / recordsPerPage);
    let allPagesHTML = "";

    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      const start = pageIndex * recordsPerPage;
      const end = start + recordsPerPage;
      const pageItems = challanData.slice(start, end);

      const isLastPage = pageIndex === totalPages - 1;
      const isShortLastPage = isLastPage && pageItems.length <= 6;

      let pageContent = `
    <div class="page">
      <h3> મોજે. ${villageName}, તાલુકો:${talukaName}, જિલ્લો:${districtName}</h3>
      <h4>ગામનો નમૂનો નં.૧૦ શિક્ષણ ઉપકર ચલન તારીજ સને ${convertEngToGujNumber(
        financialYearName
      )}</h4>
      <table>
        <thead>
          <tr>
            <th>ચલન નં.</th>
            <th>તારીખ</th>
            <th>પાછલી બાકી</th>
            <th>ચાલુ બાકી</th>
            <th>ફરતી</th>
            <th>કુલ</th>
          </tr>
        </thead>
        <tbody>
          ${pageItems
            .map(
              (item) => `
            <tr>
              <td>${convertEngToGujNumber(item.challanNo)}</td>
              <td>${convertEngToGujNumber(
                convertSlashesToDashes(formatToDDMMYYYY(new Date(item.date)))
              )}</td>
              <td>${convertEngToGujNumber(
                parseFloat(item.left).toFixed(2)
              )}</td>
              <td>${convertEngToGujNumber(
                parseFloat(item.pending).toFixed(2)
              )}</td>
              <td>${convertEngToGujNumber(
                parseFloat(item.rotating).toFixed(2)
              )}</td>
              <td>${convertEngToGujNumber(
                parseFloat(item.total).toFixed(2)
              )}</td>
            </tr>
          `
            )
            .join("")}
          ${
            isShortLastPage
              ? `
            <tr>
              <td colspan="2"><strong>કુલ રોકડ વસુલાત</strong></td>
              <td>${convertEngToGujNumber(totalChallanLeft.toFixed(2))}</td>
              <td>${convertEngToGujNumber(totalChallanPending.toFixed(2))}</td>
              <td>${convertEngToGujNumber(totalChallanRotating.toFixed(2))}</td>
              <td>${convertEngToGujNumber(totalChallanTotal.toFixed(2))}</td>
            </tr>
            <tr>
              <td colspan="2">ઉમેરો-ગત સાલનું ફાજલ લેપ્સ સિવાય</td>
              <td>${convertEngToGujNumber("0.00")}</td>
              <td>${convertEngToGujNumber(
                umeroGatSalnuFajalLepsSivayPending.toFixed(2)
              )}</td>
              <td>${convertEngToGujNumber("0.00")}</td>
              <td>${convertEngToGujNumber(
                umeroGatSalnuFajalLepsSivayPending.toFixed(2)
              )}</td>
            </tr>
            <tr>
              <td colspan="2">કુલ એકંદર વસુલાત</td>
              <td>${convertEngToGujNumber(
                kulakandarVasulatLeft.toFixed(2)
              )}</td>
              <td>${convertEngToGujNumber(
                kulakandarVasulatPending.toFixed(2)
              )}</td>
              <td>${convertEngToGujNumber(
                kulakandarVasulatRotating.toFixed(2)
              )}</td>
              <td>${convertEngToGujNumber(
                kulakandarVasulatTotal.toFixed(2)
              )}</td>
            </tr>
            <tr>
              <td colspan="2">હેર ફેર</td>
              <td>${convertEngToGujNumber(herFerLeft.toFixed(2))}</td>
              <td>${convertEngToGujNumber(herFerPending.toFixed(2))}</td>
              <td>${convertEngToGujNumber(herFerRotating.toFixed(2))}</td>
              <td>${convertEngToGujNumber(herFerTotal.toFixed(2))}</td>
            </tr>
            ${
              isHerFerBaadKulAkandarVasulat
                ? `
            <tr>
              <td colspan="2">હેર ફેર બાદ કુલ એકંદર વસુલાત</td>
              <td>${convertEngToGujNumber(
                herFerBaadKulAkandarVasulatLeft.toFixed(2)
              )}</td>
              <td>${convertEngToGujNumber(
                herFerBaadKulAkandarVasulatPending.toFixed(2)
              )}</td>
              <td>${convertEngToGujNumber(
                herFerBaadKulAkandarVasulatRotating.toFixed(2)
              )}</td>
              <td>${convertEngToGujNumber(
                herFerBaadKulAkandarVasulatTotal.toFixed(2)
              )}</td>
            </tr>
            `
                : ""
            }
            <tr>
              <td colspan="2">બાદ - આવતી સાલે મજરે આપવા પાત્ર ફાજલ</td>
              <td>${convertEngToGujNumber("0.00")}</td>
              <td>${convertEngToGujNumber(
                badAvtiSaleMajreApvaPatrFajalPennding.toFixed(2)
              )}</td>
              <td>${convertEngToGujNumber("0.00")}</td>
              <td>${convertEngToGujNumber(
                badAvtiSaleMajreApvaPatrFajalTotal.toFixed(2)
              )}</td>
            </tr>
            <tr>
              <td colspan="2">લેપ્સ</td>
              <td>${convertEngToGujNumber("0.00")}</td>
                <td>${convertEngToGujNumber("0.00")}</td>
                <td>${convertEngToGujNumber("0.00")}</td>
                <td>${convertEngToGujNumber("0.00")}</td>
            </tr>
            <tr>
              <td colspan="2"><strong>કુલ ફાજલ</strong></td>
              <td><strong>${convertEngToGujNumber("0.00")}</strong></td>
              <td><strong>${convertEngToGujNumber(
                kulFajalPending.toFixed(2)
              )}</strong></td>
              <td><strong>${convertEngToGujNumber("0.00")}</strong></td>
              <td><strong>${convertEngToGujNumber(
                kulFajalTotal.toFixed(2)
              )}</strong></td>
            </tr>
            <tr>
              <td colspan="2"><strong>નિવડ વસુલાત</strong></td>
              <td><strong>${convertEngToGujNumber(
                nivadvasulatLeft.toFixed(2)
              )}</strong></td>
              <td><strong>${convertEngToGujNumber(
                nivadvasulatPending.toFixed(2)
              )}</strong></td>
              <td><strong>${convertEngToGujNumber(
                nivadvasulatRotating.toFixed(2)
              )}</strong></td>
              <td><strong>${convertEngToGujNumber(
                nivadvasulatTotal.toFixed(2)
              )}</strong></td>
            </tr>
          `
              : ""
          }
        </tbody>
      </table>
        ${
          isShortLastPage && remark
            ? `<div class="remark-section"><span>નોધ: ${remark}</span></div>`
            : ""
        }
      <div class="page-footer">
        <div class="footer-content">
          <span>શિવોહમ એન્ટરપ્રાઈઝ, ગાંધીનગર - ૭૦૪૧૭૧૭૩૯૫</span>
          <span>પેજ નંબર : ${convertEngToGujNumber(pageIndex + 1)} / ${
        isShortLastPage
          ? convertEngToGujNumber(totalPages)
          : convertEngToGujNumber(totalPages + 1)
      }</span>
        </div>
      </div>
    </div>
    `;

      allPagesHTML += pageContent;

      // Add summary on new page if last page is full (≥7 challans)
      if (isLastPage && !isShortLastPage) {
        allPagesHTML += `
      <div class="page">
        <table>
          <tbody>
            <tr>
              <td colspan="2"><strong>કુલ રોકડ વસુલાત</strong></td>
              <td>${convertEngToGujNumber(totalChallanLeft.toFixed(2))}</td>
              <td>${convertEngToGujNumber(totalChallanPending.toFixed(2))}</td>
              <td>${convertEngToGujNumber(totalChallanRotating.toFixed(2))}</td>
              <td>${convertEngToGujNumber(totalChallanTotal.toFixed(2))}</td>
            </tr>
            <tr>
              <td colspan="2">ઉમેરો-ગત સાલનું ફાજલ લેપ્સ સિવાય</td>
              <td>${convertEngToGujNumber("0.00")}</td>
              <td>${convertEngToGujNumber(
                umeroGatSalnuFajalLepsSivayPending.toFixed(2)
              )}</td>
              <td>${convertEngToGujNumber("0.00")}</td>
              <td>${convertEngToGujNumber(
                umeroGatSalnuFajalLepsSivayPending.toFixed(2)
              )}</td>
            </tr>
            <tr>
              <td colspan="2">કુલ એકંદર વસુલાત</td>
              <td>${convertEngToGujNumber(
                kulakandarVasulatLeft.toFixed(2)
              )}</td>
              <td>${convertEngToGujNumber(
                kulakandarVasulatPending.toFixed(2)
              )}</td>
              <td>${convertEngToGujNumber(
                kulakandarVasulatRotating.toFixed(2)
              )}</td>
              <td>${convertEngToGujNumber(
                kulakandarVasulatTotal.toFixed(2)
              )}</td>
            </tr>
            <tr>
              <td colspan="2">હેર ફેર</td>
              <td>${convertEngToGujNumber(herFerLeft.toFixed(2))}</td>
              <td>${convertEngToGujNumber(herFerPending.toFixed(2))}</td>
              <td>${convertEngToGujNumber(herFerRotating.toFixed(2))}</td>
              <td>${convertEngToGujNumber(herFerTotal.toFixed(2))}</td>
            </tr>
            ${
              isHerFerBaadKulAkandarVasulat
                ? `
            <tr>
              <td colspan="2">હેર ફેર બાદ કુલ એકંદર વસુલાત</td>
              <td>${convertEngToGujNumber(
                herFerBaadKulAkandarVasulatLeft.toFixed(2)
              )}</td>
              <td>${convertEngToGujNumber(
                herFerBaadKulAkandarVasulatPending.toFixed(2)
              )}</td>
              <td>${convertEngToGujNumber(
                herFerBaadKulAkandarVasulatRotating.toFixed(2)
              )}</td>
              <td>${convertEngToGujNumber(
                herFerBaadKulAkandarVasulatTotal.toFixed(2)
              )}</td>
            </tr>
            `
                : ""
            }
            <tr>
              <td colspan="2">બાદ - આવતી સાલે મજરે આપવા પાત્ર ફાજલ</td>
         <td>${convertEngToGujNumber("0.00")}</td>
              <td>${convertEngToGujNumber(
                badAvtiSaleMajreApvaPatrFajalPennding.toFixed(2)
              )}</td>
         <td>${convertEngToGujNumber("0.00")}</td>
              <td>${convertEngToGujNumber(
                badAvtiSaleMajreApvaPatrFajalTotal.toFixed(2)
              )}</td>
            </tr>
            <tr>
              <td colspan="2">લેપ્સ</td>
                       <td>${convertEngToGujNumber("0.00")}</td>
                       <td>${convertEngToGujNumber("0.00")}</td>
                       <td>${convertEngToGujNumber("0.00")}</td>
                       <td>${convertEngToGujNumber("0.00")}</td>
            </tr>
            <tr>
              <td colspan="2"><strong>કુલ ફાજલ</strong></td>
              <td><strong>${convertEngToGujNumber("0.00")}</strong></td>
              <td><strong>${convertEngToGujNumber(
                kulFajalPending.toFixed(2)
              )}</strong></td>
             <td><strong>${convertEngToGujNumber("0.00")}</strong></td>
              <td><strong>${convertEngToGujNumber(
                kulFajalTotal.toFixed(2)
              )}</strong></td>
            </tr>
            <tr>
              <td colspan="2"><strong>નિવડ વસુલાત</strong></td>
              <td><strong>${convertEngToGujNumber(
                nivadvasulatLeft.toFixed(2)
              )}</strong></td>
              <td><strong>${convertEngToGujNumber(
                nivadvasulatPending.toFixed(2)
              )}</strong></td>
              <td><strong>${convertEngToGujNumber(
                nivadvasulatRotating.toFixed(2)
              )}</strong></td>
              <td><strong>${convertEngToGujNumber(
                nivadvasulatTotal.toFixed(2)
              )}</strong></td>
            </tr>
          </tbody>
        </table>      
        
        ${
          remark
            ? `<div class="remark-section"><span>નોધ: ${remark}</span></div>`
            : ""
        }
        <div class="page-footer">
          <div class="footer-content">
            <span>શિવોહમ એન્ટરપ્રાઈઝ, ગાંધીનગર - ૭૦૪૧૭૧૭૩૯૫</span>
            <span>પેજ નંબર : ${convertEngToGujNumber(
              totalPages + 1
            )} / ${convertEngToGujNumber(totalPages + 1)}</span>
          </div>
        </div>
      </div>
      `;
      }
    }

    // Print to new window
    thirdWindow.document.write(`
  <!DOCTYPE html>
  <html lang="gu">
  <head>
    <meta charset="UTF-8">
    <title>ગામનો નમૂનો નં.૧૦ શિક્ષણ ઉપકર ચલન તારીજ</title>
  <style>
  body {
    font-family: "Noto Sans Gujarati", "Arial Unicode MS", "Noto Sans", sans-serif;
    margin: 0;
  }

  .page {
    page-break-after: always;
    position: relative;
    min-height: 98vh; /* દરેક પેજ screen height જેટલું stretch થશે */
  }

  .page:last-child {
    page-break-after: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }

  th, td {
    border: 1px solid black;
    padding: 6px;
    text-align: center;
  }

  th {
    background-color: #d4d4d4ff;
  }

  h3, h4 {
    text-align: center;
    margin: 5px 0;
  }

  .page-footer {
    margin-top: 50px !important;
    display: flex;
    justify-content: space-between;
    font-size: 18px;
    padding: 10px;
  }

  .footer-content {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }

  .remark-section {
    font-size: 16px !important;
    margin-top: 10px;
  }

  /* Print-specific overrides */
  @media print {
    .page-footer {
      position: absolute; /* section અંદર absolute */
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      justify-content: space-between;
      font-size: 18px;
      padding: 10px;
      background: #fff;
    }
  }


  </style>
  </head>
  <body>
    ${allPagesHTML}
  </body>
  </html>
  `);

    thirdWindow.document.close();
  };

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={4}>
        <HStack>
          <CustomButton onClick={handlePrint} colorScheme="teal">
            Print
          </CustomButton>
          {user?.role.permissions.includes("REPORTS_REMARK_UPDATE") && (
            <CustomButton onClick={onOpen} colorScheme="teal">
              Remark
            </CustomButton>
          )}
        </HStack>
        <Flex align="center" gap={3}>
          <Text fontWeight="medium">Total Records: {totalDocs}</Text>
          <Select
            value={limit}
            onChange={handleLimitChange}
            w="100px"
            size="sm"
          >
            {[10, 25, 50, 100, 100000].map((opt) => (
              <option key={opt} value={opt}>
                {opt === 100000 ? "All" : opt}
              </option>
            ))}
          </Select>
        </Flex>
      </Flex>
      <Box overflowX="auto" ref={printRef}>
        <TableContainer>
          <Table variant="unstyled" size="sm">
            <Thead>
              <Tr>
                <Th
                  colSpan={2}
                  textAlign="center"
                  border={"1px solid black"}
                ></Th>
                <Th colSpan={5} textAlign="center" border={"1px solid black"}>
                  સંયુક્ત એકંદર માંગણું
                </Th>
                <Th colSpan={6} textAlign="center" border={"1px solid black"}>
                  વસુલાત
                </Th>
                <Th
                  colSpan={4}
                  textAlign="center"
                  border={"1px solid black"}
                ></Th>
              </Tr>

              <Tr>
                {/* <Th rowSpan={5} textAlign="center" border={"1px solid black"}>
                          ક્રમાંક
                        </Th> */}
                <Th rowSpan={2} textAlign="center" border={"1px solid black"}>
                  ખાતા નંબર
                </Th>
                <Th rowSpan={2} textAlign="center" border={"1px solid black"}>
                  નામ
                </Th>
                <Th rowSpan={2} textAlign="center" border={"1px solid black"}>
                  પાછલી બાકી
                </Th>
                <Th colSpan={3} textAlign="center" border={"1px solid black"}>
                  ચાલુ બાકી
                </Th>
                <Th rowSpan={2} textAlign="center" border={"1px solid black"}>
                  કુલ એકંદર માંગણું
                </Th>
                <Th rowSpan={2} textAlign="center" border={"1px solid black"}>
                  પહોંચ નં.
                </Th>
                <Th rowSpan={2} textAlign="center" border={"1px solid black"}>
                  તારીખ
                </Th>
                <Th rowSpan={2} textAlign="center" border={"1px solid black"}>
                  પાછલી
                </Th>
                <Th rowSpan={2} textAlign="center" border={"1px solid black"}>
                  ચાલુ
                </Th>
                <Th rowSpan={2} textAlign="center" border={"1px solid black"}>
                  ફરતી
                </Th>
                <Th rowSpan={2} textAlign="center" border={"1px solid black"}>
                  ગત સાલનું ફાજલ
                </Th>
                <Th rowSpan={2} textAlign="center" border={"1px solid black"}>
                  કુલ વસુલાત થયેલ રકમ
                </Th>
                <Th rowSpan={2} textAlign="center" border={"1px solid black"}>
                  બિનહુકમ
                </Th>
                <Th rowSpan={2} textAlign="center" border={"1px solid black"}>
                  જાહેર વસુલ
                </Th>
                <Th rowSpan={2} textAlign="center" border={"1px solid black"}>
                  શેરો
                </Th>
              </Tr>

              <Tr>
                <Th border={"1px solid black"} textAlign="center">
                  સરકારી
                </Th>
                <Th border={"1px solid black"} textAlign="center">
                  ખેતી સિવાય
                </Th>
                <Th border={"1px solid black"} textAlign="center">
                  ફરતી
                </Th>
              </Tr>

              <Tr>
                {[...Array(17)].map((_, i) => (
                  <Th
                    key={i}
                    border={"1px solid black"}
                    textAlign="center"
                    fontSize="xs"
                  >
                    {convertEngToGujNumber(i + 1)}
                  </Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {/* Sample Row */}

              {data?.map((item, index) => (
                <Tr key={index}>
                  {/* <Td border={"1px solid black"}>{index + 1}</Td> */}
                  <Td border={"1px solid black"}>
                    {convertEngToGujNumber(item.accountNo)}
                  </Td>
                  <Td border={"1px solid black"}>{item.name}</Td>
                  <Td border={"1px solid black"} textAlign={"right"}>
                    {convertEngToGujNumber(
                      parseFloat(item.maangnuLeft || 0).toFixed(2)
                    )}
                  </Td>
                  <Td border={"1px solid black"} textAlign={"right"}>
                    {convertEngToGujNumber(
                      parseFloat(item.sarkari || 0).toFixed(2)
                    )}
                  </Td>
                  <Td border={"1px solid black"} textAlign={"right"}>
                    {convertEngToGujNumber(
                      parseFloat(item.sivay || 0).toFixed(2)
                    )}
                  </Td>
                  <Td border={"1px solid black"} textAlign={"right"}>
                    {convertEngToGujNumber(parseFloat(item.maangnuRotating))}
                  </Td>
                  <Td border={"1px solid black"} textAlign={"right"}>
                    {convertEngToGujNumber(
                      (
                        parseFloat(item.maangnuLeft) +
                        parseFloat(item.sarkari) +
                        parseFloat(item.sivay) +
                        parseFloat(item.maangnuRotating)
                      ).toFixed(2)
                    )}
                  </Td>
                  <Td border={"1px solid black"} textAlign={"right"}>
                    {convertEngToGujNumber(item.billNo || "")}
                  </Td>
                  <Td border={"1px solid black"} textAlign={"right"}>
                    {item.billDate
                      ? convertEngToGujNumber(
                          convertSlashesToDashes(
                            formatToDDMMYYYY(new Date(item.billDate))
                          )
                        )
                      : ""}
                  </Td>
                  <Td border={"1px solid black"} textAlign={"right"}>
                    {convertEngToGujNumber(
                      parseFloat(item.left || 0).toFixed(2)
                    )}
                  </Td>
                  <Td border={"1px solid black"} textAlign={"right"}>
                    {convertEngToGujNumber(
                      parseFloat(item.pending || 0).toFixed(2)
                    )}
                  </Td>
                  <Td border={"1px solid black"} textAlign={"right"}>
                    {convertEngToGujNumber(
                      parseFloat(item.rotating || 0).toFixed(2)
                    )}
                  </Td>
                  <Td border={"1px solid black"} textAlign={"right"}>
                    {convertEngToGujNumber(
                      parseFloat(item.fajal || 0).toFixed(2)
                    )}
                  </Td>
                  <Td border={"1px solid black"} textAlign={"right"}>
                    {convertEngToGujNumber(
                      (
                        parseFloat(item.left || 0) +
                        parseFloat(item.pending || 0) +
                        parseFloat(item.fajal || 0) +
                        parseFloat(item.rotating || 0)
                      ).toFixed(2)
                    )}
                  </Td>
                  <Td border={"1px solid black"} textAlign={"right"}>
                    {/* {(() => {
                      const totalCalculated =
                        parseFloat(item.left || 0) +
                        parseFloat(item.pending || 0) +
                        parseFloat(item.rotating || 0);
                      const totalCalc =
                        parseFloat(item.maangnuLeft || 0) +
                        parseFloat(item.sarkari || 0) +
                        parseFloat(item.sivay || 0) +
                        parseFloat(item.rotating || 0);
                      return totalCalculated < totalCalc
                        ? (totalCalc - totalCalculated).toFixed(2)
                        : 0;
                    })()} */}
                    {convertEngToGujNumber(
                      (item.collumnFourteen || 0).toFixed(2)
                    )}
                  </Td>
                  <Td border={"1px solid black"} textAlign={"right"}>
                    {/* {(() => {
                      const totalCalculated =
                        parseFloat(item.left || 0) +
                        parseFloat(item.pending || 0) +
                        parseFloat(item.rotating || 0);
                      const totalCalc =
                        parseFloat(item.maangnuLeft || 0) +
                        parseFloat(item.sarkari || 0) +
                        parseFloat(item.sivay || 0) +
                        parseFloat(item.rotating || 0);
                      return totalCalculated > totalCalc
                        ? (totalCalculated - totalCalc).toFixed(2)
                        : 0;
                    })()} */}
                    {convertEngToGujNumber(
                      (item.collumnFifteen || 0).toFixed(2)
                    )}
                  </Td>
                  <Td border={"1px solid black"} textAlign={"right"}></Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>

      <Flex justify="center" mt={4} gap={2}>
        <Button
          size="sm"
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          isDisabled={page === 1}
        >
          Prev
        </Button>
        <Text fontWeight="medium" alignSelf="center">
          Page {page} of {lastPage}
        </Text>
        <Button
          size="sm"
          onClick={() => setPage((prev) => Math.min(prev + 1, lastPage))}
          isDisabled={page === lastPage}
        >
          Next
        </Button>
      </Flex>
      {isOpen && (
        <ReportsRemarksModal
          isOpen={isOpen}
          onClose={() => {
            onClose();
          }}
          type={"Education"}
        />
      )}
    </Box>
  );
};

export default EducationReportTable;
