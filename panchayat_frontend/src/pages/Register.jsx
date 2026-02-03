"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import { apiFetch } from "../utils/api.js";
import logo from "../assets/logo.png";

import {
  Box,
  Button,
  Input,
  Heading,
  VStack,
  HStack,
  Text,
  FormControl,
  FormLabel,
  Select,
  Flex,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";

import { FaUser } from "react-icons/fa";

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Step 1: Registration form
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "male",
    dob: "",
    email: "",
    phone: "",
    pinCode: "",
    taluko: "",
    gam: "",
    jillo: "",
  });

  // Step 2: OTP verification
  const [otp, setOtp] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Form, 2: OTP

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Send OTP
  const handleSendOTP = async () => {
    // Validate form
    if (
      !formData.firstName ||

      !formData.email ||
      !formData.phone ||
      !formData.pinCode ||
      !formData.taluko ||
      !formData.gam ||
      !formData.jillo
    ) {
      toast({
        title: "ત્રુટિ",
        description: "જરૂરી ફીલ્ડ ભરો",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "ત્રુટિ",
        description: "યોગ્ય ઇમેઇલ દાખલ કરો",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setLoading(true);
    try {
      const { response, data } = await apiFetch(
        "/api/register/send-otp",
        {
          method: "POST",
          body: JSON.stringify(formData),
        },
        navigate,
        toast
      );

      if (response.ok) {
        toast({
          title: "સફળતા",
          description: "OTP તમારા ઇમેઇલ પર મોકલવામાં આવી ગયો છે",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
        setCurrentEmail(formData.email);
        setStep(2);
        onOpen();
      } else {
        toast({
          title: "ત્રુટિ",
          description: data.message || "OTP મોકલવામાં નિષ્ફળતા",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      }
    } catch (err) {
      toast({
        title: "ત્રુટિ",
        description: "કાંઈક ખોટું થયું",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
    setLoading(false);
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp) {
      toast({
        title: "ત્રુટિ",
        description: "OTP દાખલ કરો",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setLoading(true);
    try {
      const { response, data } = await apiFetch(
        "/api/register/verify-otp",
        {
          method: "POST",
          body: JSON.stringify({
            email: currentEmail,
            otp: otp,
          }),
        },
        navigate,
        toast
      );

      if (response.ok) {
        toast({
          title: "સફળતા",
          description: "એકાઉન્ટ સફળતાપૂર્વક બનાવાયો!",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });

        // Show credentials
        alert(`
તમારો એકાઉન્ટ સફળતાપૂર્વક બનાવાયો છે!

Username અને Password તમારા ઇમેઇલ પર મોકલવામાં આવ્યા છે.

કૃપા કરીને તમારો ઈમેઇલ ચકાસો.
        `);

        // Reset and redirect
        setFormData({
          firstName: "",
          middleName: "",
          lastName: "",
          gender: "male",
          dob: "",
          email: "",
          phone: "",
          pinCode: "",
          taluko: "",
          gam: "",
          jillo: "",
        });
        setOtp("");
        setStep(1);
        onClose();
        localStorage.setItem("showTrialWelcome", "true");

        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        toast({
          title: "ત્રુટિ",
          description: data.message || "OTP ચકાસણું નિષ્ફળ રહ્યું",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      }
    } catch (err) {
      toast({
        title: "ત્રુટિ",
        description: "કાંઈક ખોટું થયું",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
    setLoading(false);
  };

  return (
    <Flex bg="#F8FAF9" minH="100vh" align="center" justify="center" p={4}>
      <Box
        bg="white"
        p={10}
        rounded="2xl"
        shadow="lg"
        border="1px solid #E3EDE8"
        width="100%"
        maxW="600px"
      >
        <VStack spacing={8}>
          {/* Header */}
          <VStack spacing={2} textAlign="center">
            <Box mb={2}>
              <img src={logo} alt="Logo" style={{ width: "200px", height: "auto" }} />
            </Box>
            <Heading size="lg" color="#1e293b">
              પંચાયત ડેશબોર્ડ - નોંધણી
            </Heading>
            <Text color="#64748b" fontSize="sm">
              નવું ખાતું બનાવવા માટે વિગતો દાખલ કરો
            </Text>
          </VStack>

          <Divider />

          {/* Registration Form */}
          <VStack spacing={4} width="100%">
            {/* Row 1: Name */}
            <HStack spacing={3} width="100%">
              <FormControl>
                <FormLabel color="#475569" fontSize="sm" fontWeight="600">
                  નામ
                </FormLabel>

                <Input
                  placeholder=""
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  bg="#f8fafc"
                  border="1px solid #cbd5e1"
                  _focus={{ borderColor: "#059669", bg: "white" }}
                  fontSize="sm"
                />
              </FormControl>

              {/* <FormControl>
                <FormLabel color="#475569" fontSize="sm" fontWeight="600">
                  મધ્ય નામ
                </FormLabel>

                <Input
                  placeholder=""
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleInputChange}
                  bg="#f8fafc"
                  border="1px solid #cbd5e1"
                  _focus={{ borderColor: "#059669", bg: "white" }}
                  fontSize="sm"
                />
              </FormControl> */}
            </HStack>

            {/* Row 2: Last Name */}
            <FormControl>
              <FormLabel color="#475569" fontSize="sm" fontWeight="600">
                અંતિમ નામ
              </FormLabel>

              <Input
                placeholder=""
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                bg="#f8fafc"
                border="1px solid #cbd5e1"
                _focus={{ borderColor: "#2563eb", bg: "white" }}
                fontSize="sm"
              />
            </FormControl>

            {/* Row 3: Gender & DOB */}
            <HStack spacing={3} width="100%">
              <FormControl>
                <FormLabel color="#475569" fontSize="sm" fontWeight="600">
                  જાતિ
                </FormLabel>

                <Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  bg="#f8fafc"
                  border="1px solid #cbd5e1"
                  _focus={{ borderColor: "#059669", bg: "white" }}
                  fontSize="sm"
                >
                  <option value="male">પુરુષ</option>
                  <option value="female">મહિલા</option>
                  <option value="other">અન્ય</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel color="#475569" fontSize="sm" fontWeight="600">
                  જન્મતારીખ
                </FormLabel>

                <Input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  max={new Date().toISOString().split("T")[0]} // 🔒 future date block
                  onChange={handleInputChange}
                  bg="#f8fafc"
                  border="1px solid #cbd5e1"
                  _focus={{ borderColor: "#059669", bg: "white" }}
                  fontSize="sm"
                />

              </FormControl>
            </HStack>

            {/* Row 4: Email */}
            <FormControl>
              <FormLabel color="#475569" fontSize="sm" fontWeight="600">
                ઈમેલ <Text as="span" color="red.500">*</Text>
              </FormLabel>

              <Input
                type="email"
                placeholder="example@email.com"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                bg="#f8fafc"
                border="1px solid #cbd5e1"
                _focus={{ borderColor: "#2563eb", bg: "white" }}
                fontSize="sm"
              />
            </FormControl>

            {/* Row 5: Phone */}
            <FormControl>
              <FormLabel color="#475569" fontSize="sm" fontWeight="600">
                મોબાઇલ નંબર <Text as="span" color="red.500">*</Text>
              </FormLabel>

              <Input
                type="tel"
                placeholder="9876543210"
                name="phone"
                value={formData.phone}
                maxLength={10}
                inputMode="numeric"
                pattern="[0-9]*"
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ""); // sirf digits
                  if (value.length <= 10) {
                    setFormData((prev) => ({
                      ...prev,
                      phone: value,
                    }));
                  }
                }}
                bg="#f8fafc"
                border="1px solid #cbd5e1"
                _focus={{ borderColor: "#2563eb", bg: "white" }}
                fontSize="sm"
              />

            </FormControl>

            {/* Row 6: Pin Code & Taluko */}
            <HStack spacing={3} width="100%">

              <FormControl>
                <FormLabel color="#475569" fontSize="sm" fontWeight="600">
                  જિલ્લો <Text as="span" color="red.500">*</Text>
                </FormLabel>

                <Input
                  placeholder="જિલ્લાનું નામ"
                  name="jillo"
                  value={formData.jillo}
                  onChange={handleInputChange}
                  bg="#f8fafc"
                  border="1px solid #cbd5e1"
                  _focus={{ borderColor: "#059669", bg: "white" }}
                  fontSize="sm"
                />
              </FormControl>

              {/* <FormControl>
                <FormLabel color="#475569" fontSize="sm" fontWeight="600">
                  પિન કોડ *
                </FormLabel>

                <Input
                  placeholder="380001"
                  name="pinCode"
                  value={formData.pinCode}
                  onChange={handleInputChange}
                  bg="#f8fafc"
                  border="1px solid #cbd5e1"
                  _focus={{ borderColor: "#059669", bg: "white" }}
                  fontSize="sm"
                />
              </FormControl> */}

              <FormControl>
                <FormLabel color="#475569" fontSize="sm" fontWeight="600">
                  તાલુકો <Text as="span" color="red.500">*</Text>
                </FormLabel>

                <Input
                  placeholder="અમદાવાદ "
                  name="taluko"
                  value={formData.taluko}
                  onChange={handleInputChange}
                  bg="#f8fafc"
                  border="1px solid #cbd5e1"
                  _focus={{ borderColor: "#059669", bg: "white" }}
                  fontSize="sm"
                />
              </FormControl>
            </HStack>

            {/* Row 7: Gam & Jillo */}
            <HStack spacing={3} width="100%">
              <FormControl>
                <FormLabel color="#475569" fontSize="sm" fontWeight="600">
                  ગામ <Text as="span" color="red.500">*</Text>
                </FormLabel>

                <Input
                  placeholder="ગામનું નામ"
                  name="gam"
                  value={formData.gam}
                  onChange={handleInputChange}
                  bg="#f8fafc"
                  border="1px solid #cbd5e1"
                  _focus={{ borderColor: "#059669", bg: "white" }}
                  fontSize="sm"
                />
              </FormControl>

              {/* <FormControl>
                <FormLabel color="#475569" fontSize="sm" fontWeight="600">
                  જિલ્લો *
                </FormLabel>

                <Input
                  placeholder="જિલ્લાનું નામ"
                  name="jillo"
                  value={formData.jillo}
                  onChange={handleInputChange}
                  bg="#f8fafc"
                  border="1px solid #cbd5e1"
                  _focus={{ borderColor: "#059669", bg: "white" }}
                  fontSize="sm"
                />
              </FormControl> */}

              <FormControl>
                <FormLabel color="#475569" fontSize="sm" fontWeight="600">
                  પિન કોડ <Text as="span" color="red.500">*</Text>
                </FormLabel>

                <Input
                  type="text"
                  placeholder="380001"
                  name="pinCode"
                  value={formData.pinCode}
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ""); // sirf digits
                    if (value.length <= 6) {
                      setFormData((prev) => ({
                        ...prev,
                        pinCode: value,
                      }));
                    }
                  }}
                  bg="#f8fafc"
                  border="1px solid #cbd5e1"
                  _focus={{ borderColor: "#059669", bg: "white" }}
                  fontSize="sm"
                />

              </FormControl>

            </HStack>

            <Divider my={2} />

            {/* Submit Button */}
            <Button
              width="100%"
              bg="#059669"
              color="white"
              _hover={{ bg: "#047857" }}
              fontSize="sm"
              fontWeight="600"
              py={6}
              isLoading={loading}
              onClick={handleSendOTP}
            >
              નોંધણી કરો
            </Button>

            {/* Login Link */}
            <HStack spacing={2} justify="center" width="100%">
              <Text color="#64748b" fontSize="sm">
                પહેલેથી એકાઉન્ટ છે?
              </Text>

              <Text
                as="button"
                color="#059669"
                fontWeight="600"
                cursor="pointer"
                onClick={() => navigate("/login")}
                _hover={{ textDecoration: "underline" }}
              >
                અહીં લોગિન કરો
              </Text>
            </HStack>
          </VStack>
        </VStack>
      </Box>

      {/* OTP Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color="#1e293b">OTP ચકાસણી</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Text color="#475569" fontSize="sm">
                {currentEmail} પર મોકલેલ OTP દાખલ કરો
              </Text>

              <Input
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength="6"
                textAlign="center"
                fontSize="lg"
                fontWeight="bold"
                letterSpacing="4px"
                bg="#f8fafc"
                border="2px solid #cbd5e1"
                _focus={{ borderColor: "#2563eb", bg: "white" }}
              />
              <Text fontSize="xs" color="#94a3b8">
                OTP 10 મિનિટમાં સમાપ્ત થઈ જશે
              </Text>

              <Button
                width="100%"
                bg="#059669"
                color="white"
                _hover={{ bg: "#047857" }}
                onClick={handleVerifyOTP}
                isLoading={loading}
              >
                વેરિફાય કરો
              </Button>

              <Button
                width="100%"
                variant="outline"
                colorScheme="green"
                onClick={handleSendOTP}
                isLoading={loading}
                fontSize="sm"
              >
                ફરીથી OTP મોકલો
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
}
