import { getGlobalApiCaller, useLoader } from "component-library-iboon";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_SERVER_URL;
const DELETE_ALL_URL = `${BASE_URL}/allDelete/villager`;
const EXPORT_DATA = `${BASE_URL}/export-data`;

export const fetchVillagerByAccountNo = async (accountNo, villageId, financialYear = "") => {
  const callApi = getGlobalApiCaller();
  if (!callApi) return { data: null, status: false };

  // Build filter dynamically
  const filter = { accountNo, village: villageId };
  if (financialYear) {
    filter.financialYear = financialYear;
  }

  const response = await callApi({
    url: `${BASE_URL}/villagers/by-account-no?filter=${encodeURIComponent(
      JSON.stringify(filter)
    )}`,
    method: "GET",
    Token: localStorage.getItem("accessToken"),
    // needsLoader: false,
  });

  return response.data.data;
};

export const fetchVillagersPage = async (
  page = 1,
  limit = 10,
  join = "",
  filter = {},
  search = "",
  status = 1
) => {
  const newFilter = { ...filter };
  if (search) {
    newFilter.$or = [
      { name: { $regex: search, $options: "i" } },
      { accountNo: parseInt(search) },
    ];
  }
  const callApi = getGlobalApiCaller();
  if (!callApi) return { data: null, status: false };
  const response = await callApi({
    url: `${BASE_URL}/villagers?page=${page}&limit=${limit}&join=${join}&search=${search}&filter=${encodeURIComponent(
      JSON.stringify(newFilter)
    )}&status=${status}&sort=accountNo`,
    method: "GET",
    Token: localStorage.getItem("accessToken"),
    showSuccessToast: false,
  });
  return response.data;
};

export const fetchVillagerById = async (id) => {
  const callApi = getGlobalApiCaller();
  if (!callApi) return { data: null, status: false };
  const response = await callApi({
    url: `${BASE_URL}/villagers/${id}`,
    method: "GET",
    Token: localStorage.getItem("accessToken"),
    showSuccessToast: false,
  });
  return response.data;
};

export const createNewVillager = async (villager) => {
  const callApi = getGlobalApiCaller();
  if (!callApi) return { data: null, status: false };
  const response = await callApi({
    url: `${BASE_URL}/villagers`,
    method: "POST",
    body: JSON.stringify(villager),
    Token: localStorage.getItem("accessToken"),
  });
  return response;
};

export const updateExistingVillager = async (id, villager) => {
  const callApi = getGlobalApiCaller();
  if (!callApi) return { data: null, status: false };
  const response = await callApi({
    url: `${BASE_URL}/villagers/${id}`,
    method: "PUT",
    body: JSON.stringify(villager),
    Token: localStorage.getItem("accessToken"),
  });
  return response;
};

export const deleteExistingVillager = async (id) => {
  const callApi = getGlobalApiCaller();
  if (!callApi) return { data: null, status: false };
  const response = await callApi({
    url: `${BASE_URL}/villagers/hard/${id}`,
    method: "DELETE",
    body: JSON.stringify({}),
    Token: localStorage.getItem("accessToken"),
  });
  return response;
};

export const deleteAllVillagers = async (village) => {
  const callApi = getGlobalApiCaller();
  if (!callApi) return { data: null, status: false };
  const response = await callApi({
    url: `${DELETE_ALL_URL}`,
    method: "DELETE",
    Token: localStorage.getItem("accessToken"),
    body: {
      village: village,
    },
  });
  return response;
};

export const exportVillagers = async (
  village,
  taluka,
  district,
  financialYear,
  format
) => {
  const token = localStorage.getItem("accessToken");

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // only use blob for Excel or PDF downloads
  if (format === "excel" || format === "xlsx") {
    config.responseType = "blob";
  }

  const response = await axios.post(
    `${EXPORT_DATA}/vasulat-patrak?format=${format}`,
    { villageId: village, taluka, district, financialYear },
    config
  );

  return response;
};

export const exportBinKhetiVillagers = async (
  village,
  taluka,
  district,
  financialYear
) => {
  const token = localStorage.getItem("accessToken");
  
  const response = await axios.post(
   `${EXPORT_DATA}/`,
    { villageId: village, taluka, district, financialYear },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: "blob", // important for Excel download
    }
  );
  return response;
};
