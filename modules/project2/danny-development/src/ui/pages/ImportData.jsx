import {
  Center, HStack, Text, VStack, useToast, Table, Thead, Tbody, Tr, Th, Td,
  Box,
} from '@chakra-ui/react';
import React from 'react';
import PageHeader from '../components/PageHeader';
import { t } from 'i18next';
import { CustomButton, CustomInput, getGlobalApiCaller } from 'component-library-iboon';
import { useVillage } from '../../ports/context/VillageContext';
import { useFinancialYear } from '../../ports/context/FinancialYearContext';
import * as XLSX from 'xlsx';
import { saveAs } from "file-saver";

function ImportData() {
  const BASE_URL = `${import.meta.env.VITE_SERVER_URL}/import-data`;
  const { village } = useVillage();
  const { financialYear } = useFinancialYear();
  const [excelData, setExcelData] = React.useState([]);
  const [columnOrder, setColumnOrder] = React.useState([]);
  const toast = useToast();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: 'binary' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      // header: 1 gives array-of-arrays — preserves exact Excel column order
      const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (rawData.length === 0) return;

      const headers = rawData[0];
      const rows = rawData.slice(1).map((row) =>
        headers.reduce((obj, key, idx) => {
          obj[key] = row[idx] ?? "";
          return obj;
        }, {})
      );

      setColumnOrder(headers);
      setExcelData(rows);
    };
    reader.readAsBinaryString(selectedFile);
  };

  const handleImport = async () => {
    if (!village || !financialYear || excelData.length === 0) {
      toast({ title: "Missing data", status: "error" });
      return;
    }

    const payload = {
      villageId: village,
      financialYear,
      rows: excelData,
    };

    const callApi = getGlobalApiCaller();
    if (!callApi) return;

    const response = await callApi({
      url: BASE_URL,
      method: "POST",
      body: JSON.stringify(payload),
      Token: localStorage.getItem("accessToken"),
      contentType: "application/json",
    });

    if (response?.status) {
      toast({ title: "Successfully imported", status: "success" });
      setExcelData([]);
      setColumnOrder([]);
    } else {
      toast({ title: "Failed to import", status: "error" });
    }
  };

  const handleTemplateDownload = () => {
    const headers = [
      [
        "ખાતા નંબર", "નામ", "સરકારી", "સિવાય",
        "જમીન પાછલી બાકી", "જમીન ફાજલ", "જમીન ફરતી",
        "લોકલ પાછલી બાકી", "લોકલ ફાજલ", "લોકલ ફરતી",
        "શિક્ષણ પાછલી બાકી", "શિક્ષણ ફાજલ", "શિક્ષણ ફરતી"
      ]
    ];

    const ws = XLSX.utils.aoa_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    saveAs(blob, "importMangnuTemplate.xlsx");
  };

  return (
    <Center w="90%">
      <VStack spacing={6} w="100%" align="stretch">
        <PageHeader>{t("topbar.imoprtData")}</PageHeader>

        <HStack justifyContent={"space-between"} spacing={4}>
          <HStack>
            <Text>{t("importData.uploadData")}</Text>
            <CustomInput type="file" onChange={handleFileChange} width="240px" />
            <CustomButton onClick={handleImport}>
              {t("manganuModal.save") || "Upload"}
            </CustomButton>
          </HStack>
          <HStack spacing={4}>
            <Text onClick={handleTemplateDownload} color="blue.500" fontWeight="bold" cursor="pointer">
              {t("importData.downloadTemplate")}
            </Text>
          </HStack>
        </HStack>

        {excelData.length > 0 && (
          <VStack align="stretch" spacing={4}>
            <Text fontWeight="bold">{t("importData.previewData") || "Preview Excel Data"}</Text>
            <Table size="sm" variant="striped">
              <Thead>
                <Tr>
                  {columnOrder.map((key) => (
                    <Th key={key}>{key}</Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {excelData.map((row, i) => (
                  <Tr key={i}>
                    {columnOrder.map((key, j) => (
                      <Td key={j}>{row[key] || "-"}</Td>
                    ))}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </VStack>
        )}
      </VStack>
    </Center>
  );
}

export default ImportData;