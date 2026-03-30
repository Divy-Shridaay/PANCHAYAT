// // // // //salarysheet.jsx
// // // // "use client";

// // // // import React, { useState, useEffect } from 'react';
// // // // import axios from 'axios';
// // // // import {
// // // //     Box, Heading, Text, Button, Flex, Select, Input, Table, Thead, Tbody, Tr, Th, Td,
// // // //     Card, CardBody, SimpleGrid, Badge, useToast, IconButton, Divider,
// // // //     FormControl, FormLabel, Spinner, Stack, HStack, Tooltip, Alert, AlertIcon,
// // // //     Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
// // // //     ModalCloseButton, useDisclosure, Grid, Tfoot
// // // // } from "@chakra-ui/react";
// // // // import { FiArrowLeft, FiPlus, FiSearch, FiSave, FiX, FiCheckCircle, FiEye, FiPrinter, FiDownload, FiRefreshCw } from "react-icons/fi";
// // // // import { useNavigate } from "react-router-dom";
// // // // import Pagination from "../components/Pagination";

// // // // const SalarySheet = () => {
// // // //     const navigate = useNavigate();
// // // //     const toast = useToast();
// // // //     const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
    
// // // //     const [salaries, setSalaries] = useState([]);
// // // //     const [employees, setEmployees] = useState([]);
// // // //     const [parameters, setParameters] = useState([]);
// // // //     const [loading, setLoading] = useState(false);
// // // //     const [saving, setSaving] = useState(false);
// // // //     const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
// // // //     const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
// // // //     const [showForm, setShowForm] = useState(false);
// // // //     const [selectedSalary, setSelectedSalary] = useState(null);
// // // //     const [currentPage, setCurrentPage] = useState(1);
// // // //     const [itemsPerPage, setItemsPerPage] = useState(10);
    
// // // //     const [formData, setFormData] = useState({
// // // //         employeeId: '',
// // // //         basicSalary: '',
// // // //         gradePay: '',
// // // //         da: '',
// // // //         hra: '',
// // // //         ta: '',
// // // //         medical: '',
// // // //         cleaning: '',
// // // //         pf: '',
// // // //         esi: '',
// // // //         professionalTax: '',
// // // //         employeeContribution: '',
// // // //         otherContribution: '',
// // // //         pli: '',
// // // //         cooperativeInstallment: '',
// // // //         remarks: ''
// // // //     });

// // // //     // Get month name in Gujarati
// // // //     const getMonthName = (month) => {
// // // //         const months = ["જાન્યુઆરી", "ફેબ્રુઆરી", "માર્ચ", "એપ્રિલ", "મે", "જૂન",
// // // //             "જુલાઈ", "ઑગસ્ટ", "સપ્ટેમ્બર", "ઑક્ટોબર", "નવેમ્બર", "ડિસેમ્બર"];
// // // //         return months[month - 1] || "";
// // // //     };

// // // //     // Get parameter value by name
// // // //     const getParameterValue = (examName) => {
// // // //         const param = parameters.find(p => p.examName === examName);
// // // //         return param ? parseFloat(param.value) : 0;
// // // //     };

// // // //     // ✅ FIXED: Calculate salary based on parameters from settings
// // // //     const calculateSalary = (basicSalary, gradePay = 0) => {
// // // //         const totalBasic = basicSalary + gradePay;
        
// // // //         // Get parameter values from settings
// // // //         const daPercentage = getParameterValue("પ્રકાર-૧") || 50;
// // // //         const hraAmount = getParameterValue("પ્રકાર-૨") || 0;
// // // //         const taAmount = getParameterValue("પ્રકાર-૩") || 0;
// // // //         const medicalAmount = getParameterValue("પ્રકાર-૪") || 1250;
// // // //         const cleaningAmount = getParameterValue("પ્રકાર-૫") || 0;
// // // //         const pfPercentage = getParameterValue("પી.એફ. વ્યાજ") || 12;
        
// // // //         // ✅ CORRECT: Calculate DA as percentage (divide by 100)
// // // //         const da = totalBasic * (daPercentage / 100);
// // // //         const hra = hraAmount;
// // // //         const ta = taAmount;
// // // //         const medical = medicalAmount;
// // // //         const cleaning = cleaningAmount;
        
// // // //         // Calculate Gross Salary
// // // //         const grossSalary = totalBasic + da + hra + ta + medical + cleaning;
        
// // // //         // Calculate PF and other deductions
// // // //         const pf = totalBasic * (pfPercentage / 100);
// // // //         const esi = totalBasic <= 21000 ? totalBasic * 0.0075 : 0;
// // // //         const professionalTax = totalBasic > 15000 ? 200 : 0;
        
// // // //         return { 
// // // //             totalBasic, 
// // // //             da, 
// // // //             hra, 
// // // //             ta, 
// // // //             medical, 
// // // //             cleaning, 
// // // //             grossSalary, 
// // // //             pf, 
// // // //             esi, 
// // // //             professionalTax,
// // // //             daPercentage, 
// // // //             pfPercentage
// // // //         };
// // // //     };

// // // //     // Fetch all required data
// // // //     useEffect(() => {
// // // //         fetchSalaries();
// // // //         fetchEmployees();
// // // //         fetchParameters();
// // // //     }, [selectedMonth, selectedYear]);

// // // //     const fetchSalaries = async () => {
// // // //         setLoading(true);
// // // //         try {
// // // //             const response = await axios.get(`http://localhost:5000/api/salary?month=${selectedMonth}&year=${selectedYear}`);
// // // //             setSalaries(response.data);
// // // //         } catch (error) {
// // // //             console.error('Error fetching salaries:', error);
// // // //             toast({ title: "ભૂલ", description: "પગાર રેકોર્ડ લોડ કરવામાં નિષ્ફળ", status: "error", duration: 3000 });
// // // //         } finally {
// // // //             setLoading(false);
// // // //         }
// // // //     };

// // // //     const fetchEmployees = async () => {
// // // //         try {
// // // //             const response = await axios.get('http://localhost:5000/api/employee');
// // // //             setEmployees(response.data.filter(emp => emp.isActive !== false));
// // // //         } catch (error) {
// // // //             console.error('Error fetching employees:', error);
// // // //         }
// // // //     };

// // // //     const fetchParameters = async () => {
// // // //         try {
// // // //             const response = await axios.get('http://localhost:5000/api/parameter');
// // // //             setParameters(response.data);
// // // //         } catch (error) {
// // // //             console.error('Error fetching parameters:', error);
// // // //         }
// // // //     };

// // // //     // Auto-calculate when employee is selected
// // // //     const handleEmployeeChange = (employeeId) => {
// // // //         const employee = employees.find(emp => emp._id === employeeId);
// // // //         if (employee) {
// // // //             const basicPay = parseFloat(employee.basicPay) || 0;
// // // //             const gradePay = parseFloat(employee.gradePay) || 0;
// // // //             const calculated = calculateSalary(basicPay, gradePay);
            
// // // //             setFormData({
// // // //                 ...formData,
// // // //                 employeeId: employeeId,
// // // //                 basicSalary: basicPay.toString(),
// // // //                 gradePay: gradePay.toString(),
// // // //                 da: calculated.da.toString(),
// // // //                 hra: calculated.hra.toString(),
// // // //                 ta: calculated.ta.toString(),
// // // //                 medical: calculated.medical.toString(),
// // // //                 cleaning: calculated.cleaning.toString(),
// // // //                 pf: calculated.pf.toString(),
// // // //                 esi: calculated.esi.toString(),
// // // //                 professionalTax: calculated.professionalTax.toString(),
// // // //                 employeeContribution: employee.employeeContribution?.toString() || "0",
// // // //                 otherContribution: employee.otherContribution?.toString() || "0",
// // // //                 pli: employee.pli?.toString() || "0",
// // // //                 cooperativeInstallment: employee.cooperativeInstallment?.toString() || "0"
// // // //             });
// // // //         } else {
// // // //             setFormData({ ...formData, employeeId: employeeId });
// // // //         }
// // // //     };

// // // //     // ✅ FIXED: Generate salary with correct calculations
// // // //     const handleGenerate = async () => {
// // // //         if (!formData.employeeId) {
// // // //             toast({ title: "ચેતવણી", description: "કૃપા કરી કર્મચારી પસંદ કરો", status: "warning", duration: 3000 });
// // // //             return;
// // // //         }
        
// // // //         setSaving(true);
// // // //         try {
// // // //             const basic = parseFloat(formData.basicSalary) || 0;
// // // //             const grade = parseFloat(formData.gradePay) || 0;
            
// // // //             // ✅ Fresh calculation using current parameters
// // // //             const calc = calculateSalary(basic, grade);
            
// // // //             // Get employee details for contributions
// // // //             const employee = employees.find(emp => emp._id === formData.employeeId);
            
// // // //             // Prepare allowances object
// // // //             const allowances = {
// // // //                 da: calc.da,
// // // //                 hra: calc.hra,
// // // //                 ta: calc.ta,
// // // //                 medical: calc.medical,
// // // //                 cleaning: calc.cleaning,
// // // //                 special: 0,
// // // //                 other: 0
// // // //             };
            
// // // //             // Prepare deductions object
// // // //             const deductions = {
// // // //                 pf: calc.pf,
// // // //                 esi: calc.esi,
// // // //                 professionalTax: calc.professionalTax,
// // // //                 employeeContribution: parseFloat(formData.employeeContribution) || 0,
// // // //                 otherContribution: parseFloat(formData.otherContribution) || 0,
// // // //                 pli: parseFloat(formData.pli) || 0,
// // // //                 cooperativeInstallment: parseFloat(formData.cooperativeInstallment) || 0,
// // // //                 tds: 0,
// // // //                 advance: 0,
// // // //                 other: 0
// // // //             };
            
// // // //             // Calculate total deductions and net salary
// // // //             const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + (val || 0), 0);
// // // //             const netSalary = calc.grossSalary - totalDeductions;
            
// // // //             const payload = {
// // // //                 employeeId: formData.employeeId,
// // // //                 month: selectedMonth,
// // // //                 year: selectedYear,
// // // //                 basicSalary: basic,
// // // //                 gradePay: grade,
// // // //                 allowances: allowances,
// // // //                 deductions: deductions,
// // // //                 grossSalary: calc.grossSalary,
// // // //                 netSalary: netSalary,
// // // //                 remarks: formData.remarks || "",
// // // //                 status: 'pending'
// // // //             };
            
// // // //             await axios.post('http://localhost:5000/api/salary/generate', payload);
            
// // // //             toast({ 
// // // //                 title: "સફળ", 
// // // //                 description: `પગાર જનરેટ થયો: ગ્રોસ ₹${formatNumber(calc.grossSalary)}, નેટ ₹${formatNumber(netSalary)}`, 
// // // //                 status: "success", 
// // // //                 duration: 3000 
// // // //             });
            
// // // //             fetchSalaries();
// // // //             setFormData({
// // // //                 employeeId: '', basicSalary: '', gradePay: '', da: '', hra: '', ta: '',
// // // //                 medical: '', cleaning: '', pf: '', esi: '', professionalTax: '',
// // // //                 employeeContribution: '', otherContribution: '', pli: '', cooperativeInstallment: '', remarks: ''
// // // //             });
// // // //             setShowForm(false);
// // // //         } catch (error) {
// // // //             console.error('Error generating salary:', error);
// // // //             toast({ 
// // // //                 title: "ભૂલ", 
// // // //                 description: error.response?.data?.message || "પગાર જનરેટ કરવામાં ભૂલ", 
// // // //                 status: "error", 
// // // //                 duration: 3000 
// // // //             });
// // // //         } finally {
// // // //             setSaving(false);
// // // //         }
// // // //     };

// // // //     const updateSalaryStatus = async (id, status) => {
// // // //         try {
// // // //             await axios.put(`http://localhost:5000/api/salary/${id}/status`, {
// // // //                 status,
// // // //                 paymentDate: new Date(),
// // // //                 paymentMode: 'bank transfer'
// // // //             });
// // // //             toast({ title: "અપડેટ", description: `સ્થિતિ બદલાઈ: ${status === 'paid' ? 'ચૂકવેલ' : 'બાકી'}`, status: "info", duration: 2000 });
// // // //             fetchSalaries();
// // // //         } catch (error) {
// // // //             console.error('Error updating salary status:', error);
// // // //             toast({ title: "ભૂલ", description: "સ્થિતિ અપડેટ કરવામાં નિષ્ફળ", status: "error", duration: 3000 });
// // // //         }
// // // //     };

// // // //     const handleViewDetails = (salary) => {
// // // //         setSelectedSalary(salary);
// // // //         onViewOpen();
// // // //     };

// // // //     const formatNumber = (num) => {
// // // //         if (!num && num !== 0) return "0.00";
// // // //         return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
// // // //     };

// // // //     // Handle Download CSV
// // // //     const handleDownloadCSV = () => {
// // // //         const headers = [
// // // //             "ક્રમાંક", "કર્મચારી નામ", "કર્મચારી કોડ", "બેઝિક (₹)", "ગ્રેડ પે (₹)",
// // // //             "DA (₹)", "HRA (₹)", "TA (₹)", "મેડિકલ (₹)", "ઝાડુ (₹)", "ગ્રોસ (₹)",
// // // //             "PF (₹)", "ESI (₹)", "પ્રો. ટેક્સ (₹)", "કર્મચારી ફાળો (₹)", "અન્ય ફાળો (₹)",
// // // //             "PLI (₹)", "સહકારી હપ્તો (₹)", "કુલ કપાત (₹)", "ચોખ્ખો પગાર (₹)", "સ્થિતિ"
// // // //         ];
        
// // // //         const rows = salaries.map((s, idx) => {
// // // //             const totalDeductions = (s.grossSalary || 0) - (s.netSalary || 0);
// // // //             return [
// // // //                 idx + 1,
// // // //                 s.employeeId?.employeeName || s.employeeName || "-",
// // // //                 s.employeeId?.employeeCode || "-",
// // // //                 formatNumber(s.basicSalary),
// // // //                 formatNumber(s.gradePay),
// // // //                 formatNumber(s.allowances?.da),
// // // //                 formatNumber(s.allowances?.hra),
// // // //                 formatNumber(s.allowances?.ta),
// // // //                 formatNumber(s.allowances?.medical),
// // // //                 formatNumber(s.allowances?.cleaning),
// // // //                 formatNumber(s.grossSalary),
// // // //                 formatNumber(s.deductions?.pf),
// // // //                 formatNumber(s.deductions?.esi),
// // // //                 formatNumber(s.deductions?.professionalTax),
// // // //                 formatNumber(s.deductions?.employeeContribution),
// // // //                 formatNumber(s.deductions?.otherContribution),
// // // //                 formatNumber(s.deductions?.pli),
// // // //                 formatNumber(s.deductions?.cooperativeInstallment),
// // // //                 formatNumber(totalDeductions),
// // // //                 formatNumber(s.netSalary),
// // // //                 s.status === 'paid' ? 'ચૂકવેલ' : 'બાકી'
// // // //             ];
// // // //         });
        
// // // //         const csvContent = [headers.join(","), ...rows.map(row => row.map(cell => `"${cell}"`).join(","))].join("\n");
// // // //         const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
// // // //         const link = document.createElement("a");
// // // //         const url = URL.createObjectURL(blob);
// // // //         link.setAttribute("href", url);
// // // //         link.setAttribute("download", `pagar_patrak_${getMonthName(selectedMonth)}_${selectedYear}.csv`);
// // // //         document.body.appendChild(link);
// // // //         link.click();
// // // //         document.body.removeChild(link);
        
// // // //         toast({ title: "ડાઉનલોડ", description: "ફાઇલ ડાઉનલોડ થઈ રહી છે", status: "success", duration: 2000 });
// // // //     };

// // // //     // Handle Print
// // // //     const handlePrint = () => {
// // // //         window.print();
// // // //     };

// // // //     // Pagination
// // // //     const indexOfLastItem = currentPage * itemsPerPage;
// // // //     const indexOfFirstItem = indexOfLastItem - itemsPerPage;
// // // //     const currentItems = salaries.slice(indexOfFirstItem, indexOfLastItem);
// // // //     const totalPages = Math.ceil(salaries.length / itemsPerPage);
// // // //     const handlePageChange = (page) => setCurrentPage(page);
// // // //     const handleItemsPerPageChange = (newLimit) => {
// // // //         setItemsPerPage(newLimit);
// // // //         setCurrentPage(1);
// // // //     };

// // // //     // Calculate totals correctly
// // // //     const totals = salaries.reduce((acc, curr) => ({
// // // //         totalBasic: acc.totalBasic + ((curr.basicSalary || 0) + (curr.gradePay || 0)),
// // // //         totalDA: acc.totalDA + (curr.allowances?.da || 0),
// // // //         totalHRA: acc.totalHRA + (curr.allowances?.hra || 0),
// // // //         totalGross: acc.totalGross + (curr.grossSalary || 0),
// // // //         totalPF: acc.totalPF + (curr.deductions?.pf || 0),
// // // //         totalNet: acc.totalNet + (curr.netSalary || 0),
// // // //         totalPaid: acc.totalPaid + ((curr.status === 'paid' ? curr.netSalary : 0) || 0),
// // // //         totalPending: acc.totalPending + ((curr.status === 'pending' ? curr.netSalary : 0) || 0)
// // // //     }), { totalBasic: 0, totalDA: 0, totalHRA: 0, totalGross: 0, totalPF: 0, totalNet: 0, totalPaid: 0, totalPending: 0 });

// // // //     // Print styles
// // // //     const printStyles = `
// // // //         @media print {
// // // //             body * { visibility: hidden; }
// // // //             .print-area, .print-area * { visibility: visible; }
// // // //             .print-area { position: absolute; left: 0; top: 0; width: 100%; }
// // // //             .no-print { display: none !important; }
// // // //             table { font-size: 10pt; }
// // // //             th, td { padding: 4px; }
// // // //         }
// // // //     `;

// // // //     return (
// // // //         <Box bg="#F8FAF9" minH="100vh" p={6}>
// // // //             <style dangerouslySetInnerHTML={{ __html: printStyles }} />

// // // //             {/* Header */}
// // // //             <Flex align="center" mb={6} className="no-print">
// // // //                 <Box width="180px">
// // // //                     <Button leftIcon={<FiArrowLeft />} colorScheme="green" variant="outline" onClick={() => navigate("/pe-roll")} rounded="xl">
// // // //                         પાછા જાવ
// // // //                     </Button>
// // // //                 </Box>
// // // //                 <Heading flex="1" textAlign="center" size="lg" color="green.700">પગાર પત્રક (Salary Sheet)</Heading>
// // // //                 <HStack spacing={2} width="180px" justify="flex-end">
// // // //                     {/* <Tooltip label="રિફ્રેશ"> */}
// // // //                         {/* <IconButton icon={<FiRefreshCw />} variant="ghost" colorScheme="green" onClick={fetchSalaries} aria-label="Refresh" /> */}
// // // //                     {/* </Tooltip> */}
// // // //                     <Button leftIcon={showForm ? <FiX /> : <FiPlus />} colorScheme={showForm ? "red" : "green"} onClick={() => setShowForm(!showForm)} size="sm" rounded="xl">
// // // //                         {showForm ? 'બંધ કરો' : 'નવો પગાર'}
// // // //                     </Button>
// // // //                 </HStack>
// // // //             </Flex>

// // // //             {/* Filter Card */}
// // // //             <Card rounded="2xl" shadow="md" mb={6} border="1px solid #E3EDE8" className="no-print">
// // // //                 <CardBody>
// // // //                     <Stack direction={{ base: "column", md: "row" }} spacing={4} align="flex-end">
// // // //                         <FormControl w={{ base: "full", md: "200px" }}>
// // // //                             <FormLabel fontSize="sm">મહિનો</FormLabel>
// // // //                             <Select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} bg="white">
// // // //                                 {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
// // // //                                     <option key={month} value={month}>{getMonthName(month)}</option>
// // // //                                 ))}
// // // //                             </Select>
// // // //                         </FormControl>
// // // //                         <FormControl w={{ base: "full", md: "150px" }}>
// // // //                             <FormLabel fontSize="sm">વર્ષ</FormLabel>
// // // //                             <Input type="number" value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} bg="white" />
// // // //                         </FormControl>
// // // //                         {/* <Button leftIcon={<FiSearch />} colorScheme="blue" px={8} onClick={fetchSalaries} isLoading={loading}>શોધો</Button> */}
// // // //                         <Button leftIcon={<FiDownload />} variant="outline" colorScheme="blue" onClick={handleDownloadCSV}>CSV</Button>
// // // //                         <Button leftIcon={<FiPrinter />} variant="outline" colorScheme="purple" onClick={handlePrint}>પ્રિન્ટ</Button>
// // // //                     </Stack>
// // // //                 </CardBody>
// // // //             </Card>

