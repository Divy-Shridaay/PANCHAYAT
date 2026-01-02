import React, { useEffect, useRef } from "react";
import {
  deleteAllLandMaangnu,
  deleteLandMaangnu,
  fetchLandMaangnu,
} from "../../adapters/LandMaangnuApiAdapter";
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
import TableComponent from "../components/TableComponent";
import { useTranslation } from "react-i18next";
import { useVillage } from "../../ports/context/VillageContext";
import { useFinancialYear } from "../../ports/context/FinancialYearContext";
import LandMangnuModal from "../components/LandMangnuModal";
import PageHeader from "../components/PageHeader";
import { FaTrash } from "react-icons/fa6";
import { CustomButton, CustomIconButton } from "component-library-iboon";
import { useUser } from "../../ports/context/UserContext";

export default function LandMaangnu() {
  const { t } = useTranslation();
  const { user } = useUser();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteAllOpen,
    onOpen: onDeleteAllOpen,
    onClose: onDeleteAllClose,
  } = useDisclosure();
  const cancelRef = useRef();
  const [refresh, setRefresh] = React.useState(0);
  const { financialYear } = useFinancialYear();
  const { village, talukaName } = useVillage();
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState({});
  const [status, setStatus] = React.useState(1);
  const [landMaangnuData, setLandMaangnuData] = React.useState({});
  const [mode, setMode] = React.useState("create");
  const [id, setId] = React.useState(null);
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

  const getLandMaangnu = async () => {
    const response = await fetchLandMaangnu(
      page,
      limit,
      search,
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
            status,
            $or: [
              { "villager.name": { $regex: search, $options: "i" } },
              { "villager.accountNo": { $regex: search, $options: "i" } },
            ],
          },
        },
      ],
      `village=${village}`
    );
    if (response) {
      setLandMaangnuData(response.data);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      getLandMaangnu();
    }, 0);
  }, []);

  useEffect(() => {
    getLandMaangnu();
  }, [page, limit, search, filter, status, village, financialYear, refresh]);

  const columns = [
    {
      header: t("common.accountNo"),
      accessor: "villager.accountNo",
    },
    {
      header: t("common.name"),
      accessor: "villager.name",
    },
    {
      header: t("common.left"),
      accessor: "left",
    },
    {
      header: t("common.sarkari"),
      accessor: "sarkari",
    },
    {
      header: t("common.sivay"),
      accessor: "sivay",
    },
    ...(["માણસા", "વિજાપુર"].includes(talukaName?.trim())
      ? [
          {
            header: t("common.localFund"),
            accessor: "local",
          },
        ]
      : []),
    {
      header: t("common.rotating"),
      accessor: "rotating",
    },
    {
      header: t("common.fajal"),
      accessor: "fajal",
    },
    // {
    //   header: t("common.total"),
    //   accessor: "total",
    // },
  ];

  return (
    <Center w={"90%"}>
      <VStack spacing={0} w="100%" align="stretch">
        <HStack justifyContent="space-between" w="100%" p={0}>
          <PageHeader>
            {t("topbar.landRevenue")} {t("topbar.mangnu")}
          </PageHeader>
          {user?.role.permissions.includes("LAND_MANGANU_DELETE") && (
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
          caption={t("challan.caption")}
          columns={columns}
          data={landMaangnuData?.data || []}
          emptyMessage={t("common.emptyMessage")}
          searchQuery={search}
          setSearchQuery={setSearch}
          totalDocs={landMaangnuData?.pagination?.totalDocuments}
          lastPage={landMaangnuData?.pagination?.lastPage}
          page={page}
          setPage={setPage}
          limit={limit}
          setLimit={setLimit}
          status={status}
          setStatus={setStatus}
          onOpen={onOpen}
          setMode={setMode}
          setId={setId}
          filter={filter}
          setFilter={setFilter}
          isCreate={false}
          isUpdate={user?.role.permissions.includes("LAND_MANGANU_UPDATE")}
          isDelete={user?.role.permissions.includes("LAND_MANGANU_DELETE")}
          deleteFunction={(id) => {
            deleteLandMaangnu(id);
            getLandMaangnu();
          }}
          
        />

        {isOpen && (
          <LandMangnuModal
            isOpen={isOpen}
            onClose={() => {
              onClose();
              getLandMaangnu();
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
                        await deleteAllLandMaangnu(financialYear, village);
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
