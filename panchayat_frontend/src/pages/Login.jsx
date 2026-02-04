"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import { apiFetch } from "../utils/api.js";
import logo from "../assets/logo.png";
import "./Login.css";

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Feature Rotation Logic
  const totalSlides = 3;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const role = localStorage.getItem("role");
      if (role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();

    if (!username || !password) {
      toast({
        title: "કૃપા કરીને બધી વિગત ભરો",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setLoading(true);
    try {
      const { response, data } = await apiFetch(
        "/api/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ username, password }),
        },
        navigate,
        toast
      );

      if (!data.token) {
        toast({
          title: data.message || t("error"),
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
        setLoading(false);
        return;
      }

      toast({
        title: t("success"),
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top",
      });

      setTimeout(() => {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.user?.username || "");
        localStorage.setItem("role", data.user?.role || "user");

        if (data.user?.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }, 800);
    } catch (err) {
      console.error(err);
      toast({
        title: t("error"),
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }

    setLoading(false);
  };

  return (
    <div className="login-page-container">
      {/* Left Side - Feature Showcase */}
      <div className="feature-section">
        <div className="decorative-bg">
          <div className="decorative-circle-1"></div>
          <div className="decorative-circle-2"></div>
        </div>
        <div className="pattern-overlay"></div>

        <div className="feature-content">
          {/* Feature Icons */}
          <div className="feature-icon-container">
            {/* Feature 1 Icon */}
            <div className={`feature-icon ${currentSlide === 0 ? "active" : "inactive"}`}>
              <div className="feature-icon-bg">
                <svg viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
            </div>
            {/* Feature 2 Icon */}
            <div className={`feature-icon ${currentSlide === 1 ? "active" : "inactive"}`}>
              <div className="feature-icon-bg">
                <svg viewBox="0 0 24 24">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
            </div>
            {/* Feature 3 Icon */}
            <div className={`feature-icon ${currentSlide === 2 ? "active" : "inactive"}`}>
              <div className="feature-icon-bg">
                <svg viewBox="0 0 24 24">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
            </div>
          </div>

          {/* Feature Text */}
          <div className="feature-text-container">
            {/* Feature 1 */}
            <div className={`feature-text ${currentSlide === 0 ? "active" : "inactive"}`}>
              <h2 className="feature-title">પેઢીનામું સેવા</h2>
              <p className="feature-subtitle">Legal Heir Certificate</p>
              <p className="feature-description">કાનૂની વારસદાર પ્રમાણપત્ર બનાવો અને સંચાલિત કરો</p>
            </div>
            {/* Feature 2 */}
            <div className={`feature-text ${currentSlide === 1 ? "active" : "inactive"}`}>
              <h2 className="feature-title">રોજમેળ વ્યવસ્થાપન</h2>
              <p className="feature-subtitle">Financial Records</p>
              <p className="feature-description">ગ્રામ પંચાયતના આવક-ખર્ચનો હિસાબ રાખો</p>
            </div>
            {/* Feature 3 */}
            <div className={`feature-text ${currentSlide === 2 ? "active" : "inactive"}`}>
              <h2 className="feature-title">જમીન મહેસૂલ હિસાબો</h2>
              <p className="feature-subtitle">Land Revenue Management</p>
              <p className="feature-description">જમીન મહેસૂલના હિસાબોનું સંચાલન કરો</p>
            </div>
          </div>

          {/* Progress Indicators */}
          <div className="progress-indicators">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                className={`progress-dot ${currentSlide === i ? "active" : ""}`}
                onClick={() => setCurrentSlide(i)}
              ></button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="login-section">
        <div className="login-wrapper">
          {/* Logo and Header */}
          <div className="logo-header">
            <div className="logo-icon-img">
              <img src={logo} alt="Gram Panchayat Logo" />
            </div>
            <h1 className="main-title">ગ્રામ પંચાયત</h1>
            <p className="subtitle">ડિજિટલ પોર્ટલ</p>
          </div>

          {/* Login Form */}
          <form className="login-form" onSubmit={handleLogin}>
            {/* Username Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="username">વપરાશકર્તા નામ</label>
              <input
                type="text"
                id="username"
                className="form-input"
                placeholder="વપરાશકર્તા નામ"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="password">પાસવર્ડ</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="form-input"
                  placeholder="પાસવર્ડ"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {!showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="forgot-password">
              <a href="#" onClick={(e) => { e.preventDefault(); navigate("/forgot-password"); }}>પાસવર્ડ ભૂલી ગયા છો?</a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className={`login-button ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              <span className="spinner"></span>
              <span>{loading ? "લૉગિન કરી રહ્યા છે..." : "લૉગિન"}</span>
            </button>

            {/* Register Link */}
            <div className="register-section">
              <p>
                નવો વપરાશકર્તા છો?
                <a href="#" onClick={(e) => { e.preventDefault(); navigate("/register"); }}> અહીં નોંધણી કરો</a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


