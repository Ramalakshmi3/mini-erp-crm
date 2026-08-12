import { useEffect, useState } from "react";
import api from "../services/api";

interface Warehouse {
  id: string;
  name: string;
  address?: string | null;
  createdAt?: string;
}

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWarehouses();
  }, []);

  const loadWarehouses = async () => {
    try {
      setLoading(true);

      const response = await api.get("/warehouses");

      setWarehouses(response.data.data || []);
    } catch (error) {
      console.error("Failed to load warehouses:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredWarehouses = warehouses.filter(
    (warehouse) =>
      warehouse.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      warehouse.address
        ?.toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="app-layout">
      <WarehouseSidebar />

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>Warehouses</h1>
            <p>
              View and manage your storage locations.
            </p>
          </div>
        </header>

        <section className="stats-grid">
          <StatCard
            title="Total Warehouses"
            value={warehouses.length.toString()}
            description="Storage locations"
            icon="⌂"
            className="purple"
          />

          <StatCard
            title="Showing"
            value={filteredWarehouses.length.toString()}
            description="Matching warehouses"
            icon="✓"
            className="green"
          />
        </section>

        <section className="panel products-panel">
          <div className="panel-header">
            <div>
              <h3>Warehouse List</h3>
              <p>
                {filteredWarehouses.length} warehouses
              </p>
            </div>

            <input
              className="search-input"
              type="text"
              placeholder="Search warehouses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="loading">
              Loading warehouses...
            </div>
          ) : filteredWarehouses.length === 0 ? (
            <div className="empty-state">
              <div>⌂</div>
              <h3>No warehouses found</h3>
              <p>
                No warehouses match your search.
              </p>
            </div>
          ) : (
            <div className="warehouse-grid">
              {filteredWarehouses.map(
                (warehouse, index) => (
                  <div
                    className="warehouse-card"
                    key={warehouse.id}
                  >
                    <div className="warehouse-icon">
                      {index % 3 === 0
                        ? "🏢"
                        : index % 3 === 1
                        ? "🏭"
                        : "📦"}
                    </div>

                    <div className="warehouse-info">
                      <h3>{warehouse.name}</h3>

                      <p>
                        {warehouse.address ||
                          "No address provided"}
                      </p>

                      {warehouse.createdAt && (
                        <small>
                          Created{" "}
                          {new Date(
                            warehouse.createdAt
                          ).toLocaleDateString("en-IN")}
                        </small>
                      )}
                    </div>

                    <span className="warehouse-status">
                      ACTIVE
                    </span>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

/* Sidebar */

function WarehouseSidebar() {
  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">M</div>

        <div>
          <h2>Mini ERP</h2>
          <span>CRM System</span>
        </div>
      </div>

      <div className="sidebar-section">
        <span className="section-title">
          MAIN MENU
        </span>

        <a href="/dashboard" className="nav-item">
          <span className="nav-icon">⌂</span>
          Dashboard
        </a>

        <a href="/customers" className="nav-item">
          <span className="nav-icon">♙</span>
          Customers
        </a>

        <a href="/products" className="nav-item">
          <span className="nav-icon">▣</span>
          Products
        </a>

        <a href="/stock" className="nav-item">
          <span className="nav-icon">↗</span>
          Stock
        </a>

        <a href="/challans" className="nav-item">
          <span className="nav-icon">▤</span>
          Challans
        </a>
      </div>

      <div className="sidebar-section">
        <span className="section-title">
          MANAGEMENT
        </span>

        <a
          href="/categories"
          className="nav-item"
        >
          <span className="nav-icon">◈</span>
          Categories
        </a>

        <a
          href="/warehouses"
          className="nav-item active"
        >
          <span className="nav-icon">⌂</span>
          Warehouses
        </a>
      </div>

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

        <button
          className="logout-button"
          onClick={logout}
        >
          <span>↪</span>
          Logout
        </button>
      </div>
    </aside>
  );
}

/* Statistics Card */

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
      <div className={`stat-icon ${className}`}>
        {icon}
      </div>

      <div className="stat-content">
        <span>{title}</span>
        <strong>{value}</strong>
        <small>{description}</small>
      </div>

      <div className={`stat-line ${className}`} />
    </div>
  );
}