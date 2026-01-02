import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  FormControl,
  ModalCloseButton,
} from "@chakra-ui/react";
import {
  CustomButton,
  CustomFormLabel,
  CustomInput,
  CustomSelect,
} from "component-library-iboon";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  createNewRole,
  updateExistingRole,
  fetchRoleById,
} from "../../adapters/RolesApiAdapter";
import ManagePermissions from "./ManagePermissions";

export default function RoleCreateModal({
  isOpen,
  onClose,
  mode = "create",
  id = null,
}) {
  const { t } = useTranslation();
  const [roleName, setRoleName] = useState("");
  const [status, setStatus] = useState("");
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    const getRoleById = async () => {
      if (mode === "update" && id) {
        const response = await fetchRoleById(id);
        if (response) {
          setRoleName(response.data.name);
          setStatus(response.data.status);
          setPermissions(response.data.permissions);
        }
      }
    };
    getRoleById();
  }, [mode, id]);

  const handleSaveRole = async () => {
    const roleData = { name: roleName, status, permissions };
    let response;

    if (mode === "create") {
      response = await createNewRole(roleData);
    } else if (mode === "update" && id) {
      response = await updateExistingRole(id, roleData);
    }

    if (response.status) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={"3xl"}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t(`roleCreateModal.${mode}Title`)}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <CustomFormLabel>{t("roleCreateModal.roleName")}</CustomFormLabel>
            <CustomInput
              value={roleName}
              placeholder={t("roleCreateModal.roleName")}
              onChange={(e) => setRoleName(e.target.value)}
            />
          </FormControl>
          <FormControl mt={4}>
            <CustomFormLabel>{t("roleCreateModal.status")}</CustomFormLabel>
            <CustomSelect
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">{t("common.status")}</option>
              <option value="1">{t("common.active")}</option>
              <option value="0">{t("common.inactive")}</option>
              <option value="2">{t("common.deleted")}</option>
            </CustomSelect>
          </FormControl>

          <ManagePermissions
            allowedPermissions={permissions}
            updatePermission={setPermissions}
          />
        </ModalBody>

        <ModalFooter>
          <CustomButton mr={3} onClick={onClose} designType="outline">
            {t("roleCreateModal.cancel")}
          </CustomButton>
          <CustomButton onClick={handleSaveRole}>
            {t(`common.${mode}`)}
          </CustomButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
