import { getGlobalApiCaller } from "component-library-iboon";

const BASE_URL = `${import.meta.env.VITE_SERVER_URL}/permissions`;

export const fetchPermissionsPage = async (
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
    )}&status=${status}`,
    method: "GET",
    Token: localStorage.getItem("accessToken"),
    showSuccessToast: false,
  });
  return response.data;
};

export const fetchPermissionById = async (id) => {
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

export const createNewPermission = async (permission) => {
  const callApi = getGlobalApiCaller();
  if (!callApi) return { data: null, status: false };
  const response = await callApi({
    url: BASE_URL,
    method: "POST",
    body: JSON.stringify(permission),
    Token: localStorage.getItem("accessToken"),
  });
  return response;
};

export const updateExistingPermission = async (id, permission) => {
  const callApi = getGlobalApiCaller();
  if (!callApi) return { data: null, status: false };
  const response = await callApi({
    url: `${BASE_URL}/${id}`,
    method: "PUT",
    body: JSON.stringify(permission),
    Token: localStorage.getItem("accessToken"),
  });
  return response;
};

export const deleteExistingPermission = async (id) => {
  const callApi = getGlobalApiCaller();
  if (!callApi) return { data: null, status: false };
  const response = await callApi({
    url: `${BASE_URL}/${id}`,
    method: "DELETE",
    body: JSON.stringify({}),
    Token: localStorage.getItem("accessToken"),
  });
  return response;
};