// // // //             {/* Salary Generation Form */}
// // // //             {showForm && (
// // // //                 <Card rounded="2xl" shadow="lg" mb={6} border="2px solid #38A169" className="no-print">
// // // //                     <CardBody>
// // // //                         <Heading size="sm" mb={4} color="green.700">નવો પગાર જનરેટ કરો</Heading>
// // // //                         <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
// // // //                             <FormControl isRequired>
// // // //                                 <FormLabel>કર્મચારી પસંદ કરો</FormLabel>
// // // //                                 <Select value={formData.employeeId} onChange={(e) => handleEmployeeChange(e.target.value)} placeholder="કર્મચારી પસંદ કરો" bg="gray.50">
// // // //                                     {employees.map(emp => (
// // // //                                         <option key={emp._id} value={emp._id}>
// // // //                                             {emp.employeeName} - {emp.employeePositionGujarati || emp.employeePositionEnglish}
// // // //                                         </option>
// // // //                                     ))}
// // // //                                 </Select>
// // // //                             </FormControl>
// // // //                             <FormControl>
// // // //                                 <FormLabel>મૂળ પગાર (₹)</FormLabel>
// // // //                                 <Input type="number" value={formData.basicSalary} isReadOnly bg="gray.100" />
// // // //                             </FormControl>
// // // //                             <FormControl>
// // // //                                 <FormLabel>ગ્રેડ પે (₹)</FormLabel>
// // // //                                 <Input type="number" value={formData.gradePay} isReadOnly bg="gray.100" />
// // // //                             </FormControl>
// // // //                             <FormControl>
// // // //                                 <FormLabel>રીમાર્ક</FormLabel>
// // // //                                 <Input type="text" value={formData.remarks} onChange={(e) => setFormData({...formData, remarks: e.target.value})} placeholder="વધારાની નોંધ..." bg="gray.50" />
// // // //                             </FormControl>
// // // //                         </SimpleGrid>
// // // //                         <Alert status="info" mt={4} borderRadius="lg" size="sm">
// // // //                             <AlertIcon />
// // // //                             પગારની ગણતરી પેરામીટર સેટિંગ્સ મુજબ ઓટોમેટિક થશે
// // // //                         </Alert>
// // // //                         <Button mt={6} colorScheme="green" leftIcon={<FiSave />} onClick={handleGenerate} isLoading={saving}>જનરેટ કરો</Button>
// // // //                     </CardBody>
// // // //                 </Card>
// // // //             )}

// // // //             {/* Totals Summary */}
// // // //             <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4} mb={6} className="no-print">
// // // //                 <Card bg="white" shadow="sm" borderLeft="4px solid #2D3748">
// // // //                     <CardBody p={3}><Text fontSize="xs" color="gray.500">કુલ ગ્રોસ</Text><Text fontSize="xl" fontWeight="bold">₹{formatNumber(totals.totalGross)}</Text></CardBody>
// // // //                 </Card>
// // // //                 <Card bg="white" shadow="sm" borderLeft="4px solid #38A169">
// // // //                     <CardBody p={3}><Text fontSize="xs" color="gray.500">કુલ નેટ</Text><Text fontSize="xl" fontWeight="bold" color="green.600">₹{formatNumber(totals.totalNet)}</Text></CardBody>
// // // //                 </Card>
// // // //                 <Card bg="white" shadow="sm" borderLeft="4px solid #3182CE">
// // // //                     <CardBody p={3}><Text fontSize="xs" color="gray.500">કુલ PF</Text><Text fontSize="xl" fontWeight="bold" color="blue.600">₹{formatNumber(totals.totalPF)}</Text></CardBody>
// // // //                 </Card>
// // // //                 <Card bg="white" shadow="sm" borderLeft="4px solid #F6AD55">
// // // //                     <CardBody p={3}><Text fontSize="xs" color="gray.500">ચૂકવેલ</Text><Text fontSize="xl" fontWeight="bold" color="orange.600">₹{formatNumber(totals.totalPaid)}</Text></CardBody>
// // // //                 </Card>
// // // //                 <Card bg="white" shadow="sm" borderLeft="4px solid #E53E3E">
// // // //                     <CardBody p={3}><Text fontSize="xs" color="gray.500">બાકી</Text><Text fontSize="xl" fontWeight="bold" color="red.600">₹{formatNumber(totals.totalPending)}</Text></CardBody>
// // // //                 </Card>
// // // //             </SimpleGrid>

// // // //             {/* Salary Table - Print Area */}
// // // //             <Card rounded="2xl" shadow="xl" overflow="hidden" border="1px solid #E3EDE8" className="print-area">
// // // //                 {/* <Box bg="#1E4D2B" px={6} py={4} className="no-print">
// // // //                     <Heading size="md" color="white">પગાર પત્રક - {getMonthName(selectedMonth)} {selectedYear}</Heading>
// // // //                 </Box> */}
                
// // // //                 {/* Print Header */}
// // // //                 <Box textAlign="center" py={4} display={{ base: "none", print: "block" }}>
// // // //                     <Heading size="lg" color="green.700">પગાર પત્રક</Heading>
// // // //                     <Text>{getMonthName(selectedMonth)} {selectedYear}</Text>
// // // //                     <Text fontSize="sm">તારીખ: {new Date().toLocaleDateString('gu-IN')}</Text>
// // // //                 </Box>

// // // //                 <Box overflowX="auto">
// // // //                     <Table variant="simple" size="sm">
// // // //                         <Thead bg="gray.50">
// // // //                             <Tr>
// // // //                                 <Th>ક્ર.</Th>
// // // //                                 <Th>કર્મચારી</Th>
// // // //                                 <Th>હોદ્દો</Th>
// // // //                                 <Th isNumeric>બેઝિક</Th>
// // // //                                 <Th isNumeric>DA</Th>
// // // //                                 <Th isNumeric>HRA</Th>
// // // //                                 <Th isNumeric>ગ્રોસ</Th>
// // // //                                 <Th isNumeric>PF</Th>
// // // //                                 <Th isNumeric>નેટ</Th>
// // // //                                 <Th>સ્થિતિ</Th>
// // // //                                 <Th className="no-print">ક્રિયા</Th>
// // // //                             </Tr>
// // // //                         </Thead>
// // // //                         <Tbody bg="white">
// // // //                             {loading ? (
// // // //                                 <Tr><Td colSpan={11} textAlign="center" py={10}><Spinner color="green.500" /></Td></Tr>
// // // //                             ) : salaries.length === 0 ? (
// // // //                                 <Tr><Td colSpan={11} textAlign="center" py={10} color="gray.500">આ સમયગાળા માટે કોઈ રેકોર્ડ મળ્યા નથી</Td></Tr>
// // // //                             ) : (
// // // //                                 currentItems.map((salary, idx) => (
// // // //                                     <Tr key={salary._id} _hover={{ bg: "gray.50" }}>
// // // //                                         <Td>{indexOfFirstItem + idx + 1}</Td>
// // // //                                         <Td>
// // // //                                             <Text fontWeight="500">{salary.employeeId?.employeeName || salary.employeeName || "-"}</Text>
// // // //                                             <Text fontSize="xs" color="gray.500">{salary.employeeId?.employeeCode || ""}</Text>
// // // //                                         </Td>
// // // //                                         <Td><Badge colorScheme="blue" fontSize="xs">{salary.employeeId?.employeePositionGujarati || "-"}</Badge></Td>
// // // //                                         <Td isNumeric>₹{formatNumber((salary.basicSalary || 0) + (salary.gradePay || 0))}</Td>
// // // //                                         <Td isNumeric>₹{formatNumber(salary.allowances?.da)}</Td>
// // // //                                         <Td isNumeric>₹{formatNumber(salary.allowances?.hra)}</Td>
// // // //                                         <Td isNumeric fontWeight="bold" color="green.600">₹{formatNumber(salary.grossSalary)}</Td>
// // // //                                         <Td isNumeric>₹{formatNumber(salary.deductions?.pf)}</Td>
// // // //                                         <Td isNumeric fontWeight="bold" color="purple.600">₹{formatNumber(salary.netSalary)}</Td>
// // // //                                         <Td>
// // // //                                             <Badge colorScheme={salary.status === 'paid' ? 'green' : 'orange'} rounded="full" px={2}>
// // // //                                                 {salary.status === 'paid' ? 'ચૂકવેલ' : 'બાકી'}
// // // //                                             </Badge>
// // // //                                         </Td>
// // // //                                         <Td className="no-print">
// // // //                                             <HStack spacing={1}>
// // // //                                                 <IconButton icon={<FiEye />} size="sm" colorScheme="blue" variant="ghost" onClick={() => handleViewDetails(salary)} aria-label="View" rounded="full" />
// // // //                                                 {salary.status === 'pending' && (
// // // //                                                     <IconButton icon={<FiCheckCircle />} size="sm" colorScheme="green" variant="ghost" onClick={() => updateSalaryStatus(salary._id, 'paid')} aria-label="Mark Paid" rounded="full" />
// // // //                                                 )}
// // // //                                             </HStack>
// // // //                                         </Td>
// // // //                                     </Tr>
// // // //                                 ))
// // // //                             )}
// // // //                         </Tbody>
// // // //                         {/* TFOOT with correct column alignment */}
// // // //                         <Tfoot bg="gray.100">
// // // //                             <Tr>
// // // //                                 <Th colSpan={3} textAlign="right">કુલ:</Th>
// // // //                                 <Th isNumeric>₹{formatNumber(totals.totalBasic)}</Th>
// // // //                                 <Th isNumeric>₹{formatNumber(totals.totalDA)}</Th>
// // // //                                 <Th isNumeric>₹{formatNumber(totals.totalHRA)}</Th>
// // // //                                 <Th isNumeric fontWeight="bold">₹{formatNumber(totals.totalGross)}</Th>
// // // //                                 <Th isNumeric>₹{formatNumber(totals.totalPF)}</Th>
// // // //                                 <Th isNumeric fontWeight="bold" color="purple.600">₹{formatNumber(totals.totalNet)}</Th>
// // // //                                 <Th colSpan={2}></Th>
// // // //                             </Tr>
// // // //                         </Tfoot>
// // // //                     </Table>
// // // //                 </Box>

// // // //                 {/* Pagination */}
// // // //                 {!loading && salaries.length > 0 && (
// // // //                     <Box className="no-print" p={4}>
// // // //                         <Pagination
// // // //                             currentPage={currentPage}
// // // //                             totalPages={totalPages}
// // // //                             onPageChange={handlePageChange}
// // // //                             itemsPerPage={itemsPerPage}
// // // //                             setItemsPerPage={handleItemsPerPageChange}
// // // //                         />
// // // //                     </Box>
// // // //                 )}

// // // //                 {/* Signature Section - Print */}
// // // //                 {/* <Box display={{ base: "none", print: "flex" }} justifyContent="space-between" mt={8} pt={4} px={6} pb={4} borderTop="1px solid #ccc">
// // // //                     <Text>સ્ટાફ અધિકારીની સહી</Text>
// // // //                     <Text>મુખ્ય અધિકારીની સહી</Text>
// // // //                     <Text>એકાઉન્ટ વિભાગ</Text>
// // // //                 </Box> */}
// // // //             </Card>

// // // //             {/* View Details Modal */}
// // // //             <Modal isOpen={isViewOpen} onClose={onViewClose} size="2xl">
// // // //                 <ModalOverlay />
// // // //                 <ModalContent borderRadius="2xl">
// // // //                     <ModalHeader bg="#1E4D2B" color="white" borderTopRadius="2xl">પગાર વિગત</ModalHeader>
// // // //                     <ModalCloseButton color="white" />
// // // //                     <ModalBody py={6}>
// // // //                         {selectedSalary && (
// // // //                             <Grid templateColumns="1fr 2fr" gap={4}>
// // // //                                 <Text fontWeight="bold">કર્મચારી:</Text><Text>{selectedSalary.employeeId?.employeeName}</Text>
// // // //                                 <Text fontWeight="bold">બેઝિક પગાર:</Text><Text>₹{formatNumber(selectedSalary.basicSalary)}</Text>
// // // //                                 <Text fontWeight="bold">ગ્રેડ પે:</Text><Text>₹{formatNumber(selectedSalary.gradePay)}</Text>
// // // //                                 <Text fontWeight="bold">મોંઘવારી ભથ્થું:</Text><Text>₹{formatNumber(selectedSalary.allowances?.da)}</Text>
// // // //                                 <Text fontWeight="bold">ઘર ભાડું:</Text><Text>₹{formatNumber(selectedSalary.allowances?.hra)}</Text>
// // // //                                 <Text fontWeight="bold">ધોલાઈ ભથ્થું:</Text><Text>₹{formatNumber(selectedSalary.allowances?.ta)}</Text>
// // // //                                 <Text fontWeight="bold">મેડિકલ ભથ્થું:</Text><Text>₹{formatNumber(selectedSalary.allowances?.medical)}</Text>
// // // //                                 <Text fontWeight="bold">ઝાડુ ભથ્થું:</Text><Text>₹{formatNumber(selectedSalary.allowances?.cleaning)}</Text>
// // // //                                 <Text fontWeight="bold">ગ્રોસ પગાર:</Text><Text fontWeight="bold" color="green.600">₹{formatNumber(selectedSalary.grossSalary)}</Text>
// // // //                                 <Text fontWeight="bold">PF કપાત:</Text><Text>₹{formatNumber(selectedSalary.deductions?.pf)}</Text>
// // // //                                 <Text fontWeight="bold">ESI કપાત:</Text><Text>₹{formatNumber(selectedSalary.deductions?.esi)}</Text>
// // // //                                 <Text fontWeight="bold">કર્મચારી ફાળો:</Text><Text>₹{formatNumber(selectedSalary.deductions?.employeeContribution)}</Text>
// // // //                                 <Text fontWeight="bold">અન્ય ફાળો:</Text><Text>₹{formatNumber(selectedSalary.deductions?.otherContribution)}</Text>
// // // //                                 <Text fontWeight="bold">PLI:</Text><Text>₹{formatNumber(selectedSalary.deductions?.pli)}</Text>
// // // //                                 <Text fontWeight="bold">સહકારી હપ્તો:</Text><Text>₹{formatNumber(selectedSalary.deductions?.cooperativeInstallment)}</Text>
// // // //                                 <Text fontWeight="bold">કુલ કપાત:</Text><Text fontWeight="bold" color="red.600">₹{formatNumber(selectedSalary.grossSalary - selectedSalary.netSalary)}</Text>
// // // //                                 <Text fontWeight="bold">નેટ પગાર:</Text><Text fontSize="xl" fontWeight="bold" color="purple.600">₹{formatNumber(selectedSalary.netSalary)}</Text>
// // // //                                 <Text fontWeight="bold">સ્થિતિ:</Text><Badge colorScheme={selectedSalary.status === 'paid' ? 'green' : 'orange'}>{selectedSalary.status === 'paid' ? 'ચૂકવેલ' : 'બાકી'}</Badge>
// // // //                             </Grid>
// // // //                         )}
// // // //                     </ModalBody>
// // // //                     <ModalFooter><Button colorScheme="green" onClick={onViewClose}>બંધ કરો</Button></ModalFooter>
// // // //                 </ModalContent>
// // // //             </Modal>
// // // //         </Box>
// // // //     );
// // // // };

// // // // export default SalarySheet;


// // // // salarysheet.jsx
// // // "use client";

// // // import React, { useState, useEffect } from 'react';
// // // import axios from 'axios';
// // // import {
// // //     Box, Heading, Text, Button, Flex, Select, Input, Table, Thead, Tbody, Tr, Th, Td,
// // //     Card, CardBody, SimpleGrid, Badge, useToast, IconButton, Divider,
// // //     FormControl, FormLabel, Spinner, Stack, HStack, Tooltip, Alert, AlertIcon,
// // //     Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
// // //     ModalCloseButton, useDisclosure, Grid, Tfoot
// // // } from "@chakra-ui/react";
// // // import { FiArrowLeft, FiPlus, FiSearch, FiSave, FiX, FiCheckCircle, FiEye, FiPrinter, FiDownload, FiRefreshCw } from "react-icons/fi";
// // // import { useNavigate } from "react-router-dom";
// // // import { ViewIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";
// // // import Pagination from "../components/Pagination";

// // // const SalarySheet = () => {
// // //     const navigate = useNavigate();
// // //     const toast = useToast();
// // //     const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
    
// // //     const [salaries, setSalaries] = useState([]);
// // //     const [employees, setEmployees] = useState([]);
// // //     const [parameters, setParameters] = useState([]);
// // //     const [loading, setLoading] = useState(false);
// // //     const [saving, setSaving] = useState(false);
// // //     const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
// // //     const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
// // //     const [showForm, setShowForm] = useState(false);
// // //     const [selectedSalary, setSelectedSalary] = useState(null);
// // //     const [currentPage, setCurrentPage] = useState(1);
// // //     const [itemsPerPage, setItemsPerPage] = useState(10);
    
// // //     const [formData, setFormData] = useState({
// // //         employeeId: '',
// // //         basicSalary: '',
// // //         gradePay: '',
// // //         da: '',
// // //         hra: '',
// // //         ta: '',
// // //         medical: '',
// // //         cleaning: '',
// // //         pf: '',
// // //         esi: '',
// // //         professionalTax: '',
// // //         employeeContribution: '',
// // //         otherContribution: '',
// // //         pli: '',
// // //         cooperativeInstallment: '',
// // //         remarks: ''
// // //     });

// // //     // Get month name in Gujarati
// // //     const getMonthName = (month) => {
// // //         const months = ["જાન્યુઆરી", "ફેબ્રુઆરી", "માર્ચ", "એપ્રિલ", "મે", "જૂન",
// // //             "જુલાઈ", "ઑગસ્ટ", "સપ્ટેમ્બર", "ઑક્ટોબર", "નવેમ્બર", "ડિસેમ્બર"];
// // //         return months[month - 1] || "";
// // //     };

// // //     // Get parameter value by name
// // //     const getParameterValue = (examName) => {
// // //         const param = parameters.find(p => p.examName === examName);
// // //         return param ? parseFloat(param.value) : 0;
// // //     };

// // //     // Calculate salary based on parameters from settings
// // //     const calculateSalary = (basicSalary, gradePay = 0) => {
// // //         const totalBasic = basicSalary + gradePay;
        
// // //         const daPercentage = getParameterValue("પ્રકાર-૧") || 50;
// // //         const hraAmount = getParameterValue("પ્રકાર-૨") || 0;
// // //         const taAmount = getParameterValue("પ્રકાર-૩") || 0;
// // //         const medicalAmount = getParameterValue("પ્રકાર-૪") || 1250;
// // //         const cleaningAmount = getParameterValue("પ્રકાર-૫") || 0;
// // //         const pfPercentage = getParameterValue("પી.એફ. વ્યાજ") || 12;
        
// // //         const da = totalBasic * (daPercentage / 100);
// // //         const hra = hraAmount;
// // //         const ta = taAmount;
// // //         const medical = medicalAmount;
// // //         const cleaning = cleaningAmount;
// // //         const grossSalary = totalBasic + da + hra + ta + medical + cleaning;
// // //         const pf = totalBasic * (pfPercentage / 100);
// // //         const esi = totalBasic <= 21000 ? totalBasic * 0.0075 : 0;
// // //         const professionalTax = totalBasic > 15000 ? 200 : 0;
        
// // //         return { 
// // //             totalBasic, da, hra, ta, medical, cleaning, grossSalary, 
// // //             pf, esi, professionalTax, daPercentage, pfPercentage
// // //         };
// // //     };

// // //     // Fetch all required data
// // //     useEffect(() => {
// // //         fetchSalaries();
// // //         fetchEmployees();
// // //         fetchParameters();
// // //     }, [selectedMonth, selectedYear]);

// // //     const fetchSalaries = async () => {
// // //         setLoading(true);
// // //         try {
// // //             const response = await axios.get(`http://localhost:5000/api/salary?month=${selectedMonth}&year=${selectedYear}`);
// // //             setSalaries(response.data);
// // //         } catch (error) {
// // //             console.error('Error fetching salaries:', error);
// // //             toast({ title: "ભૂલ", description: "પગાર રેકોર્ડ લોડ કરવામાં નિષ્ફળ", status: "error", duration: 3000 });
// // //         } finally {
// // //             setLoading(false);
// // //         }
// // //     };

// // //     const fetchEmployees = async () => {
// // //         try {
// // //             const response = await axios.get('http://localhost:5000/api/employee');
// // //             setEmployees(response.data.filter(emp => emp.isActive !== false));
// // //         } catch (error) {
// // //             console.error('Error fetching employees:', error);
// // //         }
// // //     };

// // //     const fetchParameters = async () => {
// // //         try {
// // //             const response = await axios.get('http://localhost:5000/api/parameter');
// // //             setParameters(response.data);
// // //         } catch (error) {
// // //             console.error('Error fetching parameters:', error);
// // //         }
// // //     };

// // //     // Auto-calculate when employee is selected
// // //     const handleEmployeeChange = (employeeId) => {
// // //         const employee = employees.find(emp => emp._id === employeeId);
// // //         if (employee) {
// // //             const basicPay = parseFloat(employee.basicPay) || 0;
// // //             const gradePay = parseFloat(employee.gradePay) || 0;
// // //             const calculated = calculateSalary(basicPay, gradePay);
            
