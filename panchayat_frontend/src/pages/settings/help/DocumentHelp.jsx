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
import { FiFileText, FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

/* PDF CARD */
const PdfCard = ({ title, subtitle, file }) => {
  const navigate = useNavigate();

  return (
    <Box
      bg="white"
      p={8}
      rounded="2xl"
      shadow="md"
      border="1px solid #E3EDE8"
      cursor="pointer"
      textAlign="center"
      _hover={{
        shadow: "lg",
        transform: "translateY(-4px)",
      }}
      transition="0.2s"
      onClick={() =>
        navigate(`/settings/help/documents/view/${file}`)
      }
    >
      <VStack spacing={3}>
        <FiFileText size={36} color="#2F855A" />
        <Text fontSize="lg" fontWeight="600" color="green.800">
          {title}
        </Text>
        <Text fontSize="sm" color="gray.600">
          {subtitle}
        </Text>
      </VStack>
    </Box>
  );
};

export default function DocumentHelp() {
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
          દસ્તાવેજ માર્ગદર્શન
        </Heading>

        <Box width="120px" />
      </Flex>

      {/* PDF CARDS — LEFT ALIGNED */}
      <Box maxW="1000px">
        <SimpleGrid
          columns={{ base: 1, md: 2 }}
          spacing={6}
        >
          <PdfCard
            title="રોકડ નોંધ ફોર્મ"
            subtitle="રોકડ નોંધ માટેનું માર્ગદર્શન"
            file="rokad-nondh-form.pdf"
          />

          <PdfCard
            title="યુઝર ફ્લો દસ્તાવેજ"
            subtitle="સિસ્ટમ ઉપયોગ માટે માર્ગદર્શન"
            file="user-flow-document.pdf"
          />
        </SimpleGrid>
      </Box>
    </Box>
  );
}
