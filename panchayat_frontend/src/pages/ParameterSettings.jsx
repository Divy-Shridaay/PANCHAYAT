// "use client";

// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   Heading,
//   Text,
//   Button,
//   Flex,
//   Input,
//   useToast,
//   FormControl,
//   FormLabel,
//   FormErrorMessage,
//   Grid,
//   GridItem,
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
//   Alert,
//   AlertIcon,
//   Table,
//   Thead,
//   Tbody,
//   Tr,
//   Th,
//   Td,
//   IconButton,
//   HStack,
//   Badge,
//   Card,
//   CardBody,
//   Tooltip,
//   Divider,
// } from "@chakra-ui/react";
// import { useNavigate } from "react-router-dom";
// import Pagination from "../components/Pagination";
// import {
//   FiArrowLeft,
//   FiSave,
//   FiPlus,
//   FiCheck,
//   FiEdit2,
//   FiTrash2,
//   FiEye,
//   FiInfo,
// } from "react-icons/fi";
// import axios from "axios";

// const ParameterSettings = () => {
//   const navigate = useNavigate();
//   const toast = useToast();
//   const { isOpen, onOpen, onClose } = useDisclosure();
//   const { 
//     isOpen: isSuccessOpen, 
//     onOpen: onSuccessOpen, 
//     onClose: onSuccessClose 
//   } = useDisclosure();
//   const {
//     isOpen: isViewOpen,
//     onOpen: onViewOpen,
//     onClose: onViewClose,
//   } = useDisclosure();

//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [parameters, setParameters] = useState([]);
//   const [savedData, setSavedData] = useState({});
//   const [editingParam, setEditingParam] = useState(null);
//   const [viewingParam, setViewingParam] = useState(null);
  
//   // Pagination states
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(10);
  
//   // Validation errors state
//   const [fieldErrors, setFieldErrors] = useState({
//     prakar1: "",
//     prakar2: "",
//     prakar3: "",
//     prakar4: "",
//     prakar5: "",
//     pfVyaj: "",
//     graduateFund: "",
//   });

//   const [formData, setFormData] = useState({
//     prakar1: "",
//     prakar2: "",
//     prakar3: "",
//     prakar4: "",
//     prakar5: "",
//     pfVyaj: "",
//     graduateFund: "",
//   });

//   // Fetch existing parameters on load
//   useEffect(() => {
//     fetchParameters();
//   }, []);

//   const fetchParameters = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get("http://localhost:5000/api/parameter");
//       const data = response.data;
      
//       const newFormData = { ...formData };
//       data.forEach((item) => {
//         if (item.examName === "પ્રકાર-૧") newFormData.prakar1 = item.value;
//         if (item.examName === "પ્રકાર-૨") newFormData.prakar2 = item.value;
//         if (item.examName === "પ્રકાર-૩") newFormData.prakar3 = item.value;
//         if (item.examName === "પ્રકાર-૪") newFormData.prakar4 = item.value;
//         if (item.examName === "પ્રકાર-૫") newFormData.prakar5 = item.value;
//         if (item.examName === "પી.એફ. વ્યાજ") newFormData.pfVyaj = item.value;
//         if (item.examName === "ગ્રેજ્યુએટી ફંડ") newFormData.graduateFund = item.value;
//       });
//       setFormData(newFormData);
//       setParameters(data);
//     } catch (error) {
//       console.error("Error fetching parameters:", error);
//       toast({
//         title: "ભૂલ",
//         description: "પેરામીટર લોડ કરવામાં નિષ્ફળ",
//         status: "error",
//         duration: 3000,
//         isClosable: true,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Function to restrict input to only numbers and decimals
//   const restrictToNumbers = (value, allowDecimal = true) => {
//     if (allowDecimal) {
//       return value.replace(/[^\d.]/g, '').replace(/(\..*?)\./g, '$1');
//     } else {
//       return value.replace(/[^\d]/g, '');
//     }
//   };

//   // ✅ IMPROVED: Validation functions with better messages
//   const validateNumber = (value, fieldName, isPercentage = false, min = 0, max = null) => {
//     if (!value || value.trim() === "") {
//       return `${fieldName} ફરજિયાત છે`;
//     }
    
//     const num = parseFloat(value);
//     if (isNaN(num)) {
//       return `${fieldName} માં માન્ય સંખ્યા દાખલ કરો`;
//     }
    
//     if (num < min) {
//       return `${fieldName} ${min} કરતાં ઓછું ન હોઈ શકે`;
//     }
    
//     if (max !== null && num > max) {
//       if (fieldName === "પ્રકાર-૧") {
//         return `${fieldName} (DA %) 0 થી 100 ની વચ્ચે હોવો જોઈએ. હાલમાં સામાન્ય રીતે 50% છે.`;
//       }
//       return `${fieldName} ${max} કરતાં વધારે ન હોઈ શકે`;
//     }
    
//     return "";
//   };

//   const validateAllFields = () => {
//     const errors = {
//       // DA Percentage - should be between 0-100
//       prakar1: validateNumber(formData.prakar1, "પ્રકાર-૧ (DA %)", true, 0, 100),
//       // HRA - fixed amount, no upper limit but reasonable
//       prakar2: validateNumber(formData.prakar2, "પ્રકાર-૨ (HRA)", false, 0, null),
//       // TA - fixed amount
//       prakar3: validateNumber(formData.prakar3, "પ્રકાર-૩ (TA)", false, 0, null),
//       // Medical - fixed amount
//       prakar4: validateNumber(formData.prakar4, "પ્રકાર-૪ (Medical)", false, 0, null),
//       // Cleaning - fixed amount
//       prakar5: validateNumber(formData.prakar5, "પ્રકાર-૫ (Cleaning)", false, 0, null),
//       // PF Percentage - should be between 0-100
//       pfVyaj: validateNumber(formData.pfVyaj, "પી.એફ. વ્યાજ", true, 0, 100),
//       // Graduate Fund - fixed amount
//       graduateFund: validateNumber(formData.graduateFund, "ગ્રેજ્યુએટી ફંડ", false, 0, null),
//     };
    
//     setFieldErrors(errors);
//     return Object.values(errors).every(error => error === "");
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     let processedValue = restrictToNumbers(value, true);
    
//     setFormData({ ...formData, [name]: processedValue });
    
//     if (fieldErrors[name]) {
//       setFieldErrors({ ...fieldErrors, [name]: "" });
//     }
//   };

//   const handleKeyPress = (e) => {
//     const charCode = e.which ? e.which : e.keyCode;
//     const char = String.fromCharCode(charCode);
    
//     if (charCode === 8 || charCode === 46 || charCode === 9 || charCode === 27 || 
//         charCode === 13 || (charCode >= 37 && charCode <= 40)) {
//       return;
//     }
    
//     if (!/[\d.]/.test(char)) {
//       e.preventDefault();
//     }
    
//     if (char === '.' && e.target.value.includes('.')) {
//       e.preventDefault();
//     }
//   };

//   const handlePaste = (e) => {
//     e.preventDefault();
//     const pastedText = e.clipboardData.getData('text');
//     const sanitizedText = restrictToNumbers(pastedText, true);
//     const { name } = e.target;
//     setFormData({ ...formData, [name]: sanitizedText });
//   };

//   const resetForm = () => {
//     setEditingParam(null);
//     setFormData({
//       prakar1: "",
//       prakar2: "",
//       prakar3: "",
//       prakar4: "",
//       prakar5: "",
//       pfVyaj: "",
//       graduateFund: "",
//     });
//     setFieldErrors({
//       prakar1: "",
//       prakar2: "",
//       prakar3: "",
//       prakar4: "",
//       prakar5: "",
//       pfVyaj: "",
//       graduateFund: "",
//     });
//   };

