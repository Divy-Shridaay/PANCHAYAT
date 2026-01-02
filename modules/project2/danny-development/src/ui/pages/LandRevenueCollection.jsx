import { useState, useEffect, useRef } from "react";
import TableComponent from "../components/TableComponent";
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
import { useTranslation } from "react-i18next";
import {
  deleteAllLandRevenue,
  deleteLandRevenue,
  fetchLandRevenuePage,
} from "../../adapters/LandRevenueApiAdapter";
import LandRevenueCollectionModal from "../components/RevenueCollectionModal";
import { useVillage } from "../../ports/context/VillageContext";
import { useFinancialYear } from "../../ports/context/FinancialYearContext";
import PageHeader from "../components/PageHeader";
import numberToWords from "number-to-words";
import { convertToCurrencyWords } from "../../utils/convertToCurrencyWords";
import { convertEngToGujNumber } from "../../utils/convertEngToGujNumber";
import { convertSlashesToDashes } from "../../utils/dateFunction";
import { CustomButton } from "component-library-iboon";
import { useUser } from "../../ports/context/UserContext";

export default function LandRevenue() {
  const { t } = useTranslation();
  const { financialYear } = useFinancialYear();
  const {user } = useUser();
  const { village, talukaName, villageName, districtName } = useVillage();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteAllOpen,
    onOpen: onDeleteAllOpen,
    onClose: onDeleteAllClose,
  } = useDisclosure();
  const cancelRef = useRef();
  const [refresh, setRefresh] = useState(0);
  const [landRevenues, setLandRevenues] = useState({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState({});
  const [status, setStatus] = useState(1);
  const [mode, setMode] = useState("create");
  const [id, setId] = useState(null);

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

  const fetchLandRevenues = async () => {
    const response = await fetchLandRevenuePage(
      page,
      limit,
      searchQuery,
      "villager",
      filter,
      status,
      [
        ...pipeline,
        {
          $addFields: {
            billDateStr: {
              $dateToString: { format: "%d-%m-%Y", date: "$billDate" },
            },
          },
        },
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
              $eq: ["$villager.village", { $toObjectId: village }],
            },

            $or: [
              { "villager.name": { $regex: searchQuery, $options: "i" } },
              { "villager.accountNo": { $regex: searchQuery, $options: "i" } },
              { billNo: { $regex: searchQuery, $options: "i" } },
              { bookNo: { $regex: searchQuery, $options: "i" } },
              { billDateStr: { $regex: searchQuery, $options: "i" } },
            ],
          },
        },
        {
          $sort: { createdAt: 1 },
        },
      ]
    );
    setLandRevenues(response.data);
  };

  useEffect(() => {
    setTimeout(() => {
      fetchLandRevenues();
    }, 0);
  }, []);

  useEffect(() => {
    fetchLandRevenues();
  }, [
    page,
    limit,
    searchQuery,
    filter,
    status,
    village,
    financialYear,
    refresh,
  ]);

  const columns = [
    {
      header: t("revenue.billNo"),
      accessor: "billNo",
    },
    // {
    //   header: t("revenue.bookNo"),
    //   accessor: "bookNo",
    // },
    {
      header: t("revenue.billDate"),
      accessor: "billDate",
    },
    {
      header: t("revenue.villagerAccountNo"),
      accessor: "villager.accountNo",
    },
    {
      header: t("revenue.villagerName"),
      accessor: "villager.name",
    },
    {
      header: t("common.left"),
      accessor: "left",
    },
    {
      header: t("common.pending"),
      accessor: "pending",
    },
    {
      header: t("common.rotating"),
      accessor: "rotating",
    },
    {
      header: t("common.total"),
      accessor: "total",
    },
  ];

  const handleJameenVasulat = async (receiptData) => {
    try {
      const response = await fetch("/reports/jameenVasulat.html");
      const htmlTemplate = await response.text();

      const buildCell = (dataItem) => {
        if (!dataItem) return "";
        let filled = htmlTemplate;
        Object.entries(dataItem).forEach(([key, value]) => {
          const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
          filled = filled.replace(regex, value ?? "");
        });
        return `<div class="receipt-box">${filled}</div>`;
      };

      // Group into sets of 8 for each page
      const totalPages = Math.ceil(receiptData.length / 8);
      let pagesHTML = "";

      for (let p = 0; p < totalPages; p++) {
        const start = p * 8;
        const pageItems = receiptData.slice(start, start + 8);

        const leftCol = pageItems.slice(0, 4); // 1–4
        const rightCol = pageItems.slice(4, 8); // 5–8

        let rowsHTML = "";
        for (let i = 0; i < 4; i++) {
          rowsHTML += `
          <div class="receipt-row">
            ${buildCell(leftCol[i])}
            ${buildCell(rightCol[i])}
          </div>
        `;
        }

        pagesHTML += `
        <div class="receipt-page">
          ${rowsHTML}
        </div>
      `;
      }

      const printWindow = window.open("", "_blank", "width=1000,height=800");
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="gu">
        <head>
          <meta charset="UTF-8">
          <title>જમીન વસુલાત રસીદો</title>
          <style>
            body {
              font-family: 'Noto Sans Gujarati', sans-serif;
              margin: 0;
            }
            .receipt-page {
              page-break-after: always;
              margin-bottom: 20px;
            }
            .receipt-row {
              display: flex;
              justify-content: space-between;

              page-break-inside: avoid;
            }
            .receipt-box {
              width: 48%;
              border: 1px solid #000;
              box-sizing: border-box;
            }
            @media print {
              .receipt-page {
                page-break-after: always;
              }
              .receipt-box {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          ${pagesHTML}
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

  const handlePrint = async () => {
    const noticeFee = 1;
    const response = await fetchLandRevenuePage(
      1,
      100000,
      "",
      "villager",
      filter,
      status,
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
              $eq: ["$villager.village", { $toObjectId: village }],
            },
          },
        },
      ]
    );
    if (response) {
      const recieptData = response.data.data.map((result) => {
        let data = {
          taluka: talukaName,
          date: new Date().toLocaleDateString("en-GB"),
          time: new Date().toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          village: villageName,
          accountNo: result.villager.accountNo || "-",
          name: result.villager.name || "-",
          district: districtName,

          landLeft: result?.left || 0,
          landPending: result?.pending || 0,
          landRotating: result?.rotating || 0,

          localLeft: result?.left || 0,
          localPending: result?.pending || 0,
          localRotating: result?.rotating || 0,

          educationLeft: result?.left || 0,
          educationPending: result?.pending || 0,
          educationRotating: result?.rotating || 0,

          noticeFee: Number(noticeFee) || 0,
          noticeTotal: Number(noticeFee) || 0,
          billDate: result?.billDate || "-",
          billNo: result?.billNo || "-",
        };

        // Calculate totals
        data.landTotal = data.landLeft + data.landPending + data.landRotating;
        data.localTotal =
          data.localLeft + data.localPending + data.localRotating;
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
          data.landTotal +
          data.localTotal +
          data.educationTotal +
          data.noticeTotal;
        data.totalLeft = data.totalLeft.toFixed(2);
        data.total = data.total.toFixed(2);

        // Convert total and quarter to words
        data.totalWord = convertToCurrencyWords(data.total);
        data.quarter = (data.total / 4).toFixed(2);
        data.quarterWord = convertToCurrencyWords(data.quarter);
        data.total2 = Number(data.total) + Number(data.quarter);

        for (let key in data) {
          if (typeof data[key] === "number") {
            data[key] = data[key].toFixed(2);
          }
        }

        const gujaratiData = {};
        for (const [key, value] of Object.entries(data)) {
          if (key === "date") {
            gujaratiData[key] = convertEngToGujNumber(
              convertSlashesToDashes(value)
            );
          } else if (
            typeof value === "number" ||
            typeof value === "string" ||
            /^\d+$/.test(value)
          ) {
            gujaratiData[key] = convertEngToGujNumber(value);
          } else {
            gujaratiData[key] = value;
          }
        }

        return (data = gujaratiData);
      });

      handleJameenVasulat(recieptData);
    }
  };

  return (
    <Center w={"90%"}>
      <VStack spacing={0} w="100%" align="stretch">
        <HStack w={"100%"} justifyContent="space-between" p={0}>
          <PageHeader>
            {t("topbar.landRevenue")} {t("topbar.collection")}
          </PageHeader>

          {user?.role.permissions.includes("LAND_REVENUE_DELETE") && (
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
        </HStack>
        <TableComponent
          caption={t("revenue.landCaption")}
          columns={columns}
          data={landRevenues?.data || []}
          emptyMessage={t("common.emptyMessage")}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpen={onOpen}
          totalDocs={landRevenues?.pagination?.totalDocuments}
          lastPage={landRevenues?.pagination?.lastPage}
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
            deleteLandRevenue(id);
            fetchLandRevenues();
          }}
          handlePrint={handlePrint}
          // isUpdate={false}
          // isDelete={false}
          isCreate={user?.role.permissions.includes("LAND_REVENUE_CREATE")}
          isUpdate={user?.role.permissions.includes("LAND_REVENUE_UPDATE")}
          isDelete={user?.role.permissions.includes("LAND_REVENUE_DELETE")}
        />
        {isOpen && (
          <LandRevenueCollectionModal
            isOpen={isOpen}
            onClose={() => {
              onClose();
              fetchLandRevenues();
              setId(null);
              setMode("create");
            }}
            type={"Land"}
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
                        await deleteAllLandRevenue(financialYear, village);
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
