import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

function CustomerSidebar() {
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
        <span className="section-title">MAIN MENU</span>

        <a href="/dashboard" className="nav-item">
          <span className="nav-icon">⌂</span>
          Dashboard
        </a>

        <a href="/customers" className="nav-item active">
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
        <span className="section-title">MANAGEMENT</span>

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
              {user?.name || "System Administrator"}
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
          ↪ Logout
        </button>
      </div>
    </aside>
  );
}

interface Customer {
  id: string;
  customerName: string;
  mobile: string;
  email?: string;
  businessName: string;
  gstNumber?: string;
  customerType: string;
  address: string;
  status: string;
  followUpDate?: string | null;
  notes?: string | null;
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    customerName: "",
    mobile: "",
    email: "",
    businessName: "",
    gstNumber: "",
    customerType: "RETAIL",
    address: "",
    status: "LEAD",
    followUpDate: "",
    notes: "",
  });

  const getCustomers = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_URL}/customers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCustomers(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCustomers();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLSelectElement |
      HTMLTextAreaElement
    >
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateCustomer = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${API_URL}/customers`,
        {
          ...form,
          followUpDate:
            form.followUpDate || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Customer created successfully!");

      setShowForm(false);

      setForm({
        customerName: "",
        mobile: "",
        email: "",
        businessName: "",
        gstNumber: "",
        customerType: "RETAIL",
        address: "",
        status: "LEAD",
        followUpDate: "",
        notes: "",
      });

      getCustomers();
    } catch (error: any) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to create customer"
      );
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      `${customer.customerName} ${customer.businessName} ${customer.mobile}`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const getStatusClass = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "status-active";

      case "INACTIVE":
        return "status-inactive";

      case "LEAD":
        return "status-lead";

      default:
        return "";
    }
  };

  /* Loading */

  if (loading) {
    return (
      <div className="app-layout">
        <CustomerSidebar />

        <main className="main-content">
          <div className="page-loading">
            Loading customers...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">

      <CustomerSidebar />

      <main className="main-content">

        <div className="page">

          {/* HEADER */}

          <div className="page-header">

            <div>
              <h1>Customers</h1>

              <p>
                Manage your customers and follow-ups
              </p>
            </div>

            <button
              className="primary-btn"
              onClick={() => setShowForm(true)}
            >
              + Add Customer
            </button>

          </div>


          {/* STATS */}

          <div className="stats-row">

            <div className="stat-card purple">
              <span>Total Customers</span>

              <strong>
                {customers.length}
              </strong>
            </div>


            <div className="stat-card green">
              <span>Active</span>

              <strong>
                {
                  customers.filter(
                    (c) => c.status === "ACTIVE"
                  ).length
                }
              </strong>
            </div>


            <div className="stat-card orange">
              <span>Leads</span>

              <strong>
                {
                  customers.filter(
                    (c) => c.status === "LEAD"
                  ).length
                }
              </strong>
            </div>


            <div className="stat-card red">
              <span>Inactive</span>

              <strong>
                {
                  customers.filter(
                    (c) => c.status === "INACTIVE"
                  ).length
                }
              </strong>
            </div>

          </div>


          {/* CUSTOMER TABLE */}

          <div className="table-container">

            <div className="table-toolbar">

              <input
                type="text"
                placeholder="Search customers..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="search-input"
              />

              <span className="customer-count">
                {filteredCustomers.length} customers
              </span>

            </div>


            <div className="table-wrapper">

              <table>

                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Business</th>
                    <th>Mobile</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Follow-up</th>
                  </tr>
                </thead>


                <tbody>

                  {filteredCustomers.map(
                    (customer) => (

                      <tr key={customer.id}>

                        <td>

                          <div className="customer-name">
                            {customer.customerName}
                          </div>

                          <div className="customer-email">
                            {customer.email ||
                              "No email"}
                          </div>

                        </td>


                        <td>
                          {customer.businessName}
                        </td>


                        <td>
                          {customer.mobile}
                        </td>


                        <td>

                          <span className="type-badge">
                            {customer.customerType}
                          </span>

                        </td>


                        <td>

                          <span
                            className={`status-badge ${getStatusClass(
                              customer.status
                            )}`}
                          >
                            {customer.status}
                          </span>

                        </td>


                        <td>

                          {customer.followUpDate
                            ? new Date(
                                customer.followUpDate
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "—"}

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>


              {filteredCustomers.length === 0 && (

                <div className="empty-state">

                  <div>👥</div>

                  <h3>
                    No customers found
                  </h3>

                  <p>
                    Try another search or add a
                    new customer.
                  </p>

                </div>

              )}

            </div>

          </div>


          {/* ADD CUSTOMER MODAL */}

          {showForm && (

            <div className="modal-overlay">

              <div className="customer-modal">

                <div className="modal-header">

                  <div>

                    <h2>
                      Add Customer
                    </h2>

                    <p>
                      Create a new CRM customer
                    </p>

                  </div>


                  <button
                    className="close-btn"
                    onClick={() =>
                      setShowForm(false)
                    }
                  >
                    ×
                  </button>

                </div>


                <form
                  onSubmit={handleCreateCustomer}
                >

                  <div className="form-grid">

                    <div className="form-group">

                      <label>
                        Customer Name *
                      </label>

                      <input
                        name="customerName"
                        value={
                          form.customerName
                        }
                        onChange={handleChange}
                        required
                      />

                    </div>


                    <div className="form-group">

                      <label>
                        Mobile *
                      </label>

                      <input
                        name="mobile"
                        value={form.mobile}
                        onChange={handleChange}
                        required
                      />

                    </div>


                    <div className="form-group">

                      <label>
                        Email
                      </label>

                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                      />

                    </div>


                    <div className="form-group">

                      <label>
                        Business Name *
                      </label>

                      <input
                        name="businessName"
                        value={
                          form.businessName
                        }
                        onChange={handleChange}
                        required
                      />

                    </div>


                    <div className="form-group">

                      <label>
                        GST Number
                      </label>

                      <input
                        name="gstNumber"
                        value={
                          form.gstNumber
                        }
                        onChange={handleChange}
                      />

                    </div>


                    <div className="form-group">

                      <label>
                        Customer Type *
                      </label>

                      <select
                        name="customerType"
                        value={
                          form.customerType
                        }
                        onChange={handleChange}
                      >

                        <option value="RETAIL">
                          RETAIL
                        </option>

                        <option value="WHOLESALE">
                          WHOLESALE
                        </option>

                        <option value="DISTRIBUTOR">
                          DISTRIBUTOR
                        </option>

                      </select>

                    </div>


                    <div className="form-group">

                      <label>
                        Status
                      </label>

                      <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                      >

                        <option value="LEAD">
                          LEAD
                        </option>

                        <option value="ACTIVE">
                          ACTIVE
                        </option>

                        <option value="INACTIVE">
                          INACTIVE
                        </option>

                      </select>

                    </div>


                    <div className="form-group">

                      <label>
                        Follow-up Date
                      </label>

                      <input
                        type="datetime-local"
                        name="followUpDate"
                        value={
                          form.followUpDate
                        }
                        onChange={handleChange}
                      />

                    </div>


                    <div className="form-group full-width">

                      <label>
                        Address *
                      </label>

                      <input
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        required
                      />

                    </div>


                    <div className="form-group full-width">

                      <label>
                        Notes
                      </label>

                      <textarea
                        name="notes"
                        value={form.notes}
                        onChange={handleChange}
                        rows={3}
                      />

                    </div>

                  </div>


                  <div className="modal-actions">

                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() =>
                        setShowForm(false)
                      }
                    >
                      Cancel
                    </button>


                    <button
                      type="submit"
                      className="primary-btn"
                    >
                      Create Customer
                    </button>

                  </div>

                </form>

              </div>

            </div>

          )}

        </div>

      </main>

    </div>
  );
}