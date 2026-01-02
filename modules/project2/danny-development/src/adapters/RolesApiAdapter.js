import { getGlobalApiCaller } from "component-library-iboon";
const BASE_URL = `${import.meta.env.VITE_SERVER_URL}/roles`;

export const fetchRolesPage = async (
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
    url: `${BASE_URL}?page=${page}&limit=${limit}`,
    method: "GET",
    Token: localStorage.getItem("accessToken"),
    showSuccessToast: false,
  });
  return response.data;
};

export const fetchRoleById = async (id) => {
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

export const createNewRole = async (role) => {
  const callApi = getGlobalApiCaller();
  if (!callApi) return { data: null, status: false };
  const response = await callApi({
    url: BASE_URL,
    method: "POST",
    body: JSON.stringify(role),
    Token: localStorage.getItem("accessToken"),
  });
  return response;
};

export const updateExistingRole = async (id, role) => {
  const callApi = getGlobalApiCaller();
  if (!callApi) return { data: null, status: false };
  const response = await callApi({
    url: `${BASE_URL}/${id}`,
    method: "PUT",
    body: JSON.stringify(role),
    Token: localStorage.getItem("accessToken"),
  });
  return response;
};

export const deleteExistingRole = async (id) => {
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
