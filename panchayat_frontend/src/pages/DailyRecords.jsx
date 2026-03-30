// // dailyrecords.jsx
// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import {
//   Box,
//   Heading,
//   Text,
//   Button,
//   Flex,
//   Input,
//   useToast,
//   Spinner,
//   SimpleGrid,
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalBody,
//   ModalFooter,
//   ModalCloseButton,
//   useDisclosure,
//   Table,
//   Thead,
//   Tbody,
//   Tr,
//   Th,
//   Td,
//   IconButton,
//   Badge,
//   Select,
//   Card,
//   CardBody,
//   CardHeader,
//   Alert,
//   AlertIcon,
//   HStack,
//   VStack,
//   Tag,
//   TagLabel,
//   Tooltip,
//   FormControl,
//   FormLabel,
//   FormErrorMessage,
//   AlertDialog,
//   AlertDialogBody,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogContent,
//   AlertDialogOverlay,
//   Textarea,
// } from "@chakra-ui/react";
// import { ViewIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";

// import {
//   FiCalendar,
//   FiEdit2,
//   FiTrash2,
//   FiChevronLeft,
//   FiChevronRight,
//   FiFileText,
//   FiClock,
//   FiCheckCircle,
//   FiXCircle,
//   FiSave,
//   FiPlus,
//   FiArrowLeft,
//   FiAlertCircle,
// } from "react-icons/fi";

// const API_BASE_URL = "http://localhost:5000/api";

// // Helper function to format date as DD/MM/YYYY
// const formatDateToDDMMYYYY = (dateString) => {
//   if (!dateString) return '';
//   const date = new Date(dateString);
//   const day = String(date.getDate()).padStart(2, '0');
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const year = date.getFullYear();
//   return `${day}/${month}/${year}`;
// };

// // Pagination Component
// const Pagination = ({ currentPage, totalPages, onPageChange, itemsPerPage, setItemsPerPage }) => {
//   if (!totalPages) return null;

//   const getVisiblePages = () => {
//     const pages = [];

//     if (totalPages <= 7) {
//       for (let i = 1; i <= totalPages; i++) pages.push(i);
//       return pages;
//     }

//     pages.push(1);

//     if (currentPage > 3) pages.push("...");

//     const start = Math.max(2, currentPage - 1);
//     const end = Math.min(totalPages - 1, currentPage + 1);

//     for (let p = start; p <= end; p++) pages.push(p);

//     if (currentPage < totalPages - 2) pages.push("...");

//     pages.push(totalPages);

//     return pages;
//   };

//   const visiblePages = getVisiblePages();

//   return (
//     <Flex align="center" justify="space-between" mt={6}>
//       {/* Left: Items per page dropdown */}
//       <Flex align="center" gap={3}>
//         <Text fontSize="sm" color="gray.600">
//           Show:
//         </Text>

//         <Select
//           size="sm"
//           width="80px"
//           bg="white"
//           value={itemsPerPage}
//           onChange={(e) => setItemsPerPage(Number(e.target.value))}
//         >
//           <option value={10}>10</option>
//           <option value={20}>20</option>
//           <option value={50}>50</option>
//           <option value={100}>100</option>
//         </Select>

//         <Text fontSize="sm" color="gray.600">
//           per page
//         </Text>
//       </Flex>

//       {/* Center: Pagination Buttons */}
//       <HStack spacing={2} justify="center" flex={1}>
//         {/* First */}
//         <IconButton
//           aria-label="First page"
//           icon={<FiChevronLeft style={{ transform: 'rotate(180deg)' }} />}
//           isDisabled={currentPage === 1}
//           onClick={() => onPageChange(1)}
//           size="sm"
//           colorScheme="green"
//           variant="ghost"
//           rounded="full"
//         />

//         {/* Prev */}
//         <IconButton
//           aria-label="Previous page"
//           icon={<FiChevronLeft />}
//           isDisabled={currentPage === 1}
//           onClick={() => onPageChange(Math.max(1, currentPage - 1))}
//           size="sm"
//           colorScheme="green"
//           variant="ghost"
//           rounded="full"
//         />

//         {/* Page Numbers */}
//         {visiblePages.map((p, i) =>
//           p === "..." ? (
//             <Text key={i} px={2} color="gray.500">
//               ...
//             </Text>
//           ) : (
//             <Button
//               key={i}
//               size="sm"
//               rounded="full"
//               variant={p === currentPage ? "solid" : "outline"}
//               colorScheme="green"
//               onClick={() => onPageChange(p)}
//               minW="32px"
//               h="32px"
//               p={0}
//             >
//               {p}
//             </Button>
//           )
//         )}

//         {/* Next */}
//         <IconButton
//           aria-label="Next page"
//           icon={<FiChevronRight />}
//           isDisabled={currentPage === totalPages}
//           onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
//           size="sm"
//           colorScheme="green"
//           variant="ghost"
//           rounded="full"
//         />

//         {/* Last */}
//         <IconButton
//           aria-label="Last page"
//           icon={<FiChevronRight style={{ transform: 'rotate(180deg)' }} />}
//           isDisabled={currentPage === totalPages}
//           onClick={() => onPageChange(totalPages)}
//           size="sm"
//           colorScheme="green"
//           variant="ghost"
//           rounded="full"
//         />
//       </HStack>

//       {/* Right: Empty to balance Flex */}
//       <Box w="100px" />
//     </Flex>
//   );
// };

// const DailyRecords = () => {
//   const navigate = useNavigate();
//   const toast = useToast();
//   const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
//   const { isOpen: isDeleteAlertOpen, onOpen: onDeleteAlertOpen, onClose: onDeleteAlertClose } = useDisclosure();
//   const cancelRef = useRef();

//   const [records, setRecords] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
//   const [editingId, setEditingId] = useState(null);
//   const [selectedRecord, setSelectedRecord] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(10);
//   const [errors, setErrors] = useState({});
//   const [overlapWarning, setOverlapWarning] = useState(null);
//   const [touched, setTouched] = useState({});

//   const [formData, setFormData] = useState({
//     employeeId: '',
//     employeeGroup: '',
//     employeePosition: '',
//     leaveType: 'with_pay',
//     remarks: ''
//   });

//   const leaveTypeOptions = [
//     { value: 'with_pay', label: 'પગાર સાથે', payrollDeduction: false },
//     { value: 'without_pay', label: 'પગાર કપાત સાથે', payrollDeduction: true },
//     { value: 'casual', label: 'કેઝ્યુઅલ રજા', payrollDeduction: false },
//     { value: 'sick', label: 'બીમારી રજા', payrollDeduction: false },
//     { value: 'earned', label: 'ઉપાર્જિત રજા', payrollDeduction: false }
//   ];

//   useEffect(() => {
//     fetchRecords();
//     fetchEmployees();
//   }, [selectedDate]);

//   // Get today's date in YYYY-MM-DD format
//   const getTodayDate = () => {
//     return new Date().toISOString().split('T')[0];
//   };

//   // Check for overlapping leaves
//   const checkOverlapLeave = async (employeeId, recordDate, excludeRecordId = null) => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/daily-record/check-overlap`, {
//         params: {
//           employeeId,
//           recordDate,
//           excludeId: excludeRecordId
//         }
//       });
//       return response.data.hasOverlap;
//     } catch (error) {
//       console.error('Error checking overlap:', error);
//       return false;
//     }
//   };

//   const fetchRecords = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get(`${API_BASE_URL}/daily-record?date=${selectedDate}`);
//       console.log('Fetched records:', response.data);
//       setRecords(response.data);
//     } catch (error) {
//       console.error('Error fetching records:', error);
//       toast({
//         title: "ભૂલ",
//         description: "રેકોર્ડ લોડ કરવામાં નિષ્ફળ",
//         status: "error",
//         duration: 3000,
//         isClosable: true,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchEmployees = async () => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/employee`);
//       console.log('Fetched employees:', response.data);
//       setEmployees(response.data.filter(emp => emp.isActive !== false));
//     } catch (error) {
//       console.error('Error fetching employees:', error);
//     }
//   };

//   const getEmployeeName = (employee) => {
//     if (!employee) return '-';
//     return employee.employeeName || employee.employeeNameEnglish || '-';
//   };

//   const getEmployeePosition = (employee) => {
//     if (!employee) return '-';
//     return employee.employeePositionGujarati || employee.employeePositionEnglish || '-';
//   };

//   const getEmployeeGroup = (employee) => {
//     if (!employee) return '-';
//     return employee.employeeGroup || '-';
//   };

//   const handleEmployeeChange = async (e) => {
//     const employeeId = e.target.value;
//     const employee = employees.find(emp => emp._id === employeeId);
    
//     console.log('Selected employee:', employee);
    
