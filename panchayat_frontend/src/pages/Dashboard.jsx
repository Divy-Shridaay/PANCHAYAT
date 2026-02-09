"use client";

import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  Button,
  Flex,
  useToast,
  CloseButton,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import {
  FiUserCheck,
  FiFileText,
  FiLogOut,
  FiSettings,
  FiTrendingUp,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { HiOutlineDocumentCurrencyRupee } from "react-icons/hi2";
import { useEffect, useState } from "react";
import { useApiFetch } from "../utils/api";
import PaymentPopup from "../components/PaymentPopup";
import TrialWelcomePopup from "../components/TrialWelcomePopup";

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const toast = useToast();
  const apiFetch = useApiFetch();

  const [user, setUser] = useState(null);
  // console.log("User object:", user);
  // console.log("Gam:", user?.gam);
  const [userStatus, setUserStatus] = useState({
    canAccessModules: true,
  });
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [popupType, setPopupType] = useState("module");
  const [showTrialWelcome, setShowTrialWelcome] = useState(false);
  const [showVerificationNotice, setShowVerificationNotice] = useState(false);

  /* =======================
     FETCH LOGGED IN USER
  ======================= */
  const fetchUsers = async () => {
    try {
      const { response, data } = await apiFetch(
        "/api/register/admin/users"
      );

      if (response.ok) {
        const loggedInUsername = localStorage.getItem("username");

        const loggedInUser = data.users.find(
          (u) => u.username === loggedInUsername
        );

        if (loggedInUser) {
          setUser(loggedInUser);
          localStorage.setItem("user", JSON.stringify(loggedInUser));
        } else {
          toast({
            title: "ભૂલ",
            description: "લૉગિન વપરાશકર્તા શોધવામાં નિષ્ફળ",
            status: "error",
            duration: 3000,
            isClosable: true,
            position: "top",
          });
        }
      } else {
        toast({
          title: "ભૂલ",
          description: data.message || "વપરાશકર્તાઓને લોડ કરવામાં નિષ્ફળ",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* =======================
     FETCH USER STATUS
     (trial / payment)
  ======================= */
  const fetchUserStatus = async () => {
    try {
      const { response, data } = await apiFetch(
        "/api/register/user/status"
      );

      if (response.ok) {
        setUserStatus(data);
        
        // data example:
        // { canAccessModules: false }
      } else {
        toast({
          title: "ભૂલ",
          description: data.message || "User status લોડ ન થઈ",
          status: "error",
          duration: 3000,
          position: "top",
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* =======================
     MODULE CLICK HANDLER
  ======================= */
  const handleModuleClick = async (route, moduleName) => {
    try {
      // 1. Check if this specific module is already active
      const moduleAccess = userStatus?.user?.modulesAccess?.[moduleName] ?? false;
      const isPending = userStatus?.user?.pendingModules?.[moduleName] ?? false;

      // 2. If it's pending AND not active, block with verification toast
      if (isPending && !moduleAccess) {
        toast({
          title: "ચકાસણી પેન્ડિંગ",
          description: "તમારી આ મોડ્યુલની ચુકવણી હાલમાં ચકાસણી હેઠળ છે. કૃપા કરીને એડમિન દ્વારા પુષ્ટિ થાય ત્યાં સુધી રાહ જુઓ.",
          status: "info",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
        return;
      }

      // 3. If it's NOT active (and not pending), show payment popup
      if (!moduleAccess) {
        setPopupType("module");
        setShowPaymentPopup(true);
        return;
      }

      // 4. If active, navigate
      navigate(route);
    } catch (err) {
      console.error(err);
      setPopupType("module");
      setShowPaymentPopup(true);
    }
  };

  /* =======================
     ON LOAD
  ======================= */
  useEffect(() => {
    fetchUsers();
    fetchUserStatus();

    // Check for trial welcome popup
    const welcomeFlag = localStorage.getItem("showTrialWelcome");
    if (welcomeFlag === "true") {
      setShowTrialWelcome(true);
      localStorage.removeItem("showTrialWelcome");
    }
  }, []);

  /* =======================
     MANAGE VERIFICATION NOTICE
  ======================= */
  useEffect(() => {
    if (userStatus?.user) {
      const isPaid = userStatus.user.isPaid;
      const isPending = userStatus.user.isPendingVerification;
      const username = localStorage.getItem("username");

      if (isPending) {
        setShowVerificationNotice(true);
      } else if (isPaid) {
        if (username) localStorage.removeItem(`paymentPendingVerification_${username}`);
        setShowVerificationNotice(false);
      } else {
        setShowVerificationNotice(false);
      }
    }
  }, [userStatus]);

  /* =======================
     MANAGE EXPIRY ALERTS
  ======================= */
  const [expiryAlerts, setExpiryAlerts] = useState([]);

  useEffect(() => {
    if (userStatus?.user?.modulesAccess && userStatus?.expiryDays) {
      const alerts = [];
      const expiryDays = userStatus.expiryDays;
      const moduleLabels = {
        pedhinamu: t("pedhinamu"),
        rojmel: t("rojmel"),
        jaminMehsul: "જમીન મહેસુલ",
      };

      Object.entries(expiryDays).forEach(([key, days]) => {
        if (days !== null && userStatus.user.modulesAccess[key] && days <= 40) {
          const dismissed = sessionStorage.getItem(`expiryBannerDismissed_${key}`);
          if (!dismissed) {
            alerts.push({ key, label: moduleLabels[key], days });
          }
        }
      });
      setExpiryAlerts(alerts);
    } else {
      setExpiryAlerts([]);
    }
  }, [userStatus, t]); // Add t dependency

  // Helper to dismiss alert
  const dismissAlert = (key) => {
    sessionStorage.setItem(`expiryBannerDismissed_${key}`, "true");
    setExpiryAlerts(prev => prev.filter(a => a.key !== key));
  };


  return (
    <Box bg="#F8FAF9" minH="100vh" p={10}>
      {/* EXPIRY BANNERS */}
      {expiryAlerts.map((alert) => (
        <Box
          key={alert.key}
          bg="blue.50"
          p={3}
          rounded="xl"
          border="1px solid"
          borderColor="blue.200"
          mb={4}
          shadow="sm"
          position="relative"
          cursor="pointer"
          onClick={() => navigate("/payment")}
          _hover={{ bg: "blue.100" }}
        >
          <Flex align="center" justify="center">
            <Text fontWeight="600" color="blue.800" fontSize="md" textAlign="center">
              {alert.label}નું સબસક્રિપ્સન સમાપ્ત થવામાં {alert.days} દિવસ બાકી છે.
            </Text>
            <CloseButton
              position="absolute"
              right={2}
              top="50%"
              transform="translateY(-50%)"
              size="sm"
              color="blue.600"
              onClick={(e) => {
                e.stopPropagation();
                dismissAlert(alert.key);
              }}
            />
          </Flex>
        </Box>
      ))}

      {/* VERIFICATION NOTICE */}
      {showVerificationNotice && (
        <Box
          bg="blue.50"
          p={5}
          rounded="2xl"
          border="1px solid"
          borderColor="blue.200"
          mb={8}
          shadow="sm"
          position="relative"
        >
          <Flex align="center" justify="space-between">
            <Box pr={10}>
              <Text fontWeight="bold" color="blue.800" fontSize="lg">
                તમારી ચુકવણી પ્રાપ્ત થઈ ગઈ છે અને હાલમાં ચકાસણી હેઠળ છે.
              </Text>
              <Text color="blue.700" fontSize="md" mt={2}>
                એડમિન દ્વારા ચુકવણીની પુષ્ટિ થયા બાદ, તમે પસંદ કરેલા મોડ્યુલ્સ માટેનો ઍક્સેસ સક્રિય કરવામાં આવશે.
              </Text>
            </Box>
            <CloseButton
              position="absolute"
              right={4}
              top={4}
              size="lg"
              color="blue.600"
              onClick={() => setShowVerificationNotice(false)}
            />
          </Flex>
        </Box>
      )}

      {/* HEADER */}
      <Flex justify="space-between" align="center" mb={10}>
        <Heading size="lg" color="#1E4D2B" fontWeight="700">
          🏛️ {user ? user.gam : t("appName")} ગ્રામ પંચાયત

        </Heading>


        <Flex gap={4}>
          <Button
            leftIcon={<FiLogOut />}
            colorScheme="red"
            variant="ghost"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("username");
              navigate("/login");
            }}
          >
            {t("logout")}
          </Button>
        </Flex>
      </Flex>

      {/* WELCOME BOX */}
      <Box
        bg="white"
        p={6}
        rounded="2xl"
        shadow="md"
        border="1px solid #E3EDE8"
        mb={10}
      >
        <Heading size="md" color="green.700" mb={2}>
          {t("digitalPortal")}
        </Heading>

        <Text fontSize="md" color="gray.600">
          {t("dashboard")} —{" "}
          {user ? user.gam : t("appName")} ગ્રામ પંચાયત
        </Text>
      </Box>

      {/* ACTION CARDS */}
      <SimpleGrid columns={[1, 2, 3]} spacing={8}>
        {/* Pedhinamu */}
        <Box
          bg="white"
          p={8}
          rounded="2xl"
          shadow="lg"
          border="1px solid #E3EDE8"
          textAlign="center"
          cursor={(userStatus?.user?.pendingModules?.pedhinamu && !userStatus?.user?.modulesAccess?.pedhinamu) ? "not-allowed" : "pointer"}
          opacity={(userStatus?.user?.pendingModules?.pedhinamu && !userStatus?.user?.modulesAccess?.pedhinamu) ? 0.6 : 1}
          filter={(userStatus?.user?.pendingModules?.pedhinamu && !userStatus?.user?.modulesAccess?.pedhinamu) ? "grayscale(40%)" : "none"}
          _hover={(userStatus?.user?.pendingModules?.pedhinamu && !userStatus?.user?.modulesAccess?.pedhinamu) ? {} : { transform: "scale(1.05)", transition: "0.2s" }}
          onClick={() => handleModuleClick("/pedhinamu", "pedhinamu")}
        >
          <FiUserCheck size={40} color="#2A7F62" />
          <Heading size="md" mt={4} color="#1E4D2B">
            {t("pedhinamu")}
          </Heading>
          <Text mt={2} color="gray.600">
            {t("cardPedhinamuText")}
          </Text>
        </Box>



        {/* Cashmel */}
        <Box
          bg="white"
          p={8}
          rounded="2xl"
          shadow="lg"
          border="1px solid #E3EDE8"
          textAlign="center"
          cursor={(userStatus?.user?.pendingModules?.rojmel && !userStatus?.user?.modulesAccess?.rojmel) ? "not-allowed" : "pointer"}
          opacity={(userStatus?.user?.pendingModules?.rojmel && !userStatus?.user?.modulesAccess?.rojmel) ? 0.6 : 1}
          filter={(userStatus?.user?.pendingModules?.rojmel && !userStatus?.user?.modulesAccess?.rojmel) ? "grayscale(40%)" : "none"}
          _hover={(userStatus?.user?.pendingModules?.rojmel && !userStatus?.user?.modulesAccess?.rojmel) ? {} : { transform: "scale(1.05)", transition: "0.2s" }}
          
          // onClick={() => handleModuleClick( 
          //   "/cashmelform",
          //    "rojmel")}
        >
          <FiTrendingUp size={40} color="#2A7F62" />
          <Heading size="md" mt={4} color="#1E4D2B">
            {t("rojmel")}
          </Heading>
          <Text mt={2} color="gray.600">
            {t("cardCashmelText")}
          </Text>
        </Box>

        {/* project2 */}
        <Box
          bg="white"
          p={8}
          rounded="2xl"
          shadow="lg"
          border="1px solid #E3EDE8"
          textAlign="center"
          cursor={(userStatus?.user?.pendingModules?.jaminMehsul && !userStatus?.user?.modulesAccess?.jaminMehsul) ? "not-allowed" : "pointer"}
          opacity={(userStatus?.user?.pendingModules?.jaminMehsul && !userStatus?.user?.modulesAccess?.jaminMehsul) ? 0.6 : 1}
          filter={(userStatus?.user?.pendingModules?.jaminMehsul && !userStatus?.user?.modulesAccess?.jaminMehsul) ? "grayscale(40%)" : "none"}
          _hover={(userStatus?.user?.pendingModules?.jaminMehsul && !userStatus?.user?.modulesAccess?.jaminMehsul) ? {} : { transform: "scale(1.05)", transition: "0.2s" }}
          // onClick={() => handleModuleClick(null, "jaminMehsul")}
        >
          <HiOutlineDocumentCurrencyRupee size={40} color="#2A7F62" />
          <Heading size="md" mt={4} color="#1E4D2B">
            જમીન મહેસુલ જમાબંધી હિસાબો
          </Heading>
          <Text mt={2} color="gray.600">
            {t("cardmangnutext")}
          </Text>
        </Box>


        {/* Settings */}
        <Box
          bg="white"
          p={8}
          rounded="2xl"
          shadow="lg"
          border="1px solid #E3EDE8"
          textAlign="center"
          cursor="pointer"
          _hover={{ transform: "scale(1.05)", transition: "0.2s" }}
          onClick={() => navigate("/settings")}
        >
          <FiSettings size={40} color="#2A7F62" />
          <Heading size="md" mt={4} color="#1E4D2B">
            {t("settings")}
          </Heading>
          <Text mt={2} color="gray.600">
            {t("cardSettingsText")}
          </Text>
        </Box>

      </SimpleGrid>



      {/* PAYMENT POPUP */}
      <PaymentPopup
        isOpen={showPaymentPopup}
        onClose={() => setShowPaymentPopup(false)}
        type={popupType}
        isSubscriptionExpired={userStatus?.isSubscriptionExpired}
      />

      <TrialWelcomePopup
        isOpen={showTrialWelcome}
        onClose={() => setShowTrialWelcome(false)}
      />
    </Box >
  );
}
