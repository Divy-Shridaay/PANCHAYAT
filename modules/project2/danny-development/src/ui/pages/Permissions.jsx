import React, { useState, useEffect } from "react";
import TableComponent from "../components/TableComponent";
import {
  deleteExistingPermission,
  fetchPermissionsPage,
} from "../../adapters/PermissionsApiAdapter";
import { Center, useDisclosure } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import PermissionCreateModal from "../components/PermisisonCreateModal";

export default function Permissions() {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [permissions, setPermissions] = useState({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState({});
  const [status, setStatus] = useState(1);
  const [mode, setMode] = useState("create");
  const [id, setId] = useState(null);

  const fetchPermissions = async () => {
    const response = await fetchPermissionsPage(
      page,
      limit,
      searchQuery,
      "",
      filter,
      status
    );
    setPermissions(response.data);
  };

  useEffect(() => {
    setTimeout(() => {
      fetchPermissions();
    }, 0);
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [page, limit, searchQuery, filter, status]);

  const columns = [
    {
      header: t("permissions.permissionName"),
      accessor: "name",
    },
    {
      header: t("permissions.permissionValue"),
      accessor: "value",
    },
    {
      header: t("permissions.status"),
      accessor: "status",
    },
  ];

  return (
    <Center w={"90%"}>
      <TableComponent
        caption={t("permissions.caption")}
        columns={columns}
        data={permissions?.data || []}
        emptyMessage={t("common.emptyMessage")}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpen={onOpen}
        totalDocs={permissions?.pagination?.totalDocuments}
        lastPage={permissions?.pagination?.lastPage}
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
          deleteExistingPermission(id);
          fetchPermissions();
        }}
      />
      {isOpen && (
        <PermissionCreateModal
          isOpen={isOpen}
          onClose={() => {
            onClose();
            fetchPermissions();
            setMode("create");
            setId(null);
          }}
          mode={mode}
          id={id}
        />
      )}
    </Center>
  );
}
