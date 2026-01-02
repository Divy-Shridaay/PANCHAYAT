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
import { fetchLandMaagnuById, fetchLandMaangnu, updateLandMaangnu } from "../../adapters/LandMaangnuApiAdapter";

function LandMangnuModal({ type,
    isOpen,
    onClose,
    villager,
    mode,
    id }) {

    const { t } = useTranslation();
    const { village } = useVillage();
    const { financialYear } = useFinancialYear();
    const toast = useToast();
    const [accountNo, setAccountNo] = useState(villager?.accountNumber || "");
    const [currentVillager, setCurrentVillager] = useState(villager || null);
    const [leftBehind, setLeftBehind] = useState("");
    const [pending, setPending] = useState("");
    const [sarkari, setSarkari] = useState("");
    const [sivay, setSivay] = useState("");
    const [fajal, setFajal] = useState("");

    const [rotating, setRotating] = useState("");
    const [billDate, setBillDate] = useState("");
    const [billNo, setBillNo] = useState("");

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
        const response = await fetchVillagerByAccountNo(accountNo, village);
        if (response) {
            setCurrentVillager(response);
        } else {
            setCurrentVillager(null);
        }
    };

    // Helper to parse numbers safely
    const parseSafeFloat = (val) => {
        const num = parseFloat(val);
        return isNaN(num) ? 0 : num;
    };

    // Compute total using float-safe parsing
    const total =
        parseSafeFloat(leftBehind) +
        parseSafeFloat(sarkari) +
        parseSafeFloat(sivay) +
        parseSafeFloat(fajal);

    const isReadOnly = Boolean(villager || mode === "update"); // Flag to decide if props are driving the UI

    const generateLandRevenue = async () => {
        const response =
            // mode === "create"
            // ? await createLandRevenue({
            //     villager: currentVillager._id,
            //     left: leftBehind,
            //     pending,
            //     rotating,
            //     total,
            //     billDate,
            //     billNo,
            //     financialYear,
            // })
            // : 
            await updateLandMaangnu(id, {
                villager: currentVillager._id,
                left: leftBehind,
                sarkari, 
                sivay, 
                fajal,
                total,
                rotating:0,
                financialYear,
            });
        if (response?.status) {
            onClose();
        }
    };

    const generateLocalFundRevenue = async () => {
        const response =
            mode === "create"
                ? await createLocalFundRevenue({
                    villager: currentVillager._id,
                    left: leftBehind,
                    pending,
                    rotating,
                    total,
                    billDate,
                    billNo,
                    financialYear,
                })
                : await updateLocalFundRevenue(id, {
                    villager: currentVillager._id,
                    left: leftBehind,
                    pending,
                    rotating,
                    total,
                    billDate,
                    billNo,
                    financialYear,
                });
        if (response?.status) {
            onClose();
        }
    };

    const generateEducationCess = async () => {
        const response =
            mode === "create"
                ? await createEducationCess({
                    villager: currentVillager._id,
                    left: leftBehind,
                    pending,
                    rotating,
                    total,
                    billDate,
                    billNo,
                    financialYear,
                })
                : await updateEducationCess(id, {
                    villager: currentVillager._id,
                    left: leftBehind,
                    pending,
                    rotating,
                    total,
                    billDate,
                    billNo,
                    financialYear,
                });
        if (response?.status) {
            onClose();
        }
    };

    useEffect(() => {
        const fetchLandMaangnu = async () => {
            const response = await fetchLandMaagnuById(id);
            if (response.data) {
                const villagerResponse = await fetchVillagerById(
                    response?.data?.data?.villager
                );
         
                setCurrentVillager(villagerResponse?.data);
                setLeftBehind(response?.data?.data?.left);
                setPending(response?.data?.data?.pending);
                setRotating(response?.data?.data?.rotating);
                setSarkari(response?.data?.data?.sarkari);
                setSivay(response?.data?.data?.sivay);
                setFajal(response?.data?.data?.fajal);

            }
        };

        const fetchLocalFundRevenue = async () => {
            const response = await fetchLocalFundRevenueById(id);
            if (response.data) {
                const villagerResponse = await fetchVillagerById(
                    response?.data?.data?.villager
                );
          
                setCurrentVillager(villagerResponse?.data);
                setLeftBehind(response?.data?.data?.left);
                setPending(response?.data?.data?.pending);
                setRotating(response?.data?.data?.rotating);
                const date = new Date(response?.data?.data?.billDate);
                setBillDate(date.toISOString().split("T")[0]);
                setBillNo(response?.data?.data?.billNo);
            }
        };

        const fetchEducationRevenue = async () => {
            const response = await fetchEducationCessById(id);
            if (response.data) {
                const villagerResponse = await fetchVillagerById(
                    response?.data?.data?.villager
                );
       
                setCurrentVillager(villagerResponse?.data);
                setLeftBehind(response?.data?.data?.left);
                setPending(response?.data?.data?.pending);
                setRotating(response?.data?.data?.rotating);
                const date = new Date(response?.data?.data?.billDate);
                setBillDate(date.toISOString().split("T")[0]);
                setBillNo(response?.data?.data?.billNo);
            }
        };



        if (id) {
            type === "Land"
                ? fetchLandMaangnu()
                : type === "Local Fund"
                    ? fetchLocalFundRevenue()
                    : fetchEducationRevenue();
        }
    }, [id]);

    // useEffect(() => {
    //   if(mode === "create") {
    //     const fetchLatestBillNo = async() => {
    //       const response = await fetchLatestLandBillNo();
    //       if(response.data) {

    //         setBillNo(response?.data?.data);
    //       }
    //     }
    //     fetchLatestBillNo();
    //   }
    // },[])
    return (
        <Modal isOpen={isOpen} onClose={onClose} size={"4xl"}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader bgColor={"teal"} color={"white"}>
                    {type === "Land"
                        ? t("manganuModal.landTitle")
                        : type === "Local Fund"
                            ? t("manganuModal.localFundTitle")
                            : t("manganuModal.educationCessTitle")}
                </ModalHeader>
                <ModalCloseButton color={"white"} />
                <ModalBody>
                    <VStack align="stretch" spacing={6}>
                        <HStack spacing={5} alignItems={"flex-end"}>
                            <FormControl maxW={"40%"}>
                                <CustomFormLabel>
                                    {t("manganuModal.accountNumber")}
                                </CustomFormLabel>

                                {isReadOnly ? (
                                    <CustomInput
                                        value={
                                            villager?.accountNo || currentVillager?.accountNo || ""
                                        }
                                        readOnly
                                    />
                                ) : (
                                    <CustomInput
                                        value={accountNo}
                                        onChange={(e) => setAccountNo(e.target.value)}
                                        isDisabled={isReadOnly}
                                    />
                                )}
                            </FormControl>

                            {(villager || currentVillager) && (
                                <FormControl maxW={"40%"}>
                                    <CustomFormLabel>
                                        {t("manganuModal.accountName")}
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

                        {/* {(currentVillager?.accountNo || villager?.accountNo) && (
                            <HStack>
                                <FormControl>
                                    <CustomFormLabel>
                                        {t("manganuModal.billNo")}:
                                    </CustomFormLabel>
                                    <CustomInput
                                        type="number"
                                        value={billNo}
                                        onChange={(e) => setBillNo(e.target.value)}
                                        // placeholder="Enter Bill No."
                                        w={"50%"}
                                    />
                                </FormControl>
                                <FormControl>
                                    <CustomFormLabel>
                                        {t("manganuModal.billDate")}:
                                    </CustomFormLabel>
                                    <CustomInput
                                        type="date"
                                        value={billDate}
                                        onChange={(e) => setBillDate(e.target.value)}
                                        placeholder="MM/DD/YYYY"
                                        w={"50%"}
                                    />
                                </FormControl>


                            </HStack>
                        )} */}

                        {(currentVillager?.accountNo || villager?.accountNo) && (
                            <Table>
                                <Thead>
                                    <Tr>
                                        <Th></Th>
                                        <Th>{t("manganuModal.recovery")}</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    <Tr>
                                        <Td>{t("manganuModal.leftBehind")}</Td>
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
                                        {/* <Td>{t("manganuModal.pending")}</Td>
                                        <Td>
                                            <CustomInput
                                                type="number"
                                                value={pending}
                                                onChange={(e) => setPending(e.target.value)}
                                                placeholder="0.00"
                                            />
                                        </Td> */}
                                        <Td>{t("manganuModal.sarkari")}</Td>
                                        <Td>
                                            <CustomInput
                                                type="number"
                                                value={sarkari}
                                                onChange={(e) => setSarkari(e.target.value)}
                                                placeholder="0.00"
                                            />
                                        </Td>
                                    </Tr>
                                    <Tr>
                                        <Td>{t("manganuModal.sivay")}</Td>
                                        <Td>
                                            <CustomInput
                                                type="number"
                                                value={sivay}
                                                onChange={(e) => setSivay(e.target.value)}
                                                placeholder="0.00"
                                            />
                                        </Td>
                                    </Tr>
                                    <Tr>
                                        <Td>{t("manganuModal.fajal")}</Td>
                                        <Td>
                                            <CustomInput
                                                type="number"
                                                value={fajal}
                                                onChange={(e) => setFajal(e.target.value)}
                                                placeholder="0.00"
                                            />
                                        </Td>
                                    </Tr>
                                    <Tr>
                                        <Td>{t("manganuModal.total")}</Td>
                                        <Td>{total.toFixed(2)}</Td>
                                    </Tr>
                                </Tbody>
                            </Table>
                        )}
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <CustomButton
                        onClick={
                            type === "Land"
                                ? generateLandRevenue
                                : type === "Local Fund"
                                    ? generateLocalFundRevenue
                                    : generateEducationCess
                        }
                    >
                        {t("manganuModal.save")}
                    </CustomButton>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

export default LandMangnuModal