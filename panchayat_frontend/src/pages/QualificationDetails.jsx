// QualificationDetails.jsx
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
  Textarea,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { ViewIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";

import Pagination from "../components/Pagination";
import {
  FiArrowLeft,
  FiSave,
  FiCheck,
  FiEye,
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiX,
  FiEdit2,
  FiTrash2,
  FiCalendar,
} from "react-icons/fi";
import axios from "axios";

const QualificationDetails = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isSuccessOpen, onOpen: onSuccessOpen, onClose: onSuccessClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [qualifications, setQualifications] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [viewingQualification, setViewingQualification] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Filter states
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState("");

  // Withdrawal type options
  const withdrawalTypes = [
    { value: "festival_with_deduction", label: "ફેસ્ટીવલ (કપાત સાથે)" },
    { value: "festival_without_deduction", label: "ફેસ્ટીવલ (કપાત વગર)" },
    { value: "advance_salary", label: "એડવાન્સ સેલરી" },
    { value: "loan", label: "લોન" },
    { value: "other", label: "અન્ય" },
  ];

  const [formData, setFormData] = useState({
    withdrawalDate: "",
    employeeId: "",
    employeeName: "",
    employeeGroup: "",
    employeePosition: "",
    withdrawalType: "",
    amount: "",
    remarks: "",
    qualificationName: "",
    qualificationType: "withdrawal",
    institutionName: "",
    category: "other",
  });

  // Get max date for date picker (today's date in yyyy-mm-dd format)
  const getMaxDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to convert yyyy-mm-dd to dd/mm/yyyy for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "-";
    try {
      // If it's ISO string with time
      let date;
      if (dateString.includes('T')) {
        date = new Date(dateString);
      } else {
        // If it's yyyy-mm-dd format
        const parts = dateString.split('-');
        date = new Date(parts[0], parts[1] - 1, parts[2]);
      }
      if (isNaN(date.getTime())) return "-";
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return "-";
    }
  };

  // Helper function to convert yyyy-mm-dd to dd/mm/yyyy for input
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      let date;
      if (dateString.includes('T')) {
        date = new Date(dateString);
      } else if (dateString.includes('-')) {
        const parts = dateString.split('-');
        date = new Date(parts[0], parts[1] - 1, parts[2]);
      } else {
        return "";
      }
      if (isNaN(date.getTime())) return "";
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return " ";
    }
  };

  // Convert yyyy-mm-dd to dd/mm/yyyy
  const convertToDisplayFormat = (dateString) => {
    if (!dateString) return "";
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  };

  // Convert dd/mm/yyyy to yyyy-mm-dd for API
  const convertToAPIFormat = (dateString) => {
    if (!dateString) return "";
    if (dateString.includes('-')) return dateString;
    const parts = dateString.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return dateString;
  };

  // Validation function to check if date is not future
  const validateNotFutureDate = (dateValue) => {
    if (!dateValue) return true;
    
    // Get the selected date
    let selectedDate;
    if (dateValue.includes('-')) {
      const parts = dateValue.split('-');
      selectedDate = new Date(parts[0], parts[1] - 1, parts[2]);
    } else if (dateValue.includes('/')) {
      const parts = dateValue.split('/');
      selectedDate = new Date(parts[2], parts[1] - 1, parts[0]);
    } else {
      return true;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    
    return selectedDate <= today;
  };

  // Fetch qualifications and employees on load
  useEffect(() => {
    fetchQualifications();
    fetchEmployees();
  }, [selectedEmployeeFilter]);

  const fetchQualifications = async () => {
    setLoading(true);
    try {
      const url = selectedEmployeeFilter
        ? `http://localhost:5000/api/qualification?employeeId=${selectedEmployeeFilter}`
        : "http://localhost:5000/api/qualification";
      const response = await axios.get(url);
      setQualifications(response.data);
    } catch (error) {
      console.error("Error fetching qualifications:", error);
      toast({
        title: "ભૂલ",
        description: "વિગત લોડ કરવામાં નિષ્ફળ",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/employee");
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  // Handle employee selection - auto fill group and position
  const handleEmployeeChange = (e) => {
    const employeeId = e.target.value;
    const employee = employees.find(emp => emp._id === employeeId);
    
    // Clear errors for employee field when changed
    setFieldErrors(prev => ({ ...prev, employeeId: false }));
    
    if (employee) {
      setFormData({
        ...formData,
        employeeId: employeeId,
        employeeName: employee.employeeName || employee.employeeNameEnglish || "",
        employeeGroup: employee.employeeGroup || "",
        employeePosition: employee.employeePositionGujarati || employee.employeePositionEnglish || "",
      });
    } else {
      setFormData({
        ...formData,
        employeeId: "",
        employeeName: "",
        employeeGroup: "",
        employeePosition: "",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error for this field when user types
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: false }));
    }
  };

  // Handle date change from calendar
  const handleDateChange = (e) => {
    const selectedDate = e.target.value; // This will be in yyyy-mm-dd format
    setFormData({ 
      ...formData, 
      withdrawalDate: selectedDate 
    });
    
    // Clear error for date field
    if (fieldErrors.withdrawalDate) {
      setFieldErrors(prev => ({ ...prev, withdrawalDate: false }));
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFieldErrors({});
    setFormData({
      withdrawalDate: "",
      employeeId: "",
      employeeName: "",
      employeeGroup: "",
      employeePosition: "",
      withdrawalType: "",
      amount: "",
      remarks: "",
      qualificationName: "",
      qualificationType: "withdrawal",
      institutionName: "",
      category: "other",
    });
  };

  // Comprehensive validation before save
  const validateForm = () => {
    const errors = {};

    // Validate withdrawal date
    if (isEmpty(formData.withdrawalDate)) {
      errors.withdrawalDate = "ઉપાડની તારીખ ભરવી ફરજિયાત છે";
    } else {
      // Check if date is in yyyy-mm-dd format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.withdrawalDate)) {
        errors.withdrawalDate = "તારીખનું ફોર્મેટ યોગ્ય નથી";
      } else {
        const parts = formData.withdrawalDate.split('-');
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);
        
        // Validate day, month, year ranges
        if (day < 1 || day > 31) {
          errors.withdrawalDate = "દિવસ 1-31 ની વચ્ચે હોવો જોઈએ";
        } else if (month < 1 || month > 12) {
          errors.withdrawalDate = "મહિનો 1-12 ની વચ્ચે હોવો જોઈએ";
        } else if (year < 1900 || year > new Date().getFullYear()) {
          errors.withdrawalDate = `વર્ષ 1900-${new Date().getFullYear()} ની વચ્ચે હોવું જોઈએ`;
        } else if (!validateNotFutureDate(formData.withdrawalDate)) {
          errors.withdrawalDate = "ઉપાડની તારીખ આજની અથવા ભૂતકાળની હોવી જોઈએ (ભવિષ્યની તારીખ પસંદ કરી શકાતી નથી)";
        }
      }
    }

    // Validate employee selection
    if (isEmpty(formData.employeeId)) {
      errors.employeeId = "કર્મચારી પસંદ કરવો ફરજિયાત છે";
    }

    // Validate withdrawal type
    if (isEmpty(formData.withdrawalType)) {
      errors.withdrawalType = "ઉપાડનો પ્રકાર પસંદ કરવો ફરજિયાત છે";
    }

    // Validate amount - improved validation
    const amountStr = String(formData.amount).trim();
    if (isEmpty(amountStr)) {
      errors.amount = "ઉપાડની રકમ ભરવી ફરજિયાત છે";
    } else {
      const amountNum = parseFloat(amountStr);
      if (isNaN(amountNum)) {
        errors.amount = "માન્ય રકમ દાખલ કરો (ફક્ત નંબર)";
      } else if (amountNum <= 0) {
        errors.amount = "રકમ 0 કરતા વધારે હોવી જોઈએ";
      } else if (amountNum > 1000000) {
        errors.amount = "મહત્તમ રકમ ₹10,00,000 છે";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0; // Return true if no errors
  };

  const isEmpty = (v) => v === "" || v === null || v === undefined;

  const handleSave = async () => {
    // Validate form and get result directly
    const isValid = validateForm();
    
    if (!isValid) {
      toast({
        title: "ભૂલ",
        description: "કૃપા કરીને બધી ફરજિયાત માહિતી યોગ્ય રીતે ભરો",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setSaving(true);
    try {
      // Get the withdrawal type label for qualificationName
      const withdrawalTypeLabel = withdrawalTypes.find(t => t.value === formData.withdrawalType)?.label || formData.withdrawalType;
      
      // Convert date from yyyy-mm-dd to ISO format
      const withdrawalDate = new Date(formData.withdrawalDate);
      // Set to midnight UTC to avoid timezone shifts
      withdrawalDate.setUTCHours(0, 0, 0, 0);
      
      const payload = {
        employeeId: formData.employeeId,
        employeeName: formData.employeeName,
        employeeGroup: formData.employeeGroup,
        employeePosition: formData.employeePosition,
        withdrawalDate: withdrawalDate.toISOString(), // Store as ISO string
        withdrawalType: formData.withdrawalType,
        amount: parseFloat(formData.amount),
        remarks: formData.remarks,
        qualificationName: `${withdrawalTypeLabel} - ${formatDateForDisplay(formData.withdrawalDate)}`,
        qualificationType: "withdrawal",
        institutionName: "ઉપાડણી વિગત",
        category: "other",
      };

      if (editingId) {
        await axios.put(`http://localhost:5000/api/qualification/${editingId}`, payload);
        toast({
          title: "સફળ",
          description: "વિગત સફળતાપૂર્વક અપડેટ થઈ",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        await axios.post("http://localhost:5000/api/qualification", payload);
        toast({
          title: "સફળ",
          description: "નવી વિગત સફળતાપૂર્વક ઉમેરાઈ",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      
      onSuccessOpen();
      await fetchQualifications();
      resetForm();
      onFormClose();
    } catch (error) {
      console.error("Error saving:", error);
      toast({
        title: "ભૂલ",
        description: error.response?.data?.message || "વિગત સેવ કરવામાં નિષ્ફળ",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (qual) => {
    setEditingId(qual._id);
    setFieldErrors({});
    
    // Convert ISO date to yyyy-mm-dd for the date picker
    let dateValue = "";
    if (qual.withdrawalDate) {
      const date = new Date(qual.withdrawalDate);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        dateValue = `${year}-${month}-${day}`;
      }
    }
    
    setFormData({
      withdrawalDate: dateValue,
      employeeId: qual.employeeId?._id || "",
      employeeName: qual.employeeName || "",
      employeeGroup: qual.employeeGroup || "",
      employeePosition: qual.employeePosition || "",
      withdrawalType: qual.withdrawalType || "",
      amount: qual.amount || "",
      remarks: qual.remarks || "",
      qualificationName: qual.qualificationName || "",
      qualificationType: qual.qualificationType || "withdrawal",
      institutionName: qual.institutionName || "",
      category: qual.category || "other",
    });
    onFormOpen();
  };

  const handleDelete = async (id) => {
    if (window.confirm("શું તમે આ વિગત ડિલીટ કરવા માંગો છો?")) {
      try {
        await axios.delete(`http://localhost:5000/api/qualification/${id}`);
        toast({
          title: "સફળ",
          description: "વિગત ડિલીટ થઈ",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchQualifications();
      } catch (error) {
        console.error("Error deleting:", error);
        toast({
          title: "ભૂલ",
          description: "વિગત ડિલીટ કરવામાં નિષ્ફળ",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleView = (qual) => {
    setViewingQualification(qual);
    onViewOpen();
  };

  const handleVerify = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/qualification/${id}/verify`, {
        status,
        verifiedBy: "Admin",
      });
      fetchQualifications();
      toast({
        title: "સફળ",
        description: `વિગત ${status === 'verified' ? 'ચકાસાયેલ' : status === 'rejected' ? 'નામંજૂર' : 'બાકી'} કરી`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error verifying:", error);
      toast({
        title: "ભૂલ",
        description: "સ્થિતિ અપડેટ કરવામાં નિષ્ફળ",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getWithdrawalTypeLabel = (type) => {
    const found = withdrawalTypes.find(t => t.value === type);
    return found ? found.label : type;
  };

  // Format date for display in table and view modal
  const formatDate = (dateString) => {
    return formatDateForDisplay(dateString);
  };

  // Filter only withdrawal records (where qualificationType is "withdrawal")
  const withdrawalRecords = qualifications.filter(q => q.qualificationType === "withdrawal" && q.withdrawalDate);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = withdrawalRecords.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(withdrawalRecords.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  // Calculate total amount
  const totalAmount = withdrawalRecords.reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0);
  const verifiedAmount = withdrawalRecords
    .filter(w => w.status === "verified")
    .reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0);

  return (
    <Box bg="#F8FAF9" minH="100vh" p={6}>
      {/* Header */}
      <Flex align="center" mb={6}>
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
        <Heading flex="1" textAlign="center" size="lg" color="green.700">
          ઉપાડણી વિગત
        </Heading>
        <Box width="180px">
          <Button
            leftIcon={<FiPlus />}
            colorScheme="green"
            onClick={() => {
              resetForm();
              onFormOpen();
            }}
            rounded="xl"
            fontWeight="600"
          >
            નવી ઉપાડણી
          </Button>
        </Box>
      </Flex>

      {/* Statistics Cards */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
        <Card rounded="xl" shadow="sm">
          <CardBody textAlign="center" p={4}>
            <Text fontSize="sm" color="gray.500">કુલ ઉપાડણી</Text>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">{withdrawalRecords.length}</Text>
          </CardBody>
        </Card>
        <Card rounded="xl" shadow="sm">
          <CardBody textAlign="center" p={4}>
            <Text fontSize="sm" color="gray.500">કુલ રકમ</Text>
            <Text fontSize="2xl" fontWeight="bold" color="purple.600">₹{totalAmount.toLocaleString()}</Text>
          </CardBody>
        </Card>
        <Card rounded="xl" shadow="sm">
          <CardBody textAlign="center" p={4}>
            <Text fontSize="sm" color="gray.500">ચકાસાયેલ રકમ</Text>
            <Text fontSize="2xl" fontWeight="bold" color="green.600">₹{verifiedAmount.toLocaleString()}</Text>
          </CardBody>
        </Card>
        <Card rounded="xl" shadow="sm">
          <CardBody textAlign="center" p={4}>
            <Text fontSize="sm" color="gray.500">બાકી ચકાસણી</Text>
            <Text fontSize="2xl" fontWeight="bold" color="orange.600">
              {withdrawalRecords.filter(w => w.status === "pending").length}
            </Text>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Filter Section */}
      <Card rounded="2xl" shadow="lg" mb={6}>
        <CardBody>
          <Flex gap={4} align="center" flexWrap="wrap">
            <Box flex="1" minW="200px">
              <FormLabel mb={1} fontSize="sm" fontWeight="600">કર્મચારી ફિલ્ટર</FormLabel>
              <Select
                value={selectedEmployeeFilter}
                onChange={(e) => setSelectedEmployeeFilter(e.target.value)}
                placeholder="બધા કર્મચારીઓ"
              >
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>
                    {emp.employeeName || emp.employeeNameEnglish || "કર્મચારી"}
                  </option>
                ))}
              </Select>
            </Box>
          </Flex>
        </CardBody>
      </Card>

      {/* Withdrawals List Table */}
      <Card rounded="2xl" shadow="lg" overflow="hidden">
        <CardBody p={0}>
          {loading ? (
            <Box textAlign="center" py={10}>
              <Spinner size="xl" color="green.500" />
              <Text mt={4}>વિગતો લોડ થઈ રહી છે...</Text>
            </Box>
          ) : (
            <>
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead bg="#E8F3EC">
                    <Tr>
                      <Th>ક્રમાંક</Th>
                      <Th>તારીખ</Th>
                      <Th>કર્મચારી નામ</Th>
                      <Th>ગ્રુપ</Th>
                      <Th>હોદ્દો</Th>
                      <Th>ઉપાડનો પ્રકાર</Th>
                      <Th isNumeric>રકમ (₹)</Th>
                      <Th>સ્થિતિ</Th>
                      <Th>ક્રિયા</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {currentItems.length === 0 ? (
                      <Tr>
                        <Td colSpan={9} textAlign="center" py={10} color="gray.500">
                          કોઈ ઉપાડણી વિગત નથી. નવી ઉમેરવા માટે "નવી ઉપાડણી" બટન દબાવો.
                        </Td>
                      </Tr>
                    ) : (
                      currentItems.map((withdrawal, index) => (
                        <Tr key={withdrawal._id} _hover={{ bg: "gray.50" }}>
                          <Td fontWeight="medium">{indexOfFirstItem + index + 1}</Td>
                          <Td>{formatDate(withdrawal.withdrawalDate)}</Td>
                          <Td>
                            <Text fontWeight="500">
                              {withdrawal.employeeId?.employeeName || 
                               withdrawal.employeeId?.employeeNameEnglish || 
                               withdrawal.employeeName || "-"}
                            </Text>
                          </Td>
                          <Td>
                            <Badge colorScheme="blue">
                              {withdrawal.employeeId?.employeeGroup || withdrawal.employeeGroup || "-"}
                            </Badge>
                          </Td>
                          <Td>{withdrawal.employeeId?.employeePositionGujarati || withdrawal.employeePosition || "-"}</Td>
                          <Td>
                            <Badge colorScheme="orange" variant="subtle">
                              {getWithdrawalTypeLabel(withdrawal.withdrawalType)}
                            </Badge>
                          </Td>
                          <Td isNumeric fontWeight="bold" color="green.600">
                            ₹{parseFloat(withdrawal.amount || 0).toLocaleString()}
                          </Td>
                          <Td>
                            <Select
                              value={withdrawal.status || "pending"}
                              onChange={(e) => handleVerify(withdrawal._id, e.target.value)}
                              size="sm"
                              w="110px"
                              rounded="md"
                              bg={withdrawal.status === "verified" ? "green.50" : withdrawal.status === "rejected" ? "red.50" : "yellow.50"}
                              color={withdrawal.status === "verified" ? "green.600" : withdrawal.status === "rejected" ? "red.600" : "orange.600"}
                              fontWeight="medium"
                            >
                              <option value="pending">⏳ બાકી</option>
                              <option value="verified">✓ ચકાસાયેલ</option>
                              <option value="rejected">✗ નામંજૂર</option>
                            </Select>
                          </Td>
                          <Td>
                            <Flex gap={2}>
                              <IconButton
                                icon={<ViewIcon />}
                                size="sm"
                                colorScheme="green"
                                variant="ghost"
                                onClick={() => handleView(withdrawal)}
                                aria-label="View"
                              />
                              <IconButton
                                icon={<EditIcon />}
                                size="sm"
                                colorScheme="green"
                                variant="ghost"
                                onClick={() => handleEdit(withdrawal)}
                                aria-label="Edit"
                              />
                              <IconButton
                                icon={<DeleteIcon />}
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => handleDelete(withdrawal._id)}
                                aria-label="Delete"
                              />
                            </Flex>
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

      {/* ✅ Pagination Component with Show per page dropdown */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={handleItemsPerPageChange}
      />

      {/* Add/Edit Form Modal */}
      <Modal isOpen={isFormOpen} onClose={onFormClose} size="xl" motionPreset="slideInBottom">
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
        <ModalContent borderRadius="2xl">
          <ModalHeader bg="#307644" color="white" borderTopRadius="2xl">
            <Flex justify="space-between" align="center">
              <Heading size="md">
                {editingId ? "ઉપાડણી વિગત સુધારો" : "નવી ઉપાડણી વિગત"}
              </Heading>
              <IconButton
                icon={<FiX />}
                variant="ghost"
                color="white"
                onClick={onFormClose}
                aria-label="Close"
                _hover={{ bg: "whiteAlpha.200" }}
              />
            </Flex>
          </ModalHeader>
          
          <ModalBody p={6}>
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={5}>
              {/* Withdrawal Date - with calendar picker */}
              <FormControl isRequired isInvalid={!!fieldErrors.withdrawalDate}>
                <FormLabel fontSize="sm" fontWeight="600">ઉપાડની તારીખ</FormLabel>
                <Input
                  type="date"
                  name="withdrawalDate"
                  value={formData.withdrawalDate}
                  onChange={handleDateChange}
                  max={getMaxDate()}
                  bg="gray.50"
                  icon={<FiCalendar />}
                />
                {fieldErrors.withdrawalDate && (
                  <FormErrorMessage>{fieldErrors.withdrawalDate}</FormErrorMessage>
                )}
              </FormControl>

              {/* Employee Name Dropdown */}
              <FormControl isRequired isInvalid={!!fieldErrors.employeeId}>
                <FormLabel fontSize="sm" fontWeight="600">કર્મચારીનું નામ</FormLabel>
                <Select
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleEmployeeChange}
                  placeholder="કર્મચારી પસંદ કરો"
                  bg="gray.50"
                >
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>
                      {emp.employeeName || emp.employeeNameEnglish || "કર્મચારી"}
                    </option>
                  ))}
                </Select>
                {fieldErrors.employeeId && (
                  <FormErrorMessage>{fieldErrors.employeeId}</FormErrorMessage>
                )}
              </FormControl>

              {/* Employee Group - Auto-filled */}
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600">કર્મચારીનું ગ્રુપ</FormLabel>
                <Input
                  name="employeeGroup"
                  value={formData.employeeGroup}
                  isReadOnly
                  bg="gray.100"
                  placeholder="કર્મચારી પસંદ કરતાં આપોઆપ ભરાશે"
                />
              </FormControl>

              {/* Employee Position - Auto-filled */}
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600">કર્મચારીનો હોદ્દો</FormLabel>
                <Input
                  name="employeePosition"
                  value={formData.employeePosition}
                  isReadOnly
                  bg="gray.100"
                  placeholder="કર્મચારી પસંદ કરતાં આપોઆપ ભરાશે"
                />
              </FormControl>

              {/* Withdrawal Type */}
              <FormControl isRequired isInvalid={!!fieldErrors.withdrawalType}>
                <FormLabel fontSize="sm" fontWeight="600">ઉપાડનો પ્રકાર</FormLabel>
                <Select
                  name="withdrawalType"
                  value={formData.withdrawalType}
                  onChange={handleChange}
                  placeholder="પ્રકાર પસંદ કરો"
                  bg="gray.50"
                >
                  {withdrawalTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </Select>
                {fieldErrors.withdrawalType && (
                  <FormErrorMessage>{fieldErrors.withdrawalType}</FormErrorMessage>
                )}
              </FormControl>

              {/* Amount */}
              <FormControl isRequired isInvalid={!!fieldErrors.amount}>
                <FormLabel fontSize="sm" fontWeight="600">ઉપાડની રકમ (₹)</FormLabel>
                <Input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  bg="gray.50"
                  step="0.01"
                  min="0.01"
                  max="1000000"
                />
                {fieldErrors.amount && (
                  <FormErrorMessage>{fieldErrors.amount}</FormErrorMessage>
                )}
              </FormControl>

              {/* Remarks - Full width */}
              <FormControl gridColumn="span 2">
                <FormLabel fontSize="sm" fontWeight="600">રીમાર્ક</FormLabel>
                <Textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  placeholder="વધારાની વિગત કે નોંધ અહીં લખો..."
                  rows={3}
                  bg="gray.50"
                />
              </FormControl>
            </Grid>
          </ModalBody>

          <ModalFooter borderTop="1px solid" borderColor="gray.200" gap={4}>
            <Button 
              variant="outline" 
              colorScheme="red" 
              onClick={() => {
                resetForm();
                onFormClose();
              }} 
              size="lg" 
              px={8} 
              rounded="xl"
            >
              રદ કરો
            </Button>
            <Button
              colorScheme="green"
              onClick={handleSave}
              isLoading={saving}
              leftIcon={<FiSave />}
              size="lg"
              px={8}
              rounded="xl"
              fontWeight="600"
            >
              {editingId ? "અપડેટ કરો" : "સેવ કરો"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader bg="#1E4D2B" color="white" borderTopRadius="2xl">
            ઉપાડણી વિગત
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py={6}>
            {viewingQualification && (
              <SimpleGrid columns={2} spacing={4}>
                <Text fontWeight="bold" color="gray.600">ઉપાડની તારીખ:</Text>
                <Text>{formatDate(viewingQualification.withdrawalDate)}</Text>
                
                <Text fontWeight="bold" color="gray.600">કર્મચારી નામ:</Text>
                <Text>
                  {viewingQualification.employeeId?.employeeName || 
                   viewingQualification.employeeId?.employeeNameEnglish || 
                   viewingQualification.employeeName || "-"}
                </Text>
                
                <Text fontWeight="bold" color="gray.600">કર્મચારી ગ્રુપ:</Text>
                <Text>{viewingQualification.employeeId?.employeeGroup || viewingQualification.employeeGroup || "-"}</Text>
                
                <Text fontWeight="bold" color="gray.600">કર્મચારી હોદ્દો:</Text>
                <Text>{viewingQualification.employeeId?.employeePositionGujarati || viewingQualification.employeePosition || "-"}</Text>
                
                <Text fontWeight="bold" color="gray.600">ઉપાડનો પ્રકાર:</Text>
                <Text>{getWithdrawalTypeLabel(viewingQualification.withdrawalType)}</Text>
                
                <Text fontWeight="bold" color="gray.600">ઉપાડની રકમ:</Text>
                <Text fontWeight="bold" color="green.600">₹{parseFloat(viewingQualification.amount || 0).toLocaleString()}</Text>
                
                <Text fontWeight="bold" color="gray.600">રીમાર્ક:</Text>
                <Text>{viewingQualification.remarks || "-"}</Text>
                
                <Text fontWeight="bold" color="gray.600">સ્થિતિ:</Text>
                <Badge 
                  colorScheme={viewingQualification.status === "verified" ? "green" : viewingQualification.status === "rejected" ? "red" : "orange"}
                  w="fit-content"
                  px={3}
                  py={1}
                  rounded="full"
                >
                  {viewingQualification.status === "verified" ? "ચકાસાયેલ" : 
                   viewingQualification.status === "rejected" ? "નામંજૂર" : "બાકી"}
                </Badge>
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
                ઉપાડણી વિગત સફળતાપૂર્વક નોંધવામાં આવી છે.
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

export default QualificationDetails;