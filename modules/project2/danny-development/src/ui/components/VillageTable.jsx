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
  Select,
  Text,
  Flex,
  Button,
  HStack,
  useDisclosure,
} from "@chakra-ui/react";
import { CustomButton } from "component-library-iboon";
import { useVillage } from "../../ports/context/VillageContext";
import { getLandReport } from "../../adapters/ReportApiAdapter";
import { useFinancialYear } from "../../ports/context/FinancialYearContext";
import { fetchChallansPage } from "../../adapters/ChallanApiAdapter";
import { formatToDDMMYYYY } from "dtf_package";
import { t } from "i18next";
import { convertEngToGujNumber } from "../../utils/convertEngToGujNumber";
import {
  convertSlashesToDashes,
  getLastDateofYearRange,
} from "../../utils/dateFunction";
import { style } from "framer-motion/client";
import ReportsRemarksModal from "./ReportsRemarksModal";
import { fetchReportsRemarkPage } from "../../adapters/ReportsRemarkApiAdepter";
import { useUser } from "../../ports/context/UserContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const VillageTable = ({
  data,
  page,
  setPage,
  limit,
  setLimit,
  totalDocs,
  lastPage,
}) => {
  const { villageName, village, districtName, talukaName } = useVillage();
  const { user } = useUser();
  const { financialYear, financialYearName } = useFinancialYear();
  const printRef = useRef();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1); // reset page when limit changes
  };

  const handlePrint = async () => {
    let isLocal = false;

    if (["માણસા", "વિજાપુર"].includes(talukaName?.trim())) {
      isLocal = true;
    }

    // 1. Open the print window immediately to avoid popup blocking
    const printWindow = window.open("", "_blank", "width=1500,height=800");

    if (!printWindow) {
      alert("Please allow popups for this site to open the report.");
      return;
    }

    // 2. Show loading in print window
    printWindow.document.write(`
    <html><head><title>ગામનો નમુનો નં. ૧૧ જમીન મહેસુલ ટાળા પત્રક</title></head>
    <body>લોડ થઈ રહ્યું છે... કૃપા કરીને રાહ જુઓ.</body></html>
  `);
    printWindow.document.close();

    // 3. Fetch data
    let fullData = [];
    let challanData = [];
    let remark = "";
    try {
      const response = await getLandReport(
        1,
        totalDocs,
        village,
        financialYear
      );
      fullData = response?.data?.data || [];

      const challanResponse = await fetchChallansPage(1, 10000, "", "", {
        type: "Land",
        village,
        financialYear,
      });

      challanData = challanResponse?.data?.data || [];
      const filter = {
        financialYear,
        village,
        type: "Land",
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
    } catch (err) {
      printWindow.document.body.innerHTML = "<p>ડેટા લાવતી વખતે ભૂલ આવી.</p>";
      return;
    }
    // 🪔 Helper: Convert long Gujarati names into multi-line text
    function wrapGujaratiName(name) {
      if (!name) return "";
      name = name.trim();

      // Split by whitespace
      const words = name.split(/\s+/);

      // If name has no spaces and is too long → break by characters
      if (words.length === 1 && words[0].length > 16) {
        const chunks = [];
        for (let i = 0; i < words[0].length; i += 8) {
          chunks.push(words[0].slice(i, i + 8));
        }
        return chunks.join("<br/>");
      }

      // Otherwise, wrap every 4 words
      const wrapped = [];
      for (let i = 0; i < words.length; i += 4) {
        wrapped.push(words.slice(i, i + 4).join(" "));
      }
      return wrapped.join("<br/>");
    }

    // 🧮 Count how many lines this name will take
    function getLineCount(name) {
      if (!name) return 1;
      return wrapGujaratiName(name).split("<br/>").length;
    }

    // 🧾 Build paginated chunks based on name line count
    const rowsPerPage = 18;
    const paginatedChunks = [];
    let currentChunk = [];
    let currentLineCount = 0;

    for (const item of fullData) {
      const lines = getLineCount(item.name);
      if (currentLineCount + lines > rowsPerPage) {
        paginatedChunks.push(currentChunk);
        currentChunk = [];
        currentLineCount = 0;
      }
      currentChunk.push(item);
      currentLineCount += lines;
    }
    if (currentChunk.length > 0) paginatedChunks.push(currentChunk);

    // 🧱 Build full HTML for all pages
    let pagesHtml = "";

    paginatedChunks.forEach((chunk, pageIndex) => {
      const rowsHtml = chunk
        .map((item) => {
          const wrappedName = wrapGujaratiName(item.name);

          return `
      <tr>
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber(item.accountNo || "")}
        </td>
        <td style="text-align: left; width:700px; max-width: 700px;  white-space: nowrap;">
          ${wrappedName}
        </td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber("0.00")}
        </td>
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber("0.00")}
        </td>
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber(parseFloat(item.left).toFixed(2) || "0.00")}
        </td>
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber("0.00")}
        </td>
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber(
            parseFloat(item.sarkari || 0).toFixed(2) || "0.00"
          )}
        </td>
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber("0.00")}
        </td>
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber(
            parseFloat(item.sivay || 0).toFixed(2) || "0.00"
          )}
        </td>
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber(
            parseFloat(item?.local || 0).toFixed(2) || "0.00"
          )}
        </td>
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber("0.00")}
        </td>
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber(
            parseFloat(item.rotating).toFixed(2) || "0.00"
          )}
        </td>
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber(
            parseFloat(item.collumnSevenTeen).toFixed(2) || "0.00"
          )}
        </td>
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber(
            parseFloat(item.sarkari || 0).toFixed(2) || "0.00"
          )}
        </td>
        <td></td>
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber(parseFloat(item.total).toFixed(2) || "0.00")}
        </td>
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber(
            parseFloat(item.collumnTwentyOne).toFixed(2) || "0.00"
          )}
        </td>
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber(
            Math.abs(item.collumnTwentyTwo ?? 0).toFixed(2)
          )}
        </td>
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber("0.00")}
        </td>
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber("0.00")}
        </td>
      </tr>
    `;
        })
        .join("");

      pagesHtml += `
    <section class="print-page">
      <table>
        <thead>
        <tr>
          <th colspan="24" style="font-size:20px;" class="text-center">
           મોજે. ${villageName}, તા. ${talukaName}, જી. ${districtName}
          </th>
        </tr>
        <tr>
          <th colspan="24" style="font-size:20px; font-weight:bold;" class="text-center">
            ગામનો નમુનો નં. ૧૧ જમીન મહેસુલ ટાળા પત્રક ${convertEngToGujNumber(
              financialYearName
            )}
          </th>
        </tr>
        <!-- Full Gujarati table header -->
        <tr>
          <th rowspan="5" style="writing-mode: vertical-rl; transform: rotate(180deg);">ખાતા નંબર</th>
          <th rowspan="5">નામ</th>
          <th colspan="3">ક્ષેત્રફળ</th>
          <th rowspan="5" style="writing-mode: vertical-rl; transform: rotate(180deg);">ઇનામી જમીનનું ક્ષેત્રફળ</th>
          <th colspan="10">સંયુક્ત મહેસુલ</th>
          <th rowspan="5">એકંદર માંગણું</th>
          <th rowspan="5">છૂટ અગર માંડી વાળેલી રકમ</th>
          <th rowspan="5" style="writing-mode: vertical-rl; transform: rotate(180deg);">મુલત્વીની</th>
          <th rowspan="5">વસુલ</th>
          <th rowspan="5">મુલત્વીની નહીં હોય તેવી બાકી</th>
          <th rowspan="5">જાદે અગર પછીના વરસનું વસુલ</th>
          <th rowspan="5" style="writing-mode: vertical-rl; transform: rotate(180deg);">હપ્તો</th>
          <th rowspan="5" style="writing-mode: vertical-rl; transform: rotate(180deg);">શેરો</th>
        </tr>
        <tr>
          <th rowspan="4" style="writing-mode: vertical-rl; transform: rotate(180deg);">સરકારી રકમ</th>
          <th rowspan="4" style="writing-mode: vertical-rl; transform: rotate(180deg);">ઈનામી</th>
          <th rowspan="4" style="writing-mode: vertical-rl; transform: rotate(180deg);">બિન સરકારી</th>
          <th colspan="4">પાછલી</th>
          <th colspan="6">ચાલુ</th>
        </tr>
        <tr>
          <th colspan="2">મુલત્વીની</th>
          <th colspan="2">મુલત્વીની</th>
          <th colspan="4">કાયમી</th>
          <th rowspan="3" style="writing-mode: vertical-rl; transform: rotate(180deg);">પરચુરણ ઉપજ</th>
          <th rowspan="3">ફરતી</th>
        </tr>
        <tr>
          <th>૬ અ</th>
          <th>૬ બ</th>
          <th>૨૦.૦૦</th>
          <th rowspan="2">બીજા વર્ષ</th>
          <th rowspan="2"><div style="transform: rotate(315deg);">સરકારી</div></th>
          <th rowspan="2" style="writing-mode: vertical-rl; transform: rotate(180deg);">ઇનામી</th>
          <th rowspan="2">ખેતી સિવાય</th>
          <th rowspan="2">લોકલ ફંડ</th>
        </tr>
        <tr>
          <th>૭ અ</th>
          <th>૭ બ</th>
          <th>૨૦.૦૦</th>
        </tr>
        <tr>
          ${[...Array(24)]
            .map((_, i) => `<th>${convertEngToGujNumber(i + 1)}</th>`)
            .join("")}
        </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>

      ${
        pageIndex === paginatedChunks.length - 1 && remark
          ? `<div class="remark-section"><span>નોધ: ${remark}</span></div>`
          : ""
      }

      <div class="page-footer">
        <div class="footer-content">
          <span>શિવોહમ એન્ટરપ્રાઈઝ, ગાંધીનગર - ૭૦૪૧૭૧૭૩૯૫</span>
          <span>પેજ નંબર : ${convertEngToGujNumber(
            pageIndex + 1
          )} / ${convertEngToGujNumber(paginatedChunks.length)}</span>
        </div>
      </div>
    </section>
  `;
    });

    // 🖨️ Final output to print window
    printWindow.document.open();
    printWindow.document.write(`
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>ગામનો નમુનો નં. ૧૧ જમીન મહેસુલ ટાળા પત્રક</title>
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
          font-size: 12px;
          text-align: center;
          width: 100px;
        }
        th {
          background-color: #d4d4d4ff;
        }
        .remark-section {
          font-size: 12px !important;
          margin-top: 10px;
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
          font-size: 12px;
        }
        @media print {
          .page-footer {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            background: #fff;
          }
        }
        .footer-content {
          display: flex;
          justify-content: space-between;
          width: 100%;
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

    const reportLeftTotal = fullData.reduce(
      (sum, item) => sum + parseFloat(item.left || 0),
      0
    );
    const reportpendingTotal = 0.0;
    const reportrotatingTotal = 0.0;

    const reportLeftSarkariTotal = 0.0;
    const reportPendingSarkariTotal = fullData.reduce(
      (sum, item) => sum + parseFloat(item.sarkari || 0),
      0
    );
    const reportRotatingSarkariTotal = 0.0;

    const reportKhetiSivayLeftTotal = 0.0;
    const reportKhetiSivayPendingTotal = fullData.reduce(
      (sum, item) => sum + parseFloat(item.sivay || 0),
      0
    );
    const reportKhetiSivayRotatingTotal = 0.0;

    const reportRotetingtotal = fullData.reduce(
      (sum, item) => sum + parseFloat(item.rotating || 0),
      0
    );

    const reportLocalLeft = 0.0;
    const reportLocalPending = fullData.reduce(
      (sum, item) => sum + parseFloat(item.local || 0),
      0
    );

    const reportlocalRotating = 0.0;

    const kulEkandarManganuLeft =
      reportLeftTotal + reportLeftSarkariTotal + reportKhetiSivayLeftTotal;
    const kulEkandarManganuPending =
      reportpendingTotal +
      reportPendingSarkariTotal +
      reportKhetiSivayPendingTotal +
      reportLocalPending;
    const kulEkandarManganuRotating =
      reportrotatingTotal +
      reportRotatingSarkariTotal +
      reportKhetiSivayRotatingTotal +
      reportRotetingtotal;
    const kulEkandarManganuTotal =
      kulEkandarManganuLeft +
      kulEkandarManganuPending +
      kulEkandarManganuRotating;

    const badChhutSarkariChaluTotal = fullData.reduce(
      (sum, item) => sum + parseFloat(item.sarkari || 0),
      0
    );

    const nivadManganuPachalibaki = kulEkandarManganuLeft;
    const nivadManganuChalu =
      kulEkandarManganuPending - badChhutSarkariChaluTotal;
    const nivadManganuRotating = kulEkandarManganuRotating;
    const nivadManganuTotal =
      nivadManganuPachalibaki + nivadManganuChalu + nivadManganuRotating;

    //user both table
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

    const umeroGatSalnuFajalLepsSivayPending = fullData.reduce((sum, item) => {
      const fajal = parseFloat(item.fajal) || 0;
      return sum + fajal;
    }, 0);

    const kulAkandarVasulatLeft = totalChallanLeft;
    const kulAkandarVasulatPending =
      totalChallanPending + umeroGatSalnuFajalLepsSivayPending;
    const kulAkandarVasulatRotating = totalChallanRotating;
    const kulAkandarVasulatTotal =
      kulAkandarVasulatLeft +
      kulAkandarVasulatPending +
      kulAkandarVasulatRotating;

    const badAvatiSaleMajreApvaPatrFajal = fullData.reduce((sum, item) => {
      return sum + item.collumnTwentyTwo;
    }, 0);

    let nivadvasulatLeft = kulAkandarVasulatLeft - 0;
    let nivadvasulatPending =
      kulAkandarVasulatPending - badAvatiSaleMajreApvaPatrFajal;
    let nivadvasulatRotating = kulAkandarVasulatRotating - 0;
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

      herFerBaadKulAkandarVasulatLeft = kulAkandarVasulatLeft + herFerLeft;
      herFerBaadKulAkandarVasulatPending =
        kulAkandarVasulatPending + herFerPending;
      herFerBaadKulAkandarVasulatRotating =
        kulAkandarVasulatRotating + herFerRotating;
      herFerBaadKulAkandarVasulatTotal =
        herFerBaadKulAkandarVasulatLeft +
        herFerBaadKulAkandarVasulatPending +
        herFerBaadKulAkandarVasulatRotating;

      nivadvasulatLeft = herFerBaadKulAkandarVasulatLeft - 0;
      nivadvasulatPending =
        herFerBaadKulAkandarVasulatPending - badAvatiSaleMajreApvaPatrFajal;
      nivadvasulatRotating = herFerBaadKulAkandarVasulatRotating - 0;
      nivadvasulatTotal =
        nivadvasulatLeft + nivadvasulatPending + nivadvasulatRotating;
    } else if (nivadvasulatLeft > 0 && nivadvasulatPending < 0) {
      isHerFerBaadKulAkandarVasulat = true;
      herFerLeft = nivadvasulatPending;
      herFerPending = -nivadvasulatPending;
      herFerRotating = 0;
      herFerTotal = herFerLeft + herFerPending + herFerRotating;

      herFerBaadKulAkandarVasulatLeft = kulAkandarVasulatLeft + herFerLeft;
      herFerBaadKulAkandarVasulatPending =
        kulAkandarVasulatPending + herFerPending;
      herFerBaadKulAkandarVasulatRotating =
        kulAkandarVasulatRotating + herFerRotating;
      herFerBaadKulAkandarVasulatTotal =
        herFerBaadKulAkandarVasulatLeft +
        herFerBaadKulAkandarVasulatPending +
        herFerBaadKulAkandarVasulatRotating;

      nivadvasulatLeft = herFerBaadKulAkandarVasulatLeft - 0;
      nivadvasulatPending =
        herFerBaadKulAkandarVasulatPending - badAvatiSaleMajreApvaPatrFajal;
      nivadvasulatRotating = herFerBaadKulAkandarVasulatRotating - 0;
      nivadvasulatTotal =
        nivadvasulatLeft + nivadvasulatPending + nivadvasulatRotating;
    }

    let secondWindowLastRowLeft = nivadManganuPachalibaki - nivadvasulatLeft;
    let secondWindowLastRowPending = nivadManganuChalu - nivadvasulatPending;
    let secondWindowLastRowRotating =
      nivadManganuRotating - nivadManganuRotating;
    let secondWindowLastRowTotal =
      secondWindowLastRowLeft +
      secondWindowLastRowPending +
      secondWindowLastRowRotating;

    if (secondWindowLastRowLeft < 0 && secondWindowLastRowPending > 0) {
      isHerFerBaadKulAkandarVasulat = true;

      herFerLeft = secondWindowLastRowLeft;
      herFerPending = -secondWindowLastRowLeft;
      herFerRotating = 0;
      herFerTotal = herFerLeft + herFerPending + herFerRotating;

      herFerBaadKulAkandarVasulatLeft = kulAkandarVasulatLeft + herFerLeft;
      herFerBaadKulAkandarVasulatPending =
        kulAkandarVasulatPending + herFerPending;
      herFerBaadKulAkandarVasulatRotating =
        kulAkandarVasulatRotating + herFerRotating;
      herFerBaadKulAkandarVasulatTotal =
        herFerBaadKulAkandarVasulatLeft +
        herFerBaadKulAkandarVasulatPending +
        herFerBaadKulAkandarVasulatRotating;

      nivadvasulatLeft = herFerBaadKulAkandarVasulatLeft - 0;
      nivadvasulatPending =
        herFerBaadKulAkandarVasulatPending - badAvatiSaleMajreApvaPatrFajal;
      nivadvasulatRotating = herFerBaadKulAkandarVasulatRotating - 0;
      nivadvasulatTotal =
        nivadvasulatLeft + nivadvasulatPending + nivadvasulatRotating;

      secondWindowLastRowLeft = nivadManganuPachalibaki - nivadvasulatLeft;
      secondWindowLastRowPending = nivadManganuChalu - nivadvasulatPending;
      secondWindowLastRowRotating = nivadManganuRotating - nivadManganuRotating;
      secondWindowLastRowTotal =
        secondWindowLastRowLeft +
        secondWindowLastRowPending +
        secondWindowLastRowRotating;
    } else if (secondWindowLastRowLeft > 0 && secondWindowLastRowPending < 0) {
      isHerFerBaadKulAkandarVasulat = true;
      herFerLeft = -secondWindowLastRowPending;
      herFerPending = secondWindowLastRowPending;
      herFerRotating = 0;
      herFerTotal = herFerLeft + herFerPending + herFerRotating;

      herFerBaadKulAkandarVasulatLeft = kulAkandarVasulatLeft + herFerLeft;
      herFerBaadKulAkandarVasulatPending =
        kulAkandarVasulatPending + herFerPending;
      herFerBaadKulAkandarVasulatRotating =
        kulAkandarVasulatRotating + herFerRotating;
      herFerBaadKulAkandarVasulatTotal =
        herFerBaadKulAkandarVasulatLeft +
        herFerBaadKulAkandarVasulatPending +
        herFerBaadKulAkandarVasulatRotating;

      nivadvasulatLeft = herFerBaadKulAkandarVasulatLeft - 0;
      nivadvasulatPending =
        herFerBaadKulAkandarVasulatPending - badAvatiSaleMajreApvaPatrFajal;
      nivadvasulatRotating = herFerBaadKulAkandarVasulatRotating - 0;
      nivadvasulatTotal =
        nivadvasulatLeft + nivadvasulatPending + nivadvasulatRotating;

      secondWindowLastRowLeft = nivadManganuPachalibaki - nivadvasulatLeft;
      secondWindowLastRowPending = nivadManganuChalu - nivadvasulatPending;
      secondWindowLastRowRotating = nivadManganuRotating - nivadManganuRotating;
      secondWindowLastRowTotal =
        secondWindowLastRowLeft +
        secondWindowLastRowPending +
        secondWindowLastRowRotating;
    }

    secondWindow.document.write(`
 <!DOCTYPE html>
<html lang="gu">
<head>
  <meta charset="UTF-8">
  <title>ગામનો નમૂનો નં. ૧૧ જમીન મહેસુલ લાવણી ( ટાળા બાકી પત્રક ) તારીજ</title>
  <style>
       body {
       font-family: "Noto Sans Gujarati", "Arial Unicode MS", "Noto Sans", sans-serif;

       margin: 0;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      border: 1px solid black;
      padding: 8px;
      font-size: 14px;
      text-align: center;
    }

    th {
      background-color: #d4d4d4ff;
    }

    /* remove min-height forcing */
    .print-page {
      page-break-after: auto;  /* auto breaks only when needed */
      position: relative;
    }

    .footer {
      display: flex;
      justify-content: space-between;
      margin-top: 40px;
      padding: 0 40px;
      font-size: 16px;
    } 

    .page-footer {
      margin-top: 20px;
      display: flex;
      justify-content: space-between;
      font-size: 16px;
    }

    @media print {
      body {
        margin: 0;
      }

      .page-footer {
        position: fixed;   /* always stays at bottom of print page */
        bottom: 0;
        left: 0;
        right: 0;
        display: flex;
        justify-content: space-between;
        font-size: 16px;
        background: #fff;
        padding: 0 20px;
      }
    }

    .footer-content {
      display: flex;
      justify-content: space-between;
      width: 100%;
    }

    .remark-section{
    margin-top:10px;
     font-size: 16px;
    }

  </style>
</head>
<body>
 <section class="print-page">
  <h3 style="text-align: center;">
  ગામનો નમૂનો નં. ૧૧ જમીન મહેસુલ લાવણી ( ટાળા બાકી પત્રક ) તારીજ સને ${convertEngToGujNumber(
    financialYearName
  )}<br>
   મોજે. ${villageName}, તાલુકો: ${talukaName}, જિલ્લો: ${districtName}
  </h3>

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
        <td>${convertEngToGujNumber(reportLeftTotal.toFixed(2))}</td>
        <td>${convertEngToGujNumber(reportpendingTotal.toFixed(2))}</td>
        <td>${convertEngToGujNumber(reportrotatingTotal.toFixed(2))}</td>
        <td>${convertEngToGujNumber(
          (reportLeftTotal + reportpendingTotal + reportrotatingTotal).toFixed(
            2
          )
        )}</td>
      </tr>
      <tr>
        <td>સરકારી</td>
        <td>${convertEngToGujNumber(reportLeftSarkariTotal.toFixed(2))}</td>
        <td>${convertEngToGujNumber(reportPendingSarkariTotal.toFixed(2))}</td>
        <td>${convertEngToGujNumber(reportRotatingSarkariTotal.toFixed(2))}</td>
        <td>${convertEngToGujNumber(
          (
            reportLeftSarkariTotal +
            reportPendingSarkariTotal +
            reportRotatingSarkariTotal
          ).toFixed(2)
        )}</td>
      </tr>
      <tr>
        <td>ખેતી સિવાય</td>
        <td>${convertEngToGujNumber(reportKhetiSivayLeftTotal.toFixed(2))}</td>
        <td>${convertEngToGujNumber(
          reportKhetiSivayPendingTotal.toFixed(2)
        )}</td>
        <td>${convertEngToGujNumber(
          reportKhetiSivayRotatingTotal.toFixed(2)
        )}</td>
        <td>${convertEngToGujNumber(
          (
            reportKhetiSivayLeftTotal +
            reportKhetiSivayPendingTotal +
            reportKhetiSivayRotatingTotal
          ).toFixed(2)
        )}</td>
      </tr>
      ${
        isLocal
          ? `<tr>
        <td>લોકલ ફંડ</td>
        <td>${convertEngToGujNumber(reportLocalLeft.toFixed(2))}</td>
        <td>${convertEngToGujNumber(reportLocalPending.toFixed(2))}</td>
        <td>${convertEngToGujNumber(reportlocalRotating.toFixed(2))}</td>
        <td>${convertEngToGujNumber(
          (reportLocalLeft + reportLocalPending + reportlocalRotating).toFixed(
            2
          )
        )}</td>
      </tr> `
          : ""
      }
      <tr>
        <td>ફરતી</td>
        <td>${convertEngToGujNumber("0.00")}</td>
        <td>${convertEngToGujNumber("0.00")}</td>
        <td>${convertEngToGujNumber(reportRotetingtotal.toFixed(2))}</td>
        <td>${convertEngToGujNumber(reportRotetingtotal.toFixed(2))}</td>
      </tr>
      <tr>
        <td>કુલ એકંદર માંગણું</td>
        <td>${convertEngToGujNumber(kulEkandarManganuLeft.toFixed(2))}</td>
        <td>${convertEngToGujNumber(kulEkandarManganuPending.toFixed(2))}</td>
        <td>${convertEngToGujNumber(kulEkandarManganuRotating.toFixed(2))}</td>
        <td>${convertEngToGujNumber(kulEkandarManganuTotal.toFixed(2))}</td>
      </tr>
      <tr>
        <td>બાદ છુટ - સરકારી</td>
        <td>${convertEngToGujNumber("0.00")}</td>
        <td>${convertEngToGujNumber(badChhutSarkariChaluTotal.toFixed(2))}</td>
        <td>${convertEngToGujNumber("0.00")}</td>
        <td>${convertEngToGujNumber(badChhutSarkariChaluTotal.toFixed(2))}</td>
      </tr>
      <tr>
        <td>નિવડ માંગણું</td>
        <td>${convertEngToGujNumber(nivadManganuPachalibaki.toFixed(2))}</td>
        <td>${convertEngToGujNumber(nivadManganuChalu.toFixed(2))}</td>
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
        <td>${convertEngToGujNumber(secondWindowLastRowLeft.toFixed(2))}</td>
        <td>${convertEngToGujNumber(secondWindowLastRowPending.toFixed(2))}</td>
        <td>${convertEngToGujNumber(
          secondWindowLastRowRotating.toFixed(2)
        )}</td>
        <td>${convertEngToGujNumber(secondWindowLastRowTotal.toFixed(2))}</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <div>તારીખ: ${convertEngToGujNumber(
      getLastDateofYearRange(financialYearName)
    )}</div>
    <div>તલાટી કમ મંત્રી</div>
    <div>જુનિયર ક્લાર્ક </br> તાલુકા પંચાયત</div>
    <div>ના. તા. વિ. અધિકારી </br>
તાલુકા પંચાયત</div>
    <div>તા. વિ. અધિકારી<br>તાલુકા પંચાયત</div>
  </div>


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
 </section>

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

    const chunkArray = (arr, size) =>
      arr.reduce(
        (acc, _, i) => (i % size ? acc : [...acc, arr.slice(i, i + size)]),
        []
      );

    const chunks = chunkArray(challanData, 10);

    // Check the last chunk
    const lastChunk = chunks[chunks?.length - 1];
    const isLastChunkMergeable = lastChunk?.length <= 6;

    // ✅ Define summary rows for reuse
    const summaryRowsHtml = `
  <tr>
  <td colspan="2"><strong>કુલ રોકડ વસુલાત</strong></td>
  <td><strong>${convertEngToGujNumber(
    totalChallanLeft.toFixed(2)
  )}</strong></td>
  <td><strong>${convertEngToGujNumber(
    totalChallanPending.toFixed(2)
  )}</strong></td>
  <td><strong>${convertEngToGujNumber(
    totalChallanRotating.toFixed(2)
  )}</strong></td>
  <td><strong>${convertEngToGujNumber(
    totalChallanTotal.toFixed(2)
  )}</strong></td></tr>
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
  <td><strong>${convertEngToGujNumber(
    kulAkandarVasulatLeft.toFixed(2)
  )}</strong></td>
  <td><strong>${convertEngToGujNumber(
    kulAkandarVasulatPending.toFixed(2)
  )}</strong></td>
  <td><strong>${convertEngToGujNumber(
    kulAkandarVasulatRotating.toFixed(2)
  )}</strong></td>
  <td><strong>${convertEngToGujNumber(
    kulAkandarVasulatTotal.toFixed(2)
  )}</strong></td>
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
      ? `<tr>
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
    </tr>`
      : ""
  }
  <tr>
  <td colspan="2">બાદ - આવતી સાલે મજરે આપવા પાત્ર ફાજલ</td>
  <td>${convertEngToGujNumber("0.00")}</td>
  <td>${convertEngToGujNumber(badAvatiSaleMajreApvaPatrFajal.toFixed(2))}</td>
  <td>${convertEngToGujNumber("0.00")}</td>
  <td>${convertEngToGujNumber(badAvatiSaleMajreApvaPatrFajal.toFixed(2))}</td>
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
    badAvatiSaleMajreApvaPatrFajal.toFixed(2)
  )}</strong></td>
  <td><strong>${convertEngToGujNumber("0.00")}</strong></td>
  <td><strong>${convertEngToGujNumber(
    badAvatiSaleMajreApvaPatrFajal.toFixed(2)
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
  )}</strong></td></tr>
`;

    let pages1Html = "";

    if (chunks.length === 0) {
      // 👉 No challan data
      pages1Html = `
    <div class="page">
      <h3>મોજે. ${villageName}, તા. ${talukaName}, જી. ${districtName}</h3>
      <h4>ગામનો નમુનો નં. ૧૦ જમીન મહેસુલ ચલન તારીજ સને ${convertEngToGujNumber(
        financialYearName
      )}</h4>
      <p style="text-align:center; margin-top:30px; font-size:16px;">
        કોઈ ચલન માહિતી ઉપલબ્ધ નથી
      </p>
    </div>
  `;
    } else {
      // 👉 Normal challan table rendering
      pages1Html = chunks
        .map((chunk, index) => {
          const rows = chunk
            .map(
              (item) => `
          <tr>
            <td>${convertEngToGujNumber(item.challanNo)}</td>
            <td>${convertEngToGujNumber(
              convertSlashesToDashes(formatToDDMMYYYY(new Date(item.date)))
            )}</td>
            <td>${convertEngToGujNumber(parseFloat(item.left).toFixed(2))}</td>
            <td>${convertEngToGujNumber(
              parseFloat(item.pending).toFixed(2)
            )}</td>
            <td>${convertEngToGujNumber(
              parseFloat(item.rotating).toFixed(2)
            )}</td>
            <td>${convertEngToGujNumber(parseFloat(item.total).toFixed(2))}</td>
          </tr>`
            )
            .join("");

          const isLastPage = index === chunks.length - 1;
          const shouldMergeSummary = isLastPage && isLastChunkMergeable;

          return `
        <div class="page">
          <h3>મોજે. ${villageName}, તા. ${talukaName}, જી. ${districtName}</h3>
          <h4>ગામનો નમુનો નં. ૧૦ જમીન મહેસુલ ચલન તારીજ સને ${convertEngToGujNumber(
            financialYearName
          )}</h4>
          <table>
            <thead>
              <tr>
                <th>ચલન નં.</th>
                <th>તારીખ</th>
                <th>પાછલી બાકી</th>
                <th>ચાલુ</th>
                <th>ફરતી</th>
                <th>કુલ</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
              ${shouldMergeSummary ? summaryRowsHtml : ""}
            </tbody>
          </table>

             ${
               isLastChunkMergeable && remark
                 ? `<div class="remark-section"><span>નોધ: ${remark}</span></div>`
                 : ""
             }

          <div class="page-footer">
            <div class="footer-content">
              <span>શિવોહમ એન્ટરપ્રાઈઝ, ગાંધીનગર - ૭૦૪૧૭૧૭૩૯૫</span>
              <span>પેજ નંબર : ${convertEngToGujNumber(
                index + 1
              )} / ${convertEngToGujNumber(
            chunks.length + (isLastChunkMergeable ? 0 : 1)
          )}</span>
            </div>
          </div>
        </div>
      `;
        })
        .join("");
    }

    // ✅ Generate total summary page ONLY IF not merged
    const totalSummaryHtml = isLastChunkMergeable
      ? ""
      : `
  <div class="page">
    <table>
      <tbody>
        ${summaryRowsHtml}
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
          chunks.length + 1
        )} / ${convertEngToGujNumber(chunks.length + 1)}</span>
      </div>
    </div>
  </div>
`;

    thirdWindow.document.write(`
<!DOCTYPE html>
<html lang="gu">
<head>
  <meta charset="UTF-8">
  <title>ગામનો નમુનો નં. ૧૦ જમીન મહેસુલ ચલન તારીજ</title>
  <style>
    body {
     font-family: "Noto Sans Gujarati", "Arial Unicode MS", "Noto Sans", sans-serif;
     margin: 0px;
    }
    .page {
      page-break-after: always;
      position: relative;
      min-height: 98vh;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 16px;
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
      margin-top: 50px;
      display: flex;
      justify-content: space-between;
      padding: 10px;
    }
    .footer-content {
      display: flex;
      justify-content: space-between;
      width: 100%;
   
    }
      .remark-section{
    margin-top:10px;
     font-size: 16px;
    }
            @media print {
          .page-footer {
  position: absolute;   /* section અંદર absolute */
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
   font-size: 16px;
  background: #fff;
}
    }
   
  </style>
</head>
<body>
  ${pages1Html}
  ${totalSummaryHtml}
</body>
</html>
`);

    thirdWindow.document.close();
  };

  const createExcelFile = (fullData, challanData, remark, exportedCount, totalRecords) => {
    const reportRows = fullData.map((item) => {
      const sarkariAmt = parseFloat(item.sarkari || 0);
      const sivayAmt = parseFloat(item.sivay || 0);
      const localAmt = parseFloat(item.local || 0);
      const left = parseFloat(item.left || 0);
      const pending = parseFloat(item.pending || 0);
      const rotating = parseFloat(item.rotating || 0);
      const fajal = parseFloat(item.fajal || 0);

      return {
        "ખાતા નંબર": item.accountNo,
        "નામ": item.name,
        "ક્ષેત્રફળ": "",
        "ઇનામી જમીનનું ક્ષેત્રફળ": "",
        "સરકારી": sarkariAmt.toFixed(2),
        "ખેતી સિવાય": sivayAmt.toFixed(2),
        "લોકલ ફંડ": localAmt.toFixed(2),
        "ફરતી": rotating.toFixed(2),
        "કુલ એકંદર માંગણું": (sarkariAmt + sivayAmt + localAmt + rotating).toFixed(2),
        "પોહંચ નં.": item.billNo || "",
        "તારીખ": item.billDate
          ? convertSlashesToDashes(formatToDDMMYYYY(new Date(item.billDate)))
          : "",
        "પાછલી": left.toFixed(2),
        "ચાલુ": pending.toFixed(2),
        "ફરતી (વસુલાત)": rotating.toFixed(2),
        "ગત સાલનું ફાજલ": fajal.toFixed(2),
        "કુલ વસુલાત": (left + pending + rotating + fajal).toFixed(2),
        "બિનહુકમ": (item.collumnFourteen || 0).toFixed(2),
        "જાહેર વસુલ": (item.collumnFifteen || 0).toFixed(2),
        "શેરો": (item.collumnSixteen || 0).toFixed(2),
        "હેરફેર": (item.collumnSeventeen || 0).toFixed(2),
        "બાકી": (item.collumnEighteen || 0).toFixed(2),
        "ફાજલ": (item.collumnNineteen || 0).toFixed(2),
        "લેપ્સ": (item.collumnTwenty || 0).toFixed(2),
        "કુલ ફાજલ": (item.collumnTwentyOne || 0).toFixed(2),
        "હેરફેર બાદ કુલ ફાજલ": (item.collumnTwentyTwo || 0).toFixed(2),
      };
    });

    const challanRows = challanData.map((item) => ({
      "ચલન નં.": item.challanNo,
      "તારીખ": item.date
        ? convertSlashesToDashes(formatToDDMMYYYY(new Date(item.date)))
        : "",
      "પાછલી બાકી": parseFloat(item.left || 0).toFixed(2),
      "ચાલુ બાકી": parseFloat(item.pending || 0).toFixed(2),
      "ફરતી": parseFloat(item.rotating || 0).toFixed(2),
      "કુલ": parseFloat(item.total || 0).toFixed(2),
    }));

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

    const summaryRows = [
      { "વિવરણ": "ચલન ટોટલ પાછલી", "રકમ": totalChallanLeft.toFixed(2) },
      { "વિવરણ": "ચલન ટોટલ ચાલુ", "રકમ": totalChallanPending.toFixed(2) },
      { "વિવરણ": "ચલન ટોટલ ફરતી", "રકમ": totalChallanRotating.toFixed(2) },
      { "વિવરણ": "ચલન ટોટલ કુલ", "રકમ": totalChallanTotal.toFixed(2) },
      { "વિવરણ": "રિમાર્ક", "રકમ": remark || "" },
      exportedCount && totalRecords && exportedCount < totalRecords 
        ? { "વિવરણ": "નોટ", "રકમ": `આ પહેલાં ${exportedCount} ના રેકોર્ડ્સ મેળવવામાં આવ્યા (કુલ: ${totalRecords})` }
        : null,
    ].filter(Boolean);

    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(reportRows);
    const ws2 = XLSX.utils.json_to_sheet(summaryRows);
    const ws3 = XLSX.utils.json_to_sheet(challanRows);

    XLSX.utils.book_append_sheet(wb, ws1, "ReportData");
    XLSX.utils.book_append_sheet(wb, ws2, "Summary");
    XLSX.utils.book_append_sheet(wb, ws3, "ChallanData");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(
      blob,
      `LandRevenueReport_${villageName || "village"}_${financialYearName || "fy"}.xlsx`
    );
  };

  const handleExportExcel = async () => {
    try {
      // Limit export to 1000 records for faster performance
      const exportLimit = Math.min(totalDocs, 1000);
      const response = await getLandReport(
        1,
        exportLimit,
        village,
        financialYear
      );
      const fullData = response?.data?.data || [];

      const challanResponse = await fetchChallansPage(1, 1000, "", "", {
        type: "Land",
        village,
        financialYear,
      });
      const challanData = challanResponse?.data?.data || [];

      const filter = {
        financialYear,
        village,
        type: "Land",
      };
      const remarkResponse = await fetchReportsRemarkPage(
        1,
        1,
        "",
        "",
        filter,
        1
      );
      const remark = remarkResponse?.data?.data[0]?.remark || "";

      createExcelFile(fullData, challanData, remark, exportLimit, totalDocs);
    } catch (error) {
      console.error(error);
      alert("Excel export failed. કૃપા કરીને ફરીથી પ્રયાસ કરો.");
    }
  };

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={4}>
        <HStack>
          <CustomButton onClick={handlePrint} colorScheme="teal">
            Print
          </CustomButton>
          <CustomButton onClick={handleExportExcel} colorScheme="blue">
            Export Excel
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
        <TableContainer mx={1}>
          <Table variant="unstyled" size="sm">
            <Thead>
              <Tr>
                {/* <Th rowSpan={5} textAlign="center" border={"1px solid black"}>
                ક્રમાંક
              </Th> */}
                <Th rowSpan={5} textAlign="center" border={"1px solid black"}>
                  ખાતા નંબર
                </Th>
                <Th rowSpan={5} textAlign="center" border={"1px solid black"}>
                  નામ
                </Th>
                <Th colSpan={3} textAlign="center" border={"1px solid black"}>
                  ક્ષેત્રફળ
                </Th>
                <Th rowSpan={5} textAlign="center" border={"1px solid black"}>
                  ઇનામી જમીનનું ક્ષેત્રફળ
                </Th>
                <Th colSpan={10} textAlign="center" border={"1px solid black"}>
                  સંયુક્ત મહેસુલ
                </Th>
                <Th rowSpan={5} textAlign="center" border={"1px solid black"}>
                  એકંદર માંગણું
                </Th>
                <Th rowSpan={5} textAlign="center" border={"1px solid black"}>
                  છૂટ અગર માંડી વાળેલી રકમ
                </Th>
                <Th rowSpan={5} textAlign="center" border={"1px solid black"}>
                  મુલત્વીની
                </Th>
                <Th rowSpan={5} textAlign="center" border={"1px solid black"}>
                  વસુલ
                </Th>
                <Th rowSpan={5} textAlign="center" border={"1px solid black"}>
                  મુલત્વીની નહીં હોય તેવી બાકી
                </Th>
                <Th rowSpan={5} textAlign="center" border={"1px solid black"}>
                  જાદે અગર પછીના વરસનું વસુલ
                </Th>
                <Th rowSpan={5} textAlign="center" border={"1px solid black"}>
                  હપ્તો
                </Th>
                <Th rowSpan={5} textAlign="center" border={"1px solid black"}>
                  શેરો
                </Th>
              </Tr>
              <Tr>
                <Th rowSpan={4} border={"1px solid black"}>
                  સરકારી રકમ
                </Th>
                <Th rowSpan={4} border={"1px solid black"}>
                  ઈનામી
                </Th>
                <Th rowSpan={4} border={"1px solid black"} textAlign="center">
                  બિન સરકારી
                </Th>
                <Th colSpan={4} border={"1px solid black"}>
                  પાછલી
                </Th>
                <Th colSpan={6} border={"1px solid black"}>
                  ચાલુ
                </Th>
              </Tr>
              <Tr>
                <Th border={"1px solid black"} colSpan={2}>
                  મુલત્વીની
                </Th>
                <Th border={"1px solid black"} colSpan={2}>
                  મુલત્વીની
                </Th>
                <Th border={"1px solid black"} colSpan={4}>
                  કાયમી
                </Th>
                <Th border={"1px solid black"} rowSpan={3}>
                  પરચુરણ ઉપજ
                </Th>
                <Th border={"1px solid black"} rowSpan={3}>
                  ફરતી
                </Th>
              </Tr>
              <Tr>
                <Th border={"1px solid black"}>6 અ</Th>
                <Th border={"1px solid black"}>6 બ</Th>
                <Th border={"1px solid black"}>20.00</Th>
                <Th border={"1px solid black"} rowSpan={2}>
                  બીજા વર્ષ
                </Th>
                <Th border={"1px solid black"} rowSpan={2}>
                  સરકારી
                </Th>
                <Th border={"1px solid black"} rowSpan={2}>
                  ઇનામી
                </Th>
                <Th border={"1px solid black"} rowSpan={2}>
                  ખેતી સિવાય
                </Th>
                <Th border={"1px solid black"} rowSpan={2}>
                  લોકલ ફંડ
                </Th>
              </Tr>
              <Tr>
                <Th border={"1px solid black"}>૭ અ</Th>
                <Th border={"1px solid black"}>૭ બ</Th>
                <Th border={"1px solid black"}>20.00</Th>
              </Tr>
              <Tr>
                {[...Array(24)].map((_, i) => (
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
              {data?.map((item, index) => (
                <Tr key={index}>
                  <Td border="1px solid black">
                    {convertEngToGujNumber(item.accountNo)}
                  </Td>
                  <Td border="1px solid black">{item.name}</Td>
                  <Td border="1px solid black" textAlign="right"></Td>
                  <Td border="1px solid black" textAlign="right"></Td>
                  <Td border="1px solid black" textAlign="right"></Td>
                  <Td border="1px solid black" textAlign="right"></Td>
                  <Td border="1px solid black" textAlign="right">
                    {convertEngToGujNumber(0)}
                  </Td>
                  <Td border="1px solid black" textAlign="right">
                    {convertEngToGujNumber(0)}
                  </Td>
                  <Td border="1px solid black" textAlign="right">
                    {convertEngToGujNumber(item.left.toFixed(2))}
                  </Td>
                  <Td border="1px solid black" textAlign="right">
                    {convertEngToGujNumber(0)}
                  </Td>
                  <Td border="1px solid black" textAlign="right">
                    {convertEngToGujNumber(parseFloat(item.sarkari).toFixed(2))}
                  </Td>
                  <Td border="1px solid black" textAlign="right">
                    {convertEngToGujNumber(0)}
                  </Td>
                  <Td border="1px solid black" textAlign="right">
                    {convertEngToGujNumber(parseFloat(item.sivay).toFixed(2))}
                  </Td>
                  <Td border="1px solid black" textAlign="right">
                    {convertEngToGujNumber(
                      parseFloat(item?.local || 0).toFixed(2)
                    )}
                  </Td>
                  <Td border="1px solid black" textAlign="right">
                    {convertEngToGujNumber(0)}
                  </Td>
                  <Td border="1px solid black" textAlign="right">
                    {convertEngToGujNumber(item.rotating.toFixed(2))}
                  </Td>
                  <Td border="1px solid black" textAlign="right">
                    {/* {(
                      parseFloat(item.left || 0) +
                      parseFloat(item.sarkari || 0) +
                      parseFloat(item.sivay || 0) +
                      parseFloat(item.rotating || 0)
                    ).toFixed(2)} */}
                    {convertEngToGujNumber(
                      item.collumnSevenTeen.toFixed(2) || 0
                    )}
                  </Td>
                  <Td border="1px solid black" textAlign="right">
                    {convertEngToGujNumber(parseFloat(item.sarkari).toFixed(2))}
                  </Td>
                  <Td border="1px solid black" textAlign="right"></Td>
                  <Td border="1px solid black" textAlign="right">
                    {convertEngToGujNumber(item.total.toFixed(2))}
                  </Td>
                  <Td border="1px solid black" textAlign="right">
                    {/* {(() => {
                      const totalCalculated =
                        parseFloat(item.left || 0) +
                        parseFloat(item.sarkari || 0) +
                        parseFloat(item.sivay || 0) +
                        parseFloat(item.rotating || 0) -
                        item.sarkari;
                      return totalCalculated > (item.total || 0)
                        ? (totalCalculated - (item.total || 0)).toFixed(2)
                        : 0;
                    })()} */}{" "}
                    {convertEngToGujNumber(item.collumnTwentyOne.toFixed(2))}
                  </Td>
                  <Td border="1px solid black" textAlign="right">
                    {/* {(() => {
                      const totalCalculated =
                        parseFloat(item.left || 0) +
                        parseFloat(item.sarkari || 0) +
                        parseFloat(item.sivay || 0) +
                        parseFloat(item.rotating || 0) -
                        parseFloat(item.sarkari);
                      return totalCalculated < (item.total || 0)
                        ? ((item.total || 0) - totalCalculated).toFixed(2)
                        : 0;
                    })()} */}
                    {convertEngToGujNumber(
                      Math.abs(parseFloat(item.collumnTwentyTwo.toFixed(2)))
                    )}
                  </Td>
                  <Td border="1px solid black" textAlign="right"></Td>
                  <Td border="1px solid black" textAlign="right"></Td>
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
          type={"Land"}
        />
      )}
    </Box>
  );
};

export default VillageTable;
