// employeeregistration.jsx
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
  Divider,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Select,
  Checkbox,
  Card,
  CardBody,
  CardHeader,
  FormErrorMessage,
  FormHelperText,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiSave,
  FiCheck,
  FiX,
} from "react-icons/fi";
import axios from "axios";
import DateInput from "./DateInput.jsx"; // ADD THIS IMPORT

// ADD THESE HELPER FUNCTIONS
/* ---------------- Format DD/MM/YYYY ---------------- */
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

const EmployeeRegistration = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen: isSuccessOpen, onOpen: onSuccessOpen, onClose: onSuccessClose } = useDisclosure();

  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  
  // Dropdown options
  const employeeGroups = [
    { value: "Group_a", label: "ગ્રુપ એ" },
    { value: "Group_b", label: "ગ્રુપ બી" },
    { value: "Group_c", label: "ગ્રુપ સી" },
    { value: "Group_d", label: "ગ્રુપ ડી" },
  ];

  const positionsGujarati = [
    { value: "Manager", label: "મેનેજર" },
    { value: "Officer", label: "ઓફિસર" },
    { value: "Clerk", label: "ક્લાર્ક" },
    { value: "Supervisor", label: "સુપરવાઇઝર" },
    { value: "Assistant", label: "એસિસ્ટન્ટ" },
    { value: "Peon", label: "પિયોન" },
  ];

  const positionsEnglish = [
    { value: "Manager", label: "Manager" },
    { value: "Officer", label: "Officer" },
    { value: "Clerk", label: "Clerk" },
    { value: "Supervisor", label: "Supervisor" },
    { value: "Assistant", label: "Assistant" },
    { value: "Peon", label: "Peon" },
  ];

  const bankNames = [
    { value: "sbi", label: "State Bank of India" },
    { value: "boi", label: "Bank of India" },
    { value: "bob", label: "Bank of Baroda" },
    { value: "hdfc", label: "HDFC Bank" },
    { value: "icici", label: "ICICI Bank" },
    { value: "axis", label: "Axis Bank" },
  ];

  const salaryScales = [
    { value: "scale_1", label: "સ્કેલ ૧ (૨૦૦૦૦ - ૪૦૦૦૦)" },
    { value: "scale_2", label: "સ્કેલ ૨ (૪૦૦૦૧ - ૬૦૦૦૦)" },
    { value: "scale_3", label: "સ્કેલ ૩ (૬૦૦૦૧ - ૮૦૦૦૦)" },
    { value: "scale_4", label: "સ્કેલ ૪ (૮૦૦૦૧ - ૧૦૦૦૦૦)" },
  ];

  const [formData, setFormData] = useState({
    // First Section - કર્મચારી માહિતી
    employeeName: "",
    employeeNameEnglish: "",
    registrationDate: "",
    registrationDateDisplay: "", // ADD THIS FIELD
    employeeGroup: "",
    employeePositionEnglish: "",
    employeePositionGujarati: "",
    bankNameEnglish: "",
    accountNumber: "",
    ifscCode: "",
    salaryScale: "",
    basicPay: "",
    gradePay: "",
    totalBasic: "",
    mobileNumber: "",
    pfAccount: "",
    remarks: "",
    isActive: true,
    
    // Second Section - માસિક મળવા પાત્ર રકમ
    dearnessAllowance: "",
    houseRent: "",
    medicalAllowance: "",
    travelAllowance: "",
    cleaningAllowance: "",
    
    // Third Section - માસિક કપાત પાત્ર રકમ
    employeeContribution: "",
    otherContribution: "",
    pli: "",
    professionalTax: "",
    cooperativeInstallment: "",
  });

  // Validation functions with proper Gujarati error messages
  const validateMobileNumber = (mobile) => {
    if (!mobile) return "મોબાઈલ નંબર ભરવો ફરજિયાત છે";
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(mobile)) return "મોબાઈલ નંબર 10 અંકનો હોવો જોઈએ";
    return null;
  };

  const validateIFSC = (ifsc) => {
    if (!ifsc) return "IFSC કોડ ભરવો ફરજિયાત છે";
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(ifsc)) return "IFSC કોડ યોગ્ય ફોર્મેટમાં હોવો જોઈએ (ઉદા: SBIN0001234)";
    return null;
  };

  const validateAccountNumber = (accNo) => {
    if (!accNo) return "અકાઉન્ટ નંબર ભરવો ફરજિયાત છે";
    const accRegex = /^\d{9,18}$/;
    if (!accRegex.test(accNo)) return "અકાઉન્ટ નંબર 9 થી 18 અંકનો હોવો જોઈએ";
    return null;
  };

  const validateBasicPay = (value) => {
    if (!value) return "બેઝિક પે ભરવી ફરજિયાત છે";
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) return "બેઝિક પે ધન સંખ્યા હોવી જોઈએ";
    if (num > 500000) return "બેઝિક પે 5,00,000 થી વધુ ન હોઈ શકે";
    if (num < 10000) return "બેઝિક પે ઓછામાં ઓછી ₹10,000 હોવી જોઈએ";
    return null;
  };

  const validateGradePay = (value) => {
    if (value && parseFloat(value) < 0) return "ગ્રેડ પે ધન સંખ્યા હોવી જોઈએ";
    if (value && parseFloat(value) > 100000) return "ગ્રેડ પે 1,00,000 થી વધુ ન હોઈ શકે";
    return null;
  };

  const validateEmployeeName = (name) => {
    if (!name) return "કર્મચારીનું નામ ભરવું ફરજિયાત છે";
    if (name.length < 3) return "નામ ઓછામાં ઓછું 3 અક્ષરનું હોવું જોઈએ";
    if (name.length > 100) return "નામ 100 અક્ષરથી વધુ ન હોઈ શકે";
    const gujaratiRegex = /^[\u0A80-\u0AFF\s\-\.]+$/;
    if (!gujaratiRegex.test(name)) return "કૃપા કરી માત્ર ગુજરાતી અક્ષરોનો ઉપયોગ કરો";
    return null;
  };

  const validateEmployeeNameEnglish = (name) => {
    if (!name) return "કર્મચારીનું નામ (અંગ્રેજી) ભરવું ફરજિયાત છે";
    if (!/^[A-Za-z\s\-\.]+$/.test(name)) return "અંગ્રેજી નામ ફક્ત અક્ષરો ધરાવે છે";
    if (name.length < 3) return "નામ ઓછામાં ઓછું 3 અક્ષરનું હોવું જોઈએ";
    if (name.length > 100) return "નામ 100 અક્ષરથી વધુ ન હોઈ શકે";
    return null;
  };

  const validateRegistrationDate = (date) => {
    if (!date) return "નોંધણી તારીખ ભરવી ફરજિયાત છે";
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return "અમાન્ય તારીખ";
    const currentDateStr = new Date().toISOString().split('T')[0];
    if (date > currentDateStr) return "નોંધણી તારીખ ભવિષ્યની ન હોઈ શકે";
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 100);
    if (dateObj < minDate) return "નોંધણી તારીખ 100 વર્ષથી વધુ જૂની ન હોઈ શકે";
    return null;
  };

  const validateField = (name, value, allFormData = formData) => {
    switch (name) {
      case "mobileNumber":
        return validateMobileNumber(value);
      case "ifscCode":
        return validateIFSC(value.toUpperCase());
      case "accountNumber":
        return validateAccountNumber(value);
      case "basicPay":
        return validateBasicPay(value);
      case "gradePay":
        return validateGradePay(value);
      case "employeeName":
        return validateEmployeeName(value);
      case "employeeNameEnglish":
        return validateEmployeeNameEnglish(value);
      case "registrationDate":
        return validateRegistrationDate(value);
      case "employeeGroup":
        if (!value) return "કર્મચારી ગ્રુપ પસંદ કરવો ફરજિયાત છે";
        return null;
      case "employeePositionEnglish":
        if (!value) return "હોદ્દો (અંગ્રેજી) પસંદ કરવો ફરજિયાત છે";
        return null;
      case "employeePositionGujarati":
        if (!value) return "હોદ્દો (ગુજરાતી) પસંદ કરવો ફરજિયાત છે";
        return null;
      case "bankNameEnglish":
        if (!value) return "બેંકનું નામ પસંદ કરવું ફરજિયાત છે";
        return null;
      case "salaryScale":
        if (!value) return "પગાર સ્કેલ પસંદ કરવો ફરજિયાત છે";
        return null;
      case "dearnessAllowance":
      case "houseRent":
      case "medicalAllowance":
      case "travelAllowance":
      case "cleaningAllowance":
      case "employeeContribution":
      case "otherContribution":
      case "pli":
      case "professionalTax":
      case "cooperativeInstallment":
        if (value && parseFloat(value) < 0) return "રકમ ઋણ ન હોઈ શકે";
        if (value && parseFloat(value) > 1000000) return "રકમ 10,00,000 થી વધુ ન હોઈ શકે";
        return null;
      default:
        return null;
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    if (error) {
      setValidationErrors(prev => ({ ...prev, [name]: error }));
    } else {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let processedValue = value;
    if (name === "ifscCode") {
      processedValue = value.toUpperCase();
    }
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : processedValue,
    }));
    if (validationErrors[name] || touchedFields[name]) {
      const error = validateField(name, processedValue);
      setValidationErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const resetForm = () => {
    setFormData({
      employeeName: "",
      employeeNameEnglish: "",
      registrationDate: "",
      registrationDateDisplay: "",
      employeeGroup: "",
      employeePositionEnglish: "",
      employeePositionGujarati: "",
      bankNameEnglish: "",
      accountNumber: "",
      ifscCode: "",
      salaryScale: "",
      basicPay: "",
      gradePay: "",
      totalBasic: "",
      mobileNumber: "",
      pfAccount: "",
      remarks: "",
      isActive: true,
      dearnessAllowance: "",
      houseRent: "",
      medicalAllowance: "",
      travelAllowance: "",
      cleaningAllowance: "",
      employeeContribution: "",
      otherContribution: "",
      pli: "",
      professionalTax: "",
      cooperativeInstallment: "",
    });
    setValidationErrors({});
    setTouchedFields({});
  };

  useEffect(() => {
    const basic = parseFloat(formData.basicPay) || 0;
    const grade = parseFloat(formData.gradePay) || 0;
    const total = basic + grade;
    setFormData(prev => ({
      ...prev,
      totalBasic: total.toString()
    }));
    if (touchedFields.gradePay) {
      const error = validateGradePay(formData.gradePay);
      setValidationErrors(prev => ({
        ...prev,
        gradePay: error
      }));
    }
  }, [formData.basicPay, formData.gradePay]);

  const validateForm = () => {
    const errors = {};
    const fieldsToValidate = [
      "employeeName",
      "employeeNameEnglish",
      "registrationDate",
      "employeeGroup",
      "employeePositionEnglish",
      "employeePositionGujarati",
      "bankNameEnglish",
      "accountNumber",
      "ifscCode",
      "salaryScale",
      "mobileNumber",
      "basicPay"
    ];
    
    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
      }
    });
    
    if (formData.gradePay) {
      const gradePayError = validateGradePay(formData.gradePay);
      if (gradePayError) {
        errors.gradePay = gradePayError;
      }
    }
    
    const allowanceFields = [
      "dearnessAllowance", "houseRent", "medicalAllowance", 
      "travelAllowance", "cleaningAllowance", "employeeContribution",
      "otherContribution", "pli", "professionalTax", "cooperativeInstallment"
    ];
    
    allowanceFields.forEach(field => {
      if (formData[field]) {
        const error = validateField(field, formData[field]);
        if (error) {
          errors[field] = error;
        }
      }
    });
    
    setValidationErrors(errors);
    const allFields = [...fieldsToValidate, "gradePay", ...allowanceFields];
    const newTouched = {};
    allFields.forEach(field => {
      newTouched[field] = true;
    });
    setTouchedFields(newTouched);
    
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: "ભૂલ",
        description: "કૃપા કરીને તમામ ફરજિયાત ફીલ્ડ યોગ્ય રીતે ભરો",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      const firstErrorField = Object.keys(validationErrors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.focus();
        }
      }
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        basicPay: formData.basicPay ? parseFloat(formData.basicPay) : 0,
        gradePay: formData.gradePay ? parseFloat(formData.gradePay) : 0,
        totalBasic: formData.totalBasic ? parseFloat(formData.totalBasic) : 0,
        dearnessAllowance: formData.dearnessAllowance ? parseFloat(formData.dearnessAllowance) : 0,
        houseRent: formData.houseRent ? parseFloat(formData.houseRent) : 0,
        medicalAllowance: formData.medicalAllowance ? parseFloat(formData.medicalAllowance) : 0,
        travelAllowance: formData.travelAllowance ? parseFloat(formData.travelAllowance) : 0,
        cleaningAllowance: formData.cleaningAllowance ? parseFloat(formData.cleaningAllowance) : 0,
        employeeContribution: formData.employeeContribution ? parseFloat(formData.employeeContribution) : 0,
        otherContribution: formData.otherContribution ? parseFloat(formData.otherContribution) : 0,
        pli: formData.pli ? parseFloat(formData.pli) : 0,
        professionalTax: formData.professionalTax ? parseFloat(formData.professionalTax) : 0,
        cooperativeInstallment: formData.cooperativeInstallment ? parseFloat(formData.cooperativeInstallment) : 0,
      };
      
      // Remove display field before sending to backend
      delete payload.registrationDateDisplay;
      
      console.log("Sending payload:", payload);
      
      await axios.post("http://localhost:5000/api/employee", payload);
      
      toast({
        title: "સફળ",
        description: `${formData.employeeName} સફળતાપૂર્વક નોંધાયો!`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      onSuccessOpen();
      resetForm();
      
    } catch (error) {
      console.error("Error saving employee:", error);
      console.error("Error response:", error.response?.data);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "કર્મચારી નોંધણી નિષ્ફળ";
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

  const handleCloseSuccess = () => {
    onSuccessClose();
    navigate("/pe-roll");
  };

  const isFieldInvalid = (fieldName) => {
    return touchedFields[fieldName] && validationErrors[fieldName] ? true : false;
  };

  const getFieldError = (fieldName) => {
    return touchedFields[fieldName] ? validationErrors[fieldName] : null;
  };

  return (
    <Box bg="#F8FAF9" minH="100vh" p={6}>
      <Flex align="center" mb={8}>
        <Button
          leftIcon={<FiArrowLeft />}
          colorScheme="green"
          variant="outline"
          onClick={() => navigate("/pe-roll")}
          rounded="xl"
          fontWeight="600"
        >
          પાછા જાવ
        </Button>
        <Heading
          flex="1"
          textAlign="center"
          size="lg"
          color="green.700"
        >
          કર્મચારી રજીસ્ટ્રેશન
        </Heading>
        <Box width="120px" />
      </Flex>

      <Card rounded="2xl" shadow="lg" overflow="hidden" maxW="1200px" mx="auto">
        <CardBody p={6}>
          <Heading size="sm" color="green.700" mb={4} borderLeft="4px solid #1E4D2B" pl={3}>
            કર્મચારી માહિતી
          </Heading>
          
          <Grid 
  templateColumns={{ base: "1fr", md: "1fr 1fr" }} 
  gap={4} 
  w="100%"
>
            <FormControl isRequired isInvalid={isFieldInvalid("registrationDate")}>
              <FormLabel fontSize="sm" fontWeight="600">કર્મચારીનું નામ (ગુજરાતીમાં)</FormLabel>
              <Input 
                name="employeeName" 
                value={formData.employeeName} 
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="ઉદા: રમેશભાઈ પટેલ"
                bg="gray.50"
              />
              <FormErrorMessage>{getFieldError("employeeName")}</FormErrorMessage>
              <FormHelperText fontSize="xs" color="gray.500">માત્ર ગુજરાતી અક્ષરોનો ઉપયોગ કરો</FormHelperText>
            </FormControl>
            
            <FormControl isRequired isInvalid={isFieldInvalid("employeeNameEnglish")}>
              <FormLabel fontSize="sm" fontWeight="600">કર્મચારીનું નામ (અંગ્રેજીમાં)</FormLabel>
              <Input 
                name="employeeNameEnglish" 
                value={formData.employeeNameEnglish} 
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Eg: Rameshbhai Patel"
                bg="gray.50"
              />
              <FormErrorMessage>{getFieldError("employeeNameEnglish")}</FormErrorMessage>
              <FormHelperText fontSize="xs" color="gray.500">બેંકિંગ માટે આ માહિતી આવશ્યક છે</FormHelperText>
            </FormControl>
            
            {/* Date Input Component */}
            <FormControl isRequired isInvalid={isFieldInvalid("registrationDate")}>
              <DateInput
                label="નોંધણી તારીખ"
                formValue={{
                  date: formData.registrationDate,
                  dateDisplay: formData.registrationDateDisplay
                }}
                setFormValue={(updater) => {
                  if (typeof updater === 'function') {
                    const newValues = updater({
                      date: formData.registrationDate,
                      dateDisplay: formData.registrationDateDisplay
                    });
                    setFormData(prev => ({
                      ...prev,
                      registrationDate: newValues.date,
                      registrationDateDisplay: newValues.dateDisplay
                    }));
                    if (touchedFields.registrationDate) {
                      const error = validateField("registrationDate", newValues.date);
                      setValidationErrors(prev => ({
                        ...prev,
                        registrationDate: error
                      }));
                    }
                  }
                }}
                formatDisplayDate={formatDisplayDate}
                convertToISO={convertToISO}
                t={(key) => key}
              />
              <FormErrorMessage>{getFieldError("registrationDate")}</FormErrorMessage>
            </FormControl>
            
            <FormControl isRequired isInvalid={isFieldInvalid("employeeGroup")}>
              <FormLabel fontSize="sm" fontWeight="600">કર્મચારી ગ્રુપનું નામ</FormLabel>
              <Select 
                value={formData.employeeGroup}
                onChange={(e) => handleSelectChange("employeeGroup", e.target.value)}
                onBlur={handleBlur}
                placeholder="ગ્રુપ પસંદ કરો"
                bg="gray.50"
              >
                {employeeGroups.map(group => (
                  <option key={group.value} value={group.value}>{group.label}</option>
                ))}
              </Select>
              <FormErrorMessage>{getFieldError("employeeGroup")}</FormErrorMessage>
            </FormControl>
            
            <FormControl isRequired isInvalid={isFieldInvalid("employeePositionEnglish")}>
              <FormLabel fontSize="sm" fontWeight="600">કર્મચારી હોદ્દો (અંગ્રેજીમાં)</FormLabel>
              <Select 
                value={formData.employeePositionEnglish}
                onChange={(e) => handleSelectChange("employeePositionEnglish", e.target.value)}
                onBlur={handleBlur}
                placeholder="હોદ્દો પસંદ કરો"
                bg="gray.50"
              >
                {positionsEnglish.map(pos => (
                  <option key={pos.value} value={pos.value}>{pos.label}</option>
                ))}
              </Select>
              <FormErrorMessage>{getFieldError("employeePositionEnglish")}</FormErrorMessage>
            </FormControl>
            
            <FormControl isRequired isInvalid={isFieldInvalid("employeePositionGujarati")}>
              <FormLabel fontSize="sm" fontWeight="600">કર્મચારી હોદ્દો (ગુજરાતીમાં)</FormLabel>
              <Select 
                value={formData.employeePositionGujarati}
                onChange={(e) => handleSelectChange("employeePositionGujarati", e.target.value)}
                onBlur={handleBlur}
                placeholder="હોદ્દો પસંદ કરો"
                bg="gray.50"
              >
                {positionsGujarati.map(pos => (
                  <option key={pos.value} value={pos.value}>{pos.label}</option>
                ))}
              </Select>
              <FormErrorMessage>{getFieldError("employeePositionGujarati")}</FormErrorMessage>
            </FormControl>
            
            <FormControl isRequired isInvalid={isFieldInvalid("bankNameEnglish")}>
              <FormLabel fontSize="sm" fontWeight="600">બેંકનું નામ (અંગ્રેજીમાં)</FormLabel>
              <Select 
                value={formData.bankNameEnglish}
                onChange={(e) => handleSelectChange("bankNameEnglish", e.target.value)}
                onBlur={handleBlur}
                placeholder="બેંક પસંદ કરો"
                bg="gray.50"
              >
                {bankNames.map(bank => (
                  <option key={bank.value} value={bank.value}>{bank.label}</option>
                ))}
              </Select>
              <FormErrorMessage>{getFieldError("bankNameEnglish")}</FormErrorMessage>
            </FormControl>
            
            <FormControl isRequired isInvalid={isFieldInvalid("accountNumber")}>
              <FormLabel fontSize="sm" fontWeight="600">અકાઉન્ટ નંબર</FormLabel>
              <Input 
                name="accountNumber" 
                value={formData.accountNumber} 
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="ઉદા: 123456789012"
                bg="gray.50"
              />
              <FormErrorMessage>{getFieldError("accountNumber")}</FormErrorMessage>
              <FormHelperText fontSize="xs" color="gray.500">9 થી 18 અંકોનો નંબર</FormHelperText>
            </FormControl>
            
            <FormControl isRequired isInvalid={isFieldInvalid("ifscCode")}>
              <FormLabel fontSize="sm" fontWeight="600">IFSC કોડ</FormLabel>
              <Input 
                name="ifscCode" 
                value={formData.ifscCode} 
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="ઉદા: SBIN0001234"
                textTransform="uppercase"
                bg="gray.50"
              />
              <FormErrorMessage>{getFieldError("ifscCode")}</FormErrorMessage>
              <FormHelperText fontSize="xs" color="gray.500">4 અક્ષર, પછી 0, પછી 6 અક્ષર/અંક (ઉદા: SBIN0001234)</FormHelperText>
            </FormControl>
            
            <FormControl isRequired isInvalid={isFieldInvalid("salaryScale")}>
              <FormLabel fontSize="sm" fontWeight="600">પગાર સ્કેલ</FormLabel>
              <Select 
                value={formData.salaryScale}
                onChange={(e) => handleSelectChange("salaryScale", e.target.value)}
                onBlur={handleBlur}
                placeholder="સ્કેલ પસંદ કરો"
                bg="gray.50"
              >
                {salaryScales.map(scale => (
                  <option key={scale.value} value={scale.value}>{scale.label}</option>
                ))}
              </Select>
              <FormErrorMessage>{getFieldError("salaryScale")}</FormErrorMessage>
            </FormControl>
            
            <FormControl isRequired isInvalid={isFieldInvalid("basicPay")}>
              <FormLabel fontSize="sm" fontWeight="600">બેઝિક પે (₹)</FormLabel>
              <Input 
                type="number" 
                name="basicPay" 
                value={formData.basicPay} 
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0.00"
                bg="gray.50"
              />
              <FormErrorMessage>{getFieldError("basicPay")}</FormErrorMessage>
              <FormHelperText fontSize="xs" color="gray.500">ઓછામાં ઓછી ₹10,000 અને વધુમાં વધુ ₹5,00,000</FormHelperText>
            </FormControl>
            
            <FormControl isInvalid={isFieldInvalid("gradePay")}>
              <FormLabel fontSize="sm" fontWeight="600">ગ્રેડ પે (₹)</FormLabel>
              <Input 
                type="number" 
                name="gradePay" 
                value={formData.gradePay} 
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0.00"
                bg="gray.50"
              />
              <FormErrorMessage>{getFieldError("gradePay")}</FormErrorMessage>
              <FormHelperText fontSize="xs" color="gray.500">વૈકલ્પિક, વધુમાં વધુ ₹1,00,000</FormHelperText>
            </FormControl>
            
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600">કુલ બેઝિક (₹)</FormLabel>
              <Input 
                name="totalBasic" 
                value={formData.totalBasic} 
                isReadOnly
                bg="gray.100"
                placeholder="આપોઆપ ગણાશે"
              />
              <FormHelperText fontSize="xs" color="gray.500">બેઝિક પે + ગ્રેડ પે</FormHelperText>
            </FormControl>
            
            <FormControl isRequired isInvalid={isFieldInvalid("mobileNumber")}>
              <FormLabel fontSize="sm" fontWeight="600">મોબાઈલ નંબર</FormLabel>
              <Input 
                type="tel" 
                name="mobileNumber" 
                value={formData.mobileNumber} 
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="ઉદા: 9876543210"
                maxLength={10}
                bg="gray.50"
              />
              <FormErrorMessage>{getFieldError("mobileNumber")}</FormErrorMessage>
              <FormHelperText fontSize="xs" color="gray.500">મોબાઈલ નંબર 10 અંકનો હોવો જોઈએ</FormHelperText>
            </FormControl>
            
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600">પી.એફ. ઉધારની સિલ્લક</FormLabel>
              <Input 
                name="pfAccount" 
                value={formData.pfAccount} 
                onChange={handleChange}
                placeholder=""
                bg="gray.50"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600">રીમાર્ક</FormLabel>
              <Input 
                name="remarks" 
                value={formData.remarks} 
                onChange={handleChange}
                placeholder="કોઈ વિશેષ નોંધ"
                bg="gray.50"
              />
            </FormControl>
            
            <FormControl>
              <Checkbox 
                name="isActive" 
                isChecked={formData.isActive} 
                onChange={handleChange} 
                colorScheme="green"
                size="lg"
                mt={6}
              >
                સક્રિય છે (કર્મચારી હાલમાં કાર્યરત છે)
              </Checkbox>
            </FormControl>
          </Grid>

          <Divider my={6} />

          <Heading size="sm" color="green.700" mb={4} borderLeft="4px solid #1E4D2B" pl={3}>
            માસિક મળવા પાત્ર રકમ
          </Heading>
          
          <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={5} mb={8}>
            <FormControl isInvalid={isFieldInvalid("dearnessAllowance")}>
              <FormLabel fontSize="sm" fontWeight="600">મોંઘવારી ભથ્થું (₹)</FormLabel>
              <Input 
                type="number" 
                name="dearnessAllowance" 
                value={formData.dearnessAllowance} 
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0.00"
                bg="gray.50"
              />
              <FormErrorMessage>{getFieldError("dearnessAllowance")}</FormErrorMessage>
            </FormControl>
            
            <FormControl isInvalid={isFieldInvalid("houseRent")}>
              <FormLabel fontSize="sm" fontWeight="600">ઘર ભાડું (₹)</FormLabel>
              <Input 
                type="number" 
                name="houseRent" 
                value={formData.houseRent} 
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0.00"
                bg="gray.50"
              />
              <FormErrorMessage>{getFieldError("houseRent")}</FormErrorMessage>
            </FormControl>
            
            <FormControl isInvalid={isFieldInvalid("medicalAllowance")}>
              <FormLabel fontSize="sm" fontWeight="600">મેડિકલ ભથ્થું (₹)</FormLabel>
              <Input 
                type="number" 
                name="medicalAllowance" 
                value={formData.medicalAllowance} 
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0.00"
                bg="gray.50"
              />
              <FormErrorMessage>{getFieldError("medicalAllowance")}</FormErrorMessage>
            </FormControl>
            
            <FormControl isInvalid={isFieldInvalid("travelAllowance")}>
              <FormLabel fontSize="sm" fontWeight="600">ધોલાઈ ભથ્થું (₹)</FormLabel>
              <Input 
                type="number" 
                name="travelAllowance" 
                value={formData.travelAllowance} 
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0.00"
                bg="gray.50"
              />
              <FormErrorMessage>{getFieldError("travelAllowance")}</FormErrorMessage>
            </FormControl>
            
            <FormControl isInvalid={isFieldInvalid("cleaningAllowance")}>
              <FormLabel fontSize="sm" fontWeight="600">ઝાડુ ભથ્થું (₹)</FormLabel>
              <Input 
                type="number" 
                name="cleaningAllowance" 
                value={formData.cleaningAllowance} 
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0.00"
                bg="gray.50"
              />
              <FormErrorMessage>{getFieldError("cleaningAllowance")}</FormErrorMessage>
            </FormControl>
          </Grid>

          <Divider my={6} />

          <Heading size="sm" color="green.700" mb={4} borderLeft="4px solid #1E4D2B" pl={3}>
            માસિક કપાત પાત્ર રકમ
          </Heading>
          
          <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={5} mb={8}>
            <FormControl isInvalid={isFieldInvalid("employeeContribution")}>
              <FormLabel fontSize="sm" fontWeight="600">કર્મચારીનો ફાળો (₹)</FormLabel>
              <Input 
                type="number" 
                name="employeeContribution" 
                value={formData.employeeContribution} 
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0.00"
                bg="gray.50"
              />
              <FormErrorMessage>{getFieldError("employeeContribution")}</FormErrorMessage>
            </FormControl>
            
            <FormControl isInvalid={isFieldInvalid("otherContribution")}>
              <FormLabel fontSize="sm" fontWeight="600">અન્ય ફાળો (₹)</FormLabel>
              <Input 
                type="number" 
                name="otherContribution" 
                value={formData.otherContribution} 
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0.00"
                bg="gray.50"
              />
              <FormErrorMessage>{getFieldError("otherContribution")}</FormErrorMessage>
            </FormControl>
            
            <FormControl isInvalid={isFieldInvalid("pli")}>
              <FormLabel fontSize="sm" fontWeight="600">પી.એલ.આઈ. (₹)</FormLabel>
              <Input 
                type="number" 
                name="pli" 
                value={formData.pli} 
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0.00"
                bg="gray.50"
              />
              <FormErrorMessage>{getFieldError("pli")}</FormErrorMessage>
            </FormControl>
            
            <FormControl isInvalid={isFieldInvalid("professionalTax")}>
              <FormLabel fontSize="sm" fontWeight="600">વ્યવસાય વેરો (₹)</FormLabel>
              <Input 
                type="number" 
                name="professionalTax" 
                value={formData.professionalTax} 
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0.00"
                bg="gray.50"
              />
              <FormErrorMessage>{getFieldError("professionalTax")}</FormErrorMessage>
            </FormControl>
            
            <FormControl isInvalid={isFieldInvalid("cooperativeInstallment")}>
              <FormLabel fontSize="sm" fontWeight="600">સહકારી મંડળીનો હપ્તો (₹)</FormLabel>
              <Input 
                type="number" 
                name="cooperativeInstallment" 
                value={formData.cooperativeInstallment} 
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0.00"
                bg="gray.50"
              />
              <FormErrorMessage>{getFieldError("cooperativeInstallment")}</FormErrorMessage>
            </FormControl>
          </Grid>

          <Flex justify="flex-end" gap={4} mt={6} pt={4} borderTop="1px solid" borderColor="gray.200">
            <Button
              colorScheme="green"
              onClick={handleSave}
              isLoading={saving}
              leftIcon={<FiSave />}
              size="lg"
              px={8}
              rounded="xl"
              fontWeight="600"
            >
              સેવ કરો
            </Button>
          </Flex>
        </CardBody>
      </Card>

      <Modal isOpen={isSuccessOpen} onClose={handleCloseSuccess} size="md" isCentered>
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
                કર્મચારીની માહિતી સફળતાપૂર્વક નોંધવામાં આવી છે.
              </Text>
              <Button colorScheme="green" onClick={handleCloseSuccess} px={8} rounded="lg">
                બંધ કરો
              </Button>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default EmployeeRegistration;