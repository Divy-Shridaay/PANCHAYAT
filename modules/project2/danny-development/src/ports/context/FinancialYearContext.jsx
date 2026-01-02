import React, { createContext, useContext, useState } from "react";

const FinancialYearContext = createContext();

export const FinancialYearProvider = ({ children }) => {
  const [financialYear, setFinancialYear] = useState(
    localStorage.getItem("financialYear") || ""
  );
  const [financialYearName, setFinancialYearName] = useState(
    localStorage.getItem("financialYearName") || ""
  );

  const updateFinancialYear = (newFinancialYear, newFinancialYearName) => {

    setFinancialYear(newFinancialYear);
    setFinancialYearName(newFinancialYearName);
    localStorage.setItem("financialYear", newFinancialYear);
    localStorage.setItem("financialYearName", newFinancialYearName);
  };

  return (
    <FinancialYearContext.Provider
      value={{ financialYear, financialYearName, updateFinancialYear }}
    >
      {children}
    </FinancialYearContext.Provider>
  );
};

export const useFinancialYear = () => useContext(FinancialYearContext);
