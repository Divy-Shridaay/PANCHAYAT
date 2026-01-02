import { Input, InputGroup, InputRightElement, IconButton, FormControl, FormErrorMessage , Flex , Box , VStack , Text} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import {
  CustomButton,
  CustomFormLabel,
  useApiCall,
} from "component-library-iboon";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
const baseUrl = import.meta.env.VITE_SERVER_URL;

export default function Signin() {
  const { callApi } = useApiCall();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = t("signin.emailRequired");
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = t("signin.invalidEmail");
    if (!isForgotPassword && !password)
      newErrors.password = t("signin.passwordRequired");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const login = async () => {
    if (!validateForm()) return;

    const response = await callApi({
      url: `${baseUrl}/auth/login`,
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (response?.status) {
      localStorage.setItem("accessToken", response?.data?.data?.accessToken);
      localStorage.setItem("refreshToken", response?.data?.data?.refreshToken);
      window.location.href = "/";
    }
  };

  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

    const [showPassword, setShowPassword] = useState(false);

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bgImage="url('/your-background.jpg')" // <-- change this path to your image!
      bgSize="cover"
      bgPosition="center"
      p={4}
    >
      <Box
        bg="whiteAlpha.900"
        p={8}
        rounded="lg"
        boxShadow="lg"
        maxW="400px"
        w="full"
      >
        <VStack spacing={4} align="stretch">
          <Text fontSize="2xl" fontWeight="bold" textAlign="center">
            {t("signin.title")}
          </Text>

          <FormControl isInvalid={!!errors.email}>
            <Input
              placeholder={t("signin.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FormErrorMessage>{errors.email}</FormErrorMessage>
          </FormControl>

          {!isForgotPassword && (
            <FormControl isInvalid={!!errors.password}>
      <InputGroup>
        <Input
          placeholder={t("signin.passwordPlaceholder")}
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <InputRightElement>
          <IconButton
            variant="ghost"
            size="sm"
            aria-label={showPassword ? "Hide password" : "Show password"}
            icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
            onClick={() => setShowPassword(!showPassword)}
          />
        </InputRightElement>
      </InputGroup>
      <FormErrorMessage>{errors.password}</FormErrorMessage>
    </FormControl>

          )}

          {/* <CustomFormLabel
            cursor="pointer"
            color="blue.500"
            onClick={() => setIsForgotPassword(!isForgotPassword)}
            textAlign="right"
          >
            {isForgotPassword
              ? t("signin.backToSignIn")
              : t("signin.forgotPassword")}
          </CustomFormLabel> */}

          <CustomButton onClick={login}>
            {isForgotPassword
              ? resendTimer > 0
                ? t("signin.resendIn", { seconds: resendTimer })
                : t("signin.sendVerification")
              : t("signin.signInButton")}
          </CustomButton>
        </VStack>
      </Box>
    </Flex>
  );
}
