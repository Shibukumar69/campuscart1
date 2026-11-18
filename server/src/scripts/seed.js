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

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('[Seed] Purging all collections for a fresh, clean database...');
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

    console.log('[Seed] Creating core accounts (Admin, Vendors, Student, Delivery)...');
    const [admin, vendor1, vendor2, student1, deliveryAgent] = await User.create([
      {
        name: 'Dr. Sarah Jenkins (Admin)',
        email: 'admin@campuscart.edu',
        phone: '+91 98765 00001',
        passwordHash,
        role: 'ADMIN',
        collegeId: 'FAC-2024-001',
      },
      {
        name: 'Rajesh Kumar (Stationery & Lab Hub)',
        email: 'vendor@campuscart.edu',
        phone: '+91 98765 00002',
        passwordHash,
        role: 'SHOP_OWNER',
        collegeId: 'VEN-2024-010',
      },
      {
        name: 'Anita Sharma (QuickPrint & Tech Xerox)',
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
        name: 'Vikram Singh (Campus Delivery)',
        email: 'delivery@campuscart.edu',
        phone: '+91 98765 00006',
        passwordHash,
        role: 'DELIVERY_AGENT',
        collegeId: 'DEL-2024-001',
      },
    ]);

    console.log('[Seed] Creating authorized campus shops...');
    const [shop1, shop2] = await Shop.create([
      {
        name: 'Central Campus Stationery & Lab Hub',
        ownerId: vendor1._id,
        description: 'Official supplier for Semester 1 to 8 Engineering Lab Files, practical record sheets, instruments, and stationery.',
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
        name: 'QuickPrint & Tech Xerox Hub',
        ownerId: vendor2._id,
        description: 'High-speed color and monochrome laser printing, spiral binding, and project report hardbinding.',
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

    console.log('[Seed] Creating stationery categories including Semester Lab Files...');
    const categories = await Category.create([
      {
        name: 'Semester Lab Files & Records',
        slug: 'lab-files',
        description: 'Official university practical lab files & manuals organized semester-wise from Semester 1 to Semester 8',
        iconName: 'FileCheck',
      },
      {
        name: 'Practical & Lab Accessories',
        slug: 'lab-accessories',
        description: 'Punch-hole assignment sheets, millimeter graph paper, transparent clip folders & sleeves',
        iconName: 'Folder',
      },
      {
        name: 'Notebooks & Registers',
        slug: 'notebooks',
        description: 'Single line ruled, spiral notebooks, hardbound registers for lecture notes',
        iconName: 'Book',
      },
      {
        name: 'Pens & Writing Essentials',
        slug: 'pens',
        description: 'Waterproof gel pens, rollerballs, permanent markers and pastel highlighters',
        iconName: 'Edit3',
      },
      {
        name: 'Calculators & Electronics',
        slug: 'calculators',
        description: 'University exam approved non-programmable scientific calculators',
        iconName: 'Cpu',
      },
      {
        name: 'Art & Engineering Geometry',
        slug: 'art-geometry',
        description: 'Mini drafters, geometry boxes, compass sets, and drafting tools',
        iconName: 'Compass',
      },
    ]);

    const catMap = {};
    categories.forEach((c) => (catMap[c.slug] = c._id));

    console.log('[Seed] Adding Semester 1 to 8 Lab Files & Essential Campus Stationery...');
    const productsData = [
      // ================= SEMESTER 1 =================
      {
        shopId: shop1._id,
        categoryId: catMap['lab-files'],
        semester: 1,
        title: 'Semester 1: Basic Physics & Chemistry Lab Record File (120 Pages)',
        slug: 'sem1-physics-chemistry-lab-record',
        description: 'Standard 1st Year Engineering practical record book. One side ruled and one side blank graph paper. Includes official index, rubric, and certificate pages.',
        SKU: 'LAB-SEM1-PHYCHEM',
        price: 75,
        costPrice: 45,
        currentStock: 80,
        minStockThreshold: 20,
        leadTimeDays: 2,
        safetyStock: 15,
        images: ['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&auto=format&fit=crop&q=80'],
        tags: ['semester-1', 'lab-file', 'physics', 'chemistry', 'first-year', 'bestseller'],
        isFeatured: true,
      },
      {
        shopId: shop1._id,
        categoryId: catMap['lab-files'],
        semester: 1,
        title: 'Semester 1: Engineering Graphics & CAD Drawing Sheet Binder',
        slug: 'sem1-engineering-graphics-drawing-binder',
        description: 'Landscape heavy-duty clamp binder designed specifically for A3/A4 engineering drawing plates and CAD printouts.',
        SKU: 'LAB-SEM1-EGD',
        price: 95,
        costPrice: 60,
        currentStock: 50,
        minStockThreshold: 15,
        leadTimeDays: 2,
        safetyStock: 10,
        images: ['https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&auto=format&fit=crop&q=80'],
        tags: ['semester-1', 'lab-file', 'engineering-graphics', 'drawing'],
        isFeatured: true,
      },

      // ================= SEMESTER 2 =================
      {
        shopId: shop1._id,
        categoryId: catMap['lab-files'],
        semester: 2,
        title: 'Semester 2: C Programming & Problem Solving Practical File (100 Pages)',
        slug: 'sem2-c-programming-lab-file',
        description: 'Interleaved computer laboratory file with dedicated syntax blocks, flowchart margins, and terminal output verification sheets.',
        SKU: 'LAB-SEM2-CPRG',
        price: 70,
        costPrice: 42,
        currentStock: 75,
        minStockThreshold: 20,
        leadTimeDays: 2,
        safetyStock: 15,
        images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'],
        tags: ['semester-2', 'lab-file', 'c-programming', 'coding'],
        isFeatured: true,
      },
      {
        shopId: shop1._id,
        categoryId: catMap['lab-files'],
        semester: 2,
        title: 'Semester 2: Basic Electrical & Electronics Engineering (BEEE) Lab Record',
        slug: 'sem2-beee-electrical-electronics-lab-record',
        description: '120-page university approved practical record with circuit schematic grids and verification observation tables.',
        SKU: 'LAB-SEM2-BEEE',
        price: 80,
        costPrice: 50,
        currentStock: 60,
        minStockThreshold: 15,
        leadTimeDays: 2,
        safetyStock: 12,
        images: ['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&auto=format&fit=crop&q=80'],
        tags: ['semester-2', 'lab-file', 'electrical', 'electronics'],
        isFeatured: false,
      },

      // ================= SEMESTER 3 =================
      {
        shopId: shop1._id,
        categoryId: catMap['lab-files'],
        semester: 3,
        title: 'Semester 3: Data Structures & Algorithms (DSA) Practical Record File',
        slug: 'sem3-dsa-data-structures-lab-file',
        description: '140-page high-GSM laboratory file tailored for algorithm implementations, time-complexity analysis tables, and binary tree diagrams.',
        SKU: 'LAB-SEM3-DSA',
        price: 85,
        costPrice: 52,
        currentStock: 70,
        minStockThreshold: 20,
        leadTimeDays: 2,
        safetyStock: 15,
        images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'],
        tags: ['semester-3', 'lab-file', 'dsa', 'data-structures', 'bestseller'],
        isFeatured: true,
      },
      {
        shopId: shop1._id,
        categoryId: catMap['lab-files'],
        semester: 3,
        title: 'Semester 3: Digital Electronics & Logic Design (DELD) Lab File',
        slug: 'sem3-digital-electronics-logic-design-file',
        description: 'Practical record book containing truth table templates, K-map grid folios, and IC pin-out reference sheets.',
        SKU: 'LAB-SEM3-DELD',
        price: 75,
        costPrice: 45,
        currentStock: 55,
        minStockThreshold: 15,
        leadTimeDays: 2,
        safetyStock: 10,
        images: ['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&auto=format&fit=crop&q=80'],
        tags: ['semester-3', 'lab-file', 'digital-electronics', 'logic-design'],
        isFeatured: false,
      },

      // ================= SEMESTER 4 =================
      {
        shopId: shop1._id,
        categoryId: catMap['lab-files'],
        semester: 4,
        title: 'Semester 4: Database Management Systems (DBMS) & SQL Lab File',
        slug: 'sem4-dbms-database-practical-file',
        description: '120-page lab dossier with relational schema layout grids, ER modeling stencils, and tabular query output verification sections.',
        SKU: 'LAB-SEM4-DBMS',
        price: 85,
        costPrice: 52,
        currentStock: 65,
        minStockThreshold: 15,
        leadTimeDays: 2,
        safetyStock: 12,
        images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'],
        tags: ['semester-4', 'lab-file', 'dbms', 'sql', 'database'],
        isFeatured: true,
      },
      {
        shopId: shop1._id,
        categoryId: catMap['lab-files'],
        semester: 4,
        title: 'Semester 4: Object-Oriented Programming (Java / C++) Lab Record',
        slug: 'sem4-java-oop-programming-lab-record',
        description: '140-page lab record with UML class diagram stencils, inheritance hierarchy trees, and unit-testing worksheets.',
        SKU: 'LAB-SEM4-JAVA',
        price: 85,
        costPrice: 52,
        currentStock: 65,
        minStockThreshold: 15,
        leadTimeDays: 2,
        safetyStock: 12,
        images: ['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&auto=format&fit=crop&q=80'],
        tags: ['semester-4', 'lab-file', 'java', 'oop'],
        isFeatured: false,
      },

      // ================= SEMESTER 5 =================
      {
        shopId: shop1._id,
        categoryId: catMap['lab-files'],
        semester: 5,
        title: 'Semester 5: Operating Systems & System Programming Lab File',
        slug: 'sem5-operating-systems-lab-file',
        description: 'Practical manual file with CPU scheduling Gantt chart templates, memory paging tables, and shell scripting layouts.',
        SKU: 'LAB-SEM5-OS',
        price: 85,
        costPrice: 52,
        currentStock: 60,
        minStockThreshold: 15,
        leadTimeDays: 2,
        safetyStock: 12,
        images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'],
        tags: ['semester-5', 'lab-file', 'operating-systems', 'linux'],
        isFeatured: true,
      },
      {
        shopId: shop1._id,
        categoryId: catMap['lab-files'],
        semester: 5,
        title: 'Semester 5: Computer Networks & Protocol Analysis Practical Record',
        slug: 'sem5-computer-networks-lab-record',
        description: '100-page laboratory file with Wireshark packet capture logs, IP subnetting worksheets, and network topology diagram sheets.',
        SKU: 'LAB-SEM5-CN',
        price: 80,
        costPrice: 48,
        currentStock: 55,
        minStockThreshold: 15,
        leadTimeDays: 2,
        safetyStock: 10,
        images: ['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&auto=format&fit=crop&q=80'],
        tags: ['semester-5', 'lab-file', 'computer-networks', 'networking'],
        isFeatured: false,
      },

      // ================= SEMESTER 6 =================
      {
        shopId: shop1._id,
        categoryId: catMap['lab-files'],
        semester: 6,
        title: 'Semester 6: Full-Stack Web Development & Frameworks Lab File',
        slug: 'sem6-web-technologies-lab-file',
        description: '120-page practical record with UI component wireframes, REST API request/response documentation templates, and responsive checklists.',
        SKU: 'LAB-SEM6-WEB',
        price: 90,
        costPrice: 55,
        currentStock: 50,
        minStockThreshold: 15,
        leadTimeDays: 2,
        safetyStock: 10,
        images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'],
        tags: ['semester-6', 'lab-file', 'web-development', 'react', 'node'],
        isFeatured: true,
      },
      {
        shopId: shop1._id,
        categoryId: catMap['lab-files'],
        semester: 6,
        title: 'Semester 6: Software Engineering & Agile Project Design File',
        slug: 'sem6-software-engineering-design-file',
        description: 'Comprehensive design file including SRS specification templates, Use Case diagrams, and sprint burndown charts.',
        SKU: 'LAB-SEM6-SE',
        price: 80,
        costPrice: 48,
        currentStock: 45,
        minStockThreshold: 12,
        leadTimeDays: 2,
        safetyStock: 10,
        images: ['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&auto=format&fit=crop&q=80'],
        tags: ['semester-6', 'lab-file', 'software-engineering', 'agile'],
        isFeatured: false,
      },

      // ================= SEMESTER 7 =================
      {
        shopId: shop1._id,
        categoryId: catMap['lab-files'],
        semester: 7,
        title: 'Semester 7: Artificial Intelligence & Machine Learning (AI/ML) Lab Manual',
        slug: 'sem7-ai-ml-machine-learning-lab-record',
        description: '140-page advanced laboratory dossier with model training loss curves, confusion matrices, and hyperparameter tables.',
        SKU: 'LAB-SEM7-AIML',
        price: 95,
        costPrice: 58,
        currentStock: 50,
        minStockThreshold: 15,
        leadTimeDays: 2,
        safetyStock: 12,
        images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'],
        tags: ['semester-7', 'lab-file', 'ai', 'machine-learning', 'python', 'bestseller'],
        isFeatured: true,
      },
      {
        shopId: shop1._id,
        categoryId: catMap['lab-files'],
        semester: 7,
        title: 'Semester 7: Cloud Computing & DevOps Practical Dossier',
        slug: 'sem7-cloud-devops-practical-dossier',
        description: '100-page cloud infrastructure record with Docker container worksheets and CI/CD pipeline flow diagram folios.',
        SKU: 'LAB-SEM7-CLOUD',
        price: 90,
        costPrice: 55,
        currentStock: 45,
        minStockThreshold: 12,
        leadTimeDays: 2,
        safetyStock: 10,
        images: ['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&auto=format&fit=crop&q=80'],
        tags: ['semester-7', 'lab-file', 'cloud', 'devops'],
        isFeatured: false,
      },

      // ================= SEMESTER 8 =================
      {
        shopId: shop1._id,
        categoryId: catMap['lab-files'],
        semester: 8,
        title: 'Semester 8: Major Capstone Project Hardbound Dissertation Binder',
        slug: 'sem8-major-project-hardbound-dissertation-binder',
        description: 'University standard black hardbound binder with gold-embossed spine, certificate of originality page, guide approval leaf, and 200-page capacity.',
        SKU: 'LAB-SEM8-PROJ',
        price: 160,
        costPrice: 105,
        currentStock: 40,
        minStockThreshold: 10,
        leadTimeDays: 3,
        safetyStock: 8,
        images: ['https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&auto=format&fit=crop&q=80'],
        tags: ['semester-8', 'lab-file', 'major-project', 'dissertation', 'final-year', 'bestseller'],
        isFeatured: true,
      },
      {
        shopId: shop1._id,
        categoryId: catMap['lab-files'],
        semester: 8,
        title: 'Semester 8: Final Year Technical Seminar & Comprehensive Viva Dossier',
        slug: 'sem8-viva-voce-technical-seminar-dossier',
        description: 'Clear-view presentation portfolio folder with archival sleeves for final year presentation slides, published papers, and faculty scorecards.',
        SKU: 'LAB-SEM8-VIVA',
        price: 110,
        costPrice: 70,
        currentStock: 45,
        minStockThreshold: 10,
        leadTimeDays: 2,
        safetyStock: 10,
        images: ['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&auto=format&fit=crop&q=80'],
        tags: ['semester-8', 'lab-file', 'viva', 'seminar', 'final-year'],
        isFeatured: false,
      },

      // ================= LAB ACCESSORIES =================
      {
        shopId: shop1._id,
        categoryId: catMap['lab-accessories'],
        title: 'Navneet University Practical Assignment Sheets (Pack of 100)',
        slug: 'navneet-practical-assignment-sheets-100',
        description: 'Heavy 75 GSM one-side ruled punch-hole sheets with standard margins and header line for lab experiments and assignments.',
        SKU: 'LAB-ACC-SHT100',
        price: 80,
        costPrice: 50,
        currentStock: 90,
        minStockThreshold: 25,
        leadTimeDays: 2,
        safetyStock: 20,
        images: ['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&auto=format&fit=crop&q=80'],
        tags: ['lab-accessories', 'sheets', 'assignment', 'bestseller'],
        isFeatured: true,
      },
      {
        shopId: shop1._id,
        categoryId: catMap['lab-accessories'],
        title: 'A4 Millimeter Graph Sheets (Pack of 50 Sheets)',
        slug: 'a4-millimeter-graph-sheets-pack-50',
        description: 'Accurate 1mm green grid spacing on heavy paper for mathematics, physics, and electrical laboratory curves.',
        SKU: 'LAB-ACC-GRP50',
        price: 55,
        costPrice: 32,
        currentStock: 80,
        minStockThreshold: 20,
        leadTimeDays: 2,
        safetyStock: 15,
        images: ['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80'],
        tags: ['lab-accessories', 'graph-paper'],
        isFeatured: false,
      },
      {
        shopId: shop1._id,
        categoryId: catMap['lab-accessories'],
        title: 'Solo 2-Ring Report Binder with 20 Clear Sleeves',
        slug: 'solo-2-ring-report-binder-20-sleeves',
        description: 'Durable polypropylene binder with 20 crystal-clear sleeves for certificates, report submissions, and lab assignments.',
        SKU: 'LAB-ACC-RNG20',
        price: 125,
        costPrice: 80,
        currentStock: 40,
        minStockThreshold: 15,
        leadTimeDays: 2,
        safetyStock: 10,
        images: ['https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&auto=format&fit=crop&q=80'],
        tags: ['lab-accessories', 'folder', 'binder'],
        isFeatured: false,
      },
      {
        shopId: shop1._id,
        categoryId: catMap['lab-accessories'],
        title: 'Standard Strip & Prong Clip Lab File Folder (Pack of 5)',
        slug: 'standard-strip-clip-lab-folder-pack-5',
        description: 'Color-coded flexible report folders with slide binder mechanism for college lab experiment hand-ins.',
        SKU: 'LAB-ACC-STP5',
        price: 45,
        costPrice: 25,
        currentStock: 70,
        minStockThreshold: 20,
        leadTimeDays: 2,
        safetyStock: 15,
        images: ['https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&auto=format&fit=crop&q=80'],
        tags: ['lab-accessories', 'strip-file', 'folder'],
        isFeatured: false,
      },

      // ================= CAMPUS ESSENTIAL STATIONERY =================
      {
        shopId: shop1._id,
        categoryId: catMap['calculators'],
        title: 'Casio fx-991CW ClassWiz Scientific Calculator',
        slug: 'casio-fx991cw-scientific-calculator',
        description: 'Approved for college university examinations. 540 functions, high resolution 4-gradation display.',
        SKU: 'CALC-CS-991CW',
        price: 1595,
        costPrice: 1250,
        currentStock: 15,
        minStockThreshold: 5,
        leadTimeDays: 4,
        safetyStock: 4,
        images: ['https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=600&auto=format&fit=crop&q=80'],
        tags: ['calculator', 'engineering', 'exam-essential', 'bestseller'],
        isFeatured: true,
      },
      {
        shopId: shop1._id,
        categoryId: catMap['pens'],
        title: 'Reynolds Trimax Liquid Gel Pen (Blue, Pack of 5)',
        slug: 'reynolds-trimax-gel-blue-pack-5',
        description: 'Max write length with waterproof ink, smudge-free 0.5mm needle tip for fast lab writing & exams.',
        SKU: 'PEN-TMX-BL5',
        price: 250,
        costPrice: 180,
        currentStock: 40,
        minStockThreshold: 15,
        leadTimeDays: 2,
        safetyStock: 10,
        images: ['https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80'],
        tags: ['pens', 'bestseller', 'exam-essential'],
        isFeatured: true,
      },
      {
        shopId: shop1._id,
        categoryId: catMap['notebooks'],
        title: 'Classmate Spiral Bound Long Notebook (300 Pages)',
        slug: 'classmate-spiral-long-300-pages',
        description: 'Single line premium ozone-treated paper, 300 pages, perforated sheets for clean tear-off.',
        SKU: 'NB-CLM-300',
        price: 95,
        costPrice: 65,
        currentStock: 60,
        minStockThreshold: 20,
        leadTimeDays: 2,
        safetyStock: 15,
        images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'],
        tags: ['notebook', 'essential'],
        isFeatured: false,
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
        currentStock: 25,
        minStockThreshold: 8,
        leadTimeDays: 3,
        safetyStock: 6,
        images: ['https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&auto=format&fit=crop&q=80'],
        tags: ['engineering', 'drawing', 'drafter'],
        isFeatured: false,
      },
    ];

    const createdProducts = await Product.create(productsData);

    console.log('[Seed] Creating initial inventory ledger records for all products...');
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
        notes: 'Initial catalog stock for semester session',
      });
    }

    console.log('[Seed] Creating academic calendar events for examination demand...');
    const now = new Date();
    const midTermStart = new Date(now);
    midTermStart.setDate(now.getDate() + 10);
    const midTermEnd = new Date(midTermStart);
    midTermEnd.setDate(midTermStart.getDate() + 7);

    const labPracticalStart = new Date(now);
    labPracticalStart.setDate(now.getDate() + 25);
    const labPracticalEnd = new Date(labPracticalStart);
    labPracticalEnd.setDate(labPracticalStart.getDate() + 10);

    const endSemStart = new Date(now);
    endSemStart.setDate(now.getDate() + 45);
    const endSemEnd = new Date(endSemStart);
    endSemEnd.setDate(endSemStart.getDate() + 15);

    await AcademicCalendar.create([
      {
        eventTitle: 'Mid-Semester Examinations 2026',
        eventType: 'MID_TERM_EXAMS',
        startDate: midTermStart,
        endDate: midTermEnd,
        description: 'University mid-term theory tests across all engineering branches.',
        impactCategory: 'EXAM_STATIONERY',
        isActive: true,
      },
      {
        eventTitle: 'Semester End Laboratory & Practical Viva-Voce Sessions',
        eventType: 'PROJECT_SUBMISSION',
        startDate: labPracticalStart,
        endDate: labPracticalEnd,
        description: 'Submission and verification of Semester 1 to 8 Laboratory Records & Manuals.',
        impactCategory: 'PROJECT_PRINTING',
        isActive: true,
      },
      {
        eventTitle: 'End Semester University Theory Examinations',
        eventType: 'END_SEM',
        startDate: endSemStart,
        endDate: endSemEnd,
        description: 'Final university semester examinations.',
        impactCategory: 'EXAM_STATIONERY',
        isActive: true,
      },
    ]);

    console.log('\n======================================================');
    console.log(' CAMPUSCART AI — DATABASE SEEDING COMPLETED CLEANLY');
    console.log('======================================================');
    console.log('Total Products Created: ', createdProducts.length);
    console.log('Lab Files for Semesters 1 to 8: All Loaded');
    console.log('Old Fake Orders & Print Jobs: Completely Cleared!');
    console.log('\nDemo User Accounts:');
    console.log('Student:        student@campuscart.edu       / Campus@123');
    console.log('Shop Owner:     vendor@campuscart.edu        / Campus@123');
    console.log('Print Hub:      printvendor@campuscart.edu   / Campus@123');
    console.log('Delivery Agent: delivery@campuscart.edu      / Campus@123');
    console.log('Administrator:  admin@campuscart.edu         / Campus@123');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
