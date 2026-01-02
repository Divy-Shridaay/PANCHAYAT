import { getGlobalApiCaller } from "component-library-iboon";

const BASE_URL = `${import.meta.env.VITE_SERVER_URL}`;

export const getLandReport = async (page = 1, limit = 50, village, financialYear) => {
  const callApi = getGlobalApiCaller();
  if (!callApi) return { data: null, status: false };
  const response = await callApi({
    url: `${BASE_URL}/land-report?village=${village}&page=${page}&limit=${limit}&financialYear=${financialYear}`,
    method: "GET",
    Token: localStorage.getItem("accessToken"),
    showSuccessToast: false,
  });
  return response.data;
};

export const getLocalFundReport = async (page = 1, limit = 50, village, financialYear) => {
  const callApi = getGlobalApiCaller();
  if (!callApi) return { data: null, status: false };
  const response = await callApi({
    url: `${BASE_URL}/local-fund-report?village=${village}&page=${page}&limit=${limit}&financialYear=${financialYear}`,
    method: "GET",
    Token: localStorage.getItem("accessToken"),
    showSuccessToast: false,
  });
  return response.data;
};

export const getEducationCessReport = async (page = 1, limit = 50, village, financialYear) => {
  const callApi = getGlobalApiCaller();
  if (!callApi) return { data: null, status: false };
  const response = await callApi({
    url: `${BASE_URL}/education-report?village=${village}&page=${page}&limit=${limit}&financialYear=${financialYear}`,
    method: "GET",
    Token: localStorage.getItem("accessToken"),
    showSuccessToast: false,
  });
  return response.data;
};


