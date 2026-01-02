import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import TableComponent from "../components/TableComponent";
import {
  deleteExistingDistrict,
  fetchDistrictsPage,
} from "../../adapters/DistrictApiAdapter";
import { Center, useDisclosure, VStack } from "@chakra-ui/react";
import DistrictCreateModal from "../components/DsitrictCreateModal";
import PageHeader from "../components/PageHeader";
import { useUser } from "../../ports/context/UserContext";

export default function Districts() {
  const { t } = useTranslation();
  const { user } = useUser();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [districts, setDistricts] = useState({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState({});
  const [status, setStatus] = useState(1);
  const [mode, setMode] = useState("create");
  const [id, setId] = useState(null);

  const fetchDistricts = async () => {
    const response = await fetchDistrictsPage(
      page,
      limit,
      searchQuery,
      "",
      filter,
      status
    );
    setDistricts(response.data);
  };

  useEffect(() => {
    setTimeout(() => {
      fetchDistricts();
    }, 0);
  }, []);

  useEffect(() => {
    fetchDistricts();
  }, [page, limit, searchQuery, filter, status]);

  const columns = [
    {
      header: t("districts.name"),
      accessor: "name",
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

  return (
    <>
      <Center w="90%">
        <VStack spacing={0} w="100%" align="stretch">
          <PageHeader>{t("topbar.districts")}</PageHeader>
          <TableComponent
            caption={t("districts.caption")}
            columns={columns}
            data={districts?.data || []}
            emptyMessage={t("common.emptyMessage")}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onOpen={onOpen}
            totalDocs={districts?.pagination?.totalDocuments}
            lastPage={districts?.pagination?.lastPage}
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
              deleteExistingDistrict(id);
              fetchDistricts();
            }}
            isCreate={user?.role.permissions.includes("DISTRICTS_CREATE")}
            isUpdate={user?.role.permissions.includes("DISTRICTS_UPDATE")}
            isDelete={user?.role.permissions.includes("DISTRICTS_DELETE")}
          />

          {isOpen && (
            <DistrictCreateModal
              isOpen={isOpen}
              onClose={() => {
                onClose();
                fetchDistricts();
                setMode("create");
                setId(null);
              }}
              mode={mode}
              id={id}
            />
          )}
        </VStack>
      </Center>
    </>
  );
}
