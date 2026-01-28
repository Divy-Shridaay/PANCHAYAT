"use client";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Text,
  VStack,
  Box,
  HStack,
  useToast
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export default function PaymentPopup({ isOpen, onClose, type }) {
  const toast = useToast();
  const navigate = useNavigate();

  const handlePayKaro = () => {
    onClose();
    navigate("/payment");
  };

  const handleAtyareNai = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("user");
    onClose();
    navigate("/login");
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { }} size="md" isCentered closeOnOverlayClick={false}>
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(5px)" />
      <ModalContent borderRadius="2xl">
        <ModalHeader color="red.600" textAlign="center" pt={8}>
          {type === "module" ? "ટ્રાયલ પિરિયડ સમાપ્ત" : "પ્રિન્ટ મર્યાદા સમાપ્ત"}
        </ModalHeader>
        <ModalBody pb={8} px={8}>
          <VStack spacing={6} align="center">
            <Box textAlign="center">
              <Text fontSize="lg" color="gray.700" fontWeight="600" lineHeight="tall">
                તમારો 7 દિવસનો ટ્રાયલ પૂર્ણ થયો છે<br />
                એપનો ઉપયોગ ચાલુ રાખવા માટે કૃપા કરીને સબ્સ્ક્રિપ્શન લો.
              </Text>
            </Box>

            <VStack spacing={3} w="full">
              <Button
                colorScheme="green"
                onClick={handlePayKaro}
                w="full"
                size="lg"
                borderRadius="xl"
                fontWeight="bold"
              >
                પેમેન્ટ કરો
              </Button>
              <Button
                variant="outline"
                colorScheme="red"
                onClick={handleAtyareNai}
                w="full"
                size="lg"
                borderRadius="xl"
                fontWeight="500"
              >
                અત્યારે નહીં
              </Button>
            </VStack>

            <Text fontSize="xs" color="gray.400" textAlign="center">
              * અત્યારે નહીં પર ક્લિક કરવાથી તમે લોગઆઉટ થઈ જશો.
            </Text>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
