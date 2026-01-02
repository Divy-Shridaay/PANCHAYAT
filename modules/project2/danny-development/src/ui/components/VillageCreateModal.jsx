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
import { useTranslation } from "react-i18next";
import { fetchDistrictsPage } from "../../adapters/DistrictApiAdapter";
import { fetchTalukasPage } from "../../adapters/TalukaApiAdapter";
import {
  createNewVillage,
  fetchVillageById,
  updateExistingVillage,
} from "../../adapters/VillageApiAdapter";
import {
  CustomButton,
  CustomFormLabel,
  CustomInput,
  CustomSelect,
} from "component-library-iboon";

export default function VillageCreateModal({
  isOpen,
  onClose,
  mode = "create",
  id = null,
}) {
  const { t } = useTranslation();
  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);
  const [district, setDistrict] = useState("");
  const [taluka, setTaluka] = useState("");
  const [villageName, setVillageName] = useState("");
  const [status, setStatus] = useState("");

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

  useEffect(() => {
    const getTalukas = async () => {
      const response = await fetchTalukasPage(1, 1000, "", { district });
      if (response) {
        setTalukas(response.data.data);
      }
    };
    if (district) {
      getTalukas();
    }
  }, [district]);

  useEffect(() => {
    const getVillageById = async () => {
      if (mode === "update" && id) {
        const response = await fetchVillageById(id);
        if (response) {
          setVillageName(response.data.name);
          setStatus(response.data.status);
          setDistrict(response.data.district);
          setTaluka(response.data.taluka);
        }
      }
    };
    getVillageById();
  }, [mode, id]);

  const handleCreateVillage = async () => {
    const response = await createNewVillage({
      name: villageName,
      status,
      district,
      taluka,
    });
    if (response.status) {
      onClose();
    }
  };

  const handleUpdateVillage = async () => {
    const response = await updateExistingVillage(id, {
      name: villageName,
      status,
      district,
      taluka,
    });
    if (response.status) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t(`villageCreateModal.${mode}Title`)}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <CustomFormLabel>
              {t("villageCreateModal.district")}
            </CustomFormLabel>
            <CustomSelect
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            >
              <option value="">{t("villageCreateModal.selectDistrict")}</option>
              {districts.map((district) => (
                <option value={district._id} key={district._id}>
                  {district.name}
                </option>
              ))}
            </CustomSelect>
          </FormControl>
          <FormControl mt={4}>
            <CustomFormLabel>{t("talukas.name")}</CustomFormLabel>
            <CustomSelect
              value={taluka}
              onChange={(e) => setTaluka(e.target.value)}
            >
              <option value="">{t("villageCreateModal.selectTaluka")}</option>
              {talukas.map((taluka) => (
                <option value={taluka._id} key={taluka._id}>
                  {taluka.name}
                </option>
              ))}
            </CustomSelect>
          </FormControl>
          <FormControl mt={4}>
            <CustomFormLabel>{t("villageCreateModal.name")}</CustomFormLabel>
            <CustomInput
              value={villageName}
              placeholder={t("villageCreateModal.name")}
              onChange={(e) => setVillageName(e.target.value)}
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
            onClick={
              mode === "create" ? handleCreateVillage : handleUpdateVillage
            }
          >
            {t(`common.${mode}`)}
          </CustomButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
