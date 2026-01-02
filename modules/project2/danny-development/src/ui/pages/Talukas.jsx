import React, { useState, useEffect } from "react";
import TableComponent from "../components/TableComponent";
import { useTranslation } from "react-i18next";
import {
  deleteTaluka,
  fetchTalukasPage,
} from "../../adapters/TalukaApiAdapter";
import { Center, useDisclosure, VStack } from "@chakra-ui/react";
import TalukaCreateModal from "../components/TalukaCreateModal";
import PageHeader from "../components/PageHeader";
import { useUser } from "../../ports/context/UserContext";

export default function Talukas() {
  const { t } = useTranslation();
  const { user } = useUser();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [talukas, setTalukas] = useState({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState({});
  const [status, setStatus] = useState(1);
  const [mode, setMode] = useState("create");
  const [id, setId] = useState(null);

  const columns = [
    {
      header: t("talukas.name"),
      accessor: "name",
    },
    {
      header: t("talukas.district"),
      accessor: "district.name",
    },
    {
      header: t("common.status"),
      accessor: "status",
      cell: (props) => {
        switch (props.value) {
          case "1":
            return <Tag colorScheme="green">{t("common.active")}</Tag>;
          case "0":
            return <Tag colorScheme="red">{t("common.inactive")}</Tag>;
          default:
            return <Tag colorScheme="gray">{t("common.deleted")}</Tag>;
        }
      },
    },
  ];

  async function fetchTalukas() {
    const { data } = await fetchTalukasPage(
      page,
      limit,
      searchQuery,
      filter,
      status,
      "district"
    );
    setTalukas(data);
  }

  useEffect(() => {
    setTimeout(() => {
      fetchTalukas();
    }, 0);
  }, []);

  useEffect(() => {
    fetchTalukas();
  }, [page, limit, searchQuery, filter, status]);

  return (
    <Center w="90%">
      <VStack spacing={0} w="100%" align="stretch">
        <PageHeader>{t("topbar.talukas")}</PageHeader>
        <TableComponent
          caption={t("talukas.caption")}
          columns={columns}
          data={talukas?.data || []}
          emptyMessage={t("common.emptyMessage")}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpen={onOpen}
          totalDocs={talukas?.pagination?.totalDocuments}
          lastPage={talukas?.pagination?.lastPage}
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
            deleteTaluka(id);
            fetchDistricts();
          }}
          isCreate={user?.role.permissions.includes("TALUKAS_CREATE")}
          isUpdate={user?.role.permissions.includes("TALUKAS_UPDATE")}
          isDelete={user?.role.permissions.includes("TALUKAS_DELETE")}
        />
        <TalukaCreateModal
          isOpen={isOpen}
          onClose={() => {
            onClose();
            fetchTalukas();
          }}
          id={id}
          mode={mode}
        />
      </VStack>
    </Center>
  );
}