//   const handleSave = async () => {
//     if (!validateAllFields()) {
//       toast({
//         title: "ચેતવણી",
//         description: "કૃપા કરી તમામ ફીલ્ડ યોગ્ય રીતે ભરો",
//         status: "warning",
//         duration: 3000,
//         isClosable: true,
//       });
//       return;
//     }
    
//     setSaving(true);
    
//     try {
//       const savePromises = [
//         // પ્રકાર-૧ (DA Percentage)
//         (async () => {
//           const allParams = await axios.get("http://localhost:5000/api/parameter");
//           const existing = allParams.data.find(p => p.examName === "પ્રકાર-૧");
//           const paramData = {
//             examName: "પ્રકાર-૧",
//             parameterType: "allowance",
//             value: formData.prakar1,
//             minValue: 0,
//             maxValue: 100
//           };
          
//           if (existing) {
//             return axios.put(`http://localhost:5000/api/parameter/${existing._id}`, paramData);
//           } else {
//             return axios.post("http://localhost:5000/api/parameter", paramData);
//           }
//         })(),
        
//         // પ્રકાર-૨ (HRA)
//         (async () => {
//           const allParams = await axios.get("http://localhost:5000/api/parameter");
//           const existing = allParams.data.find(p => p.examName === "પ્રકાર-૨");
//           const paramData = {
//             examName: "પ્રકાર-૨",
//             parameterType: "allowance",
//             value: formData.prakar2,
//             minValue: 0,
//             maxValue: 0
//           };
          
//           if (existing) {
//             return axios.put(`http://localhost:5000/api/parameter/${existing._id}`, paramData);
//           } else {
//             return axios.post("http://localhost:5000/api/parameter", paramData);
//           }
//         })(),
        
//         // પ્રકાર-૩ (TA)
//         (async () => {
//           const allParams = await axios.get("http://localhost:5000/api/parameter");
//           const existing = allParams.data.find(p => p.examName === "પ્રકાર-૩");
//           const paramData = {
//             examName: "પ્રકાર-૩",
//             parameterType: "allowance",
//             value: formData.prakar3,
//             minValue: 0,
//             maxValue: 0
//           };
          
//           if (existing) {
//             return axios.put(`http://localhost:5000/api/parameter/${existing._id}`, paramData);
//           } else {
//             return axios.post("http://localhost:5000/api/parameter", paramData);
//           }
//         })(),
        
//         // પ્રકાર-૪ (Medical)
//         (async () => {
//           const allParams = await axios.get("http://localhost:5000/api/parameter");
//           const existing = allParams.data.find(p => p.examName === "પ્રકાર-૪");
//           const paramData = {
//             examName: "પ્રકાર-૪",
//             parameterType: "allowance",
//             value: formData.prakar4,
//             minValue: 0,
//             maxValue: 0
//           };
          
//           if (existing) {
//             return axios.put(`http://localhost:5000/api/parameter/${existing._id}`, paramData);
//           } else {
//             return axios.post("http://localhost:5000/api/parameter", paramData);
//           }
//         })(),
        
//         // પ્રકાર-૫ (Cleaning)
//         (async () => {
//           const allParams = await axios.get("http://localhost:5000/api/parameter");
//           const existing = allParams.data.find(p => p.examName === "પ્રકાર-૫");
//           const paramData = {
//             examName: "પ્રકાર-૫",
//             parameterType: "allowance",
//             value: formData.prakar5,
//             minValue: 0,
//             maxValue: 0
//           };
          
//           if (existing) {
//             return axios.put(`http://localhost:5000/api/parameter/${existing._id}`, paramData);
//           } else {
//             return axios.post("http://localhost:5000/api/parameter", paramData);
//           }
//         })(),
        
//         // પી.એફ. વ્યાજ
//         (async () => {
//           const allParams = await axios.get("http://localhost:5000/api/parameter");
//           const existing = allParams.data.find(p => p.examName === "પી.એફ. વ્યાજ");
//           const paramData = {
//             examName: "પી.એફ. વ્યાજ",
//             parameterType: "pf",
//             value: formData.pfVyaj,
//             minValue: 0,
//             maxValue: 100
//           };
          
//           if (existing) {
//             return axios.put(`http://localhost:5000/api/parameter/${existing._id}`, paramData);
//           } else {
//             return axios.post("http://localhost:5000/api/parameter", paramData);
//           }
//         })(),
        
//         // ગ્રેજ્યુએટી ફંડ
//         (async () => {
//           const allParams = await axios.get("http://localhost:5000/api/parameter");
//           const existing = allParams.data.find(p => p.examName === "ગ્રેજ્યુએટી ફંડ");
//           const paramData = {
//             examName: "ગ્રેજ્યુએટી ફંડ",
//             parameterType: "fund",
//             value: formData.graduateFund,
//             minValue: 0,
//             maxValue: 999999999
//           };
          
//           if (existing) {
//             return axios.put(`http://localhost:5000/api/parameter/${existing._id}`, paramData);
//           } else {
//             return axios.post("http://localhost:5000/api/parameter", paramData);
//           }
//         })()
//       ];
      
//       const results = await Promise.all(savePromises);
//       const allSucceeded = results.every(result => result.status === 200 || result.status === 201);
      
//       if (allSucceeded) {
//         setSavedData(formData);
//         if (isOpen) onClose();
//         onSuccessOpen();
//         fetchParameters();
//         resetForm();
        
//         toast({
//           title: "સફળ",
//           description: "તમામ પેરામીટર સફળતાપૂર્વક સેવ થયા",
//           status: "success",
//           duration: 3000,
//           isClosable: true,
//         });
//       } else {
//         throw new Error("કેટલાક પેરામીટર સેવ થવામાં નિષ્ફળ રહ્યા");
//       }
      
//     } catch (error) {
//       console.error("Error saving parameters:", error);
      
//       let errorMessage = "પેરામીટર સેવ કરવામાં ભૂલ";
//       if (error.response?.data?.message) {
//         errorMessage = error.response.data.message;
//       } else if (error.message) {
//         errorMessage = error.message;
//       }
      
