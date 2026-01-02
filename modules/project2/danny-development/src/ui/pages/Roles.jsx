import React, { useState, useEffect } from "react";
import TableComponent from "../components/TableComponent";
import {
  deleteExistingRole,
  fetchRolesPage,
} from "../../adapters/RolesApiAdapter";
import { Center, useDisclosure } from "@chakra-ui/react";
import RoleCreateModal from "../components/RoleCreateModal";
import { useTranslation } from "react-i18next";

export default function Roles() {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [roles, setRoles] = useState({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState({});
  const [status, setStatus] = useState(1);
  const [mode, setMode] = useState("create");
  const [id, setId] = useState(null);

  const fetchRoles = async () => {
    const response = await fetchRolesPage(
      page,
      limit,
      searchQuery,
      "",
      filter,
      status
    );
    setRoles(response.data);
  };

  useEffect(() => {
    setTimeout(() => {
      fetchRoles();
    }, 0);
  },[])

  useEffect(() => {
    fetchRoles();
  }, [page, limit, searchQuery, filter, status]);

  const columns = [
    {
      header: t("roles.roleName"),
      accessor: "name",
    },
    {
      header: t("roles.roleId"),
      accessor: "roleId",
    },
    {
      header: t("common.status"),
      accessor: "status",
    },
  ];

  return (
    <Center w={"90%"}>
      <TableComponent
        caption={t("roles.caption")}
        columns={columns}
        data={roles?.data || []}
        emptyMessage={t("common.emptyMessage")}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpen={onOpen}
        totalDocs={roles?.pagination?.totalDocuments}
        lastPage={roles?.pagination?.lastPage}
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
          deleteExistingRole(id);
          fetchRoles();
        }}
      />
      {isOpen && (
        <RoleCreateModal
          isOpen={isOpen}
          onClose={() => {
            onClose();
            fetchRoles();
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
