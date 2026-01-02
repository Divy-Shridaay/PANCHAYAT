import React, { useState, useEffect } from "react";
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
import { useTranslation } from "react-i18next";
import { fetchDistrictsPage } from "../../adapters/DistrictApiAdapter";
import {
  createTaluka,
  fetchTalukaById,
  updateTaluka,
} from "../../adapters/TalukaApiAdapter";

export default function TalukaCreateModal({
  isOpen,
  onClose,
  mode = "create",
  id = null,
}) {
  const { t } = useTranslation();
  const [districts, setDistricts] = useState([]);
  const [talukaName, setTalukaName] = useState("");
  const [status, setStatus] = useState("");
  const [district, setDistrict] = useState("");

  useEffect(() => {
    const getDistricts = async () => {
      const response = await fetchDistrictsPage(1, 1000);
      if (response) {
        setDistricts(response.data.data);
      }
    };

    setTimeout(() => {
      getDistricts();
    }, 0);
  }, []);

  const handleCreateTaluka = async () => {
    const response = await createTaluka({ name: talukaName, status, district });
    if (response.status) {
      onClose();
    }
  };

  const handleUpdateTaluka = async () => {
    const response = await updateTaluka(id, {
      name: talukaName,
      status,
      district,
    });
   
    if (response.status) {
      onClose();
    }
  };

  useEffect(() => {
    const getTalukaById = async () => {
      const response = await fetchTalukaById(id);
      if (response) {
        setTalukaName(response.data.name);
        setStatus(response.data.status);
        setDistrict(response.data.district);
      }
    };
    if (mode === "update" && id) {
      getTalukaById();
    }
  }, [mode, id]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t(`talukaCreateModal.${mode}Title`)}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <CustomFormLabel>{t("talukaCreateModal.district")}</CustomFormLabel>
            <CustomSelect
              onChange={(e) => setDistrict(e.target.value)}
              value={district}
            >
              <option value="">{t("talukaCreateModal.selectDistrict")}</option>
              {districts.map((district) => (
                <option key={district._id} value={district._id}>
                  {district.name}
                </option>
              ))}
            </CustomSelect>
          </FormControl>
          <FormControl>
            <CustomFormLabel>{t("talukaCreateModal.name")}</CustomFormLabel>
            <CustomInput
              value={talukaName}
              onChange={(e) => setTalukaName(e.target.value)}
              placeholder={t("talukaCreateModal.name")}
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
          {mode === "create" ? (
            <CustomButton onClick={handleCreateTaluka}>
              {t("common.create")}
            </CustomButton>
          ) : (
            <CustomButton onClick={handleUpdateTaluka}>
              {t("common.update")}
            </CustomButton>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
