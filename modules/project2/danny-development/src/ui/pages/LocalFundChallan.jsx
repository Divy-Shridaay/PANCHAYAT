import React, { useState, useEffect } from "react";
import TableComponent from "../components/TableComponent";
import { useTranslation } from "react-i18next";
import { Center, useDisclosure, VStack } from "@chakra-ui/react";
import ChallanCreateModal from "../components/ChallanCreateModal";
import {
  deleteChallan,
  fetchChallansPage,
} from "../../adapters/ChallanApiAdapter";
import { useFinancialYear } from "../../ports/context/FinancialYearContext";
import PageHeader from "../components/PageHeader";
import { useVillage } from "../../ports/context/VillageContext";
import { convertToCurrencyWords } from "../../utils/convertToCurrencyWords";
import { getLocalFundReport } from "../../adapters/ReportApiAdapter";
import { formatToDDMMYYYY } from "dtf_package";
import { convertEngToGujNumber } from "../../utils/convertEngToGujNumber";
import { convertSlashesToDashes } from "../../utils/dateFunction";
import { useUser } from "../../ports/context/UserContext";

export default function LocalFundChallan() {
  const { t } = useTranslation();
  const { user } = useUser();
  const { village, villageName, talukaName, districtName } = useVillage();
  const { financialYear, financialYearName } = useFinancialYear();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [localFundChallans, setLocalFundChallans] = useState({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState({});
  const [status, setStatus] = useState(1);
  const [mode, setMode] = useState("create");
  const [id, setId] = useState(null);

  const fetchLocalFundChallan = async () => {
    const response = await fetchChallansPage(
      page,
      limit,
      searchQuery,
      "",
      { ...filter, type: "Local Fund", financialYear, village },
      status
    );
    if (response) {
      setLocalFundChallans(response.data);
    }
  };
  useEffect(() => {
    setTimeout(() => {
      fetchLocalFundChallan();
    }, 0);
  }, [page, limit, searchQuery, filter, status, financialYear, village]);

  const columns = [
    {
      header: t("challan.challanNo"),
      accessor: "challanNo",
    },
    {
      header: t("challan.date"),
      accessor: "date",
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

  const handleLandTenClick = async (id) => {
    try {
      let challanId = id;

      const challanData = await fetchChallansPage(
        1,
        1000000,
        "",
        "",
        { ...filter, type: "Local Fund", financialYear, village },
        status
      );

      const allChallan = challanData.data.data;
      const selectedChallan = allChallan.find(
        (challan) => challan._id === challanId
      );

      const selectedIndex = allChallan.findIndex(
        (challan) => challan._id === challanId
      );

      const previousChallans = allChallan.slice(0, selectedIndex);

      const previousChallanData = previousChallans.reduce(
        (acc, challan) => {
          acc.left += challan.left || 0;
          acc.pending += challan.pending || 0;
          acc.rotating += challan.rotating || 0;
          return acc;
        },
        { left: 0, pending: 0, rotating: 0 }
      );

      const landReportData = await getLocalFundReport(
        1,
        1000000,
        village,
        financialYear
      );

      let allLandReportData = landReportData?.data?.data || [];
      let totalReport = allLandReportData.find(
        (report) => report.isTotalRow == true
      );

      let data = {
        tableName: "સંયુક્ત લોકલ ફંડ ",
        village: villageName || "",
        district: districtName || "",
        taluka: talukaName || "",
        financialYear: financialYearName || "",
        challanNo: selectedChallan.challanNo || "",
        from: selectedChallan.from || "",
        to: selectedChallan.to || "",
        left: Number(totalReport?.maangnuLeft || 0),
        kayam:
          Number(totalReport?.sarkari || 0) + Number(totalReport?.sivay || 0),
        rotating: Number(totalReport.rotating || 0),
        previousChallanLeft: Number(previousChallanData?.left || 0),
        previousChallanKayam: Number(previousChallanData?.pending || 0),
        previousChallanRotating: Number(previousChallanData?.rotating || 0),
        selectedLeft: Number(selectedChallan.left || 0),
        selectedKayam: Number(selectedChallan.pending || 0),
        selectedRotating: Number(selectedChallan.rotating || 0),
        date: formatToDDMMYYYY(new Date()),
      };

      data.total = data.left + data.kayam + data.rotating;
      data.previousTotal =
        data.previousChallanLeft +
        data.previousChallanKayam +
        data.previousChallanRotating;
      data.selectedTotal =
        data.selectedLeft + data.selectedKayam + data.selectedRotating;

      data.leftTotals = data.previousChallanLeft + data.selectedLeft;
      data.kayamTotals = data.previousChallanKayam + data.selectedKayam;
      data.rotatingTotals =
        data.previousChallanRotating + data.selectedRotating;

      data.wholeTotals = data.previousTotal + data.selectedTotal;

      data.totalInWords = convertToCurrencyWords(data.wholeTotals);
      data.left = data.left.toFixed(2);
      data.kayam = data.kayam.toFixed(2);
      data.rotating = data.rotating.toFixed(2);
      data.total = data.total.toFixed(2);

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

      data = gujaratiData;

      // 1. Fetch the raw HTML file as a string
      const response = await fetch("/reports/landGamnoNamunoNo.10.html");
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

  return (
    <Center w={"90%"}>
      <VStack spacing={0} w="100%" align="stretch">
        <PageHeader>
          {t("topbar.localFund")} {t("topbar.challan")}
        </PageHeader>
        <TableComponent
          caption={t("challan.caption")}
          columns={columns}
          data={localFundChallans?.data || []}
          emptyMessage={t("common.emptyMessage")}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpen={onOpen}
          totalDocs={localFundChallans?.pagination?.totalDocuments}
          lastPage={localFundChallans?.pagination?.lastPage}
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
            deleteChallan(id);
            fetchLocalFundChallan();
          }}
          handleLandTenClick={handleLandTenClick}
          isCreate={user?.role.permissions.includes("CHALLAN_CREATE")}
          isUpdate={user?.role.permissions.includes("CHALLAN_UPDATE")}
          isDelete={user?.role.permissions.includes("CHALLAN_DELETE")}
        />
        {isOpen && (
          <ChallanCreateModal
            isOpen={isOpen}
            onClose={() => {
              onClose();
              fetchLocalFundChallan();
              setMode("create");
              setId(null);
            }}
            mode={mode}
            id={id}
            type="Local Fund"
          />
        )}
      </VStack>
    </Center>
  );
}
