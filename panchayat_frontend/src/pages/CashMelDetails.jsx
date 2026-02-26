"use client";

import React, { useEffect, useState } from "react";
import ExpandableText from "../components/ExpandableText";
import {
  Box,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Text,
  Spinner,
  HStack,
  IconButton,
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  InputGroup,
  InputLeftElement,
  Select,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { EditIcon, CheckIcon, CloseIcon, SearchIcon, CalendarIcon } from "@chakra-ui/icons";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import Pagination from "../components/Pagination";
import { ViewIcon } from "@chakra-ui/icons";
import { useTranslation } from "react-i18next";

const CashMelDetails = () => {
  const { t } = useTranslation();

  const { id } = useParams();
  const toast = useToast();

  const [entry, setEntry] = useState(null);
  const [allEntries, setAllEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [originalEntry, setOriginalEntry] = useState(null);
  const [editMode, setEditMode] = useState({});
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteDate, setDeleteDate] = useState(null);
  const [deleteMode, setDeleteMode] = useState(null); // 'single' or 'date'

  const API_ROOT =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1")
      ? "http://localhost:5000/api"
      : "https://panchayat.shridaay.com/api";
  const API_BASE = `${API_ROOT}/cashmel`;

  const authFetch = (url, options = {}) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("⚠️ No token found in localStorage");
    }
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });
  };

  // ✅ Sort helper
