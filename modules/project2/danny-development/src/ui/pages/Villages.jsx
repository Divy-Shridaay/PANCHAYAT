import React, { useState, useEffect } from "react";
import TableComponent from "../components/TableComponent";
import {
  deleteExistingVillage,
  fetchVillagesPage,
} from "../../adapters/VillageApiAdapter";
import { Center, useDisclosure, VStack } from "@chakra-ui/react";
import VillageCreateModal from "../components/VillageCreateModal";
import { useUser } from "../../ports/context/UserContext";
import { useTranslation } from "react-i18next";
import PageHeader from "../components/PageHeader";

export default function Villages() {
  const { user } = useUser();
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [villages, setVillages] = useState({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState({});
  const [status, setStatus] = useState(1);
  const [mode, setMode] = useState("create");
  const [id, setId] = useState(null);

  const fetchVillages = async () => {
    const response = await fetchVillagesPage(
      page,
      limit,
      searchQuery,
      "taluka(district)",
      {
        ...filter,
        ...(user?.role?.name === "Super Admin"
          ? {}
          : { _id: { $in: user?.villageAccess || [] } }),
      },
      status
    );
    setVillages(response.data);
  };

  useEffect(() => {
    fetchVillages();
  }, [page, limit, user?._id, searchQuery, filter, status]);

  const columns = [
    {
      header: t("villages.villageName"),
      accessor: "name",
    },
    {
      header: t("villages.taluka"),
      accessor: "taluka.name",
    },
    {
      header: t("villages.district"),
      accessor: "taluka.district.name",
    },

    {
      header: t("common.status"),
      accessor: "status",
    },
  ];

  return (
    <Center w={"90%"}>
      <VStack spacing={0} w="100%" align="stretch">
        <PageHeader>{t("topbar.villages")}</PageHeader>
        <TableComponent
          caption={t("villages.caption")}
          columns={columns}
          data={villages?.data || []}
          emptyMessage={t("common.emptyMessage")}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpen={onOpen}
          totalDocs={villages?.pagination?.totalDocuments}
          lastPage={villages?.pagination?.lastPage}
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
            deleteExistingVillage(id);
            fetchDistricts();
          }}
          isCreate={user?.role.permissions.includes("VILLAGES_CREATE")}
          isUpdate={user?.role.permissions.includes("VILLAGES_UPDATE")}
          isDelete={user?.role.permissions.includes("VILLAGES_DELETE")}
        />

        <VillageCreateModal
          isOpen={isOpen}
          onClose={() => {
            onClose();
            fetchVillages();
            setMode("create");
            setId(null);
          }}
          mode={mode}
          id={id}
        />
      </VStack>
    </Center>
  );
}
