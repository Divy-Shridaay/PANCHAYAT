import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
} from "@chakra-ui/react";
import {
  CustomButton,
  CustomFormLabel,
  CustomInput,
  CustomSelect,
} from "component-library-iboon";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { createNewPermission, fetchPermissionById, updateExistingPermission } from "../../adapters/PermissionsApiAdapter";

export default function PermissionCreateModal({
  isOpen,
  onClose,
  mode = "create",
  id = null,
}) {
  const [permissionName, setPermissionName] = useState("");
  const [permissionValue, setPermissionValue] = useState("");
  const [status, setStatus] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    if (mode === "update" && id) {
      const getPermissionById = async () => {
        const response = await fetchPermissionById(id);
        if (response) {
          setPermissionName(response.data.name);
          setPermissionValue(response.data.value);
          setStatus(response.data.status);
        }
      };
      getPermissionById();
    }
  }, [mode, id]);

  const handleCreatePermission = async () => {
    const response = await createNewPermission({
      name: permissionName,
      value: permissionValue,
      status,
    });
    if (response.status) {
      onClose();
    }
  };

  const handleUpdatePermission = async () => {
    const response = await updateExistingPermission(id, {
      name: permissionName,
      value: permissionValue,
      status,
    });
    if (response.status) {
      onClose();
    }
  };

  const handlePermissionNameChange = (e) => {
    setPermissionName(e.target.value);
    setPermissionValue(e.target.value.toUpperCase().replace(/\s/g, "_"));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {mode === "create"
            ? t("permissionCreateModal.title")
            : t("permissionUpdateModal.title")}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <CustomFormLabel>
              {t("permissionCreateModal.permissionName")}
            </CustomFormLabel>
            <CustomInput
              value={permissionName}
              onChange={handlePermissionNameChange}
              placeholder={t("permissionCreateModal.permissionName")}
            />
          </FormControl>
          <FormControl mt={4}>
            <CustomFormLabel>
              {t("permissionCreateModal.permissionValue")}
            </CustomFormLabel>
            <CustomInput
              value={permissionValue}
              placeholder={t("permissionCreateModal.permissionValue")}
              isReadOnly
            />
          </FormControl>
          <FormControl mt={4}>
            <CustomFormLabel>
              {t("permissionCreateModal.status")}
            </CustomFormLabel>
            <CustomSelect
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">{t("common.selectStatus")}</option>
              <option value="1">{t("common.active")}</option>
              <option value="0">{t("common.inactive")}</option>
              <option value="2">{t("common.deleted")}</option>
            </CustomSelect>
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <CustomButton mr={3} onClick={onClose} designType="outline">
            {t("common.cancel")}
          </CustomButton>
          <CustomButton
            onClick={
              mode === "create"
                ? handleCreatePermission
                : handleUpdatePermission
            }
          >
            {mode === "create" ? t("common.create") : t("common.update")}
          </CustomButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
