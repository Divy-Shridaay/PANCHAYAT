import React, { useState, useEffect, useRef } from "react";
import TableComponent from "../components/TableComponent";
import { useTranslation } from "react-i18next";
import {
  deleteAllVillagers,
  deleteExistingVillager,
  exportBinKhetiVillagers,
  exportVillagers,
  fetchVillagersPage,
} from "../../adapters/VillagerApiAdapter";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Center,
  HStack,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import VillagerCreateModal from "../components/VillagerCreateModal";
import { useUser } from "../../ports/context/UserContext";
import { useVillage } from "../../ports/context/VillageContext";
import { useFinancialYear } from "../../ports/context/FinancialYearContext";
import PageHeader from "../components/PageHeader";
import { CustomButton, useLoader } from "component-library-iboon";
import { convertEngToGujNumber } from "../../utils/convertEngToGujNumber";

export default function Villagers() {
  const { toggleLoading } = useLoader();

  const { t } = useTranslation();

  const { financialYear, financialYearName } = useFinancialYear();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteAllOpen,
    onOpen: onDeleteAllOpen,
    onClose: onDeleteAllClose,
  } = useDisclosure();
  const cancelRef = useRef();
  const [refresh, setRefresh] = React.useState(0);

  const { village, taluka, district, villageName, districtName, talukaName } =
    useVillage();
  const { user } = useUser();
  const [villagers, setVillagers] = useState({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState({});
  const [status, setStatus] = useState(1);
  const [mode, setMode] = useState("create");
  const [id, setId] = useState(null);
 
  const fetchVillagers = async () => {
    const response = await fetchVillagersPage(
      page,
      limit,
      "village",
      {
        ...filter,
        ...{ village },
      },
      searchQuery,
      status
    );
    setVillagers(response.data);
  };

  useEffect(() => {
    if (village) fetchVillagers();
  }, [
    page,
    limit,
    user?._id,
    searchQuery,
    filter,
    status,
    village,
    financialYear,
    refresh,
  ]);

  const columns = [
    {
      header: t("villagers.accountNumber"),
      accessor: "accountNo",
    },
    {
      header: t("villagers.name"),
      accessor: "name",
    },
    {
      header: t("common.sarkari"),
      accessor: "sarkari",
    },
    {
      header: t("common.sivay"),
      accessor: "sivay",
    },
    {
      header: t("villagers.village"),
      accessor: "village.name",
    },
    // {
    //   header: t("common.status"),
    //   accessor: "status",
    // },
  ];

   
  const handlePrint = async () => {
    try {
      // 1. Open the print window immediately to avoid popup blocking
      const printWindow = window.open("", "_blank", "width=1500,height=800");

      if (!printWindow) {
        alert("Please allow popups for this site to open the report.");
        return;
      }

      // 2. Show loading in print window
      printWindow.document.write(`
    <html><head><title>export Vasulat Patrak </title></head>
    <body>લોડ થઈ રહ્યું છે... કૃપા કરીને રાહ જુઓ.</body></html>
  `);
      printWindow.document.close();

      toggleLoading(true);
      const res = await exportVillagers(
        village,
        taluka,
        district,
        financialYear,
        "pdf"
      );

      let {
        data: {
          data: { data },
        },
      } = res;

      toggleLoading(false);

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

      // 🧾 Detect Mansa format (13 columns) vs regular format (18 columns)
      const isMansaFormat = data.length > 0 && data[0].hasOwnProperty('landSivayPlusLocal');

      // 🧾 Build paginated chunks based on name line count
      const rowsPerPage = 22;
      const paginatedChunks = [];
      let currentChunk = [];
      let currentLineCount = 0;

      for (const item of data) {
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

            if (isMansaFormat) {
              // 🟢 MANSA FORMAT: 13 columns with combined "ખેતી સિવાય + લોકલ ફંડ"
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
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber(parseFloat(item.landLeft || 0).toFixed(2))}
        </td>
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber(parseFloat(item.landSivayPlusLocal || 0).toFixed(2))}
        </td>
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber(parseFloat(item.landFajal || 0).toFixed(2))}
        </td>
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber(parseFloat(item.landRecoverable || 0).toFixed(2))}
        </td>
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber(parseFloat(item.landDeposit || 0).toFixed(2))}
        </td>
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber(parseFloat(item.eduLeft || 0).toFixed(2))}
        </td>
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber(parseFloat(item.eduPending || 0).toFixed(2))}
        </td>
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber(parseFloat(item.eduFajal || 0).toFixed(2))}
        </td>
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber(parseFloat(item.eduRecoverable || 0).toFixed(2))}
        </td>
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber(parseFloat(item.eduDeposit || 0).toFixed(2))}
        </td>
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber(parseFloat(item.grandTotal || 0).toFixed(2))}
        </td>
      </tr>
    `;
            } else {
              // 🔴 REGULAR FORMAT: 18 columns with separate local fund section
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
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber(parseFloat(item.landLeft || 0).toFixed(2))}
        </td>
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber(parseFloat(item.landPending || 0).toFixed(2))}
        </td>
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber(parseFloat(item.landFajal || 0).toFixed(2))}
        </td>
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber(parseFloat(item.landRecoverable || 0).toFixed(2))}
        </td>
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber(parseFloat(item.landDeposit || 0).toFixed(2))}
        </td>
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber(parseFloat(item.localLeft || 0).toFixed(2))}
        </td>
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber(parseFloat(item.localPending || 0).toFixed(2))}
        </td>
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber(parseFloat(item?.localFajal || 0).toFixed(2))}
        </td>
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber(parseFloat(item?.localRecoverable || 0).toFixed(2))}
        </td>
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber(parseFloat(item?.localDeposit || 0).toFixed(2))}
        </td>
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber(parseFloat(item.eduLeft).toFixed(2))}
        </td>
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber(parseFloat(item.eduPending || 0).toFixed(2))}
        </td>
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber(parseFloat(item.eduFajal || 0).toFixed(2))}
        </td>
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber(parseFloat(item.eduRecoverable || 0).toFixed(2))}
        </td>
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber(Math.abs(item.eduDeposit || 0).toFixed(2))}
        </td>
        <td ${
          item.isTotalRow
            ? `style="writing-mode: vertical-rl; transform: rotate(180deg);"`
            : ""
        }>
          ${convertEngToGujNumber(parseFloat(item.grandTotal || 0).toFixed(2))}
        </td>
      </tr>
    `;
            }
          })
          .join("");

        const tableHeaders = isMansaFormat
          ? `
        <tr>
          <th colspan="13" style="font-size:20px;" class="text-center">
           ${villageName}  ગ્રામ પંચાયત, તા. ${talukaName} જી. ${districtName}  વસુલાત પત્રક  સને ${convertEngToGujNumber(
          financialYearName
        )}
          </th>
        </tr>
          <tr>
      <th rowspan="2">ખાતા નંબર</th>
      <th rowspan="2">ખાતેદાર નું નામ</th>
      <th colspan="5">જમીન મહેસૂલ</th>
      <th colspan="5">શિક્ષણ ઉપકર</th>
      <th rowspan="2">એકંદર કુલ</th>
    </tr>
    <tr>
      <th>પાછલી બાકી</th>
      <th>ખેતી સિવાય + લોકલ ફંડ</th>
      <th>ફાજલ</th>
      <th>વસૂલ કરવા પાત્ર રકમ</th>
      <th>જમા ફાજલ</th>

         <th>પાછલી બાકી</th>
      <th>ચાલુ</th>
      <th>ફાજલ</th>
      <th>વસૂલ કરવા પાત્ર રકમ</th>
      <th>જમા ફાજલ</th>
    </tr>
        `
          : `
        <tr>
          <th colspan="18" style="font-size:20px;" class="text-center">
           ${villageName}  ગ્રામ પંચાયત, તા. ${talukaName} જી. ${districtName}  વસુલાત પત્રક  સને ${convertEngToGujNumber(
          financialYearName
        )}
          </th>
        </tr>
          <tr>
      <th rowspan="2">ખાતા નંબર</th>
      <th rowspan="2">ખાતેદાર નું નામ</th>
      <th colspan="5">જમીન મહેસૂલ</th>
      <th colspan="5">લોકલ કંડ</th>
      <th colspan="5">શિક્ષણ ઉપકર</th>
      <th rowspan="2">એકંદર કુલ</th>
    </tr>
    <tr>
      <th>પાછલી બાકી</th>
      <th>ચાલુ</th>
      <th>ફાજલ</th>
      <th>વસૂલ કરવા પાત્ર રકમ</th>
      <th>જમા ફાજલ</th>

        <th>પાછલી બાકી</th>
      <th>ચાલુ</th>
      <th>ફાજલ</th>
      <th>વસૂલ કરવા પાત્ર રકમ</th>
      <th>જમા ફાજલ</th>

         <th>પાછલી બાકી</th>
      <th>ચાલુ</th>
      <th>ફાજલ</th>
      <th>વસૂલ કરવા પાત્ર રકમ</th>
      <th>જમા ફાજલ</th>
    </tr>
        `;

        pagesHtml += `
    <section class="print-page">
      <table>
        <thead>
        ${tableHeaders}
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>

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
          margin-left: 20px;
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
          font-size: 16px;
          text-align: center;
          width: 100px;
        }
        th {
          background-color: #d4d4d4ff;
        }
        .remark-section {
          font-size: 16px !important;
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
            font-size: 16px;
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
    } catch (err) {
      console.log("Export failed:", err);
    }
  };

  return (
    <Center w={"90%"}>
      <VStack spacing={0} w="100%" align="stretch">
        <HStack justifyContent="space-between" alignItems="center" p={4}>
          <PageHeader>{t("topbar.villagers")}</PageHeader>
          <HStack>
            {user?.role.permissions.includes("VILLAGERS_DELETE") && (
              <CustomButton
                colorScheme="red"
                variant={"outline"}
                onClick={() => {
                  onDeleteAllOpen();
                }}
              >
                All Delete
              </CustomButton>
            )}
            <CustomButton
              variant={"outline"}
              onClick={async () => {
                try {
                  toggleLoading(true);
                  const res = await exportBinKhetiVillagers(
                    village,
                    taluka,
                    district,
                    financialYear
                  );
                  toggleLoading(false);
                  const url = window.URL.createObjectURL(new Blob([res.data]));
                  const link = document.createElement("a");
                  link.href = url;
                  link.setAttribute(
                    "download",
                    `export_બિન ખેતી શીટ_${villageName}_${convertEngToGujNumber(
                      financialYearName
                    )}.xlsx`
                  );
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                } catch (err) {
                  console.error("Export failed:", err);
                }
              }}
            >
              Export બિન ખેતી શીટ
            </CustomButton>
            <CustomButton
              variant={"outline"}
              onClick={async () => {
                try {
                  toggleLoading(true);
                  const res = await exportVillagers(
                    village,
                    taluka,
                    district,
                    financialYear,
                    "excel"
                  );
                  toggleLoading(false);
                  const url = window.URL.createObjectURL(new Blob([res.data]));
                  const link = document.createElement("a");
                  link.href = url;
                  link.setAttribute(
                    "download",
                    `export_${villageName}_${convertEngToGujNumber(
                      financialYearName
                    )}.xlsx`
                  );
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                } catch (err) {
                  console.error("Export failed:", err);
                }
              }}
            >
              Export વસુલાત પત્રક excel
            </CustomButton>
            <CustomButton
              variant="outline"
              onClick={() => {
                handlePrint();
              }}
            >
              Export વસુલાત પત્રક PDF
            </CustomButton>
          </HStack>
        </HStack>
        <TableComponent
          caption={t("villagers.caption")}
          columns={columns}
          data={villagers?.data || []}
          emptyMessage={t("common.emptyMessage")}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpen={onOpen}
          totalDocs={villagers?.pagination?.totalDocuments}
          lastPage={villagers?.pagination?.lastPage}
          page={page}
          setPage={setPage}
          limit={limit}
          setLimit={setLimit}
          status={status}
          setStatus={setStatus}
          filter={filter}
          setFilter={setFilter}
          setMode={setMode}
          setId={setId}
          deleteFunction={(id) => {
            deleteExistingVillager(id);
            fetchVillagers();
          }}
          isCreate={user?.role.permissions.includes("VILLAGERS_CREATE")}
          isUpdate={user?.role.permissions.includes("VILLAGERS_UPDATE")}
          isDelete={user?.role.permissions.includes("VILLAGERS_DELETE")}
        />

        {isOpen && (
          <VillagerCreateModal
            isOpen={isOpen}
            onClose={() => {
              onClose();
              fetchVillagers();
              setMode("create");
              setId(null);
            }}
            mode={mode}
            id={id}
          />
        )}

        <>
          {/* Example button to open the dialog */}

          <AlertDialog
            isOpen={isDeleteAllOpen}
            leastDestructiveRef={cancelRef}
            onClose={onDeleteAllClose}
          >
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                  {t("table.confirmDeleteTitle") || "Confirm Deletion"}
                </AlertDialogHeader>

                <AlertDialogBody>
                  {t("table.confirmDeleteMessage") ||
                    "Are you sure you want to delete this? This action cannot be undone."}
                </AlertDialogBody>

                <AlertDialogFooter>
                  <CustomButton ref={cancelRef} onClick={onDeleteAllClose}>
                    {t("common.cancel")}
                  </CustomButton>
                  <CustomButton
                    designType="outline"
                    ml={3}
                    onClick={async () => {
                      try {
                        onDeleteAllClose();
                        await deleteAllVillagers(village);
                        setRefresh((prev) => prev + 1);
                      } catch (err) {
                        console.error("Delete failed:", err);
                      }
                    }}
                  >
                    {t("common.delete")}
                  </CustomButton>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>
        </>
      </VStack>
    </Center>
  );
}
