import {
  FormControl,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import {
  CustomButton,
  CustomFormLabel,
  CustomInput,
  CustomMultiSelect,
  CustomSelect,
} from "component-library-iboon";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchRolesPage } from "../../adapters/RolesApiAdapter";
import {
  createUser,
  fetchUserById,
  updateUser,
} from "../../adapters/UserApiAdapter";
import { fetchVillagesPage } from "../../adapters/VillageApiAdapter";

export default function UserCreateModal({
  isOpen,
  onClose,
  mode = "create",
  id = null,
}) {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [roles, setRoles] = useState([]);
  const [villageAccess, setVillageAccess] = useState([]);
  const [villages, setVillages] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchRoles = async () => {
      const response = await fetchRolesPage(1, 1000);
      setRoles(response.data?.data);
    };

    const fetchVillages = async () => {
      const response = await fetchVillagesPage(1, 1000, search);
      setVillages(response.data?.data);
    };

    setTimeout(() => {
      fetchVillages();
      fetchRoles();
    }, 0);
  }, []);

  useEffect(() => {
    const getUserById = async () => {
      if (mode === "update" && id) {
        const response = await fetchUserById(id);

        const data = response.data.data;
        setFirstName(data.firstName);
        setMiddleName(data.middleName);
        setLastName(data.lastName);
        setGender(data.gender);
        setDob(data.dob);
        setEmail(data.email);
        setPhone(data.phone);
        setRole(data.role);
        setVillageAccess(data.villageAccess || []);
      }
    };
    getUserById();
  }, [mode, id]);

  const handleSaveUser = async () => {
    const userData = {
      firstName,
      middleName,
      lastName,
      gender,
      dob,
      email,
      phone,
      role,
      villageAccess,
    };
    let response;

    if (mode === "create") {
      response = await createUser(userData);
    } else if (mode === "update" && id) {
      response = await updateUser(id, userData);
    }

    if (response.status) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t(`userCreateModal.${mode}Title`)}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <CustomFormLabel>{t("userCreateModal.firstName")}</CustomFormLabel>
            <CustomInput
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder={t("userCreateModal.firstName")}
            />
          </FormControl>
          <FormControl mt={4}>
            <CustomFormLabel>{t("userCreateModal.middleName")}</CustomFormLabel>
            <CustomInput
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
              placeholder={t("userCreateModal.middleName")}
            />
          </FormControl>
          <FormControl mt={4}>
            <CustomFormLabel>{t("userCreateModal.lastName")}</CustomFormLabel>
            <CustomInput
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder={t("userCreateModal.lastName")}
            />
          </FormControl>
          <FormControl mt={4}>
            <CustomFormLabel>{t("userCreateModal.gender")}</CustomFormLabel>
            <CustomSelect
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </CustomSelect>
          </FormControl>
          <FormControl mt={4}>
            <CustomFormLabel>{t("userCreateModal.dob")}</CustomFormLabel>
            <CustomInput
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              type="date"
            />
          </FormControl>
          <FormControl mt={4}>
            <CustomFormLabel>{t("userCreateModal.email")}</CustomFormLabel>
            <CustomInput
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("userCreateModal.email")}
            />
          </FormControl>
          <FormControl mt={4}>
            <CustomFormLabel>{t("userCreateModal.phone")}</CustomFormLabel>
            <CustomInput
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t("userCreateModal.phone")}
            />
          </FormControl>
          <FormControl mt={4}>
            <CustomFormLabel>{t("userCreateModal.role")}</CustomFormLabel>
            <CustomSelect
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role._id} value={role._id}>
                  {role.name}
                </option>
              ))}
            </CustomSelect>
          </FormControl>

          <FormControl mt={4}>
            <CustomFormLabel>
              {t("userCreateModal.villageAccess")}
            </CustomFormLabel>
            <CustomMultiSelect
              options={villages.map((village) => ({
                ...village,
                label: village.name,
                value: village._id,
              }))}
              key={"name"}
              value={villageAccess}
              onChange={(e) => setVillageAccess(e)}
            />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <CustomButton mr={3} onClick={onClose} designType="outline">
            {t("common.cancel")}
          </CustomButton>
          <CustomButton variant="solid" onClick={handleSaveUser}>
            {t(`common.${mode}`)}
          </CustomButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