//     if (employee) {
//       setFormData({
//         ...formData,
//         employeeId: employeeId,
//         employeeGroup: getEmployeeGroup(employee),
//         employeePosition: getEmployeePosition(employee)
//       });
      
//       if (errors.employeeId) {
//         setErrors({ ...errors, employeeId: "" });
//       }
      
//       if (employeeId && selectedDate) {
//         const hasOverlap = await checkOverlapLeave(employeeId, selectedDate, editingId);
//         if (hasOverlap) {
//           setOverlapWarning({
//             employeeName: getEmployeeName(employee),
//             date: selectedDate
//           });
//         } else {
//           setOverlapWarning(null);
//         }
//       }
//     } else {
//       setFormData({
//         ...formData,
//         employeeId: employeeId,
//         employeeGroup: '',
//         employeePosition: ''
//       });
//       setOverlapWarning(null);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
    
//     if (errors[name]) {
//       setErrors({ ...errors, [name]: "" });
//     }
    
//     if (name === 'leaveType' || name === 'remarks') {
//       setOverlapWarning(null);
//     }
    
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleBlur = (fieldName) => {
//     setTouched({ ...touched, [fieldName]: true });
//     validateField(fieldName, formData[fieldName]);
//   };

//   const validateField = (fieldName, value) => {
//     const newErrors = { ...errors };
    
//     switch(fieldName) {
//       case 'employeeId':
//         if (!value) {
//           newErrors.employeeId = "કર્મચારી પસંદ કરવો ફરજિયાત છે";
//         } else {
//           delete newErrors.employeeId;
//         }
//         break;
        
//       case 'leaveType':
//         if (!value) {
//           newErrors.leaveType = "રજાનો પ્રકાર પસંદ કરવો ફરજિયાત છે";
//         } else {
//           delete newErrors.leaveType;
//         }
//         break;
        
//       case 'remarks':
//         const currentLeaveType = fieldName === 'remarks' ? formData.leaveType : value;
//         if (currentLeaveType === 'without_pay' && (!value || value.trim() === '')) {
//           newErrors.remarks = "પગાર કપાતની રજા માટે કારણ લખવું ફરજિયાત છે";
//         } else {
//           delete newErrors.remarks;
//         }
//         break;
        
//       default:
//         break;
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const validateForm = () => {
//     const newErrors = {};
    
//     if (!formData.employeeId) {
//       newErrors.employeeId = "કર્મચારી પસંદ કરવો ફરજિયાત છે";
//     }
    
//     if (!formData.leaveType) {
//       newErrors.leaveType = "રજાનો પ્રકાર પસંદ કરવો ફરજિયાત છે";
//     }
    
//     if (formData.leaveType === 'without_pay' && (!formData.remarks || formData.remarks.trim() === '')) {
//       newErrors.remarks = "પગાર કપાતની રજા માટે કારણ લખવું ફરજિયાત છે";
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const isFutureDate = (dateString) => {
//     const today = new Date().toISOString().split('T')[0];
//     return dateString > today;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (overlapWarning) {
//       toast({
//         title: "ડુપ્લિકેટ રજા",
//         description: `આ કર્મચારી માટે ${formatDateToDDMMYYYY(overlapWarning.date)} તારીખે રજા પહેલેથી નોંધાયેલ છે. એક જ તારીખે બે રજા નાખી શકાતી નથી.`,
//         status: "warning",
//         duration: 5000,
//         isClosable: true,
//         icon: <FiAlertCircle />,
//       });
//       return;
//     }
    
//     if (isFutureDate(selectedDate)) {
//       toast({
//         title: "ભૂલ",
//         description: "ભવિષ્યની તારીખ માટે રજા નોંધી શકાતી નથી. કૃપા કરી આજની અથવા ભૂતકાળની તારીખ પસંદ કરો.",
//         status: "error",
//         duration: 5000,
//         isClosable: true,
//       });
//       return;
//     }
    
//     if (!validateForm()) {
//       toast({
//         title: "ભૂલ",
//         description: "કૃપા કરી તમામ ફરજિયાત ફીલ્ડ યોગ્ય રીતે ભરો",
//         status: "error",
//         duration: 5000,
//         isClosable: true,
//       });
//       return;
//     }
    
//     const hasOverlap = await checkOverlapLeave(formData.employeeId, selectedDate, editingId);
//     if (hasOverlap) {
//       toast({
//         title: "ડુપ્લિકેટ રજા",
//         description: `આ કર્મચારી માટે ${formatDateToDDMMYYYY(selectedDate)} તારીખે રજા પહેલેથી નોંધાયેલ છે. એક જ તારીખે બે રજા નાખી શકાતી નથી.`,
//         status: "warning",
//         duration: 5000,
//         isClosable: true,
//         icon: <FiAlertCircle />,
//       });
//       return;
//     }
    
//     setSaving(true);
//     try {
//       const selectedLeaveType = leaveTypeOptions.find(opt => opt.value === formData.leaveType);
//       const leaveTypeLabel = selectedLeaveType?.label || formData.leaveType;
      
//       const dataToSend = {
//         employeeId: formData.employeeId,
//         recordDate: selectedDate,
//         workName: leaveTypeLabel,
//         employeeGroup: formData.employeeGroup,
//         employeeCenter: formData.employeeGroup,
//         employeeBody: formData.employeePosition,
//         workType: 'leave',
//         duration: 8,
//         description: formData.remarks,
//         location: 'Office',
//         status: 'pending',
//         leaveType: formData.leaveType,
//         isPaidLeave: !selectedLeaveType?.payrollDeduction,
//       };
      
//       console.log('Sending data:', dataToSend);
      
//       if (editingId) {
//         await axios.put(`${API_BASE_URL}/daily-record/${editingId}`, dataToSend);
//         toast({
//           title: "સફળ",
//           description: "રજા રેકોર્ડ સફળતાપૂર્વક અપડેટ થયો",
//           status: "success",
//           duration: 3000,
//           isClosable: true,
//         });
//       } else {
//         await axios.post(`${API_BASE_URL}/daily-record`, dataToSend);
//         toast({
//           title: "સફળ",
//           description: "રજા રેકોર્ડ સફળતાપૂર્વક ઉમેરાયો",
//           status: "success",
//           duration: 3000,
//           isClosable: true,
//         });
//       }
      
//       fetchRecords();
//       resetForm();
//       onModalClose();
//     } catch (error) {
//       console.error('Error saving record:', error);
      
//       if (error.response?.status === 409) {
//         toast({
//           title: "ડુપ્લિકેટ રજા",
//           description: error.response?.data?.message || "આ તારીખે આ કર્મચારી માટે રજા પહેલેથી નોંધાયેલ છે.",
//           status: "warning",
//           duration: 5000,
//           isClosable: true,
//         });
//       } else {
//         toast({
//           title: "ભૂલ",
//           description: error.response?.data?.message || "રેકોર્ડ સેવ કરવામાં ભૂલ",
//           status: "error",
//           duration: 5000,
//           isClosable: true,
//         });
//       }
//     } finally {
//       setSaving(false);
//     }
//   };

//   const resetForm = () => {
//     setEditingId(null);
//     setFormData({
//       employeeId: '',
//       employeeGroup: '',
//       employeePosition: '',
//       leaveType: 'with_pay',
//       remarks: ''
//     });
//     setErrors({});
//     setTouched({});
//     setOverlapWarning(null);
//   };

//   const handleAddNew = () => {
//     resetForm();
//     onModalOpen();
//   };

//   const handleEdit = async (record) => {
//     const leaveTypeValue = leaveTypeOptions.find(opt => opt.label === record.workName)?.value || 'with_pay';
    
//     setEditingId(record._id);
//     setFormData({
//       employeeId: record.employeeId?._id || '',
//       employeeGroup: record.employeeGroup || '',
//       employeePosition: record.employeeBody || '',
//       leaveType: leaveTypeValue,
//       remarks: record.description || ''
//     });
//     setTouched({});
    
//     if (record.employeeId?._id && selectedDate) {
//       const hasOverlap = await checkOverlapLeave(record.employeeId._id, selectedDate, record._id);
//       if (hasOverlap) {
//         setOverlapWarning({
//           employeeName: getEmployeeName(record.employeeId),
//           date: selectedDate
//         });
//       } else {
//         setOverlapWarning(null);
//       }
//     }
    
//     onModalOpen();
//   };

//   const handleDelete = async () => {
//     if (!selectedRecord) return;
    
//     setLoading(true);
//     try {
//       await axios.delete(`${API_BASE_URL}/daily-record/${selectedRecord._id}`);
//       toast({
//         title: "સફળ",
//         description: "રજા રેકોર્ડ સફળતાપૂર્વક ડિલીટ થયો",
//         status: "success",
//         duration: 3000,
//         isClosable: true,
//       });
//       onDeleteAlertClose();
//       fetchRecords();
//     } catch (error) {
//       console.error('Error deleting record:', error);
//       toast({
//         title: "ભૂલ",
//         description: "રેકોર્ડ ડિલીટ કરવામાં નિષ્ફળ",
//         status: "error",
//         duration: 3000,
//         isClosable: true,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateStatus = async (id, status) => {
//     try {
//       await axios.put(`${API_BASE_URL}/daily-record/${id}/status`, { status });
//       fetchRecords();
//       toast({
//         title: "સફળ",
//         description: "સ્થિતિ અપડેટ થઈ",
//         status: "success",
//         duration: 2000,
//         isClosable: true,
//       });
//     } catch (error) {
//       console.error('Error updating status:', error);
//       toast({
//         title: "ભૂલ",
//         description: "સ્થિતિ અપડેટ કરવામાં નિષ્ફળ",
//         status: "error",
//         duration: 3000,
//         isClosable: true,
//       });
//     }
//   };

//   // Pagination
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = records.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(records.length / itemsPerPage);

//   const handlePageChange = (page) => setCurrentPage(page);
//   const handleItemsPerPageChange = (value) => {
//     setItemsPerPage(value);
//     setCurrentPage(1);
//   };

//   // Statistics with leave type breakdown
//   const stats = {
//     total: records.length,
//     approved: records.filter(r => r.status === 'approved').length,
//     pending: records.filter(r => r.status === 'pending').length,
//     rejected: records.filter(r => r.status === 'rejected').length,
//     paidLeaves: records.filter(r => r.isPaidLeave === true && r.status === 'approved').length,
//     unpaidLeaves: records.filter(r => r.isPaidLeave === false && r.status === 'approved').length,
//   };

//   return (
//     <Box bg="#F8FAF9" minH="100vh" p={6}>
//         {/* Header */}
//         <Flex align="center" mb={6}>
//           <Box width="180px">
//             <Button
//               leftIcon={<FiArrowLeft />}
//               colorScheme="green"
//               variant="outline"
//               onClick={() => navigate("/pe-roll")}
//             >
//               પાછા જાવ
//             </Button>
//           </Box>
//           <Heading flex="1" textAlign="center" size="lg" color="green.700">
//             રજા વ્યવસ્થાપન
//           </Heading>

//         {/* 👉 RIGHT : Empty space (for perfect centering) */}
//         <Box width="180px" />
//         <Button
//           leftIcon={<FiPlus />}
//           colorScheme="green"
//           onClick={handleAddNew}
//           bg="#307644"
//           _hover={{ bg: "#0F3A1F" }}
//           rounded="xl"
//           // px={6}
//         >
//           નવી રજા
//         </Button>
//       </Flex>

//       {/* Date Selector Card */}
//       <Card rounded="2xl" shadow="md" mb={6} border="1px solid #E3EDE8">
//         <CardBody>
//           <Flex align="center" gap={4} flexWrap="wrap">
//             <Flex align="center" gap={2}>
//               <FiCalendar size={20} color="#1E4D2B" />
//               <Text fontWeight="500" color="gray.700">રજાની તારીખ:</Text>
//             </Flex>
//             <Input
//               type="date"
//               value={selectedDate}
//               onChange={(e) => setSelectedDate(e.target.value)}
//               max={getTodayDate()}
//               w="auto"
//               maxW="200px"
//               borderColor="gray.300"
//               rounded="lg"
//             />
//             {/* <Button
//               onClick={fetchRecords}
//               colorScheme="green"
//               variant="outline"
//               rounded="lg"
//             >
//               શોધો
//             </Button> */}
//           </Flex>
//         </CardBody>
//       </Card>

//       {/* Statistics Cards */}
//       {!loading && records.length > 0 && (
//         <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={6}>
//           <Card bg="white" rounded="xl" shadow="sm" borderLeft="4px solid #1E4D2B">
//             <CardBody>
//               <Flex align="center" justify="space-between">
//                 <Box>
//                   <Text color="gray.500" fontSize="sm">કુલ રજાઓ</Text>
//                   <Heading size="lg" color="green.700">{stats.total}</Heading>
//                 </Box>
//                 <Box bg="green.100" p={2} rounded="full">
//                   <FiFileText size={24} color="#1E4D2B" />
//                 </Box>
//               </Flex>
//             </CardBody>
//           </Card>
          
//           <Card bg="white" rounded="xl" shadow="sm" borderLeft="4px solid #38A169">
//             <CardBody>
//               <Flex align="center" justify="space-between">
//                 <Box>
//                   <Text color="gray.500" fontSize="sm">મંજૂર</Text>
//                   <Heading size="lg" color="green.600">{stats.approved}</Heading>
//                 </Box>
//                 <Box bg="green.100" p={2} rounded="full">
//                   <FiCheckCircle size={24} color="#38A169" />
//                 </Box>
//               </Flex>
//             </CardBody>
//           </Card>
          
//           <Card bg="white" rounded="xl" shadow="sm" borderLeft="4px solid #F6AD55">
//             <CardBody>
//               <Flex align="center" justify="space-between">
//                 <Box>
//                   <Text color="gray.500" fontSize="sm">બાકી</Text>
//                   <Heading size="lg" color="orange.500">{stats.pending}</Heading>
//                 </Box>
//                 <Box bg="orange.100" p={2} rounded="full">
//                   <FiClock size={24} color="#F6AD55" />
//                 </Box>
//               </Flex>
//             </CardBody>
//           </Card>
          
//           <Card bg="white" rounded="xl" shadow="sm" borderLeft="4px solid #E53E3E">
//             <CardBody>
//               <Flex align="center" justify="space-between">
//                 <Box>
//                   <Text color="gray.500" fontSize="sm">નામંજૂર</Text>
//                   <Heading size="lg" color="red.500">{stats.rejected}</Heading>
//                 </Box>
//                 <Box bg="red.100" p={2} rounded="full">
//                   <FiXCircle size={24} color="#E53E3E" />
//                 </Box>
//               </Flex>
//             </CardBody>
//           </Card>
//         </SimpleGrid>
//       )}

//       {/* Records Table */}
//       <Card rounded="2xl" shadow="lg" overflow="hidden">
//         {/* <CardHeader bg="#1E4D2B" py={4}>
//           <Heading size="md" color="white">
//             રજા રેકોર્ડ યાદી - {formatDateToDDMMYYYY(selectedDate)}
//           </Heading>
//           <Text fontSize="sm" color="whiteAlpha.800" mt={1}>
//             તમામ નોંધાયેલ રજાની વિગતો
//           </Text>
//         </CardHeader> */}

//         <CardBody p={0}>
//           {loading ? (
//             <Box textAlign="center" py={10}>
//               <Spinner size="xl" color="green.500" />
//               <Text mt={4}>રેકોર્ડ લોડ થઈ રહ્યા છે...</Text>
//             </Box>
//           ) : records.length === 0 ? (
//             <Box textAlign="center" py={10}>
//               <Alert status="info" borderRadius="lg" maxW="md" mx="auto">
//                 <AlertIcon />
//                 આ તારીખે કોઈ રજા રેકોર્ડ નથી. નવી રજા ઉમેરવા માટે "નવી રજા" બટન દબાવો.
//               </Alert>
//             </Box>
//           ) : (
//             <>
//               <Box overflowX="auto">
//                 <Table variant="simple">
//                   <Thead bg="#E8F3EC">
//                     <Tr>
//                       <Th>ક્રમાંક</Th>
//                       <Th>કર્મચારીનું નામ</Th>
//                       <Th>હોદ્દો</Th>
//                       <Th>ગ્રુપ</Th>
//                       <Th>રજાનો પ્રકાર</Th>
//                       <Th>પગાર અસર</Th>
//                       <Th>રીમાર્ક</Th>
//                       <Th>સ્થિતિ</Th>
//                       <Th>ક્રિયા</Th>
//                     </Tr>
//                   </Thead>
//                   <Tbody>
//                     {currentItems.map((record, index) => (
//                       <Tr key={record._id} _hover={{ bg: "gray.50" }}>
//                         <Td fontWeight="medium">{indexOfFirstItem + index + 1}</Td>
//                         <Td>
//                           <Text fontWeight="500">
//                             {getEmployeeName(record.employeeId)}
//                           </Text>
//                           <Text fontSize="xs" color="gray.500">
//                             {record.employeeId?.employeeCode || ''}
//                           </Text>
//                         </Td>
//                         <Td>
//                           <Badge colorScheme="blue" fontSize="xs" px={2} py={1}>
//                             {record.employeeBody || getEmployeePosition(record.employeeId) || '-'}
//                           </Badge>
//                         </Td>
//                         <Td>
//                           <Badge colorScheme="purple" fontSize="xs" px={2} py={1}>
//                             {record.employeeGroup || getEmployeeGroup(record.employeeId) || '-'}
//                           </Badge>
//                         </Td>
//                         <Td>
//                           <Tag colorScheme="orange" size="sm">
//                             <TagLabel>{record.workName || '-'}</TagLabel>
//                           </Tag>
//                         </Td>
//                         <Td>
//                           <Badge 
//                             colorScheme={record.isPaidLeave ? "green" : "red"} 
//                             fontSize="xs" 
//                             px={2} 
//                             py={1}
//                           >
//                             {record.isPaidLeave ? "પગાર સાથે" : "પગાર કપાત"}
//                           </Badge>
//                         </Td>
//                         <Td>
//                           <Text noOfLines={2} maxW="200px" title={record.description}>
//                             {record.description || '-'}
//                           </Text>
//                         </Td>
//                         <Td>
//                           <Select
//                             value={record.status}
//                             onChange={(e) => updateStatus(record._id, e.target.value)}
//                             size="sm"
//                             w="100px"
//                             rounded="lg"
//                             bg={record.status === 'approved' ? 'green.50' : record.status === 'rejected' ? 'red.50' : 'yellow.50'}
//                             borderColor="transparent"
//                             _hover={{ borderColor: "gray.300" }}
//                           >
//                             <option value="pending">બાકી</option>
//                             <option value="approved">મંજૂર</option>
//                             <option value="rejected">નામંજૂર</option>
//                           </Select>
//                         </Td>
//                         <Td>
//                           <HStack spacing={1}>
//                             <Tooltip label="સુધારો" hasArrow>
//                               <IconButton
//                                 icon={<FiEdit2 />}
//                                 size="sm"
//                                 colorScheme="blue"
//                                 variant="ghost"
//                                 onClick={() => handleEdit(record)}
//                                 aria-label="Edit"
//                                 rounded="full"
//                               />
//                             </Tooltip>
//                             <Tooltip label="કાઢી નાખો" hasArrow>
//                               <IconButton
//                                 icon={<FiTrash2 />}
//                                 size="sm"
//                                 colorScheme="red"
//                                 variant="ghost"
//                                 onClick={() => {
//                                   setSelectedRecord(record);
//                                   onDeleteAlertOpen();
//                                 }}
//                                 aria-label="Delete"
//                                 rounded="full"
//                               />
//                             </Tooltip>
//                           </HStack>
//                         </Td>
//                       </Tr>
//                     ))}
//                   </Tbody>
//                 </Table>
//               </Box>

              
//             </>
//           )}
//         </CardBody>
//       </Card>

//       {/* Pagination */}
//               <Pagination
//                 currentPage={currentPage}
//                 totalPages={totalPages}
//                 onPageChange={handlePageChange}
//                 itemsPerPage={itemsPerPage}
//                 setItemsPerPage={handleItemsPerPageChange}
//               />

//       {/* Add/Edit Modal */}
//       <Modal isOpen={isModalOpen} onClose={onModalClose} size="lg" scrollBehavior="inside">
//         <ModalOverlay />
//         <ModalContent borderRadius="2xl">
//           <ModalHeader bg="#307644" color="white" borderTopRadius="2xl">
//             <Flex align="center" gap={3}>
//               {editingId ? <FiEdit2 size={20} /> : <FiPlus size={20} />}
//               <Heading size="md" color="white">
//                 {editingId ? 'રજા રેકોર્ડ સુધારો' : 'નવી રજા ઉમેરો'}
//               </Heading>
//             </Flex>
//           </ModalHeader>
//           <ModalCloseButton color="white" />
          
//           <ModalBody py={6} px={6}>
//             <form onSubmit={handleSubmit}>
//               <VStack spacing={5} align="stretch">
//                 {/* Overlap Warning */}
//                 {overlapWarning && (
//                   <Alert status="warning" borderRadius="lg">
//                     <AlertIcon />
//                     <Box>
//                       <Text fontWeight="500">ચેતવણી: ડુપ્લિકેટ રજા</Text>
//                       <Text fontSize="sm">
//                         {overlapWarning.employeeName} માટે {formatDateToDDMMYYYY(overlapWarning.date)} તારીખે રજા પહેલેથી નોંધાયેલ છે.
//                         એક જ તારીખે બે રજા નાખી શકાતી નથી.
//                       </Text>
//                     </Box>
//                   </Alert>
//                 )}

//                 {/* Date Display */}
//                 <Box bg="gray.50" p={3} rounded="lg">
//                   <Flex align="center" gap={2}>
//                     <FiCalendar color="#1E4D2B" />
//                     <Text fontWeight="500">રજાની તારીખ:</Text>
//                     <Text fontWeight="600">{formatDateToDDMMYYYY(selectedDate)}</Text>
//                   </Flex>
//                 </Box>

//                 {/* Employee Name Dropdown */}
//                 <FormControl isRequired isInvalid={errors.employeeId && touched.employeeId}>
//                   <FormLabel fontWeight="500">કર્મચારીનું નામ</FormLabel>
//                   <Select
//                     placeholder="કર્મચારી પસંદ કરો"
//                     value={formData.employeeId}
//                     onChange={handleEmployeeChange}
//                     onBlur={() => handleBlur('employeeId')}
//                     bg="white"
//                     size="lg"
//                     rounded="lg"
//                   >
//                     {employees.map(emp => (
//                       <option key={emp._id} value={emp._id}>
//                         {getEmployeeName(emp)}
//                       </option>
//                     ))}
//                   </Select>
//                   <FormErrorMessage>{errors.employeeId}</FormErrorMessage>
//                 </FormControl>

//                 {/* Employee Group - Auto-filled/Read-only */}
//                 <FormControl>
//                   <FormLabel fontWeight="500">કર્મચારીનું ગ્રુપ</FormLabel>
//                   <Input
//                     value={formData.employeeGroup}
//                     isReadOnly
//                     bg="gray.100"
//                     size="lg"
//                     rounded="lg"
//                     placeholder="કર્મચારી પસંદ કરતાં ઓટો ફીલ થશે"
//                   />
//                 </FormControl>

//                 {/* Employee Position/Hoddo - Auto-filled/Read-only */}
//                 <FormControl>
//                   <FormLabel fontWeight="500">કર્મચારીનો હોદ્દો</FormLabel>
//                   <Input
//                     value={formData.employeePosition}
//                     isReadOnly
//                     bg="gray.100"
//                     size="lg"
//                     rounded="lg"
//                     placeholder="કર્મચારી પસંદ કરતાં ઓટો ફીલ થશે"
//                   />
//                 </FormControl>

//                 {/* Leave Type Dropdown */}
//                 <FormControl isRequired isInvalid={errors.leaveType && touched.leaveType}>
//                   <FormLabel fontWeight="500">રજાનો પ્રકાર</FormLabel>
//                   <Select
//                     name="leaveType"
//                     value={formData.leaveType}
//                     onChange={handleChange}
//                     onBlur={() => handleBlur('leaveType')}
//                     bg="white"
//                     size="lg"
//                     rounded="lg"
//                   >
//                     {leaveTypeOptions.map(option => (
//                       <option key={option.value} value={option.value}>
//                         {option.label} {option.payrollDeduction ? '(પગાર કપાત)' : '(પગાર સાથે)'}
//                       </option>
//                     ))}
//                   </Select>
//                   <FormErrorMessage>{errors.leaveType}</FormErrorMessage>
//                 </FormControl>

//                 {/* Remarks Textarea */}
//                 <FormControl isInvalid={errors.remarks && touched.remarks}>
//                   <FormLabel fontWeight="500">
//                     રીમાર્ક
//                     {formData.leaveType === 'without_pay' && (
//                       <Text as="span" color="red.500" ml={1}>*</Text>
//                     )}
//                   </FormLabel>
//                   <Textarea
//                     name="remarks"
//                     value={formData.remarks}
//                     onChange={handleChange}
//                     onBlur={() => handleBlur('remarks')}
//                     placeholder={formData.leaveType === 'without_pay' 
//                       ? "પગાર કપાતની રજા માટે કારણ લખવું ફરજિયાત છે..." 
//                       : "રજાનું કારણ અથવા વધારાની નોંધ લખો..."}
//                     rows={4}
//                     bg="white"
//                     rounded="lg"
//                     resize="vertical"
//                   />
//                   <FormErrorMessage>{errors.remarks}</FormErrorMessage>
//                 </FormControl>
//               </VStack>
//             </form>
//           </ModalBody>

//           <ModalFooter borderTop="1px solid" borderColor="gray.200" gap={3}>
//             <Button variant="outline" colorScheme="red" onClick={onModalClose} rounded="lg">
//               રદ કરો
//             </Button>
//             <Button 
//               colorScheme="green" 
//               onClick={handleSubmit} 
//               isLoading={saving} 
//               leftIcon={<FiSave />} 
//               rounded="lg"
//               bg="#1E4D2B"
//               _hover={{ bg: "#0F3A1F" }}
//               isDisabled={!!overlapWarning}
//             >
//               {editingId ? 'અપડેટ કરો' : 'સેવ કરો'}
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>

//       {/* Delete Confirmation Alert */}
//       <AlertDialog
//         isOpen={isDeleteAlertOpen}
//         leastDestructiveRef={cancelRef}
//         onClose={onDeleteAlertClose}
//       >
//         <AlertDialogOverlay>
//           <AlertDialogContent borderRadius="2xl">
//             <AlertDialogHeader fontSize="lg" fontWeight="bold" bg="red.600" color="white" borderTopRadius="2xl">
//               રજા રેકોર્ડ ડિલીટ કરો
//             </AlertDialogHeader>

//             <AlertDialogBody py={6}>
//               <Text>શું તમે ખરેખર આ રજા રેકોર્ડ કાયમ માટે ડિલીટ કરવા માંગો છો?</Text>
//               <Text mt={2} fontSize="sm" color="gray.500">આ ક્રિયા પછી ડેટા પુનઃપ્રાપ્ત કરી શકાશે નહીં.</Text>
//             </AlertDialogBody>

//             <AlertDialogFooter gap={3}>
//               <Button ref={cancelRef} onClick={onDeleteAlertClose} rounded="lg">
//                 રદ કરો
//               </Button>
//               <Button colorScheme="red" onClick={handleDelete} rounded="lg">
//                 ડિલીટ કરો
//               </Button>
//             </AlertDialogFooter>
//           </AlertDialogContent>
//         </AlertDialogOverlay>
//       </AlertDialog>
//     </Box>
//   );
// };

// export default DailyRecords;



// dailyrecords.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
  Grid,  // ← Add this
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
  Tooltip,
  FormControl,
  FormLabel,
  FormErrorMessage,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Textarea,
} from "@chakra-ui/react";
import { ViewIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";

import {
  FiCalendar,
  FiEdit2,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiSave,
  FiPlus,
  FiArrowLeft,
  FiAlertCircle,
  FiEye,
} from "react-icons/fi";

const API_BASE_URL = "http://localhost:5000/api";

// Helper function to format date as DD/MM/YYYY
const formatDateToDDMMYYYY = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange, itemsPerPage, setItemsPerPage }) => {
  if (!totalPages) return null;

  const getVisiblePages = () => {
    const pages = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    if (currentPage > 3) pages.push("...");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let p = start; p <= end; p++) pages.push(p);

    if (currentPage < totalPages - 2) pages.push("...");

    pages.push(totalPages);

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <Flex align="center" justify="space-between" mt={6}>
      {/* Left: Items per page dropdown */}
      <Flex align="center" gap={3}>
        <Text fontSize="sm" color="gray.600">
          Show:
        </Text>

        <Select
          size="sm"
          width="80px"
          bg="white"
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </Select>

        <Text fontSize="sm" color="gray.600">
          per page
        </Text>
      </Flex>

      {/* Center: Pagination Buttons */}
      <HStack spacing={2} justify="center" flex={1}>
        {/* First */}
        <IconButton
          aria-label="First page"
          icon={<FiChevronLeft style={{ transform: 'rotate(180deg)' }} />}
          isDisabled={currentPage === 1}
          onClick={() => onPageChange(1)}
          size="sm"
          colorScheme="green"
          variant="ghost"
          rounded="full"
        />

        {/* Prev */}
        <IconButton
          aria-label="Previous page"
          icon={<FiChevronLeft />}
          isDisabled={currentPage === 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          size="sm"
          colorScheme="green"
          variant="ghost"
          rounded="full"
        />

        {/* Page Numbers */}
        {visiblePages.map((p, i) =>
          p === "..." ? (
            <Text key={i} px={2} color="gray.500">
              ...
            </Text>
          ) : (
            <Button
              key={i}
              size="sm"
              rounded="full"
              variant={p === currentPage ? "solid" : "outline"}
              colorScheme="green"
              onClick={() => onPageChange(p)}
              minW="32px"
              h="32px"
              p={0}
            >
              {p}
            </Button>
          )
        )}

        {/* Next */}
        <IconButton
          aria-label="Next page"
          icon={<FiChevronRight />}
          isDisabled={currentPage === totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          size="sm"
          colorScheme="green"
          variant="ghost"
          rounded="full"
        />

        {/* Last */}
        <IconButton
          aria-label="Last page"
          icon={<FiChevronRight style={{ transform: 'rotate(180deg)' }} />}
          isDisabled={currentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
          size="sm"
          colorScheme="green"
          variant="ghost"
          rounded="full"
        />
      </HStack>

      {/* Right: Empty to balance Flex */}
      <Box w="100px" />
    </Flex>
  );
};

const DailyRecords = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
  const { isOpen: isViewModalOpen, onOpen: onViewModalOpen, onClose: onViewModalClose } = useDisclosure();
  const { isOpen: isDeleteAlertOpen, onOpen: onDeleteAlertOpen, onClose: onDeleteAlertClose } = useDisclosure();
  const cancelRef = useRef();

  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingId, setEditingId] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [errors, setErrors] = useState({});
  const [overlapWarning, setOverlapWarning] = useState(null);
  const [touched, setTouched] = useState({});

  const [formData, setFormData] = useState({
    employeeId: '',
    employeeGroup: '',
    employeePosition: '',
    leaveType: 'with_pay',
    remarks: ''
  });

  const leaveTypeOptions = [
    { value: 'with_pay', label: 'પગાર સાથે', payrollDeduction: false },
    { value: 'without_pay', label: 'પગાર કપાત સાથે', payrollDeduction: true },
    { value: 'casual', label: 'કેઝ્યુઅલ રજા', payrollDeduction: false },
    { value: 'sick', label: 'બીમારી રજા', payrollDeduction: false },
    { value: 'earned', label: 'ઉપાર્જિત રજા', payrollDeduction: false }
  ];

  useEffect(() => {
    fetchRecords();
    fetchEmployees();
  }, [selectedDate]);

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Check for overlapping leaves
  const checkOverlapLeave = async (employeeId, recordDate, excludeRecordId = null) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/daily-record/check-overlap`, {
        params: {
          employeeId,
          recordDate,
          excludeId: excludeRecordId
        }
      });
      return response.data.hasOverlap;
    } catch (error) {
      console.error('Error checking overlap:', error);
      return false;
    }
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/daily-record?date=${selectedDate}`);
      console.log('Fetched records:', response.data);
      setRecords(response.data);
    } catch (error) {
      console.error('Error fetching records:', error);
      toast({
        title: "ભૂલ",
        description: "રેકોર્ડ લોડ કરવામાં નિષ્ફળ",
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
      const response = await axios.get(`${API_BASE_URL}/employee`);
      console.log('Fetched employees:', response.data);
      setEmployees(response.data.filter(emp => emp.isActive !== false));
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const getEmployeeName = (employee) => {
    if (!employee) return '-';
    return employee.employeeName || employee.employeeNameEnglish || '-';
  };

  const getEmployeePosition = (employee) => {
    if (!employee) return '-';
    return employee.employeePositionGujarati || employee.employeePositionEnglish || '-';
  };

  const getEmployeeGroup = (employee) => {
    if (!employee) return '-';
    return employee.employeeGroup || '-';
  };

  const handleEmployeeChange = async (e) => {
    const employeeId = e.target.value;
    const employee = employees.find(emp => emp._id === employeeId);
    
    console.log('Selected employee:', employee);
    
    if (employee) {
      setFormData({
        ...formData,
        employeeId: employeeId,
        employeeGroup: getEmployeeGroup(employee),
        employeePosition: getEmployeePosition(employee)
      });
      
      if (errors.employeeId) {
        setErrors({ ...errors, employeeId: "" });
      }
      
      if (employeeId && selectedDate) {
        const hasOverlap = await checkOverlapLeave(employeeId, selectedDate, editingId);
        if (hasOverlap) {
          setOverlapWarning({
            employeeName: getEmployeeName(employee),
            date: selectedDate
          });
        } else {
          setOverlapWarning(null);
        }
      }
    } else {
      setFormData({
        ...formData,
        employeeId: employeeId,
        employeeGroup: '',
        employeePosition: ''
      });
      setOverlapWarning(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
    
    if (name === 'leaveType' || name === 'remarks') {
      setOverlapWarning(null);
    }
    
    setFormData({ ...formData, [name]: value });
  };

  const handleBlur = (fieldName) => {
    setTouched({ ...touched, [fieldName]: true });
    validateField(fieldName, formData[fieldName]);
  };

  const validateField = (fieldName, value) => {
    const newErrors = { ...errors };
    
    switch(fieldName) {
      case 'employeeId':
        if (!value) {
          newErrors.employeeId = "કર્મચારી પસંદ કરવો ફરજિયાત છે";
        } else {
          delete newErrors.employeeId;
        }
        break;
        
      case 'leaveType':
        if (!value) {
          newErrors.leaveType = "રજાનો પ્રકાર પસંદ કરવો ફરજિયાત છે";
        } else {
          delete newErrors.leaveType;
        }
        break;
        
      case 'remarks':
        const currentLeaveType = fieldName === 'remarks' ? formData.leaveType : value;
        if (currentLeaveType === 'without_pay' && (!value || value.trim() === '')) {
          newErrors.remarks = "પગાર કપાતની રજા માટે કારણ લખવું ફરજિયાત છે";
        } else {
          delete newErrors.remarks;
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.employeeId) {
      newErrors.employeeId = "કર્મચારી પસંદ કરવો ફરજિયાત છે";
    }
    
    if (!formData.leaveType) {
      newErrors.leaveType = "રજાનો પ્રકાર પસંદ કરવો ફરજિયાત છે";
    }
    
    if (formData.leaveType === 'without_pay' && (!formData.remarks || formData.remarks.trim() === '')) {
      newErrors.remarks = "પગાર કપાતની રજા માટે કારણ લખવું ફરજિયાત છે";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFutureDate = (dateString) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString > today;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (overlapWarning) {
      toast({
        title: "ડુપ્લિકેટ રજા",
        description: `આ કર્મચારી માટે ${formatDateToDDMMYYYY(overlapWarning.date)} તારીખે રજા પહેલેથી નોંધાયેલ છે. એક જ તારીખે બે રજા નાખી શકાતી નથી.`,
        status: "warning",
        duration: 5000,
        isClosable: true,
        icon: <FiAlertCircle />,
      });
      return;
    }
    
    if (isFutureDate(selectedDate)) {
      toast({
        title: "ભૂલ",
        description: "ભવિષ્યની તારીખ માટે રજા નોંધી શકાતી નથી. કૃપા કરી આજની અથવા ભૂતકાળની તારીખ પસંદ કરો.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    if (!validateForm()) {
      toast({
        title: "ભૂલ",
        description: "કૃપા કરી તમામ ફરજિયાત ફીલ્ડ યોગ્ય રીતે ભરો",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    const hasOverlap = await checkOverlapLeave(formData.employeeId, selectedDate, editingId);
    if (hasOverlap) {
      toast({
        title: "ડુપ્લિકેટ રજા",
        description: `આ કર્મચારી માટે ${formatDateToDDMMYYYY(selectedDate)} તારીખે રજા પહેલેથી નોંધાયેલ છે. એક જ તારીખે બે રજા નાખી શકાતી નથી.`,
        status: "warning",
        duration: 5000,
        isClosable: true,
        icon: <FiAlertCircle />,
      });
      return;
    }
    
    setSaving(true);
    try {
      const selectedLeaveType = leaveTypeOptions.find(opt => opt.value === formData.leaveType);
      const leaveTypeLabel = selectedLeaveType?.label || formData.leaveType;
      
      const dataToSend = {
        employeeId: formData.employeeId,
        recordDate: selectedDate,
        workName: leaveTypeLabel,
        employeeGroup: formData.employeeGroup,
        employeeCenter: formData.employeeGroup,
        employeeBody: formData.employeePosition,
        workType: 'leave',
        duration: 8,
        description: formData.remarks,
        location: 'Office',
        status: 'pending',
        leaveType: formData.leaveType,
        isPaidLeave: !selectedLeaveType?.payrollDeduction,
      };
      
      console.log('Sending data:', dataToSend);
      
      if (editingId) {
        await axios.put(`${API_BASE_URL}/daily-record/${editingId}`, dataToSend);
        toast({
          title: "સફળ",
          description: "રજા રેકોર્ડ સફળતાપૂર્વક અપડેટ થયો",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        await axios.post(`${API_BASE_URL}/daily-record`, dataToSend);
        toast({
          title: "સફળ",
          description: "રજા રેકોર્ડ સફળતાપૂર્વક ઉમેરાયો",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      
      fetchRecords();
      resetForm();
      onModalClose();
    } catch (error) {
      console.error('Error saving record:', error);
      
      if (error.response?.status === 409) {
        toast({
          title: "ડુપ્લિકેટ રજા",
          description: error.response?.data?.message || "આ તારીખે આ કર્મચારી માટે રજા પહેલેથી નોંધાયેલ છે.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: "ભૂલ",
          description: error.response?.data?.message || "રેકોર્ડ સેવ કરવામાં ભૂલ",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      employeeId: '',
      employeeGroup: '',
      employeePosition: '',
      leaveType: 'with_pay',
      remarks: ''
    });
    setErrors({});
    setTouched({});
    setOverlapWarning(null);
  };

  const handleAddNew = () => {
    resetForm();
    onModalOpen();
  };

  const handleView = (record) => {
    setViewingRecord(record);
    onViewModalOpen();
  };

  const handleEdit = async (record) => {
    const leaveTypeValue = leaveTypeOptions.find(opt => opt.label === record.workName)?.value || 'with_pay';
    
    setEditingId(record._id);
    setFormData({
      employeeId: record.employeeId?._id || '',
      employeeGroup: record.employeeGroup || '',
      employeePosition: record.employeeBody || '',
      leaveType: leaveTypeValue,
      remarks: record.description || ''
    });
    setTouched({});
    
    if (record.employeeId?._id && selectedDate) {
      const hasOverlap = await checkOverlapLeave(record.employeeId._id, selectedDate, record._id);
      if (hasOverlap) {
        setOverlapWarning({
          employeeName: getEmployeeName(record.employeeId),
          date: selectedDate
        });
      } else {
        setOverlapWarning(null);
      }
    }
    
    onModalOpen();
  };

  const handleDelete = async () => {
    if (!selectedRecord) return;
    
    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/daily-record/${selectedRecord._id}`);
      toast({
        title: "સફળ",
        description: "રજા રેકોર્ડ સફળતાપૂર્વક ડિલીટ થયો",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onDeleteAlertClose();
      fetchRecords();
    } catch (error) {
      console.error('Error deleting record:', error);
      toast({
        title: "ભૂલ",
        description: "રેકોર્ડ ડિલીટ કરવામાં નિષ્ફળ",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API_BASE_URL}/daily-record/${id}/status`, { status });
      fetchRecords();
      toast({
        title: "સફળ",
        description: "સ્થિતિ અપડેટ થઈ",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "ભૂલ",
        description: "સ્થિતિ અપડેટ કરવામાં નિષ્ફળ",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = records.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(records.length / itemsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  // Statistics with leave type breakdown
  const stats = {
    total: records.length,
    approved: records.filter(r => r.status === 'approved').length,
    pending: records.filter(r => r.status === 'pending').length,
    rejected: records.filter(r => r.status === 'rejected').length,
    paidLeaves: records.filter(r => r.isPaidLeave === true && r.status === 'approved').length,
    unpaidLeaves: records.filter(r => r.isPaidLeave === false && r.status === 'approved').length,
  };

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
            રજા વ્યવસ્થાપન
          </Heading>

        {/* 👉 RIGHT : Empty space (for perfect centering) */}
        <Box width="180px" />
        <Button
          leftIcon={<FiPlus />}
          colorScheme="green"
          onClick={handleAddNew}
          bg="#307644"
          _hover={{ bg: "#0F3A1F" }}
          rounded="xl"
          // px={6}
        >
          નવી રજા
        </Button>
      </Flex>

      {/* Date Selector Card */}
      <Card rounded="2xl" shadow="md" mb={6} border="1px solid #E3EDE8">
        <CardBody>
          <Flex align="center" gap={4} flexWrap="wrap">
            <Flex align="center" gap={2}>
              <FiCalendar size={20} color="#1E4D2B" />
              <Text fontWeight="500" color="gray.700">રજાની તારીખ:</Text>
            </Flex>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={getTodayDate()}
              w="auto"
              maxW="200px"
              borderColor="gray.300"
              rounded="lg"
            />
            {/* <Button
              onClick={fetchRecords}
              colorScheme="green"
              variant="outline"
              rounded="lg"
            >
              શોધો
            </Button> */}
          </Flex>
        </CardBody>
      </Card>

      {/* Statistics Cards */}
      {!loading && records.length > 0 && (
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={6}>
          <Card bg="white" rounded="xl" shadow="sm" borderLeft="4px solid #1E4D2B">
            <CardBody>
              <Flex align="center" justify="space-between">
                <Box>
                  <Text color="gray.500" fontSize="sm">કુલ રજાઓ</Text>
                  <Heading size="lg" color="green.700">{stats.total}</Heading>
                </Box>
                <Box bg="green.100" p={2} rounded="full">
                  <FiFileText size={24} color="#1E4D2B" />
                </Box>
              </Flex>
            </CardBody>
          </Card>
          
          <Card bg="white" rounded="xl" shadow="sm" borderLeft="4px solid #38A169">
            <CardBody>
              <Flex align="center" justify="space-between">
                <Box>
                  <Text color="gray.500" fontSize="sm">મંજૂર</Text>
                  <Heading size="lg" color="green.600">{stats.approved}</Heading>
                </Box>
                <Box bg="green.100" p={2} rounded="full">
                  <FiCheckCircle size={24} color="#38A169" />
                </Box>
              </Flex>
            </CardBody>
          </Card>
          
          <Card bg="white" rounded="xl" shadow="sm" borderLeft="4px solid #F6AD55">
            <CardBody>
              <Flex align="center" justify="space-between">
                <Box>
                  <Text color="gray.500" fontSize="sm">બાકી</Text>
                  <Heading size="lg" color="orange.500">{stats.pending}</Heading>
                </Box>
                <Box bg="orange.100" p={2} rounded="full">
                  <FiClock size={24} color="#F6AD55" />
                </Box>
              </Flex>
            </CardBody>
          </Card>
          
          <Card bg="white" rounded="xl" shadow="sm" borderLeft="4px solid #E53E3E">
            <CardBody>
              <Flex align="center" justify="space-between">
                <Box>
                  <Text color="gray.500" fontSize="sm">નામંજૂર</Text>
                  <Heading size="lg" color="red.500">{stats.rejected}</Heading>
                </Box>
                <Box bg="red.100" p={2} rounded="full">
                  <FiXCircle size={24} color="#E53E3E" />
                </Box>
              </Flex>
            </CardBody>
          </Card>
        </SimpleGrid>
      )}

      {/* Records Table */}
      <Card rounded="2xl" shadow="lg" overflow="hidden">
        {/* <CardHeader bg="#1E4D2B" py={4}>
          <Heading size="md" color="white">
            રજા રેકોર્ડ યાદી - {formatDateToDDMMYYYY(selectedDate)}
          </Heading>
          <Text fontSize="sm" color="whiteAlpha.800" mt={1}>
            તમામ નોંધાયેલ રજાની વિગતો
          </Text>
        </CardHeader> */}

        <CardBody p={0}>
          {loading ? (
            <Box textAlign="center" py={10}>
              <Spinner size="xl" color="green.500" />
              <Text mt={4}>રેકોર્ડ લોડ થઈ રહ્યા છે...</Text>
            </Box>
          ) : records.length === 0 ? (
            <Box textAlign="center" py={10}>
              <Alert status="info" borderRadius="lg" maxW="md" mx="auto">
                <AlertIcon />
                આ તારીખે કોઈ રજા રેકોર્ડ નથી. નવી રજા ઉમેરવા માટે "નવી રજા" બટન દબાવો.
              </Alert>
            </Box>
          ) : (
            <>
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead bg="#E8F3EC">
                    <Tr>
                      <Th>ક્રમાંક</Th>
                      <Th>કર્મચારીનું નામ</Th>
                      <Th>હોદ્દો</Th>
                      <Th>ગ્રુપ</Th>
                      <Th>રજાનો પ્રકાર</Th>
                      <Th>પગાર અસર</Th>
                      <Th>રીમાર્ક</Th>
                      <Th>સ્થિતિ</Th>
                      <Th>ક્રિયા</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {currentItems.map((record, index) => (
                      <Tr key={record._id} _hover={{ bg: "gray.50" }}>
                        <Td fontWeight="medium">{indexOfFirstItem + index + 1}</Td>
                        <Td>
                          <Text fontWeight="500">
                            {getEmployeeName(record.employeeId)}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {record.employeeId?.employeeCode || ''}
                          </Text>
                        </Td>
                        <Td>
                          <Badge colorScheme="blue" fontSize="xs" px={2} py={1}>
                            {record.employeeBody || getEmployeePosition(record.employeeId) || '-'}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge colorScheme="purple" fontSize="xs" px={2} py={1}>
                            {record.employeeGroup || getEmployeeGroup(record.employeeId) || '-'}
                          </Badge>
                        </Td>
                        <Td>
                          <Tag colorScheme="orange" size="sm">
                            <TagLabel>{record.workName || '-'}</TagLabel>
                          </Tag>
                        </Td>
                        <Td>
                          <Badge 
                            colorScheme={record.isPaidLeave ? "green" : "red"} 
                            fontSize="xs" 
                            px={2} 
                            py={1}
                          >
                            {record.isPaidLeave ? "પગાર સાથે" : "પગાર કપાત"}
                          </Badge>
                        </Td>
                        <Td>
                          <Text noOfLines={2} maxW="200px" title={record.description}>
                            {record.description || '-'}
                          </Text>
                        </Td>
                        <Td>
                          <Select
                            value={record.status}
                            onChange={(e) => updateStatus(record._id, e.target.value)}
                            size="sm"
                            w="100px"
                            rounded="lg"
                            bg={record.status === 'approved' ? 'green.50' : record.status === 'rejected' ? 'red.50' : 'yellow.50'}
                            borderColor="transparent"
                            _hover={{ borderColor: "gray.300" }}
                          >
                            <option value="pending">બાકી</option>
                            <option value="approved">મંજૂર</option>
                            <option value="rejected">નામંજૂર</option>
                          </Select>
                        </Td>
                        <Td>
                          <HStack spacing={1}>
                            <Tooltip label="જુઓ" hasArrow>
                              <IconButton
                                icon={<ViewIcon />}
                                size="sm"
                                colorScheme="green"
                                variant="ghost"
                                onClick={() => handleView(record)}
                                aria-label="View"
                                rounded="full"
                              />
                            </Tooltip>
                            <Tooltip label="સુધારો" hasArrow>
                              <IconButton
                                icon={<EditIcon />}
                                size="sm"
                                colorScheme="blue"
                                variant="ghost"
                                onClick={() => handleEdit(record)}
                                aria-label="Edit"
                                rounded="full"
                              />
                            </Tooltip>
                            <Tooltip label="કાઢી નાખો" hasArrow>
                              <IconButton
                                icon={<DeleteIcon />}
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedRecord(record);
                                  onDeleteAlertOpen();
                                }}
                                aria-label="Delete"
                                rounded="full"
                              />
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>

              
            </>
          )}
        </CardBody>
      </Card>

      {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
                setItemsPerPage={handleItemsPerPageChange}
              />

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={onModalClose} size="lg" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader bg="#307644" color="white" borderTopRadius="2xl">
            <Flex align="center" gap={3}>
              {editingId ? <FiEdit2 size={20} /> : <FiPlus size={20} />}
              <Heading size="md" color="white">
                {editingId ? 'રજા રેકોર્ડ સુધારો' : 'નવી રજા ઉમેરો'}
              </Heading>
            </Flex>
          </ModalHeader>
          <ModalCloseButton color="white" />
          
          <ModalBody py={6} px={6}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={5} align="stretch">
                {/* Overlap Warning */}
                {overlapWarning && (
                  <Alert status="warning" borderRadius="lg">
                    <AlertIcon />
                    <Box>
                      <Text fontWeight="500">ચેતવણી: ડુપ્લિકેટ રજા</Text>
                      <Text fontSize="sm">
                        {overlapWarning.employeeName} માટે {formatDateToDDMMYYYY(overlapWarning.date)} તારીખે રજા પહેલેથી નોંધાયેલ છે.
                        એક જ તારીખે બે રજા નાખી શકાતી નથી.
                      </Text>
                    </Box>
                  </Alert>
                )}

                {/* Date Display */}
                <Box bg="gray.50" p={3} rounded="lg">
                  <Flex align="center" gap={2}>
                    <FiCalendar color="#1E4D2B" />
                    <Text fontWeight="500">રજાની તારીખ:</Text>
                    <Text fontWeight="600">{formatDateToDDMMYYYY(selectedDate)}</Text>
                  </Flex>
                </Box>

                {/* Employee Name Dropdown */}
                <FormControl isRequired isInvalid={errors.employeeId && touched.employeeId}>
                  <FormLabel fontWeight="500">કર્મચારીનું નામ</FormLabel>
                  <Select
                    placeholder="કર્મચારી પસંદ કરો"
                    value={formData.employeeId}
                    onChange={handleEmployeeChange}
                    onBlur={() => handleBlur('employeeId')}
                    bg="white"
                    size="lg"
                    rounded="lg"
                  >
                    {employees.map(emp => (
                      <option key={emp._id} value={emp._id}>
                        {getEmployeeName(emp)}
                      </option>
                    ))}
                  </Select>
                  <FormErrorMessage>{errors.employeeId}</FormErrorMessage>
                </FormControl>

                {/* Employee Group - Auto-filled/Read-only */}
                <FormControl>
                  <FormLabel fontWeight="500">કર્મચારીનું ગ્રુપ</FormLabel>
                  <Input
                    value={formData.employeeGroup}
                    isReadOnly
                    bg="gray.100"
                    size="lg"
                    rounded="lg"
                    placeholder="કર્મચારી પસંદ કરતાં ઓટો ફીલ થશે"
                  />
                </FormControl>

                {/* Employee Position/Hoddo - Auto-filled/Read-only */}
                <FormControl>
                  <FormLabel fontWeight="500">કર્મચારીનો હોદ્દો</FormLabel>
                  <Input
                    value={formData.employeePosition}
                    isReadOnly
                    bg="gray.100"
                    size="lg"
                    rounded="lg"
                    placeholder="કર્મચારી પસંદ કરતાં ઓટો ફીલ થશે"
                  />
                </FormControl>

                {/* Leave Type Dropdown */}
                <FormControl isRequired isInvalid={errors.leaveType && touched.leaveType}>
                  <FormLabel fontWeight="500">રજાનો પ્રકાર</FormLabel>
                  <Select
                    name="leaveType"
                    value={formData.leaveType}
                    onChange={handleChange}
                    onBlur={() => handleBlur('leaveType')}
                    bg="white"
                    size="lg"
                    rounded="lg"
                  >
                    {leaveTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label} {option.payrollDeduction ? '(પગાર કપાત)' : '(પગાર સાથે)'}
                      </option>
                    ))}
                  </Select>
                  <FormErrorMessage>{errors.leaveType}</FormErrorMessage>
                </FormControl>

                {/* Remarks Textarea */}
                <FormControl isInvalid={errors.remarks && touched.remarks}>
                  <FormLabel fontWeight="500">
                    રીમાર્ક
                    {formData.leaveType === 'without_pay' && (
                      <Text as="span" color="red.500" ml={1}>*</Text>
                    )}
                  </FormLabel>
                  <Textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    onBlur={() => handleBlur('remarks')}
                    placeholder={formData.leaveType === 'without_pay' 
                      ? "પગાર કપાતની રજા માટે કારણ લખવું ફરજિયાત છે..." 
                      : "રજાનું કારણ અથવા વધારાની નોંધ લખો..."}
                    rows={4}
                    bg="white"
                    rounded="lg"
                    resize="vertical"
                  />
                  <FormErrorMessage>{errors.remarks}</FormErrorMessage>
                </FormControl>
              </VStack>
            </form>
          </ModalBody>

          <ModalFooter borderTop="1px solid" borderColor="gray.200" gap={3}>
            <Button variant="outline" colorScheme="red" onClick={onModalClose} rounded="lg">
              રદ કરો
            </Button>
            <Button 
              colorScheme="green" 
              onClick={handleSubmit} 
              isLoading={saving} 
              leftIcon={<FiSave />} 
              rounded="lg"
              bg="#1E4D2B"
              _hover={{ bg: "#0F3A1F" }}
              isDisabled={!!overlapWarning}
            >
              {editingId ? 'અપડેટ કરો' : 'સેવ કરો'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={isViewModalOpen} onClose={onViewModalClose} size="2xl" scrollBehavior="inside">
  <ModalOverlay />
  <ModalContent borderRadius="2xl">
    <ModalHeader bg="#307644" color="white" borderTopRadius="2xl">
      <Flex align="center" gap={3}>
        <FiEye size={20} />
        <Heading size="md" color="white">
          રજા રેકોર્ડની વિગત
        </Heading>
      </Flex>
    </ModalHeader>
    <ModalCloseButton color="white" />
    
    <ModalBody py={6} px={6}>
      {viewingRecord && (
        <Box>
          {/* Date Row */}
          <Box borderBottom="1px solid" borderColor="gray.200" pb={3} mb={4}>
            <Flex align="center">
              <Text fontWeight="600" color="gray.700" minW="140px">રજાની તારીખ:</Text>
              <Text color="gray.800">{formatDateToDDMMYYYY(viewingRecord.recordDate)}</Text>
            </Flex>
          </Box>

          {/* Employee Name */}
          <Box borderBottom="1px solid" borderColor="gray.200" pb={3} mb={4}>
            <Flex align="center">
              <Text fontWeight="600" color="gray.700" minW="140px">કર્મચારીનું નામ:</Text>
              <Text color="gray.800" fontWeight="500">{getEmployeeName(viewingRecord.employeeId)}</Text>
            </Flex>
          </Box>

          {/* Employee Group */}
          <Box borderBottom="1px solid" borderColor="gray.200" pb={3} mb={4}>
            <Flex align="center">
              <Text fontWeight="600" color="gray.700" minW="140px">કર્મચારીનું ગ્રુપ:</Text>
              <Text color="gray.800">{viewingRecord.employeeGroup || getEmployeeGroup(viewingRecord.employeeId) || '-'}</Text>
            </Flex>
          </Box>

          {/* Employee Position */}
          <Box borderBottom="1px solid" borderColor="gray.200" pb={3} mb={4}>
            <Flex align="center">
              <Text fontWeight="600" color="gray.700" minW="140px">કર્મચારીનો હોદ્દો:</Text>
              <Text color="gray.800">{viewingRecord.employeeBody || getEmployeePosition(viewingRecord.employeeId) || '-'}</Text>
            </Flex>
          </Box>

          {/* Leave Type */}
          <Box borderBottom="1px solid" borderColor="gray.200" pb={3} mb={4}>
            <Flex align="center">
              <Text fontWeight="600" color="gray.700" minW="140px">રજાનો પ્રકાર:</Text>
              <Text color="gray.800">
                {viewingRecord.workName || '-'}
                {!viewingRecord.isPaidLeave && " (કપાત સાથે)"}
              </Text>
            </Flex>
          </Box>

          {/* Payroll Impact - Show amount if applicable */}
          <Box borderBottom="1px solid" borderColor="gray.200" pb={3} mb={4}>
            <Flex align="center">
              <Text fontWeight="600" color="gray.700" minW="140px">પગાર અસર:</Text>
              <Badge 
                colorScheme={viewingRecord.isPaidLeave ? "green" : "red"} 
                fontSize="sm" 
                px={2} 
                py={1}
                rounded="full"
              >
                {viewingRecord.isPaidLeave ? "પગાર સાથે" : "પગાર કપાત"}
              </Badge>
            </Flex>
          </Box>

          {/* Remarks */}
          <Box borderBottom="1px solid" borderColor="gray.200" pb={3} mb={4}>
            <Flex align="flex-start">
              <Text fontWeight="600" color="gray.700" minW="140px">રીમાર્ક:</Text>
              <Text color="gray.800" flex="1">{viewingRecord.description || '-'}</Text>
            </Flex>
          </Box>

          {/* Status */}
          <Box borderBottom="1px solid" borderColor="gray.200" pb={3} mb={4}>
            <Flex align="center">
              <Text fontWeight="600" color="gray.700" minW="140px">સ્થિતિ:</Text>
              <Badge 
                colorScheme={viewingRecord.status === 'approved' ? 'green' : viewingRecord.status === 'rejected' ? 'red' : 'orange'}
                fontSize="sm" 
                px={2} 
                py={1}
                rounded="full"
              >
                {viewingRecord.status === 'approved' ? 'મંજૂર' : viewingRecord.status === 'rejected' ? 'નામંજૂર' : 'બાકી'}
              </Badge>
            </Flex>
          </Box>
        </Box>
      )}
    </ModalBody>

    <ModalFooter borderTop="1px solid" borderColor="gray.200" gap={3}>
      <Button 
        colorScheme="green" 
        onClick={onViewModalClose} 
        rounded="lg"
        bg="#1E4D2B"
        _hover={{ bg: "#0F3A1F" }}
      >
        બંધ કરો
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
              રજા રેકોર્ડ ડિલીટ કરો
            </AlertDialogHeader>

            <AlertDialogBody py={6}>
              <Text>શું તમે ખરેખર આ રજા રેકોર્ડ કાયમ માટે ડિલીટ કરવા માંગો છો?</Text>
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

export default DailyRecords;