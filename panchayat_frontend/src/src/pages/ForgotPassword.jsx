"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";

import {
  Box,
  Button,
  Input,
  Heading,
  VStack,
  Text,
  Icon,
  FormControl,
  FormLabel,
  Flex,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";

import { FaUniversity } from "react-icons/fa";
import { apiFetch } from "../utils/api.js";

export default function ForgotPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(""); // success message

  const handleForgotPassword = async () => {
    // 🔹 EMPTY EMAIL CHECK
    if (!email) {
      setMessage(""); // 🔥 clear old success message
      toast({
        title: "કૃપા કરીને તમારું ઇમેઇલ દાખલ કરો",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setLoading(true);
    setMessage(""); // 🔥 clear previous success message before API call

    try {
      const { response, data } = await apiFetch(
        "/api/auth/forgot-password",
        {
          method: "POST",
          body: JSON.stringify({ email }),
        },
        navigate,
        toast
      );

      if (response.ok) {
        setMessage(
          "Password reset email sent successfully. Please check your email."
        );

        toast({
          title: "Email sent successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      } else {
        setMessage(""); // 🔥 remove success message on error
        toast({
          title: data?.message || "Failed to send reset email",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      }
    } catch (err) {
      console.error(err);
      setMessage(""); // 🔥 clear success message
      toast({
        title: "Network error",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }

    setLoading(false);
  };

  return (
    <Flex bg="#F8FAF9" minH="100vh" align="center" justify="center" p={4}>
      <Box
        bg="white"
        p={10}
        rounded="2xl"
        shadow="lg"
        border="1px solid #E3EDE8"
        width="100%"
        maxW="450px"
      >
        <VStack spacing={6}>
          {/* Logo */}
          <Icon as={FaUniversity} w={16} h={16} color="#2A7F62" />

          {/* Title */}
          <Heading
            size="lg"
            textAlign="center"
            color="#1E4D2B"
            fontWeight="700"
          >
            ગ્રામ પંચાયત
          </Heading>

          <Text
            textAlign="center"
            color="green.700"
            fontSize="lg"
            fontWeight="500"
          >
            પાસવર્ડ ભૂલી ગયા છો
          </Text>

          {/* EMAIL INPUT */}
          <FormControl>
            <FormLabel fontWeight="600">ઇમેઇલ</FormLabel>
            <Input
              type="email"
              size="lg"
              bg="gray.100"
              rounded="xl"
              placeholder="તમારું ઇમેઇલ દાખલ કરો"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setMessage(""); // 🔥 clear success message on typing
              }}
            />
          </FormControl>

          {/* SUCCESS MESSAGE */}
          {message && (
            <Alert status="success" rounded="md">
              <AlertIcon />
              {message}
            </Alert>
          )}

          {/* BUTTON */}
          <Button
            width="100%"
            colorScheme="green"
            size="lg"
            rounded="xl"
            fontWeight="bold"
            onClick={handleForgotPassword}
            isLoading={loading}
          >
            રીસેટ ઇમેઇલ મોકલો
          </Button>

          {/* BACK TO LOGIN */}
          <Text
            color="blue.500"
            fontSize="sm"
            cursor="pointer"
            onClick={() => navigate("/login")}
          >
            લોગિન પર પાછા જાઓ
          </Text>
        </VStack>
      </Box>
    </Flex>
  );
}
