import { getGlobalApiCaller } from "component-library-iboon";

const BASE_URL = `${import.meta.env.VITE_SERVER_URL}/challans`;

export const fetchChallansPage = async (
  page = 1,
  limit = 10,
  search = "",
  join = "",
  filter = {},
  status = 1
) => {
  const callApi = getGlobalApiCaller();
  if (!callApi) return { data: null, status: false };
  const response = await callApi({
    url: `${BASE_URL}?page=${page}&limit=${limit}&search=${search}&join=${join}&filter=${encodeURIComponent(
      JSON.stringify(filter)
    )}&status=${status}&sort=challanNo`,
    method: "GET",
    Token: localStorage.getItem("accessToken"),
    showSuccessToast: false,
  });
  return response.data;
};

export const fetchChallanById = async (id) => {
  const callApi = getGlobalApiCaller();
  if (!callApi) return { data: null, status: false };
  const response = await callApi({
    url: `${BASE_URL}/${id}`,
    method: "GET",
    Token: localStorage.getItem("accessToken"),
    showSuccessToast: false,
  });
  return response.data;
};

export const createChallan = async (challan) => {
  const callApi = getGlobalApiCaller();
  if (!callApi) return { data: null, status: false };
  const response = await callApi({
    url: BASE_URL,
    method: "POST",
    body: JSON.stringify(challan),
    Token: localStorage.getItem("accessToken"),
  });
  return response;
};

export const updateChallan = async (id, challan) => {
  const callApi = getGlobalApiCaller();
  if (!callApi) return { data: null, status: false };
  const response = await callApi({
    url: `${BASE_URL}/${id}`,
    method: "PUT",
    body: JSON.stringify(challan),
    Token: localStorage.getItem("accessToken"),
  });
  return response;
};

export const deleteChallan = async (id) => {
  const callApi = getGlobalApiCaller();
  if (!callApi) return { data: null, status: false };
  const response = await callApi({
    url: `${BASE_URL}/hard/${id}`,
    method: "DELETE",
    body: JSON.stringify({}),
    Token: localStorage.getItem("accessToken"),
  });
  return response;
};