// ✅ આ function બદલો — નવી date પહેલા, પછી receipt ascending
const sortEntries = (data) => {
  return [...data].sort((a, b) => {
    // 1. Date DESCENDING (આજની/નવી date પહેલા)
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    if (dateA !== dateB) return dateB - dateA; // ← dateB - dateA = descending

    // 2. Same date → receipt number ASCENDING (3, 11, 11, 22)
    const rA = parseInt(String(a.receiptPaymentNo), 10) || 0;
    const rB = parseInt(String(b.receiptPaymentNo), 10) || 0;
    if (rA !== rB) return rA - rB;

    // 3. Same receipt → MongoDB _id sort
    return String(a._id || "").localeCompare(String(b._id || ""));
  });
};

  const deleteRecord = async () => {
    try {
      const url = `${API_BASE}/delete/${deleteId}`;
      setDeleting(true);
      const res = await authFetch(url, { method: "DELETE" });

      if (!res.ok) {
        let body = null;
        try {
          body = await res.json();
        } catch {
          body = await res.text();
        }
        throw new Error(body?.message || `Delete failed: ${res.status}`);
      }

      toast({
        title: t("deleteSuccess"),
        status: "success",
        duration: 2000,
        position: "top",
      });

      setAllEntries((prev) => prev.filter((x) => x._id !== deleteId));
      setFilteredEntries((prev) => prev.filter((x) => x._id !== deleteId));
      onClose();
    } catch (err) {
      console.error("Delete error", err);
      toast({
        title: t("deleteError"),
        status: "error",
        duration: 2000,
        position: "top",
      });
    } finally {
      setDeleting(false);
    }
  };

  const deleteRecordsByDate = async (date) => {
    try {
      const url = `${API_BASE}/delete-by-date/${date}`;
      setDeleting(true);
      const res = await authFetch(url, { method: "DELETE" });

      if (!res.ok) {
        let body = null;
        try {
          body = await res.json();
        } catch {
          body = await res.text();
        }
        throw new Error(body?.message || `Delete failed: ${res.status}`);
      }

      const result = await res.json();
      
      toast({
        title: `તારીખ ${date} ના ${result.deletedCount} રેકોર્ડ્સ સફળતાપૂર્વક કાઢી નાખ્યા`,
        status: "success",
        duration: 3000,
        position: "top",
      });

      // Remove deleted entries from state
      setAllEntries((prev) => prev.filter((x) => x.date !== date));
      setFilteredEntries((prev) => prev.filter((x) => x.date !== date));
      onClose();
    } catch (err) {
      console.error("Delete by date error", err);
      toast({
        title: "તારીખ મુજબ કાઢવામાં ભૂલ",
        status: "error",
        duration: 2000,
        position: "top",
      });
    } finally {
      setDeleting(false);
    }
  };

  const paymentMethodGujarati = (method) => {
    if (!method) return "-";
    const value = method.toString().toLowerCase().trim();
    if (
      value === "cash" ||
      value === "rokad" ||
      value === "rokad-yes" ||
      value.includes("rokad")
    ) {
      return "રોકડ";
    }
    if (
      value === "bank" ||
      value === "cheque" ||
      value === "check" ||
      value === "dd" ||
      value.includes("bank")
    ) {
      return "બેંક";
    }
    return method;
  };

  const [rows, setRows] = useState([]);

  // ✅ Fetch all entries with sort
  useEffect(() => {
    if (!id) {
      setLoading(true);
      authFetch(API_BASE)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data) => {
          const sorted = sortEntries(data.data || []);
          console.log("✅ Sorted receipts:", sorted.map((x) => x.receiptPaymentNo));
          setAllEntries(sorted);
          setFilteredEntries(sorted);
        })
        .catch((err) => {
          console.error("Failed to load entries:", err);
          toast({
            title: "Failed to load entries",
            status: "error",
            duration: 3000,
            position: "top",
          });
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  // Filter entries based on search and type
  useEffect(() => {
    if (!id) {
      let filtered = allEntries;

      if (filterType !== "all") {
        filtered = filtered.filter(
          (entry) => entry.vyavharType?.toLowerCase() === filterType
        );
      }

      if (searchTerm) {
        filtered = filtered.filter(
          (entry) =>
            entry.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.receiptPaymentNo
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            entry.ddCheckNum?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // ✅ After filter, re-sort to maintain order
      const sorted = sortEntries(filtered);
      setFilteredEntries(sorted);
      setTotalPages(Math.ceil(sorted.length / itemsPerPage));
      setCurrentPage(1);
    }
  }, [searchTerm, filterType, allEntries, id, itemsPerPage]);

  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredEntries.slice(startIndex, endIndex);
  };

  // Fetch single entry
  useEffect(() => {
    if (id) {
      setLoading(true);
      authFetch(`${API_BASE}/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data) => {
          setEntry(data.data);
          setOriginalEntry(data.data);
        })
        .catch((err) => {
          console.error("Failed to load entry:", err);
          toast({
            title: t("loadEntryError"),
            status: "error",
            duration: 3000,
            position: "top",
          });
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleSave = async () => {
    if (!entry) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("date", entry.date);
      fd.append("name", entry.name);
      fd.append("receiptPaymentNo", entry.receiptPaymentNo);
      fd.append("vyavharType", entry.vyavharType);
      fd.append("category", entry.category);
      fd.append("amount", entry.amount);

      const res = await authFetch(`${API_BASE}/${id}`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Update failed");
      }

      toast({
        title: t("updateCashmel"),
        status: "success",
        duration: 2000,
        position: "top",
      });
    } catch (err) {
      console.error("Update error:", err);
      toast({
        title: t("updateError"),
        status: "error",
        duration: 2000,
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  const toGujaratiDigits = (num) => {
    if (!num && num !== 0) return "";
    
    // Convert to number
    const roundedNum = typeof num === 'number' ? num : parseFloat(num);
    if (isNaN(roundedNum)) return "";
    
    // Check if it's a whole number
    const formattedNum = Number.isInteger(roundedNum) ? 
        roundedNum.toString() : 
        roundedNum.toFixed(2);
    
    const guj = ["૦", "૧", "૨", "૩", "૪", "૫", "૬", "૭", "૮", "૯"];
    return formattedNum.replace(/\d/g, (d) => guj[parseInt(d)]);
  };

  const formatDateToGujarati = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${toGujaratiDigits(day)}/${toGujaratiDigits(month)}/${toGujaratiDigits(year)}`;
  };

  const handleDownloadRojmelPDF = async () => {
    try {
      setLoading(true);
      
      // Get date range from filtered entries or default to current month
      const dates = filteredEntries.map(e => e.date).filter(d => d);
      const from = dates.length > 0 ? Math.min(...dates.map(d => new Date(d).getTime())) : null;
      const to = dates.length > 0 ? Math.max(...dates.map(d => new Date(d).getTime())) : null;
      
      const params = new URLSearchParams();
      if (from) params.append('from', new Date(from).toISOString().split('T')[0]);
      if (to) params.append('to', new Date(to).toISOString().split('T')[0]);
      params.append('taluko', 'તાલુકો'); // You can make this dynamic
      params.append('yearRange', '2023-2024'); // You can make this dynamic
      
      const url = `${API_BASE}/rojmel/pdf?${params.toString()}`;
      
      const response = await authFetch(url);
      if (!response.ok) throw new Error('Failed to generate PDF');
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `rojmel_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast({
        title: "PDF સફળતાપૂર્વક ડાઉનલોડ થયું",
        status: "success",
        duration: 3000,
        position: "top",
      });
    } catch (err) {
      console.error("PDF download error:", err);
      toast({
        title: "PDF ડાઉનલોડમાં ભૂલ",
        status: "error",
        duration: 3000,
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  // LIST PAGE
  if (!id) {
    return (
      <Box bg="#F8FAF9" minH="100vh" p={10}>
        <Flex justify="space-between" align="center" mb={10}>
          <Heading size="lg" color="#1E4D2B" fontWeight="700">
            {t("cashmelDetails")}
          </Heading>

          <HStack spacing={3}>
            <Button
              colorScheme="blue"
              variant="outline"
              onClick={() => navigate("/cashmel/bank-deposits")}
            >
              જમા કરેલી બેંક જમા
            </Button> 
            <Button
              colorScheme="purple"
              variant="outline"
              onClick={handleDownloadRojmelPDF}
              isLoading={loading}
            >
              રોજમેળ PDF ડાઉનલોડ
            </Button>
            <Button
              leftIcon={<FiArrowLeft />}
              colorScheme="green"
              variant="outline"
              onClick={() => navigate("/cashmelform")}
            >
              {t("goBack")}
            </Button>
          </HStack>
        </Flex>

        <Box
          p={6}
          rounded="2xl"
          shadow="md"
          border="1px solid #E3EDE8"
          mb={6}
        >
          <Heading size="md" color="green.700" mb={4}>
            {t("totalEntries")}: {filteredEntries.length}
          </Heading>

          <Flex gap={4} flexWrap="wrap">
            <InputGroup maxW="400px">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="નામ, કેટેગરી ,અથવા રશીદ નંબર શોધો..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg="white"
              />
            </InputGroup>

            <Select
              maxW="200px"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              bg="white"
            >
              <option value="all">{t("all")}</option>
              <option value="aavak">{t("aavak")}</option>
              <option value="javak">{t("javak")}</option>
            </Select>
          </Flex>
        </Box>

        {loading ? (
          <Flex justify="center" py={10}>
            <Spinner size="xl" />
          </Flex>
        ) : (
          <>
            <TableContainer
              bg="white"
              rounded="2xl"
              shadow="lg"
              border="1px solid #E3EDE8"
              p={4}
            >
              <Table>
                <Thead bg="green.50">
                  <Tr>
                    <Th>{t("fieldDate")}</Th>
                    <Th>{t("fieldName")}</Th>
                    <Th>{t("fieldReceiptPaymentNo")}</Th>
                    <Th>{t("fieldVyavharType")}</Th>
                    <Th>{t("category")}</Th>
                    <Th>{t("paymentMethod")}</Th>
                    <Th>{t("ddCheckNum")}</Th>
                    <Th isNumeric>{t("fieldAmount")}</Th>
                    <Th>{t("remarks")}</Th>
                    <Th>{t("actions")}</Th>
                  </Tr>
                </Thead>

                <Tbody>
                  {getPaginatedData().map((row) => (
                    <Tr
                      key={row._id}
                      _hover={{ bg: "gray.50" }}
                      cursor="pointer"
                    >
                      <Td>{formatDateToGujarati(row.date)}</Td>
                      <Td>{row.name}</Td>
                      <Td>{toGujaratiDigits(row.receiptPaymentNo)}</Td>
                      <Td>
                        <Badge
                          colorScheme={
                            row.vyavharType?.toLowerCase() === "aavak"
                              ? "green"
                              : "red"
                          }
                          rounded="full"
                          px={3}
                          py={1}
                        >
                          {row.vyavharType?.toLowerCase() === "aavak"
                            ? t("aavak")
                            : t("javak")}
                        </Badge>
                      </Td>
                      <Td>{row.category}</Td>
                      <Td>{paymentMethodGujarati(row.paymentMethod)}</Td>
                      <Td>{row.ddCheckNum?.trim() ? row.ddCheckNum : "-"}</Td>
                      <Td isNumeric>₹{toGujaratiDigits(row.amount)}</Td>
                      <Td maxW="300px" whiteSpace="normal" breakwords="break-word">
                        <ExpandableText text={row.remarks} />
                      </Td>

                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            size="sm"
                            icon={<EditIcon />}
                            variant="ghost"
                            colorScheme="blue"
                            rounded="full"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/cashmelform/${row._id}`);
                            }}
                          />
                          
                          {/* Date-wise delete button - only show once per date */}
                          {getPaginatedData().findIndex((r) => r.date === row.date) === getPaginatedData().findIndex((r) => r._id === row._id) && (
                            <IconButton
                              size="sm"
                              icon={<CalendarIcon />}
                              variant="ghost"
                              colorScheme="orange"
                              rounded="full"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteDate(row.date);
                                setDeleteMode('date');
                                onOpen();
                              }}
                              title={`તારીખ ${formatDateToGujarati(row.date)} ના બધા રેકોર્ડ્સ કાઢો`}
                            />
                          )}
                          
                          <IconButton
                            size="sm"
                            icon={<DeleteIcon />}
                            variant="ghost"
                            colorScheme="red"
                            rounded="full"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteId(row._id);
                              setDeleteMode('single');
                              onOpen();
                            }}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
            />
          </>
        )}

        {/* Delete Modal */}
        <Modal isOpen={isOpen} onClose={onClose} isCentered motionPreset="scale">
          <ModalOverlay bg="rgba(0,0,0,0.45)" />
          <ModalContent
            rounded="2xl"
            p={2}
            bg="white"
            shadow="2xl"
            border="1px solid #f2dede"
          >
            <ModalCloseButton />

            <Flex justify="center" mt={6}>
              <Flex
                bg="red.100"
                w="70px"
                h="70px"
                rounded="full"
                align="center"
                justify="center"
                border="2px solid #fc8181"
              >
                <Text fontSize="4xl" color="red.600">
                  ⚠️
                </Text>
              </Flex>
            </Flex>

            <ModalHeader
              textAlign="center"
              mt={4}
              fontSize="2xl"
              fontWeight="800"
              color="red.600"
            >
              {deleteMode === 'date' ? 'તારીખ મુજબ કાઢવું' : t("deleteTitle")}
            </ModalHeader>

            <ModalBody pb={6}>
              <Text
                fontSize="lg"
                textAlign="center"
                color="gray.700"
                px={4}
                lineHeight="1.7"
              >
                {deleteMode === 'date' 
                  ? `શું તમે ખરેખર તારીખ ${formatDateToGujarati(deleteDate)} ના બધા રેકોર્ડ્સ કાઢી નાખવા માંગો છો?`
                  : t("deleteConfirmFull")
                }
              </Text>
            </ModalBody>

            <ModalFooter justifyContent="center" gap={4} pb={6}>
              <Button
                variant="outline"
                onClick={onClose}
                rounded="full"
                px={8}
                size="lg"
              >
                {t("cancel")}
              </Button>
              <Button
                colorScheme="red"
                rounded="full"
                px={8}
                size="lg"
                onClick={deleteMode === 'date' ? () => deleteRecordsByDate(deleteDate) : deleteRecord}
                isLoading={deleting}
                loadingText="Deleting"
              >
                {deleteMode === 'date' ? 'બધા કાઢો' : t("delete")}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    );
  }

  // SINGLE ENTRY PAGE
  return <Box bg="#F8FAF9" minH="100vh" p={10}></Box>;
};

export default CashMelDetails;