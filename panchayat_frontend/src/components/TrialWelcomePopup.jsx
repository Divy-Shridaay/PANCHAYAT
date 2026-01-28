"use client";

import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Text,
    VStack,
    Box,
    Icon,
} from "@chakra-ui/react";
import { FiGift } from "react-icons/fi";

export default function TrialWelcomePopup({ isOpen, onClose }) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
            <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
            <ModalContent borderRadius="2xl" shadow="2xl">
                <ModalHeader textAlign="center" pt={8} pb={0}>
                    <VStack spacing={3}>
                        <Box
                            bg="blue.50"
                            p={3}
                            rounded="full"
                        >
                            <Icon as={FiGift} w={8} h={8} color="blue.500" />
                        </Box>
                    </VStack>
                </ModalHeader>
                <ModalBody py={8}>
                    <VStack spacing={4} textAlign="center">
                        <Text fontSize="lg" color="gray.700" fontWeight="600" lineHeight="tall">
                            7 દિવસનો ટ્રાયલ પિરિયડ શરૂ થયો છે!<br />
                            ટ્રાયલ દરમિયાન તમે વધુમાં વધુ 5 પેઢીનામું ઉમેરી શકો છો.<br />
                            ટ્રાયલ પૂર્ણ થયા પછી સબ્સ્ક્રિપ્શન જરૂરી રહેશે.
                        </Text>
                    </VStack>
                </ModalBody>
                <ModalFooter justifyContent="center" pb={8}>
                    <Button
                        colorScheme="blue"
                        onClick={onClose}
                        size="lg"
                        px={10}
                        borderRadius="xl"
                        fontWeight="bold"
                        _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                        transition="0.2s"
                    >
                        ઠીક છે
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
