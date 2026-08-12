import { useEffect, useState } from "react";
import api from "../services/api";

interface Customer {
  id: string;
  customerName: string;
  businessName: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  unitPrice: number;
  currentStock: number;
}

interface ChallanItem {
  productId: string;
  productNameSnapshot: string;
  skuSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  lineTotal: number;
}

interface Challan {
  id: string;
  challanNumber: string;
  customerId: string;
  totalQuantity: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  confirmedAt?: string | null;
  customer?: Customer;
  items?: ChallanItem[];
}

interface FormItem {
  productId: string;
  quantity: string;
}

export default function Challans() {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedChallan, setSelectedChallan] =
    useState<Challan | null>(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    challanNumber: "",
    customerId: "",
  });

  const [items, setItems] = useState<FormItem[]>([
    {
      productId: "",
      quantity: "",
    },
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        challansResponse,
        customersResponse,
        productsResponse,
      ] = await Promise.all([
        api.get("/challans"),
        api.get("/customers"),
        api.get("/products"),
      ]);

      setChallans(challansResponse.data.data || []);
      setCustomers(customersResponse.data.data || []);
      setProducts(productsResponse.data.data || []);
    } catch (error) {
      console.error("Failed to load challan data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleItemChange = (
    index: number,
    field: keyof FormItem,
    value: string
  ) => {
    const updatedItems = [...items];

    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        productId: "",
        quantity: "",
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) {
      return;
    }

    setItems(items.filter((_, i) => i !== index));
  };

  const getProduct = (productId: string) => {
    return products.find(
      (product) => product.id === productId
    );
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const product = getProduct(item.productId);
      const quantity = Number(item.quantity);

      if (!product || quantity <= 0) {
        return total;
      }

      return (
        total +
        Number(product.unitPrice) * quantity
      );
    }, 0);
  };

  const calculateQuantity = () => {
    return items.reduce((total, item) => {
      const quantity = Number(item.quantity);

      return total + (quantity > 0 ? quantity : 0);
    }, 0);
  };

  const handleCreate = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      const user = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      if (!user?.id) {
        alert(
          "User information not found. Please login again."
        );
        return;
      }

      if (!form.customerId) {
        alert("Please select a customer.");
        return;
      }

      const validItems = items.filter(
        (item) =>
          item.productId &&
          Number(item.quantity) > 0
      );

      if (validItems.length === 0) {
        alert("Please add at least one product.");
        return;
      }

      for (const item of validItems) {
        const product = getProduct(item.productId);

        if (!product) {
          alert("Invalid product selected.");
          return;
        }

        if (
          Number(item.quantity) >
          product.currentStock
        ) {
          alert(
            `${product.name} has only ${product.currentStock} units available.`
          );
          return;
        }
      }

      await api.post("/challans", {
        challanNumber:
          form.challanNumber || undefined,
        customerId: form.customerId,
        createdById: user.id,
        items: validItems.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
        })),
      });

      alert("Challan created successfully!");

      resetForm();
      setShowForm(false);
      loadData();
    } catch (error: any) {
      console.error(
        "Create challan error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to create challan"
      );
    }
  };

  const resetForm = () => {
    setForm({
      challanNumber: "",
      customerId: "",
    });

    setItems([
      {
        productId: "",
        quantity: "",
      },
    ]);
  };

  const confirmChallan = async (
    challan: Challan
  ) => {
    if (challan.status !== "DRAFT") {
      return;
    }

    const confirmed = window.confirm(
      `Confirm challan ${challan.challanNumber}?\n\nStock will be reduced after confirmation.`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.post(
        `/challans/${challan.id}/confirm`
      );

      alert("Challan confirmed successfully!");

      setSelectedChallan(null);
      loadData();
    } catch (error: any) {
      console.error(
        "Confirm challan error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to confirm challan"
      );
    }
  };

  const filteredChallans = challans.filter(
    (challan) => {
      const value = search.toLowerCase();

      return (
        challan.challanNumber
          .toLowerCase()
          .includes(value) ||
        challan.customer?.customerName
          ?.toLowerCase()
          .includes(value) ||
        challan.customer?.businessName
          ?.toLowerCase()
          .includes(value) ||
        challan.status
          .toLowerCase()
          .includes(value)
      );
    }
  );

  const draftCount = challans.filter(
    (challan) => challan.status === "DRAFT"
  ).length;

  const confirmedCount = challans.filter(
    (challan) => challan.status === "CONFIRMED"
  ).length;

  const totalValue = challans.reduce(
    (total, challan) =>
      total + Number(challan.totalAmount),
    0
  );

  return (
    <div className="app-layout">
      <ChallanSidebar />

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>Challans</h1>
            <p>
              Create and manage delivery challans.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={() => setShowForm(true)}
          >
            + Create Challan
          </button>
        </header>

        {/* Statistics */}

        <section className="stats-grid">
          <StatCard
            title="Total Challans"
            value={challans.length.toString()}
            description="All challans"
            icon="📋"
            className="purple"
          />

          <StatCard
            title="Draft"
            value={draftCount.toString()}
            description="Pending confirmation"
            icon="📝"
            className="orange"
          />

          <StatCard
            title="Confirmed"
            value={confirmedCount.toString()}
            description="Completed challans"
            icon="✓"
            className="green"
          />

          <StatCard
            title="Total Value"
            value={`₹${totalValue.toLocaleString(
              "en-IN"
            )}`}
            description="Challan value"
            icon="₹"
            className="blue"
          />
        </section>

        {/* Challan List */}

        <section className="panel products-panel">
          <div className="panel-header">
            <div>
              <h3>Challan List</h3>
              <p>
                {filteredChallans.length} challans
              </p>
            </div>

            <input
              className="search-input"
              type="text"
              placeholder="Search challans..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          {loading ? (
            <div className="loading">
              Loading challans...
            </div>
          ) : filteredChallans.length === 0 ? (
            <div className="empty-state">
              <div>📋</div>
              <h3>No challans found</h3>
              <p>
                Create your first delivery challan.
              </p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>CHALLAN</th>
                    <th>CUSTOMER</th>
                    <th>ITEMS</th>
                    <th>QUANTITY</th>
                    <th>AMOUNT</th>
                    <th>STATUS</th>
                    <th>DATE</th>
                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredChallans.map(
                    (challan) => (
                      <tr key={challan.id}>
                        <td>
                          <strong>
                            {challan.challanNumber}
                          </strong>
                        </td>

                        <td>
                          <strong>
                            {challan.customer
                              ?.customerName ||
                              "Unknown"}
                          </strong>

                          <br />

                          <small>
                            {challan.customer
                              ?.businessName || ""}
                          </small>
                        </td>

                        <td>
                          {challan.items?.length || 0}
                        </td>

                        <td>
                          {challan.totalQuantity}
                        </td>

                        <td>
                          ₹
                          {Number(
                            challan.totalAmount
                          ).toLocaleString("en-IN")}
                        </td>

                        <td>
                          <span
                            className={
                              challan.status ===
                              "CONFIRMED"
                                ? "status-badge active"
                                : "status-badge inactive"
                            }
                          >
                            {challan.status}
                          </span>
                        </td>

                        <td>
                          {new Date(
                            challan.createdAt
                          ).toLocaleDateString(
                            "en-IN"
                          )}
                        </td>

                        <td>
                          <button
                            className="view-button"
                            onClick={() =>
                              setSelectedChallan(
                                challan
                              )
                            }
                          >
                            View
                          </button>

                          {challan.status ===
                            "DRAFT" && (
                            <button
                              className="confirm-button"
                              onClick={() =>
                                confirmChallan(
                                  challan
                                )
                              }
                            >
                              Confirm
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Create Challan Modal */}

        {showForm && (
          <div
            className="modal-overlay"
            onClick={() => setShowForm(false)}
          >
            <div
              className="modal challan-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <div className="modal-header">
                <div>
                  <h2>Create Challan</h2>
                  <p>
                    Add customer and products.
                  </p>
                </div>

                <button
                  className="close-button"
                  onClick={() =>
                    setShowForm(false)
                  }
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreate}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>
                      Challan Number
                    </label>

                    <input
                      name="challanNumber"
                      value={
                        form.challanNumber
                      }
                      onChange={handleFormChange}
                      placeholder="Auto-generated if empty"
                    />
                  </div>

                  <div className="form-group">
                    <label>Customer *</label>

                    <select
                      name="customerId"
                      value={form.customerId}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">
                        Select customer
                      </option>

                      {customers.map(
                        (customer) => (
                          <option
                            key={customer.id}
                            value={customer.id}
                          >
                            {customer.customerName}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                <div className="challan-items-section">
                  <div className="items-heading">
                    <div>
                      <h3>Products</h3>
                      <p>
                        Select products and quantities.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="secondary-button"
                      onClick={addItem}
                    >
                      + Add Item
                    </button>
                  </div>

                  {items.map(
                    (item, index) => {
                      const product = getProduct(
                        item.productId
                      );

                      return (
                        <div
                          className="challan-item-row"
                          key={index}
                        >
                          <div className="form-group">
                            <label>
                              Product
                            </label>

                            <select
                              value={
                                item.productId
                              }
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "productId",
                                  e.target.value
                                )
                              }
                              required
                            >
                              <option value="">
                                Select product
                              </option>

                              {products.map(
                                (product) => (
                                  <option
                                    key={
                                      product.id
                                    }
                                    value={
                                      product.id
                                    }
                                  >
                                    {product.name} -
                                    {product.sku}
                                  </option>
                                )
                              )}
                            </select>
                          </div>

                          <div className="form-group quantity-field">
                            <label>
                              Quantity
                            </label>

                            <input
                              type="number"
                              min="1"
                              max={
                                product?.currentStock ||
                                undefined
                              }
                              value={
                                item.quantity
                              }
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "quantity",
                                  e.target.value
                                )
                              }
                              required
                            />
                          </div>

                          <div className="item-total">
                            <span>
                              Amount
                            </span>

                            <strong>
                              ₹
                              {product &&
                              Number(
                                item.quantity
                              ) > 0
                                ? (
                                    Number(
                                      product.unitPrice
                                    ) *
                                    Number(
                                      item.quantity
                                    )
                                  ).toLocaleString(
                                    "en-IN"
                                  )
                                : "0"}
                            </strong>
                          </div>

                          <button
                            type="button"
                            className="remove-item"
                            onClick={() =>
                              removeItem(index)
                            }
                          >
                            ×
                          </button>
                        </div>
                      );
                    }
                  )}
                </div>

                <div className="challan-summary">
                  <div>
                    <span>
                      Total Quantity
                    </span>

                    <strong>
                      {calculateQuantity()}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Total Amount
                    </span>

                    <strong>
                      ₹
                      {calculateTotal().toLocaleString(
                        "en-IN"
                      )}
                    </strong>
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
                    Create Challan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Challan Modal */}

        {selectedChallan && (
          <div
            className="modal-overlay"
            onClick={() =>
              setSelectedChallan(null)
            }
          >
            <div
              className="modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <div className="modal-header">
                <div>
                  <h2>
                    {
                      selectedChallan.challanNumber
                    }
                  </h2>

                  <p>
                    Challan details
                  </p>
                </div>

                <button
                  className="close-button"
                  onClick={() =>
                    setSelectedChallan(null)
                  }
                >
                  ×
                </button>
              </div>

              <div className="challan-details">
                <div className="detail-box">
                  <span>Customer</span>

                  <strong>
                    {
                      selectedChallan.customer
                        ?.customerName
                    }
                  </strong>
                </div>

                <div className="detail-box">
                  <span>Status</span>

                  <strong>
                    {
                      selectedChallan.status
                    }
                  </strong>
                </div>

                <div className="detail-box">
                  <span>Total Quantity</span>

                  <strong>
                    {
                      selectedChallan.totalQuantity
                    }
                  </strong>
                </div>

                <div className="detail-box">
                  <span>Total Amount</span>

                  <strong>
                    ₹
                    {Number(
                      selectedChallan.totalAmount
                    ).toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>

              <h3>Items</h3>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>PRODUCT</th>
                      <th>SKU</th>
                      <th>PRICE</th>
                      <th>QTY</th>
                      <th>TOTAL</th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedChallan.items?.map(
                      (item, index) => (
                        <tr key={index}>
                          <td>
                            {
                              item.productNameSnapshot
                            }
                          </td>

                          <td>
                            {item.skuSnapshot}
                          </td>

                          <td>
                            ₹
                            {Number(
                              item.unitPriceSnapshot
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </td>

                          <td>
                            {item.quantity}
                          </td>

                          <td>
                            ₹
                            {Number(
                              item.lineTotal
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {selectedChallan.status ===
                "DRAFT" && (
                <div className="modal-actions">
                  <button
                    className="primary-button"
                    onClick={() =>
                      confirmChallan(
                        selectedChallan
                      )
                    }
                  >
                    ✓ Confirm Challan
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* Sidebar */

function ChallanSidebar() {
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

        <a href="/stock" className="nav-item">
          <span className="nav-icon">↗</span>
          Stock
        </a>

        <a
          href="/challans"
          className="nav-item active"
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