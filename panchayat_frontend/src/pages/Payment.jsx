"use client";

import {
    Box,
    Heading,
    Text,
    VStack,
    Container,
    Checkbox,
    Flex,
    Button,
    Divider,
    ButtonGroup,
    Image,
    Input,
    FormControl,
    FormLabel,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    useDisclosure,
    useToast,
    Spinner,
    ModalCloseButton,
} from "@chakra-ui/react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { FiArrowLeft, FiUpload, FiCheckCircle } from "react-icons/fi";
import upiQR from "../assets/upi-qr.png";
import { apiFetch } from "../utils/api.js";

export default function Payment() {
    const navigate = useNavigate();
    const toast = useToast();
    const fileInputRef = useRef(null);
    const [step, setStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState("BANK"); // "BANK" or "UPI"
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedModules, setSelectedModules] = useState({
        pedhinamu: true,
        rojmel: true,
        jaminMehsul: true,
    });
    const [gstNumber, setGstNumber] = useState("");
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const validateGst = (gst) => {
        const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        return gstRegex.test(gst);
    };

    const isGstValid = gstNumber.trim() !== "" ? validateGst(gstNumber.trim()) : true;
    const showGstError = gstNumber.trim() !== "" && !isGstValid;

    const [modules, setModules] = useState([
        {
            id: "pedhinamu",
            title: "પેઢીનામું",
            description: "પેઢીનામા સંબંધિત વ્યક્તિઓ અને તેમના સંબંધોની માહિતી ધરાવતું મોડ્યુલ.",
            price: 1,
        },
        {
            id: "rojmel",
            title: "રોજમેળ",
            description: "દૈનિક આવક, ખર્ચ અને અન્ય નાણાકીય લેવડ-દેવડની વિગતો માટેનું મોડ્યુલ.",
            price: 1,
        },
        {
            id: "jaminMehsul",
            title: "જમીન મહેસુલ જમાબંધી હિસાબો",
            description: "જમીન અને મકાન સંબંધિત વ્યવહારોની માહિતી માટેનું મોડ્યુલ.",
            price: 1,
        },
    ]);

    const fetchUserStatusAndPricing = async () => {
        try {
            // Fetch Pricing
            const { response: priceRes, data: priceData } = await apiFetch("/api/settings/pricing", {}, navigate, toast);
            if (priceRes.ok) {
                const pricing = priceData.pricing;
                setModules(prev => prev.map(mod => ({
                    ...mod,
                    price: pricing[mod.id] || mod.price
                })));
            }

            // Fetch User Status to filter and default checkboxes
            const { response: statusRes, data: statusData } = await apiFetch("/api/register/user/status", {}, navigate, toast);
            if (statusRes.ok) {
                const user = statusData;

                // Filter modules: Show only if NOT active AND NOT pending
                setModules(prev => prev.filter(mod => {
                    const hasAccess = user.modulesAccess?.[mod.id];
                    const isPending = user.pendingModules?.[mod.id];
                    return !hasAccess && !isPending;
                }));

                // Only default to TRUE if they DON'T have access AND they AREN'T pending verification for it
                setSelectedModules({
                    pedhinamu: !user.modulesAccess?.pedhinamu && !user.pendingModules?.pedhinamu,
                    rojmel: !user.modulesAccess?.rojmel && !user.pendingModules?.rojmel,
                    jaminMehsul: !user.modulesAccess?.jaminMehsul && !user.pendingModules?.jaminMehsul,
                });
            }
        } catch (err) {
            console.error("Error fetching user status/pricing:", err);
        }
    };

    useEffect(() => {
        fetchUserStatusAndPricing();
    }, []);

    const handleToggle = (id) => {
        setSelectedModules((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const calculateBaseSubtotal = () => {
        return modules.reduce((total, mod) => {
            return total + (selectedModules[mod.id] ? mod.price : 0);
        }, 0);
    };

    const baseAmount = calculateBaseSubtotal();
    const gstAmount = (gstNumber.trim() !== "" && isGstValid) ? Number((baseAmount * 0.18).toFixed(2)) : 0;
    const totalAmount = Number((baseAmount + gstAmount).toFixed(2));

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleBack = () => {
        if (step === 2) {
            setStep(1);
        } else {
            navigate("/dashboard");
        }
    };

    const handleSubmit = async () => {
        setSubmitError("");
        if (gstNumber.trim() !== "" && !isGstValid) {
            setSubmitError("કૃપા કરીને માન્ય GST નંબર દાખલ કરો અથવા તેને કાઢી નાખો.");
            return;
        }
        setIsSubmitting(true);

        try {
            // Logic for submission (Legacy console log)
            console.log("Submitting payment...", {
                modules: selectedModules,
                baseAmount: baseAmount,
                gstNumber: gstNumber,
                gstAmount: gstAmount,
                totalAmount: totalAmount,
                method: paymentMethod,
                screenshot: selectedFile
            });

            // Create FormData to handle file upload
            const formData = new FormData();
            formData.append("modules", JSON.stringify(selectedModules));
            formData.append("baseAmount", baseAmount);
            formData.append("gstNumber", gstNumber);
            formData.append("gstAmount", gstAmount);
            formData.append("totalAmount", totalAmount);
            formData.append("paymentMethod", paymentMethod);
            formData.append("screenshot", selectedFile);

            // Get token from localStorage
            const token = localStorage.getItem("token");
            if (!token) {
                setSubmitError("લૉગિન ટોકન મળ્યો નથી. કૃપા કરીને ફરીથી લૉગિન કરો.");
                setIsSubmitting(false);
                return;
            }

            // Get API URL from environment or use default
            const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

            // 1. Submit payment details and file
            const paymentResponse = await fetch(`${apiUrl}/api/payment/submit`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: formData
            });

            const paymentData = await paymentResponse.json();

            if (!paymentResponse.ok) {
                throw new Error(paymentData.message || "ચુકવણી સબમિટ કરવામાં ભૂલ આવી");
            }

            // 2. Call backend to set pending verification status (Legacy functionality)
            const { response: verificationResponse, data: verificationData } = await apiFetch("/api/register/user/set-pending-verification", {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            }, navigate, toast);

            if (!verificationResponse.ok) {
                throw new Error(verificationData.message || "વિનંતી સબમિટ કરવામાં નિષ્ફળ");
            }

            // Store payment submission info
            const username = localStorage.getItem("username");
            if (username) {
                localStorage.setItem(`paymentPendingVerification_${username}`, "true");
                localStorage.setItem(`paymentSubmissionTime_${username}`, new Date().toISOString());
            }

            // Show success modal
            onOpen();
        } catch (error) {
            console.error("Payment submission error:", error);
            setSubmitError(error.message || "ચુકવણી સબમિટ કરવામાં ભૂલ આવી");

            toast({
                title: "ભૂલ",
                description: error.message || "સર્વર ભૂલ",
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "top"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleModalClose = () => {
        onClose();
        navigate("/dashboard");
    };

    return (
        <Box bg="#F8FAF9" minH="100vh" py={10}>
            <Container maxW="full" px={8}>
                <VStack spacing={6} align="stretch" maxW="800px" mx="auto">
                    {/* Back Button */}
                    <Flex>
                        <Button
                            leftIcon={<FiArrowLeft />}
                            variant="outline"
                            colorScheme="green"
                            onClick={handleBack}
                            size="md"
                            borderRadius="md"
                            bg="white"
                            px={6}
                            _hover={{ bg: "green.50" }}
                            color="#2A7F62"
                            borderColor="#2A7F62"
                        >
                            પાછા જાવ
                        </Button>
                    </Flex>

                    {/* Header */}
                    <Box bg="white" p={6} rounded="2xl" shadow="sm" border="1px solid #E3EDE8" textAlign="center">
                        <Heading size="lg" color="#1E4D2B">પેમેન્ટ પ્રક્રિયા</Heading>
                        <Text color="gray.500" mt={2}>
                            {step === 1
                                ? `પગલું 1 of 2: મોડ્યુલ પસંદગી`
                                : `પગલું 2 of 2: ચુકવણીની પદ્ધતિ`
                            }
                        </Text>
                    </Box>

                    {step === 1 ? (
                        <>
                            {/* Module Selection Section */}
                            {modules.length === 0 ? (
                                <Box bg="white" p={10} rounded="2xl" shadow="md" textAlign="center" border="1px solid #E3EDE8">
                                    <Text fontSize="xl" fontWeight="bold" color="green.700" mb={4}>
                                        બધા મોડ્યુલ્સ હાલમાં સક્રિય છે અથવા ચકાસણી હેઠળ છે.
                                    </Text>
                                    <Text color="gray.600" mb={8}>
                                        તમે પહેલેથી જ બધા ઉપલબ્ધ મોડ્યુલ્સ ખરીદ્યા છે અથવા તમારી તાજેતરની ચુકવણી ચકાસણી હેઠળ છે.
                                    </Text>
                                    <Button colorScheme="green" size="lg" rounded="xl" onClick={() => navigate("/dashboard")}>
                                        ડેશબોર્ડ પર પાછા જાઓ
                                    </Button>
                                </Box>
                            ) : (
                                <>
                                    <VStack spacing={4} align="stretch" w="full">
                                        {modules.map((mod) => (
                                            <Box
                                                key={mod.id}
                                                p={6}
                                                bg={selectedModules[mod.id] ? "green.50" : "white"}
                                                border="2px solid"
                                                borderColor={selectedModules[mod.id] ? "#2A7F62" : "#E3EDE8"}
                                                rounded="2xl"
                                                cursor="pointer"
                                                onClick={() => handleToggle(mod.id)}
                                                position="relative"
                                                shadow={selectedModules[mod.id] ? "md" : "sm"}
                                                _hover={{ borderColor: "#2A7F62", transform: "translateY(-2px)" }}
                                                transition="0.2s"
                                            >
                                                {/* Checkbox in top left */}
                                                <Box position="absolute" top={4} left={4}>
                                                    <Checkbox
                                                        colorScheme="green"
                                                        size="lg"
                                                        isChecked={selectedModules[mod.id]}
                                                        onChange={(e) => {
                                                            e.stopPropagation();
                                                            handleToggle(mod.id);
                                                        }}
                                                    />
                                                </Box>

                                                <Flex justify="space-between" align="center" pl={10}>
                                                    <VStack align="start" spacing={1}>
                                                        <Text fontSize="xl" fontWeight="700" color="#1E4D2B">
                                                            {mod.title}
                                                        </Text>
                                                        <Text fontSize="sm" color="gray.600">
                                                            {mod.description}
                                                        </Text>
                                                    </VStack>
                                                    <Text fontSize="lg" fontWeight="bold" color="green.600">
                                                        ₹{mod.price}
                                                    </Text>
                                                </Flex>
                                            </Box>
                                        ))}
                                    </VStack>

                                    {/* Total Section */}
                                    <Box bg="white" p={6} rounded="2xl" shadow="md" border="1px solid #E3EDE8">
                                        <Flex justify="space-between" align="center">
                                            <Text fontSize="lg" fontWeight="bold" color="gray.700">કુલ રકમ:</Text>
                                            <Text fontSize="2xl" fontWeight="800" color="green.600">₹{totalAmount}</Text>
                                        </Flex>
                                    </Box>

                                    {/* Note Section */}
                                    <Box bg="white" p={6} rounded="2xl" shadow="md" border="1px solid #E3EDE8">
                                        <Box color="gray.600" fontSize="md">
                                            <Text fontWeight="bold" mb={2} color="red.500" fontSize="lg">નોંધ:</Text>
                                            <Text fontWeight="600" fontSize="md">
                                                આ ચુકવણી 12 મહિનાની માન્યતા ધરાવે છે.
                                            </Text>
                                        </Box>
                                    </Box>

                                    {/* Next Button */}
                                    <Button
                                        colorScheme="green"
                                        size="lg"
                                        py={8}
                                        fontSize="xl"
                                        fontWeight="bold"
                                        rounded="2xl"
                                        shadow="xl"
                                        isDisabled={totalAmount === 0}
                                        onClick={() => setStep(2)}
                                        _hover={{ transform: "translateY(-2px)", shadow: "2xl" }}
                                    >
                                        આગળ વધો
                                    </Button>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            {/* Step 2 Content */}
                            <Box bg="white" p={6} rounded="2xl" shadow="md" border="1px solid #E3EDE8">
                                <VStack spacing={6} align="stretch">
                                    {/* Payment Method Toggle */}
                                    <ButtonGroup isAttached variant="outline" width="100%" size="lg">
                                        <Button
                                            flex="1"
                                            onClick={() => setPaymentMethod("BANK")}
                                            bg={paymentMethod === "BANK" ? "#2A7F62" : "white"}
                                            color={paymentMethod === "BANK" ? "white" : "#2A7F62"}
                                            _hover={{ bg: paymentMethod === "BANK" ? "#1E4D2B" : "green.50" }}
                                            borderColor="#2A7F62"
                                            borderRight="none"
                                        >
                                            બેંક
                                        </Button>
                                        <Button
                                            flex="1"
                                            onClick={() => setPaymentMethod("UPI")}
                                            bg={paymentMethod === "UPI" ? "#2A7F62" : "white"}
                                            color={paymentMethod === "UPI" ? "white" : "#2A7F62"}
                                            _hover={{ bg: paymentMethod === "UPI" ? "#1E4D2B" : "green.50" }}
                                            borderColor="#2A7F62"
                                        >
                                            યુપીઆઈ
                                        </Button>
                                    </ButtonGroup>

                                    {/* Payment Details Area */}
                                    {paymentMethod === "BANK" ? (
                                        <Box bg="green.50" p={8} rounded="xl" border="1px dashed" borderColor="green.300">
                                            <VStack align="start" spacing={4} color="#1E4D2B">
                                                <Text fontWeight="bold" fontSize="2xl">બેંક વિગતો:</Text>
                                                <Divider borderColor="green.200" />
                                                <Flex direction="column" gap={3} fontSize="lg">
                                                    <Text><strong>બેંક:</strong> KOTAK MAHINDRA BANK</Text>
                                                    <Text><strong>ખાતાનું નામ:</strong> SHRIDAAY TECHNOLABS</Text>
                                                    <Text><strong>ખાતા નંબર:</strong> 4350936392</Text>
                                                    <Text><strong>IFSC કોડ:</strong> KKBK0002576</Text>
                                                    <Text><strong>શાખા:</strong> Ahmedabad Sola Road</Text>
                                                    <Text><strong>શાખા સરનામું:</strong> Satyasurya Complex, A- Block, Satadhar, Sola Road, Ahmedabad - 380061, Gujarat, INDIA.</Text>
                                                </Flex>
                                            </VStack>
                                        </Box>
                                    ) : (
                                        <Box textAlign="center" py={6}>
                                            <Text fontWeight="bold" mb={4} color="#1E4D2B" fontSize="xl">ચુકવણી માટે QR કોડ સ્કેન કરો</Text>
                                            <Box
                                                mx="auto"
                                                boxSize="450px"
                                                bg="white"
                                                border="2px solid"
                                                borderColor="gray.200"
                                                rounded="lg"
                                                p={4}
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="center"
                                                shadow="md"
                                                overflow="hidden"
                                            >
                                                <Image
                                                    src={upiQR}
                                                    alt="UPI QR Code"
                                                    maxW="100%"
                                                    maxH="100%"
                                                    transform="scale(1.1)"
                                                    fallbackSrc="https://via.placeholder.com/450?text=QR+Code"
                                                />
                                            </Box>
                                        </Box>
                                    )}

                                    {/* GST Number Field */}
                                    <FormControl isInvalid={showGstError}>
                                        <FormLabel fontWeight="bold" color="#1E4D2B" fontSize="lg">GST નંબર (જો હોય તો)</FormLabel>
                                        <Input
                                            placeholder="દા.ત. 24AAAAA0000A1Z5"
                                            value={gstNumber}
                                            onChange={(e) => setGstNumber(e.target.value.toUpperCase().trim().slice(0, 15))}
                                            bg="white"
                                            borderColor={showGstError ? "red.500" : "gray.300"}
                                            _focus={{ borderColor: showGstError ? "red.500" : "#2A7F62", boxShadow: showGstError ? "0 0 0 1px red.500" : "0 0 0 1px #2A7F62" }}
                                            size="lg"
                                        />
                                        {showGstError ? (
                                            <Text fontSize="sm" color="red.500" mt={1}>
                                                અમાન્ય GST ફોર્મેટ. કૃપા કરીને યોગ્ય નંબર દાખલ કરો.
                                            </Text>
                                        ) : (
                                            <Text fontSize="xs" color="gray.500" mt={1}>
                                                GST નંબર દાખલ કરવાથી 18% GST આપોઆપ ઉમેરવામાં આવશે.
                                            </Text>
                                        )}
                                    </FormControl>

                                    {/* Price Breakdown in Step 2 */}
                                    <Box py={4} borderTop="1px solid" borderBottom="1px solid" borderColor="gray.100">
                                        <VStack align="stretch" spacing={2}>
                                            {isGstValid && gstNumber.trim() !== "" && (
                                                <>
                                                    <Flex justify="space-between">
                                                        <Text color="gray.600">મોડ્યુલ કિંમત:</Text>
                                                        <Text fontWeight="600">₹{baseAmount}</Text>
                                                    </Flex>
                                                    <Flex justify="space-between">
                                                        <Text color="gray.600">GST (18%):</Text>
                                                        <Text fontWeight="600">₹{gstAmount}</Text>
                                                    </Flex>
                                                    <Divider my={1} />
                                                </>
                                            )}
                                            <Flex justify="space-between" align="center">
                                                <Text fontWeight="bold" fontSize="xl" color="gray.700">કુલ ચુકવવાની રકમ:</Text>
                                                <Text fontWeight="800" fontSize="3xl" color="green.600">₹{totalAmount}</Text>
                                            </Flex>
                                        </VStack>
                                    </Box>

                                    {/* Screenshot Upload Section */}
                                    <FormControl isRequired>
                                        <FormLabel fontWeight="bold" color="#1E4D2B" fontSize="lg">પેમેન્ટનો સ્ક્રીનશોટ અપલોડ કરો</FormLabel>
                                        <Text fontSize="sm" color="gray.500" mb={1}>(સ્ક્રીનશોટ જોડવો ફરજિયાત છે)</Text>
                                        <Text fontSize="sm" color="red.500" fontWeight="500" mb={3}>* સ્ક્રીનશોટ સ્પષ્ટ અને વંચાય તેવો હોવો જોઈએ</Text>

                                        <Input
                                            type="file"
                                            display="none"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept="image/*"
                                        />

                                        <Button
                                            width="100%"
                                            height="150px"
                                            variant="outline"
                                            borderStyle="dashed"
                                            borderWidth="2px"
                                            borderColor={selectedFile ? "green.400" : "gray.300"}
                                            bg={selectedFile ? "green.50" : "gray.50"}
                                            onClick={() => fileInputRef.current?.click()}
                                            _hover={{ bg: selectedFile ? "green.100" : "gray.100" }}
                                        >
                                            <VStack spacing={2}>
                                                {selectedFile ? (
                                                    <>
                                                        <FiCheckCircle size={32} color="#2A7F62" />
                                                        <Text color="#2A7F62" fontWeight="bold" fontSize="xl">સ્ક્રીનશોટ પસંદ થયેલ છે</Text>
                                                        <Text fontSize="sm" color="gray.600">{selectedFile.name}</Text>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FiUpload size={32} color="gray.400" />
                                                        <Text color="gray.500" fontSize="xl">ઈમેજ અપલોડ કરવા માટે અહીં ક્લિક કરો</Text>
                                                    </>
                                                )}
                                            </VStack>
                                        </Button>
                                    </FormControl>
                                </VStack>
                            </Box>

                            {/* Error Message */}
                            {submitError && (
                                <Box bg="red.50" p={4} rounded="lg" border="1px solid" borderColor="red.200">
                                    <Text color="red.700" fontWeight="600">
                                        ⚠️ {submitError}
                                    </Text>
                                </Box>
                            )}

                            {/* Submit Button */}
                            <Button
                                colorScheme="green"
                                size="lg"
                                py={8}
                                fontSize="xl"
                                fontWeight="bold"
                                rounded="2xl"
                                shadow="xl"
                                isDisabled={!selectedFile || isSubmitting || !isGstValid}
                                onClick={handleSubmit}
                                _hover={{ transform: "translateY(-2px)", shadow: "2xl" }}
                            >
                                {isSubmitting ? (
                                    <Flex align="center" gap={2}>
                                        <Spinner size="sm" color="white" />
                                        સબમિટ કરી રહ્યા છીએ...
                                    </Flex>
                                ) : (
                                    "સબમિટ"
                                )}
                            </Button>
                        </>
                    )}
                </VStack>
            </Container>

            {/* Success Modal */}
            <Modal isOpen={isOpen} onClose={handleModalClose} isCentered size="md">
                <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
                <ModalContent rounded="2xl" p={4} border="1px solid" borderColor="green.100">
                    <ModalCloseButton />
                    <ModalHeader textAlign="center" color="#1E4D2B">
                        <VStack spacing={3}>
                            <FiCheckCircle size={50} color="#2A7F62" />
                        </VStack>
                    </ModalHeader>
                    <ModalBody textAlign="center" py={6}>
                        <VStack spacing={4}>
                            <Text fontSize="xl" fontWeight="bold" color="gray.700">
                                ચુકવણી સફળ થઈ ગઈ છે
                            </Text>
                            <Text fontSize="md" color="gray.600" lineHeight="tall">
                                તમારી સબસક્રિપ્સન વિનંતી ચકાસણી માટે મોકલવામાં આવી છે.<br />
                                મંજૂરી પ્રક્રિયામાં 24 થી 48 કલાક લાગી શકે છે.
                            </Text>
                        </VStack>
                    </ModalBody>
                    <ModalFooter justifyContent="center">
                        <Button
                            colorScheme="green"
                            bg="#2A7F62"
                            size="lg"
                            px={12}
                            rounded="full"
                            onClick={handleModalClose}
                            _hover={{ bg: "#1E4D2B", transform: "translateY(-2px)" }}
                            shadow="lg"
                        >
                            ઠીક છે
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}
