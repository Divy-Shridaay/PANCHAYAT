import {
    Box,
    Button,
    VStack,
    HStack,
    Text,
    Flex,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Heading,
    Spinner,
    useToast,
    Divider,
} from "@chakra-ui/react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { useEffect, useState, useRef } from "react";
import { useApiFetch } from "../../utils/api";

export default function InvoiceDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();
    const apiFetch = useApiFetch();
    const [loading, setLoading] = useState(true);
    const [invoice, setInvoice] = useState(null);
    const printRef = useRef();

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const { response, data } = await apiFetch(`/api/register/user/invoices`);
                if (response.ok) {
                    const found = data.invoices.find((inv) => inv._id === id);
                    if (found) {
                        setInvoice(found);
                    } else {
                        toast({ title: "ભૂલ", description: "ઇનવોઇસ મળ્યું નથી", status: "error" });
                        navigate("/settings/invoices");
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoice();
    }, [id]);


    if (loading) return (
        <Box p={10} display="flex" justifyContent="center" alignItems="center" minH="100vh">
            <Spinner size="xl" color="green.500" />
        </Box>
    );

    if (!invoice) return null;

    return (
        <Box bg="gray.100" minH="100vh" p={{ base: 2, md: 10 }}>
            {/* Action Bar - Hidden during print */}
            <Flex className="no-print" justify="space-between" align="center" mb={6} maxW="800px" mx="auto">
                <Button leftIcon={<FiArrowLeft />} colorScheme="green" variant="outline" onClick={() => navigate("/settings/invoices")}>
                    પાછા જાવ
                </Button>
            </Flex>

            {/* Invoice Container for Preview */}
            <Box
                className="invoice-container"
                bg="white"
                w="100%"
                maxW="800px"
                mx="auto"
                p={8}
                pt={10}
                pb={16}
                minH="1050px"
                shadow="xl"
                position="relative"
                overflow="hidden"
            >

                {/* Logo positioned within diagonal */}
                <Box
                    position="absolute"
                    top="0"
                    right="0"
                    zIndex={2}
                >
                    <img
                        src="/invoice/shridaay_logo.png"
                        alt="Shridaay Logo"
                        style={{ height: "85px", width: "auto" }}
                    />
                </Box>

                {/* INVOICE Title */}
                <Heading fontSize="27px" fontWeight="800" color="gray.800" mt="-5px" mb="10px" position="relative" zIndex={1}>
                    INVOICE
                </Heading>

                {/* Dark Teal Bar with Diagonal Cut */}
                <Box
                    w="51%"
                    h="30px"
                    bg="#0D3B4C"
                    position="absolute"
                    right="0"
                    top="95px"
                    zIndex={1}
                    style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 10% 100%)" }}
                />

                {/* Billing Details Section */}
                <Flex justify="space-between" align="start" mb={8} mt="55px" position="relative" zIndex={1}>
                    <VStack align="start" spacing={1}>
                        <Text fontWeight="700" fontSize="18px" color="gray.800" mb={1}>Billing to</Text>
                        <Text fontSize="16px" fontWeight="600">સરપંચ શ્રી,</Text>
                        <Text fontSize="16px">{invoice.billingDetails?.village || ""} ગ્રામ પંચાયત</Text>
                    </VStack>

                    <VStack align="end" spacing={1}>
                        <Text fontSize="14px" mt="10px" mb={4} textAlign="right" w="full">Date:- {new Date(invoice.paymentDate).toLocaleDateString("en-GB")}</Text>
                        <VStack align="start" spacing={0.5}>
                            <Heading fontSize="22px" color="gray.800" fontWeight="800" mb={1}>Shridaay</Heading>
                            <Text fontSize="14px">Address:- 812, SATYAMEV EMINENCE</Text>
                            <Text fontSize="14px">Sola, Ahmedabad, Gujarat 380060</Text>
                            <Text fontSize="14px">Email:- it@shridaay.com</Text>
                            <Text fontSize="14px" fontWeight="600">Invoice Number:- {invoice.invoiceNumber}</Text>
                        </VStack>
                    </VStack>
                </Flex>




                {/* Items Table */}
                <Box border="1px solid #2c7a7b" mb={0} overflow="hidden">
                    <Table variant="simple" size="sm">
                        <Thead bg="#287273ff">
                            <Tr>
                                <Th color="white" borderRight="1px solid #2c7a7b" fontSize="14px" py={3}>Sr No</Th>
                                <Th color="white" borderRight="1px solid #2c7a7b" fontSize="14px" py={3}>Module</Th>
                                <Th color="white" borderRight="1px solid #2c7a7b" fontSize="14px" py={3} textAlign="center">Date of Service</Th>
                                <Th color="white" borderRight="1px solid #2c7a7b" fontSize="14px" py={3} textAlign="center">Quantity</Th>
                                <Th color="white" borderRight="1px solid #2c7a7b" fontSize="14px" py={3} textAlign="center">Price</Th>
                                <Th color="white" fontSize="14px" py={3} textAlign="center">Total</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {invoice.items && invoice.items.map((item, idx) => (
                                <Tr key={idx}>
                                    <Td borderRight="1px solid #2c7a7b" borderBottom="1px solid #2c7a7b" textAlign="center" fontSize="14px">{String(item.srNo).padStart(2, '0')}</Td>
                                    <Td borderRight="1px solid #2c7a7b" borderBottom="1px solid #2c7a7b" py={5} px={4} fontWeight="600" fontSize="14px">
                                        {item.moduleName}
                                    </Td>
                                    <Td borderRight="1px solid #2c7a7b" borderBottom="1px solid #2c7a7b" textAlign="center" fontSize="14px">{new Date(item.serviceDate || Date.now()).toLocaleDateString("en-GB")}</Td>
                                    <Td borderRight="1px solid #2c7a7b" borderBottom="1px solid #2c7a7b" textAlign="center" fontSize="14px">{item.quantity || 1}</Td>
                                    <Td borderRight="1px solid #2c7a7b" borderBottom="1px solid #2c7a7b" textAlign="center" fontSize="14px">₹{item.price}</Td>
                                    <Td borderBottom="1px solid #2c7a7b" textAlign="center" fontSize="14px" fontWeight="600">₹{item.total}</Td>
                                </Tr>
                            ))}
                            {/* Padding Rows */}
                            {[...Array(Math.max(0, 5 - (invoice.items?.length || 0)))].map((_, i) => (
                                <Tr key={`pad-${i}`} height="35px">
                                    <Td borderRight="1px solid #2c7a7b" borderBottom="1px solid #2c7a7b"></Td>
                                    <Td borderRight="1px solid #2c7a7b" borderBottom="1px solid #2c7a7b"></Td>
                                    <Td borderRight="1px solid #2c7a7b" borderBottom="1px solid #2c7a7b"></Td>
                                    <Td borderRight="1px solid #2c7a7b" borderBottom="1px solid #2c7a7b"></Td>
                                    <Td borderRight="1px solid #2c7a7b" borderBottom="1px solid #2c7a7b"></Td>
                                    <Td borderBottom="1px solid #2c7a7b"></Td>
                                </Tr>
                            ))}
                            {/* Totals Rows integrated into table */}
                            <Tr>
                                <Td colSpan={4} borderRight="1px solid #2c7a7b" borderBottom="1px solid #2c7a7b"></Td>
                                <Td borderRight="1px solid #2c7a7b" borderBottom="1px solid #2c7a7b" textAlign="center" fontSize="14px" fontWeight="500">Subtotal</Td>
                                <Td borderBottom="1px solid #2c7a7b" textAlign="center" fontSize="14px" fontWeight="600">₹{invoice.subtotal}</Td>
                            </Tr>
                            <Tr>
                                <Td colSpan={4} borderRight="1px solid #2c7a7b" borderBottom="1px solid #2c7a7b"></Td>
                                <Td borderRight="1px solid #2c7a7b" borderBottom="1px solid #2c7a7b" textAlign="center" fontSize="14px" fontWeight="500">GST</Td>
                                <Td borderBottom="1px solid #2c7a7b" textAlign="center" fontSize="14px" fontWeight="600">₹{invoice.gst || 0}</Td>
                            </Tr>
                            <Tr bg="#f7f7f7">
                                <Td colSpan={4} borderRight="1px solid #2c7a7b"></Td>
                                <Td borderRight="1px solid #2c7a7b" textAlign="center" fontSize="14px" fontWeight="700">Total</Td>
                                <Td textAlign="center" fontSize="14px" fontWeight="700">₹{invoice.totalAmount}</Td>
                            </Tr>
                        </Tbody>
                    </Table>
                </Box>


                {/* Notes */}
                <Box mt={10}>
                    <Text fontWeight="700" fontSize="19px" mb={2}>Notes & Disclaimers</Text>
                    <VStack align="start" spacing={2} width="full">
                        <Flex align="start" width="full">
                            <Text fontSize="15px" color="gray.600" mr={2}>•</Text>
                            <Text fontSize="15px" color="gray.600" flex={1}>
                                Please submit payment by the due date to avoid late fees. For insurance claims, Contact our billing department at it@shridaay.com or questions or payment arrangements.
                            </Text>
                        </Flex>
                        <Flex align="start" width="full">
                            <Text fontSize="15px" color="gray.600" mr={2}>•</Text>
                            <Text fontSize="15px" color="gray.600" flex={1}>
                                Thank you for choosing Shridaay
                            </Text>
                        </Flex>
                    </VStack>
                </Box>

                {/* Footer Bar */}
                <Box
                    position="absolute"
                    bottom="0"
                    left="0"
                    right="0"
                    bg="#0D3B4C"
                    py={2}
                    textAlign="center"
                >
                    <Text color="white" fontSize="xs" fontWeight="600">
                        Please Remet To:- Shridaay, 812 Satyamev Eminence, Sola, Ahmedabad, Gujarat 380060
                    </Text>
                </Box>
            </Box>
        </Box>
    );
}
