import React from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    Text,
    Flex,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

const EditConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
    const { t } = useTranslation();

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered motionPreset="scale">
            <ModalOverlay bg="rgba(0,0,0,0.45)" />
            <ModalContent rounded="2xl" p={2} bg="white" shadow="2xl">
                <ModalCloseButton />

                {/* Warning Icon */}
                <Flex justify="center" mt={6}>
                    <Flex
                        bg="orange.100"
                        w="70px"
                        h="70px"
                        rounded="full"
                        align="center"
                        justify="center"
                        border="2px solid #ed8936"
                    >
                        <Text fontSize="4xl">⚠️</Text>
                    </Flex>
                </Flex>

                <ModalHeader textAlign="center" mt={4} fontWeight="800" color="orange.600">
                    {t("editRecord")}
                </ModalHeader>

                <ModalBody pb={6}>
                    <Text
                        fontSize="lg"
                        textAlign="center"
                        color="gray.700"
                        px={4}
                        lineHeight="1.7"
                    >
                        {t("editWarningMessage")}
                    </Text>
                </ModalBody>

                <ModalFooter justifyContent="center" gap={4} pb={6}>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        rounded="full"
                        px={8}
                        size="lg"
                    >
                        {t("no")}
                    </Button>
                    <Button
                        colorScheme="orange"
                        onClick={onConfirm}
                        rounded="full"
                        px={8}
                        size="lg"
                    >
                        {t("yes")}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default EditConfirmationModal;
