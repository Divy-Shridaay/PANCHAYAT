import {
  Box,
  SimpleGrid,
  Text,
  Heading,
  VStack,
  Button,
  Flex,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiLock } from "react-icons/fi";

/* Reusable Card */
const Card = ({ icon: Icon, title, subtitle, onClick }) => (
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
    onClick={onClick}   // ✅ CLICK HANDLER HERE
  >
    <VStack spacing={3}>
      <Icon size={34} color="#2F855A" />
      <Text fontSize="lg" fontWeight="600" color="green.800">
        {title}
      </Text>
      {subtitle && (
        <Text fontSize="sm" color="gray.600">
          {subtitle}
        </Text>
      )}
    </VStack>
  </Box>
);

export default function SecuritySettings() {
  const navigate = useNavigate();

  return (
    <Box bg="white" minH="100vh" p={10}>
      {/* HEADER */}
      <Flex align="center" mb={10}>
        <Button
          leftIcon={<FiArrowLeft />}
          colorScheme="green"
          variant="outline"
          onClick={() => navigate("/settings")}
        >
          પાછા જાવ
        </Button>

        <Heading
          flex="1"
          textAlign="center"
          size="xl"
          color="green.800"
          fontWeight="700"
        >
          સુરક્ષા સેટિંગ્સ
        </Heading>

        <Box width="120px" />
      </Flex>

      {/* PASSWORD CARD */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        <Card
          icon={FiLock}
          title="પાસવર્ડ બદલો"
          subtitle="તમારો પાસવર્ડ સુરક્ષિત રીતે બદલો"
          onClick={() =>
            navigate("/settings/security/change-password")
          }
        />
      </SimpleGrid>
    </Box>
  );
}
