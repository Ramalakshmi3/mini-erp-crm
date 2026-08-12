import {
  Navigate,
  Route,
  Routes,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useEffect, useState } from "react";

import api from "./services/api";

import Login from "./pages/Login";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import Stock from "./pages/Stock";
import Challans from "./pages/Challans";
import Categories from "./pages/Categories";
import Warehouses from "./pages/Warehouses";

import "./App.css";


// ======================================================
// GLOBAL BACK BUTTON
// ======================================================

function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  if (
    location.pathname === "/login" ||
    location.pathname === "/dashboard"
  ) {
    return null;
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <button
      className="global-back-button"
      onClick={handleBack}
    >
      ← Back
    </button>
  );
}


// ======================================================
// DASHBOARD
// ======================================================

function Dashboard() {
  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [stockMovements, setStockMovements] = useState<any[]>([]);
  const [challans, setChallans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // ====================================================
  // LOAD DASHBOARD DATA
  // ====================================================

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const role = user?.role;

      // These APIs are available for all logged-in roles
      const [
        customersResponse,
        productsResponse,
        warehousesResponse,
        challansResponse,
      ] = await Promise.all([
        api.get("/customers"),
        api.get("/products"),
        api.get("/warehouses"),
        api.get("/challans"),
      ]);

      setCustomers(
        customersResponse.data.data || []
      );

      setProducts(
        productsResponse.data.data || []
      );

      setWarehouses(
        warehousesResponse.data.data || []
      );

      setChallans(
        challansResponse.data.data || []
      );


      // =================================================
      // STOCK MOVEMENTS
      // Only ADMIN and WAREHOUSE can access this API
      // =================================================

      if (
        role === "ADMIN" ||
        role === "WAREHOUSE"
      ) {
        try {
          const stockResponse =
            await api.get("/stock-movements");

          setStockMovements(
            stockResponse.data.data || []
          );
        } catch (error) {
          console.error(
            "Stock data loading error:",
            error
          );

          setStockMovements([]);
        }
      } else {
        setStockMovements([]);
      }

    } catch (error) {
      console.error(
        "Dashboard data loading error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };


  // ====================================================
  // CALCULATIONS
  // ====================================================

  const activeCustomers = customers.filter(
    (customer) =>
      customer.status === "ACTIVE"
  ).length;


  const lowStockProducts = products.filter(
    (product) =>
      Number(product.currentStock) <=
      Number(product.minimumStock)
  ).length;


  const confirmedChallans = challans.filter(
    (challan) =>
      challan.status === "CONFIRMED"
  ).length;


  const totalChallanValue =
    challans.reduce(
      (total, challan) =>
        total +
        Number(challan.totalAmount || 0),
      0
    );


  // ====================================================
  // LOGOUT
  // ====================================================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";
  };


  return (
    <div className="app-layout">

      {/* SIDEBAR */}

      <Sidebar
        user={user}
        logout={logout}
      />


      {/* MAIN CONTENT */}

      <main className="main-content">

        {/* HEADER */}

        <header className="topbar">

          <div>

            <h1>
              Dashboard
            </h1>

            <p>
              Welcome back! Here's what's happening
              with your business.
            </p>

          </div>


          <div className="profile">

            <div className="profile-avatar">
              {user?.name?.charAt(0) || "A"}
            </div>

            <div>

              <strong>
                {user?.name || "Administrator"}
              </strong>

              <span>
                {user?.role || "ADMIN"}
              </span>

            </div>

          </div>

        </header>


        {/* WELCOME BANNER */}

        <section className="welcome-banner">

          <div>

            <p className="banner-label">
              MINI ERP CRM
            </p>

            <h2>
              Manage your business smarter.
            </h2>

            <p>
              Track customers, products, inventory
              and challans from one place.
            </p>

          </div>


          <div className="banner-icon">
            📊
          </div>

        </section>


        {/* FIRST STATISTICS */}

        <section className="stats-grid">

          <StatCard
            title="Customers"
            value={
              loading
                ? "..."
                : customers.length.toString()
            }
            description={`${activeCustomers} active customers`}
            icon="👥"
            className="purple"
          />


          <StatCard
            title="Products"
            value={
              loading
                ? "..."
                : products.length.toString()
            }
            description={`${lowStockProducts} low stock`}
            icon="📦"
            className="blue"
          />


          <StatCard
            title="Warehouses"
            value={
              loading
                ? "..."
                : warehouses.length.toString()
            }
            description="Storage locations"
            icon="🏭"
            className="orange"
          />


          <StatCard
            title="Stock Movements"
            value={
              loading
                ? "..."
                : stockMovements.length.toString()
            }
            description={
              user?.role === "SALES" ||
              user?.role === "ACCOUNTS"
                ? "Restricted access"
                : "Recorded movements"
            }
            icon="📈"
            className="green"
          />

        </section>


        {/* SECOND STATISTICS */}

        <section className="stats-grid">

          <StatCard
            title="Low Stock"
            value={
              loading
                ? "..."
                : lowStockProducts.toString()
            }
            description="Products requiring attention"
            icon="⚠️"
            className="orange"
          />


          <StatCard
            title="Challans"
            value={
              loading
                ? "..."
                : challans.length.toString()
            }
            description={`${confirmedChallans} confirmed`}
            icon="📋"
            className="purple"
          />


          <StatCard
            title="Challan Value"
            value={
              loading
                ? "..."
                : `₹${totalChallanValue.toLocaleString(
                    "en-IN"
                  )}`
            }
            description="Total challan value"
            icon="₹"
            className="green"
          />


          <StatCard
            title="Active Customers"
            value={
              loading
                ? "..."
                : activeCustomers.toString()
            }
            description="Currently active"
            icon="✓"
            className="blue"
          />

        </section>


        {/* MAIN DASHBOARD PANELS */}

        <section className="dashboard-grid">

          {/* QUICK ACTIONS */}

          <div className="panel">

            <div className="panel-header">

              <div>

                <h3>
                  Quick Actions
                </h3>

                <p>
                  Frequently used operations
                </p>

              </div>

            </div>


            <div className="quick-actions">

              {/* CUSTOMERS */}

              <Link
                to="/customers"
                className="action-card"
              >

                <div className="action-icon purple-bg">
                  👥
                </div>

                <div>

                  <strong>
                    Customers
                  </strong>

                  <span>
                    Manage customers
                  </span>

                </div>

                <b>
                  →
                </b>

              </Link>


              {/* PRODUCTS */}

              <Link
                to="/products"
                className="action-card"
              >

                <div className="action-icon blue-bg">
                  📦
                </div>

                <div>

                  <strong>
                    Products
                  </strong>

                  <span>
                    Manage products
                  </span>

                </div>

                <b>
                  →
                </b>

              </Link>


              {/* STOCK */}

              {(user?.role === "ADMIN" ||
                user?.role === "WAREHOUSE") && (

                <Link
                  to="/stock"
                  className="action-card"
                >

                  <div className="action-icon green-bg">
                    📊
                  </div>

                  <div>

                    <strong>
                      Stock
                    </strong>

                    <span>
                      View inventory
                    </span>

                  </div>

                  <b>
                    →
                  </b>

                </Link>

              )}


              {/* CHALLANS */}

              <Link
                to="/challans"
                className="action-card"
              >

                <div className="action-icon orange-bg">
                  📋
                </div>

                <div>

                  <strong>
                    Challans
                  </strong>

                  <span>
                    Manage challans
                  </span>

                </div>

                <b>
                  →
                </b>

              </Link>

            </div>

          </div>


          {/* SYSTEM STATUS */}

          <div className="panel">

            <div className="panel-header">

              <div>

                <h3>
                  System Status
                </h3>

                <p>
                  Application health
                </p>

              </div>


              <span className="status-badge">

                <span className="status-dot">
                </span>

                Online

              </span>

            </div>


            <div className="status-list">

              <StatusItem
                name="Backend API"
                status="Connected"
              />

              <StatusItem
                name="Database"
                status="Connected"
              />

              <StatusItem
                name="Authentication"
                status="Active"
              />

              <StatusItem
                name="Inventory System"
                status="Ready"
              />

            </div>

          </div>

        </section>


        {/* INVENTORY OVERVIEW */}

        <section
          className="panel"
          style={{ marginTop: "20px" }}
        >

          <div className="panel-header">

            <div>

              <h3>
                Inventory Overview
              </h3>

              <p>
                Products requiring attention
              </p>

            </div>


            {(user?.role === "ADMIN" ||
              user?.role === "WAREHOUSE") && (

              <Link
                to="/stock"
                className="view-button"
              >
                View Stock
              </Link>

            )}

          </div>


          {lowStockProducts === 0 ? (

            <div
              style={{
                padding: "25px",
                textAlign: "center",
                color: "#2da76b",
              }}
            >
              ✓ All products have sufficient stock
            </div>

          ) : (

            <div className="status-list">

              {products
                .filter(
                  (product) =>
                    Number(
                      product.currentStock
                    ) <=
                    Number(
                      product.minimumStock
                    )
                )
                .slice(0, 5)
                .map((product) => (

                  <div
                    className="status-item"
                    key={product.id}
                  >

                    <div>

                      <span
                        className="status-check"
                        style={{
                          background:
                            "#fff0f0",
                          color:
                            "#e55353",
                        }}
                      >
                        !
                      </span>

                      <strong>
                        {product.name}
                      </strong>

                    </div>


                    <span
                      style={{
                        color: "#e55353",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      {product.currentStock} /{" "}
                      {product.minimumStock}
                    </span>

                  </div>

                ))}

            </div>

          )}

        </section>


        {/* RECENT CUSTOMERS */}

        <section
          className="panel"
          style={{ marginTop: "20px" }}
        >

          <div className="panel-header">

            <div>

              <h3>
                Recent Customers
              </h3>

              <p>
                Latest customers added
              </p>

            </div>


            <Link
              to="/customers"
              className="view-button"
            >
              View All
            </Link>

          </div>


          {customers.length === 0 ? (

            <div className="empty-state">

              <div>
                👥
              </div>

              <h3>
                No customers
              </h3>

            </div>

          ) : (

            <div className="status-list">

              {customers
                .slice(0, 5)
                .map((customer) => (

                  <div
                    className="status-item"
                    key={customer.id}
                  >

                    <div>

                      <span className="status-check">

                        {customer.customerName
                          ?.charAt(0)
                          ?.toUpperCase()}

                      </span>

                      <strong>
                        {customer.customerName}
                      </strong>

                    </div>


                    <span className="connected">
                      {customer.status}
                    </span>

                  </div>

                ))}

            </div>

          )}

        </section>


        {/* FOOTER */}

        <footer className="footer">

          <span>
            © 2026 Mini ERP CRM
          </span>

          <span>
            Enterprise Resource Management System
          </span>

        </footer>

      </main>

    </div>
  );
}


// ======================================================
// SIDEBAR
// ======================================================

function Sidebar({
  user,
  logout,
}: {
  user: any;
  logout: () => void;
}) {

  const location = useLocation();


  const isActive = (path: string) => {

    return location.pathname === path
      ? "nav-item active"
      : "nav-item";

  };


  return (
    <aside className="sidebar">

      {/* BRAND */}

      <div className="brand">

        <div className="brand-icon">
          M
        </div>

        <div>

          <h2>
            Mini ERP
          </h2>

          <span>
            CRM System
          </span>

        </div>

      </div>


      {/* MAIN MENU */}

      <div className="sidebar-section">

        <span className="section-title">
          MAIN MENU
        </span>


        {/* DASHBOARD */}

        <Link
          to="/dashboard"
          className={isActive("/dashboard")}
        >

          <span className="nav-icon">
            ⌂
          </span>

          Dashboard

        </Link>


        {/* CUSTOMERS */}

        <Link
          to="/customers"
          className={isActive("/customers")}
        >

          <span className="nav-icon">
            ♙
          </span>

          Customers

        </Link>


        {/* PRODUCTS */}

        <Link
          to="/products"
          className={isActive("/products")}
        >

          <span className="nav-icon">
            ▣
          </span>

          Products

        </Link>


        {/* STOCK */}

        {(user?.role === "ADMIN" ||
          user?.role === "WAREHOUSE") && (

          <Link
            to="/stock"
            className={isActive("/stock")}
          >

            <span className="nav-icon">
              ↗
            </span>

            Stock

          </Link>

        )}


        {/* CHALLANS */}

        <Link
          to="/challans"
          className={isActive("/challans")}
        >

          <span className="nav-icon">
            ▤
          </span>

          Challans

        </Link>

      </div>


      {/* MANAGEMENT */}

      <div className="sidebar-section">

        <span className="section-title">
          MANAGEMENT
        </span>


        {/* CATEGORIES */}

        <Link
          to="/categories"
          className={isActive("/categories")}
        >

          <span className="nav-icon">
            ◈
          </span>

          Categories

        </Link>


        {/* WAREHOUSES */}

        <Link
          to="/warehouses"
          className={isActive("/warehouses")}
        >

          <span className="nav-icon">
            ⌂
          </span>

          Warehouses

        </Link>

      </div>


      {/* USER */}

      <div className="sidebar-bottom">

        <div className="user-card">

          <div className="user-avatar">

            {user?.name?.charAt(0) || "A"}

          </div>


          <div className="user-info">

            <strong>
              {user?.name || "Administrator"}
            </strong>

            <span>
              {user?.role || "ADMIN"}
            </span>

          </div>

        </div>


        {/* LOGOUT */}

        <button
          className="logout-button"
          onClick={logout}
        >

          <span>
            ↪
          </span>

          Logout

        </button>

      </div>

    </aside>
  );
}


// ======================================================
// STAT CARD
// ======================================================

function StatCard({
  title,
  value,
  description,
  icon,
  className,
}: {
  title: string;
  value: string;
  description: string;
  icon: string;
  className: string;
}) {

  return (
    <div className="stat-card">

      <div
        className={`stat-icon ${className}`}
      >
        {icon}
      </div>


      <div className="stat-content">

        <span>
          {title}
        </span>

        <strong>
          {value}
        </strong>

        <small>
          {description}
        </small>

      </div>


      <div
        className={`stat-line ${className}`}
      >
      </div>

    </div>
  );
}


// ======================================================
// STATUS ITEM
// ======================================================

function StatusItem({
  name,
  status,
}: {
  name: string;
  status: string;
}) {

  return (
    <div className="status-item">

      <div>

        <span className="status-check">
          ✓
        </span>

        <strong>
          {name}
        </strong>

      </div>


      <span className="connected">
        {status}
      </span>

    </div>
  );
}


// ======================================================
// PROTECTED ROUTE
// ======================================================

function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {

  const token =
    localStorage.getItem("token");


  if (!token) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );

  }


  return children;
}


// ======================================================
// APP
// ======================================================

function App() {

  return (
    <>

      {/* GLOBAL BACK BUTTON */}

      <BackButton />


      <Routes>

        {/* ROOT */}

        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />


        {/* LOGIN */}

        <Route
          path="/login"
          element={
            <Login />
          }
        />


        {/* DASHBOARD */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />


        {/* CUSTOMERS */}

        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <Customers />
            </ProtectedRoute>
          }
        />


        {/* PRODUCTS */}

        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          }
        />


        {/* STOCK */}

        <Route
          path="/stock"
          element={
            <ProtectedRoute>
              <Stock />
            </ProtectedRoute>
          }
        />


        {/* CHALLANS */}

        <Route
          path="/challans"
          element={
            <ProtectedRoute>
              <Challans />
            </ProtectedRoute>
          }
        />


        {/* CATEGORIES */}

        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <Categories />
            </ProtectedRoute>
          }
        />


        {/* WAREHOUSES */}

        <Route
          path="/warehouses"
          element={
            <ProtectedRoute>
              <Warehouses />
            </ProtectedRoute>
          }
        />

      </Routes>

    </>
  );
}


export default App;