// // //             setFormData({
// // //                 ...formData,
// // //                 employeeId: employeeId,
// // //                 basicSalary: basicPay.toString(),
// // //                 gradePay: gradePay.toString(),
// // //                 da: calculated.da.toString(),
// // //                 hra: calculated.hra.toString(),
// // //                 ta: calculated.ta.toString(),
// // //                 medical: calculated.medical.toString(),
// // //                 cleaning: calculated.cleaning.toString(),
// // //                 pf: calculated.pf.toString(),
// // //                 esi: calculated.esi.toString(),
// // //                 professionalTax: calculated.professionalTax.toString(),
// // //                 employeeContribution: employee.employeeContribution?.toString() || "0",
// // //                 otherContribution: employee.otherContribution?.toString() || "0",
// // //                 pli: employee.pli?.toString() || "0",
// // //                 cooperativeInstallment: employee.cooperativeInstallment?.toString() || "0"
// // //             });
// // //         } else {
// // //             setFormData({ ...formData, employeeId: employeeId });
// // //         }
// // //     };

// // //     const handleGenerate = async () => {
// // //         if (!formData.employeeId) {
// // //             toast({ title: "ચેતવણી", description: "કૃપા કરી કર્મચારી પસંદ કરો", status: "warning", duration: 3000 });
// // //             return;
// // //         }
        
// // //         setSaving(true);
// // //         try {
// // //             const basic = parseFloat(formData.basicSalary) || 0;
// // //             const grade = parseFloat(formData.gradePay) || 0;
// // //             const calc = calculateSalary(basic, grade);
// // //             const employee = employees.find(emp => emp._id === formData.employeeId);
            
// // //             const allowances = {
// // //                 da: calc.da, hra: calc.hra, ta: calc.ta, medical: calc.medical,
// // //                 cleaning: calc.cleaning, special: 0, other: 0
// // //             };
            
// // //             const deductions = {
// // //                 pf: calc.pf, esi: calc.esi, professionalTax: calc.professionalTax,
// // //                 employeeContribution: parseFloat(formData.employeeContribution) || 0,
// // //                 otherContribution: parseFloat(formData.otherContribution) || 0,
// // //                 pli: parseFloat(formData.pli) || 0,
// // //                 cooperativeInstallment: parseFloat(formData.cooperativeInstallment) || 0,
// // //                 tds: 0, advance: 0, other: 0
// // //             };
            
// // //             const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + (val || 0), 0);
// // //             const netSalary = calc.grossSalary - totalDeductions;
            
// // //             const payload = {
// // //                 employeeId: formData.employeeId, month: selectedMonth, year: selectedYear,
// // //                 basicSalary: basic, gradePay: grade, allowances, deductions,
// // //                 grossSalary: calc.grossSalary, netSalary: netSalary,
// // //                 remarks: formData.remarks || "", status: 'pending'
// // //             };
            
// // //             await axios.post('http://localhost:5000/api/salary/generate', payload);
            
// // //             toast({ 
// // //                 title: "સફળ", 
// // //                 description: `પગાર જનરેટ થયો: ગ્રોસ ₹${formatNumber(calc.grossSalary)}, નેટ ₹${formatNumber(netSalary)}`, 
// // //                 status: "success", 
// // //                 duration: 3000 
// // //             });
            
// // //             fetchSalaries();
// // //             setFormData({
// // //                 employeeId: '', basicSalary: '', gradePay: '', da: '', hra: '', ta: '',
// // //                 medical: '', cleaning: '', pf: '', esi: '', professionalTax: '',
// // //                 employeeContribution: '', otherContribution: '', pli: '', cooperativeInstallment: '', remarks: ''
// // //             });
// // //             setShowForm(false);
// // //         } catch (error) {
// // //             console.error('Error generating salary:', error);
// // //             toast({ 
// // //                 title: "ભૂલ", 
// // //                 description: error.response?.data?.message || "પગાર જનરેટ કરવામાં ભૂલ", 
// // //                 status: "error", 
// // //                 duration: 3000 
// // //             });
// // //         } finally {
// // //             setSaving(false);
// // //         }
// // //     };

// // //     const updateSalaryStatus = async (id, status) => {
// // //         try {
// // //             await axios.put(`http://localhost:5000/api/salary/${id}/status`, {
// // //                 status, paymentDate: new Date(), paymentMode: 'bank transfer'
// // //             });
// // //             toast({ title: "અપડેટ", description: `સ્થિતિ બદલાઈ: ${status === 'paid' ? 'ચૂકવેલ' : 'બાકી'}`, status: "info", duration: 2000 });
// // //             fetchSalaries();
// // //         } catch (error) {
// // //             console.error('Error updating salary status:', error);
// // //             toast({ title: "ભૂલ", description: "સ્થિતિ અપડેટ કરવામાં નિષ્ફળ", status: "error", duration: 3000 });
// // //         }
// // //     };

// // //     const handleViewDetails = (salary) => {
// // //         setSelectedSalary(salary);
// // //         onViewOpen();
// // //     };

// // //     const formatNumber = (num) => {
// // //         if (!num && num !== 0) return "0.00";
// // //         return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
// // //     };

// // //     const handleDownloadCSV = () => {
// // //         const headers = [
// // //             "ક્રમાંક", "કર્મચારી નામ", "કર્મચારી કોડ", "બેઝિક (₹)", "ગ્રેડ પે (₹)",
// // //             "DA (₹)", "HRA (₹)", "TA (₹)", "મેડિકલ (₹)", "ઝાડુ (₹)", "ગ્રોસ (₹)",
// // //             "PF (₹)", "ESI (₹)", "પ્રો. ટેક્સ (₹)", "કર્મચારી ફાળો (₹)", "અન્ય ફાળો (₹)",
// // //             "PLI (₹)", "સહકારી હપ્તો (₹)", "કુલ કપાત (₹)", "ચોખ્ખો પગાર (₹)", "સ્થિતિ"
// // //         ];
        
// // //         const rows = salaries.map((s, idx) => {
// // //             const totalDeductions = (s.grossSalary || 0) - (s.netSalary || 0);
// // //             return [
// // //                 idx + 1, s.employeeId?.employeeName || s.employeeName || "-",
// // //                 s.employeeId?.employeeCode || "-", formatNumber(s.basicSalary),
// // //                 formatNumber(s.gradePay), formatNumber(s.allowances?.da),
// // //                 formatNumber(s.allowances?.hra), formatNumber(s.allowances?.ta),
// // //                 formatNumber(s.allowances?.medical), formatNumber(s.allowances?.cleaning),
// // //                 formatNumber(s.grossSalary), formatNumber(s.deductions?.pf),
// // //                 formatNumber(s.deductions?.esi), formatNumber(s.deductions?.professionalTax),
// // //                 formatNumber(s.deductions?.employeeContribution),
// // //                 formatNumber(s.deductions?.otherContribution), formatNumber(s.deductions?.pli),
// // //                 formatNumber(s.deductions?.cooperativeInstallment), formatNumber(totalDeductions),
// // //                 formatNumber(s.netSalary), s.status === 'paid' ? 'ચૂકવેલ' : 'બાકી'
// // //             ];
// // //         });
        
// // //         const csvContent = [headers.join(","), ...rows.map(row => row.map(cell => `"${cell}"`).join(","))].join("\n");
// // //         const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
// // //         const link = document.createElement("a");
// // //         const url = URL.createObjectURL(blob);
// // //         link.setAttribute("href", url);
// // //         link.setAttribute("download", `pagar_patrak_${getMonthName(selectedMonth)}_${selectedYear}.csv`);
// // //         document.body.appendChild(link);
// // //         link.click();
// // //         document.body.removeChild(link);
        
// // //         toast({ title: "ડાઉનલોડ", description: "ફાઇલ ડાઉનલોડ થઈ રહી છે", status: "success", duration: 2000 });
// // //     };

// // //     const handlePrint = () => {
// // //         window.print();
// // //     };

// // //     // Pagination
// // //     const indexOfLastItem = currentPage * itemsPerPage;
// // //     const indexOfFirstItem = indexOfLastItem - itemsPerPage;
// // //     const currentItems = salaries.slice(indexOfFirstItem, indexOfLastItem);
// // //     const totalPages = Math.ceil(salaries.length / itemsPerPage);
// // //     const handlePageChange = (page) => setCurrentPage(page);
// // //     const handleItemsPerPageChange = (newLimit) => {
// // //         setItemsPerPage(newLimit);
// // //         setCurrentPage(1);
// // //     };

// // //     // Calculate totals
// // //     const totals = salaries.reduce((acc, curr) => ({
// // //         totalBasic: acc.totalBasic + ((curr.basicSalary || 0) + (curr.gradePay || 0)),
// // //         totalDA: acc.totalDA + (curr.allowances?.da || 0),
// // //         totalHRA: acc.totalHRA + (curr.allowances?.hra || 0),
// // //         totalGross: acc.totalGross + (curr.grossSalary || 0),
// // //         totalPF: acc.totalPF + (curr.deductions?.pf || 0),
// // //         totalNet: acc.totalNet + (curr.netSalary || 0),
// // //         totalPaid: acc.totalPaid + ((curr.status === 'paid' ? curr.netSalary : 0) || 0),
// // //         totalPending: acc.totalPending + ((curr.status === 'pending' ? curr.netSalary : 0) || 0)
// // //     }), { totalBasic: 0, totalDA: 0, totalHRA: 0, totalGross: 0, totalPF: 0, totalNet: 0, totalPaid: 0, totalPending: 0 });

// // //     // Print styles
// // //     const printStyles = `
// // //         @media print {
// // //             body * { visibility: hidden; }
// // //             .print-area, .print-area * { visibility: visible; }
// // //             .print-area { position: absolute; left: 0; top: 0; width: 100%; }
// // //             .no-print { display: none !important; }
// // //             table { font-size: 10pt; }
// // //             th, td { padding: 4px; }
// // //             .print-header { display: block !important; }
// // //         }
// // //         @media screen {
// // //             .print-header { display: none; }
// // //         }
// // //     `;

// // //     return (
// // //         <Box bg="#F8FAF9" minH="100vh" p={6}>
// // //             <style dangerouslySetInnerHTML={{ __html: printStyles }} />

// // //             {/* Header */}
// // //             <Flex align="center" mb={6} className="no-print">
// // //                 <Box width="180px">
// // //                     <Button leftIcon={<FiArrowLeft />} colorScheme="green" variant="outline" onClick={() => navigate("/pe-roll")} rounded="xl">
// // //                         પાછા જાવ
// // //                     </Button>
// // //                 </Box>
// // //                 <Heading flex="1" textAlign="center" size="lg" color="green.700">પગાર પત્રક (Salary Sheet)</Heading>
// // //                 <HStack spacing={2} width="180px" justify="flex-end">
// // //                     <Button leftIcon={showForm ? <FiX /> : <FiPlus />} colorScheme={showForm ? "red" : "green"} onClick={() => setShowForm(!showForm)} size="sm" rounded="xl">
// // //                         {showForm ? 'બંધ કરો' : 'નવો પગાર'}
// // //                     </Button>
// // //                 </HStack>
// // //             </Flex>

// // //             {/* Filter Card */}
// // //             <Card rounded="2xl" shadow="md" mb={6} border="1px solid #E3EDE8" className="no-print">
// // //                 <CardBody>
// // //                     <Stack direction={{ base: "column", md: "row" }} spacing={4} align="flex-end">
// // //                         <FormControl w={{ base: "full", md: "200px" }}>
// // //                             <FormLabel fontSize="sm">મહિનો</FormLabel>
// // //                             <Select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} bg="white">
// // //                                 {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
// // //                                     <option key={month} value={month}>{getMonthName(month)}</option>
// // //                                 ))}
// // //                             </Select>
// // //                         </FormControl>
// // //                         <FormControl w={{ base: "full", md: "150px" }}>
// // //                             <FormLabel fontSize="sm">વર્ષ</FormLabel>
// // //                             <Input type="number" value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} bg="white" />
// // //                         </FormControl>
// // //                         <Button leftIcon={<FiDownload />} variant="outline" colorScheme="blue" onClick={handleDownloadCSV}>CSV</Button>
// // //                         <Button leftIcon={<FiPrinter />} variant="outline" colorScheme="purple" onClick={handlePrint}>પ્રિન્ટ</Button>
// // //                     </Stack>
// // //                 </CardBody>
// // //             </Card>

// // //             {/* Salary Generation Form */}
// // //             {showForm && (
// // //                 <Card rounded="2xl" shadow="lg" mb={6} border="2px solid #38A169" className="no-print">
// // //                     <CardBody>
// // //                         <Heading size="sm" mb={4} color="green.700">નવો પગાર જનરેટ કરો</Heading>
// // //                         <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
// // //                             <FormControl isRequired>
// // //                                 <FormLabel>કર્મચારી પસંદ કરો</FormLabel>
// // //                                 <Select value={formData.employeeId} onChange={(e) => handleEmployeeChange(e.target.value)} placeholder="કર્મચારી પસંદ કરો" bg="gray.50">
// // //                                     {employees.map(emp => (
// // //                                         <option key={emp._id} value={emp._id}>
// // //                                             {emp.employeeName} - {emp.employeePositionGujarati || emp.employeePositionEnglish}
// // //                                         </option>
// // //                                     ))}
// // //                                 </Select>
// // //                             </FormControl>
// // //                             <FormControl>
// // //                                 <FormLabel>મૂળ પગાર (₹)</FormLabel>
// // //                                 <Input type="number" value={formData.basicSalary} isReadOnly bg="gray.100" />
// // //                             </FormControl>
// // //                             <FormControl>
// // //                                 <FormLabel>ગ્રેડ પે (₹)</FormLabel>
// // //                                 <Input type="number" value={formData.gradePay} isReadOnly bg="gray.100" />
// // //                             </FormControl>
// // //                             <FormControl>
// // //                                 <FormLabel>રીમાર્ક</FormLabel>
// // //                                 <Input type="text" value={formData.remarks} onChange={(e) => setFormData({...formData, remarks: e.target.value})} placeholder="વધારાની નોંધ..." bg="gray.50" />
// // //                             </FormControl>
// // //                         </SimpleGrid>
// // //                         <Alert status="info" mt={4} borderRadius="lg" size="sm">
// // //                             <AlertIcon />
// // //                             પગારની ગણતરી પેરામીટર સેટિંગ્સ મુજબ ઓટોમેટિક થશે
// // //                         </Alert>
// // //                         <Button mt={6} colorScheme="green" leftIcon={<FiSave />} onClick={handleGenerate} isLoading={saving}>જનરેટ કરો</Button>
// // //                     </CardBody>
// // //                 </Card>
// // //             )}

// // //             {/* Totals Summary */}
// // //             <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4} mb={6} className="no-print">
// // //                 <Card bg="white" shadow="sm" borderLeft="4px solid #2D3748">
// // //                     <CardBody p={3}><Text fontSize="xs" color="gray.500">કુલ ગ્રોસ</Text><Text fontSize="xl" fontWeight="bold">₹{formatNumber(totals.totalGross)}</Text></CardBody>
// // //                 </Card>
// // //                 <Card bg="white" shadow="sm" borderLeft="4px solid #38A169">
// // //                     <CardBody p={3}><Text fontSize="xs" color="gray.500">કુલ નેટ</Text><Text fontSize="xl" fontWeight="bold" color="green.600">₹{formatNumber(totals.totalNet)}</Text></CardBody>
// // //                 </Card>
// // //                 <Card bg="white" shadow="sm" borderLeft="4px solid #3182CE">
// // //                     <CardBody p={3}><Text fontSize="xs" color="gray.500">કુલ PF</Text><Text fontSize="xl" fontWeight="bold" color="blue.600">₹{formatNumber(totals.totalPF)}</Text></CardBody>
// // //                 </Card>
// // //                 <Card bg="white" shadow="sm" borderLeft="4px solid #F6AD55">
// // //                     <CardBody p={3}><Text fontSize="xs" color="gray.500">ચૂકવેલ</Text><Text fontSize="xl" fontWeight="bold" color="orange.600">₹{formatNumber(totals.totalPaid)}</Text></CardBody>
// // //                 </Card>
// // //                 <Card bg="white" shadow="sm" borderLeft="4px solid #E53E3E">
// // //                     <CardBody p={3}><Text fontSize="xs" color="gray.500">બાકી</Text><Text fontSize="xl" fontWeight="bold" color="red.600">₹{formatNumber(totals.totalPending)}</Text></CardBody>
// // //                 </Card>
// // //             </SimpleGrid>

// // //             {/* Salary Table - Print Area */}
// // //             <Card rounded="2xl" shadow="xl" overflow="hidden" border="1px solid #E3EDE8" className="print-area">
// // //                 {/* Print Header - Title on Left, Month & Date on Right */}
// // //                 <Flex 
// // //                     className="print-header" 
// // //                     justify="space-between" 
// // //                     align="center" 
// // //                     py={4} 
// // //                     px={6} 
// // //                     borderBottom="1px solid #E2E8F0"
// // //                     bg="white"
// // //                 >
// // //                     <Box>
// // //                         <Heading size="lg" color="green.700">પગાર પત્રક</Heading>
// // //                         <Text fontSize="sm" color="gray.500">(Pagar Patrak)</Text>
// // //                     </Box>
// // //                     <Box textAlign="right">
// // //                         <Text fontSize="lg" fontWeight="semibold" color="gray.700">
// // //                             {getMonthName(selectedMonth)} {selectedYear}
// // //                         </Text>
// // //                         <Text fontSize="sm" color="gray.500">
// // //                             તારીખ: {new Date().toLocaleDateString('gu-IN')}
// // //                         </Text>
// // //                     </Box>
// // //                 </Flex>

// // //                 <Box overflowX="auto">
// // //                     <Table variant="simple" size="sm">
// // //                         <Thead bg="#E8F3EC">
// // //                             <Tr>
// // //                                 <Th>ક્ર.</Th>
// // //                                 <Th>કર્મચારી</Th>
// // //                                 <Th>હોદ્દો</Th>
// // //                                 <Th isNumeric>બેઝિક</Th>
// // //                                 <Th isNumeric>DA</Th>
// // //                                 <Th isNumeric>HRA</Th>
// // //                                 <Th isNumeric>ગ્રોસ</Th>
// // //                                 <Th isNumeric>PF</Th>
// // //                                 <Th isNumeric>નેટ</Th>
// // //                                 <Th>સ્થિતિ</Th>
// // //                                 <Th className="no-print">ક્રિયા</Th>
// // //                             </Tr>
// // //                         </Thead>
// // //                         <Tbody bg="white">
// // //                             {loading ? (
// // //                                 <Tr><Td colSpan={11} textAlign="center" py={10}><Spinner color="green.500" /></Td></Tr>
// // //                             ) : salaries.length === 0 ? (
// // //                                 <Tr><Td colSpan={11} textAlign="center" py={10} color="gray.500">આ સમયગાળા માટે કોઈ રેકોર્ડ મળ્યા નથી</Td></Tr>
// // //                             ) : (
// // //                                 currentItems.map((salary, idx) => (
// // //                                     <Tr key={salary._id} _hover={{ bg: "gray.50" }}>
// // //                                         <Td>{indexOfFirstItem + idx + 1}</Td>
// // //                                         <Td>
// // //                                             <Text fontWeight="500">{salary.employeeId?.employeeName || salary.employeeName || "-"}</Text>
// // //                                             <Text fontSize="xs" color="gray.500">{salary.employeeId?.employeeCode || ""}</Text>
// // //                                         </Td>
// // //                                         <Td><Badge colorScheme="blue" fontSize="xs">{salary.employeeId?.employeePositionGujarati || "-"}</Badge></Td>
// // //                                         <Td isNumeric>₹{formatNumber((salary.basicSalary || 0) + (salary.gradePay || 0))}</Td>
// // //                                         <Td isNumeric>₹{formatNumber(salary.allowances?.da)}</Td>
// // //                                         <Td isNumeric>₹{formatNumber(salary.allowances?.hra)}</Td>
// // //                                         <Td isNumeric fontWeight="bold" color="green.600">₹{formatNumber(salary.grossSalary)}</Td>
// // //                                         <Td isNumeric>₹{formatNumber(salary.deductions?.pf)}</Td>
// // //                                         <Td isNumeric fontWeight="bold" color="purple.600">₹{formatNumber(salary.netSalary)}</Td>
// // //                                         <Td>
// // //                                             <Badge colorScheme={salary.status === 'paid' ? 'green' : 'orange'} rounded="full" px={2}>
// // //                                                 {salary.status === 'paid' ? 'ચૂકવેલ' : 'બાકી'}
// // //                                             </Badge>
// // //                                         </Td>
// // //                                         <Td className="no-print">
// // //                                             <HStack spacing={1}>
// // //                                                 <IconButton icon={<ViewIcon />} size="sm" colorScheme="blue" variant="ghost" onClick={() => handleViewDetails(salary)} aria-label="View" rounded="full" />
// // //                                                 {salary.status === 'pending' && (
// // //                                                     <IconButton icon={<FiCheckCircle />} size="sm" colorScheme="green" variant="ghost" onClick={() => updateSalaryStatus(salary._id, 'paid')} aria-label="Mark Paid" rounded="full" />
// // //                                                 )}
// // //                                             </HStack>
// // //                                         </Td>
// // //                                     </Tr>
// // //                                 ))
// // //                             )}
// // //                         </Tbody>
// // //                         {/* TFOOT with correct column alignment */}
// // //                         <Tfoot bg="gray.100">
// // //                             <Tr>
// // //                                 <Th colSpan={3} textAlign="right">કુલ:</Th>
// // //                                 <Th isNumeric>₹{formatNumber(totals.totalBasic)}</Th>
// // //                                 <Th isNumeric>₹{formatNumber(totals.totalDA)}</Th>
// // //                                 <Th isNumeric>₹{formatNumber(totals.totalHRA)}</Th>
// // //                                 <Th isNumeric fontWeight="bold">₹{formatNumber(totals.totalGross)}</Th>
// // //                                 <Th isNumeric>₹{formatNumber(totals.totalPF)}</Th>
// // //                                 <Th isNumeric fontWeight="bold" color="purple.600">₹{formatNumber(totals.totalNet)}</Th>
// // //                                 <Th colSpan={2}></Th>
// // //                             </Tr>
// // //                         </Tfoot>
// // //                     </Table>
// // //                 </Box>

