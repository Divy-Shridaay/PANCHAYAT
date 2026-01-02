import React, { useState } from "react";
import {
  FormControl,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  CustomButton,
  CustomFormLabel,
  CustomInput,
  useApiCall,
} from "component-library-iboon";
import { useTranslation } from "react-i18next";

const baseUrl = import.meta.env.VITE_SERVER_URL;

export default function ChangePasswordModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const { callApi } = useApiCall();
  // ✅ State for form fields
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  // ✅ State for errors and loading
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ✅ Validation
  const validateForm = () => {
    const newErrors = {};

    if (!form.oldPassword)
      newErrors.oldPassword = t("changePasswordModal.oldPasswordRequired");
    if (!form.newPassword)
      newErrors.newPassword = t("changePasswordModal.newPasswordRequired");
    if (!form.confirmNewPassword)
      newErrors.confirmNewPassword = t(
        "changePasswordModal.confirmNewPasswordRequired"
      );
    if (
      form.newPassword &&
      form.confirmNewPassword &&
      form.newPassword !== form.confirmNewPassword
    )
      newErrors.confirmNewPassword = t(
        "changePasswordModal.passwordsDoNotMatch"
      );

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Handle API call
  const changePassword = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await callApi({
        url: `${baseUrl}/auth/change-password`,
        method: "POST",
        body: JSON.stringify({
          currentPassword: form.oldPassword,
          newPassword: form.newPassword,
          confirmPassword: form.confirmNewPassword,
        }),
        Token: localStorage.getItem("accessToken"),
      });

      if (response?.status) {
        onClose();
      }
    } catch (error) {
      console.error("Error changing password:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent bgColor="white">
        <ModalHeader
          color="black"
          borderBottom="1px solid #DCDCDC"
          fontSize="lg"
          fontWeight={500}
        >
          {t("changePasswordModal.title")}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody p={4}>
          <VStack spacing={4} align="flex-start">
            <FormControl isRequired>
              <CustomFormLabel color="black">
                {t("changePasswordModal.oldPassword")}
              </CustomFormLabel>
              <CustomInput
                type="password"
                placeholder={t("changePasswordModal.oldPassword")}
                size="sm"
                value={form.oldPassword}
                onChange={(e) =>
                  setForm({ ...form, oldPassword: e.target.value })
                }
                isInvalid={errors.oldPassword}
              />
              {
                // ✅ Error message
                errors.oldPassword && (
                  <Text style={{ color: "red" }}>{errors.oldPassword}</Text>
                )
              }
            </FormControl>

            <FormControl isRequired>
              <CustomFormLabel color="black">
                {t("changePasswordModal.newPassword")}
              </CustomFormLabel>
              <CustomInput
                type="password"
                placeholder={t("changePasswordModal.newPassword")}
                size="sm"
                value={form.newPassword}
                onChange={(e) =>
                  setForm({ ...form, newPassword: e.target.value })
                }
                isInvalid={errors.newPassword}
              />
              {
                // ✅ Error message
                errors.newPassword && (
                  <Text style={{ color: "red" }}>{errors.newPassword}</Text>
                )
              }
            </FormControl>

            <FormControl isRequired>
              <CustomFormLabel color="black">
                {t("changePasswordModal.confirmNewPassword")}
              </CustomFormLabel>
              <CustomInput
                type="password"
                placeholder={t("changePasswordModal.confirmNewPassword")}
                size="sm"
                value={form.confirmNewPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmNewPassword: e.target.value })
                }
                isInvalid={errors.confirmNewPassword}
              />
              {
                // ✅ Error message
                errors.confirmNewPassword && (
                  <Text style={{ color: "red" }}>
                    {errors.confirmNewPassword}
                  </Text>
                )
              }
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter
          justifyContent="space-between"
          borderTop="1px solid #DCDCDC"
        >
          <CustomButton onClick={onClose} designType="secondary">
            {t("changePasswordModal.cancel")}
          </CustomButton>
          <CustomButton
            onClick={changePassword}
            designType="primary"
            isLoading={loading}
          >
            {t("changePasswordModal.save")}
          </CustomButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
