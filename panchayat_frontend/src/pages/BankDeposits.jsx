import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Heading,
  VStack,
  Button,
  useToast,
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Select,
} from "@chakra-ui/react";
import { FiArrowLeft, FiEdit2, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DateInput from "./DateInput.jsx";

/* ---------- Format DD/MM/YYYY ---------- */
const formatDisplayDate = (input) => {
  const digits = input.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4);
};

/* --------------- Convert DD/MM/YYYY → ISO ------------ */
const convertToISO = (display) => {
  const [d, m, y] = display.split("/");
  if (!d || !m || !y || y.length !== 4) return "";
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
};

/* ---------- Gujarati Digits → English Digits ---------- */
const gujaratiToEnglishDigits = (str) => {
  if (!str) return str;
  const guj = "૦૧૨૩૪૫૬૭૮૯";
  const eng = "0123456789";
  return str
    .split("")
    .map((char) => {
      const idx = guj.indexOf(char);
      return idx !== -1 ? eng[idx] : char;
    })
    .join("");
};

/* ---------- English → Gujarati Digits (Display) ---------- */
const toGujaratiDigits = (num) => {
  if (!num && num !== 0) return "";
  const guj = ["૦", "૧", "૨", "૩", "૪", "૫", "૬", "૭", "૮", "૯"];
  return String(num).split("").map(d => guj[d] || d).join("");
};

