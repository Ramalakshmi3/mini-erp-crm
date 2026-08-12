import { useEffect, useState } from "react";
import api from "../services/api";

interface Product {
  id: string;
  name: string;
  sku: string;
  warehouseId: string;
  currentStock: number;
  minimumStock: number;
}

interface Warehouse {
  id: string;
  name: string;
}

interface StockMovement {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  type: "IN" | "OUT";
  reason: string;
  createdAt: string;
  product?: {
    name: string;
    sku: string;
  };
  warehouse?: {
    name: string;
  };
}

export default function Stock() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    productId: "",
    warehouseId: "",
    quantity: "",
    type: "IN",
    reason: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [movementRes, productRes, warehouseRes] =
        await Promise.all([
          api.get("/stock-movements"),
          api.get("/products"),
          api.get("/warehouses"),
        ]);

      setMovements(movementRes.data.data || []);
      setProducts(productRes.data.data || []);
      setWarehouses(warehouseRes.data.data || []);
    } catch (error) {
      console.error("Failed to load stock data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleProductChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const productId = e.target.value;

    const product = products.find(
      (p) => p.id === productId
    );

    setForm({
      ...form,
      productId,
      warehouseId: product?.warehouseId || "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const user = JSON.parse(
      localStorage.getItem("user") || "null"
    );

    if (!user?.id) {
      alert("User information not found. Please login again.");
      return;
    }

    await api.post("/stock-movements", {
      productId: form.productId,
      warehouseId: form.warehouseId,
      quantity: Number(form.quantity),
      type: form.type,
      reason: form.reason,
      createdById: user.id,
    });

    // Reset form
    setForm({
      productId: "",
      warehouseId: "",
      quantity: "",
      type: "IN",
      reason: "",
    });

    // Close modal
    setShowForm(false);

    // Reload latest stock data
    await loadData();

  } catch (error: any) {
    console.error("Stock movement error:", error);

    alert(
      error.response?.data?.message ||
        "Failed to create stock movement"
    );
  }
};

  const filteredMovements = movements.filter((movement) => {
    const searchValue = search.toLowerCase();

    return (
      movement.product?.name
        ?.toLowerCase()
        .includes(searchValue) ||
      movement.product?.sku
        ?.toLowerCase()
        .includes(searchValue) ||
      movement.reason
        ?.toLowerCase()
        .includes(searchValue) ||
      movement.type
        ?.toLowerCase()
        .includes(searchValue)
    );
  });

  const stockIn = movements.filter(
    (movement) => movement.type === "IN"
  ).length;

  const stockOut = movements.filter(
    (movement) => movement.type === "OUT"
  ).length;

  const lowStock = products.filter(
    (product) =>
      product.currentStock <= product.minimumStock
  ).length;

  return (
    <div className="app-layout">
      <StockSidebar />

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>Stock Management</h1>
            <p>
              Track inventory movements and stock levels.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={() => setShowForm(true)}
          >
            + Stock Movement
          </button>
        </header>

        {/* Statistics */}

        <section className="stats-grid">
          <StatCard
            title="Products"
            value={products.length.toString()}
            description="Total products"
            icon="📦"
            className="purple"
          />

          <StatCard
            title="Stock IN"
            value={stockIn.toString()}
            description="Inbound movements"
            icon="↓"
            className="green"
          />

          <StatCard
            title="Stock OUT"
            value={stockOut.toString()}
            description="Outbound movements"
            icon="↑"
            className="blue"
          />

          <StatCard
            title="Low Stock"
            value={lowStock.toString()}
            description="Needs attention"
            icon="⚠"
            className="orange"
          />
        </section>

        {/* Movement List */}

        <section className="panel products-panel">
          <div className="panel-header">
            <div>
              <h3>Stock Movement History</h3>
              <p>
                {filteredMovements.length} movements
              </p>
            </div>

            <input
              className="search-input"
              type="text"
              placeholder="Search stock movements..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          {loading ? (
            <div className="loading">
              Loading stock movements...
            </div>
          ) : filteredMovements.length === 0 ? (
            <div className="empty-state">
              <div>📊</div>
              <h3>No stock movements found</h3>
              <p>
                Add your first stock movement to get
                started.
              </p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>PRODUCT</th>
                    <th>SKU</th>
                    <th>WAREHOUSE</th>
                    <th>TYPE</th>
                    <th>QUANTITY</th>
                    <th>REASON</th>
                    <th>DATE</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredMovements.map((movement) => (
                    <tr key={movement.id}>
                      <td>
                        <strong>
                          {movement.product?.name ||
                            "Unknown Product"}
                        </strong>
                      </td>

                      <td>
                        {movement.product?.sku || "—"}
                      </td>

                      <td>
                        {movement.warehouse?.name || "—"}
                      </td>

                      <td>
                        <span
                          className={
                            movement.type === "IN"
                              ? "movement-in"
                              : "movement-out"
                          }
                        >
                          {movement.type === "IN"
                            ? "↓ IN"
                            : "↑ OUT"}
                        </span>
                      </td>

                      <td>
                        <strong>
                          {movement.quantity}
                        </strong>
                      </td>

                      <td>{movement.reason}</td>

                      <td>
                        {new Date(
                          movement.createdAt
                        ).toLocaleDateString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Add Stock Movement Modal */}

        {showForm && (
          <div
            className="modal-overlay"
            onClick={() => setShowForm(false)}
          >
            <div
              className="modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <div className="modal-header">
                <div>
                  <h2>Add Stock Movement</h2>
                  <p>
                    Add or remove inventory stock.
                  </p>
                </div>

                <button
                  className="close-button"
                  onClick={() => setShowForm(false)}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Product *</label>

                    <select
                      name="productId"
                      value={form.productId}
                      onChange={handleProductChange}
                      required
                    >
                      <option value="">
                        Select product
                      </option>

                      {products.map((product) => (
                        <option
                          key={product.id}
                          value={product.id}
                        >
                          {product.name} ({product.sku})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Warehouse *</label>

                    <select
                      name="warehouseId"
                      value={form.warehouseId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">
                        Select warehouse
                      </option>

                      {warehouses.map(
                        (warehouse) => (
                          <option
                            key={warehouse.id}
                            value={warehouse.id}
                          >
                            {warehouse.name}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Movement Type *</label>

                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      required
                    >
                      <option value="IN">
                        Stock IN
                      </option>

                      <option value="OUT">
                        Stock OUT
                      </option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Quantity *</label>

                    <input
                      name="quantity"
                      type="number"
                      min="1"
                      value={form.quantity}
                      onChange={handleChange}
                      placeholder="Enter quantity"
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Reason *</label>

                    <input
                      name="reason"
                      value={form.reason}
                      onChange={handleChange}
                      placeholder="Example: New purchase, damaged goods..."
                      required
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      setShowForm(false)
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="primary-button"
                  >
                    Create Movement
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* Sidebar */

function StockSidebar() {
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

        <a
          href="/stock"
          className="nav-item active"
        >
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