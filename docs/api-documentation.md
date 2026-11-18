# CampusCart AI — API Documentation

Base URL: `http://localhost:5000/api`

## Authentication (`/api/auth`)
- `POST /register`: Register user account (`name`, `email`, `password`, `role`, `hostelBlock`, `roomNumber`).
- `POST /login`: Authenticate with password and receive `accessToken` & `refreshToken`.
- `POST /refresh`: Issue new access token.
- `POST /logout`: Invalidate session and clear refresh token.
- `GET /me`: Return authenticated profile and attached shop details.
- `POST /forgot-password`: Send 6-digit verification code to user's registered Gmail (`email`).
- `POST /verify-reset-otp`: Validate 6-digit code against SHA-256 hash (`email`, `otp`).
- `POST /reset-password`: Update account password with verified OTP (`email`, `otp`, `newPassword`).
- `POST /send-login-otp`: Send passwordless sign-in code to user's Gmail (`email`).
- `POST /login-otp`: Authenticate directly with 6-digit Gmail code (`email`, `otp`).

## Products & Catalog (`/api/products`)
- `GET /`: List products with search, category filtering, inStockOnly, and sorting.
- `GET /categories`: Retrieve active stationery categories.
- `GET /:productId`: Fetch individual product details.
- `POST /`: Create product (Authorized: Shop Owner / Admin).
- `PATCH /:productId`: Update product (Authorized: Shop Owner / Admin).
- `DELETE /:productId`: Soft-delete product.

## Inventory Management (`/api/inventory`)
- `GET /`: Get shop inventory with calculated `stockHealth` (HEALTHY, WARNING, CRITICAL).
- `GET /low-stock`: Get items below safety thresholds.
- `GET /ledger`: Fetch immutable audit transaction log.
- `POST /restock`: Add units to stock with auditable ledger entry.
- `POST /adjust`: Adjust inventory balance with reason.

## Orders & Deliveries (`/api/orders`)
- `POST /`: Atomically create order with stock deduplication and OTP generation.
- `GET /my`: Student order history.
- `GET /shop`: Shop incoming orders.
- `GET /assigned-deliveries`: Delivery agent courier list.
- `PATCH /:orderId/status`: Update status lifecycle.
- `POST /:orderId/verify-otp`: Verify student 6-digit OTP and complete handover.

## Smart Printing & Xerox (`/api/print-jobs`)
- `GET /rate-card`: Configurable printing price table.
- `POST /`: Upload PDF document with print specifications.
- `GET /my`: Student print jobs.
- `GET /queue`: Vendor print queue.
- `PATCH /:jobId/status`: Update printing status.
- `GET /:jobId/download`: Authenticated document download stream.

## Machine Learning & Advisory (`/api/ml`)
- `GET /forecast/:productId`: Retrieve 7-day and 30-day predicted daily demand.
- `GET /recommendations`: Get AI suggested purchase quantities.
- `POST /purchase-order`: Generate draft purchase order from recommendations.
- `POST /train`: Retrain estimator model.

## Admin Controls (`/api/admin`)
- `GET /stats`: Aggregated platform GMV, commissions, and completion rates.
- `GET /users`: User directory with moderation tools.
- `PATCH /users/:userId`: Suspend or activate accounts.
- `GET /vendors/pending`: Pending merchant applications.
- `PATCH /vendors/:shopId/approval`: Approve or reject shop.
- `GET /audit-logs`: Privileged system events.
