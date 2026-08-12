import { useEffect, useState } from "react";
import api from "../services/api";

interface Category {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);

      const response = await api.get("/categories");

      setCategories(response.data.data || []);
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(
    (category) =>
      category.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      category.description
        ?.toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="app-layout">
      <CategorySidebar />

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>Categories</h1>
            <p>
              View and manage your product categories.
            </p>
          </div>
        </header>

        <section className="stats-grid">
          <StatCard
            title="Total Categories"
            value={categories.length.toString()}
            description="Product categories"
            icon="◈"
            className="purple"
          />

          <StatCard
            title="Showing"
            value={filteredCategories.length.toString()}
            description="Matching categories"
            icon="✓"
            className="green"
          />
        </section>

        <section className="panel products-panel">
          <div className="panel-header">
            <div>
              <h3>Category List</h3>
              <p>
                {filteredCategories.length} categories
              </p>
            </div>

            <input
              className="search-input"
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          {loading ? (
            <div className="loading">
              Loading categories...
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="empty-state">
              <div>◈</div>
              <h3>No categories found</h3>
              <p>
                No categories match your search.
              </p>
            </div>
          ) : (
            <div className="category-grid">
              {filteredCategories.map(
                (category, index) => (
                  <div
                    className="category-card"
                    key={category.id}
                  >
                    <div className="category-icon">
                      {["📦", "🖥️", "🪑", "📄", "🖨️"][
                        index % 5
                      ]}
                    </div>

                    <div className="category-info">
                      <h3>{category.name}</h3>

                      <p>
                        {category.description ||
                          "Product category"}
                      </p>

                      {category.createdAt && (
                        <small>
                          Created{" "}
                          {new Date(
                            category.createdAt
                          ).toLocaleDateString(
                            "en-IN"
                          )}
                        </small>
                      )}
                    </div>
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

function CategorySidebar() {
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

        <a
          href="/dashboard"
          className="nav-item"
        >
          <span className="nav-icon">⌂</span>
          Dashboard
        </a>

        <a
          href="/customers"
          className="nav-item"
        >
          <span className="nav-icon">♙</span>
          Customers
        </a>

        <a
          href="/products"
          className="nav-item"
        >
          <span className="nav-icon">▣</span>
          Products
        </a>

        <a
          href="/stock"
          className="nav-item"
        >
          <span className="nav-icon">↗</span>
          Stock
        </a>

        <a
          href="/challans"
          className="nav-item"
        >
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
          className="nav-item active"
        >
          <span className="nav-icon">◈</span>
          Categories
        </a>

        <a
          href="/warehouses"
          className="nav-item"
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

/* Statistics */

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
        <span>{title}</span>
        <strong>{value}</strong>
        <small>{description}</small>
      </div>

      <div
        className={`stat-line ${className}`}
      />
    </div>
  );
}