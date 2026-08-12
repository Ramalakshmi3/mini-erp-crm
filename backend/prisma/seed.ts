import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🌱 Starting database seed...");

  // -----------------------------
  // 1. USERS
  // -----------------------------

  const passwordHash = await bcrypt.hash("Admin@123", 12);

  const admin = await prisma.user.upsert({
    where: {
      email: "admin@minierp.com",
    },
    update: {},
    create: {
      name: "System Administrator",
      email: "admin@minierp.com",
      passwordHash,
      role: "ADMIN",
    },
  });

  const salesPassword = await bcrypt.hash("Sales@123", 12);

  const sales = await prisma.user.upsert({
    where: {
      email: "sales@minierp.com",
    },
    update: {},
    create: {
      name: "Sales Executive",
      email: "sales@minierp.com",
      passwordHash: salesPassword,
      role: "SALES",
    },
  });

  const warehousePassword = await bcrypt.hash("Warehouse@123", 12);

  const warehouseUser = await prisma.user.upsert({
    where: {
      email: "warehouse@minierp.com",
    },
    update: {},
    create: {
      name: "Warehouse Manager",
      email: "warehouse@minierp.com",
      passwordHash: warehousePassword,
      role: "WAREHOUSE",
    },
  });

  const accountsPassword = await bcrypt.hash("Accounts@123", 12);

  const accounts = await prisma.user.upsert({
    where: {
      email: "accounts@minierp.com",
    },
    update: {},
    create: {
      name: "Accounts Executive",
      email: "accounts@minierp.com",
      passwordHash: accountsPassword,
      role: "ACCOUNTS",
    },
  });

  // -----------------------------
  // 2. CATEGORIES
  // -----------------------------

  const electronics = await prisma.category.upsert({
    where: {
      name: "Electronics",
    },
    update: {},
    create: {
      name: "Electronics",
      description: "Electronic equipment and devices",
    },
  });

  const officeSupplies = await prisma.category.upsert({
    where: {
      name: "Office Supplies",
    },
    update: {},
    create: {
      name: "Office Supplies",
      description: "General office and stationery products",
    },
  });

  const accessories = await prisma.category.upsert({
    where: {
      name: "Accessories",
    },
    update: {},
    create: {
      name: "Accessories",
      description: "Computer and electronic accessories",
    },
  });

  const networking = await prisma.category.upsert({
    where: {
      name: "Networking",
    },
    update: {},
    create: {
      name: "Networking",
      description: "Networking equipment and components",
    },
  });

  const furniture = await prisma.category.upsert({
    where: {
      name: "Furniture",
    },
    update: {},
    create: {
      name: "Furniture",
      description: "Office furniture and equipment",
    },
  });

  // -----------------------------
  // 3. WAREHOUSES
  // -----------------------------

  const mainWarehouse = await prisma.warehouse.upsert({
    where: {
      name: "Main Warehouse",
    },
    update: {},
    create: {
      name: "Main Warehouse",
      location: "Bangalore",
    },
  });

  const secondaryWarehouse = await prisma.warehouse.upsert({
    where: {
      name: "Secondary Warehouse",
    },
    update: {},
    create: {
      name: "Secondary Warehouse",
      location: "Mysore",
    },
  });

  // -----------------------------
  // 4. CUSTOMERS
  // -----------------------------

  const customer1 = await prisma.customer.upsert({
    where: {
      mobile: "9876543210",
    },
    update: {},
    create: {
      customerName: "Rahul Enterprises",
      mobile: "9876543210",
      email: "rahul@enterprises.com",
      businessName: "Rahul Enterprises",
      gstNumber: "29ABCDE1234F1Z5",
      customerType: "WHOLESALE",
      address: "Indiranagar, Bangalore",
      status: "ACTIVE",
      notes: "Regular wholesale customer",
    },
  });

  const customer2 = await prisma.customer.upsert({
    where: {
      mobile: "9876543211",
    },
    update: {},
    create: {
      customerName: "Priya Technologies",
      mobile: "9876543211",
      email: "contact@priyatech.com",
      businessName: "Priya Technologies",
      customerType: "DISTRIBUTOR",
      address: "Whitefield, Bangalore",
      status: "ACTIVE",
    },
  });

  const customer3 = await prisma.customer.upsert({
    where: {
      mobile: "9876543212",
    },
    update: {},
    create: {
      customerName: "Arjun Retail",
      mobile: "9876543212",
      email: "arjun@retail.com",
      businessName: "Arjun Retail",
      customerType: "RETAIL",
      address: "Jayanagar, Bangalore",
      status: "LEAD",
      notes: "Potential retail customer",
    },
  });

  const customer4 = await prisma.customer.upsert({
    where: {
      mobile: "9876543213",
    },
    update: {},
    create: {
      customerName: "Global Office Solutions",
      mobile: "9876543213",
      email: "info@globaloffice.com",
      businessName: "Global Office Solutions",
      customerType: "WHOLESALE",
      address: "Koramangala, Bangalore",
      status: "ACTIVE",
    },
  });

  const customer5 = await prisma.customer.upsert({
    where: {
      mobile: "9876543214",
    },
    update: {},
    create: {
      customerName: "TechPoint Systems",
      mobile: "9876543214",
      email: "sales@techpoint.com",
      businessName: "TechPoint Systems",
      customerType: "DISTRIBUTOR",
      address: "Electronic City, Bangalore",
      status: "ACTIVE",
    },
  });

  // -----------------------------
  // 5. PRODUCTS
  // -----------------------------

  const products = await Promise.all([
    prisma.product.upsert({
      where: { sku: "LAP-001" },
      update: {},
      create: {
        name: "Business Laptop",
        sku: "LAP-001",
        categoryId: electronics.id,
        warehouseId: mainWarehouse.id,
        unitPrice: 65000,
        currentStock: 25,
        minimumStock: 5,
      },
    }),

    prisma.product.upsert({
      where: { sku: "MON-001" },
      update: {},
      create: {
        name: "24-inch LED Monitor",
        sku: "MON-001",
        categoryId: electronics.id,
        warehouseId: mainWarehouse.id,
        unitPrice: 12500,
        currentStock: 40,
        minimumStock: 10,
      },
    }),

    prisma.product.upsert({
      where: { sku: "KEY-001" },
      update: {},
      create: {
        name: "Wireless Keyboard",
        sku: "KEY-001",
        categoryId: accessories.id,
        warehouseId: mainWarehouse.id,
        unitPrice: 1800,
        currentStock: 75,
        minimumStock: 15,
      },
    }),

    prisma.product.upsert({
      where: { sku: "MOU-001" },
      update: {},
      create: {
        name: "Wireless Mouse",
        sku: "MOU-001",
        categoryId: accessories.id,
        warehouseId: mainWarehouse.id,
        unitPrice: 1200,
        currentStock: 90,
        minimumStock: 20,
      },
    }),

    prisma.product.upsert({
      where: { sku: "RTR-001" },
      update: {},
      create: {
        name: "Enterprise WiFi Router",
        sku: "RTR-001",
        categoryId: networking.id,
        warehouseId: secondaryWarehouse.id,
        unitPrice: 8500,
        currentStock: 12,
        minimumStock: 5,
      },
    }),

    prisma.product.upsert({
      where: { sku: "SW-001" },
      update: {},
      create: {
        name: "24-Port Network Switch",
        sku: "SW-001",
        categoryId: networking.id,
        warehouseId: secondaryWarehouse.id,
        unitPrice: 14500,
        currentStock: 8,
        minimumStock: 5,
      },
    }),

    prisma.product.upsert({
      where: { sku: "PPR-001" },
      update: {},
      create: {
        name: "A4 Printer Paper",
        sku: "PPR-001",
        categoryId: officeSupplies.id,
        warehouseId: mainWarehouse.id,
        unitPrice: 350,
        currentStock: 150,
        minimumStock: 30,
      },
    }),

    prisma.product.upsert({
      where: { sku: "CHR-001" },
      update: {},
      create: {
        name: "Ergonomic Office Chair",
        sku: "CHR-001",
        categoryId: furniture.id,
        warehouseId: secondaryWarehouse.id,
        unitPrice: 8500,
        currentStock: 18,
        minimumStock: 5,
      },
    }),

    prisma.product.upsert({
      where: { sku: "DSK-001" },
      update: {},
      create: {
        name: "Executive Office Desk",
        sku: "DSK-001",
        categoryId: furniture.id,
        warehouseId: secondaryWarehouse.id,
        unitPrice: 18500,
        currentStock: 7,
        minimumStock: 3,
      },
    }),

    prisma.product.upsert({
      where: { sku: "UPS-001" },
      update: {},
      create: {
        name: "1KVA UPS",
        sku: "UPS-001",
        categoryId: electronics.id,
        warehouseId: mainWarehouse.id,
        unitPrice: 7200,
        currentStock: 3,
        minimumStock: 5,
      },
    }),
  ]);

  // -----------------------------
  // 6. CUSTOMER FOLLOW-UPS
  // -----------------------------

  await prisma.customerFollowUp.createMany({
    data: [
      {
        customerId: customer1.id,
        createdById: sales.id,
        note: "Discussed monthly bulk order requirements.",
        followUpDate: new Date("2026-08-15"),
      },
      {
        customerId: customer2.id,
        createdById: sales.id,
        note: "Requested updated product catalogue.",
        followUpDate: new Date("2026-08-17"),
      },
      {
        customerId: customer3.id,
        createdById: sales.id,
        note: "Initial lead contacted. Waiting for response.",
        followUpDate: new Date("2026-08-13"),
      },
      {
        customerId: customer4.id,
        createdById: admin.id,
        note: "Discussed office equipment requirement.",
        followUpDate: new Date("2026-08-20"),
      },
    ],
  });

  // -----------------------------
  // 7. STOCK MOVEMENTS
  // -----------------------------

  const existingMovements = await prisma.stockMovement.count();

  if (existingMovements === 0) {
    await prisma.stockMovement.createMany({
      data: [
        {
          productId: products[0].id,
          warehouseId: mainWarehouse.id,
          quantity: 25,
          type: "IN",
          reason: "Opening stock",
          createdById: warehouseUser.id,
        },
        {
          productId: products[1].id,
          warehouseId: mainWarehouse.id,
          quantity: 40,
          type: "IN",
          reason: "Opening stock",
          createdById: warehouseUser.id,
        },
        {
          productId: products[2].id,
          warehouseId: mainWarehouse.id,
          quantity: 75,
          type: "IN",
          reason: "Opening stock",
          createdById: warehouseUser.id,
        },
        {
          productId: products[3].id,
          warehouseId: mainWarehouse.id,
          quantity: 90,
          type: "IN",
          reason: "Opening stock",
          createdById: warehouseUser.id,
        },
        {
          productId: products[4].id,
          warehouseId: secondaryWarehouse.id,
          quantity: 12,
          type: "IN",
          reason: "Opening stock",
          createdById: warehouseUser.id,
        },
        {
          productId: products[9].id,
          warehouseId: mainWarehouse.id,
          quantity: 3,
          type: "IN",
          reason: "Opening stock",
          createdById: warehouseUser.id,
        },
      ],
    });
  }

  // -----------------------------
  // 8. AUDIT LOG
  // -----------------------------

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "SEED_DATABASE",
      entity: "SYSTEM",
      metadata: {
        message: "Initial demo data created",
      },
    },
  });

  console.log("");
  console.log("✅ Database seed completed successfully!");
  console.log("");
  console.log("Demo accounts:");
  console.log("Admin     : admin@minierp.com / Admin@123");
  console.log("Sales     : sales@minierp.com / Sales@123");
  console.log("Warehouse : warehouse@minierp.com / Warehouse@123");
  console.log("Accounts  : accounts@minierp.com / Accounts@123");
  console.log("");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });