import { getGlobalApiCaller } from "component-library-iboon";
const BASE_URL = `${import.meta.env.VITE_SERVER_URL}/talukas`;

export const fetchTalukasPage = async (
  page = 1,
  limit = 10,
  search = "",
  filter = {},
  status = 1,
  join = ""
) => {
  const callApi = getGlobalApiCaller();
  if (!callApi) return { data: null, status: false };
  const response = await callApi({
    url: `${BASE_URL}?page=${page}&limit=${limit}&search=${search}&status=${status}&join=${join}&filter=${encodeURIComponent(
      JSON.stringify(filter)
    )}`,
    method: "GET",
    Token: localStorage.getItem("accessToken"),
    showSuccessToast: false,
  });
  return response.data;
};

export const fetchTalukaById = async (talukaId) => {
  const callApi = getGlobalApiCaller();
  if (!callApi) return { data: null, status: false };
  const response = await callApi({
    url: `${BASE_URL}/${talukaId}`,
    method: "GET",
    Token: localStorage.getItem("accessToken"),
    showSuccessToast: false,
  });
  return response.data;
};

export const createTaluka = async (taluka) => {
  const callApi = getGlobalApiCaller();
  if (!callApi) return { data: null, status: false };
  const response = await callApi({
    url: BASE_URL,
    method: "POST",
    body: JSON.stringify(taluka),
    Token: localStorage.getItem("accessToken"),
  });
  return response;
};

export const updateTaluka = async (id, taluka) => {
  const callApi = getGlobalApiCaller();
  if (!callApi) return { data: null, status: false };
  const response = await callApi({
    url: `${BASE_URL}/${id}`,
    method: "PUT",
    body: JSON.stringify(taluka),
    Token: localStorage.getItem("accessToken"),
  });
  return response;
};

export const deleteTaluka = async (talukaId) => {
  const callApi = getGlobalApiCaller();
  if (!callApi) return { data: null, status: false };
  const response = await callApi({
    url: `${BASE_URL}/${talukaId}`,
    method: "DELETE",
    body: JSON.stringify({}),
    Token: localStorage.getItem("accessToken"),
  });
  return response;
};
