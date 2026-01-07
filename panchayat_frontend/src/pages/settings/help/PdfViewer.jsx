"use client";

import { Box, Button, Flex, Heading } from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

export default function PdfViewer() {
  const navigate = useNavigate();
  const { filename } = useParams();

  return (
    <Box bg="#F8FAF9" minH="100vh" p={6}>
      {/* Header */}
      <Flex align="center" mb={4}>
        <Button
          leftIcon={<FiArrowLeft />}
          colorScheme="green"
          variant="outline"
          onClick={() => navigate(-1)}
        >
          પાછા જાવ
        </Button>

        <Heading
          flex="1"
          textAlign="center"
          size="lg"
          color="green.800"
        >
          દસ્તાવેજ માર્ગદર્શન
        </Heading>

        <Box w="120px" />
      </Flex>

      {/* PDF Viewer */}
      <Box
        bg="white"
        border="1px solid #E3EDE8"
        rounded="xl"
        overflow="hidden"
        height="80vh"
        shadow="md"
      >
        <iframe
          src={`/help-docs/${filename}`}
          title="PDF Viewer"
          width="100%"
          height="100%"
          style={{ border: "none" }}
        />
      </Box>
    </Box>
  );
}
