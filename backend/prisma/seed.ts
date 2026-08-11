import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Fundsroom Infotech ERP Database Seeding...');

  // Clean existing data
  await prisma.challanItem.deleteMany();
  await prisma.challan.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing database tables.');

  // 1. Create Users
  const defaultPassword = await bcrypt.hash('Fundsroom@123', 10);

  const adminUser = await prisma.user.create({
    data: {
      name: 'Rahul Verma (Admin)',
      email: 'admin@fundsroom.demo',
      password: defaultPassword,
      role: 'ADMIN',
    },
  });

  const salesUser = await prisma.user.create({
    data: {
      name: 'Priya Sharma (Sales Exec)',
      email: 'sales@fundsroom.demo',
      password: defaultPassword,
      role: 'SALES',
    },
  });

  const warehouseUser = await prisma.user.create({
    data: {
      name: 'Vikram Singh (Warehouse Mgr)',
      email: 'warehouse@fundsroom.demo',
      password: defaultPassword,
      role: 'WAREHOUSE',
    },
  });

  const accountsUser = await prisma.user.create({
    data: {
      name: 'Anish Mehta (Lead Accountant)',
      email: 'accounts@fundsroom.demo',
      password: defaultPassword,
      role: 'ACCOUNTS',
    },
  });

  console.log('👤 Demo Users Created: Admin, Sales, Warehouse, Accounts.');

  // 2. Create Customers
  const customersData = [
    {
      customerName: 'Rajesh Sharma',
      businessName: 'Sharma Distributors Pvt Ltd',
      mobile: '+91 98230 11223',
      email: 'contact@sharmadistributors.com',
      gstNumber: '27AAACS1234H1Z5',
      customerType: 'DISTRIBUTOR' as const,
      address: 'Plot 42, MIDC Industrial Area, Andheri East, Mumbai, Maharashtra 400093',
      status: 'ACTIVE' as const,
      followUpDate: new Date('2026-08-15'),
      notes: 'Key wholesale distributor for Western region. High bulk inquiry anticipated next week.',
    },
    {
      customerName: 'Amit Patel',
      businessName: 'Apex Wholesale Corp',
      mobile: '+91 98980 44556',
      email: 'purchasing@apexwholesale.in',
      gstNumber: '24BBACX5678J1Z9',
      customerType: 'WHOLESALE' as const,
      address: 'Suite 104, GIDC Electronic Estate, Sector 25, Gandhinagar, Gujarat 382024',
      status: 'ACTIVE' as const,
      followUpDate: new Date('2026-08-18'),
      notes: 'Interested in commercial laptop batch orders. Payment terms: Net 30.',
    },
    {
      customerName: 'Sanjay Kulkarni',
      businessName: 'Metro Retail Solutions',
      mobile: '+91 97654 32100',
      email: 'info@metroretail.co.in',
      gstNumber: '27CCACM9876K1Z3',
      customerType: 'RETAIL' as const,
      address: 'Shop 12-14, Commercial Complex, FC Road, Pune, Maharashtra 411004',
      status: 'ACTIVE' as const,
      followUpDate: new Date('2026-08-12'),
      notes: 'Regular buyer for desktop peripherals and networking accessories.',
    },
    {
      customerName: 'Sunil Rao',
      businessName: 'Sunrise Traders & Co',
      mobile: '+91 99001 88776',
      email: 'orders@sunrisetraders.org',
      gstNumber: '29DDACS4321L1Z2',
      customerType: 'DISTRIBUTOR' as const,
      address: '88 Brigade Road, Commercial Hub, Bengaluru, Karnataka 560001',
      status: 'ACTIVE' as const,
      followUpDate: new Date('2026-08-20'),
      notes: 'Discussing quarterly distribution agreement for office equipment.',
    },
    {
      customerName: 'Deepak Joshi',
      businessName: 'Zenith Tech Enterprises',
      mobile: '+91 98112 33445',
      email: 'deepak@zenithtech.in',
      gstNumber: '07EEACZ1122M1Z1',
      customerType: 'WHOLESALE' as const,
      address: 'Building 5, Nehru Place Tech Zone, New Delhi 110019',
      status: 'LEAD' as const,
      followUpDate: new Date('2026-08-14'),
      notes: 'New prospective client looking for enterprise Wi-Fi router quote.',
    },
    {
      customerName: 'Manish Verma',
      businessName: 'BlueSky Electronics',
      mobile: '+91 94150 99887',
      email: 'm.verma@blueskyelec.com',
      gstNumber: '09FFACB9988N1Z8',
      customerType: 'RETAIL' as const,
      address: '15 Hazratganj Market, Lucknow, Uttar Pradesh 226001',
      status: 'LEAD' as const,
      followUpDate: new Date('2026-08-25'),
      notes: 'Requested sample units for mechanical gaming keyboards.',
    },
    {
      customerName: 'Vikram Goyal',
      businessName: 'OmniGlobal Logistics',
      mobile: '+91 98400 77665',
      email: 'support@omniglobal.net',
      gstNumber: '33GGACO7766P1Z7',
      customerType: 'DISTRIBUTOR' as const,
      address: 'Harbour Front Tech Park, Teynampet, Chennai, Tamil Nadu 600018',
      status: 'INACTIVE' as const,
      followUpDate: null,
      notes: 'Account suspended pending contract renewal.',
    },
    {
      customerName: 'Rohan Gupta',
      businessName: 'Prime Hardware Mart',
      mobile: '+91 98310 55443',
      email: 'sales@primehardware.co.in',
      gstNumber: '19HHACP5544Q1Z6',
      customerType: 'WHOLESALE' as const,
      address: '45 Salt Lake Sector V, Electronics City, Kolkata, West Bengal 700091',
      status: 'ACTIVE' as const,
      followUpDate: new Date('2026-08-16'),
      notes: 'VIP customer. Prompt payments via RTGS.',
    },
    {
      customerName: 'Ananya Roy',
      businessName: 'Visionary Office Automation',
      mobile: '+91 98711 22334',
      email: 'ananya@visionaryoffice.com',
      gstNumber: '07IIACV2233R1Z4',
      customerType: 'DISTRIBUTOR' as const,
      address: '22 Connaught Place, Inner Circle, New Delhi 110001',
      status: 'ACTIVE' as const,
      followUpDate: new Date('2026-08-22'),
      notes: 'Focus on MFP laser printers and scanner units.',
    },
    {
      customerName: 'Harish Mehta',
      businessName: 'Everest Computer World',
      mobile: '+91 98200 66554',
      email: 'everest.comp@gmail.com',
      gstNumber: '27JJACE6655S1Z3',
      customerType: 'RETAIL' as const,
      address: 'Lamington Road, Grant Road East, Mumbai, Maharashtra 400007',
      status: 'ACTIVE' as const,
      followUpDate: new Date('2026-08-11'),
      notes: 'High walk-in retail conversion rate.',
    },
    {
      customerName: 'Siddharth Nair',
      businessName: 'National Digital Systems',
      mobile: '+91 94470 12345',
      email: 'snair@nationaldigital.in',
      gstNumber: '32KKACN1234T1Z2',
      customerType: 'WHOLESALE' as const,
      address: 'MG Road Plaza, Ernakulam, Kochi, Kerala 682016',
      status: 'ACTIVE' as const,
      followUpDate: new Date('2026-08-19'),
      notes: 'Needs 50 units NVMe SSDs before end of month.',
    },
    {
      customerName: 'Kavita Menon',
      businessName: 'Apex Retail Pune',
      mobile: '+91 97640 88990',
      email: 'kavita@apexpune.com',
      gstNumber: null,
      customerType: 'RETAIL' as const,
      address: 'Kothrud Commercial Complex, Karve Road, Pune, Maharashtra 411038',
      status: 'LEAD' as const,
      followUpDate: new Date('2026-08-17'),
      notes: 'Small retailer inquiring about minimum order quantity.',
    },
  ];

  const createdCustomers = [];
  for (const cust of customersData) {
    const created = await prisma.customer.create({ data: cust });
    createdCustomers.push(created);
  }

  console.log(`📋 Seeded ${createdCustomers.length} Customers.`);

  // 3. Create Products (Including Low Stock Items for alerting!)
  const productsData = [
    {
      productName: 'Fundsroom ProBook 15.6" i7 Workstation',
      sku: 'FR-LAP-001',
      category: 'Laptops',
      unitPrice: 65000.0,
      currentStock: 35,
      minimumStock: 10,
      warehouseLocation: 'Aisle A-101 (Bhiwandi Hub)',
    },
    {
      productName: 'Fundsroom Executive Slim Laptop 14" i5',
      sku: 'FR-LAP-002',
      category: 'Laptops',
      unitPrice: 48500.0,
      currentStock: 4, // LOW STOCK!
      minimumStock: 10,
      warehouseLocation: 'Aisle A-102 (Bhiwandi Hub)',
    },
    {
      productName: 'Enterprise Gigabit 24-Port Managed Switch',
      sku: 'FR-NET-010',
      category: 'Networking',
      unitPrice: 14200.0,
      currentStock: 28,
      minimumStock: 8,
      warehouseLocation: 'Rack B-205 (Pune Central)',
    },
    {
      productName: 'Dual-Band Wi-Fi 6 Mesh Router System',
      sku: 'FR-NET-012',
      category: 'Networking',
      unitPrice: 7800.0,
      currentStock: 2, // LOW STOCK!
      minimumStock: 15,
      warehouseLocation: 'Rack B-208 (Pune Central)',
    },
    {
      productName: 'UltraSharp 27" 4K IPS Ergonomic Monitor',
      sku: 'FR-MON-101',
      category: 'Monitors',
      unitPrice: 28900.0,
      currentStock: 18,
      minimumStock: 5,
      warehouseLocation: 'Section C-12 (Bhiwandi Hub)',
    },
    {
      productName: 'Business Office 24" FHD Anti-Glare Monitor',
      sku: 'FR-MON-102',
      category: 'Monitors',
      unitPrice: 11500.0,
      currentStock: 45,
      minimumStock: 12,
      warehouseLocation: 'Section C-14 (Bhiwandi Hub)',
    },
    {
      productName: 'Ergonomic Wireless Mechanical Keyboard Set',
      sku: 'FR-ACC-301',
      category: 'Peripherals',
      unitPrice: 3200.0,
      currentStock: 120,
      minimumStock: 25,
      warehouseLocation: 'Bin D-04 (Pune Central)',
    },
    {
      productName: 'Precision Optical Wireless Business Mouse',
      sku: 'FR-ACC-302',
      category: 'Peripherals',
      unitPrice: 950.0,
      currentStock: 210,
      minimumStock: 50,
      warehouseLocation: 'Bin D-05 (Pune Central)',
    },
    {
      productName: 'Heavy-Duty Office Duplex Laser Printer',
      sku: 'FR-PRN-501',
      category: 'Printers',
      unitPrice: 24500.0,
      currentStock: 3, // LOW STOCK!
      minimumStock: 6,
      warehouseLocation: 'Aisle E-01 (Bhiwandi Hub)',
    },
    {
      productName: 'High-Speed Multifunction Scanner Unit',
      sku: 'FR-PRN-502',
      category: 'Printers',
      unitPrice: 18900.0,
      currentStock: 14,
      minimumStock: 5,
      warehouseLocation: 'Aisle E-03 (Bhiwandi Hub)',
    },
    {
      productName: '1TB M.2 NVMe PCIe 4.0 High-Speed SSD',
      sku: 'FR-STR-701',
      category: 'Storage',
      unitPrice: 6200.0,
      currentStock: 85,
      minimumStock: 20,
      warehouseLocation: 'Secure Safe S-01 (Pune Central)',
    },
    {
      productName: '2TB External Rugged Shockproof Hard Drive',
      sku: 'FR-STR-702',
      category: 'Storage',
      unitPrice: 5400.0,
      currentStock: 42,
      minimumStock: 15,
      warehouseLocation: 'Secure Safe S-02 (Pune Central)',
    },
    {
      productName: 'Uninterruptible Power Supply (UPS) 1100VA',
      sku: 'FR-PWR-901',
      category: 'Power Systems',
      unitPrice: 6800.0,
      currentStock: 19,
      minimumStock: 8,
      warehouseLocation: 'Floor Heavy F-08 (Bhiwandi Hub)',
    },
    {
      productName: 'Conference Room HD Auto-Focus Webcam 1080p',
      sku: 'FR-ACC-305',
      category: 'Peripherals',
      unitPrice: 4200.0,
      currentStock: 50,
      minimumStock: 10,
      warehouseLocation: 'Bin D-12 (Pune Central)',
    },
    {
      productName: 'Noise-Canceling USB Business Headset with Mic',
      sku: 'FR-ACC-308',
      category: 'Peripherals',
      unitPrice: 2100.0,
      currentStock: 75,
      minimumStock: 15,
      warehouseLocation: 'Bin D-14 (Pune Central)',
    },
    {
      productName: 'Cat6 Enterprise Ethernet Cable Spool (305m)',
      sku: 'FR-NET-015',
      category: 'Networking',
      unitPrice: 5600.0,
      currentStock: 1, // LOW STOCK!
      minimumStock: 5,
      warehouseLocation: 'Rack B-301 (Pune Central)',
    },
  ];

  const createdProducts = [];
  for (const prod of productsData) {
    const created = await prisma.product.create({ data: prod });
    createdProducts.push(created);
  }

  console.log(`📦 Seeded ${createdProducts.length} Products (including 4 low-stock items).`);

  // 4. Create Initial Stock Movements (IN)
  for (const prod of createdProducts) {
    await prisma.stockMovement.create({
      data: {
        productId: prod.id,
        quantity: prod.currentStock + 10,
        movementType: 'IN',
        reason: 'Initial Inward Shipment Inventory Procurement',
        createdBy: warehouseUser.id,
      },
    });
  }

  console.log('🔄 Initial Stock Movement IN Logs created.');

  // 5. Create Sample Sales Challans
  // Challan 1: Confirmed Challan for Sharma Distributors
  const challan1 = await prisma.challan.create({
    data: {
      challanNumber: 'FR-CH-2026-0001',
      customerId: createdCustomers[0].id,
      totalQuantity: 15,
      status: 'CONFIRMED',
      createdBy: salesUser.id,
      createdAt: new Date('2026-08-01'),
      items: {
        create: [
          {
            productId: createdProducts[0].id,
            productNameSnapshot: createdProducts[0].productName,
            skuSnapshot: createdProducts[0].sku,
            unitPriceSnapshot: createdProducts[0].unitPrice,
            quantity: 5,
            totalPrice: createdProducts[0].unitPrice * 5,
          },
          {
            productId: createdProducts[6].id,
            productNameSnapshot: createdProducts[6].productName,
            skuSnapshot: createdProducts[6].sku,
            unitPriceSnapshot: createdProducts[6].unitPrice,
            quantity: 10,
            totalPrice: createdProducts[6].unitPrice * 10,
          },
        ],
      },
    },
  });

  // Outward stock movements for Challan 1
  await prisma.stockMovement.create({
    data: {
      productId: createdProducts[0].id,
      quantity: 5,
      movementType: 'OUT',
      reason: `Sales Challan Confirmation: ${challan1.challanNumber}`,
      createdBy: salesUser.id,
      createdAt: new Date('2026-08-01'),
    },
  });
  await prisma.stockMovement.create({
    data: {
      productId: createdProducts[6].id,
      quantity: 10,
      movementType: 'OUT',
      reason: `Sales Challan Confirmation: ${challan1.challanNumber}`,
      createdBy: salesUser.id,
      createdAt: new Date('2026-08-01'),
    },
  });

  // Challan 2: Confirmed Challan for Apex Wholesale
  const challan2 = await prisma.challan.create({
    data: {
      challanNumber: 'FR-CH-2026-0002',
      customerId: createdCustomers[1].id,
      totalQuantity: 20,
      status: 'CONFIRMED',
      createdBy: salesUser.id,
      createdAt: new Date('2026-08-04'),
      items: {
        create: [
          {
            productId: createdProducts[2].id,
            productNameSnapshot: createdProducts[2].productName,
            skuSnapshot: createdProducts[2].sku,
            unitPriceSnapshot: createdProducts[2].unitPrice,
            quantity: 10,
            totalPrice: createdProducts[2].unitPrice * 10,
          },
          {
            productId: createdProducts[10].id,
            productNameSnapshot: createdProducts[10].productName,
            skuSnapshot: createdProducts[10].sku,
            unitPriceSnapshot: createdProducts[10].unitPrice,
            quantity: 10,
            totalPrice: createdProducts[10].unitPrice * 10,
          },
        ],
      },
    },
  });

  await prisma.stockMovement.create({
    data: {
      productId: createdProducts[2].id,
      quantity: 10,
      movementType: 'OUT',
      reason: `Sales Challan Confirmation: ${challan2.challanNumber}`,
      createdBy: salesUser.id,
      createdAt: new Date('2026-08-04'),
    },
  });

  // Challan 3: DRAFT Challan for Metro Retail Solutions
  await prisma.challan.create({
    data: {
      challanNumber: 'FR-CH-2026-0003',
      customerId: createdCustomers[2].id,
      totalQuantity: 8,
      status: 'DRAFT',
      createdBy: salesUser.id,
      createdAt: new Date('2026-08-08'),
      items: {
        create: [
          {
            productId: createdProducts[4].id,
            productNameSnapshot: createdProducts[4].productName,
            skuSnapshot: createdProducts[4].sku,
            unitPriceSnapshot: createdProducts[4].unitPrice,
            quantity: 3,
            totalPrice: createdProducts[4].unitPrice * 3,
          },
          {
            productId: createdProducts[7].id,
            productNameSnapshot: createdProducts[7].productName,
            skuSnapshot: createdProducts[7].sku,
            unitPriceSnapshot: createdProducts[7].unitPrice,
            quantity: 5,
            totalPrice: createdProducts[7].unitPrice * 5,
          },
        ],
      },
    },
  });

  // Challan 4: DRAFT Challan for Sunrise Traders
  await prisma.challan.create({
    data: {
      challanNumber: 'FR-CH-2026-0004',
      customerId: createdCustomers[3].id,
      totalQuantity: 12,
      status: 'DRAFT',
      createdBy: salesUser.id,
      createdAt: new Date('2026-08-10'),
      items: {
        create: [
          {
            productId: createdProducts[1].id,
            productNameSnapshot: createdProducts[1].productName,
            skuSnapshot: createdProducts[1].sku,
            unitPriceSnapshot: createdProducts[1].unitPrice,
            quantity: 2,
            totalPrice: createdProducts[1].unitPrice * 2,
          },
          {
            productId: createdProducts[13].id,
            productNameSnapshot: createdProducts[13].productName,
            skuSnapshot: createdProducts[13].sku,
            unitPriceSnapshot: createdProducts[13].unitPrice,
            quantity: 10,
            totalPrice: createdProducts[13].unitPrice * 10,
          },
        ],
      },
    },
  });

  console.log('🧾 Seeded Sample Draft and Confirmed Sales Challans.');

  console.log('✅ Fundsroom Infotech ERP Database Seeding Complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
