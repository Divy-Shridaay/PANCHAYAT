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
  CustomFormLabel,
  CustomInput,
  CustomSelect,
  CustomButton,
} from "component-library-iboon";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  createNewDistrict,
  fetchDistrictById,
  updateExistingDistrict,
} from "../../adapters/DistrictApiAdapter";

export default function DistrictCreateModal({
  isOpen,
  onClose,
  mode = "create",
  id = null,
}) {
  const { t } = useTranslation();
  const [districtName, setDistrictName] = useState("");
  const [status, setStatus] = useState("");

  const handleCreateDistrict = async () => {
    const response = await createNewDistrict({
      name: districtName,
      status,
    });
    if (response?.status) {
      onClose();
    }
  };

  const handleUpdateDistrict = async () => {
    const response = await updateExistingDistrict(id, {
      name: districtName,
      status,
    });
    if (response?.status) {
      onClose();
    }
  };

  useEffect(() => {
    const getDistrictById = async () => {
      const response = await fetchDistrictById(id);
      if (response) {
        setDistrictName(response.data.name);
        setStatus(response.data.status);
      }
    };

    if (mode === "update" && id) {
      getDistrictById();
    }
  }, [mode, id]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {mode === "update"
            ? t("districtCreateModal.updateTitle")
            : t("districtCreateModal.createTitle")}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <CustomFormLabel>{t("districtCreateModal.name")}</CustomFormLabel>
            <CustomInput
              value={districtName}
              onChange={(e) => setDistrictName(e.target.value)}
              placeholder={t("districtCreateModal.name")}
            />
          </FormControl>
          <FormControl mt={4}>
            <CustomFormLabel>{t("common.status")}</CustomFormLabel>
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
            variant="solid"
            onClick={
              mode === "update" ? handleUpdateDistrict : handleCreateDistrict
            }
          >
            {mode === "update" ? t("common.update") : t("common.create")}
          </CustomButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
