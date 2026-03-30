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
  HStack,
  Alert,
  AlertIcon,
  FormErrorMessage,
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
} from "react-icons/fi";
import axios from "axios";

const PFManagement = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isSuccessOpen, onOpen: onSuccessOpen, onClose: onSuccessClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pfRecords, setPfRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Filter states
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Transaction type options
  const transactionTypes = [
    { value: "debit", label: "ઉધાર (Withdrawal)" },
    { value: "credit", label: "જમા (Deposit)" },
  ];

  // Transaction subtype options
  const debitSubTypes = [
    { value: "advance", label: "એડવાન્સ" },
    { value: "loan", label: "લોન" },
    { value: "withdrawal", label: "ઉપાડ" },
    { value: "other_debit", label: "અન્ય" },
  ];

  const creditSubTypes = [
    { value: "salary_contribution", label: "પગાર યોગદાન" },
    { value: "employer_contribution", label: "સંસ્થા યોગદાન" },
    { value: "interest", label: "વ્યાજ" },
    { value: "other_credit", label: "અન્ય" },
  ];

  const [formData, setFormData] = useState({
    transactionType: "credit",
    transactionDate: "",
    employeeId: "",
    employeeName: "",
    employeeGroup: "",
    employeePosition: "",
    transactionSubType: "salary_contribution",
    amount: "",
    remarks: "",
  });

  // Helper validation functions
  const isEmpty = (v) => v === "" || v === null || v === undefined;
  
  const validateAmount = (amount) => {
    if (isEmpty(amount)) return false;
    const numAmount = parseFloat(amount);
    return !isNaN(numAmount) && numAmount > 0;
  };

const validateDate = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  // Check if date is valid and not NaN
  return !isNaN(date.getTime());
};

