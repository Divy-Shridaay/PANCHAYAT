import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  HStack,
  FormControl,
  VStack,
} from "@chakra-ui/react";
import {
  CustomInput,
  CustomFormLabel,
  CustomButton,
} from "component-library-iboon";
import { useEffect, useState } from "react";
import {
  fetchFirstMaster,
  updateMaster,
} from "../../adapters/MasterApiAdapter";
import { useTranslation } from "react-i18next";
import { useUser } from "../../ports/context/UserContext";

export default function MasterModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const { user } = useUser();
  const [id, setId] = useState("");
  const [lSarkari, setLSarkari] = useState("");
  const [lSivay, setLSivay] = useState("");
  const [sSarkari, setSSarkari] = useState("");
  const [sSivay, setSSivay] = useState("");
  const [landRevenueBookLimit, setLandRevenueBookLimit] = useState(0);
  const [localFundRevenueBookLimit, setLocalFundRevenueBookLimit] = useState(0);
  const [educationRevenueBookLimit, setEducationRevenueBookLimit] = useState(0);

  const fetchMasterModal = async () => {
    const response = await fetchFirstMaster();
    if (response) {
      setId(response._id);
      setLSarkari(response.lSarkari);
      setLSivay(response.lSivay);
      setSSarkari(response.sSarkari);
      setSSivay(response.sSivay);
      setLandRevenueBookLimit(response.landRevenueBookLimit);
      setLocalFundRevenueBookLimit(response.localFundRevenueBookLimit);
      setEducationRevenueBookLimit(response.educationRevenueBookLimit);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchMasterModal();
    }, 0);
  }, []);

  const handleSave = async () => {
    const response = await updateMaster(id, {
      lSarkari,
      lSivay,
      sSarkari,
      sSivay,
      landRevenueBookLimit,
      localFundRevenueBookLimit,
      educationRevenueBookLimit,
    });
    if (response?.status) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t("master.title")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <CustomFormLabel>{t("master.localFund")}</CustomFormLabel>
          <HStack>
            <FormControl>
              <CustomFormLabel>{t("master.lSarkari")}</CustomFormLabel>
              <CustomInput
                value={lSarkari}
                onChange={(e) => setLSarkari(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <CustomFormLabel>{t("master.lSivay")}</CustomFormLabel>
              <CustomInput
                value={lSivay}
                onChange={(e) => setLSivay(e.target.value)}
              />
            </FormControl>
          </HStack>
          <CustomFormLabel mt={5}>{t("master.educationCess")}</CustomFormLabel>
          <HStack>
            <FormControl>
              <CustomFormLabel>{t("master.sSarkari")}</CustomFormLabel>
              <CustomInput
                value={sSarkari}
                onChange={(e) => setSSarkari(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <CustomFormLabel>{t("master.sSivay")}</CustomFormLabel>
              <CustomInput
                value={sSivay}
                onChange={(e) => setSSivay(e.target.value)}
              />
            </FormControl>
          </HStack>
          <VStack mt={5}>
            <FormControl>
              <CustomFormLabel>
                {t("master.landRevenueBookLimit")}
              </CustomFormLabel>
              <CustomInput
                type="number"
                value={landRevenueBookLimit}
                onChange={(e) => setLandRevenueBookLimit(e.target.value)}
              />
            </FormControl>

            <FormControl>
              <CustomFormLabel>
                {t("master.localFundBookLimit")}
              </CustomFormLabel>
              <CustomInput
                type="number"
                value={localFundRevenueBookLimit}
                onChange={(e) => setLocalFundRevenueBookLimit(e.target.value)}
              />
            </FormControl>

            <FormControl>
              <CustomFormLabel>
                {t("master.educationCessBookLimit")}
              </CustomFormLabel>
              <CustomInput
                type="number"
                value={educationRevenueBookLimit}
                onChange={(e) => setEducationRevenueBookLimit(e.target.value)}
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          {user?.role.permissions.includes("MASTER_UPDATE") && (
            <CustomButton onClick={handleSave}>{t("common.save")}</CustomButton>
          )}
          <CustomButton designType="outline" onClick={onClose} ml={3}>
            {t("common.cancel")}
          </CustomButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
