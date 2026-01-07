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
import {
  FiArrowLeft,
  FiVideo,
  FiFileText,
  FiHelpCircle,
} from "react-icons/fi";

/* Same card component */
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
  >
    <VStack spacing={3} onClick={onClick}>
      <Icon size={34} color="#2F855A" />
      <Text fontSize="lg" fontWeight="600" color="green.800">
        {title}
      </Text>
      <Text fontSize="sm" color="gray.600">
        {subtitle}
      </Text>
    </VStack>
  </Box>
);

export default function HelpSettings() {
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
          મદદ અને માર્ગદર્શન
        </Heading>

        <Box width="120px" />
      </Flex>

      {/* HELP CARDS */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        <Card
          icon={FiVideo}
          title="વિડિયો માર્ગદર્શન"
          subtitle="વિડિયો દ્વારા ઉપયોગ શીખો"
          onClick={() => navigate("/settings/help/videos")}
        />

        <Card
          icon={FiFileText}
          title="દસ્તાવેજ માર્ગદર્શન"
          subtitle="લખિત માર્ગદર્શન અને PDF"
          onClick={() => navigate("/settings/help/documents")}
        />

        <Card
          icon={FiHelpCircle}
          title="પ્રશ્નોત્તરી (FAQ)"
          subtitle="સામાન્ય પ્રશ્નોના જવાબ"
          onClick={() => navigate("/settings/help/faq")}
        />
      </SimpleGrid>
    </Box>
  );
}
