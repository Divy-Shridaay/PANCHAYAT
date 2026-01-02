import React, { useEffect, useState } from "react";
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
import { useTranslation } from "react-i18next";
import {
  createNewVillager,
  fetchVillagerById,
  updateExistingVillager,
} from "../../adapters/VillagerApiAdapter";
import { useVillage } from "../../ports/context/VillageContext";

export default function VillagerCreateModal({
  isOpen,
  onClose,
  mode = "create",
  id = null,
}) {
  const { t } = useTranslation();
  const { village } = useVillage([]);
  const [name, setName] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [sarkari, setSarkari] = useState("");
  const [sivay, setSivay] = useState("");

  useEffect(() => {
    if (mode === "update" && id) {
      const getVillagerById = async () => {
        const response = await fetchVillagerById(id);
        if (response) {
          setName(response.data.name);
          setAccountNo(response.data.accountNo);
          setStatus(response.data.status);
          setDate(response.data.date);
          setSarkari(response.data.sarkari);
          setSivay(response.data.sivay);
        }
      };
      getVillagerById();
    }
  }, [mode, id]);

  const handleCreateVillager = async () => {
    const response = await createNewVillager({
      name,
      village,
      status,
      accountNo,
      date,
      sarkari,
      sivay,
    });
    if (response.status) {
      onClose();
    }
  };

  const handleUpdateVillager = async () => {
    const response = await updateExistingVillager(id, {
      name,
      village,
      status,
      accountNo,
      date,
      sarkari,
      sivay,
    });
    if (response.status) {
      onClose();
    }
  };

  const handleSaveVillager = async () => {
    if (mode === "create") {
      await handleCreateVillager();
    } else if (mode === "update" && id) {
      await handleUpdateVillager();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t(`villagerCreateModal.${mode}Title`)}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <CustomFormLabel>
              {t("villagerCreateModal.accountNo")}
            </CustomFormLabel>
            <CustomInput
              value={accountNo}
              onChange={(e) => setAccountNo(e.target.value)}
              placeholder={t("villagerCreateModal.accountNo")}
            />
          </FormControl>
          <FormControl>
            <CustomFormLabel>{t("villagerCreateModal.name")}</CustomFormLabel>
            <CustomInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("villagerCreateModal.name")}
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
          <FormControl mt={4}>
            <CustomFormLabel>{t("villagerCreateModal.date")}</CustomFormLabel>
            <CustomInput
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder={t("villagerCreateModal.date")}
            />
          </FormControl>
          <FormControl mt={4}>
            <CustomFormLabel>
              {t("villagerCreateModal.sarkari")}
            </CustomFormLabel>
            <CustomInput
              value={sarkari}
              onChange={(e) => setSarkari(e.target.value)}
              placeholder={t("villagerCreateModal.sarkari")}
            />
          </FormControl>
          <FormControl mt={4}>
            <CustomFormLabel>
              {t("villagerCreateModal.sivay")}
            </CustomFormLabel>
            <CustomInput
              value={sivay}
              onChange={(e) => setSivay(e.target.value)}
              placeholder={t("villagerCreateModal.sivay")}
            />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <CustomButton mr={3} onClick={onClose} designType="outline">
            {t("common.cancel")}
          </CustomButton>
          <CustomButton variant="solid" onClick={handleSaveVillager}>
            {t(`common.${mode}`)}
          </CustomButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

