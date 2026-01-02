import { getGlobalApiCaller } from "component-library-iboon";
const BASE_URL = import.meta.env.VITE_SERVER_URL;

export const fetchCurrentUser = async () => {
  const callApi = getGlobalApiCaller();
  if (!callApi) return { data: null, status: false };
  const response = await callApi({
    url: `${BASE_URL}/current-user`,
    method: "GET",
    showSuccessToast: false,
    Token: localStorage.getItem("accessToken"),
  });
  return response.data;
};
