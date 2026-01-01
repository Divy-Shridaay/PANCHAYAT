import { useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Custom fetch wrapper that handles authentication and trial expiration
export const apiFetch = async (url, options = {}, navigate, toast) => {
  const token = localStorage.getItem("token");

  // Prepend base URL if URL doesn't start with http
  const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(fullUrl, defaultOptions);
    const data = await response.json();

    // Handle trial expiration
    if (response.status === 403 && data.trialExpired) {
      toast({
        title: "ટ્રાયલ સમયસમાપ્તિ થઈ ગઈ છે",
        description: data.message,
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      // Clear token and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      setTimeout(() => navigate("/login"), 2000);
      throw new Error("Trial expired");
    }

    // Handle other auth errors
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      navigate("/login");
      throw new Error("Unauthorized");
    }

    return { response, data };
  } catch (error) {
    if (error.message !== "Trial expired" && error.message !== "Unauthorized") {
      console.error("API Error:", error);
    }
    throw error;
  }
};

// Hook to use apiFetch with navigation and toast
export const useApiFetch = () => {
  const navigate = useNavigate();
  const toast = useToast();

  return (url, options) => apiFetch(url, options, navigate, toast);
};