"use client";

import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  VStack,
  Button,
  Flex,
} from "@chakra-ui/react";
import {
  FiArrowLeft,
  FiLogIn,
  FiFileText,
  FiBookOpen,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

/* CARD – SAME STYLE, WIDE */
const VideoCard = ({ icon: Icon, title, subtitle, onClick }) => (
  <Box
    bg="white"
    p={8}
    rounded="2xl"
    shadow="md"
    border="1px solid #E3EDE8"
    cursor="pointer"
    _hover={{
      shadow: "lg",
      transform: "translateY(-4px)",
    }}
    transition="0.2s"
    onClick={onClick}
  >
    <VStack align="center" spacing={3} textAlign="center">
      <Icon size={36} color="#2F855A" />
      <Text fontSize="xl" fontWeight="600" color="green.800">
        {title}
      </Text>
      <Text fontSize="md" color="gray.600">
        {subtitle}
      </Text>
    </VStack>
  </Box>
);

export default function VideoHelp() {
  const navigate = useNavigate();

  return (
    <Box bg="#F8FAF9" minH="100vh" p={10}>
      {/* HEADER */}
      <Flex align="center" mb={10}>
        <Button
          leftIcon={<FiArrowLeft />}
          colorScheme="green"
          variant="outline"
          onClick={() => navigate("/settings/help")}
        >
          પાછા જાવ
        </Button>

        <Heading
          flex="1"
          textAlign="center"
          size="lg"
          color="green.800"
          fontWeight="700"
        >
          વિડિયો માર્ગદર્શન
        </Heading>

        <Box width="120px" />
      </Flex>

      {/* FULL WIDTH, BIG CARDS */}
      <SimpleGrid
        columns={{ base: 1, md: 3 }}
        spacing={6}
        maxW="100%"
      >
        <VideoCard
          icon={FiLogIn}
          title="લોગિન અને રજીસ્ટ્રેશન"
          subtitle="લોગિન અને ખાતું બનાવવાની પ્રક્રિયા"
          onClick={() =>
            navigate("/settings/help/videos/login-register")
          }
        />

        <VideoCard
          icon={FiFileText}
          title="પેઢીનામું"
          subtitle="પેઢીનામું બનાવવાની સંપૂર્ણ માહિતી"
          onClick={() =>
            navigate("/settings/help/videos/pedhinamu")
          }
        />

        <VideoCard
          icon={FiBookOpen}
          title="રોજમેળ"
          subtitle="રોજમેળ નોંધ અને વ્યવહાર માર્ગદર્શન"
          onClick={() =>
            navigate("/settings/help/videos/rojmel")
          }
        />
      </SimpleGrid>
    </Box>
  );
}
