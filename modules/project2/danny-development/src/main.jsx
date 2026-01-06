import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./i18n";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import { ComponentLibraryProvider } from "component-library-iboon";
import { LanguageProvider } from "./ports/context/LanguageContext.jsx";
import { lightTheme, darkTheme } from "./ui/styles/Style.js";
import { UserProvider } from "./ports/context/UserContext.jsx";
import { VillageProvider } from "./ports/context/VillageContext.jsx";
import { FinancialYearProvider } from "./ports/context/FinancialYearContext.jsx";


createRoot(document.getElementById("root")).render(
  <StrictMode>
 <BrowserRouter basename="/p2">

      <ChakraProvider>
        <ComponentLibraryProvider customStyles={lightTheme}>
          <FinancialYearProvider>
            <VillageProvider>
              <LanguageProvider>
                <UserProvider>
                  <App />
                </UserProvider>
              </LanguageProvider>
            </VillageProvider>
          </FinancialYearProvider>
        </ComponentLibraryProvider>
      </ChakraProvider>
    </BrowserRouter>
  </StrictMode>
);
