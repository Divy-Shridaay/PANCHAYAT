"use client";

import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  Button,
  Flex,
  useToast,
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
      const { response, data } = await apiFetch("/api/register/user/status");
      if (response.ok) {
        const status = data.user;
        // Check per-module access instead of global canAccessModules
        const moduleAccess = status.modulesAccess?.[moduleName] ?? false;
        if (!moduleAccess) {
          setPopupType("module");
          setShowPaymentPopup(true);
          return;
        }
        navigate(route);
      } else {
        setPopupType("module");
        setShowPaymentPopup(true);
      }
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
  }, []);

  return (
    <Box bg="#F8FAF9" minH="100vh" p={10}>
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
          cursor="pointer"
          _hover={{ transform: "scale(1.05)", transition: "0.2s" }}
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
          cursor="pointer"
          _hover={{ transform: "scale(1.05)", transition: "0.2s" }}
          onClick={() => handleModuleClick("/cashmelform", "rojmel")}
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
          cursor="pointer"
          _hover={{ transform: "scale(1.05)", transition: "0.2s" }}
          onClick={async () => {
            try {
              const { response, data } = await apiFetch("/api/register/user/status");
              if (response.ok) {
                const status = data.user;
                const moduleAccess = status.modulesAccess?.magnu ?? false;
                if (!moduleAccess) {
                  setPopupType("module");
                  setShowPaymentPopup(true);
                  return;
                }
                window.open("http://localhost:5174", "_blank");
              } else {
                setPopupType("module");
                setShowPaymentPopup(true);
              }
            } catch (err) {
              console.error(err);
              setPopupType("module");
              setShowPaymentPopup(true);
            }
          }}
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
      />
    </Box>
  );
}
