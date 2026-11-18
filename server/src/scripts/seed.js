import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Shop } from '../models/Shop.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { PrintJob } from '../models/PrintJob.js';
import { AcademicCalendar } from '../models/AcademicCalendar.js';
import { InventoryLedger } from '../models/InventoryLedger.js';
import { generateDeliveryOtp } from '../utils/tokens.js';

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('[Seed] Purging existing database collections for fresh seed...');
    await Promise.all([
      User.deleteMany({}),
      Shop.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Order.deleteMany({}),
      PrintJob.deleteMany({}),
      AcademicCalendar.deleteMany({}),
      InventoryLedger.deleteMany({}),
    ]);

    const passwordHash = await bcrypt.hash('Campus@123', 10);

    console.log('[Seed] Creating demo users...');
    const [admin, vendor1, vendor2, student1, student2, deliveryAgent] = await User.create([
      {
        name: 'Dr. Sarah Jenkins (Admin)',
        email: 'admin@campuscart.edu',
        phone: '+91 98765 00001',
        passwordHash,
        role: 'ADMIN',
        collegeId: 'FAC-2024-001',
      },
      {
        name: 'Rajesh Kumar (Shop Owner)',
        email: 'vendor@campuscart.edu',
        phone: '+91 98765 00002',
        passwordHash,
        role: 'SHOP_OWNER',
        collegeId: 'VEN-2024-010',
      },
      {
        name: 'Anita Sharma (Print Hub Owner)',
        email: 'printvendor@campuscart.edu',
        phone: '+91 98765 00003',
        passwordHash,
        role: 'SHOP_OWNER',
        collegeId: 'VEN-2024-011',
      },
      {
        name: 'Aarav Patel (Student)',
        email: 'student@campuscart.edu',
        phone: '+91 98765 00004',
        passwordHash,
        role: 'STUDENT',
        collegeId: 'STU-2023-CS104',
        hostelBlock: 'Hostel Block C',
        roomNumber: '312',
        addresses: [
          {
            label: 'Hostel Room',
            hostelBlock: 'Hostel Block C',
            roomNumber: '312',
            campusLandmark: 'Opposite Basketball Court',
            isDefault: true,
          },
        ],
      },
      {
        name: 'Priya Verma (Student)',
        email: 'priya@campuscart.edu',
        phone: '+91 98765 00005',
        passwordHash,
        role: 'STUDENT',
        collegeId: 'STU-2023-EC208',
        hostelBlock: 'Girls Hostel 2',
        roomNumber: '105',
        addresses: [
          {
            label: 'Hostel Room',
            hostelBlock: 'Girls Hostel 2',
            roomNumber: '105',
            campusLandmark: 'Near East Lawn',
            isDefault: true,
          },
        ],
      },
      {
        name: 'Vikram Singh (Campus Delivery)',
        email: 'delivery@campuscart.edu',
        phone: '+91 98765 00006',
        passwordHash,
        role: 'DELIVERY_AGENT',
        collegeId: 'DEL-2024-001',
      },
    ]);

    console.log('[Seed] Creating campus shops...');
    const [shop1, shop2] = await Shop.create([
      {
        name: 'Central Campus Stationery Hub',
        ownerId: vendor1._id,
        description: 'Authorized retailer for college notebooks, pens, practical record sheets, and calculators.',
        campusLocation: 'Student Activity Center, Ground Floor, Stall #1',
        supportedDeliveryAreas: ['Hostel Block A', 'Hostel Block B', 'Hostel Block C', 'Girls Hostel 1', 'Girls Hostel 2'],
        rating: 4.9,
        commissionRate: 0.05,
        approvalStatus: 'APPROVED',
        isActive: true,
        operatingHours: '8:30 AM - 9:30 PM (Mon-Sat)',
        offersPrinting: true,
      },
      {
        name: 'QuickPrint & Tech Xerox',
        ownerId: vendor2._id,
        description: 'High-speed color and monochrome laser printing, spiral binding, and engineering stationery.',
        campusLocation: 'Library Arcade, Opposite Admin Block',
        supportedDeliveryAreas: ['Hostel Block A', 'Hostel Block B', 'Hostel Block C', 'Girls Hostel 1', 'Girls Hostel 2', 'Library'],
        rating: 4.8,
        commissionRate: 0.05,
        approvalStatus: 'APPROVED',
        isActive: true,
        operatingHours: '8:00 AM - 10:00 PM (Daily)',
        offersPrinting: true,
      },
    ]);

    console.log('[Seed] Creating categories...');
    const categories = await Category.create([
      { name: 'Notebooks & Registers', slug: 'notebooks', description: 'Ruled, unruled, spiral and lab registers', iconName: 'Book' },
      { name: 'Pens & Writing', slug: 'pens', description: 'Ballpoint, gel, ink pens, markers and highlighters', iconName: 'Edit3' },
      { name: 'Practical & Lab Supplies', slug: 'lab-supplies', description: 'Graph sheets, practical files, tracing paper', iconName: 'FileText' },
      { name: 'Calculators & Electronics', slug: 'calculators', description: 'Scientific calculators and accessories', iconName: 'Cpu' },
      { name: 'Art & Geometry', slug: 'art-geometry', description: 'Geometry boxes, drafters, sketch pens, chart paper', iconName: 'Compass' },
      { name: 'Files & Folders', slug: 'files-folders', description: 'Ring binders, clear folders, document organizers', iconName: 'Folder' },
    ]);

    const catMap = {};
    categories.forEach((c) => (catMap[c.slug] = c._id));

    console.log('[Seed] Creating catalog products with realistic inventory parameters...');
    const productsData = [
      {
        shopId: shop1._id,
        categoryId: catMap['notebooks'],
        title: 'Classmate Spiral Bound Long Notebook (300 Pages)',
        slug: 'classmate-spiral-long-300-pages',
        description: 'Single line premium ozone-treated paper, 300 pages, perforated sheets for clean tear-off.',
        SKU: 'NB-CLM-300',
        price: 95,
        costPrice: 65,
        currentStock: 48,
        minStockThreshold: 20,
        leadTimeDays: 2,
        safetyStock: 15,
        images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'],
        tags: ['bestseller', 'exam-essential', 'notebook'],
        isFeatured: true,
      },
      {
        shopId: shop1._id,
        categoryId: catMap['notebooks'],
        title: 'Hardbound Engineering Lab Record Book (180 Pages)',
        slug: 'hardbound-engineering-lab-record-180',
        description: 'Standard college format lab record book with one side blank graph/drawing and one side ruled.',
        SKU: 'NB-LAB-180',
        price: 80,
        costPrice: 52,
        currentStock: 18, // Approach low stock alert
        minStockThreshold: 25,
        leadTimeDays: 3,
        safetyStock: 15,
        images: ['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&auto=format&fit=crop&q=80'],
        tags: ['lab-record', 'exam-essential'],
        isFeatured: true,
      },
      {
        shopId: shop1._id,
        categoryId: catMap['pens'],
        title: 'Reynolds Trimax Liquid Gel Pen (Blue, Pack of 5)',
        slug: 'reynolds-trimax-gel-blue-pack-5',
        description: 'Max write length with waterproof ink, smudge-free 0.5mm needle tip for exams.',
        SKU: 'PEN-TMX-BL5',
        price: 250,
        costPrice: 180,
        currentStock: 35,
        minStockThreshold: 15,
        leadTimeDays: 2,
        safetyStock: 10,
        images: ['https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80'],
        tags: ['bestseller', 'exam-essential'],
        isFeatured: true,
      },
      {
        shopId: shop1._id,
        categoryId: catMap['pens'],
        title: 'Pilot V5 Liquid Ink Rollerball Pen (Black)',
        slug: 'pilot-v5-liquid-ink-rollerball-black',
        description: 'Precision Japanese 0.5mm extra fine tip with pure liquid ink flow controller.',
        SKU: 'PEN-PLT-BK',
        price: 70,
        costPrice: 48,
        currentStock: 6, // Low stock critical
        minStockThreshold: 15,
        leadTimeDays: 2,
        safetyStock: 10,
        images: ['https://images.unsplash.com/photo-1585336261026-77cc7c358396?w=600&auto=format&fit=crop&q=80'],
        tags: ['pens', 'premium'],
        isFeatured: false,
      },
      {
        shopId: shop1._id,
        categoryId: catMap['calculators'],
        title: 'Casio fx-991CW ClassWiz Non-Programmable Scientific Calculator',
        slug: 'casio-fx991cw-scientific-calculator',
        description: 'Approved for college university examinations. 540 functions, high resolution 4-gradation display.',
        SKU: 'CALC-CS-991CW',
        price: 1595,
        costPrice: 1250,
        currentStock: 12,
        minStockThreshold: 5,
        leadTimeDays: 4,
        safetyStock: 4,
        images: ['https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=600&auto=format&fit=crop&q=80'],
        tags: ['calculator', 'engineering', 'exam-essential'],
        isFeatured: true,
      },
      {
        shopId: shop1._id,
        categoryId: catMap['art-geometry'],
        title: 'Omega Mini Drafter for Engineering Drawing',
        slug: 'omega-mini-drafter-engineering-drawing',
        description: 'Unbreakable scales, steel clamp with anti-rust powder coating. Free carrying pouch included.',
        SKU: 'GEO-DRF-01',
        price: 450,
        costPrice: 320,
        currentStock: 14,
        minStockThreshold: 8,
        leadTimeDays: 3,
        safetyStock: 6,
        images: ['https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&auto=format&fit=crop&q=80'],
        tags: ['engineering', 'drawing'],
        isFeatured: false,
      },
      {
        shopId: shop1._id,
        categoryId: catMap['files-folders'],
        title: 'Solo A4 Ring Binder File Folder with 20 Clear Sleeves',
        slug: 'solo-a4-ring-binder-with-sleeves',
        description: 'Durable poly board file folder ideal for project report submissions and certificates.',
        SKU: 'FL-SL-A4R',
        price: 135,
        costPrice: 90,
        currentStock: 22,
        minStockThreshold: 15,
        leadTimeDays: 2,
        safetyStock: 10,
        images: ['https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&auto=format&fit=crop&q=80'],
        tags: ['project-submission', 'files'],
        isFeatured: false,
      },
      {
        shopId: shop1._id,
        categoryId: catMap['lab-supplies'],
        title: 'A4 Millimeter Graph Sheets (Pack of 50 Sheets)',
        slug: 'a4-millimeter-graph-sheets-pack-50',
        description: 'Accurate 1mm grid spacing on heavy 80 GSM paper for mathematics and physics labs.',
        SKU: 'LAB-GRP-50',
        price: 60,
        costPrice: 38,
        currentStock: 40,
        minStockThreshold: 20,
        leadTimeDays: 2,
        safetyStock: 15,
        images: ['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80'],
        tags: ['graph-paper', 'exam-essential'],
        isFeatured: false,
      },
      {
        shopId: shop1._id,
        categoryId: catMap['pens'],
        title: 'Cello Butterflow Classic Blue Ball Pens (Pack of 5)',
        slug: 'cello-butterflow-blue-pack-5',
        description: 'Lubriflow ink system for ultra-smooth fast writing during university exam papers.',
        SKU: 'PEN-CLO-BF5',
        price: 50,
        costPrice: 32,
        currentStock: 65,
        minStockThreshold: 25,
        leadTimeDays: 2,
        safetyStock: 20,
        images: ['https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80'],
        tags: ['pens', 'bestseller', 'exam-essential'],
        isFeatured: true,
      },
      {
        shopId: shop1._id,
        categoryId: catMap['art-geometry'],
        title: 'Camlin Exam Mathematical Drawing Instrument Box',
        slug: 'camlin-exam-geometry-box',
        description: 'Specially crafted compass, divider, and ruler set designed for university geometry and design labs.',
        SKU: 'GEO-CAM-BX',
        price: 120,
        costPrice: 85,
        currentStock: 24,
        minStockThreshold: 10,
        leadTimeDays: 3,
        safetyStock: 8,
        images: ['https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&auto=format&fit=crop&q=80'],
        tags: ['geometry', 'engineering'],
        isFeatured: false,
      },
      {
        shopId: shop1._id,
        categoryId: catMap['pens'],
        title: 'Faber-Castell Textliner Highlighters (Pack of 4 Pastel Shades)',
        slug: 'faber-castell-textliner-highlighter-4pk',
        description: 'Water-based non-toxic pastel highlighters with 3 line widths for textbook study and revision.',
        SKU: 'HLT-FC-4PK',
        price: 110,
        costPrice: 75,
        currentStock: 28,
        minStockThreshold: 12,
        leadTimeDays: 2,
        safetyStock: 10,
        images: ['https://images.unsplash.com/photo-1585336261026-77cc7c358396?w=600&auto=format&fit=crop&q=80'],
        tags: ['highlighter', 'exam-essential'],
        isFeatured: false,
      },
      {
        shopId: shop1._id,
        categoryId: catMap['lab-supplies'],
        title: 'Navneet Youva Practical Assignment Sheets (Pack of 100)',
        slug: 'navneet-youva-practical-sheets-100',
        description: 'Punch-hole ruled assignment sheets with margin for assignment submissions and lab files.',
        SKU: 'NB-PRA-100',
        price: 85,
        costPrice: 55,
        currentStock: 35,
        minStockThreshold: 15,
        leadTimeDays: 2,
        safetyStock: 12,
        images: ['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&auto=format&fit=crop&q=80'],
        tags: ['assignment', 'lab-supplies'],
        isFeatured: false,
      },
    ];

    const createdProducts = await Product.create(productsData);

    console.log('[Seed] Creating inventory ledger entries for initial stock...');
    for (const prod of createdProducts) {
      await InventoryLedger.create({
        productId: prod._id,
        shopId: prod.shopId,
        transactionType: 'RESTOCK',
        quantityChanged: prod.currentStock,
        balanceBefore: 0,
        balanceAfter: prod.currentStock,
        referenceType: 'INITIAL_STOCK',
        performedBy: vendor1._id,
        notes: 'Initial catalog onboarding stock',
      });
    }

    console.log('[Seed] Creating academic calendar events for demand forecasting features...');
    const now = new Date();
    const midTermStart = new Date(now);
    midTermStart.setDate(now.getDate() + 8); // In 8 days
    const midTermEnd = new Date(midTermStart);
    midTermEnd.setDate(midTermStart.getDate() + 6);

    const projectDeadline = new Date(now);
    projectDeadline.setDate(now.getDate() + 15);

    const endSemStart = new Date(now);
    endSemStart.setDate(now.getDate() + 38);
    const endSemEnd = new Date(endSemStart);
    endSemEnd.setDate(endSemStart.getDate() + 14);

    await AcademicCalendar.create([
      {
        eventTitle: 'Mid-Semester Examinations 2026',
        eventType: 'MID_TERM_EXAMS',
        startDate: midTermStart,
        endDate: midTermEnd,
        description: 'University mid-term theory tests across all engineering & science branches.',
        impactCategory: 'EXAM_STATIONERY',
        isActive: true,
      },
      {
        eventTitle: 'Final Year Major Project Interim Report Submission',
        eventType: 'PROJECT_SUBMISSION',
        startDate: projectDeadline,
        endDate: projectDeadline,
        description: 'Hardcopy document submission with spiral or hardbound binding at department office.',
        impactCategory: 'PROJECT_PRINTING',
        isActive: true,
      },
      {
        eventTitle: 'End Semester University Examinations',
        eventType: 'END_SEM',
        startDate: endSemStart,
        endDate: endSemEnd,
        description: 'Final semester examinations. Maximum demand surge for pens, calculators, and rough notebooks.',
        impactCategory: 'EXAM_STATIONERY',
        isActive: true,
      },
    ]);

    console.log('[Seed] Creating historical daily sales and completed orders for ML training...');
    // Seed 45 days of past orders so ML model has actual historical time series
    for (let dayOffset = 45; dayOffset >= 1; dayOffset--) {
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - dayOffset);
      const isWeekend = orderDate.getDay() === 0 || orderDate.getDay() === 6;
      const baseUnits = isWeekend ? 3 : 8;

      const randomProd = createdProducts[dayOffset % createdProducts.length];
      const qty = Math.max(1, Math.round(baseUnits + (Math.sin(dayOffset) * 2)));

      const { otpHash } = generateDeliveryOtp();
      const pastOrder = await Order.create({
        orderNumber: `CC-HIST-${1000 + dayOffset}`,
        studentId: student1._id,
        shopId: shop1._id,
        items: [
          {
            productId: randomProd._id,
            productTitleSnapshot: randomProd.title,
            skuSnapshot: randomProd.SKU,
            quantity: qty,
            unitPriceSnapshot: randomProd.price,
            lineTotal: randomProd.price * qty,
          },
        ],
        subtotal: randomProd.price * qty,
        deliveryFee: 15,
        totalAmount: randomProd.price * qty + 15,
        paymentMethod: 'COD',
        paymentStatus: 'PAID',
        deliveryType: 'HOSTEL_DELIVERY',
        deliveryAddressSnapshot: {
          recipientName: 'Aarav Patel',
          phone: '+91 98765 00004',
          hostelBlock: 'Hostel Block C',
          roomNumber: '312',
          campusLandmark: 'Opposite Basketball Court',
        },
        deliveryAgentId: deliveryAgent._id,
        deliveryOtpHash: otpHash,
        status: 'COMPLETED',
        createdAt: orderDate,
        updatedAt: orderDate,
        statusTimeline: [
          { status: 'PLACED', timestamp: orderDate, note: 'Order placed by student' },
          { status: 'COMPLETED', timestamp: orderDate, note: 'Handed over with OTP verification' },
        ],
      });
    }

    console.log('[Seed] Creating demo active orders and printing requests...');
    const { otp: activeOtp, otpHash: activeOtpHash } = generateDeliveryOtp();
    await Order.create({
      orderNumber: 'CC-ACTIVE-2026',
      studentId: student1._id,
      shopId: shop1._id,
      items: [
        {
          productId: createdProducts[0]._id,
          productTitleSnapshot: createdProducts[0].title,
          skuSnapshot: createdProducts[0].SKU,
          quantity: 2,
          unitPriceSnapshot: createdProducts[0].price,
          lineTotal: createdProducts[0].price * 2,
        },
        {
          productId: createdProducts[2]._id,
          productTitleSnapshot: createdProducts[2].title,
          skuSnapshot: createdProducts[2].SKU,
          quantity: 1,
          unitPriceSnapshot: createdProducts[2].price,
          lineTotal: createdProducts[2].price * 1,
        },
      ],
      subtotal: 440,
      deliveryFee: 15,
      totalAmount: 455,
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      deliveryType: 'HOSTEL_DELIVERY',
      deliveryAddressSnapshot: {
        recipientName: 'Aarav Patel',
        phone: '+91 98765 00004',
        hostelBlock: 'Hostel Block C',
        roomNumber: '312',
        campusLandmark: 'Opposite Basketball Court',
      },
      deliveryAgentId: deliveryAgent._id,
      deliveryOtp: activeOtp,
      deliveryOtpHash: activeOtpHash,
      status: 'OUT_FOR_DELIVERY',
      statusTimeline: [
        { status: 'PLACED', timestamp: new Date(Date.now() - 3600000), note: 'Order placed' },
        { status: 'ACCEPTED', timestamp: new Date(Date.now() - 2800000), note: 'Vendor confirmed stock' },
        { status: 'PREPARING', timestamp: new Date(Date.now() - 2000000), note: 'Packed in bag' },
        { status: 'READY_FOR_PICKUP', timestamp: new Date(Date.now() - 1500000), note: 'Handed to delivery team' },
        { status: 'OUT_FOR_DELIVERY', timestamp: new Date(Date.now() - 600000), note: 'Agent on the way to Hostel Block C' },
      ],
    });

    console.log(`[Seed Demo OTP Note]: Active test order #CC-ACTIVE-2026 delivery OTP is: ${activeOtp}`);

    await PrintJob.create({
      jobCode: 'PJ-2026-901',
      studentId: student1._id,
      shopId: shop1._id,
      originalFileName: 'Machine_Learning_Assignment_3.pdf',
      storedFileName: 'print_demo_sample.pdf',
      filePath: 'uploads/print_jobs/print_demo_sample.pdf',
      fileSize: 1048576,
      pageCount: 16,
      copies: 1,
      printColor: 'BW',
      paperSize: 'A4',
      sides: 'DOUBLE',
      bindingType: 'STAPLE',
      additionalNotes: 'Please print duplex on bright white paper.',
      estimatedPrice: 21.0,
      finalPrice: 21.0,
      status: 'READY_FOR_PICKUP',
    });

    console.log('\n======================================================');
    console.log(' CAMPUSCART AI — DATABASE SEEDING COMPLETED SUCCESSFULLY');
    console.log('======================================================');
    console.log('Demo Credentials for All Roles:');
    console.log('Student:        student@campuscart.edu       / Campus@123');
    console.log('Shop Owner:     vendor@campuscart.edu        / Campus@123');
    console.log('Delivery Agent: delivery@campuscart.edu      / Campus@123');
    console.log('Administrator:  admin@campuscart.edu         / Campus@123');
    console.log('Active Order #CC-ACTIVE-2026 OTP:           ', activeOtp);
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
