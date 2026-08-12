import { useState } from "react";
import axios from "axios";
import "./Login.css";

const API_URL = "http://localhost:5000/api";

export default function Login() {
  const [email, setEmail] = useState("admin@minierp.com");
  const [password, setPassword] = useState("Admin@123");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem(
          "user",
          JSON.stringify(response.data.user)
        );

        setMessage("Login successful!");

        console.log("Login response:", response.data);

        window.location.href = "/dashboard";
      } else {
        setMessage(
          response.data.message || "Login failed."
        );
      }
    } catch (error: any) {
      console.error("Login error:", error);

      setMessage(
        error.response?.data?.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* LEFT BRANDING SECTION */}
      <section className="login-brand">

        <div className="brand-decoration brand-circle-one" />
        <div className="brand-decoration brand-circle-two" />
        <div className="brand-decoration brand-circle-three" />

        <div className="brand-content">

          <div className="brand-logo">
            <span>▥</span>
          </div>

          <h1>Mini ERP CRM</h1>

          <p className="brand-tagline">
            Manage your business smarter
            <br />
            All in one place
          </p>

          <div className="feature-list">

            <div className="feature-item">
              <div className="feature-icon">♙</div>
              <span>Customer Management</span>
            </div>

            <div className="feature-item">
              <div className="feature-icon">▣</div>
              <span>Product &amp; Inventory</span>
            </div>

            <div className="feature-item">
              <div className="feature-icon">↗</div>
              <span>Stock Movements</span>
            </div>

            <div className="feature-item">
              <div className="feature-icon">▤</div>
              <span>Challans &amp; Reporting</span>
            </div>

          </div>

        </div>
      </section>


      {/* RIGHT LOGIN SECTION */}
      <section className="login-section">

        <div className="login-card">

          <div className="login-header">

            <h2>Welcome Back 👋</h2>

            <p>
              Sign in to your Mini ERP CRM account
            </p>

          </div>


          <form onSubmit={handleLogin}>

            {/* EMAIL */}
            <div className="login-field">

              <label htmlFor="email">
                Email
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  ✉
                </span>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Enter your email"
                  required
                />

              </div>

            </div>


            {/* PASSWORD */}
            <div className="login-field">

              <label htmlFor="password">
                Password
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  🔒
                </span>

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter your password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? "◉" : "◌"}
                </button>

              </div>

            </div>


            {/* REMEMBER / FORGOT */}
            <div className="login-options">

              <label className="remember-me">

                <input
                  type="checkbox"
                  defaultChecked
                />

                <span>
                  Remember me
                </span>

              </label>

              <button
                type="button"
                className="forgot-password"
                onClick={() =>
                  setMessage(
                    "Please contact the administrator to reset your password."
                  )
                }
              >
                Forgot password?
              </button>

            </div>


            {/* MESSAGE */}
            {message && (
              <div
                className={`login-message ${
                  message.includes("successful")
                    ? "success"
                    : "error"
                }`}
              >
                {message}
              </div>
            )}


            {/* LOGIN BUTTON */}
            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >

              <span className="login-button-icon">
                →
              </span>

              {loading
                ? "Signing in..."
                : "Login"}

            </button>

          </form>

        </div>


        <div className="login-footer">
          © 2026 Mini ERP CRM. All rights reserved.
        </div>

      </section>

    </div>
  );
}