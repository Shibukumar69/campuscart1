# CampusCart AI — Database Design

Database Engine: **MongoDB** with Mongoose ODM schemas, compound indexes, and atomic updates.

---

## 1. Core Schema Architecture

### User
```typescript
{
  name: String,
  email: String (unique, indexed),
  passwordHash: String (select: false),
  role: 'STUDENT' | 'SHOP_OWNER' | 'DELIVERY_AGENT' | 'ADMIN',
  collegeId: String,
  hostelBlock: String,
  roomNumber: String,
  addresses: [{ hostelBlock, roomNumber, campusLandmark, isDefault }],
  isActive: Boolean,
  refreshTokens: [{ token, createdAt }]
}
```

### Product
```typescript
{
  shopId: ObjectId (ref: 'Shop', index: true),
  categoryId: ObjectId (ref: 'Category', index: true),
  title: String,
  slug: String,
  description: String,
  SKU: String,
  price: Number,
  costPrice: Number,
  currentStock: Number,
  minStockThreshold: Number,
  leadTimeDays: Number,
  safetyStock: Number,
  images: [String],
  tags: [String],
  isActive: Boolean
}
```
*Compound Index*: `{ shopId: 1, SKU: 1 }` (unique), `{ title: 'text', description: 'text' }`.

### InventoryLedger
```typescript
{
  productId: ObjectId (ref: 'Product', index: true),
  shopId: ObjectId (ref: 'Shop', index: true),
  transactionType: 'RESTOCK' | 'ORDER_DEDUCTION' | 'RETURN' | 'ADJUSTMENT',
  quantityChanged: Number,
  balanceBefore: Number,
  balanceAfter: Number,
  referenceType: 'ORDER' | 'PURCHASE_ORDER' | 'MANUAL_COUNT' | 'INITIAL_STOCK',
  referenceId: String,
  performedBy: ObjectId (ref: 'User'),
  notes: String,
  createdAt: Date (index: true)
}
```

### Order
```typescript
{
  orderNumber: String (unique, index: true),
  studentId: ObjectId (ref: 'User', index: true),
  shopId: ObjectId (ref: 'Shop', index: true),
  items: [{ productId, productTitleSnapshot, skuSnapshot, quantity, unitPriceSnapshot, lineTotal }],
  subtotal: Number,
  deliveryFee: Number,
  totalAmount: Number,
  paymentMethod: 'COD' | 'SANDBOX',
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED',
  deliveryType: 'HOSTEL_DELIVERY' | 'SELF_PICKUP',
  deliveryAddressSnapshot: { recipientName, phone, hostelBlock, roomNumber, campusLandmark },
  deliveryAgentId: ObjectId (ref: 'User', index: true),
  deliveryOtpHash: String (select: false),
  status: 'PLACED' | 'ACCEPTED' | 'PREPARING' | 'READY_FOR_PICKUP' | 'OUT_FOR_DELIVERY' | 'COMPLETED' | 'CANCELLED' | 'REJECTED',
  statusTimeline: [{ status, timestamp, note, changedBy }]
}
```

### PrintJob
```typescript
{
  jobCode: String (unique, index: true),
  studentId: ObjectId (ref: 'User', index: true),
  shopId: ObjectId (ref: 'Shop', index: true),
  originalFileName: String,
  storedFileName: String,
  filePath: String,
  pageCount: Number,
  copies: Number,
  printColor: 'BW' | 'COLOR',
  paperSize: 'A4' | 'A3',
  sides: 'SINGLE' | 'DOUBLE',
  bindingType: 'NONE' | 'STAPLE' | 'SPIRAL' | 'HARDBOUND',
  estimatedPrice: Number,
  finalPrice: Number,
  status: 'SUBMITTED' | 'ACCEPTED' | 'PRINTING' | 'READY_FOR_PICKUP' | 'DELIVERED' | 'REJECTED'
}
```

### AcademicCalendar
```typescript
{
  eventTitle: String,
  eventType: 'MID_TERM_EXAMS' | 'END_SEM' | 'INTERNAL_ASSESSMENT' | 'PROJECT_SUBMISSION' | 'HOLIDAY' | 'OTHER',
  startDate: Date (index: true),
  endDate: Date,
  impactCategory: 'EXAM_STATIONERY' | 'PROJECT_PRINTING' | 'GENERAL',
  isActive: Boolean
}
```
