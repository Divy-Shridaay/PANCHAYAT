import React, { useState, useEffect } from "react";
import { Center, FormControl, VStack } from "@chakra-ui/react";
import { CustomFormLabel, CustomSelect } from "component-library-iboon";
import { getEducationCessReport } from "../../adapters/ReportApiAdapter";
import { useVillage } from "../../ports/context/VillageContext";
import EducationReportTable from "../components/EducationReportTable";
import { useFinancialYear } from "../../ports/context/FinancialYearContext";
import PageHeader from "../components/PageHeader";
import { t } from "i18next";

export default function LandReports() {
  const { village } = useVillage();
  const {financialYear} = useFinancialYear();
  const [selectedOption, setSelectedOption] = useState("option1");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [tableData, setTableData] = useState({});

  const handleChange = (event) => {
    const value = event.target.value;
    setSelectedOption(value);

    // // Open new window for the document viewer
    // const url = `/document-viewer?type=${value}`;
    // window.open(url, "_blank");
  };

  useEffect(() => {
    const fetchData = async () => {

      const response = await getEducationCessReport(page, limit, village, financialYear);
      if (response?.data) {
  
        setTableData(response.data);
      }
    };
    if (village) {
      setTimeout(() => {
        fetchData();
      }, 0);
    }
  }, [page, limit, village, financialYear]);

  return (
    <Center w={"90%"}>
      <VStack w={"100%"} spacing={4} align="stretch" mt={3}>
        {/* <HStack w={["100%", "50%"]}> */}
             <PageHeader>{t("topbar.educationCess")} {t("topbar.report")}</PageHeader>
        <FormControl w={"200px"}>
          <CustomFormLabel>Register</CustomFormLabel>
          <CustomSelect
            value={selectedOption}
            onChange={handleChange}
            placeholder="Select Register"
          >
            <option value="landRevenueReturn">Land Revenue return form</option>
            <option value="landRevenueDate">Land Revenue Date</option>
            <option value="dateOfIssue">Date of issue</option>
          </CustomSelect>
        </FormControl>
        {/* <CustomButton>Search</CustomButton>
        </HStack> */}
        {/* <DocumentViewer columns={columns} /> */}
        {/* <TableComponent
          caption="Land Revenue Report"
          columns={columns}
          data={tableData.data || []}
          emptyMessage="No data available for the selected register."
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpen={onOpen}
          totalDocs={tableData.totalDocs || 0}
          lastPage={tableData.lastPage || 0}
          page={tableData.page || 1}
          setPage={setPage}
          limit={tableData.limit || 10}
          setLimit={setLimit}
          status={status}
          setStatus={setStatus}
          filter={filter}
          setFilter={setFilter}
          deleteFunction={() => {}}
          isSearch={false}
          isCreate={false}
        /> */}
        <EducationReportTable
          data={tableData?.data}
          page={page}
          setPage={setPage}
          limit={limit}
          setLimit={setLimit}
          totalDocs={tableData?.pagination?.totalDocs || 0}
          lastPage={tableData?.pagination?.lastPage || 0}
        />
      </VStack>
    </Center>
  );
}