// // //                 {/* Pagination */}
// // //                 {!loading && salaries.length > 0 && (
// // //                     <Box className="no-print" p={4}>
// // //                         <Pagination
// // //                             currentPage={currentPage}
// // //                             totalPages={totalPages}
// // //                             onPageChange={handlePageChange}
// // //                             itemsPerPage={itemsPerPage}
// // //                             setItemsPerPage={handleItemsPerPageChange}
// // //                         />
// // //                     </Box>
// // //                 )}
// // //             </Card>

// // //             {/* View Details Modal */}
// // //             <Modal isOpen={isViewOpen} onClose={onViewClose} size="2xl">
// // //                 <ModalOverlay />
// // //                 <ModalContent borderRadius="2xl">
// // //                     <ModalHeader bg="#1E4D2B" color="white" borderTopRadius="2xl">પગાર વિગત</ModalHeader>
// // //                     <ModalCloseButton color="white" />
// // //                     <ModalBody py={6}>
// // //                         {selectedSalary && (
// // //                             <Grid templateColumns="1fr 2fr" gap={4}>
// // //                                 <Text fontWeight="bold">કર્મચારી:</Text><Text>{selectedSalary.employeeId?.employeeName}</Text>
// // //                                 <Text fontWeight="bold">બેઝિક પગાર:</Text><Text>₹{formatNumber(selectedSalary.basicSalary)}</Text>
// // //                                 <Text fontWeight="bold">ગ્રેડ પે:</Text><Text>₹{formatNumber(selectedSalary.gradePay)}</Text>
// // //                                 <Text fontWeight="bold">મોંઘવારી ભથ્થું:</Text><Text>₹{formatNumber(selectedSalary.allowances?.da)}</Text>
// // //                                 <Text fontWeight="bold">ઘર ભાડું:</Text><Text>₹{formatNumber(selectedSalary.allowances?.hra)}</Text>
// // //                                 <Text fontWeight="bold">ધોલાઈ ભથ્થું:</Text><Text>₹{formatNumber(selectedSalary.allowances?.ta)}</Text>
// // //                                 <Text fontWeight="bold">મેડિકલ ભથ્થું:</Text><Text>₹{formatNumber(selectedSalary.allowances?.medical)}</Text>
// // //                                 <Text fontWeight="bold">ઝાડુ ભથ્થું:</Text><Text>₹{formatNumber(selectedSalary.allowances?.cleaning)}</Text>
// // //                                 <Text fontWeight="bold">ગ્રોસ પગાર:</Text><Text fontWeight="bold" color="green.600">₹{formatNumber(selectedSalary.grossSalary)}</Text>
// // //                                 <Text fontWeight="bold">PF કપાત:</Text><Text>₹{formatNumber(selectedSalary.deductions?.pf)}</Text>
// // //                                 {/* <Text fontWeight="bold">ESI કપાત:</Text><Text>₹{formatNumber(selectedSalary.deductions?.esi)}</Text> */}
// // //                                 <Text fontWeight="bold">કર્મચારી ફાળો:</Text><Text>₹{formatNumber(selectedSalary.deductions?.employeeContribution)}</Text>
// // //                                 <Text fontWeight="bold">અન્ય ફાળો:</Text><Text>₹{formatNumber(selectedSalary.deductions?.otherContribution)}</Text>
// // //                                 <Text fontWeight="bold">PLI:</Text><Text>₹{formatNumber(selectedSalary.deductions?.pli)}</Text>
// // //                                 <Text fontWeight="bold">સહકારી હપ્તો:</Text><Text>₹{formatNumber(selectedSalary.deductions?.cooperativeInstallment)}</Text>
// // //                                 <Text fontWeight="bold">કુલ કપાત:</Text><Text fontWeight="bold" color="red.600">₹{formatNumber(selectedSalary.grossSalary - selectedSalary.netSalary)}</Text>
// // //                                 <Text fontWeight="bold">નેટ પગાર:</Text><Text fontSize="xl" fontWeight="bold" color="purple.600">₹{formatNumber(selectedSalary.netSalary)}</Text>
// // //                                 <Text fontWeight="bold">સ્થિતિ:</Text><Badge colorScheme={selectedSalary.status === 'paid' ? 'green' : 'orange'}>{selectedSalary.status === 'paid' ? 'ચૂકવેલ' : 'બાકી'}</Badge>
// // //                             </Grid>
// // //                         )}
// // //                     </ModalBody>
// // //                     <ModalFooter><Button colorScheme="green" onClick={onViewClose}>બંધ કરો</Button></ModalFooter>
// // //                 </ModalContent>
// // //             </Modal>
// // //         </Box>
// // //     );
// // // };

// // // export default SalarySheet;

// // // salarysheet.jsx
// // "use client";

// // import React, { useState, useEffect } from 'react';
// // import axios from 'axios';
// // import {
// //     Box, Heading, Text, Button, Flex, Select, Input, Table, Thead, Tbody, Tr, Th, Td,
// //     Card, CardBody, SimpleGrid, Badge, useToast, IconButton, Divider,
// //     FormControl, FormLabel, Spinner, Stack, HStack, Tooltip, Alert, AlertIcon,
// //     Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
// //     ModalCloseButton, useDisclosure, Grid, Tfoot,VStack ,FormErrorMessage ,Textarea 
// // } from "@chakra-ui/react";
// // import { FiArrowLeft, FiPlus, FiSearch, FiSave, FiX, FiCheckCircle, FiEye, FiPrinter, FiDownload, FiRefreshCw } from "react-icons/fi";
// // import { useNavigate } from "react-router-dom";
// // import { ViewIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";
// // import Pagination from "../components/Pagination";

// // const SalarySheet = () => {
// //     const navigate = useNavigate();
// //     const toast = useToast();
// //     const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
// //     const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
    
// //     const [salaries, setSalaries] = useState([]);
// //     const [employees, setEmployees] = useState([]);
// //     const [parameters, setParameters] = useState([]);
// //     const [loading, setLoading] = useState(false);
// //     const [saving, setSaving] = useState(false);
// //     const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
// //     const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
// //     const [selectedSalary, setSelectedSalary] = useState(null);
// //     const [currentPage, setCurrentPage] = useState(1);
// //     const [itemsPerPage, setItemsPerPage] = useState(10);
// //     const [fieldErrors, setFieldErrors] = useState({});
// //     const [touched, setTouched] = useState({});
    
// //     const [formData, setFormData] = useState({
// //         employeeId: '',
// //         basicSalary: '',
// //         gradePay: '',
// //         da: '',
// //         hra: '',
// //         ta: '',
// //         medical: '',
// //         cleaning: '',
// //         pf: '',
// //         esi: '',
// //         professionalTax: '',
// //         employeeContribution: '',
// //         otherContribution: '',
// //         pli: '',
// //         cooperativeInstallment: '',
// //         remarks: ''
// //     });

// //     // Get month name in Gujarati
// //     const getMonthName = (month) => {
// //         const months = ["જાન્યુઆરી", "ફેબ્રુઆરી", "માર્ચ", "એપ્રિલ", "મે", "જૂન",
// //             "જુલાઈ", "ઑગસ્ટ", "સપ્ટેમ્બર", "ઑક્ટોબર", "નવેમ્બર", "ડિસેમ્બર"];
// //         return months[month - 1] || "";
// //     };

// //     // Get parameter value by name
// //     const getParameterValue = (examName) => {
// //         const param = parameters.find(p => p.examName === examName);
// //         return param ? parseFloat(param.value) : 0;
// //     };

// //     // Calculate salary based on parameters from settings
// //     const calculateSalary = (basicSalary, gradePay = 0) => {
// //         const totalBasic = basicSalary + gradePay;
        
// //         const daPercentage = getParameterValue("પ્રકાર-૧") || 50;
// //         const hraAmount = getParameterValue("પ્રકાર-૨") || 0;
// //         const taAmount = getParameterValue("પ્રકાર-૩") || 0;
// //         const medicalAmount = getParameterValue("પ્રકાર-૪") || 1250;
// //         const cleaningAmount = getParameterValue("પ્રકાર-૫") || 0;
// //         const pfPercentage = getParameterValue("પી.એફ. વ્યાજ") || 12;
        
// //         const da = totalBasic * (daPercentage / 100);
// //         const hra = hraAmount;
// //         const ta = taAmount;
// //         const medical = medicalAmount;
// //         const cleaning = cleaningAmount;
// //         const grossSalary = totalBasic + da + hra + ta + medical + cleaning;
// //         const pf = totalBasic * (pfPercentage / 100);
// //         const esi = totalBasic <= 21000 ? totalBasic * 0.0075 : 0;
// //         const professionalTax = totalBasic > 15000 ? 200 : 0;
        
// //         return { 
// //             totalBasic, da, hra, ta, medical, cleaning, grossSalary, 
// //             pf, esi, professionalTax, daPercentage, pfPercentage
// //         };
// //     };

// //     // Fetch all required data
// //     useEffect(() => {
// //         fetchSalaries();
// //         fetchEmployees();
// //         fetchParameters();
// //     }, [selectedMonth, selectedYear]);

// //     const fetchSalaries = async () => {
// //         setLoading(true);
// //         try {
// //             const response = await axios.get(`http://localhost:5000/api/salary?month=${selectedMonth}&year=${selectedYear}`);
// //             setSalaries(response.data);
// //         } catch (error) {
// //             console.error('Error fetching salaries:', error);
// //             toast({ title: "ભૂલ", description: "પગાર રેકોર્ડ લોડ કરવામાં નિષ્ફળ", status: "error", duration: 3000 });
// //         } finally {
// //             setLoading(false);
// //         }
// //     };

// //     const fetchEmployees = async () => {
// //         try {
// //             const response = await axios.get('http://localhost:5000/api/employee');
// //             setEmployees(response.data.filter(emp => emp.isActive !== false));
// //         } catch (error) {
// //             console.error('Error fetching employees:', error);
// //         }
// //     };

// //     const fetchParameters = async () => {
// //         try {
// //             const response = await axios.get('http://localhost:5000/api/parameter');
// //             setParameters(response.data);
// //         } catch (error) {
// //             console.error('Error fetching parameters:', error);
// //         }
// //     };

// //     // Helper function to capitalize first letter of each word
// //     const capitalizeWords = (str) => {
// //         if (!str) return '';
// //         return str.replace(/\b\w/g, char => char.toUpperCase());
// //     };

// //     // Auto-calculate when employee is selected
// //     const handleEmployeeChange = (employeeId) => {
// //         const employee = employees.find(emp => emp._id === employeeId);
// //         if (employee) {
// //             const basicPay = parseFloat(employee.basicPay) || 0;
// //             const gradePay = parseFloat(employee.gradePay) || 0;
// //             const calculated = calculateSalary(basicPay, gradePay);
            
// //             setFormData({
// //                 ...formData,
// //                 employeeId: employeeId,
// //                 basicSalary: basicPay.toString(),
// //                 gradePay: gradePay.toString(),
// //                 da: calculated.da.toString(),
// //                 hra: calculated.hra.toString(),
// //                 ta: calculated.ta.toString(),
// //                 medical: calculated.medical.toString(),
// //                 cleaning: calculated.cleaning.toString(),
// //                 pf: calculated.pf.toString(),
// //                 esi: calculated.esi.toString(),
// //                 professionalTax: calculated.professionalTax.toString(),
// //                 employeeContribution: employee.employeeContribution?.toString() || "0",
// //                 otherContribution: employee.otherContribution?.toString() || "0",
// //                 pli: employee.pli?.toString() || "0",
// //                 cooperativeInstallment: employee.cooperativeInstallment?.toString() || "0"
// //             });
            
// //             // Clear error for employee field
// //             if (fieldErrors.employeeId) {
// //                 setFieldErrors(prev => ({ ...prev, employeeId: undefined }));
// //             }
// //         } else {
// //             setFormData({ ...formData, employeeId: employeeId });
// //         }
// //     };

// //     const handleChange = (e) => {
// //         const { name, value } = e.target;
// //         setFormData({ ...formData, [name]: value });
// //         // Clear error for the field being edited
// //         if (fieldErrors[name]) {
// //             setFieldErrors(prev => ({ ...prev, [name]: undefined }));
// //         }
// //     };

// //     const handleBlur = (fieldName) => {
// //         setTouched({ ...touched, [fieldName]: true });
// //         validateField(fieldName, formData[fieldName]);
// //     };

// //     const validateField = (fieldName, value) => {
// //         const newErrors = { ...fieldErrors };
        
// //         switch(fieldName) {
// //             case 'employeeId':
// //                 if (!value) {
// //                     newErrors.employeeId = "કર્મચારી પસંદ કરવો ફરજિયાત છે";
// //                 } else {
// //                     delete newErrors.employeeId;
// //                 }
// //                 break;
// //             default:
// //                 break;
// //         }
        
// //         setFieldErrors(newErrors);
// //         return Object.keys(newErrors).length === 0;
// //     };

// //     const validateForm = () => {
// //         const newErrors = {};
        
// //         if (!formData.employeeId) {
// //             newErrors.employeeId = "કર્મચારી પસંદ કરવો ફરજિયાત છે";
// //         }
        
// //         setFieldErrors(newErrors);
// //         return Object.keys(newErrors).length === 0;
// //     };

// //     const resetForm = () => {
// //         setFormData({
// //             employeeId: '',
// //             basicSalary: '',
// //             gradePay: '',
// //             da: '',
// //             hra: '',
// //             ta: '',
// //             medical: '',
// //             cleaning: '',
// //             pf: '',
// //             esi: '',
// //             professionalTax: '',
// //             employeeContribution: '',
// //             otherContribution: '',
// //             pli: '',
// //             cooperativeInstallment: '',
// //             remarks: ''
// //         });
// //         setFieldErrors({});
// //         setTouched({});
// //     };

// //     const handleGenerate = async () => {
// //         if (!validateForm()) {
// //             toast({ 
// //                 title: "ભૂલ", 
// //                 description: "કૃપા કરી કર્મચારી પસંદ કરો", 
// //                 status: "error", 
// //                 duration: 3000 
// //             });
// //             return;
// //         }
        
// //         setSaving(true);
// //         try {
// //             const basic = parseFloat(formData.basicSalary) || 0;
// //             const grade = parseFloat(formData.gradePay) || 0;
// //             const calc = calculateSalary(basic, grade);
// //             const employee = employees.find(emp => emp._id === formData.employeeId);
            
// //             const allowances = {
// //                 da: calc.da, hra: calc.hra, ta: calc.ta, medical: calc.medical,
// //                 cleaning: calc.cleaning, special: 0, other: 0
// //             };
            
// //             const deductions = {
// //                 pf: calc.pf, esi: calc.esi, professionalTax: calc.professionalTax,
// //                 employeeContribution: parseFloat(formData.employeeContribution) || 0,
// //                 otherContribution: parseFloat(formData.otherContribution) || 0,
// //                 pli: parseFloat(formData.pli) || 0,
// //                 cooperativeInstallment: parseFloat(formData.cooperativeInstallment) || 0,
// //                 tds: 0, advance: 0, other: 0
// //             };
            
// //             const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + (val || 0), 0);
// //             const netSalary = calc.grossSalary - totalDeductions;
            
// //             const payload = {
// //                 employeeId: formData.employeeId, month: selectedMonth, year: selectedYear,
// //                 basicSalary: basic, gradePay: grade, allowances, deductions,
// //                 grossSalary: calc.grossSalary, netSalary: netSalary,
// //                 remarks: formData.remarks || "", status: 'pending'
// //             };
            
// //             await axios.post('http://localhost:5000/api/salary/generate', payload);
            
// //             toast({ 
// //                 title: "સફળ", 
// //                 description: `પગાર જનરેટ થયો: ગ્રોસ ₹${formatNumber(calc.grossSalary)}, નેટ ₹${formatNumber(netSalary)}`, 
// //                 status: "success", 
// //                 duration: 3000 
// //             });
            
// //             fetchSalaries();
// //             resetForm();
// //             onFormClose();
// //         } catch (error) {
// //             console.error('Error generating salary:', error);
// //             toast({ 
// //                 title: "ભૂલ", 
// //                 description: error.response?.data?.message || "પગાર જનરેટ કરવામાં ભૂલ", 
// //                 status: "error", 
// //                 duration: 3000 
// //             });
// //         } finally {
// //             setSaving(false);
// //         }
// //     };

// //     const updateSalaryStatus = async (id, status) => {
// //         try {
// //             await axios.put(`http://localhost:5000/api/salary/${id}/status`, {
// //                 status, paymentDate: new Date(), paymentMode: 'bank transfer'
// //             });
// //             toast({ title: "અપડેટ", description: `સ્થિતિ બદલાઈ: ${status === 'paid' ? 'ચૂકવેલ' : 'બાકી'}`, status: "info", duration: 2000 });
// //             fetchSalaries();
// //         } catch (error) {
// //             console.error('Error updating salary status:', error);
// //             toast({ title: "ભૂલ", description: "સ્થિતિ અપડેટ કરવામાં નિષ્ફળ", status: "error", duration: 3000 });
// //         }
// //     };

// //     const handleViewDetails = (salary) => {
// //         setSelectedSalary(salary);
// //         onViewOpen();
// //     };

// //     const formatNumber = (num) => {
// //         if (!num && num !== 0) return "0.00";
// //         return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
// //     };

// //     const handleDownloadCSV = () => {
// //         const headers = [
// //             "ક્રમાંક", "કર્મચારી નામ",  "બેઝિક (₹)", "ગ્રેડ પે (₹)",
// //             "DA (₹)", "HRA (₹)", "TA (₹)", "મેડિકલ (₹)", "ઝાડુ (₹)", "ગ્રોસ (₹)",
// //             "PF (₹)", "પ્રો. ટેક્સ (₹)", "કર્મચારી ફાળો (₹)", "અન્ય ફાળો (₹)",
// //             "PLI (₹)", "સહકારી હપ્તો (₹)", "કુલ કપાત (₹)", "ચોખ્ખો પગાર (₹)", "સ્થિતિ"
// //         ];
        
// //         const rows = salaries.map((s, idx) => {
// //             const totalDeductions = (s.grossSalary || 0) - (s.netSalary || 0);
// //             return [
// //                 idx + 1, s.employeeId?.employeeName || s.employeeName || "-",
// //                  formatNumber(s.basicSalary),
// //                 formatNumber(s.gradePay), formatNumber(s.allowances?.da),
// //                 formatNumber(s.allowances?.hra), formatNumber(s.allowances?.ta),
// //                 formatNumber(s.allowances?.medical), formatNumber(s.allowances?.cleaning),
// //                 formatNumber(s.grossSalary), formatNumber(s.deductions?.pf),
// //                 formatNumber(s.deductions?.esi) formatNumber(s.deductions?.professionalTax),
// //                 formatNumber(s.deductions?.employeeContribution),
// //                 formatNumber(s.deductions?.otherContribution), formatNumber(s.deductions?.pli),
// //                 formatNumber(s.deductions?.cooperativeInstallment), formatNumber(totalDeductions),
// //                 formatNumber(s.netSalary), s.status === 'paid' ? 'ચૂકવેલ' : 'બાકી'
// //             ];
// //         });
        
// //         const csvContent = [headers.join(","), ...rows.map(row => row.map(cell => `"${cell}"`).join(","))].join("\n");
// //         const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
// //         const link = document.createElement("a");
// //         const url = URL.createObjectURL(blob);
// //         link.setAttribute("href", url);
// //         link.setAttribute("download", `pagar_patrak_${getMonthName(selectedMonth)}_${selectedYear}.csv`);
// //         document.body.appendChild(link);
// //         link.click();
// //         document.body.removeChild(link);
        
// //         toast({ title: "ડાઉનલોડ", description: "ફાઇલ ડાઉનલોડ થઈ રહી છે", status: "success", duration: 2000 });
// //     };

// //     const handlePrint = () => {
// //         window.print();
// //     };

