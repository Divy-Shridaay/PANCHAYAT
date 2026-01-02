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
import { useVillage } from "../../ports/context/VillageContext";
import { useFinancialYear } from "../../ports/context/FinancialYearContext";
import { createNewReportsRemark, fetchReportsRemarkPage, updateExistingReportsRemark } from "../../adapters/ReportsRemarkApiAdepter";

export default function ReportsRemarksModal({
    type,
    isOpen,
    onClose,
}) {

    const { t } = useTranslation();
    const { village } = useVillage();
    const { financialYear } = useFinancialYear();
    const toast = useToast();

    const [remark, setRemark] = useState("");
    const [mode, setMode] = useState('create');
    const [id, setId] = useState('')
    const [errors, setErrors] = useState({});


    // === Revenue API Handlers ===
    const generateReportsRemarks = async () => {
        const payload = {
            financialYear,
            village,
            remark,
            type
        };
        const response =
            mode === "create"
                ? await createNewReportsRemark(payload)
                : await updateExistingReportsRemark(id, payload);
        if (response?.status) onClose();
    };



    // === Fetch record when editing ===
    useEffect(() => {
        const fetchRemark = async () => {
            const filter = {
                financialYear,
                village,
                type
            }
            let response;
            response = await fetchReportsRemarkPage(1, 1, "", "", filter, 1);
            let res = response?.data?.data[0];
            if (res) {
                setRemark(res?.remark)
                setId(res?._id)
                setMode('edit')
            } else {
                setRemark('')
                setId('')
                setMode('create')
            }
        };

        fetchRemark();
    }, [type]);

    // === Validation & Submit ===
    const handleSubmit = () => {
        let newErrors = {};




        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        generateReportsRemarks();

    };


    return (
        <Modal isOpen={isOpen} onClose={onClose} size={"4xl"}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader bgColor={"teal"} color={"white"}>
                    {type === "Land"
                        ? "Land Report's Remark"
                        : type === "Local Fund"
                            ? "Local Fund Report's Remark"
                            : "Education Report's Remark "
                    }
                </ModalHeader>
                <ModalCloseButton color={"white"} />
                <ModalBody>
                    <VStack align="stretch" spacing={6}>


                        <HStack>
                            <FormControl isInvalid={!!errors.remark}>
                                <CustomFormLabel>
                                    Remarks:
                                </CustomFormLabel>
                                <CustomInput
                                    type="text"
                                    value={remark}
                                    onChange={(e) => setRemark(e.target.value)}
                                    w={"100%"}
                                />
                                {errors.remark && (
                                    <FormErrorMessage  >
                                        {errors.remark}
                                    </FormErrorMessage>
                                )}
                            </FormControl>
                        </HStack>

                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <CustomButton onClick={handleSubmit}>
                        {/* {t("revenueCollectionModal.save")} */}
                        Save
                    </CustomButton>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