const validateFutureDate = (dateString) => {
  if (!dateString) return true;
  const selectedDate = new Date(dateString);
  const today = new Date();
  
  // Compare only date part (year, month, day)
  const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  return selectedDateOnly <= todayOnly;
};

  // Fetch PF records and employees on load
  useEffect(() => {
    fetchPFRecords();
    fetchEmployees();
  }, [selectedEmployeeFilter, selectedMonth, selectedYear]);

  const fetchPFRecords = async () => {
    setLoading(true);
    try {
      let url = `http://localhost:5000/api/pf?month=${selectedMonth}&year=${selectedYear}`;
      if (selectedEmployeeFilter) {
        url += `&employeeId=${selectedEmployeeFilter}`;
      }
      const response = await axios.get(url);
      console.log("Fetched PF Records:", response.data);
      setPfRecords(response.data);
    } catch (error) {
      console.error("Error fetching PF records:", error);
      toast({
        title: "ભૂલ",
        description: "PF રેકોર્ડ લોડ કરવામાં નિષ્ફળ",
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
      console.log("Fetched Employees:", response.data);
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  // Get employee name safely
  const getEmployeeName = (employee) => {
    if (!employee) return "-";
    return employee.employeeName || employee.employeeNameEnglish || employee.firstName || "-";
  };

  // Get employee group safely
  const getEmployeeGroup = (employee) => {
    if (!employee) return "-";
    return employee.employeeGroup || employee.department || "-";
  };

  // Get employee position safely
  const getEmployeePosition = (employee) => {
    if (!employee) return "-";
    return employee.employeePositionGujarati || employee.employeePositionEnglish || employee.designation || "-";
  };

  const handleEmployeeChange = (e) => {
    const employeeId = e.target.value;
    const employee = employees.find(emp => emp._id === employeeId);
    
    if (employee) {
      setFormData({
        ...formData,
        employeeId: employeeId,
        employeeName: getEmployeeName(employee),
        employeeGroup: getEmployeeGroup(employee),
        employeePosition: getEmployeePosition(employee),
      });
      // Clear error for employee field
      if (fieldErrors.employeeId) {
        setFieldErrors(prev => ({ ...prev, employeeId: undefined }));
      }
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

  const handleTransactionTypeChange = (e) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      transactionType: value,
      transactionSubType: value === "debit" ? "advance" : "salary_contribution",
    });
    // Clear transaction subtype error when type changes
    if (fieldErrors.transactionSubType) {
      setFieldErrors(prev => ({ ...prev, transactionSubType: undefined }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for the field being edited
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFieldErrors({});
    setFormData({
      transactionType: "credit",
      transactionDate: "",
      employeeId: "",
      employeeName: "",
      employeeGroup: "",
      employeePosition: "",
      transactionSubType: "salary_contribution",
      amount: "",
      remarks: "",
    });
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Validate transaction type
    if (!formData.transactionType) {
      errors.transactionType = "વ્યવહારનો પ્રકાર પસંદ કરવો ફરજિયાત છે";
      isValid = false;
    }

    // Validate transaction date
    if (!formData.transactionDate) {
      errors.transactionDate = "વ્યવહારની તારીખ ભરવી ફરજિયાત છે";
      isValid = false;
    } else if (!validateDate(formData.transactionDate)) {
      errors.transactionDate = "માન્ય તારીખ દાખલ કરો";
      isValid = false;
    } else if (!validateFutureDate(formData.transactionDate)) {
      errors.transactionDate = "ભવિષ્યની તારીખ દાખલ કરી શકાતી નથી";
      isValid = false;
    }

    // Validate employee selection
    if (!formData.employeeId) {
      errors.employeeId = "કર્મચારી પસંદ કરવો ફરજિયાત છે";
      isValid = false;
    }

    // Validate transaction subtype
    if (!formData.transactionSubType) {
      errors.transactionSubType = "વ્યવહારનો પ્રકાર પસંદ કરવો ફરજિયાત છે";
      isValid = false;
    }

    // Validate amount
    if (!formData.amount) {
      errors.amount = "રકમ ભરવી ફરજિયાત છે";
      isValid = false;
    } else {
      const amountValue = parseFloat(formData.amount);
      if (isNaN(amountValue)) {
        errors.amount = "માન્ય રકમ દાખલ કરો";
        isValid = false;
      } else if (amountValue <= 0) {
        errors.amount = "રકમ 0 થી વધુ હોવી જોઈએ";
        isValid = false;
      } else if (amountValue > 10000000) {
        errors.amount = "રકમ 1 કરોડથી વધુ ન હોઈ શકે";
        isValid = false;
      }
    }

    // Validate remarks length if provided
    if (formData.remarks && formData.remarks.length > 500) {
      errors.remarks = "રીમાર્ક 500 અક્ષરથી વધુ ન હોઈ શકે";
      isValid = false;
    }

    setFieldErrors(errors);
    
    if (!isValid) {
      // Show first error message
      const firstError = Object.values(errors)[0];
      toast({
        title: "ભૂલ",
        description: firstError,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
    
    return isValid;
  };

  const handleSave = async () => {
    // Run all validations
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const basicSalary = parseFloat(formData.amount);
      
      // Calculate PF contributions (12% each)
      const pfContributionEmployee = basicSalary * 0.12;
      const pfContributionEmployer = basicSalary * 0.12;
      const totalPF = pfContributionEmployee + pfContributionEmployer;
      
      const payload = {
        employeeId: formData.employeeId,
        month: selectedMonth,
        year: selectedYear,
        basicSalary: basicSalary,
        pfContributionEmployee: pfContributionEmployee,
        pfContributionEmployer: pfContributionEmployer,
        totalPF: totalPF,
        depositDate: new Date(formData.transactionDate),
        transactionId: `PF-${Date.now()}-${formData.employeeId}`,
        paymentMode: "bank transfer",
        status: "pending",
        remarks: formData.remarks || `${formData.transactionSubType} - ₹${basicSalary}`,
        transactionType: formData.transactionType,
        transactionSubType: formData.transactionSubType,
        employeeName: formData.employeeName,
        employeeGroup: formData.employeeGroup,
        employeePosition: formData.employeePosition,
      };

      console.log("Saving payload:", payload);

      if (editingId) {
        await axios.put(`http://localhost:5000/api/pf/${editingId}`, payload);
        toast({
          title: "સફળ",
          description: "PF રેકોર્ડ સફળતાપૂર્વક અપડેટ થયો",
          status: "success",
          duration: 3000,
        });
      } else {
        await axios.post("http://localhost:5000/api/pf", payload);
        toast({
          title: "સફળ",
          description: "નવો PF રેકોર્ડ સફળતાપૂર્વક ઉમેરાયો",
          status: "success",
          duration: 3000,
        });
      }
      
      onSuccessOpen();
      await fetchPFRecords();
      resetForm();
      onFormClose();
    } catch (error) {
      console.error("Error saving PF record:", error);
      toast({
        title: "ભૂલ",
        description: error.response?.data?.message || "PF રેકોર્ડ સેવ કરવામાં નિષ્ફળ",
        status: "error",
        duration: 5000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (record) => {
    setEditingId(record._id);
    setFieldErrors({});
    setFormData({
      transactionType: record.transactionType || "credit",
      transactionDate: record.depositDate ? record.depositDate.split('T')[0] : "",
      employeeId: record.employeeId?._id || "",
      employeeName: getEmployeeName(record.employeeId),
      employeeGroup: getEmployeeGroup(record.employeeId),
      employeePosition: getEmployeePosition(record.employeeId),
      transactionSubType: record.transactionSubType || "salary_contribution",
      amount: record.basicSalary || 0,
      remarks: record.remarks || "",
    });
    onFormOpen();
  };

  const handleDelete = async (id) => {
    if (window.confirm("શું તમે આ PF રેકોર્ડ ડિલીટ કરવા માંગો છો?")) {
      try {
        await axios.delete(`http://localhost:5000/api/pf/${id}`);
        toast({
          title: "સફળ",
          description: "PF રેકોર્ડ ડિલીટ થયો",
          status: "success",
          duration: 3000,
        });
        fetchPFRecords();
      } catch (error) {
        console.error("Error deleting PF record:", error);
        toast({
          title: "ભૂલ",
          description: "PF રેકોર્ડ ડિલીટ કરવામાં નિષ્ફળ",
          status: "error",
          duration: 3000,
        });
      }
    }
  };

  const handleView = (record) => {
    setViewingRecord(record);
    onViewOpen();
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/pf/${id}/status`, { status });
      fetchPFRecords();
      toast({
        title: "સફળ",
        description: "સ્થિતિ અપડેટ થઈ",
        status: "success",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "ભૂલ",
        description: "સ્થિતિ અપડેટ કરવામાં નિષ્ફળ",
        status: "error",
        duration: 3000,
      });
    }
  };

  const getTransactionTypeLabel = (type) => {
    const found = transactionTypes.find(t => t.value === type);
    return found ? found.label : type;
  };

  const getTransactionSubTypeLabel = (type, transactionType) => {
    const options = transactionType === "debit" ? debitSubTypes : creditSubTypes;
    const found = options.find(t => t.value === type);
    return found ? found.label : type;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("gu-IN");
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = pfRecords.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(pfRecords.length / itemsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);
 const handleItemsPerPageChange = (newLimit) => {
  setItemsPerPage(newLimit);
  setCurrentPage(1); // Reset to first page when changing limit
};
  // Calculate totals
  const totalDebit = pfRecords
    .filter(r => r.transactionType === "debit")
    .reduce((sum, r) => sum + (parseFloat(r.basicSalary) || 0), 0);
  const totalCredit = pfRecords
    .filter(r => r.transactionType === "credit")
    .reduce((sum, r) => sum + (parseFloat(r.basicSalary) || 0), 0);
  const balance = totalCredit - totalDebit;

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
        <Heading size="lg" color="#1E4D2B" flex="1" textAlign="center">
          PF મેનેજમેન્ટ
        </Heading>
        <Button
          leftIcon={<FiPlus />}
          colorScheme="green"
          onClick={() => {
            resetForm();
            onFormOpen();
          }}
          bg="#307644"
          _hover={{ bg: "#0F3A1F" }}
        >
          નવો વ્યવહાર
        </Button>
      </Flex>

      {/* Statistics Cards */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
        <Card rounded="xl" shadow="sm" bg="white">
          <CardBody textAlign="center" p={4}>
            <Text fontSize="sm" color="gray.500">કુલ વ્યવહાર</Text>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">{pfRecords.length}</Text>
          </CardBody>
        </Card>
        <Card rounded="xl" shadow="sm" bg="white">
          <CardBody textAlign="center" p={4}>
            <Text fontSize="sm" color="gray.500">કુલ ઉધાર (Debit)</Text>
            <Text fontSize="2xl" fontWeight="bold" color="red.600">₹{totalDebit.toLocaleString()}</Text>
          </CardBody>
        </Card>
        <Card rounded="xl" shadow="sm" bg="white">
          <CardBody textAlign="center" p={4}>
            <Text fontSize="sm" color="gray.500">કુલ જમા (Credit)</Text>
            <Text fontSize="2xl" fontWeight="bold" color="green.600">₹{totalCredit.toLocaleString()}</Text>
          </CardBody>
        </Card>
        <Card rounded="xl" shadow="sm" bg="white">
          <CardBody textAlign="center" p={4}>
            <Text fontSize="sm" color="gray.500">બાકી રકમ (Balance)</Text>
            <Text fontSize="2xl" fontWeight="bold" color={balance >= 0 ? "blue.600" : "orange.600"}>
              ₹{balance.toLocaleString()}
            </Text>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Filter Section */}
      <Box bg="white" rounded="2xl" shadow="md" border="1px solid #E3EDE8" p={5} mb={6}>
        <Flex gap={4} align="flex-end" flexWrap="wrap">
          <Box flex="1" minW="200px">
            <FormLabel mb={1} fontSize="sm" fontWeight="600">કર્મચારી ફિલ્ટર</FormLabel>
            <Select
              value={selectedEmployeeFilter}
              onChange={(e) => setSelectedEmployeeFilter(e.target.value)}
              placeholder="બધા કર્મચારીઓ"
            >
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>
                  {getEmployeeName(emp)} - {emp.employeeCode || ""}
                </option>
              ))}
            </Select>
          </Box>
          <Box w="150px">
            <FormLabel mb={1} fontSize="sm" fontWeight="600">મહિનો</FormLabel>
            <Select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
              <option value="1">જાન્યુઆરી</option>
              <option value="2">ફેબ્રુઆરી</option>
              <option value="3">માર્ચ</option>
              <option value="4">એપ્રિલ</option>
              <option value="5">મે</option>
              <option value="6">જૂન</option>
              <option value="7">જુલાઈ</option>
              <option value="8">ઑગસ્ટ</option>
              <option value="9">સપ્ટેમ્બર</option>
              <option value="10">ઑક્ટોબર</option>
              <option value="11">નવેમ્બર</option>
              <option value="12">ડિસેમ્બર</option>
            </Select>
          </Box>
          <Box w="100px">
            <FormLabel mb={1} fontSize="sm" fontWeight="600">વર્ષ</FormLabel>
            <Input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              min={2000}
              max={new Date().getFullYear() + 1}
            />
          </Box>
          {/* <Button colorScheme="blue" onClick={fetchPFRecords}>
            શોધો
          </Button> */}
        </Flex>
      </Box>

      {/* PF Records Table */}
      <Box bg="white" rounded="2xl" shadow="lg" border="1px solid #E3EDE8" overflow="hidden">
        {/* <Box bg="#1E4D2B" px={6} py={4}>
          <Heading size="md" color="white">
            PF વ્યવહારોની યાદી
          </Heading>
          <Text fontSize="sm" color="whiteAlpha.800" mt={1}>
            તમામ નોંધાયેલ PF વ્યવહારો
          </Text>
        </Box> */}

        <Box overflowX="auto">
          {loading ? (
            <Box textAlign="center" py={10}>
              <Spinner size="xl" color="green.500" />
              <Text mt={4}>વિગતો લોડ થઈ રહી છે...</Text>
            </Box>
          ) : pfRecords.length === 0 ? (
            <Box textAlign="center" py={10}>
              <Alert status="info" borderRadius="lg" maxW="md" mx="auto">
                <AlertIcon />
                આ મહિનામાં કોઈ PF વ્યવહાર નથી. નવો ઉમેરવા માટે "નવો વ્યવહાર" બટન દબાવો.
              </Alert>
            </Box>
          ) : (
            <>
              <Table variant="simple">
                <Thead bg="#E8F3EC">
                  <Tr>
                    <Th>ક્રમાંક</Th>
                    <Th>તારીખ</Th>
                    <Th>કર્મચારી નામ</Th>
                    <Th>ગ્રુપ</Th>
                    <Th>હોદ્દો</Th>
                    <Th>વ્યવહાર પ્રકાર</Th>
                    <Th>ઉધાર/જમાનો પ્રકાર</Th>
                    <Th isNumeric>રકમ (₹)</Th>
                    <Th>સ્થિતિ</Th>
                    <Th>ક્રિયા</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {currentItems.map((record, index) => (
                    <Tr key={record._id} _hover={{ bg: "gray.50" }}>
                      <Td fontWeight="medium">{indexOfFirstItem + index + 1}</Td>
                      <Td>{formatDate(record.depositDate)}</Td>
                      <Td>
                        <Text fontWeight="500">
                          {record.employeeId?.employeeName || record.employeeName || getEmployeeName(record.employeeId) || "-"}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {record.employeeId?.employeeCode || ""}
                        </Text>
                      </Td>
                      <Td>
                        <Badge colorScheme="blue" fontSize="xs">
                          {record.employeeId?.employeeGroup || record.employeeGroup || getEmployeeGroup(record.employeeId) || "-"}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge colorScheme="purple" fontSize="xs">
                          {record.employeeId?.employeePositionGujarati || record.employeePosition || getEmployeePosition(record.employeeId) || "-"}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge colorScheme={record.transactionType === "debit" ? "red" : "green"}>
                          {getTransactionTypeLabel(record.transactionType)}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge colorScheme="orange" variant="subtle" fontSize="xs">
                          {getTransactionSubTypeLabel(record.transactionSubType, record.transactionType)}
                        </Badge>
                      </Td>
                      <Td isNumeric fontWeight="bold" color={record.transactionType === "debit" ? "red.600" : "green.600"}>
                        ₹{parseFloat(record.basicSalary || 0).toLocaleString()}
                      </Td>
                      <Td>
                        <Select
                          value={record.status || "pending"}
                          onChange={(e) => handleUpdateStatus(record._id, e.target.value)}
                          size="sm"
                          w="110px"
                          rounded="md"
                          bg={record.status === "deposited" ? "green.50" : record.status === "failed" ? "red.50" : "yellow.50"}
                          color={record.status === "deposited" ? "green.600" : record.status === "failed" ? "red.600" : "orange.600"}
                          fontWeight="medium"
                        >
                          <option value="pending">⏳ બાકી</option>
                          <option value="deposited">✓ જમા</option>
                          <option value="failed">✗ નિષ્ફળ</option>
                        </Select>
                      </Td>
                      <Td>
                        <HStack spacing={1}>
                          <IconButton
                            icon={<ViewIcon />}
                            size="sm"
                            colorScheme="green"
                            variant="ghost"
                            onClick={() => handleView(record)}
                            aria-label="View"
                          />
                          <IconButton
                            icon={<EditIcon />}
                            size="sm"
                            colorScheme="green"
                            variant="ghost"
                            onClick={() => handleEdit(record)}
                            aria-label="Edit"
                          />
                          <IconButton
                            icon={<DeleteIcon />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleDelete(record._id)}
                            aria-label="Delete"
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>

              {/* Pagination */}
              {/* {pfRecords.length > itemsPerPage && (
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
              )} */}
            </>
          )}
        </Box>
      </Box>

      {/* ✅ Pagination Component with Show per page dropdown */}
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={handlePageChange}
  itemsPerPage={itemsPerPage}
  setItemsPerPage={handleItemsPerPageChange}
/>

      {/* Add/Edit Form Modal */}
      <Modal isOpen={isFormOpen} onClose={onFormClose} size="xl">
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader bg="#307644" color="white" borderTopRadius="2xl">
            {editingId ? "PF વ્યવહાર સુધારો" : "નવો PF વ્યવહાર"}
          </ModalHeader>
          <ModalCloseButton color="white" />
          
          <ModalBody py={6}>
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={5} mb={4}>
              <FormControl isRequired isInvalid={!!fieldErrors.transactionType}>
                <FormLabel>વ્યવહારનો પ્રકાર</FormLabel>
                <Select
                  name="transactionType"
                  value={formData.transactionType}
                  onChange={handleTransactionTypeChange}
                >
                  {transactionTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </Select>
                <FormErrorMessage>{fieldErrors.transactionType}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!fieldErrors.transactionDate}>
                <FormLabel>વ્યવહારની તારીખ</FormLabel>
                <Input
                  type="date"
                  name="transactionDate"
                  value={formData.transactionDate}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                />
                <FormErrorMessage>{fieldErrors.transactionDate}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!fieldErrors.employeeId} gridColumn="span 2">
                <FormLabel>કર્મચારીનું નામ</FormLabel>
                <Select
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleEmployeeChange}
                  placeholder="કર્મચારી પસંદ કરો"
                >
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>
                      {getEmployeeName(emp)}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{fieldErrors.employeeId}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>કર્મચારીનું ગ્રુપ</FormLabel>
                <Input
                  value={formData.employeeGroup}
                  isReadOnly
                  bg="gray.100"
                  placeholder="ઓટો ફીલ"
                />
              </FormControl>

              <FormControl>
                <FormLabel>કર્મચારીનો હોદ્દો</FormLabel>
                <Input
                  value={formData.employeePosition}
                  isReadOnly
                  bg="gray.100"
                  placeholder="ઓટો ફીલ"
                />
              </FormControl>

              <FormControl isRequired isInvalid={!!fieldErrors.transactionSubType}>
                <FormLabel>
                  {formData.transactionType === "debit" ? "ઉધાર / જમાનો પ્રકાર" : "જમા / યોગદાન પ્રકાર"}
                </FormLabel>
                <Select
                  name="transactionSubType"
                  value={formData.transactionSubType}
                  onChange={handleChange}
                >
                  {(formData.transactionType === "debit" ? debitSubTypes : creditSubTypes).map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </Select>
                <FormErrorMessage>{fieldErrors.transactionSubType}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!fieldErrors.amount}>
                <FormLabel>રકમ (₹)</FormLabel>
                <Input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  max="10000000"
                />
                <FormErrorMessage>{fieldErrors.amount}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!fieldErrors.remarks} gridColumn="span 2">
                <FormLabel>રીમાર્ક</FormLabel>
                <Textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  placeholder="વધારાની વિગત કે નોંધ... (મહત્તમ 500 અક્ષર)"
                  rows={3}
                  maxLength={500}
                />
                <FormErrorMessage>{fieldErrors.remarks}</FormErrorMessage>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  {formData.remarks?.length || 0}/500 અક્ષર
                </Text>
              </FormControl>
            </Grid>
          </ModalBody>

          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={onFormClose}>
              રદ કરો
            </Button>
            <Button
              colorScheme="green"
              onClick={handleSave}
              isLoading={saving}
              leftIcon={<FiSave />}
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
          <ModalHeader bg="#1E4D2B" color="white">
            PF વ્યવહાર વિગત
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py={6}>
            {viewingRecord && (
              <SimpleGrid columns={2} spacing={4}>
                <Text fontWeight="bold">વ્યવહારનો પ્રકાર:</Text>
                <Text>{getTransactionTypeLabel(viewingRecord.transactionType)}</Text>
                
                <Text fontWeight="bold">તારીખ:</Text>
                <Text>{formatDate(viewingRecord.depositDate)}</Text>
                
                <Text fontWeight="bold">કર્મચારી:</Text>
                <Text>{viewingRecord.employeeId?.employeeName || viewingRecord.employeeName || "-"}</Text>
                
                {/* <Text fontWeight="bold">કર્મચારી કોડ:</Text>
                <Text>{viewingRecord.employeeId?.employeeCode || "-"}</Text> */}
                
                <Text fontWeight="bold">ગ્રુપ:</Text>
                <Text>{viewingRecord.employeeId?.employeeGroup || viewingRecord.employeeGroup || "-"}</Text>
                
                <Text fontWeight="bold">હોદ્દો:</Text>
                <Text>{viewingRecord.employeeId?.employeePositionGujarati || viewingRecord.employeePosition || "-"}</Text>
                
                <Text fontWeight="bold">વ્યવહાર પ્રકાર:</Text>
                <Text>{getTransactionSubTypeLabel(viewingRecord.transactionSubType, viewingRecord.transactionType)}</Text>
                
                <Text fontWeight="bold">રકમ:</Text>
                <Text fontWeight="bold" color={viewingRecord.transactionType === "debit" ? "red.600" : "green.600"}>
                  ₹{parseFloat(viewingRecord.basicSalary || 0).toLocaleString()}
                </Text>
                
                <Text fontWeight="bold">રીમાર્ક:</Text>
                <Text>{viewingRecord.remarks || "-"}</Text>
                
                <Text fontWeight="bold">સ્થિતિ:</Text>
                <Badge colorScheme={viewingRecord.status === "deposited" ? "green" : viewingRecord.status === "failed" ? "red" : "orange"}
                 w="fit-content"
                  px={3}
                  py={1}
                >
                  {viewingRecord.status === "deposited" ? "જમા" : viewingRecord.status === "failed" ? "નિષ્ફળ" : "બાકી"}
                </Badge>
              </SimpleGrid>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="green" onClick={onViewClose}>
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
                PF વ્યવહાર સફળતાપૂર્વક નોંધવામાં આવ્યો છે.
              </Text>
              <Button colorScheme="green" onClick={onSuccessClose}>
                બંધ કરો
              </Button>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PFManagement;