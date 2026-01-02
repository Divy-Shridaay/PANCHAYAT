import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import TableComponent from "../components/TableComponent";
import { deleteUser, fetchUsersPage } from "../../adapters/UserApiAdapter";
import { Center, useDisclosure } from "@chakra-ui/react";
import UserCreateModal from "../components/UserCreateModal";

const Users = () => {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [users, setUsers] = useState({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState({});
  const [status, setStatus] = useState(1);
  const [mode, setMode] = useState("create");
  const [id, setId] = useState(null);

  const columns = [
    { header: t("users.name"), accessor: "name" },
    { header: t("users.email"), accessor: "email" },
    { header: t("users.phone"), accessor: "phone" },
    { header: t("users.dob"), accessor: "dob" },
    { header: t("users.role"), accessor: "role.name" },
  ];

  const fetchUsers = async () => {
    const response = await fetchUsersPage(
      page,
      limit,
      searchQuery,
      "role",
      filter,
      status
    );
    setUsers(response.data);
  };

  useEffect(() => {
    setTimeout(() => {
      fetchUsers();
    }, 0);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [page, limit, searchQuery, filter, status]);

  return (
    <Center w={"90%"}>
      <TableComponent
        caption={t("users.caption")}
        columns={columns}
        data={users?.data || []}
        emptyMessage={t("common.emptyMessage")}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpen={onOpen}
        totalDocs={users?.pagination?.totalDocuments}
        lastPage={users?.pagination?.lastPage}
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
          deleteUser(id);
          fetchUsers();
        }}
      />
      {isOpen && (
        <UserCreateModal
          isOpen={isOpen}
          onClose={() => {
            onClose();
            fetchUsers();
            setMode("create");
            setId(null);
          }}
          mode={mode}
          id={id}
        />
      )}
    </Center>
  );
};

export default Users;
