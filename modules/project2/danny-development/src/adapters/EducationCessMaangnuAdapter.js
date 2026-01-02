import { getGlobalApiCaller } from "component-library-iboon";

const BASE_URL = `${import.meta.env.VITE_SERVER_URL}/education-cess-maangnu`;
const DELETE_ALL_URL = `${import.meta.env.VITE_SERVER_URL}/allDelete/maangnu`;

export const fetchEducationCessMaangnu = async (
  page = 1,
  limit = 10,
  search = "",
  join = "",
  filter = {},
  status = 1,
  pipeline
) => {
  const callApi = getGlobalApiCaller();
  if (!callApi) return { data: null, status: false };
  const response = await callApi({
    url:
      pipeline && pipeline.length > 0
        ? `${BASE_URL}?pipeline=${encodeURIComponent(
            JSON.stringify(pipeline)
          )}&page=${page}&limit=${limit}`
        : `${BASE_URL}?page=${page}&limit=${limit}&search=${search}&join=${join}&filter=${encodeURIComponent(
            JSON.stringify(filter)
          )}&status=${status}`,
    method: "GET",
    Token: localStorage.getItem("accessToken"),
    showSuccessToast: false,
  });
  return response.data;
};

export const fetchEducationMaagnuById = async (id) => {
  const callApi = getGlobalApiCaller();
  if (!callApi) return { data: null, status: false };
  const response = await callApi({
    url: `${BASE_URL}/${id}`,
    method: "GET",
    Token: localStorage.getItem("accessToken"),
  });
  return response;
};

export const updateEducationMaangnu = async (id, landMaangnu) => {
  const callApi = getGlobalApiCaller();
  if (!callApi) return { data: null, status: false };
  const response = await callApi({
    url: `${BASE_URL}/${id}`,
    method: "PUT",
    body: JSON.stringify(landMaangnu),
    Token: localStorage.getItem("accessToken"),
  });
  return response;
};


export const deleteEducationMaangnu = async (id) => {
  const callApi = getGlobalApiCaller();
  if (!callApi) return { data: null, status: false };
  const response = await callApi({
    url: `${BASE_URL}/hard/${id}`,
    method: "DELETE",
    Token: localStorage.getItem("accessToken"),
    body: {}
  });
  return response;
};

export const deleteAllEducationMaangnu = async (financialYear, village) => {
  const callApi = getGlobalApiCaller();
  if (!callApi) return { data: null, status: false };
  const response = await callApi({
    url: `${DELETE_ALL_URL}`,
    method: "DELETE",
    Token: localStorage.getItem("accessToken"),
    body: {
      village: village,
      financialYear: financialYear,
      type: "Education"
    }
  });
  return response;
};