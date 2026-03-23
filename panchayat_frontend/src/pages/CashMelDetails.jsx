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
  const [deleteMode, setDeleteMode] = useState(null);
  const [deleteFilterType, setDeleteFilterType] = useState("all");

  // Minus silak dates state
  const [minusSilakDates, setMinusSilakDates] = useState([]);
  const [showMinusDatesModal, setShowMinusDatesModal] = useState(false);
  const [loadingMinusDates, setLoadingMinusDates] = useState(false);

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

  // ✅ FIXED: Fetch minus silak dates - only cash (રોકડ) row
  // ✅ UPDATED fetchMinusSilakDates - Same logic as rojmel report
const fetchMinusSilakDates = async () => {
  try {
    setLoadingMinusDates(true);
    const token = localStorage.getItem("token");
    
    // Get current financial year
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const fyStartYear = currentMonth < 4 ? currentYear - 1 : currentYear;
    const fromDate = `${fyStartYear}-04-01`;
    const toDate = `${fyStartYear + 1}-03-31`;
    
    const res = await fetch(`${API_BASE}/report?from=${fromDate}&to=${toDate}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      }
    });
    
    if (!res.ok) throw new Error("Failed to fetch records");
    const data = await res.json();
    const records = Array.isArray(data.rows) ? data.rows : [];
    
    // Group records by date
    const recordsByDate = {};
    records.forEach(r => {
      if (!r.date) return;
      const d = r.date.slice(0, 10);
      if (!recordsByDate[d]) recordsByDate[d] = [];
      recordsByDate[d].push(r);
    });
    
    // ✅ EXACT SAME LOGIC AS ROJMEL REPORT
    const minusDates = [];
    let runningCashClosing = 0;

    Object.keys(recordsByDate).sort().forEach(date => {
      const dayRecords = recordsByDate[date];

      // ✅ Step 1: Opening Add (ઉઘડતી સિલક entries for this day - cash only)
      const openingAdd = dayRecords
        .filter(r => r.vyavharType === "aavak" && r.category === "ઉઘડતી સિલક")
        .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

      const cashOpening = runningCashClosing + openingAdd;

      // ✅ Step 2: Cash Income (excluding ઉઘડતી સિલક, excluding bank)
      const cashIncome = dayRecords
        .filter(r => 
          !(r.vyavharType === "aavak" && r.category === "ઉઘડતી સિલક") && 
          r.paymentMethod !== "bank"
        )
        .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

      // ✅ Step 3: Cash Expense (excluding bank)
      const cashExpense = dayRecords
        .filter(r => r.vyavharType === "javak" && r.paymentMethod !== "bank")
        .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

      // ✅ Step 4: Calculate Cash Closing
      const cashClosing = cashOpening + cashIncome - cashExpense;

      // ✅ Step 5: If negative, add to list
      if (cashClosing < 0) {
        minusDates.push({
          date: date,
          cashOpening: cashOpening,
          cashIncome: cashIncome,
          cashExpense: cashExpense,
          cashClosing: cashClosing
        });
      }

      // Update running balance
      runningCashClosing = cashClosing;
    });
    
    console.log("✅ Found minus dates:", minusDates); // Debug log
    
    setMinusSilakDates(minusDates);
    setShowMinusDatesModal(true);
  } catch (err) {
    console.error(err);
    toast({ 
      title: "માઈનસ સિલક તારીખો લોડ કરવામાં ભૂલ", 
      status: "error", 
      duration: 2000 
    });
  } finally {
    setLoadingMinusDates(false);
  }
};

  // ✅ Sort: same receipt/pay number, opening slip first, then receipt nums 0,1,2...
  const sortEntries = (data) => {
    const isOpeningSlip = (entry) => {
      const category = (entry.category || "").toString().toLowerCase();
      return (
        category.includes("ઉઘડતી") ||
        category.includes("ઉઘડતી સિલક") ||
        category.includes("ugdati") ||
        category.includes("opening")
      );
    };

    const parseReceiptNo = (entry) => {
      const raw = String(entry.receiptPaymentNo || "").trim();
      const num = parseInt(raw, 10);
      return Number.isNaN(num) ? 0 : num;
    };

    return [...data].sort((a, b) => {
      const rA = parseReceiptNo(a);
      const rB = parseReceiptNo(b);

      if (rA !== rB) return rA - rB;

      const openA = isOpeningSlip(a);
      const openB = isOpeningSlip(b);
      if (openA && !openB) return -1;
      if (!openA && openB) return 1;

      const dateA = new Date(a.date).getTime() || 0;
      const dateB = new Date(b.date).getTime() || 0;
      if (dateA !== dateB) return dateB - dateA;

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

  const deleteAllRecords = async () => {
    try {
      const baseEntries = allEntries;
      const toDelete = baseEntries.filter((entry) =>
        deleteFilterType === "all"
          ? true
          : entry.vyavharType?.toLowerCase() === deleteFilterType
      );

      const idsToDelete = toDelete.map((entry) => entry._id);
      if (idsToDelete.length === 0) {
        toast({
          title: "કોઈ રેકોર્ડ મળી નહી",
          status: "info",
          duration: 2000,
          position: "top",
        });
        onClose();
        return;
      }

      const url = `${API_BASE}/delete-multiple`;
      setDeleting(true);
      const res = await authFetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: idsToDelete }),
      });

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
        title: `બધા ${result.deletedCount} રેકોર્ડ્સ સફળતાપૂર્વક કાઢી નાખ્યા`,
        status: "success",
        duration: 3000,
        position: "top",
      });

      setAllEntries((prev) => prev.filter((x) => !idsToDelete.includes(x._id)));
      setFilteredEntries((prev) => prev.filter((x) => !idsToDelete.includes(x._id)));
      onClose();
    } catch (err) {
      console.error("Delete all error", err);
      toast({
        title: "બધા રેકોર્ડ્સ કાઢવામાં ભૂલ",
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
          const onlyCashmel = sorted.filter(
            (entry) =>
              entry.category !== "બેંક જમા" &&
              entry.category?.toLowerCase().trim() !== "bank deposit" &&
              entry.category?.toLowerCase().trim() !== "bank deposit "
          );
          console.log("✅ Sorted receipts:", onlyCashmel.map((x) => x.receiptPaymentNo));
          setAllEntries(onlyCashmel);
          setFilteredEntries(onlyCashmel);
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
    const roundedNum = typeof num === "number" ? num : parseFloat(num);
    if (isNaN(roundedNum)) return "";
    const formattedNum = Number.isInteger(roundedNum)
      ? roundedNum.toString()
      : roundedNum.toFixed(2);
    const guj = ["૦", "૧", "૨", "૩", "૪", "૫", "૬", "૭", "૮", "૯"];
    return formattedNum.replace(/\d/g, (d) => guj[parseInt(d)]);
  };

  const formatDateToGujarati = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${toGujaratiDigits(day)}/${toGujaratiDigits(month)}/${toGujaratiDigits(year)}`;
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
              colorScheme="red"
              variant="outline"
              onClick={() => {
                setDeleteMode("all");
                setDeleteFilterType(filterType);
                onOpen();
              }}
            >
              બધા કાઢો
            </Button>
            <Button
              colorScheme="blue"
              variant="outline"
              onClick={() => navigate("/cashmel/bank-deposits")}
            >
              જમા કરેલી બેંક જમા
            </Button>
            {/* <Button
              colorScheme="orange"
              variant="outline"
              onClick={fetchMinusSilakDates}
              isLoading={loadingMinusDates}
            >
              માઈનસ સિલક તારીખો
            </Button> */}
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
          bg="white"
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

                          {getPaginatedData().findIndex(
                            (r) => r.date === row.date
                          ) ===
                            getPaginatedData().findIndex(
                              (r) => r._id === row._id
                            ) && (
                            <IconButton
                              size="sm"
                              icon={<CalendarIcon />}
                              variant="ghost"
                              colorScheme="orange"
                              rounded="full"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteDate(row.date);
                                setDeleteMode("date");
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
                              setDeleteMode("single");
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
              {deleteMode === "date"
                ? "તારીખ મુજબ કાઢવું"
                : deleteMode === "all"
                ? "બધા કાઢવું"
                : t("deleteTitle")}
            </ModalHeader>

            <ModalBody pb={6}>
              <Text
                fontSize="lg"
                textAlign="center"
                color="gray.700"
                px={4}
                lineHeight="1.7"
              >
                {deleteMode === "date" ? (
                  `શું તમે ખરેખર તારીખ ${formatDateToGujarati(deleteDate)} ના બધા રેકોર્ડ્સ કાઢી નાખવા માંગો છો?`
                ) : deleteMode === "all" ? (
                  `શું તમે ખરેખર ${
                    deleteFilterType === "all"
                      ? "તમામ"
                      : deleteFilterType === "aavak"
                      ? "આવક"
                      : "જાવક"
                  } રેકોર્ડ્સ કાઢી નાખવા માંગો છો?`
                ) : (
                  t("deleteConfirmFull")
                )}
              </Text>

              {deleteMode === "all" && (
                <Box mt={4}>
                  <Text fontWeight="600" mb={2} textAlign="center">
                    પ્રવૃત્તિનો પ્રકાર પસંદ કરો (આવક/જાવક)
                  </Text>
                  <Select
                    value={deleteFilterType}
                    onChange={(e) => setDeleteFilterType(e.target.value)}
                    bg="white"
                  >
                    <option value="all">બધા</option>
                    <option value="aavak">આવક</option>
                    <option value="javak">જાવક</option>
                  </Select>
                </Box>
              )}
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
                onClick={
                  deleteMode === "date"
                    ? () => deleteRecordsByDate(deleteDate)
                    : deleteMode === "all"
                    ? deleteAllRecords
                    : deleteRecord
                }
                isLoading={deleting}
                loadingText="Deleting"
              >
                {deleteMode === "date" || deleteMode === "all"
                  ? "બધા કાઢો"
                  : t("delete")}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* ✅ FIXED: Minus Silak Dates Modal */}
        <Modal 
          isOpen={showMinusDatesModal} 
          onClose={() => setShowMinusDatesModal(false)} 
          size="lg"
        >
          <ModalOverlay />
          <ModalContent maxH="80vh" overflowY="auto">
            <ModalHeader>માઈનસ રોકડ બંધ સિલક તારીખો</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              {minusSilakDates.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <Text fontSize="3xl" mb={2}>✅</Text>
                  <Text color="green.600" fontWeight="600" fontSize="lg">
                    કોઈ માઈનસ બંધ સિલક તારીખો નથી.
                  </Text>
                </Box>
              ) : (
                <VStack spacing={3} align="stretch">
                  {minusSilakDates.map((item, idx) => (
                    <Box 
                      key={idx} 
                      p={4} 
                      bg="red.50" 
                      rounded="lg" 
                      borderLeft="4px solid"
                      borderColor="red.500"
                      shadow="sm"
                    >
                      <HStack justify="space-between" mb={3}>
                        <Text fontWeight="700" color="red.700" fontSize="lg">
                          📅 તારીખ {formatDateToGujarati(item.date)}
                        </Text>
                        <Badge 
                          colorScheme="red" 
                          fontSize="md" 
                          px={3} 
                          py={1}
                          rounded="full"
                        >
                          બંધ સિલક: {toGujaratiDigits(item.cashClosing)}
                        </Badge>
                      </HStack>
                      
                      <VStack align="stretch" spacing={2} fontSize="sm" pl={4}>
                        <HStack justify="space-between">
                          <Text fontWeight="600">ઉઘડતી સિલક (રોકડ):</Text>
                          <Text>{toGujaratiDigits(item.cashOpening)}</Text>
                        </HStack>
                        <HStack justify="space-between" color="green.700">
                          <Text fontWeight="600">આવક (રોકડ):</Text>
                          <Text>+ {toGujaratiDigits(item.cashIncome)}</Text>
                        </HStack>
                        <HStack justify="space-between" color="red.700">
                          <Text fontWeight="600">જાવક (રોકડ):</Text>
                          <Text>- {toGujaratiDigits(item.cashExpense)}</Text>
                        </HStack>
                        <Box 
                          mt={2} 
                          pt={2} 
                          borderTop="1px dashed" 
                          borderColor="red.300"
                        >
                          <HStack justify="space-between" fontWeight="700">
                            <Text color="red.600">બંધ સિલક (રોકડ):</Text>
                            <Text color="red.600" fontSize="md">
                              {toGujaratiDigits(item.cashClosing)}
                            </Text>
                          </HStack>
                        </Box>
                      </VStack>
                    </Box>
                  ))}
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="green" onClick={() => setShowMinusDatesModal(false)}>
                બંધ કરો
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
