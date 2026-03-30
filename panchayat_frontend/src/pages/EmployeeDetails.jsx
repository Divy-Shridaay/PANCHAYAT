// EmployeeDetails.jsx
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
  Card,
  CardBody,
  CardHeader,
  Alert,
  AlertIcon,
  HStack,
  VStack,
  Tag,
  TagLabel,
  Divider,
  Tooltip,
  InputGroup,
  InputLeftElement,
  FormControl,
  FormLabel,
  FormErrorMessage,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Checkbox,
  Grid,
  GridItem,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { ViewIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";
import {
  FiArrowLeft,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiDollarSign,
  FiCalendar,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCreditCard,
  FiBriefcase,
  FiAward,
  FiSave,
  FiX,
  FiRefreshCw,
} from "react-icons/fi";
import axios from "axios";
import Pagination from "../components/Pagination";

const API_BASE_URL = "http://localhost:5000/api";

// Dropdown options
const employeeGroups = [
  { value: "Group_a", label: "ગ્રુપ એ" },
  { value: "Group_b", label: "ગ્રુપ બી" },
  { value: "Group_c", label: "ગ્રુપ સી" },
  { value: "Group_d", label: "ગ્રુપ ડી" },
];

const positionsGujarati = [
  { value: "Manager", label: "મેનેજર" },
  { value: "Officer", label: "ઓફિસર" },
  { value: "Clerk", label: "ક્લાર્ક" },
  { value: "Supervisor", label: "સુપરવાઇઝર" },
  { value: "Assistant", label: "એસિસ્ટન્ટ" },
  { value: "Peon", label: "પિયોન" },
];

const positionsEnglish = [
  { value: "Manager", label: "Manager" },
  { value: "Officer", label: "Officer" },
  { value: "Clerk", label: "Clerk" },
  { value: "Supervisor", label: "Supervisor" },
  { value: "Assistant", label: "Assistant" },
  { value: "Peon", label: "Peon" },
];

const bankNames = [
  { value: "sbi", label: "State Bank of India" },
  { value: "boi", label: "Bank of India" },
  { value: "bob", label: "Bank of Baroda" },
  { value: "hdfc", label: "HDFC Bank" },
  { value: "icici", label: "ICICI Bank" },
  { value: "axis", label: "Axis Bank" },
];

const salaryScales = [
  { value: "scale_1", label: "સ્કેલ ૧ (૨૦૦૦૦ - ૪૦૦૦૦)" },
  { value: "scale_2", label: "સ્કેલ ૨ (૪૦૦૦૧ - ૬૦૦૦૦)" },
  { value: "scale_3", label: "સ્કેલ ૩ (૬૦૦૦૧ - ૮૦૦૦૦)" },
  { value: "scale_4", label: "સ્કેલ ૪ (૮૦૦૦૧ - ૧૦૦૦૦૦)" },
];

const EmployeeDetails = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();
  const { isOpen: isDeleteAlertOpen, onOpen: onDeleteAlertOpen, onClose: onDeleteAlertClose } = useDisclosure();
  const cancelRef = React.useRef();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [errors, setErrors] = useState({});

  const [editFormData, setEditFormData] = useState({
    // Basic Information
    employeeName: "",
    employeeNameEnglish: "",
    registrationDate: "",
    employeeGroup: "",
    employeePositionEnglish: "",
    employeePositionGujarati: "",
    bankNameEnglish: "",
    accountNumber: "",
    ifscCode: "",
    salaryScale: "",
    basicPay: "",
    gradePay: "",
    totalBasic: "",
    mobileNumber: "",
    pfAccount: "",
    remarks: "",
    isActive: true,
    
    // Monthly Earnings
    dearnessAllowance: "",
    houseRent: "",
    medicalAllowance: "",
    travelAllowance: "",
    cleaningAllowance: "",
    
    // Monthly Deductions
    employeeContribution: "",
    otherContribution: "",
    pli: "",
    professionalTax: "",
    cooperativeInstallment: "",
  });

  // Auto-calculate totalBasic when basicPay or gradePay changes
  useEffect(() => {
    const basic = parseFloat(editFormData.basicPay) || 0;
    const grade = parseFloat(editFormData.gradePay) || 0;
    const total = basic + grade;
    setEditFormData(prev => ({
      ...prev,
      totalBasic: total.toString()
    }));
  }, [editFormData.basicPay, editFormData.gradePay]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/employee`);
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
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

  const filteredEmployees = employees.filter(emp =>
    emp.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeNameEnglish?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeePositionGujarati?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeePositionEnglish?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.mobileNumber?.includes(searchTerm)
  );

  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee);
    onModalOpen();
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setEditFormData({
      employeeName: employee.employeeName || "",
      employeeNameEnglish: employee.employeeNameEnglish || "",
      registrationDate: employee.registrationDate ? employee.registrationDate.split('T')[0] : "",
      employeeGroup: employee.employeeGroup || "",
      employeePositionEnglish: employee.employeePositionEnglish || "",
      employeePositionGujarati: employee.employeePositionGujarati || "",
      bankNameEnglish: employee.bankNameEnglish || "",
      accountNumber: employee.accountNumber || "",
      ifscCode: employee.ifscCode || "",
      salaryScale: employee.salaryScale || "",
      basicPay: employee.basicPay?.toString() || "",
      gradePay: employee.gradePay?.toString() || "",
      totalBasic: employee.totalBasic?.toString() || "",
      mobileNumber: employee.mobileNumber || "",
      pfAccount: employee.pfAccount || "",
      remarks: employee.remarks || "",
      isActive: employee.isActive ?? true,
      dearnessAllowance: employee.dearnessAllowance?.toString() || "",
      houseRent: employee.houseRent?.toString() || "",
      medicalAllowance: employee.medicalAllowance?.toString() || "",
      travelAllowance: employee.travelAllowance?.toString() || "",
      cleaningAllowance: employee.cleaningAllowance?.toString() || "",
      employeeContribution: employee.employeeContribution?.toString() || "",
      otherContribution: employee.otherContribution?.toString() || "",
      pli: employee.pli?.toString() || "",
      professionalTax: employee.professionalTax?.toString() || "",
      cooperativeInstallment: employee.cooperativeInstallment?.toString() || "",
    });
    setErrors({});
    onEditModalOpen();
  };

  const handleDelete = async () => {
    if (!selectedEmployee) return;
    
    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/employee/${selectedEmployee._id}`);
      toast({
        title: "સફળ",
        description: `${selectedEmployee.employeeName} સફળતાપૂર્વક ડિલીટ થયો`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onDeleteAlertClose();
      onModalClose();
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        title: "ભૂલ",
        description: error.response?.data?.message || "કર્મચારી ડિલીટ કરવામાં નિષ્ફળ",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
    setEditFormData({
      ...editFormData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSelectChange = (name, value) => {
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  const handleNumberInput = (fieldName, value) => {
    if (errors[fieldName]) {
      setErrors({ ...errors, [fieldName]: "" });
    }
    let processedValue = value;
    if (value) {
      processedValue = value.replace(/[^0-9.]/g, '');
      const parts = processedValue.split('.');
      if (parts.length > 2) processedValue = parts[0] + '.' + parts.slice(2).join('');
    }
    setEditFormData({ ...editFormData, [fieldName]: processedValue });
  };

  const handleMobileNumberChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
    if (errors.mobileNumber) setErrors({ ...errors, mobileNumber: "" });
    setEditFormData({ ...editFormData, mobileNumber: value });
  };

  const handleIFSCChange = (e) => {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (errors.ifscCode) setErrors({ ...errors, ifscCode: "" });
    setEditFormData({ ...editFormData, ifscCode: value });
  };

  const validateEditForm = () => {
    const newErrors = {};
    
    if (!editFormData.employeeName || editFormData.employeeName.trim() === "") {
      newErrors.employeeName = "કર્મચારીનું નામ ફરજિયાત છે";
    }
    
    if (!editFormData.mobileNumber || editFormData.mobileNumber.trim() === "") {
      newErrors.mobileNumber = "મોબાઈલ નંબર ફરજિયાત છે";
    } else if (!/^[6-9]\d{9}$/.test(editFormData.mobileNumber)) {
      newErrors.mobileNumber = "માન્ય મોબાઈલ નંબર દાખલ કરો (10 અંક, 6-9 થી શરૂ)";
    }
    
    if (editFormData.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(editFormData.ifscCode)) {
      newErrors.ifscCode = "માન્ય IFSC કોડ દાખલ કરો (ઉદા: SBIN0001234)";
    }
    
    if (editFormData.accountNumber && editFormData.accountNumber.length < 9) {
      newErrors.accountNumber = "એકાઉન્ટ નંબર ઓછામાં ઓછો 9 અંકનો હોવો જોઈએ";
    }
    
    if (editFormData.basicPay && parseFloat(editFormData.basicPay) < 0) {
      newErrors.basicPay = "બેઝિક પે ઋણ હોઈ શકે નહીં";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateEditForm()) {
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
      const updateData = {
        ...editFormData,
        basicPay: editFormData.basicPay ? parseFloat(editFormData.basicPay) : 0,
        gradePay: editFormData.gradePay ? parseFloat(editFormData.gradePay) : 0,
        totalBasic: editFormData.totalBasic ? parseFloat(editFormData.totalBasic) : 0,
        dearnessAllowance: editFormData.dearnessAllowance ? parseFloat(editFormData.dearnessAllowance) : 0,
        houseRent: editFormData.houseRent ? parseFloat(editFormData.houseRent) : 0,
        medicalAllowance: editFormData.medicalAllowance ? parseFloat(editFormData.medicalAllowance) : 0,
        travelAllowance: editFormData.travelAllowance ? parseFloat(editFormData.travelAllowance) : 0,
        cleaningAllowance: editFormData.cleaningAllowance ? parseFloat(editFormData.cleaningAllowance) : 0,
        employeeContribution: editFormData.employeeContribution ? parseFloat(editFormData.employeeContribution) : 0,
        otherContribution: editFormData.otherContribution ? parseFloat(editFormData.otherContribution) : 0,
        pli: editFormData.pli ? parseFloat(editFormData.pli) : 0,
        professionalTax: editFormData.professionalTax ? parseFloat(editFormData.professionalTax) : 0,
        cooperativeInstallment: editFormData.cooperativeInstallment ? parseFloat(editFormData.cooperativeInstallment) : 0,
      };
      
      const response = await axios.put(`${API_BASE_URL}/employee/${selectedEmployee._id}`, updateData);
      
      toast({
        title: "સફળ",
        description: `${response.data.employeeName || editFormData.employeeName} ની માહિતી અપડેટ થઈ`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      onEditModalClose();
      fetchEmployees();
    } catch (error) {
      console.error('Error updating employee:', error);
      toast({
        title: "ભૂલ",
        description: error.response?.data?.message || "કર્મચારી અપડેટ કરવામાં નિષ્ફળ",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    return parseFloat(num).toLocaleString('en-IN');
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('gu-IN');
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);
  
  const handleItemsPerPageChange = (newLimit) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
  };

  // Statistics
  const stats = {
    total: employees.length,
    active: employees.filter(emp => emp.isActive).length,
    inactive: employees.filter(emp => !emp.isActive).length,
    totalSalary: employees.reduce((sum, emp) => sum + (emp.basicPay || 0), 0),
  };

  return (
   <Box bg="#F8FAF9" minH="100vh" p={10}>
      {/* Header with Back Button */}
      <Flex align="center" mb={12}>
        {/* 🔙 LEFT : Back Button */}
        <Box width="180px">
          <Button
            leftIcon={<FiArrowLeft />}
            colorScheme="green"
            variant="outline"
            onClick={() => navigate("/pe-roll")}
          >
            પાછા જાવ
          </Button>
        </Box>
        <Heading
          flex="1"
          textAlign="center"
          size="lg"
          color="green.700"
        >
          કર્મચારી વિગત
        </Heading>

        {/* 👉 RIGHT : Empty space (for perfect centering) */}
        <Box width="180px" />
      </Flex>

      {/* Statistics Cards */}
      {!loading && employees.length > 0 && (
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={6}>
          <Card bg="white" rounded="xl" shadow="sm" borderLeft="4px solid #1E4D2B">
            <CardBody>
              <Flex align="center" justify="space-between">
                <Box>
                  <Text color="gray.500" fontSize="sm">કુલ કર્મચારીઓ</Text>
                  <Heading size="lg" color="green.700">{stats.total}</Heading>
                  <Text fontSize="xs" color="gray.400">નોંધાયેલ કુલ</Text>
                </Box>
                <Box bg="green.100" p={2} rounded="full">
                  <FiUsers size={24} color="#1E4D2B" />
                </Box>
              </Flex>
            </CardBody>
          </Card>
          
          <Card bg="white" rounded="xl" shadow="sm" borderLeft="4px solid #38A169">
            <CardBody>
              <Flex align="center" justify="space-between">
                <Box>
                  <Text color="gray.500" fontSize="sm">સક્રિય કર્મચારીઓ</Text>
                  <Heading size="lg" color="green.600">{stats.active}</Heading>
                  <Text fontSize="xs" color="gray.400">કાર્યરત</Text>
                </Box>
                <Box bg="green.100" p={2} rounded="full">
                  <FiUserCheck size={24} color="#38A169" />
                </Box>
              </Flex>
            </CardBody>
          </Card>
          
          <Card bg="white" rounded="xl" shadow="sm" borderLeft="4px solid #E53E3E">
            <CardBody>
              <Flex align="center" justify="space-between">
                <Box>
                  <Text color="gray.500" fontSize="sm">નિષ્ક્રિય કર્મચારીઓ</Text>
                  <Heading size="lg" color="red.500">{stats.inactive}</Heading>
                  <Text fontSize="xs" color="gray.400">નિષ્ક્રિય</Text>
                </Box>
                <Box bg="red.100" p={2} rounded="full">
                  <FiUserX size={24} color="#E53E3E" />
                </Box>
              </Flex>
            </CardBody>
          </Card>
          
          <Card bg="white" rounded="xl" shadow="sm" borderLeft="4px solid #DD6B20">
            <CardBody>
              <Flex align="center" justify="space-between">
                <Box>
                  <Text color="gray.500" fontSize="sm">કુલ માસિક પગાર</Text>
                  <Heading size="lg" color="orange.600">₹{formatNumber(stats.totalSalary)}</Heading>
                  <Text fontSize="xs" color="gray.400">તમામ કર્મચારીઓનો</Text>
                </Box>
                <Box bg="orange.100" p={2} rounded="full">
                  <FiDollarSign size={24} color="#DD6B20" />
                </Box>
              </Flex>
            </CardBody>
          </Card>
        </SimpleGrid>
      )}

      {/* Search Bar */}
      <Card rounded="2xl" shadow="lg" overflow="hidden" mb={6}>
        <CardBody p={4}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.400" />
            </InputLeftElement>
            <Input
              type="text"
              placeholder="કર્મચારી શોધો (નામ, હોદ્દો, મોબાઈલ)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg="gray.50"
              borderColor="gray.200"
              rounded="lg"
              _focus={{ borderColor: "#1E4D2B", boxShadow: "0 0 0 1px #1E4D2B" }}
            />
          </InputGroup>
        </CardBody>
      </Card>

      {/* Employees Table */}
      <Card rounded="2xl" shadow="lg" overflow="hidden">
        <CardBody p={0}>
          {loading ? (
            <Box textAlign="center" py={10}>
              <Spinner size="xl" color="green.500" />
              <Text mt={4}>કર્મચારીઓ લોડ થઈ રહ્યા છે...</Text>
            </Box>
          ) : employees.length === 0 ? (
            <Box textAlign="center" py={10}>
              <Alert status="warning" borderRadius="lg" maxW="md" mx="auto">
                <AlertIcon />
                કોઈ કર્મચારી નથી. નવો કર્મચારી ઉમેરવા માટે "કર્મચારી રજીસ્ટ્રેશન" પર જાઓ.
              </Alert>
            </Box>
          ) : (
            <>
              <Box overflowX="auto">
                <Table variant="simple" colorScheme="green">
                  <Thead bg="#E8F3EC">
                    <Tr>
                      <Th>ક્રમાંક</Th>
                      <Th>કર્મચારી નામ</Th>
                      <Th>હોદ્દો</Th>
                      <Th>મોબાઈલ</Th>
                      <Th isNumeric>બેઝિક પે</Th>
                      <Th>સ્થિતિ</Th>
                      <Th textAlign="center">ક્રિયા</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {currentItems.length === 0 && searchTerm ? (
                      <Tr>
                        <Td colSpan={7} textAlign="center" py={10} color="gray.500">
                          "{searchTerm}" માટે કોઈ કર્મચારી મળ્યો નથી
                        </Td>
                      </Tr>
                    ) : (
                      currentItems.map((emp, index) => (
                        <Tr key={emp._id} _hover={{ bg: "gray.50" }}>
                          <Td fontWeight="medium">{indexOfFirstItem + index + 1}</Td>
                          <Td>
                            <Text fontWeight="500">{emp.employeeName || emp.employeeNameEnglish || '-'}</Text>
                          </Td>
                          <Td>
                            <Badge colorScheme="blue" fontSize="sm" px={2} py={1}>
                              {emp.employeePositionGujarati || emp.employeePositionEnglish || '-'}
                            </Badge>
                          </Td>
                          <Td>{emp.mobileNumber || '-'}</Td>
                          <Td isNumeric fontWeight="600" color="green.600">
                            ₹{formatNumber(emp.basicPay)}
                          </Td>
                          <Td>
                            <Badge 
                              colorScheme={emp.isActive ? "green" : "red"}
                              px={2}
                              py={1}
                              rounded="full"
                            >
                              {emp.isActive ? "સક્રિય" : "નિષ્ક્રિય"}
                            </Badge>
                          </Td>
                          {/* ACTION BUTTONS - SAME STYLE AS PedhinamuList.jsx */}
                          <Td>
                            <HStack spacing={4} justify="center">
                              {/* View Details Button - Green */}
                              <IconButton
                                size="sm"
                                icon={<ViewIcon />}
                                variant="ghost"
                                colorScheme="green"
                                rounded="full"
                                onClick={() => handleViewDetails(emp)}
                                aria-label="View Details"
                              />
                              {/* Edit Button - Blue */}
                              <IconButton
                                size="sm"
                                icon={<EditIcon />}
                                variant="ghost"
                                colorScheme="blue"
                                rounded="full"
                                onClick={() => handleEdit(emp)}
                                aria-label="Edit"
                              />
                              {/* Delete Button - Red */}
                              <IconButton
                                size="sm"
                                icon={<DeleteIcon />}
                                variant="ghost"
                                colorScheme="red"
                                rounded="full"
                                onClick={() => {
                                  setSelectedEmployee(emp);
                                  onDeleteAlertOpen();
                                }}
                                aria-label="Delete"
                              />
                            </HStack>
                          </Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </Box>
            </>
          )}
        </CardBody>
      </Card>

      {/* Pagination Component */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={handleItemsPerPageChange}
      />

      {/* View Modal */}
      <Modal isOpen={isModalOpen} onClose={onModalClose} size="3xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent borderRadius="2xl" maxH="90vh">
          <ModalHeader bg="#1E4D2B" color="white" borderTopRadius="2xl">
            <Flex align="center" justify="space-between">
              <Flex align="center" gap={3}>
                <FiUsers size={20} />
                <Heading size="md" color="white">કર્મચારી વિગત</Heading>
              </Flex>
              <Flex gap={2}>
                <IconButton
                  icon={<FiEdit2 />}
                  size="sm"
                  colorScheme="whiteAlpha"
                  variant="ghost"
                  onClick={() => {
                    onModalClose();
                    handleEdit(selectedEmployee);
                  }}
                  aria-label="Edit"
                />
                <IconButton
                  icon={<FiTrash2 />}
                  size="sm"
                  colorScheme="whiteAlpha"
                  variant="ghost"
                  onClick={() => {
                    onModalClose();
                    onDeleteAlertOpen();
                  }}
                  aria-label="Delete"
                />
              </Flex>
            </Flex>
          </ModalHeader>
          <ModalCloseButton color="white" />
          
          <ModalBody py={6} px={6}>
            {selectedEmployee && (
              <VStack spacing={6} align="stretch">
                {/* Profile Header */}
                <Flex 
                  bg="green.50" 
                  p={4} 
                  rounded="xl" 
                  align="center" 
                  gap={4}
                  border="1px solid"
                  borderColor="green.200"
                >
                  <Box bg="green.700" p={3} rounded="full">
                    <FiUsers size={24} color="white" />
                  </Box>
                  <Box>
                    <Heading size="md" color="green.800">
                      {selectedEmployee.employeeName || selectedEmployee.employeeNameEnglish || '-'}
                    </Heading>
                    <Text color="green.600">
                      હોદ્દો: {selectedEmployee.employeePositionGujarati || selectedEmployee.employeePositionEnglish || '-'}
                    </Text>
                  </Box>
                  <Badge 
                    colorScheme={selectedEmployee.isActive ? "green" : "red"} 
                    fontSize="sm" 
                    px={3} 
                    py={1}
                    rounded="full"
                    ml="auto"
                  >
                    {selectedEmployee.isActive ? "સક્રિય" : "નિષ્ક્રિય"}
                  </Badge>
                </Flex>

                {/* Basic Information */}
                <Box>
                  <Heading size="sm" color="green.700" mb={3} borderLeft="4px solid #1E4D2B" pl={3}>
                    મૂળભૂત માહિતી
                  </Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    {/* <HStack><FiBriefcase /><Text fontWeight="bold" w="140px">કર્મચારી કોડ:</Text><Text>{selectedEmployee._id?.slice(-6) || '-'}</Text></HStack> */}
                    <HStack><FiUserCheck /><Text fontWeight="bold" w="140px">કર્મચારીનું નામ:</Text><Text>{selectedEmployee.employeeName || '-'}</Text></HStack>
                    <HStack><FiMail /><Text fontWeight="bold" w="140px">નામ (અંગ્રેજી):</Text><Text>{selectedEmployee.employeeNameEnglish || '-'}</Text></HStack>
                    <HStack><FiCalendar /><Text fontWeight="bold" w="140px">નોંધણી તારીખ:</Text><Text>{formatDate(selectedEmployee.registrationDate)}</Text></HStack>
                    <HStack><FiAward /><Text fontWeight="bold" w="140px">હોદ્દો (ગુજરાતી):</Text><Text>{selectedEmployee.employeePositionGujarati || '-'}</Text></HStack>
                    <HStack><FiAward /><Text fontWeight="bold" w="140px">હોદ્દો (અંગ્રેજી):</Text><Text>{selectedEmployee.employeePositionEnglish || '-'}</Text></HStack>
                    <HStack><FiUsers /><Text fontWeight="bold" w="140px">કર્મચારી ગ્રુપ:</Text><Text>{selectedEmployee.employeeGroup || '-'}</Text></HStack>
                    <HStack><FiPhone /><Text fontWeight="bold" w="140px">મોબાઈલ નંબર:</Text><Text>{selectedEmployee.mobileNumber || '-'}</Text></HStack>
                    <HStack><FiCreditCard /><Text fontWeight="bold" w="140px">પી.એફ. એકાઉન્ટ:</Text><Text>{selectedEmployee.pfAccount || '-'}</Text></HStack>
                    <HStack><FiBriefcase /><Text fontWeight="bold" w="140px">પગાર સ્કેલ:</Text><Text>{selectedEmployee.salaryScale || '-'}</Text></HStack>
                    <HStack><FiMapPin /><Text fontWeight="bold" w="140px">રીમાર્ક:</Text><Text>{selectedEmployee.remarks || '-'}</Text></HStack>
                  </SimpleGrid>
                </Box>

                <Divider />

                {/* Salary Details */}
                <Box>
                  <Heading size="sm" color="green.700" mb={3} borderLeft="4px solid #1E4D2B" pl={3}>
                    પગાર માહિતી
                  </Heading>
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <Box bg="gray.50" p={3} rounded="lg" textAlign="center">
                      <Text color="gray.500" fontSize="sm">બેઝિક પે</Text>
                      <Text fontSize="xl" fontWeight="bold" color="green.700">₹{formatNumber(selectedEmployee.basicPay)}</Text>
                    </Box>
                    <Box bg="gray.50" p={3} rounded="lg" textAlign="center">
                      <Text color="gray.500" fontSize="sm">ગ્રેડ પે</Text>
                      <Text fontSize="xl" fontWeight="bold" color="green.700">₹{formatNumber(selectedEmployee.gradePay)}</Text>
                    </Box>
                    <Box bg="gray.50" p={3} rounded="lg" textAlign="center">
                      <Text color="gray.500" fontSize="sm">કુલ બેઝિક</Text>
                      <Text fontSize="xl" fontWeight="bold" color="green.700">₹{formatNumber(selectedEmployee.totalBasic)}</Text>
                    </Box>
                  </SimpleGrid>
                </Box>

                <Divider />

                {/* Monthly Earnings */}
                <Box>
                  <Heading size="sm" color="green.700" mb={3} borderLeft="4px solid #1E4D2B" pl={3}>
                    માસિક મળવા પાત્ર રકમ
                  </Heading>
                  <SimpleGrid columns={{ base: 1, md: 5 }} spacing={3}>
                    <Box bg="blue.50" p={2} rounded="lg" textAlign="center">
                      <Text fontSize="xs" color="gray.600">મોંઘવારી</Text>
                      <Text fontWeight="bold" color="blue.700">₹{formatNumber(selectedEmployee.dearnessAllowance)}</Text>
                    </Box>
                    <Box bg="blue.50" p={2} rounded="lg" textAlign="center">
                      <Text fontSize="xs" color="gray.600">ઘર ભાડું</Text>
                      <Text fontWeight="bold" color="blue.700">₹{formatNumber(selectedEmployee.houseRent)}</Text>
                    </Box>
                    <Box bg="blue.50" p={2} rounded="lg" textAlign="center">
                      <Text fontSize="xs" color="gray.600">મેડિકલ</Text>
                      <Text fontWeight="bold" color="blue.700">₹{formatNumber(selectedEmployee.medicalAllowance)}</Text>
                    </Box>
                    <Box bg="blue.50" p={2} rounded="lg" textAlign="center">
                      <Text fontSize="xs" color="gray.600">ધોલાઈ</Text>
                      <Text fontWeight="bold" color="blue.700">₹{formatNumber(selectedEmployee.travelAllowance)}</Text>
                    </Box>
                    <Box bg="blue.50" p={2} rounded="lg" textAlign="center">
                      <Text fontSize="xs" color="gray.600">ઝાડુ</Text>
                      <Text fontWeight="bold" color="blue.700">₹{formatNumber(selectedEmployee.cleaningAllowance)}</Text>
                    </Box>
                  </SimpleGrid>
                </Box>

                <Divider />

                {/* Monthly Deductions */}
                <Box>
                  <Heading size="sm" color="green.700" mb={3} borderLeft="4px solid #1E4D2B" pl={3}>
                    માસિક કપાત પાત્ર રકમ
                  </Heading>
                  <SimpleGrid columns={{ base: 1, md: 5 }} spacing={3}>
                    <Box bg="red.50" p={2} rounded="lg" textAlign="center">
                      <Text fontSize="xs" color="gray.600">કર્મચારી ફાળો</Text>
                      <Text fontWeight="bold" color="red.700">₹{formatNumber(selectedEmployee.employeeContribution)}</Text>
                    </Box>
                    <Box bg="red.50" p={2} rounded="lg" textAlign="center">
                      <Text fontSize="xs" color="gray.600">અન્ય ફાળો</Text>
                      <Text fontWeight="bold" color="red.700">₹{formatNumber(selectedEmployee.otherContribution)}</Text>
                    </Box>
                    <Box bg="red.50" p={2} rounded="lg" textAlign="center">
                      <Text fontSize="xs" color="gray.600">પી.એલ.આઈ.</Text>
                      <Text fontWeight="bold" color="red.700">₹{formatNumber(selectedEmployee.pli)}</Text>
                    </Box>
                    <Box bg="red.50" p={2} rounded="lg" textAlign="center">
                      <Text fontSize="xs" color="gray.600">વ્યવસાય વેરો</Text>
                      <Text fontWeight="bold" color="red.700">₹{formatNumber(selectedEmployee.professionalTax)}</Text>
                    </Box>
                    <Box bg="red.50" p={2} rounded="lg" textAlign="center">
                      <Text fontSize="xs" color="gray.600">સહકારી હપ્તો</Text>
                      <Text fontWeight="bold" color="red.700">₹{formatNumber(selectedEmployee.cooperativeInstallment)}</Text>
                    </Box>
                  </SimpleGrid>
                </Box>

                <Divider />

                {/* Banking Details */}
                <Box>
                  <Heading size="sm" color="green.700" mb={3} borderLeft="4px solid #1E4D2B" pl={3}>
                    બેંક માહિતી
                  </Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Box bg="gray.50" p={3} rounded="lg">
                      <Text color="gray.500" fontSize="sm">બેંકનું નામ</Text>
                      <Text fontWeight="500">{selectedEmployee.bankNameEnglish || '-'}</Text>
                    </Box>
                    <Box bg="gray.50" p={3} rounded="lg">
                      <Text color="gray.500" fontSize="sm">એકાઉન્ટ નંબર</Text>
                      <Text fontWeight="500">{selectedEmployee.accountNumber || '-'}</Text>
                    </Box>
                    <Box bg="gray.50" p={3} rounded="lg">
                      <Text color="gray.500" fontSize="sm">IFSC કોડ</Text>
                      <Text fontWeight="500" textTransform="uppercase">{selectedEmployee.ifscCode || '-'}</Text>
                    </Box>
                  </SimpleGrid>
                </Box>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter borderTop="1px solid" borderColor="gray.200">
            <Button colorScheme="green" onClick={onModalClose} rounded="lg">
              બંધ કરો
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={onEditModalClose} size="4xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent borderRadius="2xl" maxH="90vh">
          <ModalHeader bg="#1E4D2B" color="white" borderTopRadius="2xl">
            <Flex align="center" gap={3}>
              <FiEdit2 size={20} />
              <Heading size="md" color="white">કર્મચારી માહિતી સુધારો</Heading>
            </Flex>
          </ModalHeader>
          <ModalCloseButton color="white" />
          
          <ModalBody py={6} px={6}>
            <Alert status="info" mb={6} borderRadius="lg">
              <AlertIcon />
              કૃપા કરી જરૂરી માહિતી સુધારો અને સેવ કરો. (<span className="text-red-500">*</span> ચિહ્ન ફરજિયાત ફિલ્ડ છે)
            </Alert>

            {/* Section 1: કર્મચારી માહિતી */}
            <Heading size="sm" color="green.700" mb={4} borderLeft="4px solid #1E4D2B" pl={3}>
              કર્મચારી માહિતી
            </Heading>
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={5} mb={8}>
              <FormControl isRequired isInvalid={errors.employeeName}>
                <FormLabel>કર્મચારીનું નામ *</FormLabel>
                <Input 
                  name="employeeName" 
                  value={editFormData.employeeName} 
                  onChange={handleEditChange} 
                  bg="gray.50"
                  placeholder="ઉદા: રમેશભાઈ પટેલ"
                />
                <FormErrorMessage>{errors.employeeName}</FormErrorMessage>
              </FormControl>
              
              <FormControl>
                <FormLabel>કર્મચારીનું નામ (અંગ્રેજીમાં)</FormLabel>
                <Input 
                  name="employeeNameEnglish" 
                  value={editFormData.employeeNameEnglish} 
                  onChange={handleEditChange} 
                  bg="gray.50"
                  placeholder="Eg: Rameshbhai Patel"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>નોંધણી તારીખ</FormLabel>
                <Input 
                  type="date" 
                  name="registrationDate" 
                  value={editFormData.registrationDate} 
                  onChange={handleEditChange} 
                  bg="gray.50"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>કર્મચારી ગ્રુપનું નામ</FormLabel>
                <Select 
                  value={editFormData.employeeGroup}
                  onChange={(e) => handleSelectChange("employeeGroup", e.target.value)}
                  bg="gray.50"
                >
                  <option value="">ગ્રુપ પસંદ કરો</option>
                  {employeeGroups.map(group => (
                    <option key={group.value} value={group.value}>{group.label}</option>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>કર્મચારી હોદ્દો (અંગ્રેજીમાં)</FormLabel>
                <Select 
                  value={editFormData.employeePositionEnglish}
                  onChange={(e) => handleSelectChange("employeePositionEnglish", e.target.value)}
                  bg="gray.50"
                >
                  <option value="">હોદ્દો પસંદ કરો</option>
                  {positionsEnglish.map(pos => (
                    <option key={pos.value} value={pos.value}>{pos.label}</option>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>કર્મચારી હોદ્દો (ગુજરાતીમાં)</FormLabel>
                <Select 
                  value={editFormData.employeePositionGujarati}
                  onChange={(e) => handleSelectChange("employeePositionGujarati", e.target.value)}
                  bg="gray.50"
                >
                  <option value="">હોદ્દો પસંદ કરો</option>
                  {positionsGujarati.map(pos => (
                    <option key={pos.value} value={pos.value}>{pos.label}</option>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>બેંકનું નામ (અંગ્રેજીમાં)</FormLabel>
                <Select 
                  value={editFormData.bankNameEnglish}
                  onChange={(e) => handleSelectChange("bankNameEnglish", e.target.value)}
                  bg="gray.50"
                >
                  <option value="">બેંક પસંદ કરો</option>
                  {bankNames.map(bank => (
                    <option key={bank.value} value={bank.value}>{bank.label}</option>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl isInvalid={errors.accountNumber}>
                <FormLabel>એકાઉન્ટ નંબર</FormLabel>
                <Input 
                  name="accountNumber" 
                  value={editFormData.accountNumber} 
                  onChange={handleEditChange} 
                  bg="gray.50"
                  placeholder="ઉદા: 123456789012"
                />
                <FormErrorMessage>{errors.accountNumber}</FormErrorMessage>
              </FormControl>
              
              <FormControl isInvalid={errors.ifscCode}>
                <FormLabel>IFSC કોડ</FormLabel>
                <Input 
                  name="ifscCode" 
                  value={editFormData.ifscCode} 
                  onChange={handleIFSCChange} 
                  bg="gray.50"
                  placeholder="ઉદા: SBIN0001234"
                />
                <FormErrorMessage>{errors.ifscCode}</FormErrorMessage>
              </FormControl>
              
              <FormControl>
                <FormLabel>પગાર સ્કેલ</FormLabel>
                <Select 
                  value={editFormData.salaryScale}
                  onChange={(e) => handleSelectChange("salaryScale", e.target.value)}
                  bg="gray.50"
                >
                  <option value="">સ્કેલ પસંદ કરો</option>
                  {salaryScales.map(scale => (
                    <option key={scale.value} value={scale.value}>{scale.label}</option>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl isInvalid={errors.basicPay}>
                <FormLabel>બેઝિક પે (₹)</FormLabel>
                <Input 
                  type="text" 
                  name="basicPay" 
                  value={editFormData.basicPay} 
                  onChange={(e) => handleNumberInput("basicPay", e.target.value)} 
                  placeholder="₹ 0.00" 
                  bg="gray.50"
                />
                <FormErrorMessage>{errors.basicPay}</FormErrorMessage>
              </FormControl>
              
              <FormControl>
                <FormLabel>ગ્રેડ પે (₹)</FormLabel>
                <Input 
                  type="text" 
                  name="gradePay" 
                  value={editFormData.gradePay} 
                  onChange={(e) => handleNumberInput("gradePay", e.target.value)} 
                  placeholder="₹ 0.00" 
                  bg="gray.50"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>કુલ બેઝિક (₹)</FormLabel>
                <Input 
                  name="totalBasic" 
                  value={editFormData.totalBasic} 
                  isReadOnly 
                  bg="gray.100"
                  placeholder="આપોઆપ ગણાશે"
                />
                <Text fontSize="xs" color="gray.500" mt={1}>બેઝિક પે + ગ્રેડ પે</Text>
              </FormControl>
              
              <FormControl isRequired isInvalid={errors.mobileNumber}>
                <FormLabel>મોબાઈલ નંબર *</FormLabel>
                <Input 
                  type="tel" 
                  name="mobileNumber" 
                  value={editFormData.mobileNumber} 
                  onChange={handleMobileNumberChange} 
                  bg="gray.50" 
                  maxLength={10}
                  placeholder="ઉદા: 9876543210"
                />
                <FormErrorMessage>{errors.mobileNumber}</FormErrorMessage>
              </FormControl>
              
              <FormControl>
                <FormLabel>પી.એફ. ઉધારની સિલ્લક</FormLabel>
                <Input 
                  name="pfAccount" 
                  value={editFormData.pfAccount} 
                  onChange={handleEditChange} 
                  bg="gray.50"
                  placeholder=""
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>રીમાર્ક</FormLabel>
                <Input 
                  name="remarks" 
                  value={editFormData.remarks} 
                  onChange={handleEditChange} 
                  bg="gray.50"
                  placeholder="કોઈ વિશેષ નોંધ"
                />
              </FormControl>
              
              <FormControl>
                <Checkbox 
                  name="isActive" 
                  isChecked={editFormData.isActive} 
                  onChange={handleEditChange} 
                  colorScheme="green"
                  size="lg"
                  mt={6}
                >
                  સક્રિય છે (કર્મચારી હાલમાં કાર્યરત છે)
                </Checkbox>
              </FormControl>
            </Grid>

            <Divider my={6} />

            {/* Section 2: માસિક મળવા પાત્ર રકમ */}
            <Heading size="sm" color="green.700" mb={4} borderLeft="4px solid #1E4D2B" pl={3}>
              માસિક મળવા પાત્ર રકમ
            </Heading>
            <Grid templateColumns={{ base: "1fr", md: "repeat(5, 1fr)" }} gap={5} mb={8}>
              <FormControl>
                <FormLabel>મોંઘવારી ભથ્થું</FormLabel>
                <Input 
                  type="text" 
                  name="dearnessAllowance" 
                  value={editFormData.dearnessAllowance} 
                  onChange={(e) => handleNumberInput("dearnessAllowance", e.target.value)} 
                  placeholder="₹" 
                  bg="gray.50"
                />
              </FormControl>
              <FormControl>
                <FormLabel>ઘર ભાડું</FormLabel>
                <Input 
                  type="text" 
                  name="houseRent" 
                  value={editFormData.houseRent} 
                  onChange={(e) => handleNumberInput("houseRent", e.target.value)} 
                  placeholder="₹" 
                  bg="gray.50"
                />
              </FormControl>
              <FormControl>
                <FormLabel>મેડિકલ ભથ્થું</FormLabel>
                <Input 
                  type="text" 
                  name="medicalAllowance" 
                  value={editFormData.medicalAllowance} 
                  onChange={(e) => handleNumberInput("medicalAllowance", e.target.value)} 
                  placeholder="₹" 
                  bg="gray.50"
                />
              </FormControl>
              <FormControl>
                <FormLabel>ધોલાઈ ભથ્થું</FormLabel>
                <Input 
                  type="text" 
                  name="travelAllowance" 
                  value={editFormData.travelAllowance} 
                  onChange={(e) => handleNumberInput("travelAllowance", e.target.value)} 
                  placeholder="₹" 
                  bg="gray.50"
                />
              </FormControl>
              <FormControl>
                <FormLabel>ઝાડુ ભથ્થું</FormLabel>
                <Input 
                  type="text" 
                  name="cleaningAllowance" 
                  value={editFormData.cleaningAllowance} 
                  onChange={(e) => handleNumberInput("cleaningAllowance", e.target.value)} 
                  placeholder="₹" 
                  bg="gray.50"
                />
              </FormControl>
            </Grid>

            <Divider my={6} />

            {/* Section 3: માસિક કપાત પાત્ર રકમ */}
            <Heading size="sm" color="green.700" mb={4} borderLeft="4px solid #1E4D2B" pl={3}>
              માસિક કપાત પાત્ર રકમ
            </Heading>
            <Grid templateColumns={{ base: "1fr", md: "repeat(5, 1fr)" }} gap={5} mb={8}>
              <FormControl>
                <FormLabel>કર્મચારીનો ફાળો</FormLabel>
                <Input 
                  type="text" 
                  name="employeeContribution" 
                  value={editFormData.employeeContribution} 
                  onChange={(e) => handleNumberInput("employeeContribution", e.target.value)} 
                  placeholder="₹" 
                  bg="gray.50"
                />
              </FormControl>
              <FormControl>
                <FormLabel>અન્ય ફાળો</FormLabel>
                <Input 
                  type="text" 
                  name="otherContribution" 
                  value={editFormData.otherContribution} 
                  onChange={(e) => handleNumberInput("otherContribution", e.target.value)} 
                  placeholder="₹" 
                  bg="gray.50"
                />
              </FormControl>
              <FormControl>
                <FormLabel>પી.એલ.આઈ.</FormLabel>
                <Input 
                  type="text" 
                  name="pli" 
                  value={editFormData.pli} 
                  onChange={(e) => handleNumberInput("pli", e.target.value)} 
                  placeholder="₹" 
                  bg="gray.50"
                />
              </FormControl>
              <FormControl>
                <FormLabel>વ્યવસાય વેરો</FormLabel>
                <Input 
                  type="text" 
                  name="professionalTax" 
                  value={editFormData.professionalTax} 
                  onChange={(e) => handleNumberInput("professionalTax", e.target.value)} 
                  placeholder="₹" 
                  bg="gray.50"
                />
              </FormControl>
              <FormControl>
                <FormLabel>સહકારી મંડળીનો હપ્તો</FormLabel>
                <Input 
                  type="text" 
                  name="cooperativeInstallment" 
                  value={editFormData.cooperativeInstallment} 
                  onChange={(e) => handleNumberInput("cooperativeInstallment", e.target.value)} 
                  placeholder="₹" 
                  bg="gray.50"
                />
              </FormControl>
            </Grid>
          </ModalBody>

          <ModalFooter borderTop="1px solid" borderColor="gray.200" gap={3}>
            <Button 
              variant="outline" 
              colorScheme="red" 
              onClick={onEditModalClose} 
              rounded="lg"
              leftIcon={<FiX />}
            >
              રદ કરો
            </Button>
            <Button 
              colorScheme="green" 
              onClick={handleUpdate} 
              isLoading={saving} 
              leftIcon={<FiSave />} 
              rounded="lg"
            >
              સેવ કરો
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Alert */}
      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteAlertClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent borderRadius="2xl">
            <AlertDialogHeader fontSize="lg" fontWeight="bold" bg="red.600" color="white" borderTopRadius="2xl">
              કર્મચારી ડિલીટ કરો
            </AlertDialogHeader>

            <AlertDialogBody py={6}>
              <Text>શું તમે ખરેખર <strong>{selectedEmployee?.employeeName}</strong> ને કાયમ માટે ડિલીટ કરવા માંગો છો?</Text>
              <Text mt={2} fontSize="sm" color="gray.500">આ ક્રિયા પછી ડેટા પુનઃપ્રાપ્ત કરી શકાશે નહીં.</Text>
            </AlertDialogBody>

            <AlertDialogFooter gap={3}>
              <Button ref={cancelRef} onClick={onDeleteAlertClose} rounded="lg">
                રદ કરો
              </Button>
              <Button colorScheme="red" onClick={handleDelete} rounded="lg">
                ડિલીટ કરો
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default EmployeeDetails;