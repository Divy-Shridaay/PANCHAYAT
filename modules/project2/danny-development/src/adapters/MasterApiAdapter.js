import { getGlobalApiCaller } from "component-library-iboon";
const BASE_URL = `${import.meta.env.VITE_SERVER_URL}/master`;

export const fetchFirstMaster = async () => {
  const callApi = getGlobalApiCaller();
  if (!callApi) return { data: null, status: false };
  const response = await callApi({
    url: `${BASE_URL}?limit=1`,
    method: "GET",
    Token: localStorage.getItem("accessToken"),
    showSuccessToast: false,
  });
  return response.data.data.data[0];
};

export const updateMaster = async (id, master) => {
  const callApi = getGlobalApiCaller();
  if (!callApi) return { data: null, status: false };
  const response = await callApi({
    url: `${BASE_URL}/${id}`,
    method: "PUT",
    body: JSON.stringify(master),
    Token: localStorage.getItem("accessToken"),
  });
  return response;
};