//       toast({
//         title: "ભૂલ",
//         description: errorMessage,
//         status: "error",
//         duration: 5000,
//         isClosable: true,
//       });
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleDelete = async (id, examName) => {
//     if (window.confirm(`શું તમે ${examName} કાયમ માટે ડિલીટ કરવા માંગો છો?`)) {
//       setLoading(true);
//       try {
//         await axios.delete(`http://localhost:5000/api/parameter/${id}`);
//         toast({
//           title: "સફળ",
//           description: `${examName} સફળતાપૂર્વક ડિલીટ થયું`,
//           status: "success",
//           duration: 3000,
//         });
//         fetchParameters();
//       } catch (error) {
//         console.error("Error deleting parameter:", error);
//         toast({
//           title: "ભૂલ",
//           description: "પેરામીટર ડિલીટ કરવામાં ભૂલ",
//           status: "error",
//           duration: 3000,
//         });
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   const handleView = (param) => {
//     setViewingParam(param);
//     onViewOpen();
//   };

//   const getTypeColor = (type) => {
//     const colors = {
//       allowance: "blue",
//       pf: "orange",
//       fund: "green",
//     };
//     return colors[type] || "gray";
//   };

//   const getTypeLabel = (type) => {
//     if (type === "allowance") return "ભથ્થું";
//     if (type === "pf") return "પી.એફ.";
//     if (type === "fund") return "ફંડ";
//     return type;
//   };

//   // Pagination calculations
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = parameters.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(parameters.length / itemsPerPage);

//   const handlePageChange = (page) => {
//     setCurrentPage(page);
//   };
  
//   const handleItemsPerPageChange = (newLimit) => {
//     setItemsPerPage(newLimit);
//     setCurrentPage(1);
//   };

//   return (
//     <Box bg="#F8FAF9" minH="100vh" p={6}>
//       {/* Header */}
//       <Flex align="center" mb={6}>
//         <Box width="180px">
//           <Button
//             leftIcon={<FiArrowLeft />}
//             colorScheme="green"
//             variant="outline"
//             onClick={() => navigate("/pe-roll")}
//           >
//             પાછા જાવ
//           </Button>
//         </Box>
//         <Heading flex="1" textAlign="center" size="lg" color="green.700">
//           પેરામીટર સેટિંગ્સ
//         </Heading>
//         <Box width="180px">
//           <Button
//             leftIcon={<FiPlus />}
//             colorScheme="green"
//             onClick={() => {
//               resetForm();
//               onOpen();
//             }}
//             bg="#266d3a"
//             _hover={{ bg: "#286840" }}
//             rounded="xl"
//             px={6}
//           >
//             નવું પેરામીટર
//           </Button>
//         </Box>
//       </Flex>
      
//       {/* Loading State */}
//       {loading && (
//         <Box textAlign="center" py={10}>
//           <Spinner size="xl" color="green.500" />
//           <Text mt={4}>પેરામીટર લોડ થઈ રહ્યા છે...</Text>
//         </Box>
//       )}

//       {/* Parameters Table */}
//       {!loading && (
//         <Card rounded="2xl" shadow="lg" overflow="hidden" mb={6}>
//           <CardBody p={0}>
//             <Box overflowX="auto">
//               <Table variant="simple">
//                 <Thead bg="gray.50">
//                   <Tr>
//                     <Th>ક્રમાંક</Th>
//                     <Th>પેરામીટરનું નામ</Th>
//                     <Th>પ્રકાર</Th>
//                     <Th>મૂલ્ય</Th>
//                     <Th>સમજૂતી</Th>
//                     <Th>ક્રિયા</Th>
//                   </Tr>
//                 </Thead>
//                 <Tbody>
//                   {currentItems.length === 0 ? (
//                     <Tr>
//                       <Td colSpan={6} textAlign="center" py={10} color="gray.500">
//                         કોઈ પેરામીટર નથી. નવું ઉમેરવા માટે "+" બટન દબાવો.
//                       </Td>
//                     </Tr>
//                   ) : (
//                     currentItems.map((param, index) => (
//                       <Tr key={param._id} _hover={{ bg: "gray.50" }}>
//                         <Td fontWeight="medium">{indexOfFirstItem + index + 1}</Td>
//                         <Td>
//                           <Text fontWeight="500">{param.examName}</Text>
//                         </Td>
//                         <Td>
//                           <Badge 
//                             colorScheme={
//                               param.parameterType === "pf" ? "orange" : 
//                               param.parameterType === "fund" ? "green" : 
//                               param.parameterType === "allowance" ? "blue" : "gray"
//                             } 
//                             px={2} 
//                             py={1}
//                             borderRadius="full"
//                           >
//                             {getTypeLabel(param.parameterType)}
//                           </Badge>
//                         </Td>
//                         <Td>
//                           <Text fontWeight="bold" color="green.600">
//                             {param.parameterType === "pf" ? `${param.value}%` : 
//                              param.parameterType === "fund" ? `₹${param.value}` : 
//                              param.value}
//                           </Text>
//                         </Td>
//                         <Td>
//                           <Text fontSize="xs" color="gray.500">
//                             {param.examName === "પ્રકાર-૧" && "DA ટકાવારી (%)"}
//                             {param.examName === "પ્રકાર-૨" && "HRA રકમ (₹)"}
//                             {param.examName === "પ્રકાર-૩" && "TA રકમ (₹)"}
//                             {param.examName === "પ્રકાર-૪" && "મેડિકલ ભથ્થું (₹)"}
//                             {param.examName === "પ્રકાર-૫" && "ઝાડુ ભથ્થું (₹)"}
//                             {param.examName === "પી.એફ. વ્યાજ" && "PF કપાત ટકાવારી (%)"}
//                             {param.examName === "ગ્રેજ્યુએટી ફંડ" && "ગ્રેજ્યુએટી ફંડ રકમ (₹)"}
//                           </Text>
//                         </Td>
//                         <Td>
//                           <HStack spacing={2}>
//                             <IconButton
//                               icon={<FiEye />}
//                               size="sm"
//                               colorScheme="green"
//                               variant="ghost"
//                               onClick={() => handleView(param)}
//                               aria-label="View"
//                               rounded="full"
//                             />
//                             <IconButton
//                               icon={<FiEdit2 />}
//                               size="sm"
//                               colorScheme="blue"
//                               variant="ghost"
//                               onClick={() => {
//                                 let fieldName = "";
//                                 if (param.examName === "પ્રકાર-૧") fieldName = "prakar1";
//                                 if (param.examName === "પ્રકાર-૨") fieldName = "prakar2";
//                                 if (param.examName === "પ્રકાર-૩") fieldName = "prakar3";
//                                 if (param.examName === "પ્રકાર-૪") fieldName = "prakar4";
//                                 if (param.examName === "પ્રકાર-૫") fieldName = "prakar5";
//                                 if (param.examName === "પી.એફ. વ્યાજ") fieldName = "pfVyaj";
//                                 if (param.examName === "ગ્રેજ્યુએટી ફંડ") fieldName = "graduateFund";
                                
//                                 const tempForm = { ...formData };
//                                 tempForm[fieldName] = param.value;
//                                 setFormData(tempForm);
//                                 setEditingParam(param);
//                                 onOpen();
//                               }}
//                               aria-label="Edit"
//                               rounded="full"
//                             />
//                             <IconButton
//                               icon={<FiTrash2 />}
//                               size="sm"
//                               colorScheme="red"
//                               variant="ghost"
//                               onClick={() => handleDelete(param._id, param.examName)}
//                               aria-label="Delete"
//                               rounded="full"
//                             />
//                           </HStack>
//                         </Td>
//                       </Tr>
//                     ))
//                   )}
//                 </Tbody>
//               </Table>
//             </Box>
//           </CardBody>
//         </Card>
//       )}

//       <Pagination
//         currentPage={currentPage}
//         totalPages={totalPages}
//         onPageChange={handlePageChange}
//         itemsPerPage={itemsPerPage}
//         setItemsPerPage={handleItemsPerPageChange}
//       />

//       {/* Add/Edit Modal */}
//       <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
//         <ModalOverlay />
//         <ModalContent borderRadius="2xl">
//           <ModalHeader bg="#307644" color="white" borderTopRadius="2xl">
//             <Flex align="center" gap={3}>
//               {editingParam ? <FiEdit2 size={20} /> : <FiPlus size={20} />}
//               <Heading size="md" color="white">
//                 {editingParam ? "પેરામીટર સુધારો" : "નવું પેરામીટર ઉમેરો"}
//               </Heading>
//             </Flex>
//           </ModalHeader>
//           <ModalCloseButton color="white" />
          
//           <ModalBody py={6} px={6}>
           

//             <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={5}>
//               <GridItem>
//                 <FormControl isRequired isInvalid={!!fieldErrors.prakar1}>
//                   {/* <FormLabel fontWeight="500"> */}
//                     <HStack spacing={1}>
//                       <Text>પ્રકાર - ૧ (DA %)</Text>
//                       <Tooltip label="મોંઘવારી ભથ્થું - ટકાવારીમાં દાખલ કરો. ઉદા: 50% માટે 50">
//                         <Box as="span" color="gray.500"><FiInfo size={14} /></Box>
//                       </Tooltip>
//                     </HStack>
//                   {/* </FormLabel> */}
//                   <Input
//                     name="prakar1"
//                     value={formData.prakar1}
//                     onChange={handleChange}
//                     onKeyPress={handleKeyPress}
//                     onPaste={handlePaste}
//                     placeholder="દા.ત. 50 (50% માટે)"
//                     size="lg"
//                     rounded="lg"
//                   />
//                   <FormErrorMessage>{fieldErrors.prakar1}</FormErrorMessage>
//                   <Text fontSize="xs" color="gray.500" mt={1}>
//                     આ ટકાવારી બેઝિક + ગ્રેડ પે પર ગણાશે
//                   </Text>
//                 </FormControl>
//               </GridItem>
              
//               <GridItem>
//                 <FormControl isRequired isInvalid={!!fieldErrors.prakar2}>
//                   <FormLabel fontWeight="500">પ્રકાર - ૨ (HRA - ₹)</FormLabel>
//                   <Input
//                     name="prakar2"
//                     value={formData.prakar2}
//                     onChange={handleChange}
//                     onKeyPress={handleKeyPress}
//                     onPaste={handlePaste}
//                     placeholder="ઘર ભાડું ભથ્થું (₹)"
//                     size="lg"
//                     rounded="lg"
//                   />
//                   <FormErrorMessage>{fieldErrors.prakar2}</FormErrorMessage>
//                 </FormControl>
//               </GridItem>
              
//               <GridItem>
//                 <FormControl isRequired isInvalid={!!fieldErrors.prakar3}>
//                   <FormLabel fontWeight="500">પ્રકાર - ૩ (TA - ₹)</FormLabel>
//                   <Input
//                     name="prakar3"
//                     value={formData.prakar3}
//                     onChange={handleChange}
//                     onKeyPress={handleKeyPress}
//                     onPaste={handlePaste}
//                     placeholder="ધોલાઈ ભથ્થું (₹)"
//                     size="lg"
//                     rounded="lg"
//                   />
//                   <FormErrorMessage>{fieldErrors.prakar3}</FormErrorMessage>
//                 </FormControl>
//               </GridItem>
              
//               <GridItem>
//                 <FormControl isRequired isInvalid={!!fieldErrors.prakar4}>
//                   <FormLabel fontWeight="500">પ્રકાર - ૪ (Medical - ₹)</FormLabel>
//                   <Input
//                     name="prakar4"
//                     value={formData.prakar4}
//                     onChange={handleChange}
//                     onKeyPress={handleKeyPress}
//                     onPaste={handlePaste}
//                     placeholder="મેડિકલ ભથ્થું (₹)"
//                     size="lg"
//                     rounded="lg"
//                   />
//                   <FormErrorMessage>{fieldErrors.prakar4}</FormErrorMessage>
//                 </FormControl>
//               </GridItem>
              
//               <GridItem>
//                 <FormControl isRequired isInvalid={!!fieldErrors.prakar5}>
//                   <FormLabel fontWeight="500">પ્રકાર - ૫ (Cleaning - ₹)</FormLabel>
//                   <Input
//                     name="prakar5"
//                     value={formData.prakar5}
//                     onChange={handleChange}
//                     onKeyPress={handleKeyPress}
//                     onPaste={handlePaste}
//                     placeholder="ઝાડુ ભથ્થું (₹)"
//                     size="lg"
//                     rounded="lg"
//                   />
//                   <FormErrorMessage>{fieldErrors.prakar5}</FormErrorMessage>
//                 </FormControl>
//               </GridItem>
              
//               <GridItem>
//                 <FormControl isRequired isInvalid={!!fieldErrors.pfVyaj}>
//                   {/* <FormLabel fontWeight="500"> */}
//                     <HStack spacing={1}>
//                       <Text>પી.એફ. વ્યાજ (%)</Text>
//                       <Tooltip label="પ્રોવિડન્ટ ફંડ કપાતની ટકાવારી">
//                         <Box as="span" color="gray.500"><FiInfo size={14} /></Box>
//                       </Tooltip>
//                     </HStack>
//                   {/* </FormLabel> */}
//                   <Input
//                     name="pfVyaj"
//                     value={formData.pfVyaj}
//                     onChange={handleChange}
//                     onKeyPress={handleKeyPress}
//                     onPaste={handlePaste}
//                     placeholder="દા.ત. 12 (12% માટે)"
//                     step="0.01"
//                     size="lg"
//                     rounded="lg"
//                   />
//                   <FormErrorMessage>{fieldErrors.pfVyaj}</FormErrorMessage>
//                 </FormControl>
//               </GridItem>
              
//               <GridItem colSpan={{ base: 1, md: 2 }}>
//                 <FormControl isRequired isInvalid={!!fieldErrors.graduateFund}>
//                   <FormLabel fontWeight="500">ગ્રેજ્યુએટી ફંડ (₹)</FormLabel>
//                   <Input
//                     name="graduateFund"
//                     value={formData.graduateFund}
//                     onChange={handleChange}
//                     onKeyPress={handleKeyPress}
//                     onPaste={handlePaste}
//                     placeholder="ગ્રેજ્યુએટી ફંડ રકમ (₹)"
//                     step="0.01"
//                     size="lg"
//                     rounded="lg"
//                   />
//                   <FormErrorMessage>{fieldErrors.graduateFund}</FormErrorMessage>
//                 </FormControl>
//               </GridItem>
//             </Grid>

//             <Divider my={6} />
//           </ModalBody>

//           <ModalFooter borderTop="1px solid" borderColor="gray.200" gap={3}>
//             <Button variant="outline" colorScheme="red" onClick={onClose} rounded="lg" size="lg">
//               રદ કરો
//             </Button>
//             <Button
//               colorScheme="green"
//               onClick={handleSave}
//               isLoading={saving}
//               leftIcon={<FiSave />}
//               bg="#1E4D2B"
//               _hover={{ bg: "#0F3A1F" }}
//               rounded="lg"
//               size="lg"
//               px={8}
//             >
//               સેવ કરો
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>

//       {/* View Modal */}
//       <Modal isOpen={isViewOpen} onClose={onViewClose} size="md" isCentered>
//         <ModalOverlay />
//         <ModalContent borderRadius="2xl">
//           <ModalHeader bg="#1E4D2B" color="white" borderTopRadius="2xl">
//             પેરામીટર વિગત
//           </ModalHeader>
//           <ModalCloseButton color="white" />
//           <ModalBody py={6}>
//             {viewingParam && (
//               <Box>
//                 <Grid templateColumns="1fr 2fr" gap={4} mb={4}>
//                   <Text fontWeight="bold" color="gray.600">પેરામીટર નામ:</Text>
//                   <Text fontWeight="500">{viewingParam.examName}</Text>
                  
//                   <Text fontWeight="bold" color="gray.600">પ્રકાર:</Text>
//                   <Badge colorScheme={getTypeColor(viewingParam.parameterType)} w="fit-content" px={2} py={1}>
//                     {getTypeLabel(viewingParam.parameterType)}
//                   </Badge>
                  
//                   <Text fontWeight="bold" color="gray.600">મૂલ્ય:</Text>
//                   <Text fontWeight="bold" color="green.600" fontSize="lg">
//                     {viewingParam.parameterType === "pf" ? `${viewingParam.value}%` : 
//                      viewingParam.parameterType === "fund" ? `₹${viewingParam.value}` : viewingParam.value}
//                   </Text>
                  
//                   {viewingParam.examName === "પ્રકાર-૧" && (
//                     <>
//                       <Text fontWeight="bold" color="gray.600">ગણતરીની રીત:</Text>
//                       <Text fontSize="sm">DA = (Basic + Grade Pay) × {viewingParam.value}%</Text>
//                     </>
//                   )}
                  
//                   {viewingParam.minValue > 0 || viewingParam.maxValue > 0 ? (
//                     <>
//                       <Text fontWeight="bold" color="gray.600">ન્યૂનતમ મૂલ્ય:</Text>
//                       <Text>{viewingParam.minValue}</Text>
                      
//                       <Text fontWeight="bold" color="gray.600">મહત્તમ મૂલ્ય:</Text>
//                       <Text>{viewingParam.maxValue}</Text>
//                     </>
//                   ) : null}
                  
//                   <Text fontWeight="bold" color="gray.600">સ્થિતિ:</Text>
//                   <Badge colorScheme={viewingParam.status === "active" ? "green" : "red"} px={2} py={1}>
//                     {viewingParam.status === "active" ? "સક્રિય" : "નિષ્ક્રિય"}
//                   </Badge>
                  
//                   <Text fontWeight="bold" color="gray.600">બનાવવાની તારીખ:</Text>
//                   <Text>{new Date(viewingParam.createdAt).toLocaleDateString('gu-IN')}</Text>
//                 </Grid>
//               </Box>
//             )}
//           </ModalBody>
//           <ModalFooter borderTop="1px solid" borderColor="gray.200">
//             <Button colorScheme="green" onClick={onViewClose} rounded="lg">
//               બંધ કરો
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>

//       {/* Success Modal */}
//       <Modal isOpen={isSuccessOpen} onClose={onSuccessClose} size="md" isCentered>
//         <ModalOverlay />
//         <ModalContent borderRadius="2xl">
//           <ModalBody py={8} px={6}>
//             <Flex direction="column" align="center" textAlign="center">
//               <Box bg="green.100" p={3} rounded="full" mb={4}>
//                 <FiCheck size={40} color="#1E4D2B" />
//               </Box>
//               <Heading size="md" color="green.700" mb={2}>
//                 સફળતાપૂર્વક સેવ થયું!
//               </Heading>
//               <Text color="gray.600" mb={4}>
//                 તમારા દ્વારા દાખલ કરેલ તમામ પેરામીટર સફળતાપૂર્વક સેવ થઈ ગયા છે.
//               </Text>
              
//               <Box bg="gray.50" p={4} rounded="lg" w="100%" mb={4}>
//                 <Text fontWeight="bold" mb={2} fontSize="sm">સેવ થયેલ માહિતી:</Text>
//                 <SimpleGrid columns={2} spacing={2} fontSize="xs">
//                   <Text>પ્રકાર-૧ (DA %): <strong>{savedData.prakar1 || "-"}%</strong></Text>
//                   <Text>પ્રકાર-૨ (HRA): <strong>₹{savedData.prakar2 || "0"}</strong></Text>
//                   <Text>પ્રકાર-૩ (TA): <strong>₹{savedData.prakar3 || "0"}</strong></Text>
//                   <Text>પ્રકાર-૪ (Medical): <strong>₹{savedData.prakar4 || "0"}</strong></Text>
//                   <Text>પ્રકાર-૫ (Cleaning): <strong>₹{savedData.prakar5 || "0"}</strong></Text>
//                   <Text>પી.એફ. વ્યાજ: <strong>{savedData.pfVyaj || "-"}%</strong></Text>
//                   <Text>ગ્રેજ્યુએટી ફંડ: <strong>₹{savedData.graduateFund || "0"}</strong></Text>
//                 </SimpleGrid>
//               </Box>
              
//               <Button
//                 colorScheme="green"
//                 onClick={onSuccessClose}
//                 px={8}
//                 bg="#1E4D2B"
//                 _hover={{ bg: "#0F3A1F" }}
//                 rounded="lg"
//                 size="lg"
//               >
//                 બંધ કરો
//               </Button>
//             </Flex>
//           </ModalBody>
//         </ModalContent>
//       </Modal>
//     </Box>
//   );
// };

// export default ParameterSettings;

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
  Alert,
  AlertIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  HStack,
  Badge,
  Card,
  CardBody,
  Tooltip,
  Divider,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import Pagination from "../components/Pagination";
import { ViewIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";
import {
  FiArrowLeft,
  FiSave,
  FiPlus,
  FiCheck,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiInfo,
} from "react-icons/fi";
import axios from "axios";

const ParameterSettings = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isSuccessOpen, 
    onOpen: onSuccessOpen, 
    onClose: onSuccessClose 
  } = useDisclosure();
  const {
    isOpen: isViewOpen,
    onOpen: onViewOpen,
    onClose: onViewClose,
  } = useDisclosure();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [parameters, setParameters] = useState([]);
  const [savedData, setSavedData] = useState({});
  const [editingParam, setEditingParam] = useState(null);
  const [viewingParam, setViewingParam] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Validation errors state
  const [fieldErrors, setFieldErrors] = useState({
    prakar1: "",
    prakar2: "",
    prakar3: "",
    prakar4: "",
    prakar5: "",
    pfVyaj: "",
    graduateFund: "",
  });

  const [formData, setFormData] = useState({
    prakar1: "",
    prakar2: "",
    prakar3: "",
    prakar4: "",
    prakar5: "",
    pfVyaj: "",
    graduateFund: "",
  });

  // Fetch existing parameters on load
  useEffect(() => {
    fetchParameters();
  }, []);

  const fetchParameters = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/parameter");
      const data = response.data;
      
      const newFormData = { ...formData };
      data.forEach((item) => {
        if (item.examName === "પ્રકાર-૧") newFormData.prakar1 = item.value;
        if (item.examName === "પ્રકાર-૨") newFormData.prakar2 = item.value;
        if (item.examName === "પ્રકાર-૩") newFormData.prakar3 = item.value;
        if (item.examName === "પ્રકાર-૪") newFormData.prakar4 = item.value;
        if (item.examName === "પ્રકાર-૫") newFormData.prakar5 = item.value;
        if (item.examName === "પી.એફ. વ્યાજ") newFormData.pfVyaj = item.value;
        if (item.examName === "ગ્રેજ્યુએટી ફંડ") newFormData.graduateFund = item.value;
      });
      setFormData(newFormData);
      setParameters(data);
    } catch (error) {
      console.error("Error fetching parameters:", error);
      toast({
        title: "ભૂલ",
        description: "પેરામીટર લોડ કરવામાં નિષ્ફળ",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to restrict input to only numbers and decimals
  const restrictToNumbers = (value, allowDecimal = true) => {
    if (allowDecimal) {
      return value.replace(/[^\d.]/g, '').replace(/(\..*?)\./g, '$1');
    } else {
      return value.replace(/[^\d]/g, '');
    }
  };

  // Validation functions with better messages
  const validateNumber = (value, fieldName, isPercentage = false, min = 0, max = null) => {
    if (!value || value.trim() === "") {
      return `${fieldName} ફરજિયાત છે`;
    }
    
    const num = parseFloat(value);
    if (isNaN(num)) {
      return `${fieldName} માં માન્ય સંખ્યા દાખલ કરો`;
    }
    
    if (num < min) {
      return `${fieldName} ${min} કરતાં ઓછું ન હોઈ શકે`;
    }
    
    if (max !== null && num > max) {
      if (fieldName === "પ્રકાર-૧") {
        return `${fieldName} (DA %) 0 થી 100 ની વચ્ચે હોવો જોઈએ. હાલમાં સામાન્ય રીતે 50% છે.`;
      }
      return `${fieldName} ${max} કરતાં વધારે ન હોઈ શકે`;
    }
    
    return "";
  };

  const validateAllFields = () => {
    const errors = {
      prakar1: validateNumber(formData.prakar1, "પ્રકાર-૧ (DA %)", true, 0, 100),
      prakar2: validateNumber(formData.prakar2, "પ્રકાર-૨ (HRA)", false, 0, null),
      prakar3: validateNumber(formData.prakar3, "પ્રકાર-૩ (TA)", false, 0, null),
      prakar4: validateNumber(formData.prakar4, "પ્રકાર-૪ (Medical)", false, 0, null),
      prakar5: validateNumber(formData.prakar5, "પ્રકાર-૫ (Cleaning)", false, 0, null),
      pfVyaj: validateNumber(formData.pfVyaj, "પી.એફ. વ્યાજ", true, 0, 100),
      graduateFund: validateNumber(formData.graduateFund, "ગ્રેજ્યુએટી ફંડ", false, 0, null),
    };
    
    setFieldErrors(errors);
    return Object.values(errors).every(error => error === "");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = restrictToNumbers(value, true);
    
    setFormData({ ...formData, [name]: processedValue });
    
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: "" });
    }
  };

  const handleKeyPress = (e) => {
    const charCode = e.which ? e.which : e.keyCode;
    const char = String.fromCharCode(charCode);
    
    if (charCode === 8 || charCode === 46 || charCode === 9 || charCode === 27 || 
        charCode === 13 || (charCode >= 37 && charCode <= 40)) {
      return;
    }
    
    if (!/[\d.]/.test(char)) {
      e.preventDefault();
    }
    
    if (char === '.' && e.target.value.includes('.')) {
      e.preventDefault();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const sanitizedText = restrictToNumbers(pastedText, true);
    const { name } = e.target;
    setFormData({ ...formData, [name]: sanitizedText });
  };

  const resetForm = () => {
    setEditingParam(null);
    setFormData({
      prakar1: "",
      prakar2: "",
      prakar3: "",
      prakar4: "",
      prakar5: "",
      pfVyaj: "",
      graduateFund: "",
    });
    setFieldErrors({
      prakar1: "",
      prakar2: "",
      prakar3: "",
      prakar4: "",
      prakar5: "",
      pfVyaj: "",
      graduateFund: "",
    });
  };

  const handleSave = async () => {
    if (!validateAllFields()) {
      toast({
        title: "ચેતવણી",
        description: "કૃપા કરી તમામ ફીલ્ડ યોગ્ય રીતે ભરો",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setSaving(true);
    
    try {
      const savePromises = [
        // પ્રકાર-૧ (DA Percentage)
        (async () => {
          const allParams = await axios.get("http://localhost:5000/api/parameter");
          const existing = allParams.data.find(p => p.examName === "પ્રકાર-૧");
          const paramData = {
            examName: "પ્રકાર-૧",
            parameterType: "allowance",
            value: formData.prakar1,
            minValue: 0,
            maxValue: 100
          };
          
          if (existing) {
            return axios.put(`http://localhost:5000/api/parameter/${existing._id}`, paramData);
          } else {
            return axios.post("http://localhost:5000/api/parameter", paramData);
          }
        })(),
        
        // પ્રકાર-૨ (HRA)
        (async () => {
          const allParams = await axios.get("http://localhost:5000/api/parameter");
          const existing = allParams.data.find(p => p.examName === "પ્રકાર-૨");
          const paramData = {
            examName: "પ્રકાર-૨",
            parameterType: "allowance",
            value: formData.prakar2,
            minValue: 0,
            maxValue: 0
          };
          
          if (existing) {
            return axios.put(`http://localhost:5000/api/parameter/${existing._id}`, paramData);
          } else {
            return axios.post("http://localhost:5000/api/parameter", paramData);
          }
        })(),
        
        // પ્રકાર-૩ (TA)
        (async () => {
          const allParams = await axios.get("http://localhost:5000/api/parameter");
          const existing = allParams.data.find(p => p.examName === "પ્રકાર-૩");
          const paramData = {
            examName: "પ્રકાર-૩",
            parameterType: "allowance",
            value: formData.prakar3,
            minValue: 0,
            maxValue: 0
          };
          
          if (existing) {
            return axios.put(`http://localhost:5000/api/parameter/${existing._id}`, paramData);
          } else {
            return axios.post("http://localhost:5000/api/parameter", paramData);
          }
        })(),
        
        // પ્રકાર-૪ (Medical)
        (async () => {
          const allParams = await axios.get("http://localhost:5000/api/parameter");
          const existing = allParams.data.find(p => p.examName === "પ્રકાર-૪");
          const paramData = {
            examName: "પ્રકાર-૪",
            parameterType: "allowance",
            value: formData.prakar4,
            minValue: 0,
            maxValue: 0
          };
          
          if (existing) {
            return axios.put(`http://localhost:5000/api/parameter/${existing._id}`, paramData);
          } else {
            return axios.post("http://localhost:5000/api/parameter", paramData);
          }
        })(),
        
        // પ્રકાર-૫ (Cleaning)
        (async () => {
          const allParams = await axios.get("http://localhost:5000/api/parameter");
          const existing = allParams.data.find(p => p.examName === "પ્રકાર-૫");
          const paramData = {
            examName: "પ્રકાર-૫",
            parameterType: "allowance",
            value: formData.prakar5,
            minValue: 0,
            maxValue: 0
          };
          
          if (existing) {
            return axios.put(`http://localhost:5000/api/parameter/${existing._id}`, paramData);
          } else {
            return axios.post("http://localhost:5000/api/parameter", paramData);
          }
        })(),
        
        // પી.એફ. વ્યાજ
        (async () => {
          const allParams = await axios.get("http://localhost:5000/api/parameter");
          const existing = allParams.data.find(p => p.examName === "પી.એફ. વ્યાજ");
          const paramData = {
            examName: "પી.એફ. વ્યાજ",
            parameterType: "pf",
            value: formData.pfVyaj,
            minValue: 0,
            maxValue: 100
          };
          
          if (existing) {
            return axios.put(`http://localhost:5000/api/parameter/${existing._id}`, paramData);
          } else {
            return axios.post("http://localhost:5000/api/parameter", paramData);
          }
        })(),
        
        // ગ્રેજ્યુએટી ફંડ
        (async () => {
          const allParams = await axios.get("http://localhost:5000/api/parameter");
          const existing = allParams.data.find(p => p.examName === "ગ્રેજ્યુએટી ફંડ");
          const paramData = {
            examName: "ગ્રેજ્યુએટી ફંડ",
            parameterType: "fund",
            value: formData.graduateFund,
            minValue: 0,
            maxValue: 999999999
          };
          
          if (existing) {
            return axios.put(`http://localhost:5000/api/parameter/${existing._id}`, paramData);
          } else {
            return axios.post("http://localhost:5000/api/parameter", paramData);
          }
        })()
      ];
      
      const results = await Promise.all(savePromises);
      const allSucceeded = results.every(result => result.status === 200 || result.status === 201);
      
      if (allSucceeded) {
        setSavedData(formData);
        if (isOpen) onClose();
        onSuccessOpen();
        fetchParameters();
        resetForm();
        
        toast({
          title: "સફળ",
          description: "તમામ પેરામીટર સફળતાપૂર્વક સેવ થયા",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error("કેટલાક પેરામીટર સેવ થવામાં નિષ્ફળ રહ્યા");
      }
      
    } catch (error) {
      console.error("Error saving parameters:", error);
      
      let errorMessage = "પેરામીટર સેવ કરવામાં ભૂલ";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "ભૂલ",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, examName) => {
    if (window.confirm(`શું તમે ${examName} કાયમ માટે ડિલીટ કરવા માંગો છો?`)) {
      setLoading(true);
      try {
        await axios.delete(`http://localhost:5000/api/parameter/${id}`);
        toast({
          title: "સફળ",
          description: `${examName} સફળતાપૂર્વક ડિલીટ થયું`,
          status: "success",
          duration: 3000,
        });
        fetchParameters();
      } catch (error) {
        console.error("Error deleting parameter:", error);
        toast({
          title: "ભૂલ",
          description: "પેરામીટર ડિલીટ કરવામાં ભૂલ",
          status: "error",
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleView = (param) => {
    setViewingParam(param);
    onViewOpen();
  };

  const getTypeColor = (type) => {
    const colors = {
      allowance: "blue",
      pf: "orange",
      fund: "green",
    };
    return colors[type] || "gray";
  };

  const getTypeLabel = (type) => {
    if (type === "allowance") return "ભથ્થું";
    if (type === "pf") return "પી.એફ.";
    if (type === "fund") return "ફંડ";
    return type;
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = parameters.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(parameters.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  const handleItemsPerPageChange = (newLimit) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
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
            rounded="lg"
          >
            પાછા જાવ
          </Button>
        </Box>
        <Heading flex="1" textAlign="center" size="lg" color="green.700">
          પેરામીટર સેટિંગ્સ
        </Heading>
        <Box width="180px">
          <Button
            leftIcon={<span style={{ fontSize: "20px" }}>+</span>}
            colorScheme="green"
            size="md"
            rounded="lg"
            onClick={() => {
              resetForm();
              onOpen();
            }}
          >
            નવું પેરામીટર
          </Button>
        </Box>
      </Flex>
      
      {/* Loading State */}
      {loading && (
        <Box textAlign="center" py={10}>
          <Spinner size="xl" color="green.500" />
          <Text mt={4}>પેરામીટર લોડ થઈ રહ્યા છે...</Text>
        </Box>
      )}

      {/* Parameters Table */}
      {!loading && (
        <Card rounded="2xl" shadow="lg" overflow="hidden" mb={6}>
          <CardBody p={0}>
            <Box overflowX="auto">
              <Table variant="simple" colorScheme="green">
                <Thead bg="#E8F3EC">
                  <Tr>
                    <Th>ક્રમાંક</Th>
                    <Th>પેરામીટરનું નામ</Th>
                    <Th>પ્રકાર</Th>
                    <Th>મૂલ્ય</Th>
                    <Th>સમજૂતી</Th>
                    <Th textAlign="center">ક્રિયા</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {currentItems.length === 0 ? (
                    <Tr>
                      <Td colSpan={6} textAlign="center" py={10} color="gray.500">
                        કોઈ પેરામીટર નથી. નવું ઉમેરવા માટે "+" બટન દબાવો.
                      </Td>
                    </Tr>
                  ) : (
                    currentItems.map((param, index) => (
                      <Tr key={param._id} _hover={{ bg: "#F5FBF7" }}>
                        <Td fontWeight="medium">{indexOfFirstItem + index + 1}</Td>
                        <Td>
                          <Text fontWeight="500">{param.examName}</Text>
                        </Td>
                        <Td>
                          <Badge 
                            colorScheme={
                              param.parameterType === "pf" ? "orange" : 
                              param.parameterType === "fund" ? "green" : 
                              param.parameterType === "allowance" ? "blue" : "gray"
                            } 
                            px={2} 
                            py={1}
                            borderRadius="full"
                          >
                            {getTypeLabel(param.parameterType)}
                          </Badge>
                        </Td>
                        <Td>
                          <Text fontWeight="bold" color="green.600">
                            {param.parameterType === "pf" ? `${param.value}%` : 
                             param.parameterType === "fund" ? `₹${param.value}` : 
                             param.value}
                          </Text>
                        </Td>
                        <Td>
                          <Text fontSize="xs" color="gray.500">
                            {param.examName === "પ્રકાર-૧" && "DA ટકાવારી (%)"}
                            {param.examName === "પ્રકાર-૨" && "HRA રકમ (₹)"}
                            {param.examName === "પ્રકાર-૩" && "TA રકમ (₹)"}
                            {param.examName === "પ્રકાર-૪" && "મેડિકલ ભથ્થું (₹)"}
                            {param.examName === "પ્રકાર-૫" && "ઝાડુ ભથ્થું (₹)"}
                            {param.examName === "પી.એફ. વ્યાજ" && "PF કપાત ટકાવારી (%)"}
                            {param.examName === "ગ્રેજ્યુએટી ફંડ" && "ગ્રેજ્યુએટી ફંડ રકમ (₹)"}
                          </Text>
                        </Td>
                        <Td>
                          <HStack spacing={4} justify="center">
                            {/* View - Green */}
                            <IconButton
                        size="sm"
                        icon={<ViewIcon />}
                        variant="ghost"
                        colorScheme="green"
                        rounded="full"
                              onClick={() => handleView(param)}
                              aria-label="View"
                            />
                            
                            {/* Edit - Blue */}
                            <IconButton
                              size="sm"
                              icon={<EditIcon />}
                              variant="ghost"
                              colorScheme="blue"
                              rounded="full"
                              onClick={() => {
                                let fieldName = "";
                                if (param.examName === "પ્રકાર-૧") fieldName = "prakar1";
                                if (param.examName === "પ્રકાર-૨") fieldName = "prakar2";
                                if (param.examName === "પ્રકાર-૩") fieldName = "prakar3";
                                if (param.examName === "પ્રકાર-૪") fieldName = "prakar4";
                                if (param.examName === "પ્રકાર-૫") fieldName = "prakar5";
                                if (param.examName === "પી.એફ. વ્યાજ") fieldName = "pfVyaj";
                                if (param.examName === "ગ્રેજ્યુએટી ફંડ") fieldName = "graduateFund";
                                
                                const tempForm = { ...formData };
                                tempForm[fieldName] = param.value;
                                setFormData(tempForm);
                                setEditingParam(param);
                                onOpen();
                              }}
                              aria-label="Edit"
                            />
                            
                            {/* Delete - Red */}
                            <IconButton
                              size="sm"
                              icon={<DeleteIcon />}
                              variant="ghost"
                              colorScheme="red"
                              rounded="full"
                              onClick={() => handleDelete(param._id, param.examName)}
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
          </CardBody>
        </Card>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={handleItemsPerPageChange}
      />

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader bg="#307644" color="white" borderTopRadius="2xl">
            <Flex align="center" gap={3}>
              {editingParam ? <FiEdit2 size={20} /> : <FiPlus size={20} />}
              <Heading size="md" color="white">
                {editingParam ? "પેરામીટર સુધારો" : "નવું પેરામીટર ઉમેરો"}
              </Heading>
            </Flex>
          </ModalHeader>
          <ModalCloseButton color="white" />
          
          <ModalBody py={6} px={6}>
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={5}>
              <GridItem>
                <FormControl isRequired isInvalid={!!fieldErrors.prakar1}>
                  <HStack spacing={1} mb={2}>
                    <Text fontWeight="500">પ્રકાર - ૧ (DA %)</Text>
                    <Tooltip label="મોંઘવારી ભથ્થું - ટકાવારીમાં દાખલ કરો. ઉદા: 50% માટે 50">
                      <Box as="span" color="gray.500"><FiInfo size={14} /></Box>
                    </Tooltip>
                  </HStack>
                  <Input
                    name="prakar1"
                    value={formData.prakar1}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    onPaste={handlePaste}
                    placeholder="દા.ત. 50 (50% માટે)"
                    size="lg"
                    rounded="lg"
                  />
                  <FormErrorMessage>{fieldErrors.prakar1}</FormErrorMessage>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    આ ટકાવારી બેઝિક + ગ્રેડ પે પર ગણાશે
                  </Text>
                </FormControl>
              </GridItem>
              
              <GridItem>
                <FormControl isRequired isInvalid={!!fieldErrors.prakar2}>
                  <FormLabel fontWeight="500">પ્રકાર - ૨ (HRA - ₹)</FormLabel>
                  <Input
                    name="prakar2"
                    value={formData.prakar2}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    onPaste={handlePaste}
                    placeholder="ઘર ભાડું ભથ્થું (₹)"
                    size="lg"
                    rounded="lg"
                  />
                  <FormErrorMessage>{fieldErrors.prakar2}</FormErrorMessage>
                </FormControl>
              </GridItem>
              
              <GridItem>
                <FormControl isRequired isInvalid={!!fieldErrors.prakar3}>
                  <FormLabel fontWeight="500">પ્રકાર - ૩ (TA - ₹)</FormLabel>
                  <Input
                    name="prakar3"
                    value={formData.prakar3}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    onPaste={handlePaste}
                    placeholder="ધોલાઈ ભથ્થું (₹)"
                    size="lg"
                    rounded="lg"
                  />
                  <FormErrorMessage>{fieldErrors.prakar3}</FormErrorMessage>
                </FormControl>
              </GridItem>
              
              <GridItem>
                <FormControl isRequired isInvalid={!!fieldErrors.prakar4}>
                  <FormLabel fontWeight="500">પ્રકાર - ૪ (Medical - ₹)</FormLabel>
                  <Input
                    name="prakar4"
                    value={formData.prakar4}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    onPaste={handlePaste}
                    placeholder="મેડિકલ ભથ્થું (₹)"
                    size="lg"
                    rounded="lg"
                  />
                  <FormErrorMessage>{fieldErrors.prakar4}</FormErrorMessage>
                </FormControl>
              </GridItem>
              
              <GridItem>
                <FormControl isRequired isInvalid={!!fieldErrors.prakar5}>
                  <FormLabel fontWeight="500">પ્રકાર - ૫ (Cleaning - ₹)</FormLabel>
                  <Input
                    name="prakar5"
                    value={formData.prakar5}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    onPaste={handlePaste}
                    placeholder="ઝાડુ ભથ્થું (₹)"
                    size="lg"
                    rounded="lg"
                  />
                  <FormErrorMessage>{fieldErrors.prakar5}</FormErrorMessage>
                </FormControl>
              </GridItem>
              
              <GridItem>
                <FormControl isRequired isInvalid={!!fieldErrors.pfVyaj}>
                  <HStack spacing={1} mb={2}>
                    <Text fontWeight="500">પી.એફ. વ્યાજ (%)</Text>
                    <Tooltip label="પ્રોવિડન્ટ ફંડ કપાતની ટકાવારી">
                      <Box as="span" color="gray.500"><FiInfo size={14} /></Box>
                    </Tooltip>
                  </HStack>
                  <Input
                    name="pfVyaj"
                    value={formData.pfVyaj}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    onPaste={handlePaste}
                    placeholder="દા.ત. 12 (12% માટે)"
                    step="0.01"
                    size="lg"
                    rounded="lg"
                  />
                  <FormErrorMessage>{fieldErrors.pfVyaj}</FormErrorMessage>
                </FormControl>
              </GridItem>
              
              <GridItem colSpan={{ base: 1, md: 2 }}>
                <FormControl isRequired isInvalid={!!fieldErrors.graduateFund}>
                  <FormLabel fontWeight="500">ગ્રેજ્યુએટી ફંડ (₹)</FormLabel>
                  <Input
                    name="graduateFund"
                    value={formData.graduateFund}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    onPaste={handlePaste}
                    placeholder="ગ્રેજ્યુએટી ફંડ રકમ (₹)"
                    step="0.01"
                    size="lg"
                    rounded="lg"
                  />
                  <FormErrorMessage>{fieldErrors.graduateFund}</FormErrorMessage>
                </FormControl>
              </GridItem>
            </Grid>

            <Divider my={6} />
          </ModalBody>

          <ModalFooter borderTop="1px solid" borderColor="gray.200" gap={3}>
            <Button variant="outline" colorScheme="red" onClick={onClose} rounded="lg" size="lg">
              રદ કરો
            </Button>
            <Button
              colorScheme="green"
              onClick={handleSave}
              isLoading={saving}
              leftIcon={<FiSave />}
              bg="#1E4D2B"
              _hover={{ bg: "#0F3A1F" }}
              rounded="lg"
              size="lg"
              px={8}
            >
              સેવ કરો
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="md" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader bg="#1E4D2B" color="white" borderTopRadius="2xl">
            પેરામીટર વિગત
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py={6}>
            {viewingParam && (
              <Box>
                <Grid templateColumns="1fr 2fr" gap={4} mb={4}>
                  <Text fontWeight="bold" color="gray.600">પેરામીટર નામ:</Text>
                  <Text fontWeight="500">{viewingParam.examName}</Text>
                  
                  <Text fontWeight="bold" color="gray.600">પ્રકાર:</Text>
                  <Badge colorScheme={getTypeColor(viewingParam.parameterType)} w="fit-content" px={2} py={1}>
                    {getTypeLabel(viewingParam.parameterType)}
                  </Badge>
                  
                  <Text fontWeight="bold" color="gray.600">મૂલ્ય:</Text>
                  <Text fontWeight="bold" color="green.600" fontSize="lg">
                    {viewingParam.parameterType === "pf" ? `${viewingParam.value}%` : 
                     viewingParam.parameterType === "fund" ? `₹${viewingParam.value}` : viewingParam.value}
                  </Text>
                  
                  {viewingParam.examName === "પ્રકાર-૧" && (
                    <>
                      <Text fontWeight="bold" color="gray.600">ગણતરીની રીત:</Text>
                      <Text fontSize="sm">DA = (Basic + Grade Pay) × {viewingParam.value}%</Text>
                    </>
                  )}
                  
                  {/* {viewingParam.minValue > 0 || viewingParam.maxValue > 0 ? (
                    <>
                      <Text fontWeight="bold" color="gray.600">ન્યૂનતમ મૂલ્ય:</Text>
                      <Text>{viewingParam.minValue}</Text>
                      
                      <Text fontWeight="bold" color="gray.600">મહત્તમ મૂલ્ય:</Text>
                      <Text>{viewingParam.maxValue}</Text>
                    </>
                  ) : null} */}
                  
                  <Text fontWeight="bold" color="gray.600">સ્થિતિ:</Text>
                  <Badge colorScheme={viewingParam.status === "active" ? "green" : "red"} px={2} py={1}>
                    {viewingParam.status === "active" ? "સક્રિય" : "નિષ્ક્રિય"}
                  </Badge>
                  
                  <Text fontWeight="bold" color="gray.600">બનાવવાની તારીખ:</Text>
                  <Text>{new Date(viewingParam.createdAt).toLocaleDateString('gu-IN')}</Text>
                </Grid>
              </Box>
            )}
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="gray.200">
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
                તમારા દ્વારા દાખલ કરેલ તમામ પેરામીટર સફળતાપૂર્વક સેવ થઈ ગયા છે.
              </Text>
              
              <Box bg="gray.50" p={4} rounded="lg" w="100%" mb={4}>
                <Text fontWeight="bold" mb={2} fontSize="sm">સેવ થયેલ માહિતી:</Text>
                <SimpleGrid columns={2} spacing={2} fontSize="xs">
                  <Text>પ્રકાર-૧ (DA %): <strong>{savedData.prakar1 || "-"}%</strong></Text>
                  <Text>પ્રકાર-૨ (HRA): <strong>₹{savedData.prakar2 || "0"}</strong></Text>
                  <Text>પ્રકાર-૩ (TA): <strong>₹{savedData.prakar3 || "0"}</strong></Text>
                  <Text>પ્રકાર-૪ (Medical): <strong>₹{savedData.prakar4 || "0"}</strong></Text>
                  <Text>પ્રકાર-૫ (Cleaning): <strong>₹{savedData.prakar5 || "0"}</strong></Text>
                  <Text>પી.એફ. વ્યાજ: <strong>{savedData.pfVyaj || "-"}%</strong></Text>
                  <Text>ગ્રેજ્યુએટી ફંડ: <strong>₹{savedData.graduateFund || "0"}</strong></Text>
                </SimpleGrid>
              </Box>
              
              <Button
                colorScheme="green"
                onClick={onSuccessClose}
                px={8}
                bg="#1E4D2B"
                _hover={{ bg: "#0F3A1F" }}
                rounded="lg"
                size="lg"
              >
                બંધ કરો
              </Button>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ParameterSettings;