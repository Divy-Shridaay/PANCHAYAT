"use client";

import {
  Box,
  Heading,
  Button,
  Flex,
  VStack,
  HStack,
  Text,
  Input,
  Select,
  FormControl,
  FormLabel,
  useToast,
  Spinner,
  Divider,
  SimpleGrid,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiSave, FiEdit } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useApiFetch } from "../../utils/api";


export default function Settings() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const toast = useToast();
  const apiFetch = useApiFetch();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});

  /* =======================
     FETCH USER PROFILE
  ======================= */
  const fetchUserProfile = async () => {
    try {
      const { response, data } = await apiFetch("/api/register/user/profile");

      if (response.ok) {
        setUser(data.user);
        setFormData(data.user);
      } else {
        toast({
          title: "ભૂલ",
          description: data.message || "પ્રોફાઇલ લોડ ન થઈ",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "ભૂલ",
        description: "પ્રોફાઇલ લોડ કરવામાં નિષ્ફળ",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     UPDATE USER PROFILE
  ======================= */
  const updateUserProfile = async () => {
    setSaving(true);
    try {
      const { response, data } = await apiFetch(
        "/api/register/user/profile",
        {
          method: "PUT",
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        setUser(data.user);
        setEditing(false);
        toast({
          title: "સફળતા",
          description: "પ્રોફાઇલ અપડેટ થઈ ગઈ",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      } else {
        toast({
          title: "ભૂલ",
          description: data.message || "પ્રોફાઇલ અપડેટ ન થઈ",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "ભૂલ",
        description: "પ્રોફાઇલ અપડેટ કરવામાં નિષ્ફળ",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setSaving(false);
    }
  };

  /* =======================
     HANDLE INPUT CHANGE
  ======================= */
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* =======================
     ON LOAD
  ======================= */
  useEffect(() => {
    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <Box bg="#F8FAF9" minH="100vh" p={10} display="flex" justifyContent="center" alignItems="center">
        <Spinner size="xl" color="green.500" />
      </Box>
    );
  }

  return (
    <Box bg="#F8FAF9" minH="100vh" p={10}>
      {/* HEADER */}
      <Flex justify="space-between" align="center" mb={8}>
        <HStack>
          <Box width="180px">
    <Button
      leftIcon={<FiArrowLeft />}
      colorScheme="green"
      variant="outline"
      onClick={() => navigate("/settings")}
    >
      પાછા જાવ
    </Button>
  </Box>
          <Heading size="lg" color="#1E4D2B" fontWeight="700">
            ⚙️ સેટિંગ્સ - વપરાશકર્તા પ્રોફાઇલ
          </Heading>
        </HStack>

        {!editing ? (
          user?.role !== "admin" ? (
            <Button
              leftIcon={<FiEdit />}
              colorScheme="blue"
              onClick={() => setEditing(true)}
            >
              એડિટ કરો
            </Button>
          ) : (
            <Text fontSize="sm" color="gray.500">
              એડમિન પ્રોફાઇલ એડિટ કરી શકાતી નથી
            </Text>
          )
        ) : (
          <HStack>
            <Button
              colorScheme="gray"
              variant="outline"
              onClick={() => {
                setEditing(false);
                setFormData(user);
              }}
            >
              કેન્સલ
            </Button>
            <Button
              leftIcon={<FiSave />}
              colorScheme="green"
              onClick={updateUserProfile}
              isLoading={saving}
              loadingText="સેવ કરી રહ્યું છે..."
            >
              સેવ કરો
            </Button>
          </HStack>
        )}
      </Flex>

      {/* PROFILE FORM */}
      <Box
        bg="white"
        p={8}
        rounded="2xl"
        shadow="md"
        border="1px solid #E3EDE8"
        maxW="800px"
        mx="auto"
      >
        {user ? (
          <VStack spacing={6} align="stretch">
          <Heading size="md" color="green.700" mb={4}>
            વ્યક્તિગત માહિતી
          </Heading>

          <SimpleGrid columns={[1, 2]} spacing={4}>
            <FormControl>
              <FormLabel>પૂર્ણ નામ</FormLabel>
              <Input
                value={formData.name || `${formData.firstName || ""} ${formData.middleName || ""} ${formData.lastName || ""}`.trim()}
                onChange={(e) => handleInputChange("name", e.target.value)}
                isReadOnly={!editing}
                bg={editing ? "white" : "gray.50"}
              />
            </FormControl>

            {/* <FormControl>
              <FormLabel>વપરાશકર્તા નામ</FormLabel>
              <Input
                value={formData.username || ""}
                onChange={(e) => handleInputChange("username", e.target.value)}
                isReadOnly={!editing}
                bg={editing ? "white" : "gray.50"}
              />
            </FormControl> */}

            <FormControl>
              <FormLabel>ઇમેઇલ</FormLabel>
              <Input
                type="email"
                value={formData.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
                isReadOnly={!editing}
                bg={editing ? "white" : "gray.50"}
              />
            </FormControl>

            <FormControl>
              <FormLabel>મોબાઇલ નંબર</FormLabel>
             <Input
  value={formData.phone || ""}
  onChange={(e) => {
    const val = e.target.value.replace(/\D/g, ""); // sirf digits allow
    if (val.length <= 10) handleInputChange("phone", val);
  }}
  isReadOnly={!editing}
  bg={editing ? "white" : "gray.50"}
  type="tel"
/>

            </FormControl>

            {/* <FormControl>
              <FormLabel>લિંગ</FormLabel>
              <Select
                value={formData.gender || ""}
                onChange={(e) => handleInputChange("gender", e.target.value)}
                isDisabled={!editing}
                bg={editing ? "white" : "gray.50"}
              >
                <option value="">પસંદ કરો</option>
                <option value="પુરુષ">પુરુષ</option>
                <option value="સ્ત્રી">સ્ત્રી</option>
                <option value="અન્ય">અન્ય</option>
              </Select>
            </FormControl> */}

            <FormControl>
              <FormLabel>જન્મ તારીખ</FormLabel>
             <Input
    type="date"
    value={formData.dob || ""}
    onChange={(e) => handleInputChange("dob", e.target.value)}
    isReadOnly={!editing}
    bg={editing ? "white" : "gray.50"}
    max={new Date().toISOString().split("T")[0]} // ✅ future date block
  />
            </FormControl>
          </SimpleGrid>

          <Divider />

          <Heading size="md" color="green.700" mb={4}>
            સરનામું
          </Heading>

          <SimpleGrid columns={[1, 2]} spacing={4}>
            <FormControl>
              <FormLabel>ગામ</FormLabel>
              <Input
                value={formData.gam || ""}
                onChange={(e) => handleInputChange("gam", e.target.value)}
                isReadOnly={!editing}
                bg={editing ? "white" : "gray.50"}
              />
            </FormControl>

            <FormControl>
              <FormLabel>તાલુકો</FormLabel>
              <Input
                value={formData.taluko || ""}
                onChange={(e) => handleInputChange("taluko", e.target.value)}
                isReadOnly={!editing}
                bg={editing ? "white" : "gray.50"}
              />
            </FormControl>

            <FormControl>
              <FormLabel>જિલ્લો</FormLabel>
              <Input
                value={formData.jillo || ""}
                onChange={(e) => handleInputChange("jillo", e.target.value)}
                isReadOnly={!editing}
                bg={editing ? "white" : "gray.50"}
              />
            </FormControl>

            <FormControl>
              <FormLabel>પિન કોડ</FormLabel>
              <Input
                value={formData.pinCode || ""}
                onChange={(e) => handleInputChange("pinCode", e.target.value)}
                isReadOnly={!editing}
                bg={editing ? "white" : "gray.50"}
              />
            </FormControl>
          </SimpleGrid>

          <Divider />

          {/* <FormControl>
            <FormLabel>ભૂમિકા</FormLabel>
            <Input
              value={formData.role || ""}
              isReadOnly={true}
              bg="gray.50"
            />
            <Text fontSize="sm" color="gray.500" mt={1}>
              ભૂમિકા ફેરફાર માટે એડમિનનો સંપર્ક કરો
            </Text>
          </FormControl> */}
          </VStack>
        ) : (
          <VStack spacing={4} textAlign="center" py={10}>
            <Text fontSize="lg" color="gray.600">
              પ્રોફાઇલ લોડ કરવામાં સમસ્યા આવી છે
            </Text>
            <Text fontSize="sm" color="gray.500" mb={4}>
              કૃપા કરીને ફરી પ્રયાસ કરો અથવા પૃષ્ઠને રીફ્રેશ કરો
            </Text>
            <Button
              colorScheme="blue"
              onClick={() => {
                setLoading(true);
                fetchUserProfile();
              }}
            >
              ફરી પ્રયાસ કરો
            </Button>
          </VStack>
        )}
      </Box>
    </Box>
  );
}