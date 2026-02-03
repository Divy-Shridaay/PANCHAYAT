"use client";

import {
  Box,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Flex,
  useToast,
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { useApiFetch } from "../../utils/api";

export default function ChangePassword() {
  const navigate = useNavigate();
  const toast = useToast();
  const cancelRef = useRef();
  const apiFetch = useApiFetch();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔹 SUBMIT = validate + API call
  const handleSubmit = async () => {
    if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
      toast({
        title: "બધા ફીલ્ડ ભરવા જરૂરી છે",
        status: "warning",
        position: "top",
      });
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast({
        title: "નવો પાસવર્ડ અને કન્ફર્મ પાસવર્ડ સરખા નથી",
        status: "error",
        position: "top",
      });
      return;
    }

    try {
      const { response, data } = await apiFetch(
        "/api/auth/change-password",
        {
          method: "POST",
          body: JSON.stringify({
            oldPassword: form.oldPassword,
            newPassword: form.newPassword,
          }),
        }
      );

      // ❌ Wrong current password → show error NOW
      if (!response.ok) {
        toast({
          title: data?.message || "જૂનો પાસવર્ડ ખોટો છે",
          status: "error",
          position: "top",
        });
        return;
      }

      // ✅ Password changed → ask for logout
      onOpen();

    } catch (err) {
      toast({
        title: "સર્વર સાથે સંપર્ક કરવામાં સમસ્યા આવી",
        status: "error",
        position: "top",
      });
    }
  };

  // 🔹 YES = logout
  const handleLogout = () => {
    toast({
      title: "પાસવર્ડ સફળતાપૂર્વક બદલાઈ ગયો છે",
      status: "success",
      position: "top",
    });

    localStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <Box bg="white" minH="100vh" p={10}>
      {/* હેડર */}
      <Flex align="center" mb={10}>
        <Button
          leftIcon={<FiArrowLeft />}
          colorScheme="green"
          variant="outline"
          onClick={() => navigate("/settings/security")}
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
          પાસવર્ડ બદલો
        </Heading>

        <Box width="120px" />
      </Flex>

      {/* ફોર્મ */}
      <Box
        maxW="420px"
        mx="auto"
        bg="white"
        p={8}
        rounded="2xl"
        shadow="md"
        border="1px solid #E3EDE8"
      >
        <VStack spacing={5}>
          <FormControl isRequired>
            <FormLabel color="green.800" fontWeight="600">
              જૂનો પાસવર્ડ દાખલ કરો
            </FormLabel>
            <Input
              type="password"
              name="oldPassword"
              value={form.oldPassword}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel color="green.800" fontWeight="600">
              નવો પાસવર્ડ દાખલ કરો
            </FormLabel>
            <Input
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel color="green.800" fontWeight="600">
              નવો પાસવર્ડ ફરીથી દાખલ કરો
            </FormLabel>
            <Input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
            />
          </FormControl>

          <Button
            colorScheme="green"
            size="lg"
            w="full"
            mt={4}
            onClick={handleSubmit}
          >
            સબમિટ કરો
          </Button>
        </VStack>
      </Box>

      {/* લૉગઆઉટ ખાતરી ડાયલોગ */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              ખાતરી કરો
            </AlertDialogHeader>

            <AlertDialogBody>
              શું તમે લૉગઆઉટ કરવા માંગો છો?
            </AlertDialogBody>

            <AlertDialogFooter>
              {/* NO = stay logged in */}
              <Button
                ref={cancelRef}
                onClick={() => {
                  onClose();
                  setForm({
                    oldPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                  toast({
                    title: "પાસવર્ડ સફળતાપૂર્વક બદલાઈ ગયો છે",
                    status: "success",
                    position: "top",
                  });
                }}
              >
                ના
              </Button>

              {/* YES = logout */}
              <Button
                colorScheme="red"
                ml={3}
                onClick={handleLogout}
              >
                હા
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