// //     // Pagination
// //     const indexOfLastItem = currentPage * itemsPerPage;
// //     const indexOfFirstItem = indexOfLastItem - itemsPerPage;
// //     const currentItems = salaries.slice(indexOfFirstItem, indexOfLastItem);
// //     const totalPages = Math.ceil(salaries.length / itemsPerPage);
// //     const handlePageChange = (page) => setCurrentPage(page);
// //     const handleItemsPerPageChange = (newLimit) => {
// //         setItemsPerPage(newLimit);
// //         setCurrentPage(1);
// //     };

// //     // Calculate totals
// //     const totals = salaries.reduce((acc, curr) => ({
// //         totalBasic: acc.totalBasic + ((curr.basicSalary || 0) + (curr.gradePay || 0)),
// //         totalDA: acc.totalDA + (curr.allowances?.da || 0),
// //         totalHRA: acc.totalHRA + (curr.allowances?.hra || 0),
// //         totalGross: acc.totalGross + (curr.grossSalary || 0),
// //         totalPF: acc.totalPF + (curr.deductions?.pf || 0),
// //         totalNet: acc.totalNet + (curr.netSalary || 0),
// //         totalPaid: acc.totalPaid + ((curr.status === 'paid' ? curr.netSalary : 0) || 0),
// //         totalPending: acc.totalPending + ((curr.status === 'pending' ? curr.netSalary : 0) || 0)
// //     }), { totalBasic: 0, totalDA: 0, totalHRA: 0, totalGross: 0, totalPF: 0, totalNet: 0, totalPaid: 0, totalPending: 0 });

// //     // Print styles
// //     const printStyles = `
// //         @media print {
// //             body * { visibility: hidden; }
// //             .print-area, .print-area * { visibility: visible; }
// //             .print-area { position: absolute; left: 0; top: 0; width: 100%; }
// //             .no-print { display: none !important; }
// //             table { font-size: 10pt; }
// //             th, td { padding: 4px; }
// //             .print-header { display: block !important; }
// //         }
// //         @media screen {
// //             .print-header { display: none; }
// //         }
// //     `;

// //     return (
// //         <Box bg="#F8FAF9" minH="100vh" p={6}>
// //             <style dangerouslySetInnerHTML={{ __html: printStyles }} />

// //             {/* Header */}
// //             <Flex align="center" mb={6} className="no-print">
// //                 <Box width="180px">
// //                     <Button leftIcon={<FiArrowLeft />} colorScheme="green" variant="outline" onClick={() => navigate("/pe-roll")} rounded="xl">
// //                         પાછા જાવ
// //                     </Button>
// //                 </Box>
// //                 <Heading flex="1" textAlign="center" size="lg" color="green.700">પગાર પત્રક (Salary Sheet)</Heading>
// //                 <HStack spacing={2} width="180px" justify="flex-end">
// //                     <Button 
// //                         leftIcon={<FiPlus />} 
// //                         colorScheme="green" 
// //                         onClick={() => {
// //                             resetForm();
// //                             onFormOpen();
// //                         }} 
// //                         size="sm" 
// //                         rounded="xl"
// //                         bg="#307644"
// //                         _hover={{ bg: "#0F3A1F" }}
// //                     >
// //                         નવો પગાર
// //                     </Button>
// //                 </HStack>
// //             </Flex>

// //             {/* Filter Card */}
// //             <Card rounded="2xl" shadow="md" mb={6} border="1px solid #E3EDE8" className="no-print">
// //                 <CardBody>
// //                     <Stack direction={{ base: "column", md: "row" }} spacing={4} align="flex-end">
// //                         <FormControl w={{ base: "full", md: "200px" }}>
// //                             <FormLabel fontSize="sm">મહિનો</FormLabel>
// //                             <Select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} bg="white">
// //                                 {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
// //                                     <option key={month} value={month}>{getMonthName(month)}</option>
// //                                 ))}
// //                             </Select>
// //                         </FormControl>
// //                         <FormControl w={{ base: "full", md: "150px" }}>
// //                             <FormLabel fontSize="sm">વર્ષ</FormLabel>
// //                             <Input type="number" value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} bg="white" />
// //                         </FormControl>
// //                         <Button leftIcon={<FiDownload />} variant="outline" colorScheme="blue" onClick={handleDownloadCSV}>CSV</Button>
// //                         <Button leftIcon={<FiPrinter />} variant="outline" colorScheme="purple" onClick={handlePrint}>પ્રિન્ટ</Button>
// //                     </Stack>
// //                 </CardBody>
// //             </Card>

// //             {/* Totals Summary */}
// //             <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4} mb={6} className="no-print">
// //                 <Card bg="white" shadow="sm" borderLeft="4px solid #2D3748">
// //                     <CardBody p={3}><Text fontSize="xs" color="gray.500">કુલ ગ્રોસ</Text><Text fontSize="xl" fontWeight="bold">₹{formatNumber(totals.totalGross)}</Text></CardBody>
// //                 </Card>
// //                 <Card bg="white" shadow="sm" borderLeft="4px solid #38A169">
// //                     <CardBody p={3}><Text fontSize="xs" color="gray.500">કુલ નેટ</Text><Text fontSize="xl" fontWeight="bold" color="green.600">₹{formatNumber(totals.totalNet)}</Text></CardBody>
// //                 </Card>
// //                 <Card bg="white" shadow="sm" borderLeft="4px solid #3182CE">
// //                     <CardBody p={3}><Text fontSize="xs" color="gray.500">કુલ PF</Text><Text fontSize="xl" fontWeight="bold" color="blue.600">₹{formatNumber(totals.totalPF)}</Text></CardBody>
// //                 </Card>
// //                 <Card bg="white" shadow="sm" borderLeft="4px solid #F6AD55">
// //                     <CardBody p={3}><Text fontSize="xs" color="gray.500">ચૂકવેલ</Text><Text fontSize="xl" fontWeight="bold" color="orange.600">₹{formatNumber(totals.totalPaid)}</Text></CardBody>
// //                 </Card>
// //                 <Card bg="white" shadow="sm" borderLeft="4px solid #E53E3E">
// //                     <CardBody p={3}><Text fontSize="xs" color="gray.500">બાકી</Text><Text fontSize="xl" fontWeight="bold" color="red.600">₹{formatNumber(totals.totalPending)}</Text></CardBody>
// //                 </Card>
// //             </SimpleGrid>

// //             {/* Salary Table - Print Area */}
// //             <Card rounded="2xl" shadow="xl" overflow="hidden" border="1px solid #E3EDE8" className="print-area">
// //                 {/* Print Header - Title on Left, Month & Date on Right */}
// //                 <Flex 
// //                     className="print-header" 
// //                     justify="space-between" 
// //                     align="center" 
// //                     py={4} 
// //                     px={6} 
// //                     borderBottom="1px solid #E2E8F0"
// //                     bg="white"
// //                 >
// //                     <Box>
// //                         <Heading size="lg" color="green.700">પગાર પત્રક</Heading>
// //                         <Text fontSize="sm" color="gray.500">(Pagar Patrak)</Text>
// //                     </Box>
// //                     <Box textAlign="right">
// //                         <Text fontSize="lg" fontWeight="semibold" color="gray.700">
// //                             {getMonthName(selectedMonth)} {selectedYear}
// //                         </Text>
// //                         <Text fontSize="sm" color="gray.500">
// //                             તારીખ: {new Date().toLocaleDateString('gu-IN')}
// //                         </Text>
// //                     </Box>
// //                 </Flex>

// //                 <Box overflowX="auto">
// //                     <Table variant="simple" size="sm">
// //                         <Thead bg="#E8F3EC">
// //                             <Tr>
// //                                 <Th>ક્ર.</Th>
// //                                 <Th>કર્મચારી</Th>
// //                                 <Th>હોદ્દો</Th>
// //                                 <Th isNumeric>બેઝિક</Th>
// //                                 <Th isNumeric>DA</Th>
// //                                 <Th isNumeric>HRA</Th>
// //                                 <Th isNumeric>ગ્રોસ</Th>
// //                                 <Th isNumeric>PF</Th>
// //                                 <Th isNumeric>નેટ</Th>
// //                                 <Th>સ્થિતિ</Th>
// //                                 <Th className="no-print">ક્રિયા</Th>
// //                             </Tr>
// //                         </Thead>
// //                         <Tbody bg="white">
// //                             {loading ? (
// //                                 <Tr><Td colSpan={11} textAlign="center" py={10}><Spinner color="green.500" /></Td></Tr>
// //                             ) : salaries.length === 0 ? (
// //                                 <Tr><Td colSpan={11} textAlign="center" py={10} color="gray.500">આ સમયગાળા માટે કોઈ રેકોર્ડ મળ્યા નથી</Td></Tr>
// //                             ) : (
// //                                 currentItems.map((salary, idx) => (
// //                                     <Tr key={salary._id} _hover={{ bg: "gray.50" }}>
// //                                         <Td>{indexOfFirstItem + idx + 1}</Td>
// //                                         <Td>
// //                                             <Text fontWeight="500">{capitalizeWords(salary.employeeId?.employeeName || salary.employeeName || "-")}</Text>
// //                                             <Text fontSize="xs" color="gray.500">{salary.employeeId?.employeeCode || ""}</Text>
// //                                         </Td>
// //                                         <Td><Badge colorScheme="blue" fontSize="xs">{capitalizeWords(salary.employeeId?.employeePositionGujarati || "-")}</Badge></Td>
// //                                         <Td isNumeric>₹{formatNumber((salary.basicSalary || 0) + (salary.gradePay || 0))}</Td>
// //                                         <Td isNumeric>₹{formatNumber(salary.allowances?.da)}</Td>
// //                                         <Td isNumeric>₹{formatNumber(salary.allowances?.hra)}</Td>
// //                                         <Td isNumeric fontWeight="bold" color="green.600">₹{formatNumber(salary.grossSalary)}</Td>
// //                                         <Td isNumeric>₹{formatNumber(salary.deductions?.pf)}</Td>
// //                                         <Td isNumeric fontWeight="bold" color="purple.600">₹{formatNumber(salary.netSalary)}</Td>
// //                                         <Td>
// //                                             <Badge colorScheme={salary.status === 'paid' ? 'green' : 'orange'} rounded="full" px={2}>
// //                                                 {salary.status === 'paid' ? 'ચૂકવેલ' : 'બાકી'}
// //                                             </Badge>
// //                                         </Td>
// //                                         <Td className="no-print">
// //                                             <HStack spacing={1}>
// //                                                 <IconButton icon={<ViewIcon />} size="sm" colorScheme="blue" variant="ghost" onClick={() => handleViewDetails(salary)} aria-label="View" rounded="full" />
// //                                                 {salary.status === 'pending' && (
// //                                                     <IconButton icon={<FiCheckCircle />} size="sm" colorScheme="green" variant="ghost" onClick={() => updateSalaryStatus(salary._id, 'paid')} aria-label="Mark Paid" rounded="full" />
// //                                                 )}
// //                                             </HStack>
// //                                         </Td>
// //                                     </Tr>
// //                                 ))
// //                             )}
// //                         </Tbody>
// //                         {/* TFOOT with correct column alignment */}
// //                         <Tfoot bg="gray.100">
// //                             <Tr>
// //                                 <Th colSpan={3} textAlign="right">કુલ:</Th>
// //                                 <Th isNumeric>₹{formatNumber(totals.totalBasic)}</Th>
// //                                 <Th isNumeric>₹{formatNumber(totals.totalDA)}</Th>
// //                                 <Th isNumeric>₹{formatNumber(totals.totalHRA)}</Th>
// //                                 <Th isNumeric fontWeight="bold">₹{formatNumber(totals.totalGross)}</Th>
// //                                 <Th isNumeric>₹{formatNumber(totals.totalPF)}</Th>
// //                                 <Th isNumeric fontWeight="bold" color="purple.600">₹{formatNumber(totals.totalNet)}</Th>
// //                                 <Th colSpan={2}></Th>
// //                             </Tr>
// //                         </Tfoot>
// //                     </Table>
// //                 </Box>

// //                 {/* Pagination */}
// //                 {!loading && salaries.length > 0 && (
// //                     <Box className="no-print" p={4}>
// //                         <Pagination
// //                             currentPage={currentPage}
// //                             totalPages={totalPages}
// //                             onPageChange={handlePageChange}
// //                             itemsPerPage={itemsPerPage}
// //                             setItemsPerPage={handleItemsPerPageChange}
// //                         />
// //                     </Box>
// //                 )}
// //             </Card>

// //             {/* Generate Salary Modal */}
// //             <Modal isOpen={isFormOpen} onClose={onFormClose} size="xl">
// //                 <ModalOverlay />
// //                 <ModalContent borderRadius="2xl">
// //                     <ModalHeader bg="#307644" color="white" borderTopRadius="2xl">
// //                         <Flex align="center" gap={3}>
// //                             <FiPlus size={20} />
// //                             <Heading size="md" color="white">
// //                                 નવો પગાર જનરેટ કરો
// //                             </Heading>
// //                         </Flex>
// //                     </ModalHeader>
// //                     <ModalCloseButton color="white" />
                    
// //                     <ModalBody py={6} px={6}>
// //                         <VStack spacing={5} align="stretch">
// //                             <FormControl isRequired isInvalid={fieldErrors.employeeId && touched.employeeId}>
// //                                 <FormLabel fontWeight="500">કર્મચારી પસંદ કરો</FormLabel>
// //                                 <Select
// //                                     value={formData.employeeId}
// //                                     onChange={(e) => handleEmployeeChange(e.target.value)}
// //                                     onBlur={() => handleBlur('employeeId')}
// //                                     placeholder="કર્મચારી પસંદ કરો"
// //                                     bg="gray.50"
// //                                     size="lg"
// //                                     rounded="lg"
// //                                 >
// //                                     {employees.map(emp => (
// //                                         <option key={emp._id} value={emp._id}>
// //                                             {capitalizeWords(emp.employeeName)} - {capitalizeWords(emp.employeePositionGujarati || emp.employeePositionEnglish)}
// //                                         </option>
// //                                     ))}
// //                                 </Select>
// //                                 <FormErrorMessage>{fieldErrors.employeeId}</FormErrorMessage>
// //                             </FormControl>

// //                             <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
// //                                 <FormControl>
// //                                     <FormLabel fontWeight="500">મૂળ પગાર (₹)</FormLabel>
// //                                     <Input
// //                                         type="number"
// //                                         value={formData.basicSalary}
// //                                         isReadOnly
// //                                         bg="gray.100"
// //                                         size="lg"
// //                                         rounded="lg"
// //                                     />
// //                                 </FormControl>

// //                                 <FormControl>
// //                                     <FormLabel fontWeight="500">ગ્રેડ પે (₹)</FormLabel>
// //                                     <Input
// //                                         type="number"
// //                                         value={formData.gradePay}
// //                                         isReadOnly
// //                                         bg="gray.100"
// //                                         size="lg"
// //                                         rounded="lg"
// //                                     />
// //                                 </FormControl>
// //                             </SimpleGrid>

// //                             <FormControl>
// //                                 <FormLabel fontWeight="500">રીમાર્ક</FormLabel>
// //                                 <Textarea
// //                                     name="remarks"
// //                                     value={formData.remarks}
// //                                     onChange={handleChange}
// //                                     placeholder="વધારાની નોંધ લખો..."
// //                                     rows={3}
// //                                     bg="gray.50"
// //                                     rounded="lg"
// //                                     resize="vertical"
// //                                 />
// //                             </FormControl>

// //                             {/* <Alert status="info" borderRadius="lg">
// //                                 <AlertIcon />
// //                                 <Box>
// //                                     <Text fontWeight="500">પગારની ગણતરી</Text>
// //                                     <Text fontSize="sm">પગારની ગણતરી પેરામીટર સેટિંગ્સ મુજબ ઓટોમેટિક થશે</Text>
// //                                 </Box>
// //                             </Alert> */}
// //                         </VStack>
// //                     </ModalBody>

// //                     <ModalFooter borderTop="1px solid" borderColor="gray.200" gap={3}>
// //                         <Button variant="outline" colorScheme="red" onClick={onFormClose} rounded="lg">
// //                             રદ કરો
// //                         </Button>
// //                         <Button 
// //                             colorScheme="green" 
// //                             onClick={handleGenerate} 
// //                             isLoading={saving} 
// //                             leftIcon={<FiSave />} 
// //                             rounded="lg"
// //                             bg="#1E4D2B"
// //                             _hover={{ bg: "#0F3A1F" }}
// //                         >
// //                             જનરેટ કરો
// //                         </Button>
// //                     </ModalFooter>
// //                 </ModalContent>
// //             </Modal>

// //             {/* View Details Modal */}
// //             <Modal isOpen={isViewOpen} onClose={onViewClose} size="2xl">
// //                 <ModalOverlay />
// //                 <ModalContent borderRadius="2xl">
// //                     <ModalHeader bg="#1E4D2B" color="white" borderTopRadius="2xl">પગાર વિગત</ModalHeader>
// //                     <ModalCloseButton color="white" />
// //                     <ModalBody py={6}>
// //                         {selectedSalary && (
// //                             <Grid templateColumns="1fr 2fr" gap={4}>
// //                                 <Text fontWeight="bold">કર્મચારી:</Text><Text>{capitalizeWords(selectedSalary.employeeId?.employeeName)}</Text>
// //                                 <Text fontWeight="bold">બેઝિક પગાર:</Text><Text>₹{formatNumber(selectedSalary.basicSalary)}</Text>
// //                                 <Text fontWeight="bold">ગ્રેડ પે:</Text><Text>₹{formatNumber(selectedSalary.gradePay)}</Text>
// //                                 <Text fontWeight="bold">મોંઘવારી ભથ્થું:</Text><Text>₹{formatNumber(selectedSalary.allowances?.da)}</Text>
// //                                 <Text fontWeight="bold">ઘર ભાડું:</Text><Text>₹{formatNumber(selectedSalary.allowances?.hra)}</Text>
// //                                 <Text fontWeight="bold">ધોલાઈ ભથ્થું:</Text><Text>₹{formatNumber(selectedSalary.allowances?.ta)}</Text>
// //                                 <Text fontWeight="bold">મેડિકલ ભથ્થું:</Text><Text>₹{formatNumber(selectedSalary.allowances?.medical)}</Text>
// //                                 <Text fontWeight="bold">ઝાડુ ભથ્થું:</Text><Text>₹{formatNumber(selectedSalary.allowances?.cleaning)}</Text>
// //                                 <Text fontWeight="bold">ગ્રોસ પગાર:</Text><Text fontWeight="bold" color="green.600">₹{formatNumber(selectedSalary.grossSalary)}</Text>
// //                                 <Text fontWeight="bold">PF કપાત:</Text><Text>₹{formatNumber(selectedSalary.deductions?.pf)}</Text>
// //                                 <Text fontWeight="bold">કર્મચારી ફાળો:</Text><Text>₹{formatNumber(selectedSalary.deductions?.employeeContribution)}</Text>
// //                                 <Text fontWeight="bold">અન્ય ફાળો:</Text><Text>₹{formatNumber(selectedSalary.deductions?.otherContribution)}</Text>
// //                                 <Text fontWeight="bold">PLI:</Text><Text>₹{formatNumber(selectedSalary.deductions?.pli)}</Text>
// //                                 <Text fontWeight="bold">સહકારી હપ્તો:</Text><Text>₹{formatNumber(selectedSalary.deductions?.cooperativeInstallment)}</Text>
// //                                 <Text fontWeight="bold">કુલ કપાત:</Text><Text fontWeight="bold" color="red.600">₹{formatNumber(selectedSalary.grossSalary - selectedSalary.netSalary)}</Text>
// //                                 <Text fontWeight="bold">નેટ પગાર:</Text><Text fontSize="xl" fontWeight="bold" color="purple.600">₹{formatNumber(selectedSalary.netSalary)}</Text>
// //                                 <Text fontWeight="bold">સ્થિતિ:</Text><Badge colorScheme={selectedSalary.status === 'paid' ? 'green' : 'orange'}>{selectedSalary.status === 'paid' ? 'ચૂકવેલ' : 'બાકી'}</Badge>
// //                             </Grid>
// //                         )}
// //                     </ModalBody>
// //                     <ModalFooter><Button colorScheme="green" onClick={onViewClose}>બંધ કરો</Button></ModalFooter>
// //                 </ModalContent>
// //             </Modal>
// //         </Box>
// //     );
// // };

// // export default SalarySheet;


