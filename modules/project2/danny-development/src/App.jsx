import { useEffect, useState } from "react";
import AppRoutes from "./App.Routes";
import Signin from "./ui/pages/Signin";
import { useApiCall, useLoader } from "component-library-iboon";
import { Center, Spinner, Text, VStack } from "@chakra-ui/react";
import "./ui/styles/nprogress.css";
// import { MasterLayout } from "./ui/layouts/MasterLayout";
import { useLocation } from "react-router-dom";
import Topbar from "./ui/components/Topbar";
import { fetchCurrentUser } from "./adapters/CurrentUserApiAdapter";
import { useUser } from "./ports/context/UserContext";
import "./App.css"

function App() {
  const { isLoading } = useLoader();
  const { updateUser } = useUser();
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("accessToken")
  );

  useEffect(() => {
    const getCurrentuser = async () => {
      const user = await fetchCurrentUser();
      if (user) {
        setIsAuthenticated(true);
        updateUser(user.data);
      } else {
        setIsAuthenticated(false);
        localStorage.clear();
        window.location.reload();
      }
    };
    if (isAuthenticated) {
      setTimeout(() => {
        getCurrentuser();
      }, 0);
    }
  }, []);

  return (
    <>
      {isLoading && (
        <Center
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Dim background
            zIndex: 1021, // Ensures loader is above everything else
            display: "flex",
            flexDirection: "column",
            gap: 3,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <VStack>
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="teal"
              size="xl"
            />
            <Text color={"#ffffff"}>Loading...</Text>
          </VStack>
        </Center>
      )}

      {isAuthenticated ? (
        <VStack spacing={0}>
          <Topbar />
          <AppRoutes />
        </VStack>
      ) : (
        <Signin />
      )}
    </>
  );
}

export default App;
