import { useState, useEffect } from "react";
import { Box, Heading, SimpleGrid, Text, Button, Flex, useDisclosure, useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FiPlusCircle, FiList, FiArrowLeft } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { HiOutlineClipboardDocumentCheck } from "react-icons/hi2";

import { apiFetch } from "../utils/api.js";
import PaymentPopup from "../components/PaymentPopup";

export default function PedhinamuHome() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const toast = useToast();

  const [userStatus, setUserStatus] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);

  const {
    isOpen: isPaymentOpen,
    onOpen: onPaymentOpen,
    onClose: onPaymentClose
  } = useDisclosure();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch User Status
        const statusRes = await apiFetch("/api/register/user/status", {}, navigate, toast);
        setUserStatus(statusRes.data.user);

        // Fetch Total Count (using limit=1 just to get total)
        const countRes = await apiFetch("/api/pedhinamu?page=1&limit=1", {}, navigate, toast);
        setTotalRecords(countRes.data.total || 0);

      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <Box bg="#F8FAF9" minH="100vh" p={10}>

      {/* 🔙 LEFT */}
      <Flex align="center" mb={6}>
        {/* 🔙 LEFT : Back Button */}
        <Box width="180px">
          <Button
            leftIcon={<FiArrowLeft />}
            colorScheme="green"
            variant="outline"
            onClick={() => navigate("/dashboard")}
          >
            પાછા જાવ
          </Button>
        </Box>

        {/* 🟢 CENTER : Heading */}
        <Heading
          flex="1"
          textAlign="center"
          size="lg"
          color="green.700"
        >
          {t("pedhinamu")}
        </Heading>

        {/* 👉 RIGHT : Empty space (for perfect centering) */}
        <Box width="180px" />
      </Flex>


      <SimpleGrid
        columns={{ base: 1, md: 3 }}
        spacing={8}
        maxW="1200px"
      >


        {/* CREATE NEW */}
        <Box
          p={8}
          bg="white"
          rounded="2xl"
          shadow="lg"
          cursor="pointer"
          border="1px solid #E3EDE8"
          textAlign="center"
          _hover={{ transform: "scale(1.05)", transition: ".2s" }}
          onClick={() => {
            // Simple and robust check: If user is "Unpaid" (Trial) and not Admin -> Enforce limit
            const isAdmin = userStatus?.role === "admin";
            const isTrial = userStatus && !userStatus.isPaid;

            if (!isAdmin && isTrial && totalRecords >= 5) {
              onPaymentOpen();
            } else {
              navigate("/pedhinamu/create");
            }
          }}
        >
          <FiPlusCircle size={40} color="#2A7F62" />
          <Heading size="md" mt={4}>{t("createPedhinamu")}</Heading>
          <Text mt={2}>{t("createPedhinamuDesc")}</Text>
        </Box>

        {/* VIEW LIST */}
        <Box
          p={8}
          bg="white"
          rounded="2xl"
          shadow="lg"
          cursor="pointer"
          border="1px solid #E3EDE8"
          textAlign="center"
          _hover={{ transform: "scale(1.05)", transition: ".2s" }}
          onClick={() => navigate("/pedhinamu/list")}
        >
          <FiList size={40} color="#2A7F62" />
          <Heading size="md" mt={4}>{t("viewPedhinamu")}</Heading>
          <Text mt={2}>{t("viewPedhinamuDesc")}</Text>
        </Box>

        {/* CARD: Records */}
        <Box
          bg="white"
          p={8}
          rounded="2xl"
          shadow="lg"
          border="1px solid #E3EDE8"
          textAlign="center"
          cursor="pointer"
          _hover={{ transform: "scale(1.05)", transition: "0.2s" }}
          onClick={() => navigate("/records")}
        >
          <HiOutlineClipboardDocumentCheck size={40} color="#2A7F62" />
          <Heading size="md" mt={4} color="#1E4D2B">
            {t("certificates")}
          </Heading>
          <Text mt={2} color="gray.600">
            {t("cardRecordsText")}
          </Text>
        </Box>

      </SimpleGrid>

      <PaymentPopup
        isOpen={isPaymentOpen}
        onClose={onPaymentClose}
        type="entryLimit"
      />
    </Box>
  );
}
