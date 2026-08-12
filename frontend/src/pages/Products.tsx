import { useEffect, useState } from "react";
import api from "../services/api";

interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  warehouseId: string;
  unitPrice: number;
  currentStock: number;
  minimumStock: number;
  imageUrl?: string | null;
}

interface Category {
  id: string;
  name: string;
}

interface Warehouse {
  id: string;
  name: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    sku: "",
    categoryId: "",
    warehouseId: "",
    unitPrice: "",
    currentStock: "0",
    minimumStock: "0",
    imageUrl: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [productsRes, categoriesRes, warehousesRes] =
        await Promise.all([
          api.get("/products"),
          api.get("/categories"),
          api.get("/warehouses"),
        ]);

      setProducts(productsRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
      setWarehouses(warehousesRes.data.data || []);
    } catch (error) {
      console.error("Failed to load products:", error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post("/products", {
        name: form.name,
        sku: form.sku,
        categoryId: form.categoryId,
        warehouseId: form.warehouseId,
        unitPrice: Number(form.unitPrice),
        currentStock: Number(form.currentStock),
        minimumStock: Number(form.minimumStock),
        imageUrl: form.imageUrl || null,
      });

      alert("Product created successfully!");

      setForm({
        name: "",
        sku: "",
        categoryId: "",
        warehouseId: "",
        unitPrice: "",
        currentStock: "0",
        minimumStock: "0",
        imageUrl: "",
      });

      setShowForm(false);
      loadData();
    } catch (error: any) {
      console.error("Create product error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to create product"
      );
    }
  };

  const getCategoryName = (id: string) => {
    return (
      categories.find((category) => category.id === id)?.name ||
      "—"
    );
  };

  const getWarehouseName = (id: string) => {
    return (
      warehouses.find((warehouse) => warehouse.id === id)?.name ||
      "—"
    );
  };

  const filteredProducts = products.filter((product) => {
    const value = search.toLowerCase();

    return (
      product.name.toLowerCase().includes(value) ||
      product.sku.toLowerCase().includes(value)
    );
  });

  const lowStockCount = products.filter(
    (product) => product.currentStock <= product.minimumStock
  ).length;

  return (
    <div className="app-layout">
      <ProductSidebar />

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>Products</h1>
            <p>
              Manage products, pricing and inventory.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={() => setShowForm(true)}
          >
            + Add Product
          </button>
        </header>

        {/* Statistics */}
        <section className="stats-grid">
          <StatCard
            title="Total Products"
            value={products.length.toString()}
            description="Products available"
            icon="📦"
            className="purple"
          />

          <StatCard
            title="In Stock"
            value={products
              .filter((p) => p.currentStock > p.minimumStock)
              .length.toString()}
            description="Healthy stock"
            icon="✓"
            className="green"
          />

          <StatCard
            title="Low Stock"
            value={lowStockCount.toString()}
            description="Needs attention"
            icon="⚠"
            className="orange"
          />

          <StatCard
            title="Categories"
            value={categories.length.toString()}
            description="Product categories"
            icon="◈"
            className="blue"
          />
        </section>

        {/* Product table */}
        <section className="panel products-panel">
          <div className="panel-header">
            <div>
              <h3>Product List</h3>
              <p>
                {filteredProducts.length} products
              </p>
            </div>

            <input
              className="search-input"
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="loading">
              Loading products...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              <div>📦</div>
              <h3>No products found</h3>
              <p>
                Add your first product to get started.
              </p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>PRODUCT</th>
                    <th>SKU</th>
                    <th>CATEGORY</th>
                    <th>WAREHOUSE</th>
                    <th>PRICE</th>
                    <th>STOCK</th>
                    <th>STATUS</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map((product) => {
                    const lowStock =
                      product.currentStock <=
                      product.minimumStock;

                    return (
                      <tr key={product.id}>
                        <td>
                          <div className="product-name">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                              />
                            ) : (
                              <div className="product-avatar">
                                📦
                              </div>
                            )}

                            <strong>{product.name}</strong>
                          </div>
                        </td>

                        <td>{product.sku}</td>

                        <td>
                          <span className="type-badge">
                            {getCategoryName(
                              product.categoryId
                            )}
                          </span>
                        </td>

                        <td>
                          {getWarehouseName(
                            product.warehouseId
                          )}
                        </td>

                        <td>
                          ₹
                          {Number(product.unitPrice).toLocaleString(
                            "en-IN"
                          )}
                        </td>

                        <td>
                          <strong>
                            {product.currentStock}
                          </strong>
                        </td>

                        <td>
                          <span
                            className={
                              lowStock
                                ? "status-badge inactive"
                                : "status-badge active"
                            }
                          >
                            {lowStock
                              ? "LOW STOCK"
                              : "IN STOCK"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Add Product Modal */}
        {showForm && (
          <div
            className="modal-overlay"
            onClick={() => setShowForm(false)}
          >
            <div
              className="modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div>
                  <h2>Add Product</h2>
                  <p>
                    Enter the product details below.
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
                    <label>Product Name *</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter product name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>SKU *</label>
                    <input
                      name="sku"
                      value={form.sku}
                      onChange={handleChange}
                      placeholder="Enter SKU"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      name="categoryId"
                      value={form.categoryId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">
                        Select category
                      </option>

                      {categories.map((category) => (
                        <option
                          key={category.id}
                          value={category.id}
                        >
                          {category.name}
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

                      {warehouses.map((warehouse) => (
                        <option
                          key={warehouse.id}
                          value={warehouse.id}
                        >
                          {warehouse.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Unit Price *</label>
                    <input
                      name="unitPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.unitPrice}
                      onChange={handleChange}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Current Stock</label>
                    <input
                      name="currentStock"
                      type="number"
                      min="0"
                      value={form.currentStock}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Minimum Stock</label>
                    <input
                      name="minimumStock"
                      type="number"
                      min="0"
                      value={form.minimumStock}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Image URL</label>
                    <input
                      name="imageUrl"
                      value={form.imageUrl}
                      onChange={handleChange}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="primary-button"
                  >
                    Create Product
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

function ProductSidebar() {
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

        <a
          href="/products"
          className="nav-item active"
        >
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

        <a href="/categories" className="nav-item">
          <span className="nav-icon">◈</span>
          Categories
        </a>

        <a href="/warehouses" className="nav-item">
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

/* Statistics card */

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

      <div
        className={`stat-line ${className}`}
      />
    </div>
  );
}