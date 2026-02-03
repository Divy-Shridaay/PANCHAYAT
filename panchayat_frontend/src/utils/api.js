import { useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

/**
 * 🌐 API BASE URL
 * Works with or without .env
 */
const API_BASE_URL = (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"))
  ? "http://localhost:5000"
 : (import.meta.env.VITE_API_BASE_URL || "https://panchayat.shridaay.com:5000");
 // 👈 YOUR LIVE BACKEND URL


/**
 * 🔧 Safely join base URL + path
 */
const buildUrl = (base, path) => {
  if (!path) return base;
  if (path.startsWith("http")) return path;
  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
};

/**
 * 🔑 Core apiFetch function
 */
export const apiFetch = async (url, options = {}, navigate, toast) => {
  const token = localStorage.getItem("token");
  const fullUrl = buildUrl(API_BASE_URL, url);

  const fetchOptions = {
    ...options,
    method: options.method || "GET",
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(fullUrl, fetchOptions);

    // ✅ Safe JSON parse (prevents crashes)
    let data = {};
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    // 🔴 Unauthorized → force logout
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      navigate?.("/login");
      return { response, data };
    }

    // 🔴 Trial expired handling
    if (response.status === 403 && data?.trialExpired) {
      toast?.({
        title: "ટ્રાયલ સમયસમાપ્તિ થઈ ગઈ છે",
        description: data.message || "",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });

      localStorage.removeItem("token");
      localStorage.removeItem("username");

      setTimeout(() => {
        navigate?.("/login");
      }, 2000);

      return { response, data };
    }

    // ✅ Normal return (even for other 4xx/5xx)
    return { response, data };

  } catch (error) {
    console.error("API / NETWORK ERROR:", error);

    toast?.({
      title: "સર્વર સાથે કનેક્શન શક્ય નથી",
      status: "error",
      duration: 4000,
      isClosable: true,
      position: "top",
    });

    throw error;
  }
};

/**
 * 🪝 Hook wrapper (NO breaking change)
 */
export const useApiFetch = () => {
  const navigate = useNavigate();
  const toast = useToast();

  return (url, options = {}) =>
    apiFetch(url, options, navigate, toast);
};
