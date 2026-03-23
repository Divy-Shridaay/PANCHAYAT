// employeeregistration.jsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  Flex,
  Input,
  useToast,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Grid,
  GridItem,
  Divider,
  Spinner,
  SimpleGrid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Badge,
  Select,
  Checkbox,
  Textarea,
  Radio,
  RadioGroup,
  Stack,
  Card,
  CardBody,
  CardHeader,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiSave,
  FiCheck,
  FiEye,
  FiChevronLeft,
  FiChevronRight,
  FiUserPlus,
  FiX,
} from "react-icons/fi";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const EmployeeRegistration = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isSuccessOpen, onOpen: onSuccessOpen, onClose: onSuccessClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  
  // Error states
  const [errors, setErrors] = useState({});
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [formData, setFormData] = useState({
    // Basic Information
    employeeName: "",
    employeeNameEnglish: "",
    registrationNumber: "",
    employeeGroup: "",
    employeeCode: "",
    employeeCodeEnglish: "",
    
    // Banking Details
    bankNameEnglish: "",
    accountNumber: "",
    ifscCode: "",
    
    // Employment Details
    salaryScale: "",
    mobileNumber: "",
    pfAccount: "",
    date: "",
    adp: "",
    gradePay: "",
    totalBasic: "",
    remarks: "",
    isActive: true,
    
    // Monthly Earnings
    dearnessAllowance: "",
    houseRent: "",
    medicalAllowance: "",
    travelAllowance: "",
    basicPay: "",
    
    // Monthly Deductions
    employeeProvidentFund: "",
    otherDeductions: "",
    esi: "",
    professionalTax: "",
    welfareFund: "",
    
    // Family Information
    mukhiyaName: "",
    maritalStatus: "hayat",
    birthDate: "",
    age: "",
    totalAnnualAmount: "",
    address: "",
  });

  // Fetch existing employees on load
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/employee`);
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast({
        title: "ભૂલ",
        description: error.response?.data?.message || "કર્મચારીઓ લોડ કરવામાં નિષ્ફળ",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
    
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Validation functions
  const validateName = (name) => {
    if (!name || name.trim() === "") {
      return "કર્મચારીનું નામ ફરજિયાત છે";
    }
    if (name.length < 2) {
      return "નામ ઓછામાં ઓછું 2 અક્ષરનું હોવું જોઈએ";
    }
    if (name.length > 50) {
      return "નામ વધુમાં વધુ 50 અક્ષરનું હોઈ શકે";
    }
    return "";
  };

  const validateEnglishName = (name) => {
    if (name && !/^[A-Za-z\s]+$/.test(name)) {
      return "અંગ્રેજી નામમાં માત્ર અક્ષરો જ હોઈ શકે";
    }
    return "";
  };

  const validateEmployeeCode = (code) => {
    if (!code || code.trim() === "") {
      return "કર્મચારી કોડ ફરજિયાત છે";
    }
    if (!/^[A-Za-z0-9]+$/.test(code)) {
      return "કર્મચારી કોડમાં માત્ર અક્ષરો અને આંકડા જ હોઈ શકે";
    }
    if (code.length < 3) {
      return "કર્મચારી કોડ ઓછામાં ઓછો 3 અક્ષરનો હોવો જોઈએ";
    }
    return "";
  };

  const validateMobileNumber = (mobile) => {
    if (!mobile || mobile.trim() === "") {
      return "મોબાઈલ નંબર ફરજિયાત છે";
    }
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return "માન્ય મોબાઈલ નંબર દાખલ કરો (10 અંક, 6-9 થી શરૂ)";
    }
    return "";
  };

  const validateIFSC = (ifsc) => {
    if (ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
      return "માન્ય IFSC કોડ દાખલ કરો (જેમ કે: SBIN0001234)";
    }
    return "";
  };

  const validateAccountNumber = (accNo) => {
    if (accNo && !/^\d{9,18}$/.test(accNo)) {
      return "ખાતા નંબર 9 થી 18 અંકનો હોવો જોઈએ";
    }
    return "";
  };

  const validatePAN = (pan) => {
    if (pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
      return "માન્ય PAN નંબર દાખલ કરો (જેમ કે: ABCDE1234F)";
    }
    return "";
  };

  const validateNumberField = (value, fieldName) => {
    if (value && isNaN(value)) {
      return `${fieldName} માં માત્ર આંકડા જ હોઈ શકે`;
    }
    if (value && parseFloat(value) < 0) {
      return `${fieldName} ઋણ હોઈ શકે નહીં`;
    }
    return "";
  };

  const validateDate = (date) => {
    if (date) {
      const selectedDate = new Date(date);
      const today = new Date();
      if (selectedDate > today) {
        return "તારીખ ભવિષ્યની હોઈ શકે નહીં";
      }
    }
    return "";
  };

  const validateAge = (age, birthDate) => {
    if (birthDate) {
      const calculatedAge = calculateAge(birthDate);
      if (calculatedAge && calculatedAge < 18) {
        return "ઉંમર 18 વર્ષથી ઓછી હોઈ શકે નહીં";
      }
      if (calculatedAge && calculatedAge > 100) {
        return "ઉંમર 100 વર્ષથી વધુ હોઈ શકે નહીં";
      }
    }
    if (age && (parseInt(age) < 18 || parseInt(age) > 100)) {
      return "ઉંમર 18 થી 100 વર્ષની વચ્ચે હોવી જોઈએ";
    }
    return "";
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Basic Information Validation
    const nameError = validateName(formData.employeeName);
    if (nameError) newErrors.employeeName = nameError;
    
    const englishNameError = validateEnglishName(formData.employeeNameEnglish);
    if (englishNameError) newErrors.employeeNameEnglish = englishNameError;
    
    const codeError = validateEmployeeCode(formData.employeeCode);
    if (codeError) newErrors.employeeCode = codeError;
    
    const mobileError = validateMobileNumber(formData.mobileNumber);
    if (mobileError) newErrors.mobileNumber = mobileError;
    
    // Banking Validation
    const ifscError = validateIFSC(formData.ifscCode);
    if (ifscError) newErrors.ifscCode = ifscError;
    
    const accountError = validateAccountNumber(formData.accountNumber);
    if (accountError) newErrors.accountNumber = accountError;
    
    // Date Validation
    const dateError = validateDate(formData.date);
    if (dateError) newErrors.date = dateError;
    
    const birthDateError = validateDate(formData.birthDate);
    if (birthDateError) newErrors.birthDate = birthDateError;
    
    // Age Validation
    const ageError = validateAge(formData.age, formData.birthDate);
    if (ageError) newErrors.age = ageError;
    
    // Number Fields Validation
    const dearnessError = validateNumberField(formData.dearnessAllowance, "મોંઘવારી ભથ્થું");
    if (dearnessError) newErrors.dearnessAllowance = dearnessError;
    
    const houseRentError = validateNumberField(formData.houseRent, "ઘર ભાડું");
    if (houseRentError) newErrors.houseRent = houseRentError;
    
    const medicalError = validateNumberField(formData.medicalAllowance, "મેડિકલ ભથ્થું");
    if (medicalError) newErrors.medicalAllowance = medicalError;
    
    const travelError = validateNumberField(formData.travelAllowance, "ચોલાઈ ભથ્થું");
    if (travelError) newErrors.travelAllowance = travelError;
    
    const basicPayError = validateNumberField(formData.basicPay, "મૂળભૂત પગાર");
    if (basicPayError) newErrors.basicPay = basicPayError;
    
    const pfError = validateNumberField(formData.employeeProvidentFund, "પ્રોવિડન્ટ ફંડ");
    if (pfError) newErrors.employeeProvidentFund = pfError;
    
    const otherError = validateNumberField(formData.otherDeductions, "અન્ય કપાત");
    if (otherError) newErrors.otherDeductions = otherError;
    
    const esiError = validateNumberField(formData.esi, "ESI");
    if (esiError) newErrors.esi = esiError;
    
    const taxError = validateNumberField(formData.professionalTax, "વ્યવસાય વેરો");
    if (taxError) newErrors.professionalTax = taxError;
    
    const welfareError = validateNumberField(formData.welfareFund, "કલ્યાણ ભંડોળ");
    if (welfareError) newErrors.welfareFund = welfareError;
    
    const annualError = validateNumberField(formData.totalAnnualAmount, "કુલ વાર્ષિક રકમ");
    if (annualError) newErrors.totalAnnualAmount = annualError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      employeeName: "",
      employeeNameEnglish: "",
      registrationNumber: "",
      employeeGroup: "",
      employeeCode: "",
      employeeCodeEnglish: "",
      bankNameEnglish: "",
      accountNumber: "",
      ifscCode: "",
      salaryScale: "",
      mobileNumber: "",
      pfAccount: "",
      date: "",
      adp: "",
      gradePay: "",
      totalBasic: "",
      remarks: "",
      isActive: true,
      dearnessAllowance: "",
      houseRent: "",
      medicalAllowance: "",
      travelAllowance: "",
      basicPay: "",
      employeeProvidentFund: "",
      otherDeductions: "",
      esi: "",
      professionalTax: "",
      welfareFund: "",
      mukhiyaName: "",
      maritalStatus: "hayat",
      birthDate: "",
      age: "",
      totalAnnualAmount: "",
      address: "",
    });
    setErrors({});
  };

  // Calculate age from birth date
  const calculateAge = (birthDate) => {
    if (!birthDate) return "";
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age >= 0 ? age : "";
  };

  const handleBirthDateChange = (e) => {
    const date = e.target.value;
    const age = calculateAge(date);
    
    // Clear errors
    if (errors.birthDate) {
      setErrors({ ...errors, birthDate: "" });
    }
    if (errors.age) {
      setErrors({ ...errors, age: "" });
    }
    
    setFormData({ ...formData, birthDate: date, age: age.toString() });
  };

  const handleNumberInput = (e, fieldName) => {
    let value = e.target.value;
    // Allow only numbers and decimal point
    value = value.replace(/[^0-9.]/g, '');
    // Prevent multiple decimal points
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(2).join('');
    }
    
    if (errors[fieldName]) {
      setErrors({ ...errors, [fieldName]: "" });
    }
    
    setFormData({ ...formData, [fieldName]: value });
  };

  const handleMobileNumberChange = (e) => {
    let value = e.target.value;
    value = value.replace(/[^0-9]/g, '').slice(0, 10);
    
    if (errors.mobileNumber) {
      setErrors({ ...errors, mobileNumber: "" });
    }
    
    setFormData({ ...formData, mobileNumber: value });
  };

  const handleIFSCChange = (e) => {
    let value = e.target.value.toUpperCase();
    value = value.replace(/[^A-Z0-9]/g, '');
    
    if (errors.ifscCode) {
      setErrors({ ...errors, ifscCode: "" });
    }
    
    setFormData({ ...formData, ifscCode: value });
  };

  const handleEmployeeCodeChange = (e) => {
    let value = e.target.value;
    value = value.replace(/[^A-Za-z0-9]/g, '');
    
    if (errors.employeeCode) {
      setErrors({ ...errors, employeeCode: "" });
    }
    
    setFormData({ ...formData, employeeCode: value });
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: "ભૂલ",
        description: "કૃપા કરી તમામ ફીલ્ડ યોગ્ય રીતે ભરો",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    setSaving(true);
    try {
      const employeeData = {
        ...formData,
        dearnessAllowance: formData.dearnessAllowance ? parseFloat(formData.dearnessAllowance) : 0,
        houseRent: formData.houseRent ? parseFloat(formData.houseRent) : 0,
        medicalAllowance: formData.medicalAllowance ? parseFloat(formData.medicalAllowance) : 0,
        travelAllowance: formData.travelAllowance ? parseFloat(formData.travelAllowance) : 0,
        basicPay: formData.basicPay ? parseFloat(formData.basicPay) : 0,
        employeeProvidentFund: formData.employeeProvidentFund ? parseFloat(formData.employeeProvidentFund) : 0,
        otherDeductions: formData.otherDeductions ? parseFloat(formData.otherDeductions) : 0,
        esi: formData.esi ? parseFloat(formData.esi) : 0,
        professionalTax: formData.professionalTax ? parseFloat(formData.professionalTax) : 0,
        welfareFund: formData.welfareFund ? parseFloat(formData.welfareFund) : 0,
        totalAnnualAmount: formData.totalAnnualAmount ? parseFloat(formData.totalAnnualAmount) : 0,
        age: formData.age ? parseInt(formData.age) : 0,
      };
      
      const response = await axios.post(`${API_BASE_URL}/employee`, employeeData);
      
      toast({
        title: "સફળ",
        description: `કર્મચારી ${response.data.employeeName} સફળતાપૂર્વક નોંધાયો!`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      onFormClose();
      onSuccessOpen();
      await fetchEmployees();
      resetForm();
    } catch (error) {
      console.error("Error saving employee:", error);
      toast({
        title: "ભૂલ",
        description: error.response?.data?.message || "કર્મચારી નોંધણી નિષ્ફળ",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleView = (employee) => {
    setViewingEmployee(employee);
    onViewOpen();
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = employees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(employees.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  return (
    <Box bg="#F8FAF9" minH="100vh" p={6}>
      {/* Header */}
      <Flex align="center" mb={6} gap={4} flexWrap="wrap">
        <Button
          leftIcon={<FiArrowLeft />}
          variant="ghost"
          onClick={() => navigate("/pe-roll")}
          color="#1E4D2B"
          rounded="xl"
          fontWeight="700"
        >
          પાછા
        </Button>
        <Heading size="lg" color="#1E4D2B" fontWeight="700">
          કર્મચારી રજીસ્ટ્રેશન
        </Heading>
        <Button
          leftIcon={<FiUserPlus />}
          colorScheme="green"
          onClick={() => {
            resetForm();
            onFormOpen();
          }}
          ml="auto"
          rounded="xl"
          fontWeight="600"
        >
          નવો કર્મચારી
        </Button>
      </Flex>

      {/* Welcome Box */}
      <Box
        bg="white"
        p={5}
        rounded="2xl"
        shadow="md"
        border="1px solid #E3EDE8"
        mb={6}
      >
        <Heading size="md" color="green.700" mb={2}>
          કર્મચારી નોંધણી
        </Heading>
        <Text fontSize="md" color="gray.600">
          અહીંથી તમે નવા કર્મચારીની સંપૂર્ણ માહિતી નોંધી શકો છો. નવો કર્મચારી ઉમેરવા માટે ઉપરના "નવો કર્મચારી" બટન પર ક્લિક કરો.
        </Text>
      </Box>

      {/* Statistics Cards */}
      {!loading && employees.length > 0 && (
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={6}>
          <Card bg="white" rounded="xl" shadow="sm">
            <CardBody>
              <Text color="gray.500" fontSize="sm">કુલ કર્મચારીઓ</Text>
              <Heading size="lg" color="green.700">{employees.length}</Heading>
            </CardBody>
          </Card>
          <Card bg="white" rounded="xl" shadow="sm">
            <CardBody>
              <Text color="gray.500" fontSize="sm">સક્રિય કર્મચારીઓ</Text>
              <Heading size="lg" color="green.700">
                {employees.filter(emp => emp.isActive).length}
              </Heading>
            </CardBody>
          </Card>
          <Card bg="white" rounded="xl" shadow="sm">
            <CardBody>
              <Text color="gray.500" fontSize="sm">નિષ્ક્રિય કર્મચારીઓ</Text>
              <Heading size="lg" color="red.500">
                {employees.filter(emp => !emp.isActive).length}
              </Heading>
            </CardBody>
          </Card>
          <Card bg="white" rounded="xl" shadow="sm">
            <CardBody>
              <Text color="gray.500" fontSize="sm">કુલ માસિક પગાર</Text>
              <Heading size="lg" color="green.700">
                ₹{employees.reduce((sum, emp) => sum + (emp.basicPay || 0), 0).toLocaleString()}
              </Heading>
            </CardBody>
          </Card>
        </SimpleGrid>
      )}

      {/* Employees List Table */}
      <Card rounded="2xl" shadow="lg" overflow="hidden">
        <CardHeader bg="#1E4D2B" py={4}>
          <Heading size="md" color="white">
            નોંધાયેલ કર્મચારીઓની યાદી
          </Heading>
          <Text fontSize="sm" color="whiteAlpha.800" mt={1}>
            તમામ સેવ થયેલ કર્મચારીઓની વિગત
          </Text>
        </CardHeader>

        <CardBody p={0}>
          {loading ? (
            <Box textAlign="center" py={10}>
              <Spinner size="xl" color="green.500" />
              <Text mt={4}>કર્મચારીઓ લોડ થઈ રહ્યા છે...</Text>
            </Box>
          ) : (
            <>
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th>ક્રમાંક</Th>
                      <Th>કર્મચારી નામ</Th>
                      <Th>કર્મચારી કોડ</Th>
                      <Th>મોબાઈલ નં.</Th>
                      <Th>મૂળભૂત પગાર</Th>
                      <Th>સ્થિતિ</Th>
                      <Th>ક્રિયા</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {currentItems.length === 0 ? (
                      <Tr>
                        <Td colSpan={7} textAlign="center" py={10} color="gray.500">
                          કોઈ કર્મચારી નથી. નવો ઉમેરવા માટે "નવો કર્મચારી" બટન દબાવો.
                        </Td>
                      </Tr>
                    ) : (
                      currentItems.map((emp, index) => (
                        <Tr key={emp._id} _hover={{ bg: "gray.50" }}>
                          <Td fontWeight="medium">{indexOfFirstItem + index + 1}</Td>
                          <Td>
                            <Text fontWeight="500">{emp.employeeName || emp.employeeNameEnglish || "-"}</Text>
                          </Td>
                          <Td>
                            <Badge colorScheme="blue">{emp.employeeCode || "-"}</Badge>
                          </Td>
                          <Td>{emp.mobileNumber || "-"}</Td>
                          <Td>₹{emp.basicPay ? emp.basicPay.toLocaleString() : "0"}</Td>
                          <Td>
                            <Badge colorScheme={emp.isActive ? "green" : "red"}>
                              {emp.isActive ? "સક્રિય" : "નિષ્ક્રિય"}
                            </Badge>
                          </Td>
                          <Td>
                            <IconButton
                              icon={<FiEye />}
                              size="sm"
                              colorScheme="green"
                              variant="ghost"
                              onClick={() => handleView(emp)}
                              aria-label="View"
                            />
                          </Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </Box>

              {/* Pagination */}
              {employees.length > 0 && (
                <Flex
                  justify="space-between"
                  align="center"
                  p={4}
                  borderTop="1px solid"
                  borderColor="gray.200"
                  bg="gray.50"
                  flexWrap="wrap"
                  gap={4}
                >
                  <Flex align="center" gap={2}>
                    <Text fontSize="sm" color="gray.600">દર્શાવો:</Text>
                    <Select
                      value={itemsPerPage}
                      onChange={handleItemsPerPageChange}
                      size="sm"
                      w="70px"
                      rounded="md"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </Select>
                    <Text fontSize="sm" color="gray.600">પ્રતિ પાનું</Text>
                  </Flex>

                  <Flex align="center" gap={2}>
                    <Button
                      size="sm"
                      variant="outline"
                      isDisabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      leftIcon={<FiChevronLeft />}
                      rounded="lg"
                    >
                      પહેલાનું
                    </Button>
                    <Text fontSize="sm" color="gray.600">
                      પાનું {currentPage} માંથી {totalPages || 1}
                    </Text>
                    <Button
                      size="sm"
                      variant="outline"
                      isDisabled={currentPage === totalPages || totalPages === 0}
                      onClick={() => handlePageChange(currentPage + 1)}
                      rightIcon={<FiChevronRight />}
                      rounded="lg"
                    >
                      આગળનું
                    </Button>
                  </Flex>
                </Flex>
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* Registration Form Modal */}
      <Modal isOpen={isFormOpen} onClose={onFormClose} size="4xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent borderRadius="2xl" maxH="90vh">
          <ModalHeader bg="#1E4D2B" color="white" borderTopRadius="2xl">
            <Flex justify="space-between" align="center">
              <Heading size="md" color="white">
                નવો કર્મચારી નોંધણી
              </Heading>
              <IconButton
                icon={<FiX />}
                variant="ghost"
                color="white"
                onClick={onFormClose}
                aria-label="Close"
                _hover={{ bg: "whiteAlpha.300" }}
              />
            </Flex>
          </ModalHeader>
          
          <ModalBody py={6} px={6}>
            {/* Alert Info */}
            <Alert status="info" mb={6} borderRadius="lg">
              <AlertIcon />
              કૃપા કરી તમામ ફીલ્ડ યોગ્ય રીતે ભરો. (* ચિહ્ન વાળા ફીલ્ડ ફરજિયાત છે)
            </Alert>

            {/* Section 1: કર્મચારી માહિતી */}
            <Heading size="sm" color="green.700" mb={4} borderLeft="4px solid #1E4D2B" pl={3}>
              કર્મચારી માહિતી
            </Heading>
            
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={5} mb={8}>
              <FormControl isRequired isInvalid={errors.employeeName}>
                <FormLabel fontSize="sm" fontWeight="600">કર્મચારીનું નામ</FormLabel>
                <Input 
                  name="employeeName" 
                  value={formData.employeeName} 
                  onChange={handleChange}
                  bg="gray.50"
                  placeholder="જેમ કે: રમેશભાઈ પટેલ"
                />
                <FormErrorMessage>{errors.employeeName}</FormErrorMessage>
              </FormControl>
              
              <FormControl isInvalid={errors.employeeNameEnglish}>
                <FormLabel fontSize="sm" fontWeight="600">કર્મચારીનું નામ (અંગ્રેજી માં)</FormLabel>
                <Input 
                  name="employeeNameEnglish" 
                  value={formData.employeeNameEnglish} 
                  onChange={handleChange}
                  bg="gray.50"
                  placeholder="e.g., Rameshbhai Patel"
                />
                <FormErrorMessage>{errors.employeeNameEnglish}</FormErrorMessage>
              </FormControl>
              
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600">નોંધણી તારીખ</FormLabel>
                <Input 
                  name="registrationNumber" 
                  value={formData.registrationNumber} 
                  onChange={handleChange}
                  bg="gray.50"
                  placeholder="નોંમણી નંબર"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600">કર્મચારી ગુપનું નામ</FormLabel>
                <Input 
                  name="employeeGroup" 
                  value={formData.employeeGroup} 
                  onChange={handleChange}
                  bg="gray.50"
                  placeholder="જેમ કે: વરિષ્ઠ, કનિષ્ઠ"
                />
              </FormControl>
              
              <FormControl isRequired isInvalid={errors.employeeCode}>
                <FormLabel fontSize="sm" fontWeight="600">કર્મચારી હોદ્દો</FormLabel>
                <Input 
                  name="employeeCode" 
                  value={formData.employeeCode} 
                  onChange={handleEmployeeCodeChange}
                  bg="gray.50"
                  placeholder="જેમ કે: EMP001"
                />
                <FormErrorMessage>{errors.employeeCode}</FormErrorMessage>
              </FormControl>
              
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600">કર્મચારી હોદ્દો(અંગ્રેજી માં)</FormLabel>
                <Input 
                  name="employeeCodeEnglish" 
                  value={formData.employeeCodeEnglish} 
                  onChange={handleChange}
                  bg="gray.50"
                  placeholder="e.g., EMP001"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600">બેંકનું નામ (અંગ્રેજી માં)</FormLabel>
                <Input 
                  name="bankNameEnglish" 
                  value={formData.bankNameEnglish} 
                  onChange={handleChange}
                  bg="gray.50"
                  placeholder="e.g., State Bank of India"
                />
              </FormControl>
              
              <FormControl isInvalid={errors.accountNumber}>
                <FormLabel fontSize="sm" fontWeight="600">અકાઉન્ટ નંબર</FormLabel>
                <Input 
                  name="accountNumber" 
                  value={formData.accountNumber} 
                  onChange={handleChange}
                  bg="gray.50"
                  placeholder="બેંક ખાતા નંબર"
                />
                <FormErrorMessage>{errors.accountNumber}</FormErrorMessage>
              </FormControl>
              
              <FormControl isInvalid={errors.ifscCode}>
                <FormLabel fontSize="sm" fontWeight="600">IFSC કોડ</FormLabel>
                <Input 
                  name="ifscCode" 
                  value={formData.ifscCode} 
                  onChange={handleIFSCChange}
                  bg="gray.50"
                  placeholder="જેમ કે: SBIN0001234"
                />
                <FormErrorMessage>{errors.ifscCode}</FormErrorMessage>
              </FormControl>
              
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600">પગાર સ્કેલ</FormLabel>
                <Input 
                  name="salaryScale" 
                  value={formData.salaryScale} 
                  onChange={handleChange}
                  bg="gray.50"
                  placeholder="પગાર ધોરણ"
                />
              </FormControl>
              
              <FormControl isRequired isInvalid={errors.mobileNumber}>
                <FormLabel fontSize="sm" fontWeight="600">મોબાઈલ નંબર</FormLabel>
                <Input 
                  type="tel" 
                  name="mobileNumber" 
                  value={formData.mobileNumber} 
                  onChange={handleMobileNumberChange}
                  bg="gray.50"
                  placeholder="જેમ કે: 9876543210"
                  maxLength={10}
                />
                <FormErrorMessage>{errors.mobileNumber}</FormErrorMessage>
              </FormControl>
              
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600">પી.એફ. ઉધારની સિલ્લક</FormLabel>
                <Input 
                  name="pfAccount" 
                  value={formData.pfAccount} 
                  onChange={handleChange}
                  bg="gray.50"
                  placeholder="પ્રોવિડન્ટ ફંડ એકાઉન્ટ નંબર"
                />
              </FormControl>
              
              <FormControl isInvalid={errors.date}>
                <FormLabel fontSize="sm" fontWeight="600">તારીખ</FormLabel>
                <Input 
                  type="date" 
                  name="date" 
                  value={formData.date} 
                  onChange={handleChange}
                  bg="gray.50"
                />
                <FormErrorMessage>{errors.date}</FormErrorMessage>
              </FormControl>
              
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600">એડ પે</FormLabel>
                <Input 
                  name="adp" 
                  value={formData.adp} 
                  onChange={(e) => handleNumberInput(e, "adp")}
                  bg="gray.50"
                  placeholder="એડ પે રકમ"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600">ગ્રેડ પે</FormLabel>
                <Input 
                  name="gradePay" 
                  value={formData.gradePay} 
                  onChange={(e) => handleNumberInput(e, "gradePay")}
                  bg="gray.50"
                  placeholder="ગ્રેડ પે રકમ"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600">બેઝિક પે </FormLabel>
                <Input 
                  name="totalBasic" 
                  value={formData.totalBasic} 
                  onChange={(e) => handleNumberInput(e, "totalBasic")}
                  bg="gray.50"
                  placeholder="કુલ મૂળભૂત પગાર"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600">રિમાર્કસ</FormLabel>
                <Input 
                  name="remarks" 
                  value={formData.remarks} 
                  onChange={handleChange}
                  bg="gray.50"
                  placeholder="કોઈપણ વિશેષ સૂચના"
                />
              </FormControl>
              
              <FormControl>
                <Checkbox 
                  name="isActive" 
                  isChecked={formData.isActive} 
                  onChange={handleChange} 
                  colorScheme="green"
                  size="lg"
                >
                  સક્રિય છે
                </Checkbox>
              </FormControl>
            </Grid>

            <Divider my={6} />

            {/* Section 2: માસિક મળવા પાત્ર રકમ */}
            <Heading size="sm" color="green.700" mb={4} borderLeft="4px solid #1E4D2B" pl={3}>
              માસિક મળવા પાત્ર રકમ
            </Heading>
            
            <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={5} mb={8}>
              <FormControl isInvalid={errors.dearnessAllowance}>
                <FormLabel fontSize="sm" fontWeight="600">મોંઘવારી ભથ્થું</FormLabel>
                <Input 
                  type="text" 
                  name="dearnessAllowance" 
                  value={formData.dearnessAllowance} 
                  onChange={(e) => handleNumberInput(e, "dearnessAllowance")} 
                  placeholder="₹"
                  bg="gray.50"
                />
                <FormErrorMessage>{errors.dearnessAllowance}</FormErrorMessage>
              </FormControl>
              
              <FormControl isInvalid={errors.houseRent}>
                <FormLabel fontSize="sm" fontWeight="600">ઘર ભાડું</FormLabel>
                <Input 
                  type="text" 
                  name="houseRent" 
                  value={formData.houseRent} 
                  onChange={(e) => handleNumberInput(e, "houseRent")} 
                  placeholder="₹"
                  bg="gray.50"
                />
                <FormErrorMessage>{errors.houseRent}</FormErrorMessage>
              </FormControl>
              
              <FormControl isInvalid={errors.medicalAllowance}>
                <FormLabel fontSize="sm" fontWeight="600">મેડિકલ ભથ્થું</FormLabel>
                <Input 
                  type="text" 
                  name="medicalAllowance" 
                  value={formData.medicalAllowance} 
                  onChange={(e) => handleNumberInput(e, "medicalAllowance")} 
                  placeholder="₹"
                  bg="gray.50"
                />
                <FormErrorMessage>{errors.medicalAllowance}</FormErrorMessage>
              </FormControl>
              
              <FormControl isInvalid={errors.travelAllowance}>
                <FormLabel fontSize="sm" fontWeight="600">ચોલાઈ ભથ્થું</FormLabel>
                <Input 
                  type="text" 
                  name="travelAllowance" 
                  value={formData.travelAllowance} 
                  onChange={(e) => handleNumberInput(e, "travelAllowance")} 
                  placeholder="₹"
                  bg="gray.50"
                />
                <FormErrorMessage>{errors.travelAllowance}</FormErrorMessage>
              </FormControl>
              
              <FormControl isInvalid={errors.basicPay}>
                <FormLabel fontSize="sm" fontWeight="600">મૂળભૂત પગાર</FormLabel>
                <Input 
                  type="text" 
                  name="basicPay" 
                  value={formData.basicPay} 
                  onChange={(e) => handleNumberInput(e, "basicPay")} 
                  placeholder="₹"
                  bg="gray.50"
                />
                <FormErrorMessage>{errors.basicPay}</FormErrorMessage>
              </FormControl>
            </Grid>

            <Divider my={6} />

            {/* Section 3: માસિક કપાત પાત્ર રકમ */}
            <Heading size="sm" color="green.700" mb={4} borderLeft="4px solid #1E4D2B" pl={3}>
              માસિક કપાત પાત્ર રકમ
            </Heading>
            
            <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={5} mb={8}>
              <FormControl isInvalid={errors.employeeProvidentFund}>
                <FormLabel fontSize="sm" fontWeight="600">પ્રોવિડન્ટ ફંડ</FormLabel>
                <Input 
                  type="text" 
                  name="employeeProvidentFund" 
                  value={formData.employeeProvidentFund} 
                  onChange={(e) => handleNumberInput(e, "employeeProvidentFund")} 
                  placeholder="₹"
                  bg="gray.50"
                />
                <FormErrorMessage>{errors.employeeProvidentFund}</FormErrorMessage>
              </FormControl>
              
              <FormControl isInvalid={errors.otherDeductions}>
                <FormLabel fontSize="sm" fontWeight="600">અન્ય કપાત</FormLabel>
                <Input 
                  type="text" 
                  name="otherDeductions" 
                  value={formData.otherDeductions} 
                  onChange={(e) => handleNumberInput(e, "otherDeductions")} 
                  placeholder="₹"
                  bg="gray.50"
                />
                <FormErrorMessage>{errors.otherDeductions}</FormErrorMessage>
              </FormControl>
              
              <FormControl isInvalid={errors.esi}>
                <FormLabel fontSize="sm" fontWeight="600">ESI</FormLabel>
                <Input 
                  type="text" 
                  name="esi" 
                  value={formData.esi} 
                  onChange={(e) => handleNumberInput(e, "esi")} 
                  placeholder="₹"
                  bg="gray.50"
                />
                <FormErrorMessage>{errors.esi}</FormErrorMessage>
              </FormControl>
              
              <FormControl isInvalid={errors.professionalTax}>
                <FormLabel fontSize="sm" fontWeight="600">વ્યવસાય વેરો</FormLabel>
                <Input 
                  type="text" 
                  name="professionalTax" 
                  value={formData.professionalTax} 
                  onChange={(e) => handleNumberInput(e, "professionalTax")} 
                  placeholder="₹"
                  bg="gray.50"
                />
                <FormErrorMessage>{errors.professionalTax}</FormErrorMessage>
              </FormControl>
              
              <FormControl isInvalid={errors.welfareFund}>
                <FormLabel fontSize="sm" fontWeight="600">કલ્યાણ ભંડોળ</FormLabel>
                <Input 
                  type="text" 
                  name="welfareFund" 
                  value={formData.welfareFund} 
                  onChange={(e) => handleNumberInput(e, "welfareFund")} 
                  placeholder="₹"
                  bg="gray.50"
                />
                <FormErrorMessage>{errors.welfareFund}</FormErrorMessage>
              </FormControl>
            </Grid>

            <Divider my={6} />

            {/* Section 4: પેઢીનામું */}
            <Heading size="sm" color="green.700" mb={4} borderLeft="4px solid #1E4D2B" pl={3}>
              પેઢીનામું (કુટુંબ માહિતી)
            </Heading>
            
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={5}>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600">મુખિયાનું નામ</FormLabel>
                <Input 
                  name="mukhiyaName" 
                  value={formData.mukhiyaName} 
                  onChange={handleChange}
                  bg="gray.50"
                  placeholder="પરિવારના મુખિયાનું નામ"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600">સ્થિતિ</FormLabel>
                <RadioGroup 
                  name="maritalStatus" 
                  value={formData.maritalStatus} 
                  onChange={(val) => setFormData({ ...formData, maritalStatus: val })}
                >
                  <Stack direction="row" spacing={6} mt={2}>
                    <Radio value="hayat" colorScheme="green">હયાત</Radio>
                    <Radio value="mut" colorScheme="green">મૃત</Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>
              
              <FormControl isInvalid={errors.birthDate}>
                <FormLabel fontSize="sm" fontWeight="600">જન્મ તારીખ</FormLabel>
                <Input 
                  type="date" 
                  name="birthDate" 
                  value={formData.birthDate} 
                  onChange={handleBirthDateChange}
                  bg="gray.50"
                />
                <FormErrorMessage>{errors.birthDate}</FormErrorMessage>
              </FormControl>
              
              <FormControl isInvalid={errors.age}>
                <FormLabel fontSize="sm" fontWeight="600">ઉમર</FormLabel>
                <Input 
                  type="text" 
                  name="age" 
                  value={formData.age} 
                  onChange={(e) => handleNumberInput(e, "age")} 
                  placeholder="ઉમર (વર્ષ)"
                  bg="gray.50"
                  readOnly={formData.birthDate !== ""}
                />
                <FormErrorMessage>{errors.age}</FormErrorMessage>
              </FormControl>
              
              <FormControl isInvalid={errors.totalAnnualAmount}>
                <FormLabel fontSize="sm" fontWeight="600">કુલ વાર્ષિક રકમ</FormLabel>
                <Input 
                  type="text" 
                  name="totalAnnualAmount" 
                  value={formData.totalAnnualAmount} 
                  onChange={(e) => handleNumberInput(e, "totalAnnualAmount")} 
                  placeholder="₹"
                  bg="gray.50"
                />
                <FormErrorMessage>{errors.totalAnnualAmount}</FormErrorMessage>
              </FormControl>
              
              <FormControl gridColumn={{ md: "span 2" }}>
                <FormLabel fontSize="sm" fontWeight="600">સરનામું</FormLabel>
                <Textarea 
                  name="address" 
                  value={formData.address} 
                  onChange={handleChange} 
                  rows={3} 
                  placeholder="સંપૂર્ણ સરનામું"
                  bg="gray.50"
                />
              </FormControl>
            </Grid>
          </ModalBody>

          <ModalFooter borderTop="1px solid" borderColor="gray.200" gap={3}>
            <Button
              variant="outline"
              colorScheme="red"
              onClick={onFormClose}
              size="lg"
              px={8}
              rounded="xl"
            >
              કેન્સલ
            </Button>
            <Button
              colorScheme="green"
              onClick={handleSave}
              isLoading={saving}
              loadingText="સેવ થઈ રહ્યું છે..."
              leftIcon={<FiSave />}
              size="lg"
              px={8}
              rounded="xl"
              fontWeight="600"
            >
              સેવ કરો
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View Modal - Same as before */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="2xl" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader bg="#1E4D2B" color="white" borderTopRadius="2xl">
            કર્મચારી વિગત
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py={6}>
            {viewingEmployee && (
              <SimpleGrid columns={2} spacing={4}>
                <Text fontWeight="bold" color="gray.600">કર્મચારી નામ:</Text>
                <Text>{viewingEmployee.employeeName || "-"}</Text>
                
                <Text fontWeight="bold" color="gray.600">કર્મચારી કોડ:</Text>
                <Text>{viewingEmployee.employeeCode || "-"}</Text>
                
                <Text fontWeight="bold" color="gray.600">મોબાઈલ નંબર:</Text>
                <Text>{viewingEmployee.mobileNumber || "-"}</Text>
                
                <Text fontWeight="bold" color="gray.600">બેંક ખાતું:</Text>
                <Text>{viewingEmployee.accountNumber || "-"}</Text>
                
                <Text fontWeight="bold" color="gray.600">IFSC કોડ:</Text>
                <Text>{viewingEmployee.ifscCode || "-"}</Text>
                
                <Text fontWeight="bold" color="gray.600">મૂળભૂત પગાર:</Text>
                <Text>₹{viewingEmployee.basicPay ? viewingEmployee.basicPay.toLocaleString() : "0"}</Text>
                
                <Text fontWeight="bold" color="gray.600">પી.એફ. ઉધારની સિલ્લક:</Text>
                <Text>{viewingEmployee.pfAccount || "-"}</Text>
                
                <Text fontWeight="bold" color="gray.600">સ્થિતિ:</Text>
                <Badge colorScheme={viewingEmployee.isActive ? "green" : "red"} w="fit-content">
                  {viewingEmployee.isActive ? "સક્રિય" : "નિષ્ક્રિય"}
                </Badge>
                
                {viewingEmployee.address && (
                  <>
                    <Text fontWeight="bold" color="gray.600">સરનામું:</Text>
                    <Text>{viewingEmployee.address}</Text>
                  </>
                )}
                
                <Text fontWeight="bold" color="gray.600">નોંધણી તારીખ:</Text>
                <Text>{new Date(viewingEmployee.createdAt).toLocaleDateString()}</Text>
              </SimpleGrid>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="green" onClick={onViewClose} rounded="lg">
              બંધ કરો
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Success Modal */}
      <Modal isOpen={isSuccessOpen} onClose={onSuccessClose} size="md" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalBody py={8} px={6}>
            <Flex direction="column" align="center" textAlign="center">
              <Box bg="green.100" p={3} rounded="full" mb={4}>
                <FiCheck size={40} color="#1E4D2B" />
              </Box>
              <Heading size="md" color="green.700" mb={2}>
                સફળતાપૂર્વક સેવ થયું!
              </Heading>
              <Text color="gray.600" mb={4}>
                કર્મચારીની માહિતી સફળતાપૂર્વક નોંધવામાં આવી છે.
              </Text>
              <Button colorScheme="green" onClick={onSuccessClose} px={8} rounded="lg">
                બંધ કરો
              </Button>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default EmployeeRegistration;  