import React, { useState, useEffect } from "react";
import {
  VStack,
  Text,
  HStack,
  Avatar,
  IconButton,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import ChangePasswordModal from "../components/ChangePasswordModal";
import { useTranslation } from "react-i18next";
import { useUser } from "../../ports/context/UserContext";
import { CustomButton, CustomInput, useApiCall } from "component-library-iboon";
import { FaPencil } from "react-icons/fa6";
import axios from "axios";
const BASE_URL = `${import.meta.env.VITE_SERVER_URL}/users`;

function Profile() {
  const { user, updateUser } = useUser();
 
  const { callApi } = useApiCall();

  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [editable, setEditable] = useState({
    firstName: false,
    middleName: false,
    lastName: false,
    email: false,
    phone: false,
    dob: false,
  });

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        middleName: user.middleName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        dob: user.dob || "",
      });
    }
  }, [user]);

  const handleSignOut = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleShowChangePassword = () => {
    setShowChangePassword(true);
    onOpen();
  };

  const handleEdit = (field) => {
    setEditable((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {

      const response = await callApi({
        url: `${BASE_URL}/${user._id}`,
        method: "PUT",
        body: JSON.stringify(formData),
        Token: localStorage.getItem("accessToken"),
      });

      if (response?.status) {
        updateUser(response.data.user);

        // make all fields readonly again
        setEditable({
          firstName: false,
          middleName: false,
          lastName: false,
          email: false,
          phone: false,
          dob: false,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <VStack alignItems="flex-start" w="100%" p={4} spacing={6}>
      <Text fontSize="2xl" fontWeight="bold">
        {t("profile.title")}
      </Text>

      <HStack alignItems="flex-start" spacing={8} w="100%">
        {/* Left Section - Avatar and Name Fields */}
        <Avatar src={user?.avatar} size="xl" />
        <VStack alignItems="flex-start" spacing={4}>
          {["firstName", "middleName", "lastName"].map((field) => (
            <HStack key={field}>
              <CustomInput
                placeholder={t(`profile.${field}`)}
                isReadOnly={!editable[field]}
                value={formData[field]}
                onChange={(e) => handleChange(field, e.target.value)}
              />
              <IconButton
                size="sm"
                icon={<FaPencil />}
                onClick={() => handleEdit(field)}
              />
            </HStack>
          ))}
        </VStack>

        {/* Right Section - Contact Info */}
        <VStack alignItems="flex-start" spacing={4}>
          {["email", "phone", "dob"].map((field) => (
            <HStack key={field}>
              <CustomInput
                placeholder={t(`profile.${field}`)}
                isReadOnly={!editable[field]}
                value={formData[field]}
                onChange={(e) => handleChange(field, e.target.value)}
              />
              <IconButton
                size="sm"
                icon={<FaPencil />}
                onClick={() => handleEdit(field)}
              />
            </HStack>
          ))}
        </VStack>
      </HStack>

      {/* Action Buttons */}
      <HStack spacing={4}>
        {/* Show Save Button only if any field is editable */}
        {Object.values(editable).some((v) => v) && (
          <CustomButton onClick={handleSave}>
            {t("profile.saveChanges")}
          </CustomButton>
        )}

        <CustomButton onClick={handleSignOut} designType="outline">
          {t("profile.signOut")}
        </CustomButton>

        <CustomButton onClick={handleShowChangePassword}>
          {t("profile.changePassword")}
        </CustomButton>
      </HStack>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isOpen}
        onClose={onClose}
        showChangePassword={showChangePassword}
        setShowChangePassword={setShowChangePassword}
      />
    </VStack>
  );
}

export default Profile;