// // salarysheet.jsx
// "use client";

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import {
//     Box, Heading, Text, Button, Flex, Select, Input, Table, Thead, Tbody, Tr, Th, Td,
//     Card, CardBody, SimpleGrid, Badge, useToast, IconButton, Divider,
//     FormControl, FormLabel, Spinner, Stack, HStack, Tooltip, Alert, AlertIcon,
//     Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
//     ModalCloseButton, useDisclosure, Grid, Tfoot, VStack, FormErrorMessage, Textarea 
// } from "@chakra-ui/react";
// import { FiArrowLeft, FiPlus, FiSearch, FiSave, FiX, FiCheckCircle, FiEye, FiPrinter, FiDownload, FiRefreshCw } from "react-icons/fi";
// import { useNavigate } from "react-router-dom";
// import { ViewIcon} from "@chakra-ui/icons";
// import Pagination from "../components/Pagination";

// const SalarySheet = () => {
//     const navigate = useNavigate();
//     const toast = useToast();
//     const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
//     const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
    
//     const [salaries, setSalaries] = useState([]);
//     const [employees, setEmployees] = useState([]);
//     const [parameters, setParameters] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [saving, setSaving] = useState(false);
//     const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
//     const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
//     const [selectedSalary, setSelectedSalary] = useState(null);
//     const [currentPage, setCurrentPage] = useState(1);
//     const [itemsPerPage, setItemsPerPage] = useState(10);
//     const [fieldErrors, setFieldErrors] = useState({});
//     const [touched, setTouched] = useState({});
    
//     const [formData, setFormData] = useState({
//         employeeId: '',
//         basicSalary: '',
//         gradePay: '',
//         da: '',
//         hra: '',
//         ta: '',
//         medical: '',
//         cleaning: '',
//         pf: '',
//         esi: '',
//         professionalTax: '',
//         employeeContribution: '',
//         otherContribution: '',
//         pli: '',
//         cooperativeInstallment: '',
//         remarks: ''
//     });

//     // Get month name in Gujarati
//     const getMonthName = (month) => {
//         const months = ["જાન્યુઆરી", "ફેબ્રુઆરી", "માર્ચ", "એપ્રિલ", "મે", "જૂન",
//             "જુલાઈ", "ઑગસ્ટ", "સપ્ટેમ્બર", "ઑક્ટોબર", "નવેમ્બર", "ડિસેમ્બર"];
//         return months[month - 1] || "";
//     };

//     // Get parameter value by name
//     const getParameterValue = (examName) => {
//         const param = parameters.find(p => p.examName === examName);
//         return param ? parseFloat(param.value) : 0;
//     };

//     // Calculate salary based on parameters from settings
//     const calculateSalary = (basicSalary, gradePay = 0) => {
//         const totalBasic = basicSalary + gradePay;
        
//         const daPercentage = getParameterValue("પ્રકાર-૧") || 50;
//         const hraAmount = getParameterValue("પ્રકાર-૨") || 0;
//         const taAmount = getParameterValue("પ્રકાર-૩") || 0;
//         const medicalAmount = getParameterValue("પ્રકાર-૪") || 1250;
//         const cleaningAmount = getParameterValue("પ્રકાર-૫") || 0;
//         const pfPercentage = getParameterValue("પી.એફ. વ્યાજ") || 12;
        
//         const da = totalBasic * (daPercentage / 100);
//         const hra = hraAmount;
//         const ta = taAmount;
//         const medical = medicalAmount;
//         const cleaning = cleaningAmount;
//         const grossSalary = totalBasic + da + hra + ta + medical + cleaning;
//         const pf = totalBasic * (pfPercentage / 100);
//         const esi = totalBasic <= 21000 ? totalBasic * 0.0075 : 0;
//         const professionalTax = totalBasic > 15000 ? 200 : 0;
        
//         return { 
//             totalBasic, da, hra, ta, medical, cleaning, grossSalary, 
//             pf, esi, professionalTax, daPercentage, pfPercentage
//         };
//     };

//     // Fetch all required data
//     useEffect(() => {
//         fetchSalaries();
//         fetchEmployees();
//         fetchParameters();
//     }, [selectedMonth, selectedYear]);

//     const fetchSalaries = async () => {
//         setLoading(true);
//         try {
//             const response = await axios.get(`http://localhost:5000/api/salary?month=${selectedMonth}&year=${selectedYear}`);
//             setSalaries(response.data);
//         } catch (error) {
//             console.error('Error fetching salaries:', error);
//             toast({ title: "ભૂલ", description: "પગાર રેકોર્ડ લોડ કરવામાં નિષ્ફળ", status: "error", duration: 3000 });
//         } finally {
//             setLoading(false);
//         }
//     };

//     const fetchEmployees = async () => {
//         try {
//             const response = await axios.get('http://localhost:5000/api/employee');
//             setEmployees(response.data.filter(emp => emp.isActive !== false));
//         } catch (error) {
//             console.error('Error fetching employees:', error);
//         }
//     };

//     const fetchParameters = async () => {
//         try {
//             const response = await axios.get('http://localhost:5000/api/parameter');
//             setParameters(response.data);
//         } catch (error) {
//             console.error('Error fetching parameters:', error);
//         }
//     };

//     // Helper function to capitalize first letter of each word
//     const capitalizeWords = (str) => {
//         if (!str) return '';
//         return str.replace(/\b\w/g, char => char.toUpperCase());
//     };

//     // Auto-calculate when employee is selected
//     const handleEmployeeChange = (employeeId) => {
//         const employee = employees.find(emp => emp._id === employeeId);
//         if (employee) {
//             const basicPay = parseFloat(employee.basicPay) || 0;
//             const gradePay = parseFloat(employee.gradePay) || 0;
//             const calculated = calculateSalary(basicPay, gradePay);
            
//             setFormData({
//                 ...formData,
//                 employeeId: employeeId,
//                 basicSalary: basicPay.toString(),
//                 gradePay: gradePay.toString(),
//                 da: calculated.da.toString(),
//                 hra: calculated.hra.toString(),
//                 ta: calculated.ta.toString(),
//                 medical: calculated.medical.toString(),
//                 cleaning: calculated.cleaning.toString(),
//                 pf: calculated.pf.toString(),
//                 esi: calculated.esi.toString(),
//                 professionalTax: calculated.professionalTax.toString(),
//                 employeeContribution: employee.employeeContribution?.toString() || "0",
//                 otherContribution: employee.otherContribution?.toString() || "0",
//                 pli: employee.pli?.toString() || "0",
//                 cooperativeInstallment: employee.cooperativeInstallment?.toString() || "0"
//             });
            
//             // Clear error for employee field
//             if (fieldErrors.employeeId) {
//                 setFieldErrors(prev => ({ ...prev, employeeId: undefined }));
//             }
//         } else {
//             setFormData({ ...formData, employeeId: employeeId });
//         }
//     };

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData({ ...formData, [name]: value });
//         // Clear error for the field being edited
//         if (fieldErrors[name]) {
//             setFieldErrors(prev => ({ ...prev, [name]: undefined }));
//         }
//     };

//     const handleBlur = (fieldName) => {
//         setTouched({ ...touched, [fieldName]: true });
//         validateField(fieldName, formData[fieldName]);
//     };

//     const validateField = (fieldName, value) => {
//         const newErrors = { ...fieldErrors };
        
//         switch(fieldName) {
//             case 'employeeId':
//                 if (!value) {
//                     newErrors.employeeId = "કર્મચારી પસંદ કરવો ફરજિયાત છે";
//                 } else {
//                     delete newErrors.employeeId;
//                 }
//                 break;
//             default:
//                 break;
//         }
        
//         setFieldErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };

//     const validateForm = () => {
//         const newErrors = {};
        
//         if (!formData.employeeId) {
//             newErrors.employeeId = "કર્મચારી પસંદ કરવો ફરજિયાત છે";
//         }
        
//         setFieldErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };

//     const resetForm = () => {
//         setFormData({
//             employeeId: '',
//             basicSalary: '',
//             gradePay: '',
//             da: '',
//             hra: '',
//             ta: '',
//             medical: '',
//             cleaning: '',
//             pf: '',
//             esi: '',
//             professionalTax: '',
//             employeeContribution: '',
//             otherContribution: '',
//             pli: '',
//             cooperativeInstallment: '',
//             remarks: ''
//         });
//         setFieldErrors({});
//         setTouched({});
//     };

//     const handleGenerate = async () => {
//         if (!validateForm()) {
//             toast({ 
//                 title: "ભૂલ", 
//                 description: "કૃપા કરી કર્મચારી પસંદ કરો", 
//                 status: "error", 
//                 duration: 3000 
//             });
//             return;
//         }
        
//         setSaving(true);
//         try {
//             const basic = parseFloat(formData.basicSalary) || 0;
//             const grade = parseFloat(formData.gradePay) || 0;
//             const calc = calculateSalary(basic, grade);
//             const employee = employees.find(emp => emp._id === formData.employeeId);
            
//             const allowances = {
//                 da: calc.da, hra: calc.hra, ta: calc.ta, medical: calc.medical,
//                 cleaning: calc.cleaning, special: 0, other: 0
//             };
            
//             const deductions = {
//                 pf: calc.pf, esi: calc.esi, professionalTax: calc.professionalTax,
//                 employeeContribution: parseFloat(formData.employeeContribution) || 0,
//                 otherContribution: parseFloat(formData.otherContribution) || 0,
//                 pli: parseFloat(formData.pli) || 0,
//                 cooperativeInstallment: parseFloat(formData.cooperativeInstallment) || 0,
//                 tds: 0, advance: 0, other: 0
//             };
            
//             const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + (val || 0), 0);
//             const netSalary = calc.grossSalary - totalDeductions;
            
//             const payload = {
//                 employeeId: formData.employeeId, month: selectedMonth, year: selectedYear,
//                 basicSalary: basic, gradePay: grade, allowances, deductions,
//                 grossSalary: calc.grossSalary, netSalary: netSalary,
//                 remarks: formData.remarks || "", status: 'pending'
//             };
            
//             await axios.post('http://localhost:5000/api/salary/generate', payload);
            
//             toast({ 
//                 title: "સફળ", 
//                 description: `પગાર જનરેટ થયો: ગ્રોસ ₹${formatNumber(calc.grossSalary)}, નેટ ₹${formatNumber(netSalary)}`, 
//                 status: "success", 
//                 duration: 3000 
//             });
            
//             fetchSalaries();
//             resetForm();
//             onFormClose();
//         } catch (error) {
//             console.error('Error generating salary:', error);
//             toast({ 
//                 title: "ભૂલ", 
//                 description: error.response?.data?.message || "પગાર જનરેટ કરવામાં ભૂલ", 
//                 status: "error", 
//                 duration: 3000 
//             });
//         } finally {
//             setSaving(false);
//         }
//     };

//     const updateSalaryStatus = async (id, status) => {
//         try {
//             await axios.put(`http://localhost:5000/api/salary/${id}/status`, {
//                 status, paymentDate: new Date(), paymentMode: 'bank transfer'
//             });
//             toast({ title: "અપડેટ", description: `સ્થિતિ બદલાઈ: ${status === 'paid' ? 'ચૂકવેલ' : 'બાકી'}`, status: "info", duration: 2000 });
//             fetchSalaries();
//         } catch (error) {
//             console.error('Error updating salary status:', error);
//             toast({ title: "ભૂલ", description: "સ્થિતિ અપડેટ કરવામાં નિષ્ફળ", status: "error", duration: 3000 });
//         }
//     };

//     const handleViewDetails = (salary) => {
//         setSelectedSalary(salary);
//         onViewOpen();
//     };

//     const formatNumber = (num) => {
//         if (!num && num !== 0) return "0.00";
//         return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
//     };

//     const handleDownloadCSV = () => {
//         const headers = [
//             "ક્રમાંક", "કર્મચારી નામ", "કર્મચારી કોડ", "બેઝિક (₹)", "ગ્રેડ પે (₹)",
//             "DA (₹)", "HRA (₹)", "TA (₹)", "મેડિકલ (₹)", "ઝાડુ (₹)", "ગ્રોસ (₹)",
//             "PF (₹)", "ESI (₹)", "પ્રો. ટેક્સ (₹)", "કર્મચારી ફાળો (₹)", "અન્ય ફાળો (₹)",
//             "PLI (₹)", "સહકારી હપ્તો (₹)", "કુલ કપાત (₹)", "ચોખ્ખો પગાર (₹)", "સ્થિતિ"
//         ];
        
//         const rows = salaries.map((s, idx) => {
//             const totalDeductions = (s.grossSalary || 0) - (s.netSalary || 0);
            
//             // Get employee name with proper capitalization for English words
//             let employeeName = s.employeeId?.employeeName || s.employeeName || "-";
//             // Apply capitalization to English words only (preserve Gujarati)
//             employeeName = employeeName.replace(/\b[A-Za-z]+(?:['’][A-Za-z]+)?\b/g, word => 
//                 word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
//             );
            
//             return [
//                 idx + 1, 
//                 employeeName,
//                 s.employeeId?.employeeCode || "-", 
//                 formatNumber(s.basicSalary),
//                 formatNumber(s.gradePay), 
//                 formatNumber(s.allowances?.da),
//                 formatNumber(s.allowances?.hra), 
//                 formatNumber(s.allowances?.ta),
//                 formatNumber(s.allowances?.medical), 
//                 formatNumber(s.allowances?.cleaning),
//                 formatNumber(s.grossSalary), 
//                 formatNumber(s.deductions?.pf),
//                 formatNumber(s.deductions?.esi), 
//                 formatNumber(s.deductions?.professionalTax),
//                 formatNumber(s.deductions?.employeeContribution),
//                 formatNumber(s.deductions?.otherContribution), 
//                 formatNumber(s.deductions?.pli),
//                 formatNumber(s.deductions?.cooperativeInstallment), 
//                 formatNumber(totalDeductions),
//                 formatNumber(s.netSalary), 
//                 s.status === 'paid' ? 'ચૂકવેલ' : 'બાકી'
//             ];
//         });
        
//         const csvContent = [headers.join(","), ...rows.map(row => row.map(cell => `"${cell}"`).join(","))].join("\n");
        
//         // Add BOM for UTF-8 to ensure Gujarati characters display correctly
//         const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
//         const link = document.createElement("a");
//         const url = URL.createObjectURL(blob);
//         link.setAttribute("href", url);
//         link.setAttribute("download", `pagar_patrak_${getMonthName(selectedMonth)}_${selectedYear}.csv`);
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
        
//         toast({ title: "ડાઉનલોડ", description: "ફાઇલ ડાઉનલોડ થઈ રહી છે", status: "success", duration: 2000 });
//     };

//     const handlePrint = () => {
//         window.print();
//     };

//     // Pagination
//     const indexOfLastItem = currentPage * itemsPerPage;
//     const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//     const currentItems = salaries.slice(indexOfFirstItem, indexOfLastItem);
//     const totalPages = Math.ceil(salaries.length / itemsPerPage);
//     const handlePageChange = (page) => setCurrentPage(page);
//     const handleItemsPerPageChange = (newLimit) => {
//         setItemsPerPage(newLimit);
//         setCurrentPage(1);
//     };

//     // Calculate totals
//     const totals = salaries.reduce((acc, curr) => ({
//         totalBasic: acc.totalBasic + ((curr.basicSalary || 0) + (curr.gradePay || 0)),
//         totalDA: acc.totalDA + (curr.allowances?.da || 0),
//         totalHRA: acc.totalHRA + (curr.allowances?.hra || 0),
//         totalGross: acc.totalGross + (curr.grossSalary || 0),
//         totalPF: acc.totalPF + (curr.deductions?.pf || 0),
//         totalNet: acc.totalNet + (curr.netSalary || 0),
//         totalPaid: acc.totalPaid + ((curr.status === 'paid' ? curr.netSalary : 0) || 0),
//         totalPending: acc.totalPending + ((curr.status === 'pending' ? curr.netSalary : 0) || 0)
//     }), { totalBasic: 0, totalDA: 0, totalHRA: 0, totalGross: 0, totalPF: 0, totalNet: 0, totalPaid: 0, totalPending: 0 });

//     // Print styles
//     const printStyles = `
//         @media print {
//             body * { visibility: hidden; }
//             .print-area, .print-area * { visibility: visible; }
//             .print-area { position: absolute; left: 0; top: 0; width: 100%; }
//             .no-print { display: none !important; }
//             table { font-size: 10pt; }
//             th, td { padding: 4px; }
//             .print-header { display: block !important; }
//         }
//         @media screen {
//             .print-header { display: none; }
//         }
//     `;

//     return (
//         <Box bg="#F8FAF9" minH="100vh" p={6}>
//             <style dangerouslySetInnerHTML={{ __html: printStyles }} />

//             {/* Header */}
//             <Flex align="center" mb={6} className="no-print">
//                 <Box width="180px">
//                     <Button leftIcon={<FiArrowLeft />} colorScheme="green" variant="outline" onClick={() => navigate("/pe-roll")} rounded="xl">
//                         પાછા જાવ
//                     </Button>
//                 </Box>
//                 <Heading flex="1" textAlign="center" size="lg" color="green.700">પગાર પત્રક (Salary Sheet)</Heading>
//                 <HStack spacing={2} width="180px" justify="flex-end">
//                     <Button 
//                         leftIcon={<FiPlus />} 
//                         colorScheme="green" 
//                         onClick={() => {
//                             resetForm();
//                             onFormOpen();
//                         }} 
//                         size="sm" 
//                         rounded="xl"
//                         bg="#307644"
//                         _hover={{ bg: "#0F3A1F" }}
//                     >
//                         નવો પગાર
//                     </Button>
//                 </HStack>
//             </Flex>

//             {/* Filter Card */}
//             <Card rounded="2xl" shadow="md" mb={6} border="1px solid #E3EDE8" className="no-print">
//                 <CardBody>
//                     <Stack direction={{ base: "column", md: "row" }} spacing={4} align="flex-end">
//                         <FormControl w={{ base: "full", md: "200px" }}>
//                             <FormLabel fontSize="sm">મહિનો</FormLabel>
//                             <Select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} bg="white">
//                                 {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
//                                     <option key={month} value={month}>{getMonthName(month)}</option>
//                                 ))}
//                             </Select>
//                         </FormControl>
//                         <FormControl w={{ base: "full", md: "150px" }}>
//                             <FormLabel fontSize="sm">વર્ષ</FormLabel>
//                             <Input type="number" value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} bg="white" />
//                         </FormControl>
//                         <Button leftIcon={<FiDownload />} variant="outline" colorScheme="blue" onClick={handleDownloadCSV}>CSV</Button>
//                         <Button leftIcon={<FiPrinter />} variant="outline" colorScheme="purple" onClick={handlePrint}>પ્રિન્ટ</Button>
//                     </Stack>
//                 </CardBody>
//             </Card>

//             {/* Totals Summary */}
//             <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4} mb={6} className="no-print">
//                 <Card bg="white" shadow="sm" borderLeft="4px solid #2D3748">
//                     <CardBody p={3}><Text fontSize="xs" color="gray.500">કુલ ગ્રોસ</Text><Text fontSize="xl" fontWeight="bold">₹{formatNumber(totals.totalGross)}</Text></CardBody>
//                 </Card>
//                 <Card bg="white" shadow="sm" borderLeft="4px solid #38A169">
//                     <CardBody p={3}><Text fontSize="xs" color="gray.500">કુલ નેટ</Text><Text fontSize="xl" fontWeight="bold" color="green.600">₹{formatNumber(totals.totalNet)}</Text></CardBody>
//                 </Card>
//                 <Card bg="white" shadow="sm" borderLeft="4px solid #3182CE">
//                     <CardBody p={3}><Text fontSize="xs" color="gray.500">કુલ PF</Text><Text fontSize="xl" fontWeight="bold" color="blue.600">₹{formatNumber(totals.totalPF)}</Text></CardBody>
//                 </Card>
//                 <Card bg="white" shadow="sm" borderLeft="4px solid #F6AD55">
//                     <CardBody p={3}><Text fontSize="xs" color="gray.500">ચૂકવેલ</Text><Text fontSize="xl" fontWeight="bold" color="orange.600">₹{formatNumber(totals.totalPaid)}</Text></CardBody>
//                 </Card>
//                 <Card bg="white" shadow="sm" borderLeft="4px solid #E53E3E">
//                     <CardBody p={3}><Text fontSize="xs" color="gray.500">બાકી</Text><Text fontSize="xl" fontWeight="bold" color="red.600">₹{formatNumber(totals.totalPending)}</Text></CardBody>
//                 </Card>
//             </SimpleGrid>

//             {/* Salary Table - Print Area */}
//             <Card rounded="2xl" shadow="xl" overflow="hidden" border="1px solid #E3EDE8" className="print-area">
//                 {/* Print Header - Title on Left, Month & Date on Right */}
//                 <Flex 
//                     className="print-header" 
//                     justify="space-between" 
//                     align="center" 
//                     py={4} 
//                     px={6} 
//                     borderBottom="1px solid #E2E8F0"
//                     bg="white"
//                 >
//                     <Box>
//                         <Heading size="lg" color="green.700">પગાર પત્રક</Heading>
//                         <Text fontSize="sm" color="gray.500">(Pagar Patrak)</Text>
//                     </Box>
//                     <Box textAlign="right">
//                         <Text fontSize="lg" fontWeight="semibold" color="gray.700">
//                             {getMonthName(selectedMonth)} {selectedYear}
//                         </Text>
//                         <Text fontSize="sm" color="gray.500">
//                             તારીખ: {new Date().toLocaleDateString('gu-IN')}
//                         </Text>
//                     </Box>
//                 </Flex>

//                 <Box overflowX="auto">
//                     <Table variant="simple" size="sm">
//                         <Thead bg="#E8F3EC">
//                             <Tr>
//                                 <Th>ક્ર.</Th>
//                                 <Th>કર્મચારી</Th>
//                                 <Th>હોદ્દો</Th>
//                                 <Th isNumeric>બેઝિક</Th>
//                                 <Th isNumeric>DA</Th>
//                                 <Th isNumeric>HRA</Th>
//                                 <Th isNumeric>ગ્રોસ</Th>
//                                 <Th isNumeric>PF</Th>
//                                 <Th isNumeric>નેટ</Th>
//                                 <Th>સ્થિતિ</Th>
//                                 <Th className="no-print">ક્રિયા</Th>
//                             </Tr>
//                         </Thead>
//                         <Tbody bg="white">
//                             {loading ? (
//                                 <Tr><Td colSpan={11} textAlign="center" py={10}><Spinner color="green.500" /></Td></Tr>
//                             ) : salaries.length === 0 ? (
//                                 <Tr><Td colSpan={11} textAlign="center" py={10} color="gray.500">આ સમયગાળા માટે કોઈ રેકોર્ડ મળ્યા નથી</Td></Tr>
//                             ) : (
//                                 currentItems.map((salary, idx) => (
//                                     <Tr key={salary._id} _hover={{ bg: "gray.50" }}>
//                                         <Td>{indexOfFirstItem + idx + 1}</Td>
//                                         <Td>
//                                             <Text fontWeight="500">{capitalizeWords(salary.employeeId?.employeeName || salary.employeeName || "-")}</Text>
//                                             <Text fontSize="xs" color="gray.500">{salary.employeeId?.employeeCode || ""}</Text>
//                                         </Td>
//                                         <Td><Badge colorScheme="blue" fontSize="xs">{capitalizeWords(salary.employeeId?.employeePositionGujarati || "-")}</Badge></Td>
//                                         <Td isNumeric>₹{formatNumber((salary.basicSalary || 0) + (salary.gradePay || 0))}</Td>
//                                         <Td isNumeric>₹{formatNumber(salary.allowances?.da)}</Td>
//                                         <Td isNumeric>₹{formatNumber(salary.allowances?.hra)}</Td>
//                                         <Td isNumeric fontWeight="bold" color="green.600">₹{formatNumber(salary.grossSalary)}</Td>
//                                         <Td isNumeric>₹{formatNumber(salary.deductions?.pf)}</Td>
//                                         <Td isNumeric fontWeight="bold" color="purple.600">₹{formatNumber(salary.netSalary)}</Td>
//                                         <Td>
//                                             <Badge colorScheme={salary.status === 'paid' ? 'green' : 'orange'} rounded="full" px={2}>
//                                                 {salary.status === 'paid' ? 'ચૂકવેલ' : 'બાકી'}
//                                             </Badge>
//                                         </Td>
//                                         <Td className="no-print">
//                                             <HStack spacing={1}>
//                                                 <IconButton icon={<ViewIcon />} size="sm" colorScheme="blue" variant="ghost" onClick={() => handleViewDetails(salary)} aria-label="View" rounded="full" />
//                                                 {salary.status === 'pending' && (
//                                                     <IconButton icon={<FiCheckCircle />} size="sm" colorScheme="green" variant="ghost" onClick={() => updateSalaryStatus(salary._id, 'paid')} aria-label="Mark Paid" rounded="full" />
//                                                 )}
//                                             </HStack>
//                                         </Td>
//                                     </Tr>
//                                 ))
//                             )}
//                         </Tbody>
//                         {/* TFOOT with correct column alignment */}
//                         <Tfoot bg="gray.100">
//                             <Tr>
//                                 <Th colSpan={3} textAlign="right">કુલ:</Th>
//                                 <Th isNumeric>₹{formatNumber(totals.totalBasic)}</Th>
//                                 <Th isNumeric>₹{formatNumber(totals.totalDA)}</Th>
//                                 <Th isNumeric>₹{formatNumber(totals.totalHRA)}</Th>
//                                 <Th isNumeric fontWeight="bold">₹{formatNumber(totals.totalGross)}</Th>
//                                 <Th isNumeric>₹{formatNumber(totals.totalPF)}</Th>
//                                 <Th isNumeric fontWeight="bold" color="purple.600">₹{formatNumber(totals.totalNet)}</Th>
//                                 <Th colSpan={2}></Th>
//                             </Tr>
//                         </Tfoot>
//                     </Table>
//                 </Box>

//                 {/* Pagination */}
//                 {!loading && salaries.length > 0 && (
//                     <Box className="no-print" p={4}>
//                         <Pagination
//                             currentPage={currentPage}
//                             totalPages={totalPages}
//                             onPageChange={handlePageChange}
//                             itemsPerPage={itemsPerPage}
//                             setItemsPerPage={handleItemsPerPageChange}
//                         />
//                     </Box>
//                 )}
//             </Card>

//             {/* Generate Salary Modal */}
//             <Modal isOpen={isFormOpen} onClose={onFormClose} size="xl">
//                 <ModalOverlay />
//                 <ModalContent borderRadius="2xl">
//                     <ModalHeader bg="#307644" color="white" borderTopRadius="2xl">
//                         <Flex align="center" gap={3}>
//                             <FiPlus size={20} />
//                             <Heading size="md" color="white">
//                                 નવો પગાર જનરેટ કરો
//                             </Heading>
//                         </Flex>
//                     </ModalHeader>
//                     <ModalCloseButton color="white" />
                    
//                     <ModalBody py={6} px={6}>
//                         <VStack spacing={5} align="stretch">
//                             <FormControl isRequired isInvalid={fieldErrors.employeeId && touched.employeeId}>
//                                 <FormLabel fontWeight="500">કર્મચારી પસંદ કરો</FormLabel>
//                                 <Select
//                                     value={formData.employeeId}
//                                     onChange={(e) => handleEmployeeChange(e.target.value)}
//                                     onBlur={() => handleBlur('employeeId')}
//                                     placeholder="કર્મચારી પસંદ કરો"
//                                     bg="gray.50"
//                                     size="lg"
//                                     rounded="lg"
//                                 >
//                                     {employees.map(emp => (
//                                         <option key={emp._id} value={emp._id}>
//                                             {capitalizeWords(emp.employeeName)} - {capitalizeWords(emp.employeePositionGujarati || emp.employeePositionEnglish)}
//                                         </option>
//                                     ))}
//                                 </Select>
//                                 <FormErrorMessage>{fieldErrors.employeeId}</FormErrorMessage>
//                             </FormControl>

//                             <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
//                                 <FormControl>
//                                     <FormLabel fontWeight="500">મૂળ પગાર (₹)</FormLabel>
//                                     <Input
//                                         type="number"
//                                         value={formData.basicSalary}
//                                         isReadOnly
//                                         bg="gray.100"
//                                         size="lg"
//                                         rounded="lg"
//                                     />
//                                 </FormControl>

//                                 <FormControl>
//                                     <FormLabel fontWeight="500">ગ્રેડ પે (₹)</FormLabel>
//                                     <Input
//                                         type="number"
//                                         value={formData.gradePay}
//                                         isReadOnly
//                                         bg="gray.100"
//                                         size="lg"
//                                         rounded="lg"
//                                     />
//                                 </FormControl>
//                             </SimpleGrid>

//                             <FormControl>
//                                 <FormLabel fontWeight="500">રીમાર્ક</FormLabel>
//                                 <Textarea
//                                     name="remarks"
//                                     value={formData.remarks}
//                                     onChange={handleChange}
//                                     placeholder="વધારાની નોંધ લખો..."
//                                     rows={3}
//                                     bg="gray.50"
//                                     rounded="lg"
//                                     resize="vertical"
//                                 />
//                             </FormControl>
//                         </VStack>
//                     </ModalBody>

//                     <ModalFooter borderTop="1px solid" borderColor="gray.200" gap={3}>
//                         <Button variant="outline" colorScheme="red" onClick={onFormClose} rounded="lg">
//                             રદ કરો
//                         </Button>
//                         <Button 
//                             colorScheme="green" 
//                             onClick={handleGenerate} 
//                             isLoading={saving} 
//                             leftIcon={<FiSave />} 
//                             rounded="lg"
//                             bg="#1E4D2B"
//                             _hover={{ bg: "#0F3A1F" }}
//                         >
//                             જનરેટ કરો
//                         </Button>
//                     </ModalFooter>
//                 </ModalContent>
//             </Modal>

//             {/* View Details Modal */}
//             <Modal isOpen={isViewOpen} onClose={onViewClose} size="2xl">
//                 <ModalOverlay />
//                 <ModalContent borderRadius="2xl">
//                     <ModalHeader bg="#1E4D2B" color="white" borderTopRadius="2xl">પગાર વિગત</ModalHeader>
//                     <ModalCloseButton color="white" />
//                     <ModalBody py={6}>
//                         {selectedSalary && (
//                             <Grid templateColumns="1fr 2fr" gap={4}>
//                                 <Text fontWeight="bold">કર્મચારી:</Text><Text>{capitalizeWords(selectedSalary.employeeId?.employeeName)}</Text>
//                                 <Text fontWeight="bold">બેઝિક પગાર:</Text><Text>₹{formatNumber(selectedSalary.basicSalary)}</Text>
//                                 <Text fontWeight="bold">ગ્રેડ પે:</Text><Text>₹{formatNumber(selectedSalary.gradePay)}</Text>
//                                 <Text fontWeight="bold">મોંઘવારી ભથ્થું:</Text><Text>₹{formatNumber(selectedSalary.allowances?.da)}</Text>
//                                 <Text fontWeight="bold">ઘર ભાડું:</Text><Text>₹{formatNumber(selectedSalary.allowances?.hra)}</Text>
//                                 <Text fontWeight="bold">ધોલાઈ ભથ્થું:</Text><Text>₹{formatNumber(selectedSalary.allowances?.ta)}</Text>
//                                 <Text fontWeight="bold">મેડિકલ ભથ્થું:</Text><Text>₹{formatNumber(selectedSalary.allowances?.medical)}</Text>
//                                 <Text fontWeight="bold">ઝાડુ ભથ્થું:</Text><Text>₹{formatNumber(selectedSalary.allowances?.cleaning)}</Text>
//                                 <Text fontWeight="bold">ગ્રોસ પગાર:</Text><Text fontWeight="bold" color="green.600">₹{formatNumber(selectedSalary.grossSalary)}</Text>
//                                 <Text fontWeight="bold">PF કપાત:</Text><Text>₹{formatNumber(selectedSalary.deductions?.pf)}</Text>
//                                 <Text fontWeight="bold">કર્મચારી ફાળો:</Text><Text>₹{formatNumber(selectedSalary.deductions?.employeeContribution)}</Text>
//                                 <Text fontWeight="bold">અન્ય ફાળો:</Text><Text>₹{formatNumber(selectedSalary.deductions?.otherContribution)}</Text>
//                                 <Text fontWeight="bold">PLI:</Text><Text>₹{formatNumber(selectedSalary.deductions?.pli)}</Text>
//                                 <Text fontWeight="bold">સહકારી હપ્તો:</Text><Text>₹{formatNumber(selectedSalary.deductions?.cooperativeInstallment)}</Text>
//                                 <Text fontWeight="bold">કુલ કપાત:</Text><Text fontWeight="bold" color="red.600">₹{formatNumber(selectedSalary.grossSalary - selectedSalary.netSalary)}</Text>
//                                 <Text fontWeight="bold">નેટ પગાર:</Text><Text fontSize="xl" fontWeight="bold" color="purple.600">₹{formatNumber(selectedSalary.netSalary)}</Text>
//                                 <Text fontWeight="bold">સ્થિતિ:</Text><Badge colorScheme={selectedSalary.status === 'paid' ? 'green' : 'orange'}>{selectedSalary.status === 'paid' ? 'ચૂકવેલ' : 'બાકી'}</Badge>
//                             </Grid>
//                         )}
//                     </ModalBody>
//                     <ModalFooter><Button colorScheme="green" onClick={onViewClose}>બંધ કરો</Button></ModalFooter>
//                 </ModalContent>
//             </Modal>
//         </Box>
//     );
// };

// export default SalarySheet;

// salarysheet.jsx
"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box, Heading, Text, Button, Flex, Select, Input, Table, Thead, Tbody, Tr, Th, Td,
    Card, CardBody, SimpleGrid, Badge, useToast, IconButton, Divider,
    FormControl, FormLabel, Spinner, Stack, HStack, Tooltip, Alert, AlertIcon,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
    ModalCloseButton, useDisclosure, Grid, Tfoot, VStack, FormErrorMessage, Textarea 
} from "@chakra-ui/react";
import { FiArrowLeft, FiPlus, FiSearch, FiSave, FiX, FiCheckCircle, FiEye, FiPrinter, FiDownload, FiRefreshCw } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { ViewIcon} from "@chakra-ui/icons";
import Pagination from "../components/Pagination";

