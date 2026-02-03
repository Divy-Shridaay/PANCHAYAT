import {
  Box,
  SimpleGrid,
  Text,
  Heading,
  VStack,
  Button,
  Flex,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiHelpCircle, FiShield, FiArrowLeft, FiList, FiFileText } from "react-icons/fi";
import { useEffect, useState } from "react";
import { useApiFetch } from "../../utils/api";


/* Card exactly like Pedhinamu */
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

export default function SettingsHome() {
  const navigate = useNavigate();
  const toast = useToast();
  const apiFetch = useApiFetch();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { response, data } = await apiFetch("/api/register/user/status");
        if (response.ok) {
          setUser(data.user);
        }
      } catch (err) {
        console.error("Failed to fetch user status", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const handleInvoiceClick = () => {
    toast({
      title: "ટૂંક સમયમાં આવી રહ્યું છે",
      description: "ઇનવોઇસ ડાઉનલોડ કરવાની સુવિધા ટૂંક સમયમાં શરૂ કરવામાં આવશે.",
      status: "info",
      duration: 3000,
      isClosable: true,
      position: "top",
    });
  };

  if (loading) {
    return (
      <Box bg="white" minH="100vh" p={10} display="flex" justifyContent="center" alignItems="center">
        <Spinner size="xl" color="green.500" />
      </Box>
    );
  }

  // Same logic as Profile: show if paid
  const showInvoice = user?.isPaid;

  return (
    <Box bg="white" minH="100vh" p={10}>
      {/* HEADER (same as Pedhinamu) */}
      <Flex align="center" mb={10}>
        <Button
          leftIcon={<FiArrowLeft />}
          colorScheme="green"
          variant="outline"
          onClick={() => navigate("/dashboard")}
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
          સેટિંગ્સ
        </Heading>

        {/* Empty box for symmetry */}
        <Box width="120px" />
      </Flex>

      {/* CARDS – LEFT ALIGNED like Pedhinamu */}
      <SimpleGrid
        columns={{ base: 1, md: 3 }}
        spacing={6}
      >
        <Card
          icon={FiUser}
          title="પ્રોફાઇલ વ્યવસ્થાપન"
          subtitle="વ્યક્તિગત માહિતી અપડેટ કરો"
          onClick={() => navigate("/settings/profile")}
        />

        <Card
          icon={FiHelpCircle}
          title="મદદ અને માર્ગદર્શન"
          subtitle="સિસ્ટમ ઉપયોગ માટે માર્ગદર્શન"
          onClick={() => navigate("/settings/help")}
        />

        <Card
          icon={FiShield}
          title="સુરક્ષા સેટિંગ્સ"
          subtitle="પાસવર્ડ અને સુરક્ષા વિકલ્પો"
          onClick={() => navigate("/settings/security")}
        />

        <Card
          icon={FiList}
          title="કેટેગરી સેટિંગ્સ"
          subtitle="આવક અને જાવક કેટેગરી મેનેજ કરો"
          onClick={() => navigate("/settings/categories")}
        />

        {showInvoice && (
          <Card
            icon={FiFileText}
            title="ઇનવોઇસ"
            subtitle="તમારી ચુકવણીની રસીદ જુઓ"
            onClick={() => navigate("/settings/invoices")}
          />
        )}

      </SimpleGrid>
    </Box>


  );
}
