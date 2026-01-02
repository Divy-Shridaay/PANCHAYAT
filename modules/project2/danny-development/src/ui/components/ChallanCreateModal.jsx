import {
  FormControl,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";
import {
  CustomButton,
  CustomFormLabel,
  CustomInput,
} from "component-library-iboon";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  createChallan,
  fetchChallanById,
  updateChallan,
} from "../../adapters/ChallanApiAdapter";
import { useFinancialYear } from "../../ports/context/FinancialYearContext";
import { useVillage } from "../../ports/context/VillageContext";

export default function ChallanCreateModal({
  type,
  isOpen,
  onClose,
  mode = "create",
  id = null,
}) {
  const { t } = useTranslation();
  const { village } = useVillage();
  const { financialYear } = useFinancialYear();
  const [leftBehind, setLeftBehind] = useState("");
  const [pending, setPending] = useState("");
  const [rotating, setRotating] = useState("");
  const [date, setDate] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [challanNo, setChallanNo] = useState("");

  // Helper to parse numbers safely
  const parseSafeFloat = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };

  // Compute total using float-safe parsing
  const total =
    parseSafeFloat(leftBehind) +
    parseSafeFloat(pending) +
    parseSafeFloat(rotating);

  const generateChallan = async () => {
    const response = await createChallan({
      date,
      from,
      to,
      left: leftBehind,
      pending,
      rotating,
      total,
      type,
      challanNo,
      financialYear,
      village
    });
    if (response?.status) {
      onClose();
    }
  };

  const modifyChallan = async () => {
    const response = await updateChallan(id, {
      date,
      from,
      to,
      left: leftBehind,
      pending,
      rotating,
      total,
      type,
      challanNo,
      village
    });

    if (response?.status) {
      onClose();
    }
  };

  useEffect(() => {
    const getChallanById = async () => {
      if (mode === "update" && id) {
        const response = await fetchChallanById(id);
        if (response) {
          setChallanNo(response.data.challanNo);
          setDate(new Date(response.data.date)?.toISOString().split("T")[0]);
          setFrom(response.data.from);
          setTo(response.data.to);
          setLeftBehind(response.data.left);
          setPending(response.data.pending);
          setRotating(response.data.rotating);
        }
      }
    };

    setTimeout(() => {
      getChallanById();
    }, 0);
  }, [mode, id]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={"4xl"}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader bgColor={"teal"} color={"white"}>
          {mode === "create"
            ? type === "Land"
              ? t("challan.generateLandChallan")
              : type === "Local Fund"
              ? t("challan.generateLocalFundChallan")
              : t("challan.generateEducationChallan")
            : type === "Land"
            ? t("challan.updateLandChallan")
            : type === "Local Fund"
            ? t("challan.updateLocalFundChallan")
            : t("challan.updateEducationChallan")}
        </ModalHeader>
        <ModalCloseButton color={"white"} />
        <ModalBody>
          <VStack w={"100%"} spacing={4}>
            <SimpleGrid columns={[2, 2, 3]} spacing={4} w={"100%"}>
         
                <FormControl>
                  <CustomFormLabel>{t("challan.challanNo")}</CustomFormLabel>
                  <CustomInput
                    type="text"
                    value={challanNo}
                    readOnly={mode === "update"}
                    onChange={(e) => setChallanNo(e.target.value)}
                  />
                </FormControl>
          
              <FormControl>
                <CustomFormLabel>{t("challan.date")}</CustomFormLabel>
                <CustomInput
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="dd/mm/yyyy"
                />
              </FormControl>
              <FormControl>
                <CustomFormLabel>{t("challan.from")}</CustomFormLabel>
                <CustomInput
                  type="text"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </FormControl>
              {/* <FormControl>
                <CustomFormLabel>{t("challan.to")}</CustomFormLabel>
                <CustomInput
                  type="text"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </FormControl> */}
            </SimpleGrid>
          </VStack>
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
                  <CustomInput
                    type="number"
                    value={leftBehind}
                    onChange={(e) => setLeftBehind(e.target.value)}
                    placeholder="0.00"
                  />
                </Td>
              </Tr>
              <Tr>
                <Td>{t("revenueCollectionModal.pending")}</Td>
                <Td>
                  <CustomInput
                    type="number"
                    value={pending}
                    onChange={(e) => setPending(e.target.value)}
                    placeholder="0.00"
                  />
                </Td>
              </Tr>
              <Tr>
                <Td>{t("revenueCollectionModal.rotating")}</Td>
                <Td>
                  <CustomInput
                    type="number"
                    value={rotating}
                    onChange={(e) => setRotating(e.target.value)}
                    placeholder="0.00"
                  />
                </Td>
              </Tr>
              <Tr>
                <Td>{t("revenueCollectionModal.total")}</Td>
                <Td>{total.toFixed(2)}</Td>
              </Tr>
            </Tbody>
          </Table>
        </ModalBody>

        <ModalFooter>
          <CustomButton
            onClick={mode === "create" ? generateChallan : modifyChallan}
          >
            {t("common.save")}
          </CustomButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
