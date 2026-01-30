import {
    Box,
    Heading,
    VStack,
    Text,
    Button,
    Flex,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Spinner,
    useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiEye, FiDownload } from "react-icons/fi";
import { useEffect, useState } from "react";
import { useApiFetch } from "../../utils/api";

export default function Invoices() {
    const navigate = useNavigate();
    const toast = useToast();
    const apiFetch = useApiFetch();
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState([]);

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const { response, data } = await apiFetch("/api/register/user/invoices");
                if (response.ok) {
                    setInvoices(data.invoices);
                } else {
                    toast({
                        title: "ભૂલ",
                        description: "ઇનવોઇસ લોડ કરવામાં નિષ્ફળ",
                        status: "error",
                        duration: 3000,
                        isClosable: true,
                        position: "top",
                    });
                }
            } catch (err) {
                console.error("Failed to fetch invoices", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoices();
    }, []);

    const handleDownload = async (invoice) => {
        try {
            const response = await fetch("/invoice/invoice.html");
            let html = await response.text();

            // Prepare Items HTML
            const itemsHtml = invoice.items.map((item, idx) => `
                <tr>
                    <td>${String(item.srNo).padStart(2, '0')}</td>
                    <td class="module-cell">${item.moduleName}</td>
                    <td>${new Date(item.serviceDate || Date.now()).toLocaleDateString("en-GB")}</td>
                    <td>${item.quantity || 1}</td>
                    <td>₹${item.price}</td>
                    <td class="total-row-amount">₹${item.total}</td>
                </tr>
            `).join("");

            // Add empty rows if needed
            const emptyRowsCount = Math.max(0, 5 - invoice.items.length);
            const emptyRows = Array(emptyRowsCount).fill(`
                <tr style="height: 40px;">
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
            `).join("");

            const totalsHtml = `
                <tr>
                    <td colspan="4" style="border-bottom: none;"></td>
                    <td class="total-row-label">Subtotal</td>
                    <td class="total-row-amount">₹${invoice.subtotal}</td>
                </tr>
                <tr>
                    <td colspan="4" style="border-bottom: none;"></td>
                    <td class="total-row-label">GST</td>
                    <td class="total-row-amount">₹${invoice.gst || 0}</td>
                </tr>
                <tr class="grand-total-row">
                    <td colspan="4"></td>
                    <td class="total-row-label grand-total-label">Total</td>
                    <td class="total-row-amount grand-total-amount">₹${invoice.totalAmount}</td>
                </tr>
            `;

            // Replace Placeholders
            const replacements = {
                village: invoice.billingDetails?.village || "",
                district: invoice.billingDetails?.district || "",
                userEmail: invoice.user?.email || "",
                paymentDate: new Date(invoice.paymentDate).toLocaleDateString("en-GB"),
                invoiceNumber: invoice.invoiceNumber,
                itemsHtml: itemsHtml + emptyRows + totalsHtml,
                subtotal: invoice.subtotal,
                gst: invoice.gst || 0,
                totalAmount: invoice.totalAmount
            };

            Object.entries(replacements).forEach(([key, value]) => {
                html = html.replace(new RegExp(`{{${key}}}`, "g"), value);
            });

            let printFrame = document.getElementById('invoice-print-frame');
            if (!printFrame) {
                printFrame = document.createElement('iframe');
                printFrame.id = 'invoice-print-frame';
                printFrame.style.display = 'none';
                document.body.appendChild(printFrame);
            }

            const frameDoc = printFrame.contentWindow.document;
            frameDoc.open();
            frameDoc.write(html);
            frameDoc.close();

            printFrame.contentWindow.onload = () => {
                setTimeout(() => {
                    printFrame.contentWindow.print();
                }, 500);
            };
        } catch (err) {
            console.error("Print failed", err);
            toast({
                title: "ભૂલ",
                description: "ડાઉનલોડ કરવામાં ભૂલ આવી",
                status: "error",
            });
        }
    };

    if (loading) {
        return (
            <Box p={10} display="flex" justifyContent="center" alignItems="center" minH="100vh">
                <Spinner size="xl" color="green.500" />
            </Box>
        );
    }

    return (
        <Box bg="white" minH="100vh" p={10}>
            <Flex align="center" mb={10}>
                <Button
                    leftIcon={<FiArrowLeft />}
                    colorScheme="green"
                    variant="outline"
                    onClick={() => navigate("/settings")}
                >
                    પાછા જાવ
                </Button>

                <Heading flex="1" textAlign="center" size="xl" color="green.800" fontWeight="700">
                    ઇનવોઇસ
                </Heading>
                <Box width="120px" />
            </Flex>

            <Box bg="white" rounded="2xl" shadow="md" border="1px solid #E3EDE8" overflow="hidden">
                {invoices.length === 0 ? (
                    <Box p={10} textAlign="center">
                        <Text color="gray.500" fontSize="lg">
                            કોઈ ઇનવોઇસ મળ્યા નથી.
                        </Text>
                    </Box>
                ) : (
                    <Table variant="simple">
                        <Thead bg="gray.50">
                            <Tr>
                                <Th color="green.800">ઇનવોઇસ નંબર</Th>
                                <Th color="green.800">તારીખ</Th>
                                <Th color="green.800" isNumeric>કુલ રકમ</Th>
                                <Th color="green.800" textAlign="center">ક્રિયાઓ</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {invoices.map((invoice) => (
                                <Tr key={invoice._id}>
                                    <Td fontWeight="600">{invoice.invoiceNumber}</Td>
                                    <Td>{new Date(invoice.paymentDate).toLocaleDateString("en-IN")}</Td>
                                    <Td isNumeric>₹{invoice.totalAmount}</Td>
                                    <Td textAlign="center">
                                        <Flex justify="center" gap={3}>
                                            <Button
                                                size="sm"
                                                icon={<FiEye />}
                                                colorScheme="blue"
                                                variant="ghost"
                                                onClick={() => navigate(`/settings/invoices/${invoice._id}`)}
                                                title="જુઓ"
                                            >
                                                <FiEye size="18" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                icon={<FiDownload />}
                                                colorScheme="green"
                                                variant="ghost"
                                                onClick={() => handleDownload(invoice)}
                                                title="ડાઉનલોડ"
                                            >
                                                <FiDownload size="18" />
                                            </Button>
                                        </Flex>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                )}
            </Box>
        </Box>
    );
}
