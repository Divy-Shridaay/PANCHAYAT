import {
  FormControl,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
  VStack,
  Text,
  FormErrorMessage,
} from "@chakra-ui/react";
import {
  CustomButton,
  CustomFormLabel,
  CustomInput,
} from "component-library-iboon";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  fetchVillagerByAccountNo,
  fetchVillagerById,
} from "../../adapters/VillagerApiAdapter";
import { useVillage } from "../../ports/context/VillageContext";
import {
  createLandRevenue,
  fetchLandRevenueById,
  updateLandRevenue,
} from "../../adapters/LandRevenueApiAdapter";
import {
  createLocalFundRevenue,
  fetchLocalFundRevenueById,
  updateLocalFundRevenue,
} from "../../adapters/LocalFundRevenueApiAdapter";
import {
  createEducationCess,
  fetchEducationCessById,
  updateEducationCess,
} from "../../adapters/EducationRevenueApiAdapter";
import { useFinancialYear } from "../../ports/context/FinancialYearContext";
import { fetchLandMaangnu } from "../../adapters/LandMaangnuApiAdapter";

export default function LandRevenueCollectionModal({
  type,
  isOpen,
  onClose,
  villager,
  mode,
  id,
}) {
  const { t } = useTranslation();
  const { village } = useVillage();
  const { financialYear } = useFinancialYear();
  const toast = useToast();

  const [accountNo, setAccountNo] = useState(villager?.accountNumber || "");
  const [currentVillager, setCurrentVillager] = useState(villager || null);
  const [leftBehind, setLeftBehind] = useState("");
  const [pending, setPending] = useState("");
  const [rotating, setRotating] = useState("");
  const [billDate, setBillDate] = useState("");
  const [billNo, setBillNo] = useState("");
  const [errors, setErrors] = useState({});

  const searchVillager = async () => {
    if (!village) {
      toast({
        title: "Village not selected",
        description: "Please select a village",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }
    const response = await fetchVillagerByAccountNo(accountNo, village , financialYear);
    setCurrentVillager(response || null);


    if (id) return;

    if (type === "Land") {
      setLeftBehind(response.landMaangnu.left);
      setPending(response.landMaangnu.pending);
      setRotating(response.landMaangnu.rotating);
    } else if (type === "Local Fund") {
      setLeftBehind(response.localFundMaangnu.left);
      setPending(response.localFundMaangnu.pending );
      setRotating(response.localFundMaangnu.rotating);
    } else {
      setLeftBehind(response.educationCessMaangnu.left);
      setPending(response.educationCessMaangnu.pending);
      setRotating(response.educationCessMaangnu.rotating);
    }
  };

  const parseSafeFloat = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };

  const total =
    parseSafeFloat(leftBehind) +
    parseSafeFloat(pending) +
    parseSafeFloat(rotating);

  const isReadOnly = Boolean(villager || mode === "update");

  // === Revenue API Handlers ===
  const generateLandRevenue = async () => {
    const payload = {
      villager: currentVillager._id,
      left: leftBehind,
      pending,
      rotating,
      total,
      billDate,
      billNo,
      financialYear,
      village,
    };
    const response =
      mode === "create"
        ? await createLandRevenue(payload)
        : await updateLandRevenue(id, payload);
    if (response?.status) onClose();
  };

  const generateLocalFundRevenue = async () => {
    const payload = {
      villager: currentVillager._id,
      left: leftBehind,
      pending,
      rotating,
      total,
      billDate,
      billNo,
      financialYear,
      village,
    };
    const response =
      mode === "create"
        ? await createLocalFundRevenue(payload)
        : await updateLocalFundRevenue(id, payload);
    if (response?.status) onClose();
  };

  const generateEducationCess = async () => {
    const payload = {
      villager: currentVillager._id,
      left: leftBehind,
      pending,
      rotating,
      total,
      billDate,
      billNo,
      financialYear,
      village,
    };
    const response =
      mode === "create"
        ? await createEducationCess(payload)
        : await updateEducationCess(id, payload);
    if (response?.status) onClose();
  };

  // === Fetch record when editing ===
  useEffect(() => {
    const fetchRevenue = async () => {
      let response;
      if (type === "Land") response = await fetchLandRevenueById(id);
      else if (type === "Local Fund")
        response = await fetchLocalFundRevenueById(id);
      else response = await fetchEducationCessById(id);

      if (response?.data) {
        const villagerResponse = await fetchVillagerById(
          response.data.data.villager
        );
        setCurrentVillager(villagerResponse?.data);
        setLeftBehind(response.data.data.left);
        setPending(response.data.data.pending);
        setRotating(response.data.data.rotating);
        const date = new Date(response.data.data.billDate);
        setBillDate(date.toISOString().split("T")[0]);
        setBillNo(response.data.data.billNo);
      }
    };

    if (id) fetchRevenue();
  }, [id, type]);

  // === Validation & Submit ===
  const handleSubmit = () => {
    let newErrors = {};

    if (!billNo) newErrors.billNo = "Bill number is required";

    if (!billDate) {
      newErrors.billDate = "Bill date is required";
    } else {
      const year = new Date(billDate).getFullYear();
      if (!/^\d{4}$/.test(year.toString())) {
        newErrors.billDate = "Year must be 4 digits (e.g. 2025)";
      }
    }

    if (!currentVillager) {
      newErrors.accountNo = "Please select a valid villager";
    }

    // --- Number validation helper ---
    const validateNumber = (value, fieldName) => {
      if (!value && value != 0) {
        newErrors[fieldName] = `${fieldName} is required`;
      } else if (!/^\d+(\.\d{1,2})?$/.test(value)) {
        newErrors[
          fieldName
        ] = `${fieldName} must be a valid number with up to 2 decimals`;
      }
    };

    validateNumber(leftBehind, "leftBehind");
    validateNumber(pending, "pending");
    validateNumber(rotating, "rotating");

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    if (type === "Land") generateLandRevenue();
    else if (type === "Local Fund") generateLocalFundRevenue();
    else generateEducationCess();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={"4xl"}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader bgColor={"teal"} color={"white"}>
          {type === "Land"
            ? t("revenueCollectionModal.landTitle")
            : type === "Local Fund"
            ? t("revenueCollectionModal.localFundTitle")
            : t("revenueCollectionModal.educationCessTitle")}
        </ModalHeader>
        <ModalCloseButton color={"white"} />
        <ModalBody>
          <VStack align="stretch" spacing={6}>
            <HStack spacing={5} alignItems={"flex-end"}>
              <FormControl maxW={"40%"}>
                <CustomFormLabel>
                  {t("revenueCollectionModal.accountNumber")}
                </CustomFormLabel>
                <CustomInput
                  value={
                    isReadOnly
                      ? villager?.accountNo || currentVillager?.accountNo || ""
                      : accountNo
                  }
                  onChange={(e) => setAccountNo(e.target.value)}
                  isDisabled={isReadOnly}
                  readOnly={isReadOnly}
                />
              </FormControl>

              {(villager || currentVillager) && (
                <FormControl maxW={"40%"}>
                  <CustomFormLabel>
                    {t("revenueCollectionModal.accountName")}
                  </CustomFormLabel>
                  <CustomInput
                    value={currentVillager?.name || villager?.name || "N/A"}
                    readOnly
                  />
                </FormControl>
              )}

              {!isReadOnly && (
                <CustomButton onClick={searchVillager}>
                  {t("common.search")}
                </CustomButton>
              )}
            </HStack>

            {(currentVillager?.accountNo || villager?.accountNo) && (
              <HStack>
                <FormControl isInvalid={!!errors.billNo}>
                  <CustomFormLabel>
                    {t("revenueCollectionModal.billNo")}:
                  </CustomFormLabel>
                  <CustomInput
                    type="number"
                    value={billNo}
                    onChange={(e) => setBillNo(e.target.value)}
                    w={"50%"}
                  />
                  {errors.billNo && (
                    <FormErrorMessage>{errors.billNo}</FormErrorMessage>
                  )}
                </FormControl>

                <FormControl>
                  <CustomFormLabel>
                    {t("revenueCollectionModal.billDate")}:
                  </CustomFormLabel>
                  <CustomInput
                    type="date"
                    value={billDate}
                    onChange={(e) => setBillDate(e.target.value)}
                    w={"40%"}
                  />
                  {errors.billDate && (
                    <Text color="red.500" fontSize="sm">
                      {errors.billDate}
                    </Text>
                  )}
                </FormControl>
              </HStack>
            )}

            {(currentVillager?.accountNo || villager?.accountNo) && (
              <Table>
                <Thead>
                  <Tr>
                    <Th></Th>
                    <Th>{t("revenueCollectionModal.recovery")}</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>{t("revenueCollectionModal.leftBehind")}</Td>
                    <Td>
                      <FormControl isInvalid={!!errors.leftBehind}>
                        <CustomInput
                          type="number"
                          value={leftBehind}
                          onChange={(e) => setLeftBehind(e.target.value)}
                          placeholder="0.00"
                        />
                        {errors.leftBehind && (
                          <FormErrorMessage>
                            {errors.leftBehind}
                          </FormErrorMessage>
                        )}
                      </FormControl>
                    </Td>
                  </Tr>

                  <Tr>
                    <Td>{t("revenueCollectionModal.pending")}</Td>
                    <Td>
                      <FormControl isInvalid={!!errors.pending}>
                        <CustomInput
                          type="number"
                          value={pending}
                          onChange={(e) => setPending(e.target.value)}
                          placeholder="0.00"
                        />
                        {errors.pending && (
                          <FormErrorMessage>{errors.pending}</FormErrorMessage>
                        )}
                      </FormControl>
                    </Td>
                  </Tr>

                  <Tr>
                    <Td>{t("revenueCollectionModal.rotating")}</Td>
                    <Td>
                      <FormControl isInvalid={!!errors.rotating}>
                        <CustomInput
                          type="number"
                          value={rotating}
                          onChange={(e) => setRotating(e.target.value)}
                          placeholder="0.00"
                        />
                        {errors.rotating && (
                          <FormErrorMessage>{errors.rotating}</FormErrorMessage>
                        )}
                      </FormControl>
                    </Td>
                  </Tr>

                  <Tr>
                    <Td>{t("revenueCollectionModal.total")}</Td>
                    <Td>{total.toFixed(2)}</Td>
                  </Tr>
                </Tbody>
              </Table>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <CustomButton onClick={handleSubmit}>
            {t("revenueCollectionModal.save")}
          </CustomButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
