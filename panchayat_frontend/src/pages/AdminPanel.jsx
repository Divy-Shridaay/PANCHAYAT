"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";

import {
  Box,
  Button,
  Heading,
  VStack,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Input,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Spinner,
  Select,
  Flex,
  Badge,
  Divider
} from "@chakra-ui/react";
import { Switch } from "@chakra-ui/react";

import { FaEye, FaTrash, FaDownload } from "react-icons/fa";
import { apiFetch } from "../utils/api.js";

export default function AdminPanel() {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserModules, setSelectedUserModules] = useState({ pedhinamu: false, rojmel: false, jaminMehsul: false });
  const [selectedUserPedhinamuPrint, setSelectedUserPedhinamuPrint] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  // Payment Verification State
  const [isPaymentVerified, setIsPaymentVerified] = useState(null); // null, true, false
  const [paymentReason, setPaymentReason] = useState("");
  const [pricing, setPricing] = useState({ pedhinamu: 1, rojmel: 1, jaminMehsul: 1 });
  const { isOpen: isPricingOpen, onOpen: onPricingOpen, onClose: onPricingClose } = useDisclosure();

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const { response, data } = await apiFetch("/api/register/admin/users", {}, navigate, toast);

      if (response.ok) {
        setUsers(data.users);
      } else {
        toast({
          title: "ભૂલ",
          description: data.message || "વપરાશકર્તાઓને લોડ કરવામાં નિષ્ફળ",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top"
        });
      }
    } catch (err) {
      toast({
        title: "ભૂલ",
        description: "સર્વર સાથે કનેક્ટ થવામાં નિષ્ફળ",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top"
      });
    }
    setLoading(false);
  };

  const fetchPricing = async () => {
    try {
      const { response, data } = await apiFetch("/api/settings/pricing", {}, navigate, toast);
      if (response.ok) {
        setPricing(data.pricing);
      }
    } catch (err) {
      console.error("Error fetching pricing:", err);
    }
  };

  const handleUpdatePricing = async () => {
    try {
      const { response, data } = await apiFetch("/api/settings/pricing", {
        method: "PUT",
        body: JSON.stringify({ pricing }),
        headers: { "Content-Type": "application/json" }
      }, navigate, toast);

      if (response.ok) {
        toast({ title: "સફળ", description: "કિંમતો અપડેટ થઈ ગઈ છે", status: "success", duration: 3000, isClosable: true, position: "top" });
        onPricingClose();
      } else {
        throw new Error(data.message || `Update failed (Status: ${response.status})`);
      }
    } catch (err) {
      toast({ title: "ભૂલ", description: err.message || "સર્વર ભૂલ", status: "error", duration: 3000, isClosable: true, position: "top" });
    }
  };

  // Check if admin
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchPricing()]);
      setLoading(false);
    };

    loadData();
  }, []);

  // Helper to check if user needs payment verification (clicked submit button)
  const shouldShowVerification = (user) => {
    if (!user) return false;
    return user.isPendingVerification === true;
  };

  // View user details
  const handleViewUser = (user) => {
    setSelectedUser(user);
    // Initialize module toggle states from user data (fallback to false)
    // Calculate if user is currently under trial to set better defaults
    let isUnderTrial = false;
    if (user.trialStartDate) {
      const now = new Date();
      const trialStart = new Date(user.trialStartDate);
      const daysSinceTrial = Math.floor((now - trialStart) / (1000 * 60 * 60 * 24));
      isUnderTrial = daysSinceTrial < 8;
    }

    setSelectedUserModules({
      pedhinamu: user.modules?.pedhinamu ?? isUnderTrial,
      rojmel: user.modules?.rojmel ?? isUnderTrial,
      jaminMehsul: user.modules?.jaminMehsul ?? isUnderTrial
    });
    setSelectedUserPedhinamuPrint(user.pedhinamuPrintAllowed ?? isUnderTrial);

    // Reset payment verification state when viewing a new user
    setIsPaymentVerified(null);
    setPaymentReason("");

    onOpen();
  };

  const handleSubmitReason = async () => {
    if (!paymentReason.trim()) {
      toast({
        title: "ભૂલ",
        description: "કૃપા કરીને કારણ દાખલ કરો",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top"
      });
      return;
    }

    try {
      setLoading(true);
      const body = {
        modules: selectedUserModules,
        pedhinamuPrintAllowed: selectedUserPedhinamuPrint,
        isRejected: true,
        reason: paymentReason
      };

      const { response, data } = await apiFetch(`/api/register/admin/users/${selectedUser._id}/modules`, {
        method: "PUT",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" }
      }, navigate, toast);

      if (response.ok) {
        toast({
          title: "સફળતા",
          description: "ચુકવણી અસ્વીકાર કરવામાં આવી છે અને વપરાશકર્તાને ઇમેઇલ મોકલવામાં આવ્યો છે",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top"
        });
        fetchUsers();
        onClose();
      } else {
        throw new Error(data.message || "Rejection failed");
      }
    } catch (err) {
      toast({
        title: "ભૂલ",
        description: err.message || "સર્વર ભૂલ",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top"
      });
    } finally {
      setLoading(false);
    }
  };

  // Update module toggles locally
  const handleToggleModule = (field, value) => {
    setSelectedUserModules(prev => ({ ...prev, [field]: value }));
  };

  const handleTogglePedhinamuPrint = (value) => {
    setSelectedUserPedhinamuPrint(value);
  };

  const handleSaveVerification = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      const body = {
        modules: selectedUserModules,
        pedhinamuPrintAllowed: selectedUserPedhinamuPrint,
        // Only send isApproved if they were actually pending verification
        isApproved: shouldShowVerification(selectedUser)
      };

      const { response, data } = await apiFetch(`/api/register/admin/users/${selectedUser._id}/modules`, {
        method: "PUT",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" }
      }, navigate, toast);

      if (response.ok) {
        toast({
          title: "સફળતા",
          description: shouldShowVerification(selectedUser)
            ? "ચુકવણી મંજૂર કરવામાં આવી છે અને ઇમેઇલ મોકલવામાં આવ્યો છે"
            : "મોડ્યુલ અપડેટ કરવામાં આવ્યા છે",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top"
        });
        fetchUsers();
        onClose();
      } else {
        throw new Error(data.message || "Update failed");
      }
    } catch (err) {
      toast({ title: "ભૂલ", description: err.message || "સર્વર ભૂલ", status: "error", duration: 3000, isClosable: true, position: "top" });
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Activate user
  const handleActivateUser = async (userId) => {
    try {
      const { response, data } = await apiFetch(`/api/register/admin/users/${userId}/activate`, {
        method: "PUT",
      }, navigate, toast);

      if (response.ok) {
        toast({
          title: "સફળ",
          description: "યુઝર સક્રિય કર્યો",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top"
        });
        // Refresh users list
        fetchUsers();
        onClose();
      } else {
        toast({
          title: "ભૂલ",
          description: data.message || "યુઝરને સક્રિય કરવામાં નિષ્ફળ",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top"
        });
      }
    } catch (err) {
      toast({
        title: "ભૂલ",
        description: "સર્વર સાથે કનેક્ટ થવામાં નિષ્ફળ",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top"
      });
    }
  };

  // Deactivate user
  const handleDeactivateUser = async (userId) => {
    try {
      const { response, data } = await apiFetch(`/api/register/admin/users/${userId}/deactivate`, {
        method: "PUT",
      }, navigate, toast);

      if (response.ok) {
        toast({
          title: "સફળ",
          description: "યુઝર નિષ્ક્રિય કર્યો",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top"
        });
        // Refresh users list
        fetchUsers();
        onClose();
      } else {
        toast({
          title: "ભૂલ",
          description: data.message || "યુઝરને નિષ્ક્રિય કરવામાં નિષ્ફળ",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top"
        });
      }
    } catch (err) {
      toast({
        title: "ભૂલ",
        description: "સર્વર સાથે કનેક્ટ થવામાં નિષ્ફળ",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top"
      });
    }
  };

  // Export to CSV
  // const handleExportCSV = () => {
  //   const headers = [
  //     "નામ",
  //     "ઇમેઇલ",
  //     "મોબાઇલ",
  //     "યુઝરનેમ",
  //     "ભૂમિકા",
  //     "પિન કોડ",
  //     "તાલુકો",
  //     "પંજીકરણ તારીખ"
  //   ];

  //   const rows = users.map(user => [
  //     user.name,
  //     user.email,
  //     user.phone,
  //     user.username,
  //     user.role,
  //     user.pinCode,
  //     user.taluko,
  //     new Date(user.createdAt).toLocaleDateString("gu-IN")
  //   ]);

  //   let csv = headers.join(",") + "\n";
  //   rows.forEach(row => {
  //     csv += row.map(cell => `"${cell}"`).join(",") + "\n";
  //   });

  //   const blob = new Blob([csv], { type: "text/csv" });
  //   const url = window.URL.createObjectURL(blob);
  //   const link = document.createElement("a");
  //   link.href = url;
  //   link.download = `users_${new Date().toISOString().split("T")[0]}.csv`;
  //   link.click();
  // };

  // Filter users
  const filteredUsers = (users || []).filter(user => {
    const search = (searchTerm || "").toLowerCase();

    const matchesSearch =
      (user.name || "").toLowerCase().includes(search) ||
      (user.email || "").toLowerCase().includes(search) ||
      (user.username || "").toLowerCase().includes(search) ||
      (user.phone || "").includes(searchTerm);

    const matchesRole =
      filterRole === "all" || user.role === filterRole;

    return matchesSearch && matchesRole;
  });


  return (
    <Box minH="100vh" bg="#f8fafc" p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="start">
          <VStack spacing={2} align="start">
            <Heading size="lg" color="#1e293b">
              વ્યવસ્થાપક પેનલ
            </Heading>
            <Text color="#64748b" fontSize="sm">
              બધા નોંધાયેલા યુઝર્સને મેનેજ કરો
            </Text>
          </VStack>

          <HStack spacing={2}>
            {/* <Button
      size="sm"
      colorScheme="green"
      onClick={handleExportCSV}
      leftIcon={<FaDownload />}
    >
      CSV ડાઉનલોડ કરો
    </Button> */}

            <Button
              size="sm"
              colorScheme="red"
              onClick={handleLogout}
            >
              લોગ આઉટ કરો
            </Button>
          </HStack>
        </HStack>


        <Divider />

        {/* Statistics */}
        <HStack spacing={4}>
          <Box
            bg="white"
            p={4}
            rounded="lg"
            border="1px solid #e2e8f0"
            flex={1}
          >
            <Text fontSize="xs" color="#64748b" fontWeight="600">
              કુલ ઉપયોગકર્તા
            </Text>
            <Heading size="lg" color="#2563eb">
              {users.length}
            </Heading>
          </Box>

          <Box
            bg="white"
            p={4}
            rounded="lg"
            border="1px solid #e2e8f0"
            flex={1}
          >
            <Text fontSize="xs" color="#64748b" fontWeight="600">
              Verified Users
            </Text>
            <Heading size="lg" color="#16a34a">
              {users.filter(u => u.isVerified).length}
            </Heading>
          </Box>

          <Box
            bg="white"
            p={4}
            rounded="lg"
            border="1px solid #e2e8f0"
            flex={1}
          >
            <Text fontSize="xs" color="#64748b" fontWeight="600">
              Clerks
            </Text>
            <Heading size="lg" color="#9333ea">
              {users.filter(u => u.role === "clerk").length}
            </Heading>
          </Box>

          <Box
            bg="white"
            p={4}
            rounded="lg"
            border="1px solid #e2e8f0"
            flex={1}
            cursor="pointer"
            onClick={onPricingOpen}
            _hover={{ shadow: "md", borderColor: "blue.300" }}
          >
            <Text fontSize="xs" color="#64748b" fontWeight="600">
              Settings
            </Text>
            <Heading size="lg" color="#f59e0b">
              Set Pricing
            </Heading>
          </Box>
        </HStack>

        {/* Search & Filter */}
        <Box bg="white" p={4} rounded="lg" border="1px solid #e2e8f0">
          <HStack spacing={4}>
            <FormControl flex={2}>
              <FormLabel fontSize="sm" color="#475569">
                શોધો
              </FormLabel>
              <Input
                placeholder="નામ, ઇમેલ અથવા યુઝરનેમ દ્વારા શોધો..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg="#f8fafc"
                border="1px solid #cbd5e1"
                _focus={{ borderColor: "#2563eb", bg: "white" }}
                fontSize="sm"
              />
            </FormControl>

            {/* <FormControl flex={1}>
      <FormLabel fontSize="sm" color="#475569">
        ભૂમિકા
      </FormLabel>
      <Select
        value={filterRole}
        onChange={(e) => setFilterRole(e.target.value)}
        bg="#f8fafc"
        border="1px solid #cbd5e1"
        _focus={{ borderColor: "#2563eb", bg: "white" }}
        fontSize="sm"
      >
        <option value="all">બધા</option>
        <option value="admin">Admin</option>
        <option value="sarpanch">Sarpanch</option>
        <option value="clerk">Clerk</option>
      </Select>
    </FormControl> */}
          </HStack>
        </Box>

        {/* Users Table */}
        <Box
          bg="white"
          rounded="lg"
          border="1px solid #e2e8f0"
          overflow="auto"
        >
          {loading ? (
            <Flex justify="center" align="center" minH="300px">
              <Spinner color="#2563eb" size="lg" />
            </Flex>
          ) : filteredUsers.length === 0 ? (
            <Box p={8} textAlign="center">
              <Text color="#64748b" fontSize="sm">
                કોઈ યુઝર મળ્યો નથી
              </Text>
            </Box>
          ) : (
            <Table size="sm">
              <Thead bg="#f1f5f9" borderBottom="2px solid #e2e8f0">
                <Tr>
                  <Th fontSize="xs" color="#475569" fontWeight="700">
                    નામ
                  </Th>
                  <Th fontSize="xs" color="#475569" fontWeight="700">
                    ઇમેઇલ
                  </Th>
                  <Th fontSize="xs" color="#475569" fontWeight="700">
                    મોબાઇલ
                  </Th>
                  <Th fontSize="xs" color="#475569" fontWeight="700">
                    યુઝરનેમ
                  </Th>
                  {/* <Th fontSize="xs" color="#475569" fontWeight="700">
            ભૂમિકા
          </Th> */}
                  {/* <Th fontSize="xs" color="#475569" fontWeight="700">
            સ્થિતિ
          </Th> */}
                  <Th fontSize="xs" color="#475569" fontWeight="700">
                    નોંધણી તારીખ
                  </Th>
                  <Th fontSize="xs" color="#475569" fontWeight="700">
                    કાર્યવાહી
                  </Th>
                </Tr>
              </Thead>

              <Tbody>
                {filteredUsers.map((user, idx) => (
                  <Tr key={user._id} borderBottom="1px solid #e2e8f0" _hover={{ bg: "#f8fafc" }}>
                    <Td fontSize="sm" color="#1e293b">
                      {user.name}
                    </Td>
                    <Td fontSize="sm" color="#475569">
                      {user.email}
                    </Td>
                    <Td fontSize="sm" color="#475569">
                      {user.phone}
                    </Td>
                    <Td fontSize="sm" color="#2563eb" fontWeight="600">
                      {user.username}
                    </Td>

                    {/* <Td>
              <Badge
                fontSize="xs"
                colorScheme={
                  user.role === "admin"
                    ? "red"
                    : user.role === "sarpanch"
                    ? "orange"
                    : "purple"
                }
              >
                {user.role}
              </Badge>
            </Td> */}

                    {/* <Td>
              <VStack spacing={1} align="start">
                <Badge
                  fontSize="xs"
                  colorScheme={user.isVerified ? "green" : "yellow"}
                >
                  {user.isVerified ? "ચકાસેલ" : "બાકી"}
                </Badge>
                <Badge
                  fontSize="xs"
                  colorScheme={user.isPaid ? "blue" : "gray"}
                >
                  {user.isPaid ? "એક્ટિવ" : "ઇનએક્ટિવ"}
                </Badge>
              </VStack>
            </Td> */}

                    <Td fontSize="xs" color="#64748b">
                      {new Date(user.createdAt).toLocaleDateString("en-IN")}
                    </Td>

                    <Td>
                      <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="blue"
                        onClick={() => handleViewUser(user)}
                        leftIcon={<FaEye />}
                      >
                        વિગતો
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Box>

      </VStack>

      {/* User Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color="#1e293b">
            વપરાશકર્તા વિગત
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedUser && (
              <VStack spacing={4} align="start">
                <Divider />

                <HStack justify="space-between" width="100%">
                  <Text fontWeight="600" color="#475569" fontSize="sm">
                    નામ:
                  </Text>
                  <Text color="#1e293b">{selectedUser.name}</Text>
                </HStack>

                <HStack justify="space-between" width="100%">
                  <Text fontWeight="600" color="#475569" fontSize="sm">
                    ઇમેઇલ:
                  </Text>
                  <Text color="#1e293b">{selectedUser.email}</Text>
                </HStack>

                <HStack justify="space-between" width="100%">
                  <Text fontWeight="600" color="#475569" fontSize="sm">
                    મોબાઇલ:
                  </Text>
                  <Text color="#1e293b">{selectedUser.phone}</Text>
                </HStack>

                <HStack justify="space-between" width="100%">
                  <Text fontWeight="600" color="#475569" fontSize="sm">
                    યુઝરનેમ:
                  </Text>
                  <Text color="#2563eb" fontWeight="600">{selectedUser.username}</Text>
                </HStack>

                {/* <HStack justify="space-between" width="100%">
            <Text fontWeight="600" color="#475569" fontSize="sm">
              ભૂમિકા:
            </Text>
            <Badge
              colorScheme={
                selectedUser.role === "admin"
                  ? "red"
                  : selectedUser.role === "sarpanch"
                  ? "orange"
                  : "purple"
              }
            >
              {selectedUser.role}
            </Badge>
          </HStack> */}




                <HStack justify="space-between" width="100%">
                  <Text fontWeight="600" color="#475569" fontSize="sm">
                    ગામ :
                  </Text>
                  <Text color="#1e293b">{selectedUser.gam}</Text>
                </HStack>

                <HStack justify="space-between" width="100%">
                  <Text fontWeight="600" color="#475569" fontSize="sm">
                    તાલુકો:
                  </Text>
                  <Text color="#1e293b">{selectedUser.taluko}</Text>
                </HStack>


                <HStack justify="space-between" width="100%">
                  <Text fontWeight="600" color="#475569" fontSize="sm">
                    જિલ્લો  :
                  </Text>
                  <Text color="#1e293b">{selectedUser.jillo}</Text>
                </HStack>

                <HStack justify="space-between" width="100%">
                  <Text fontWeight="600" color="#475569" fontSize="sm">
                    પિન કોડ:
                  </Text>
                  <Text color="#1e293b">{selectedUser.pinCode}</Text>
                </HStack>



                <HStack justify="space-between" width="100%">
                  <Text fontWeight="600" color="#475569" fontSize="sm">
                    જન્મ તારીખ:
                  </Text>
                  <Text color="#1e293b">{selectedUser.dob || "આપેલ નથી"}</Text>
                </HStack>

                <HStack justify="space-between" width="100%">
                  <Text fontWeight="600" color="#475569" fontSize="sm">
                    નોંધણી તારીખ:
                  </Text>
                  <Text color="#1e293b">
                    {new Date(selectedUser.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </Text>
                </HStack>

                {/* <HStack justify="space-between" width="100%">
            <Text fontWeight="600" color="#475569" fontSize="sm">
              ચકાસેલ:
            </Text>
            <Badge colorScheme={selectedUser.isVerified ? "green" : "yellow"}>
              {selectedUser.isVerified ? "હા" : "ના"}
            </Badge>
          </HStack> */}

                {/* <HStack justify="space-between" width="100%">
            <Text fontWeight="600" color="#475569" fontSize="sm">
              પેઇડ:
            </Text>
            <Badge colorScheme={selectedUser.isPaid ? "green" : "yellow"}>
              {selectedUser.isPaid ? "હા" : "ના"}
            </Badge>
          </HStack> */}

                <Divider />

                {shouldShowVerification(selectedUser) && (
                  <VStack spacing={3} align="start" width="100%">
                    <HStack justify="space-between" width="100%">
                      <Text fontWeight="600" color="#475569" fontSize="sm">પેમેન્ટ વેરીફાઈડ:</Text>
                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          colorScheme={isPaymentVerified === true ? "green" : "gray"}
                          variant={isPaymentVerified === true ? "solid" : "outline"}
                          onClick={() => {
                            setIsPaymentVerified(true);
                            setPaymentReason("");
                          }}
                        >
                          હા
                        </Button>
                        <Button
                          size="sm"
                          colorScheme={isPaymentVerified === false ? "red" : "gray"}
                          variant={isPaymentVerified === false ? "solid" : "outline"}
                          onClick={() => setIsPaymentVerified(false)}
                        >
                          ના
                        </Button>
                      </HStack>
                    </HStack>

                    {/* Reason field if NO is clicked */}
                    {isPaymentVerified === false && (
                      <VStack align="stretch" width="100%" spacing={2}>
                        <FormControl>
                          <FormLabel fontSize="sm" color="#475569">કારણ:</FormLabel>
                          <Input
                            placeholder="કારણ લખો..."
                            size="sm"
                            value={paymentReason}
                            onChange={(e) => setPaymentReason(e.target.value)}
                          />
                        </FormControl>
                        <Button size="sm" colorScheme="blue" onClick={handleSubmitReason}>
                          સબમિટ
                        </Button>
                      </VStack>
                    )}
                    <Divider my={2} />
                  </VStack>
                )}

                {/* Module toggles - Shown by default for active users OR after verification for expired users */}
                {(!shouldShowVerification(selectedUser) || isPaymentVerified === true) && (
                  <VStack spacing={3} align="start" width="100%">
                    <Text fontWeight="600" color="#475569" fontSize="sm">મોડ્યુલ અનુમતિ</Text>

                    <HStack justify="space-between" width="100%">
                      <Text>પેઢીનામું</Text>
                      <Switch size="md" colorScheme="teal" isChecked={selectedUserModules.pedhinamu} onChange={(e) => handleToggleModule('pedhinamu', e.target.checked)} />
                    </HStack>

                    <HStack justify="space-between" width="100%">
                      <Text>રોજમેળ</Text>
                      <Switch size="md" colorScheme="teal" isChecked={selectedUserModules.rojmel} onChange={(e) => handleToggleModule('rojmel', e.target.checked)} />
                    </HStack>

                    <HStack justify="space-between" width="100%">
                      <Text>જમીન મહેસુલ</Text>
                      <Switch size="md" colorScheme="teal" isChecked={selectedUserModules.jaminMehsul} onChange={(e) => handleToggleModule('jaminMehsul', e.target.checked)} />
                    </HStack>

                    <HStack justify="space-between" width="100%">
                      <Text>પેઢીનામું પ્રિન્ટ </Text>
                      <Switch size="md" colorScheme="teal" isChecked={selectedUserPedhinamuPrint} onChange={(e) => handleTogglePedhinamuPrint(e.target.checked)} />
                    </HStack>

                    <Button
                      colorScheme="green"
                      width="100%"
                      mt={4}
                      onClick={handleSaveVerification}
                      isLoading={loading}
                    >
                      પૂર્ણ
                    </Button>
                  </VStack>
                )}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Pricing Modal */}
      <Modal isOpen={isPricingOpen} onClose={onPricingClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>મોડ્યુલ કિંમત સેટ કરો</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>પેઢીનામું</FormLabel>
                <Input
                  type="number"
                  value={pricing.pedhinamu}
                  onChange={(e) => setPricing({ ...pricing, pedhinamu: e.target.value })}
                  min={1}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>રોજમેળ</FormLabel>
                <Input
                  type="number"
                  value={pricing.rojmel}
                  onChange={(e) => setPricing({ ...pricing, rojmel: e.target.value })}
                  min={1}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>જમીન મહેસુલ</FormLabel>
                <Input
                  type="number"
                  value={pricing.jaminMehsul}
                  onChange={(e) => setPricing({ ...pricing, jaminMehsul: e.target.value })}
                  min={1}
                />
              </FormControl>
              <Button colorScheme="blue" width="100%" onClick={handleUpdatePricing}>
                સેવ કરો
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
