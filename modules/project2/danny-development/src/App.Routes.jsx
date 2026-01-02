import React from "react";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./ui/pages/Dashboard";
import Districts from "./ui/pages/Districts";
import Talukas from "./ui/pages/Talukas";
import Villages from "./ui/pages/Villages";
import Profile from "./ui/pages/Profile";
import Roles from "./ui/pages/Roles";
import Permissions from "./ui/pages/Permissions";
import Users from "./ui/pages/Users";
import Villagers from "./ui/pages/Villagers";
import { useUser } from "./ports/context/UserContext";
import LandRevenue from "./ui/pages/LandRevenueCollection";
import Master from "./ui/pages/Master";
import LocalFundRevenue from "./ui/pages/LocalFundRevenueCollection";
import EducationRevenue from "./ui/pages/EducationRevenueCollection";
import LandChallan from "./ui/pages/LandChallan";
import LocalFundChallan from "./ui/pages/LocalFundChallan";
import EducationChallan from "./ui/pages/EducationChallan";
import LandReports from "./ui/pages/LandReports";
import LocalFundReports from "./ui/pages/LocalFundReports";
import EducationReports from "./ui/pages/EducationReports";
import LandMaangnu from "./ui/pages/LandMaangnu";
import LocalFundMaangnu from "./ui/pages/LocalFundMaangnu";
import EducationMaangnu from "./ui/pages/EducationMaangnu";
import MainReports from "./ui/pages/MainReports";
import ImportData from "./ui/pages/ImportData";

export default function AppRoutes() {
  const { user } = useUser();

  const isSuperAdmin = user?.role?.name === "Super Admin";

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/villages" element={<Villages />} />
      <Route path="/main-report" element={<MainReports />} />
      <Route path="/villagers" element={<Villagers />} />
      <Route path="/profile" element={<Profile />} />

      <Route path="/land-revenue-maangnu" element={<LandMaangnu />} />
      <Route path="/land-revenue-collection" element={<LandRevenue />} />
      <Route path="/land-revenue-challan" element={<LandChallan />} />
      <Route path="/land-revenue-report" element={<LandReports />} />
      <Route path="/local-fund-maangnu" element={<LocalFundMaangnu />} />
      <Route path="/local-fund-collection" element={<LocalFundRevenue />} />
      <Route path="/local-fund-challan" element={<LocalFundChallan />} />
      <Route path="/local-fund-report" element={<LocalFundReports />} />
      <Route path="/education-cess-maangnu" element={<EducationMaangnu />} />
      <Route path="/education-cess-collection" element={<EducationRevenue />} />
      <Route path="/education-cess-challan" element={<EducationChallan />} />
      <Route path="/education-cess-report" element={<EducationReports />} />
      <Route path="/import-data" element={<ImportData />} />

      <Route path="/master" element={<Master />} />

      {/* � Protected Routes for Super Admin only
      {isSuperAdmin && (
        <> */}
      <Route path="/districts" element={<Districts />} />
      <Route path="/talukas" element={<Talukas />} />
      <Route path="/roles" element={<Roles />} />
      <Route path="/permissions" element={<Permissions />} />
      <Route path="/users" element={<Users />} />
      {/* </>
      )} */}

      {/* � Optional: Catch unauthorized access manually */}
      {/* {!isSuperAdmin && (
        <>
          <Route path="/districts" element={<Navigate to="/" />} />
          <Route path="/talukas" element={<Navigate to="/" />} />
          <Route path="/roles" element={<Navigate to="/" />} />
          <Route path="/permissions" element={<Navigate to="/" />} />
          <Route path="/users" element={<Navigate to="/" />} />
        </>
      )} */}
    </Routes>
  );
}
