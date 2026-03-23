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

const PeRollHome = () => {
  const navigate = useNavigate();

  const modules = [
    {
      title: "પેરામીટર સેટિંગ",
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
      title: "રોજની વિગત",
      description: "દૈનિક કામની વિગતો અહીં થી નોંધો અને જુઓ",
      path: "/pe-roll/daily-records",
      icon: FiCalendar,
    },
    {
      title: "ઉપાડણી વિગત",
      description: "કર્મચારીઓની શિક્ષણ અને તાલીમ વિગતો",
      path: "/pe-roll/qualification-details",
      icon: FiAward,
    },
    {
      title: "પી.એફ. જમા/ઉપાડ",
      description: "કર્મચારીઓના PF યોગદાનનું સંચાલન",
      path: "/pe-roll/pf-management",
      icon: FiDollarSign,
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
      <Flex align="center" mb={8} gap={4}>
        <Button
          leftIcon={<FiArrowLeft />}
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          color="#1E4D2B"
        >
          પાછા
        </Button>
        <Heading size="lg" color="#1E4D2B" padding= "auto">
          પે-રોલ
        </Heading>
      </Flex>

      {/* Welcome Box
      <Box
        bg="white"
        p={6}
        rounded="2xl"
        shadow="md"
        border="1px solid #E3EDE8"
        mb={10}
      >
        <Heading size="md" color="green.700" mb={2}>
          કર્મચારી વ્યવસ્થાપન
        </Heading>
        <Text fontSize="md" color="gray.600">
          અહીંથી તમે કર્મચારીઓની સંપૂર્ણ માહિતી, પગાર, PF, હાજરી અને અન્ય વિગતોનું સંચાલન કરી શકો છો.
        </Text>
      </Box> */}

      {/* Modules Grid */}
      {/* <Heading size="md" color="#1E4D2B" mb={6}>
        મોડ્યુલ્સ
      </Heading> */}
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
            _hover={{ transform: "scale(1.05)", transition: "0.2s" }}
            onClick={() => navigate(module.path)}
          >
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
    </Box>
  );
};

export default PeRollHome;