import React, { useState } from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import { useHistory } from "@docusaurus/router";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Backend API URL
  const PRODUCTION_URL = "https://rabiasohail098-robotics-backend.hf.space";
  const API_BASE_URL =
    typeof window !== "undefined"
      ? (window as any).env?.REACT_APP_API_URL ||
        (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
          ? "http://localhost:8002/api/v1" // For local development
          : `${PRODUCTION_URL}/api/v1`) // For production
      : "http://localhost:8002/api/v1";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(
          "✅ Password reset link has been sent to your email.",
        );
        setEmail("");
      } else {
        setError(data.detail || "❌ Error sending email. Please try again.");
      }
    } catch (err) {
      setError("❌ Network error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Forgot Password" description="Reset your password">
      <div
        style={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 0",
          background: "#f4fbfb",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "450px",
            padding: "2.5rem",
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            backgroundColor: "#fff",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              marginBottom: "10px",
              color: "#7e22ce",
            }}
          >
            Reset Password
          </h2>
          <p
            style={{
              textAlign: "center",
              marginBottom: "25px",
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            Enter your email to receive a reset link.
          </p>

          {successMessage && (
            <div
              style={{
                padding: "12px",
                background: "#dcfce7",
                color: "#166534",
                borderRadius: "8px",
                marginBottom: "15px",
                fontSize: "14px",
                textAlign: "center",
              }}
            >
              {successMessage}
            </div>
          )}

          {error && (
            <div
              style={{
                padding: "12px",
                background: "#fee2e2",
                color: "#991b1b",
                borderRadius: "8px",
                marginBottom: "15px",
                fontSize: "14px",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                  fontSize: "14px",
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "15px",
                  outline: "none",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                background: loading
                  ? "#cbd5e1"
                  : "linear-gradient(135deg, #7e22ce 0%, #c026d5 100%)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "transform 0.2s",
              }}
            >
              {loading ? "Sending Mail..." : "Send Reset Link"}
            </button>
          </form>

          <div
            style={{ textAlign: "center", marginTop: "20px", fontSize: "14px" }}
          >
            <Link
              to="/signin"
              style={{ color: "#7e22ce", textDecoration: "none" }}
            >
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
