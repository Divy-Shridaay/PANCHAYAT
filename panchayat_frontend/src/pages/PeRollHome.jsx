"use client";

import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  Button,
  Flex,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import {
  FiSliders,
  FiUsers,
  FiList,
  FiCalendar,
  FiAward,
  FiDollarSign,
  FiFileText,
  FiArrowLeft,
} from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";

const PeRollHome = () => {
  const navigate = useNavigate();

  const modules = [
    {
      title: "પેરામીટર સેટિંગ્સ",
      description: "પરીક્ષા અને પેરામીટરનું સંચાલન અહીં થી કરો",
      path: "/pe-roll/parameter-settings",
      icon: FiSliders,
    },
    {
      title: "કર્મચારી નોંધણી",
      description: "નવા કર્મચારીની સંપૂર્ણ માહિતી અહીં થી નોંધો",
      path: "/pe-roll/employee-registration",
      icon: FiUsers,
    },
    {
      title: "કર્મચારી વિગત",
      description: "બધા કર્મચારીઓના રેકોર્ડ અહીં થી જુઓ",
      path: "/pe-roll/employee-details",
      icon: FiList,
    },
    {
      title: "રજાની વિગત",
      description: "દૈનિક કામની વિગતો અહીં થી નોંધો અને જુઓ",
      path: "/pe-roll/daily-records",
      icon: FiCalendar,
    },
    {
      title: "ઉપાડની વિગત",
      description: "કર્મચારીઓની શિક્ષણ અને તાલીમ વિગતો",
      path: "/pe-roll/qualification-details",
      icon: FiAward,
    },
    {
      title: "પી.એફ. જમા/ઉપાડ",
      description: "કર્મચારીઓના PF યોગદાનનું સંચાલન",
      path: "/pe-roll/pf-management",
      icon: FaRupeeSign, // Changed to Rupee icon
    },
    {
      title: "પગાર પત્રક",
      description: "કર્મચારીઓનો માસિક પગાર જનરેટ કરો અને જુઓ",
      path: "/pe-roll/salary-sheet",
      icon: FiFileText,
    },
  ];

  return (
    <Box bg="#F8FAF9" minH="100vh" p={10}>
      {/* Header with Back Button */}
      <Flex align="center" mb={12}>
        {/* 🔙 LEFT : Back Button */}
        <Box width="180px">
          <Button
            leftIcon={<FiArrowLeft />}
            colorScheme="green"
            variant="outline"
            onClick={() => navigate("/dashboard")}
          >
            પાછા જાવ
          </Button>
        </Box>
        <Heading
          flex="1"
          textAlign="center"
          size="lg"
          color="green.700"
        >
          પે-રોલ
        </Heading>

        {/* 👉 RIGHT : Empty space (for perfect centering) */}
        <Box width="180px" />
      </Flex>

      {/* Modules Grid */}
      <SimpleGrid columns={[1, 2, 3]} spacing={8}>
        {modules.map((module, index) => (
          <Box
            key={index}
            bg="white"
            p={8}
            rounded="2xl"
            shadow="lg"
            border="1px solid #E3EDE8"
            textAlign="center"
            cursor="pointer"
            transition="all 0.3s ease"
            _hover={{ 
              transform: "translateY(-5px)", 
              shadow: "xl",
              borderColor: "#2A7F62"
            }}
            onClick={() => navigate(module.path)}
          >
            {/* Consistent icon size of 40px to match dashboard */}
            <module.icon size={40} color="#2A7F62" />
            <Heading size="md" mt={4} color="#1E4D2B">
              {module.title}
            </Heading>
            <Text mt={2} color="gray.600" fontSize="sm">
              {module.description}
            </Text>
          </Box>
        ))}
      </SimpleGrid>

      <br />
      <br />
      <br />
    </Box>
  );
};

export default PeRollHome;