const SalarySheet = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
    const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
    const [salaries, setSalaries] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [parameters, setParameters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedSalary, setSelectedSalary] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [fieldErrors, setFieldErrors] = useState({});
    const [touched, setTouched] = useState({});
    
    const [formData, setFormData] = useState({
        employeeId: '',
        basicSalary: '',
        gradePay: '',
        da: '',
        hra: '',
        ta: '',
        medical: '',
        cleaning: '',
        pf: '',
        esi: '',
        professionalTax: '',
        employeeContribution: '',
        otherContribution: '',
        pli: '',
        cooperativeInstallment: '',
        remarks: ''
    });

    // Get month name in Gujarati
    const getMonthName = (month) => {
        const months = ["જાન્યુઆરી", "ફેબ્રુઆરી", "માર્ચ", "એપ્રિલ", "મે", "જૂન",
            "જુલાઈ", "ઑગસ્ટ", "સપ્ટેમ્બર", "ઑક્ટોબર", "નવેમ્બર", "ડિસેમ્બર"];
        return months[month - 1] || "";
    };

    // Get parameter value by name
    const getParameterValue = (examName) => {
        const param = parameters.find(p => p.examName === examName);
        return param ? parseFloat(param.value) : 0;
    };

    // Calculate salary based on parameters from settings
    const calculateSalary = (basicSalary, gradePay = 0) => {
        const totalBasic = basicSalary + gradePay;
        
        const daPercentage = getParameterValue("પ્રકાર-૧") || 50;
        const hraAmount = getParameterValue("પ્રકાર-૨") || 0;
        const taAmount = getParameterValue("પ્રકાર-૩") || 0;
        const medicalAmount = getParameterValue("પ્રકાર-૪") || 1250;
        const cleaningAmount = getParameterValue("પ્રકાર-૫") || 0;
        const pfPercentage = getParameterValue("પી.એફ. વ્યાજ") || 12;
        
        // ✅ FIXED: DA should be calculated as percentage of totalBasic
        const da = totalBasic * (daPercentage / 100);
        const hra = hraAmount;
        const ta = taAmount;
        const medical = medicalAmount;
        const cleaning = cleaningAmount;
        const grossSalary = totalBasic + da + hra + ta + medical + cleaning;
        const pf = totalBasic * (pfPercentage / 100);
        const esi = totalBasic <= 21000 ? totalBasic * 0.0075 : 0;
        const professionalTax = totalBasic > 15000 ? 200 : 0;
        
        return { 
            totalBasic, da, hra, ta, medical, cleaning, grossSalary, 
            pf, esi, professionalTax, daPercentage, pfPercentage
        };
    };

    // Fetch all required data
    useEffect(() => {
        fetchSalaries();
        fetchEmployees();
        fetchParameters();
    }, [selectedMonth, selectedYear]);

    const fetchSalaries = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:5000/api/salary?month=${selectedMonth}&year=${selectedYear}`);
            setSalaries(response.data);
        } catch (error) {
            console.error('Error fetching salaries:', error);
            toast({ title: "ભૂલ", description: "પગાર રેકોર્ડ લોડ કરવામાં નિષ્ફળ", status: "error", duration: 3000 });
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/employee');
            setEmployees(response.data.filter(emp => emp.isActive !== false));
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const fetchParameters = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/parameter');
            setParameters(response.data);
        } catch (error) {
            console.error('Error fetching parameters:', error);
        }
    };

    // Helper function to capitalize first letter of each word
    const capitalizeWords = (str) => {
        if (!str) return '';
        return str.replace(/\b\w/g, char => char.toUpperCase());
    };

    // Auto-calculate when employee is selected
    const handleEmployeeChange = (employeeId) => {
        const employee = employees.find(emp => emp._id === employeeId);
        if (employee) {
            const basicPay = parseFloat(employee.basicPay) || 0;
            const gradePay = parseFloat(employee.gradePay) || 0;
            const calculated = calculateSalary(basicPay, gradePay);
            
            setFormData({
                ...formData,
                employeeId: employeeId,
                basicSalary: basicPay.toString(),
                gradePay: gradePay.toString(),
                da: calculated.da.toString(),
                hra: calculated.hra.toString(),
                ta: calculated.ta.toString(),
                medical: calculated.medical.toString(),
                cleaning: calculated.cleaning.toString(),
                pf: calculated.pf.toString(),
                esi: calculated.esi.toString(),
                professionalTax: calculated.professionalTax.toString(),
                employeeContribution: employee.employeeContribution?.toString() || "0",
                otherContribution: employee.otherContribution?.toString() || "0",
                pli: employee.pli?.toString() || "0",
                cooperativeInstallment: employee.cooperativeInstallment?.toString() || "0"
            });
            
            // Clear error for employee field
            if (fieldErrors.employeeId) {
                setFieldErrors(prev => ({ ...prev, employeeId: undefined }));
            }
        } else {
            setFormData({ ...formData, employeeId: employeeId });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Clear error for the field being edited
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleBlur = (fieldName) => {
        setTouched({ ...touched, [fieldName]: true });
        validateField(fieldName, formData[fieldName]);
    };

    const validateField = (fieldName, value) => {
        const newErrors = { ...fieldErrors };
        
        switch(fieldName) {
            case 'employeeId':
                if (!value) {
                    newErrors.employeeId = "કર્મચારી પસંદ કરવો ફરજિયાત છે";
                } else {
                    delete newErrors.employeeId;
                }
                break;
            default:
                break;
        }
        
        setFieldErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.employeeId) {
            newErrors.employeeId = "કર્મચારી પસંદ કરવો ફરજિયાત છે";
        }
        
        setFieldErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const resetForm = () => {
        setFormData({
            employeeId: '',
            basicSalary: '',
            gradePay: '',
            da: '',
            hra: '',
            ta: '',
            medical: '',
            cleaning: '',
            pf: '',
            esi: '',
            professionalTax: '',
            employeeContribution: '',
            otherContribution: '',
            pli: '',
            cooperativeInstallment: '',
            remarks: ''
        });
        setFieldErrors({});
        setTouched({});
    };

    const handleGenerate = async () => {
        if (!validateForm()) {
            toast({ 
                title: "ભૂલ", 
                description: "કૃપા કરી કર્મચારી પસંદ કરો", 
                status: "error", 
                duration: 3000 
            });
            return;
        }
        
        setSaving(true);
        try {
            const basic = parseFloat(formData.basicSalary) || 0;
            const grade = parseFloat(formData.gradePay) || 0;
            const calc = calculateSalary(basic, grade);
            employees.find(emp => emp._id === formData.employeeId);
            
            const allowances = {
                da: calc.da, hra: calc.hra, ta: calc.ta, medical: calc.medical,
                cleaning: calc.cleaning, special: 0, other: 0
            };
            
            const deductions = {
                pf: calc.pf, esi: calc.esi, professionalTax: calc.professionalTax,
                employeeContribution: parseFloat(formData.employeeContribution) || 0,
                otherContribution: parseFloat(formData.otherContribution) || 0,
                pli: parseFloat(formData.pli) || 0,
                cooperativeInstallment: parseFloat(formData.cooperativeInstallment) || 0,
                tds: 0, advance: 0, other: 0
            };
            
            const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + (val || 0), 0);
            const netSalary = calc.grossSalary - totalDeductions;
            
            const payload = {
                employeeId: formData.employeeId, month: selectedMonth, year: selectedYear,
                basicSalary: basic, gradePay: grade, allowances, deductions,
                grossSalary: calc.grossSalary, netSalary: netSalary,
                remarks: formData.remarks || "", status: 'pending'
            };
            
            await axios.post('http://localhost:5000/api/salary/generate', payload);
            
            toast({ 
                title: "સફળ", 
                description: `પગાર જનરેટ થયો: ગ્રોસ ₹${formatNumber(calc.grossSalary)}, નેટ ₹${formatNumber(netSalary)}`, 
                status: "success", 
                duration: 3000 
            });
            
            fetchSalaries();
            resetForm();
            onFormClose();
        } catch (error) {
            console.error('Error generating salary:', error);
            toast({ 
                title: "ભૂલ", 
                description: error.response?.data?.message || "પગાર જનરેટ કરવામાં ભૂલ", 
                status: "error", 
                duration: 3000 
            });
        } finally {
            setSaving(false);
        }
    };

    const updateSalaryStatus = async (id, status) => {
        try {
            await axios.put(`http://localhost:5000/api/salary/${id}/status`, {
                status, paymentDate: new Date(), paymentMode: 'bank transfer'
            });
            toast({ title: "અપડેટ", description: `સ્થિતિ બદલાઈ: ${status === 'paid' ? 'ચૂકવેલ' : 'બાકી'}`, status: "info", duration: 2000 });
            fetchSalaries();
        } catch (error) {
            console.error('Error updating salary status:', error);
            toast({ title: "ભૂલ", description: "સ્થિતિ અપડેટ કરવામાં નિષ્ફળ", status: "error", duration: 3000 });
        }
    };

    const handleViewDetails = (salary) => {
        setSelectedSalary(salary);
        onViewOpen();
    };

    const formatNumber = (num) => {
        if (!num && num !== 0) return "0.00";
        return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // ✅ FIXED: Correct CSV export with proper data
    const handleDownloadCSV = () => {
        const headers = [
            "ક્રમાંક", 
            "કર્મચારી નામ", 
            "બેઝિક + ગ્રેડ (₹)", 
            "DA (₹)", 
            "HRA (₹)", 
            "TA (₹)", 
            "મેડિકલ (₹)", 
            "ઝાડુ (₹)", 
            "ગ્રોસ (₹)",
            "PF (₹)", 
            "પ્રો. ટેક્સ (₹)",
            "કર્મચારી ફાળો (₹)", 
            "અન્ય ફાળો (₹)",
            "PLI (₹)", 
            "સહકારી હપ્તો (₹)", 
            "કુલ કપાત (₹)", 
            "ચોખ્ખો પગાર (₹)", 
            "સ્થિતિ"
        ];
        
        const rows = salaries.map((s, idx) => {
            const totalBasic = (s.basicSalary || 0) + (s.gradePay || 0);
            const totalDeductions = (s.grossSalary || 0) - (s.netSalary || 0);
            
            // Get employee name
            let employeeName = s.employeeId?.employeeName || s.employeeName || "-";
            
            return [
                idx + 1,
                employeeName,
                formatNumber(totalBasic),
                formatNumber(s.allowances?.da || 0),
                formatNumber(s.allowances?.hra || 0),
                formatNumber(s.allowances?.ta || 0),
                formatNumber(s.allowances?.medical || 0),
                formatNumber(s.allowances?.cleaning || 0),
                formatNumber(s.grossSalary || 0),
                formatNumber(s.deductions?.pf || 0),
                formatNumber(s.deductions?.professionalTax || 0),
                formatNumber(s.deductions?.employeeContribution || 0),
                formatNumber(s.deductions?.otherContribution || 0),
                formatNumber(s.deductions?.pli || 0),
                formatNumber(s.deductions?.cooperativeInstallment || 0),
                formatNumber(totalDeductions),
                formatNumber(s.netSalary || 0),
                s.status === 'paid' ? 'ચૂકવેલ' : 'બાકી'
            ];
        });
        
        // Create CSV with proper formatting
        const csvRows = rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','));
        const csvContent = [headers.join(','), ...csvRows].join('\n');
        
        // Add BOM for UTF-8 to ensure Gujarati characters display correctly
        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `pagar_patrak_${getMonthName(selectedMonth)}_${selectedYear}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({ title: "ડાઉનલોડ", description: "ફાઇલ ડાઉનલોડ થઈ રહી છે", status: "success", duration: 2000 });
    };

    const handlePrint = () => { window.print();
    };

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = salaries.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(salaries.length / itemsPerPage);
    const handlePageChange = (page) => setCurrentPage(page);
    const handleItemsPerPageChange = (newLimit) => {
        setItemsPerPage(newLimit);
        setCurrentPage(1);
    };

    // Calculate totals - ✅ FIXED: Use correct calculations
    const totals = salaries.reduce((acc, curr) => {
        const totalBasic = (curr.basicSalary || 0) + (curr.gradePay || 0);
        return {
            totalBasic: acc.totalBasic + totalBasic,
            totalDA: acc.totalDA + (curr.allowances?.da || 0),
            totalHRA: acc.totalHRA + (curr.allowances?.hra || 0),
            totalGross: acc.totalGross + (curr.grossSalary || 0),
            totalPF: acc.totalPF + (curr.deductions?.pf || 0),
            totalNet: acc.totalNet + (curr.netSalary || 0),
            totalPaid: acc.totalPaid + ((curr.status === 'paid' ? curr.netSalary : 0) || 0),
            totalPending: acc.totalPending + ((curr.status === 'pending' ? curr.netSalary : 0) || 0)
        };
    }, { totalBasic: 0, totalDA: 0, totalHRA: 0, totalGross: 0, totalPF: 0, totalNet: 0, totalPaid: 0, totalPending: 0 });

    // Print styles
    const printStyles = `
        @media print {
            body * { visibility: hidden; }
            .print-area, .print-area * { visibility: visible; }
            .print-area { position: absolute; left: 0; top: 0; width: 100%; }
            .no-print { display: none !important; }
            table { font-size: 10pt; }
            th, td { padding: 4px; }
            .print-header { display: block !important; }
        }
        @media screen {
            .print-header { display: none; }
        }
    `;

    return (
        <Box bg="#F8FAF9" minH="100vh" p={6}>
            <style dangerouslySetInnerHTML={{ __html: printStyles }} />

            {/* Header */}
            <Flex align="center" mb={6} className="no-print">
                <Box width="180px">
                    <Button leftIcon={<FiArrowLeft />} colorScheme="green" variant="outline" onClick={() => navigate("/pe-roll")} rounded="xl">
                        પાછા જાવ
                    </Button>
                </Box>
                <Heading flex="1" textAlign="center" size="lg" color="green.700">પગાર પત્રક</Heading>
                <HStack spacing={2} width="180px" justify="flex-end">
                    <Button 
                        leftIcon={<FiPlus />} 
                        colorScheme="green" 
                        onClick={() => {
                            resetForm();
                            onFormOpen();
                        }} 
                        size="sm" 
                        rounded="xl"
                        bg="#307644"
                        _hover={{ bg: "#0F3A1F" }}
                    >
                        નવો પગાર
                    </Button>
                </HStack>
            </Flex>

            {/* Filter Card */}
            <Card rounded="2xl" shadow="md" mb={6} border="1px solid #E3EDE8" className="no-print">
                <CardBody>
                    <Stack direction={{ base: "column", md: "row" }} spacing={4} align="flex-end">
                        <FormControl w={{ base: "full", md: "200px" }}>
                            <FormLabel fontSize="sm">મહિનો</FormLabel>
                            <Select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} bg="white">
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                    <option key={month} value={month}>{getMonthName(month)}</option>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl w={{ base: "full", md: "150px" }}>
                            <FormLabel fontSize="sm">વર્ષ</FormLabel>
                            <Input type="number" value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} bg="white" />
                        </FormControl>
                        {/* <Button leftIcon={<FiSearch />} colorScheme="blue" px={8} onClick={fetchSalaries} isLoading={loading}>શોધો</Button> */}
                        <Button leftIcon={<FiDownload />} variant="outline" colorScheme="blue" onClick={handleDownloadCSV}>CSV</Button>
                        <Button leftIcon={<FiPrinter />} variant="outline" colorScheme="purple" onClick={handlePrint}>પ્રિન્ટ</Button>
                    </Stack>
                </CardBody>
            </Card>

            {/* Totals Summary */}
            <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4} mb={6} className="no-print">
                <Card bg="white" shadow="sm" borderLeft="4px solid #2D3748">
                    <CardBody p={3}><Text fontSize="xs" color="gray.500">કુલ ગ્રોસ</Text><Text fontSize="xl" fontWeight="bold">₹{formatNumber(totals.totalGross)}</Text></CardBody>
                </Card>
                <Card bg="white" shadow="sm" borderLeft="4px solid #38A169">
                    <CardBody p={3}><Text fontSize="xs" color="gray.500">કુલ નેટ</Text><Text fontSize="xl" fontWeight="bold" color="green.600">₹{formatNumber(totals.totalNet)}</Text></CardBody>
                </Card>
                <Card bg="white" shadow="sm" borderLeft="4px solid #3182CE">
                    <CardBody p={3}><Text fontSize="xs" color="gray.500">કુલ PF</Text><Text fontSize="xl" fontWeight="bold" color="blue.600">₹{formatNumber(totals.totalPF)}</Text></CardBody>
                </Card>
                <Card bg="white" shadow="sm" borderLeft="4px solid #F6AD55">
                    <CardBody p={3}><Text fontSize="xs" color="gray.500">ચૂકવેલ</Text><Text fontSize="xl" fontWeight="bold" color="orange.600">₹{formatNumber(totals.totalPaid)}</Text></CardBody>
                </Card>
                <Card bg="white" shadow="sm" borderLeft="4px solid #E53E3E">
                    <CardBody p={3}><Text fontSize="xs" color="gray.500">બાકી</Text><Text fontSize="xl" fontWeight="bold" color="red.600">₹{formatNumber(totals.totalPending)}</Text></CardBody>
                </Card>
            </SimpleGrid>

            {/* Salary Table - Print Area */}
            <Card rounded="2xl" shadow="xl" overflow="hidden" border="1px solid #E3EDE8" className="print-area">
                {/* Print Header - Title on Left, Month & Date on Right */}
                <Flex 
                    className="print-header" 
                    justify="space-between" 
                    align="center" 
                    py={4} 
                    px={6} 
                    borderBottom="1px solid #E2E8F0"
                    bg="white"
                >
                    <Box>
                        <Heading size="lg" color="green.700">પગાર પત્રક</Heading>
                        <Text fontSize="sm" color="gray.500">(Pagar Patrak)</Text>
                    </Box>
                    <Box textAlign="right">
                        <Text fontSize="lg" fontWeight="semibold" color="gray.700">
                            {getMonthName(selectedMonth)} {selectedYear}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                            તારીખ: {new Date().toLocaleDateString('gu-IN')}
                        </Text>
                    </Box>
                </Flex>

                <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                        <Thead bg="#E8F3EC">
                            <Tr>
                                <Th>ક્ર.</Th>
                                <Th>કર્મચારી</Th>
                                <Th>હોદ્દો</Th>
                                <Th isNumeric>બેઝિક+ગ્રેડ</Th>
                                <Th isNumeric>DA</Th>
                                <Th isNumeric>HRA</Th>
                                <Th isNumeric>ગ્રોસ</Th>
                                <Th isNumeric>PF</Th>
                                <Th isNumeric>નેટ</Th>
                                <Th>સ્થિતિ</Th>
                                <Th className="no-print">ક્રિયા</Th>
                            </Tr>
                        </Thead>
                        <Tbody bg="white">
                            {loading ? (
                                <Tr><Td colSpan={11} textAlign="center" py={10}><Spinner color="green.500" /></Td></Tr>
                            ) : salaries.length === 0 ? (
                                <Tr><Td colSpan={11} textAlign="center" py={10} color="gray.500">આ સમયગાળા માટે કોઈ રેકોર્ડ મળ્યા નથી</Td></Tr>
                            ) : (
                                currentItems.map((salary, idx) => {
                                    const totalBasic = (salary.basicSalary || 0) + (salary.gradePay || 0);
                                    return (
                                        <Tr key={salary._id} _hover={{ bg: "gray.50" }}>
                                            <Td>{indexOfFirstItem + idx + 1}</Td>
                                            <Td>
                                                <Text fontWeight="500">{capitalizeWords(salary.employeeId?.employeeName || salary.employeeName || "-")}</Text>
                                                <Text fontSize="xs" color="gray.500">{salary.employeeId?.employeeCode || ""}</Text>
                                            </Td>
                                            <Td><Badge colorScheme="blue" fontSize="xs">{capitalizeWords(salary.employeeId?.employeePositionGujarati || "-")}</Badge></Td>
                                            <Td isNumeric>₹{formatNumber(totalBasic)}</Td>
                                            <Td isNumeric>₹{formatNumber(salary.allowances?.da || 0)}</Td>
                                            <Td isNumeric>₹{formatNumber(salary.allowances?.hra || 0)}</Td>
                                            <Td isNumeric fontWeight="bold" color="green.600">₹{formatNumber(salary.grossSalary)}</Td>
                                            <Td isNumeric>₹{formatNumber(salary.deductions?.pf || 0)}</Td>
                                            <Td isNumeric fontWeight="bold" color="purple.600">₹{formatNumber(salary.netSalary)}</Td>
                                            <Td>
                                                <Badge colorScheme={salary.status === 'paid' ? 'green' : 'orange'} rounded="full" px={2}>
                                                    {salary.status === 'paid' ? 'ચૂકવેલ' : 'બાકી'}
                                                </Badge>
                                            </Td>
                                            <Td className="no-print">
                                                <HStack spacing={1}>
                                                    <IconButton icon={<ViewIcon />} size="sm" colorScheme="green" variant="ghost" onClick={() => handleViewDetails(salary)} aria-label="View" rounded="full" />
                                                    {salary.status === 'pending' && (
                                                        <IconButton icon={<FiCheckCircle />} size="sm" colorScheme="green" variant="ghost" onClick={() => updateSalaryStatus(salary._id, 'paid')} aria-label="Mark Paid" rounded="full" />
                                                    )}
                                                </HStack>
                                            </Td>
                                        </Tr>
                                    );
                                })
                            )}
                        </Tbody>
                        {/* TFOOT with correct column alignment */}
                        <Tfoot bg="gray.100">
                            <Tr>
                                <Th colSpan={3} textAlign="right">કુલ:</Th>
                                <Th isNumeric>₹{formatNumber(totals.totalBasic)}</Th>
                                <Th isNumeric>₹{formatNumber(totals.totalDA)}</Th>
                                <Th isNumeric>₹{formatNumber(totals.totalHRA)}</Th>
                                <Th isNumeric fontWeight="bold">₹{formatNumber(totals.totalGross)}</Th>
                                <Th isNumeric>₹{formatNumber(totals.totalPF)}</Th>
                                <Th isNumeric fontWeight="bold" color="purple.600">₹{formatNumber(totals.totalNet)}</Th>
                                <Th colSpan={2}></Th>
                            </Tr>
                        </Tfoot>
                    </Table>
                </Box>

                {/* Pagination */}
               
            </Card>

             {!loading && salaries.length > 0 && (
                    <Box className="no-print" p={4}>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            itemsPerPage={itemsPerPage}
                            setItemsPerPage={handleItemsPerPageChange}
                        />
                    </Box>
                )}

            {/* Generate Salary Modal */}
            <Modal isOpen={isFormOpen} onClose={onFormClose} size="xl">
                <ModalOverlay />
                <ModalContent borderRadius="2xl">
                    <ModalHeader bg="#307644" color="white" borderTopRadius="2xl">
                        <Flex align="center" gap={3}>
                            <FiPlus size={20} />
                            <Heading size="md" color="white">
                                નવો પગાર જનરેટ કરો
                            </Heading>
                        </Flex>
                    </ModalHeader>
                    <ModalCloseButton color="white" />
                    
                    <ModalBody py={6} px={6}>
                        <VStack spacing={5} align="stretch">
                            <FormControl isRequired isInvalid={fieldErrors.employeeId && touched.employeeId}>
                                <FormLabel fontWeight="500">કર્મચારી પસંદ કરો</FormLabel>
                                <Select
                                    value={formData.employeeId}
                                    onChange={(e) => handleEmployeeChange(e.target.value)}
                                    onBlur={() => handleBlur('employeeId')}
                                    placeholder="કર્મચારી પસંદ કરો"
                                    bg="gray.50"
                                    size="lg"
                                    rounded="lg"
                                >
                                    {employees.map(emp => (
                                        <option key={emp._id} value={emp._id}>
                                            {capitalizeWords(emp.employeeName)} - {capitalizeWords(emp.employeePositionGujarati || emp.employeePositionEnglish)}
                                        </option>
                                    ))}
                                </Select>
                                <FormErrorMessage>{fieldErrors.employeeId}</FormErrorMessage>
                            </FormControl>

                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                                <FormControl>
                                    <FormLabel fontWeight="500">મૂળ પગાર (₹)</FormLabel>
                                    <Input
                                        type="number"
                                        value={formData.basicSalary}
                                        isReadOnly
                                        bg="gray.100"
                                        size="lg"
                                        rounded="lg"
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontWeight="500">ગ્રેડ પે (₹)</FormLabel>
                                    <Input
                                        type="number"
                                        value={formData.gradePay}
                                        isReadOnly
                                        bg="gray.100"
                                        size="lg"
                                        rounded="lg"
                                    />
                                </FormControl>
                            </SimpleGrid>

                            <FormControl>
                                <FormLabel fontWeight="500">રીમાર્ક</FormLabel>
                                <Textarea
                                    name="remarks"
                                    value={formData.remarks}
                                    onChange={handleChange}
                                    placeholder="વધારાની નોંધ લખો..."
                                    rows={3}
                                    bg="gray.50"
                                    rounded="lg"
                                    resize="vertical"
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>

                    <ModalFooter borderTop="1px solid" borderColor="gray.200" gap={3}>
                        <Button variant="outline" colorScheme="red" onClick={onFormClose} rounded="lg">
                            રદ કરો
                        </Button>
                        <Button 
                            colorScheme="green" 
                            onClick={handleGenerate} 
                            isLoading={saving} 
                            leftIcon={<FiSave />} 
                            rounded="lg"
                            bg="#1E4D2B"
                            _hover={{ bg: "#0F3A1F" }}
                        >
                            જનરેટ કરો
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* View Details Modal */}
            <Modal isOpen={isViewOpen} onClose={onViewClose} size="2xl" >
                <ModalOverlay />
                <ModalContent borderRadius="2xl">
                    <ModalHeader bg="#1E4D2B" color="white" borderTopRadius="2xl">પગાર વિગત</ModalHeader>
                    <ModalCloseButton color="white" />
                     {/* <Modal isOpen={isViewOpen} onClose={onViewClose} size="lg" isCentered>
                            <ModalOverlay />
                            <ModalContent borderRadius="2xl">
                              <ModalHeader bg="#1E4D2B" color="white">
                                PF વ્યવહાર વિગત
                              </ModalHeader>
                              <ModalCloseButton color="white" /> */}
                    <ModalBody py={2}>
                        {selectedSalary && (
                            <Grid templateColumns="1fr 2fr" gap={2}>
                                <Text fontWeight="bold">કર્મચારી:</Text><Text>{capitalizeWords(selectedSalary.employeeId?.employeeName)}</Text>
                                <Text fontWeight="bold">બેઝિક + ગ્રેડ:</Text><Text>₹{formatNumber((selectedSalary.basicSalary || 0) + (selectedSalary.gradePay || 0))}</Text>
                                <Text fontWeight="bold">મોંઘવારી ભથ્થું:</Text><Text>₹{formatNumber(selectedSalary.allowances?.da)}</Text>
                                <Text fontWeight="bold">ઘર ભાડું:</Text><Text>₹{formatNumber(selectedSalary.allowances?.hra)}</Text>
                                <Text fontWeight="bold">ધોલાઈ ભથ્થું:</Text><Text>₹{formatNumber(selectedSalary.allowances?.ta)}</Text>
                                <Text fontWeight="bold">મેડિકલ ભથ્થું:</Text><Text>₹{formatNumber(selectedSalary.allowances?.medical)}</Text>
                                <Text fontWeight="bold">ઝાડુ ભથ્થું:</Text><Text>₹{formatNumber(selectedSalary.allowances?.cleaning)}</Text>
                                <Text fontWeight="bold">ગ્રોસ પગાર:</Text><Text fontWeight="bold" color="green.600">₹{formatNumber(selectedSalary.grossSalary)}</Text>
                                <Text fontWeight="bold">PF કપાત:</Text><Text>₹{formatNumber(selectedSalary.deductions?.pf)}</Text>
                                {/* <Text fontWeight="bold">ESI કપાત:</Text><Text>₹{formatNumber(selectedSalary.deductions?.esi)}</Text> */}
                                <Text fontWeight="bold">કર્મચારી ફાળો:</Text><Text>₹{formatNumber(selectedSalary.deductions?.employeeContribution)}</Text>
                                <Text fontWeight="bold">અન્ય ફાળો:</Text><Text>₹{formatNumber(selectedSalary.deductions?.otherContribution)}</Text>
                                <Text fontWeight="bold">PLI:</Text><Text>₹{formatNumber(selectedSalary.deductions?.pli)}</Text>
                                <Text fontWeight="bold">સહકારી હપ્તો:</Text><Text>₹{formatNumber(selectedSalary.deductions?.cooperativeInstallment)}</Text>
                                <Text fontWeight="bold">કુલ કપાત:</Text><Text fontWeight="bold" color="red.600">₹{formatNumber(selectedSalary.grossSalary - selectedSalary.netSalary)}</Text>
                                <Text fontWeight="bold">નેટ પગાર:</Text><Text fontSize="xl" fontWeight="bold" color="purple.600">₹{formatNumber(selectedSalary.netSalary)}</Text>
                                <Text fontWeight="bold">સ્થિતિ:</Text><Badge colorScheme={selectedSalary.status === 'paid' ? 'green' : 'orange'}  w="fit-content"
                  px={3}
                  py={1}>{selectedSalary.status === 'paid' ? 'ચૂકવેલ' : 'બાકી'}</Badge>
                            </Grid>
                        )}
                    </ModalBody>
                    <ModalFooter><Button colorScheme="green" onClick={onViewClose}>બંધ કરો</Button></ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default SalarySheet;