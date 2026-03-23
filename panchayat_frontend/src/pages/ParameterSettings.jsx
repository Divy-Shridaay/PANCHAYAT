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
  Select,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiSave,
  FiPlus,
  FiCheck,
  FiEdit2,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
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
        if (item.examName === "પ્રકાર-1") newFormData.prakar1 = item.value;
        if (item.examName === "પ્રકાર-2") newFormData.prakar2 = item.value;
        if (item.examName === "પ્રકાર-3") newFormData.prakar3 = item.value;
        if (item.examName === "પ્રકાર-4") newFormData.prakar4 = item.value;
        if (item.examName === "પ્રકાર-5") newFormData.prakar5 = item.value;
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const parametersToSave = [
        { examName: "પ્રકાર-1", parameterType: "prakar", value: formData.prakar1, minValue: 0, maxValue: 0 },
        { examName: "પ્રકાર-2", parameterType: "prakar", value: formData.prakar2, minValue: 0, maxValue: 0 },
        { examName: "પ્રકાર-3", parameterType: "prakar", value: formData.prakar3, minValue: 0, maxValue: 0 },
        { examName: "પ્રકાર-4", parameterType: "prakar", value: formData.prakar4, minValue: 0, maxValue: 0 },
        { examName: "પ્રકાર-5", parameterType: "prakar", value: formData.prakar5, minValue: 0, maxValue: 0 },
        { examName: "પી.એફ. વ્યાજ", parameterType: "pf", value: formData.pfVyaj, minValue: 0, maxValue: 0 },
        { examName: "ગ્રેજ્યુએટી ફંડ", parameterType: "fund", value: formData.graduateFund, minValue: 0, maxValue: 0 },
      ];

      for (const param of parametersToSave) {
        try {
          const allParams = await axios.get("http://localhost:5000/api/parameter");
          const existing = allParams.data.find(p => p.examName === param.examName);
          
          if (existing) {
            await axios.put(`http://localhost:5000/api/parameter/${existing._id}`, param);
          } else {
            await axios.post("http://localhost:5000/api/parameter", param);
          }
        } catch (innerError) {
          console.error(`Error saving ${param.examName}:`, innerError);
          throw innerError;
        }
      }

      setSavedData(formData);
      if (isOpen) onClose();
      onSuccessOpen();
      fetchParameters();
      resetForm();
      
    } catch (error) {
      console.error("Error saving parameters:", error);
      toast({
        title: "ભૂલ",
        description: error.response?.data?.message || "પેરામીટર સેવ કરવામાં ભૂલ",
        status: "error",
        duration: 3000,
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
      prakar: "blue",
      pf: "orange",
      fund: "green",
    };
    return colors[type] || "gray";
  };

  const getTypeLabel = (type) => {
    if (type === "prakar") return "પ્રકાર";
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
        >
          પાછા
        </Button>
        <Heading size="lg" color="#1E4D2B">
          પેરામીટર સેટિંગ
        </Heading>
        <Button
          leftIcon={<FiPlus />}
          colorScheme="green"
          onClick={() => {
            resetForm();
            onOpen();
          }}
          ml="auto"
        >
          નવું પેરામીટર
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
          પે-રોલ પેરામીટર સેટિંગ્સ
        </Heading>
        <Text fontSize="md" color="gray.600">
          અહીંથી તમે પે-રોલ સંબંધિત તમામ પેરામીટર્સ સેટ કરી શકો છો.
        </Text>
      </Box>

      {/* Loading State */}
      {loading && (
        <Box textAlign="center" py={10}>
          <Spinner size="xl" color="green.500" />
          <Text mt={4}>પેરામીટર લોડ થઈ રહ્યા છે...</Text>
        </Box>
      )}

      {/* Parameters Table with CRUD */}
      {!loading && (
        <Box
          bg="white"
          rounded="2xl"
          shadow="lg"
          border="1px solid #E3EDE8"
          overflow="hidden"
          mb={6}
        >
          <Box bg="#1E4D2B" px={6} py={4}>
            <Heading size="md" color="white">
              પેરામીટર યાદી
            </Heading>
            <Text fontSize="sm" color="whiteAlpha.800" mt={1}>
              તમામ સેવ થયેલ પેરામીટર્સની યાદી
            </Text>
          </Box>

          <Box overflowX="auto">
            <Table variant="simple">
              <Thead bg="gray.50">
                <Tr>
                  <Th>ક્રમાંક</Th>
                  <Th>પેરામીટર નામ</Th>
                  <Th>પ્રકાર</Th>
                  <Th>મૂલ્ય</Th>
                  <Th>ક્રિયા</Th>
                </Tr>
              </Thead>
              <Tbody>
                {currentItems.length === 0 ? (
                  <Tr>
                    <Td colSpan={5} textAlign="center" py={10} color="gray.500">
                      કોઈ પેરામીટર નથી. નવું ઉમેરવા માટે "+" બટન દબાવો.
                    </Td>
                  </Tr>
                ) : (
                  currentItems.map((param, index) => (
                    <Tr key={param._id} _hover={{ bg: "gray.50" }}>
                      <Td fontWeight="medium">{indexOfFirstItem + index + 1}</Td>
                      <Td>
                        <Text fontWeight="500">{param.examName}</Text>
                      </Td>
                      <Td>
                        <Badge colorScheme={getTypeColor(param.parameterType)}>
                          {getTypeLabel(param.parameterType)}
                        </Badge>
                      </Td>
                      <Td>
                        <Text fontWeight="bold" color="green.600">
                          {param.parameterType === "pf" ? `${param.value}%` : 
                           param.parameterType === "fund" ? `₹${param.value}` : param.value}
                        </Text>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            icon={<FiEye />}
                            size="sm"
                            colorScheme="green"
                            variant="ghost"
                            onClick={() => handleView(param)}
                            aria-label="View"
                          />
                          <IconButton
                            icon={<FiEdit2 />}
                            size="sm"
                            colorScheme="blue"
                            variant="ghost"
                            onClick={() => {
                              let fieldName = "";
                              if (param.examName === "પ્રકાર-1") fieldName = "prakar1";
                              if (param.examName === "પ્રકાર-2") fieldName = "prakar2";
                              if (param.examName === "પ્રકાર-3") fieldName = "prakar3";
                              if (param.examName === "પ્રકાર-4") fieldName = "prakar4";
                              if (param.examName === "પ્રકાર-5") fieldName = "prakar5";
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
                          <IconButton
                            icon={<FiTrash2 />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
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

          {/* Pagination Section */}
          {parameters.length > 0 && (
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
                <Text fontSize="sm" color="gray.600">
                  Show:
                </Text>
                <Select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  size="sm"
                  w="70px"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </Select>
                <Text fontSize="sm" color="gray.600">
                  per page
                </Text>
              </Flex>

              <Flex align="center" gap={2}>
                <Button
                  size="sm"
                  variant="outline"
                  isDisabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  leftIcon={<FiChevronLeft />}
                >
                  Previous
                </Button>
                <Text fontSize="sm" color="gray.600">
                  Page {currentPage} of {totalPages || 1}
                </Text>
                <Button
                  size="sm"
                  variant="outline"
                  isDisabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => handlePageChange(currentPage + 1)}
                  rightIcon={<FiChevronRight />}
                >
                  Next
                </Button>
              </Flex>
            </Flex>
          )}
        </Box>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader bg="#1E4D2B" color="white">
            {editingParam ? "પેરામીટર સુધારો" : "નવું પેરામીટર ઉમેરો"}
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py={6}>
            <Alert status="info" mb={4} borderRadius="md">
              <AlertIcon />
              કૃપા કરી નીચેના તમામ ફીલ્ડ ભરો
            </Alert>
            
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={5}>
              <GridItem>
                <FormControl isRequired>
                  <FormLabel>પ્રકાર-1</FormLabel>
                  <Input
                    name="prakar1"
                    value={formData.prakar1}
                    onChange={handleChange}
                    placeholder="પ્રકાર-1 નું મૂલ્ય દાખલ કરો"
                  />
                </FormControl>
              </GridItem>
              
              <GridItem>
                <FormControl isRequired>
                  <FormLabel>પ્રકાર-2</FormLabel>
                  <Input
                    name="prakar2"
                    value={formData.prakar2}
                    onChange={handleChange}
                    placeholder="પ્રકાર-2 નું મૂલ્ય દાખલ કરો"
                  />
                </FormControl>
              </GridItem>
              
              <GridItem>
                <FormControl isRequired>
                  <FormLabel>પ્રકાર-3</FormLabel>
                  <Input
                    name="prakar3"
                    value={formData.prakar3}
                    onChange={handleChange}
                    placeholder="પ્રકાર-3 નું મૂલ્ય દાખલ કરો"
                  />
                </FormControl>
              </GridItem>
              
              <GridItem>
                <FormControl isRequired>
                  <FormLabel>પ્રકાર-4</FormLabel>
                  <Input
                    name="prakar4"
                    value={formData.prakar4}
                    onChange={handleChange}
                    placeholder="પ્રકાર-4 નું મૂલ્ય દાખલ કરો"
                  />
                </FormControl>
              </GridItem>
              
              <GridItem>
                <FormControl isRequired>
                  <FormLabel>પ્રકાર-5</FormLabel>
                  <Input
                    name="prakar5"
                    value={formData.prakar5}
                    onChange={handleChange}
                    placeholder="પ્રકાર-5 નું મૂલ્ય દાખલ કરો"
                  />
                </FormControl>
              </GridItem>
              
              <GridItem>
                <FormControl isRequired>
                  <FormLabel>પી.એફ. વ્યાજ (%)</FormLabel>
                  <Input
                    type="number"
                    name="pfVyaj"
                    value={formData.pfVyaj}
                    onChange={handleChange}
                    placeholder="પી.એફ. વ્યાજ દર દાખલ કરો"
                    step="0.01"
                  />
                </FormControl>
              </GridItem>
              
              <GridItem colSpan={{ base: 1, md: 2 }}>
                <FormControl isRequired>
                  <FormLabel>ગ્રેજ્યુએટી ફંડ (₹)</FormLabel>
                  <Input
                    type="number"
                    name="graduateFund"
                    value={formData.graduateFund}
                    onChange={handleChange}
                    placeholder="ગ્રેજ્યુએટી ફંડ રકમ દાખલ કરો"
                    step="0.01"
                  />
                </FormControl>
              </GridItem>
            </Grid>

            {/* Preview */}
            <Box bg="gray.50" p={3} rounded="lg" mt={5}>
              <Text fontSize="sm" fontWeight="bold" mb={2}>દાખલ કરેલ માહિતી:</Text>
              <SimpleGrid columns={2} spacing={2} fontSize="xs">
                <Text>પ્રકાર-1: {formData.prakar1 || "-"}</Text>
                <Text>પ્રકાર-2: {formData.prakar2 || "-"}</Text>
                <Text>પ્રકાર-3: {formData.prakar3 || "-"}</Text>
                <Text>પ્રકાર-4: {formData.prakar4 || "-"}</Text>
                <Text>પ્રકાર-5: {formData.prakar5 || "-"}</Text>
                <Text>પી.એફ. વ્યાજ: {formData.pfVyaj || "-"}%</Text>
                <Text>ગ્રેજ્યુએટી ફંડ: ₹{formData.graduateFund || "0"}</Text>
              </SimpleGrid>
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" onClick={onClose} mr={3}>
              રદ કરો
            </Button>
            <Button
              colorScheme="green"
              onClick={handleSave}
              isLoading={saving}
              leftIcon={<FiSave />}
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
          <ModalHeader bg="#1E4D2B" color="white">
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
                  <Badge colorScheme={getTypeColor(viewingParam.parameterType)} w="fit-content">
                    {getTypeLabel(viewingParam.parameterType)}
                  </Badge>
                  
                  <Text fontWeight="bold" color="gray.600">મૂલ્ય:</Text>
                  <Text fontWeight="bold" color="green.600">
                    {viewingParam.parameterType === "pf" ? `${viewingParam.value}%` : 
                     viewingParam.parameterType === "fund" ? `₹${viewingParam.value}` : viewingParam.value}
                  </Text>
                  
                  {viewingParam.minValue > 0 || viewingParam.maxValue > 0 ? (
                    <>
                      <Text fontWeight="bold" color="gray.600">ન્યૂનતમ મૂલ્ય:</Text>
                      <Text>{viewingParam.minValue}</Text>
                      
                      <Text fontWeight="bold" color="gray.600">મહત્તમ મૂલ્ય:</Text>
                      <Text>{viewingParam.maxValue}</Text>
                    </>
                  ) : null}
                  
                  <Text fontWeight="bold" color="gray.600">સ્થિતિ:</Text>
                  <Badge colorScheme={viewingParam.status === "active" ? "green" : "red"}>
                    {viewingParam.status === "active" ? "સક્રિય" : "નિષ્ક્રિય"}
                  </Badge>
                  
                  <Text fontWeight="bold" color="gray.600">બનાવવાની તારીખ:</Text>
                  <Text>{new Date(viewingParam.createdAt).toLocaleDateString()}</Text>
                </Grid>
              </Box>
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
                તમારા દ્વારા દાખલ કરેલ તમામ પેરામીટર સફળતાપૂર્વક સેવ થઈ ગયા છે.
              </Text>
              
              <Box bg="gray.50" p={4} rounded="lg" w="100%" mb={4}>
                <Text fontWeight="bold" mb={2} fontSize="sm">સેવ થયેલ માહિતી:</Text>
                <SimpleGrid columns={2} spacing={2} fontSize="xs">
                  <Text>પ્રકાર-1: <strong>{savedData.prakar1 || "-"}</strong></Text>
                  <Text>પ્રકાર-2: <strong>{savedData.prakar2 || "-"}</strong></Text>
                  <Text>પ્રકાર-3: <strong>{savedData.prakar3 || "-"}</strong></Text>
                  <Text>પ્રકાર-4: <strong>{savedData.prakar4 || "-"}</strong></Text>
                  <Text>પ્રકાર-5: <strong>{savedData.prakar5 || "-"}</strong></Text>
                  <Text>પી.એફ. વ્યાજ: <strong>{savedData.pfVyaj || "-"}%</strong></Text>
                  <Text>ગ્રેજ્યુએટી ફંડ: <strong>₹{savedData.graduateFund || "0"}</strong></Text>
                </SimpleGrid>
              </Box>
              
              <Button
                colorScheme="green"
                onClick={onSuccessClose}
                px={8}
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