import { getGlobalApiCaller } from "component-library-iboon";

const BASE_URL = `${import.meta.env.VITE_SERVER_URL}/land-maangnu`;

const DELETE_ALL_URL = `${import.meta.env.VITE_SERVER_URL}/allDelete/maangnu`;

export const fetchLandMaangnu = async (
  page = 1,
  limit = 10,
  search = "",
  join = "",
  filter = {},
  status = 1,
  pipeline, 
  extraParams = ""
) => {
  const callApi = getGlobalApiCaller();
  if (!callApi) return { data: null, status: false };
  const response = await callApi({
    url:
      pipeline && pipeline.length > 0
        ? `${BASE_URL}?pipeline=${encodeURIComponent(
            JSON.stringify(pipeline)
          )}&page=${page}&limit=${limit}&${extraParams}`
        : `${BASE_URL}?page=${page}&limit=${limit}&search=${search}&join=${join}&filter=${encodeURIComponent(
            JSON.stringify(filter)
          )}&status=${status}&${extraParams}`,
    method: "GET",
    Token: localStorage.getItem("accessToken"),
    showSuccessToast: false,
  });
  return response.data;
};


export const fetchLandMaagnuById = async (id) => {
  const callApi = getGlobalApiCaller();
  if (!callApi) return { data: null, status: false };
  const response = await callApi({
    url: `${BASE_URL}/${id}`,
    method: "GET",
    Token: localStorage.getItem("accessToken"),
  });
  return response;
};

export const updateLandMaangnu = async (id, landMaangnu) => {
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

export const deleteLandMaangnu = async (id) => {
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

export const deleteAllLandMaangnu = async (financialYear, village) => {
  const callApi = getGlobalApiCaller();
  if (!callApi) return { data: null, status: false };
  const response = await callApi({
    url: `${DELETE_ALL_URL}`,
    method: "DELETE",
    Token: localStorage.getItem("accessToken"),
    body: {
      village: village,
      financialYear: financialYear,
      type: "Land"
    }
  });
  return response;
};