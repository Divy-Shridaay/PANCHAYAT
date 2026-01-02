import { set } from "nprogress";
import React, { createContext, useContext, useState } from "react";

const VillageContext = createContext();

export const VillageProvider = ({ children }) => {

  const [district, setDistrict] = useState(localStorage.getItem("district") || "");
  const [districtName, setDistrictName] = useState(localStorage.getItem("districtName") || "");
  const [taluka, setTaluka] = useState(localStorage.getItem("taluka") || "");
  const [talukaName, setTalukaName] = useState(localStorage.getItem("talukaName") || "");

  const [village, setVillage] = useState(localStorage.getItem("village") || "");
  const [villageName, setVillageName] = useState(
    localStorage.getItem("villageName") || ""
  );

  const updateVillage = (newVillage, newVillageName) => {
    setVillage(newVillage);
    setVillageName(newVillageName);
    localStorage.setItem("village", newVillage);
    localStorage.setItem("villageName", newVillageName);
  };

  const updateDistrict = (newDistrict, newDistrictName) => {
    setDistrict(newDistrict);
    setDistrictName(newDistrictName);
    localStorage.setItem("district", newDistrict);
    localStorage.setItem("districtName", newDistrictName);

    setVillage(null);
    setVillageName(null);
    localStorage.setItem("village", null);
    localStorage.setItem("villageName", null);

    setTaluka(null);
    setTalukaName(null);
    localStorage.setItem("taluka", null);
    localStorage.setItem("talukaName", null);
  };

  const updateTaluka = (newTaluka, newTalukaName) => {
    setTaluka(newTaluka);
    setTalukaName(newTalukaName);
    localStorage.setItem("taluka", newTaluka);
    localStorage.setItem("talukaName", newTalukaName);

    setVillage(null);
    setVillageName(null);
    localStorage.setItem("village", null);
    localStorage.setItem("villageName", null);
  };

  return (
    <VillageContext.Provider
      value={{
        village,
        villageName,
        updateVillage,
        updateDistrict,
        district,
        districtName,
        updateTaluka,
        taluka,
        talukaName
      }}>
      {children}
    </VillageContext.Provider>
  );
};

export const useVillage = () => useContext(VillageContext);
