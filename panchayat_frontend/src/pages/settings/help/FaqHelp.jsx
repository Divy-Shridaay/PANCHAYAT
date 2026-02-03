import { Box, Heading, Button, Flex, Text } from "@chakra-ui/react";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function FaqHelp() {
  const navigate = useNavigate();

  return (
    <Box bg="white" minH="100vh" p={10}>
      <Flex align="center" mb={10}>
        <Button
          leftIcon={<FiArrowLeft />}
          colorScheme="green"
          variant="outline"
          onClick={() => navigate("/settings/help")}
        >
          પાછા જાવ
        </Button>

        <Heading flex="1" textAlign="center" color="green.800">
          પ્રશ્નોત્તરી (FAQ)
        </Heading>

        <Box width="120px" />
      </Flex>

      <Text fontSize="lg" color="gray.600">
        અહીં સામાન્ય પ્રશ્નો અને તેમના જવાબો દર્શાવવામાં આવશે.
      </Text>
    </Box>
  );
}