const BankDeposits = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();

  const API_BASE = (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"))
    ? "http://localhost:5000/api"
    : "https://panchayat.shridaay.com/api";

  const [bankDeposits, setBankDeposits] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingDepositId, setEditingDepositId] = useState(null);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isOpenEdit, onOpen: onOpenEdit, onClose: onCloseEdit } = useDisclosure();
  const { isOpen: isOpenDelete, onOpen: onOpenDelete, onClose: onCloseDelete } = useDisclosure();

  const [modalForm, setModalForm] = useState({
    date: "",
    dateDisplay: "",
    bank: "",
    remarks: "",
    amount: "",
  });

  const fetchBanks = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/banks`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        }
      });
      if (!res.ok) throw new Error("Failed to fetch banks");
      const data = await res.json();
      setBanks(data);
    } catch (err) {
      console.error(err);
    }
  }, [API_BASE]);

  const fetchBankDeposits = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/cashmel?category=બેંક જમા`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        }
      });
      if (!res.ok) throw new Error("Failed to fetch bank deposits");
      const data = await res.json();
      // Get only aavak entries (bank deposits), not javak
      const deposits = data.data ? data.data.filter(d => d.vyavharType === 'aavak') : [];
      setBankDeposits(deposits);
    } catch (err) {
      console.error(err);
      toast({ title: "બેંક જમા લોડ કરવામાં ભૂલ", status: "error", duration: 2000 });
    } finally {
      setLoading(false);
    }
  }, [API_BASE, toast]);

  useEffect(() => {
    fetchBanks();
    fetchBankDeposits();
  }, [fetchBanks, fetchBankDeposits]);

  const openEditModal = (deposit) => {
    const dateParts = deposit.date ? deposit.date.split("-") : [];
    const displayDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : "";
    setModalForm({
      date: deposit.date || "",
      dateDisplay: displayDate,
      bank: deposit.bank || "",
      remarks: deposit.remarks || "",
      amount: deposit.amount?.toString() || "",
    });
    setEditingDepositId(deposit._id);
    onOpenEdit();
  };

  const cancelEditDeposit = () => {
    setEditingDepositId(null);
    setModalForm({ date: "", dateDisplay: "", bank: "", remarks: "", amount: "" });
    onCloseEdit();
  };

  const submitModalToServer = async () => {
    if (!modalForm.amount) {
      toast({ title: "રકમ દાખલ કરો", status: "error", duration: 2000 });
      return;
    }

    setModalSubmitting(true);
    try {
      const dateIso = modalForm.date || convertToISO(modalForm.dateDisplay || "");
      const amount = modalForm.amount;
      const remarks = modalForm.remarks || "બેંક જમા";
      const bankName = modalForm.bank || "";
      const token = localStorage.getItem("token");

      // UPDATE existing deposit
      const fd = new FormData();
      fd.append("date", dateIso || "");
      fd.append("bank", bankName);
      fd.append("remarks", remarks);
      fd.append("amount", amount);

      const res = await fetch(`${API_BASE}/cashmel/${editingDepositId}`, {
        method: "POST",
        body: fd,
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to update");
      }

      toast({ title: "બેંક જમા અપડેટ થયું", status: "success", duration: 2500 });
      setEditingDepositId(null);
      setModalForm({ date: "", dateDisplay: "", bank: "", remarks: "", amount: "" });
      onCloseEdit();
      fetchBankDeposits();
    } catch (err) {
      console.error(err);
      toast({ title: "સંગ્રહમાં ભૂલ", description: err.message || "કૃપા કરીને ફરી પ્રયાસ કરો", status: "error", duration: 4000 });
    } finally {
      setModalSubmitting(false);
    }
  };

  const deleteBankDeposit = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Find the aavak deposit to delete
      const aavakDeposit = bankDeposits.find(d => d._id === deleteId);
      if (!aavakDeposit) throw new Error("Deposit not found");
      
      // Find corresponding javak entry by date and amount
      const res = await fetch(`${API_BASE}/cashmel?category=બેંક જમા`, {
        headers: { ...(token && { Authorization: `Bearer ${token}` }) }
      });
      const data = await res.json();
      const javakDeposit = data.data?.find(d => 
        d.vyavharType === 'javak' && 
        d.date === aavakDeposit.date && 
        d.amount === aavakDeposit.amount
      );
      
      // Delete aavak entry
      await fetch(`${API_BASE}/cashmel/delete/${deleteId}`, {
        method: "DELETE",
        headers: { ...(token && { Authorization: `Bearer ${token}` }) }
      });
      
      // Delete javak entry if found
      if (javakDeposit) {
        await fetch(`${API_BASE}/cashmel/delete/${javakDeposit._id}`, {
          method: "DELETE",
          headers: { ...(token && { Authorization: `Bearer ${token}` }) }
        });
      }
      
      toast({ title: "બેંક જમા રદ કરવામાં આવી", status: "success", duration: 2000 });
      onCloseDelete();
      setDeleteId(null);
      fetchBankDeposits();
    } catch (err) {
      console.error(err);
      toast({ title: "રદ કરવામાં ભૂલ", status: "error", duration: 2000 });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box p={8} maxW="1200px" mx="auto" bg="#F8FAF9" minH="100vh">
      <Flex align="center" mb={6}>
        <Box width="180px">
          <Button
            leftIcon={<FiArrowLeft />}
            colorScheme="green"
            variant="outline"
            onClick={() => navigate("/cashmel/details")}
          >
            પાછા જાવ
          </Button>
        </Box>

        <Heading
          flex="1"
          textAlign="center"
          color="#1E4D2B"
          fontWeight="700"
        >
          જમા કરેલી બેંક જમા વિગત
        </Heading>

        <Box width="180px" />
      </Flex>

      <Box p={6} bg="white" rounded="2xl" shadow="md" borderWidth="1px">
        <Heading size="md" color="green.700" borderLeft="4px solid #2A7F62" pl={3} mb={6}>
          બધી બેંક જમા
        </Heading>

        {loading ? (
          <Box textAlign="center" py={8}>
            લોડ થઈ રહ્યું છે...
          </Box>
        ) : bankDeposits.length === 0 ? (
          <Box textAlign="center" py={8} color="gray.500">
            હજુ કોઈ બેંક જમા નોંધાયેલ નથી
          </Box>
        ) : (
          <TableContainer borderWidth="1px" rounded="md">
            <Table size="md" variant="striped" colorScheme="gray">
              <Thead sticky="top" bg="gray.100">
                <Tr>
                  <Th>તારીખ</Th>
                  <Th>બેંક</Th>
                  <Th>રકમ</Th>
                  <Th maxW="300px">વિગત</Th>
                  <Th>ક્રિયાઓ</Th>
                </Tr>
              </Thead>
              <Tbody>
                {bankDeposits.map((deposit) => {
                  const dateParts = deposit.date ? deposit.date.split("-") : [];
                  const displayDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : "";
                  return (
                    <Tr key={deposit._id}>
                      <Td fontWeight="500">{displayDate}</Td>
                      <Td fontWeight="500">{deposit.bank}</Td>
                      <Td fontWeight="600" color="green.700">{toGujaratiDigits(deposit.amount)}</Td>
                      <Td fontSize="sm" maxW="300px" isTruncated title={deposit.remarks}>{deposit.remarks}</Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            size="md"
                            icon={<FiEdit2 />}
                            colorScheme="blue"
                            onClick={() => openEditModal(deposit)}
                            title="સંપાદિત કરો"
                          />
                          <IconButton
                            size="md"
                            icon={<FiTrash2 />}
                            colorScheme="red"
                            onClick={() => {
                              setDeleteId(deposit._id);
                              onOpenDelete();
                            }}
                            title="રદ કરો"
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Edit Modal */}
      <Modal isOpen={isOpenEdit} onClose={cancelEditDeposit} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>બેંક જમા સંપાદિત કરો</ModalHeader>
          <ModalCloseButton onClick={cancelEditDeposit} />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <DateInput
                label={t("date")}
                formValue={modalForm}
                setFormValue={setModalForm}
                formatDisplayDate={formatDisplayDate}
                convertToISO={convertToISO}
                t={t}
              />

              <FormControl>
                <FormLabel fontWeight="600">બેંક</FormLabel>
                <Select size="lg" bg="gray.100" value={modalForm.bank} onChange={(e) => setModalForm(p => ({ ...p, bank: e.target.value }))}>
                  <option value="">{t("select")}</option>
                  {banks.map(b => (
                    <option key={b._id} value={b.name}>{b.name}</option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="600">વ્યવહારની વિગત</FormLabel>
                <Input size="lg" bg="gray.100" value={modalForm.remarks} onChange={(e) => setModalForm(p => ({ ...p, remarks: e.target.value }))} />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="600">{t("amount")}</FormLabel>
                <Input size="lg" bg="gray.100" value={toGujaratiDigits(modalForm.amount)} onChange={(e) => {
                  const englishValue = gujaratiToEnglishDigits(e.target.value)
                    .replace(/[^0-9.]/g, "")
                    .replace(/(\..*)\./g, "$1");
                  setModalForm(p => ({ ...p, amount: englishValue }));
                }} />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={2}>
              <Button mr={3} onClick={cancelEditDeposit}>
                રદ કરો
              </Button>
              <Button colorScheme="green" onClick={submitModalToServer} isLoading={modalSubmitting}>
                અપડેટ કરો
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpenDelete} onClose={onCloseDelete} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>પુષ્ટિ</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            શું તમે આ બેંક જમા રદ કરવા માટે ચોક્કસ છો?
          </ModalBody>

          <ModalFooter>
            <HStack spacing={2}>
              <Button onClick={onCloseDelete}>
                રદ કરો
              </Button>
              <Button colorScheme="red" onClick={deleteBankDeposit} isLoading={deleting}>
                હા, રદ કરો
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default BankDeposits;
