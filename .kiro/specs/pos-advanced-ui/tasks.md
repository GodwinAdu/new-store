# Tasks

## Task List

- [x] 1 Set up testing infrastructure
  - [x] 1.1 Install Vitest, React Testing Library, and fast-check dev dependencies
  - [x] 1.2 Create vitest.config.ts with jsdom environment and Next.js plugin
  - [x] 1.3 Add test script to package.json (`"test": "vitest --run"`)

- [x] 2 Create utility and store foundations
  - [x] 2.1 Create `lib/utils/receipt-utils.ts` with `buildReceiptData` pure function
  - [x] 2.2 Extend `lib/store/pos-store.ts` with `lowStockAlerts` slice (add, dismiss, clear — not persisted)
  - [x] 2.3 Write unit tests for `buildReceiptData` in `__tests__/utils/receipt-utils.test.ts`
  - [x] 2.4 Write property tests for POS store computed values (totals, discount, tax, change) in `__tests__/pos/pos-store.test.ts`

- [x] 3 Implement `ReceiptPreview` component
  - [x] 3.1 Create `components/pos/receipt-preview.tsx` as a Dialog-based component accepting `ReceiptData` prop
  - [x] 3.2 Implement Print action using scoped `@media print` CSS (no `window.open`)
  - [x] 3.3 Implement Download action generating `receipt-{receiptNumber}.txt`
  - [x] 3.4 Implement conditional Email Receipt button (visible only when `customer.email` is present)
  - [x] 3.5 Display loyalty points earned when a customer is attached
  - [x] 3.6 Return focus to product search field on dialog close
  - [x] 3.7 Write property tests for receipt completeness and email button visibility in `__tests__/pos/receipt-preview.test.ts`

- [x] 4 Implement `PaymentModal` component
  - [x] 4.1 Create `components/pos/payment-modal.tsx` as a full-screen Dialog overlay
  - [x] 4.2 Implement three payment method options: Cash, Card, Mobile Money
  - [x] 4.3 Implement real-time change calculation for Cash payment method
  - [x] 4.4 Disable confirm button and show inline error when cash received < total
  - [x] 4.5 Hide cash-received input and auto-set amount for Card/Mobile Money
  - [x] 4.6 Implement loading state on confirm button and prevent duplicate submissions
  - [x] 4.7 Implement keyboard navigation: Tab between fields, Enter to confirm, Escape to cancel
  - [x] 4.8 Display inline error message on API failure without closing the modal
  - [x] 4.9 Write property tests for cash change calculation, insufficient cash validation, and duplicate submission prevention in `__tests__/pos/payment-modal.test.ts`

- [x] 5 Implement `ProductGrid` component
  - [x] 5.1 Extract product grid from `app/(pos)/pos/page.tsx` into `components/pos/product-grid.tsx`
  - [x] 5.2 Render product cards with name, price, stock badge (green/yellow/red), and Add button
  - [x] 5.3 Implement disabled state for zero-stock products (opacity-50, pointer-events-none, blocked add)
  - [x] 5.4 Implement debounced search filtering (name or SKU, ≤300ms debounce)
  - [x] 5.5 Implement category filter row above the grid
  - [x] 5.6 Display empty-state message with clear-filter suggestion when no products match
  - [x] 5.7 Reload products when Warehouse_Selector changes
  - [x] 5.8 Write property tests for search filter correctness, zero-stock blocking, and category filter in `__tests__/pos/product-grid.test.ts`

- [x] 6 Implement `OrderPanel` component
  - [x] 6.1 Extract order panel from `app/(pos)/pos/page.tsx` into `components/pos/order-panel.tsx`
  - [x] 6.2 Render each cart item with name, unit label, quantity controls, unit price, line total, and remove button
  - [x] 6.3 Implement increment (capped at stock) and decrement (removes at quantity=1) buttons
  - [x] 6.4 Display running subtotal, discount amount, tax amount, and grand total updating on every cart change
  - [x] 6.5 Show empty-state illustration and disable Charge button when cart is empty
  - [x] 6.6 Implement Clear Cart button with single confirmation prompt
  - [x] 6.7 Integrate `CustomerSearchPopover` for attaching a customer to the transaction
  - [x] 6.8 Display attached customer name and loyalty point balance in the panel header
  - [x] 6.9 Write property tests for quantity increment/decrement behavior in `__tests__/pos/order-panel.test.ts`

- [x] 7 Implement `CustomerSearchPopover` component
  - [x] 7.1 Create `components/pos/customer-search-popover.tsx` as an inline Popover
  - [x] 7.2 Filter customers by name, phone, or email after 2+ characters typed (≤300ms debounce)
  - [x] 7.3 Allow removing the attached customer by clicking their name
  - [x] 7.4 Add "New Customer" shortcut that opens customer creation dialog without navigating away
  - [x] 7.5 Write property tests for customer search filter correctness in `__tests__/pos/customer-search-popover.test.ts`

- [x] 8 Implement `QuickActionsBar` component
  - [x] 8.1 Create `components/pos/quick-actions-bar.tsx` with exactly three buttons: Calculator, No Sale, Last Receipt
  - [x] 8.2 Wire Calculator button to open the existing calculator dialog
  - [x] 8.3 Wire No Sale button to open the no-sale reason dialog and call `recordNoSale` API on confirmation
  - [x] 8.4 Wire Last Receipt button to open `ReceiptPreview` with the most recent transaction; show toast if none exists
  - [x] 8.5 Write example-based tests for Quick Actions Bar in `__tests__/pos/quick-actions-bar.test.ts`

- [x] 9 Implement `ConsolidatedSalesTab` component
  - [x] 9.1 Create `components/pos/consolidated-sales-tab.tsx` replacing `SalesHistory`, `SalesComplete`, and `SalesReporting`
  - [x] 9.2 Fetch and display three summary metric cards from `getTodayStats()` (revenue, transaction count, avg order value)
  - [x] 9.3 Fetch and display today's transactions from `getTodaySales()` sorted most-recent-first
  - [x] 9.4 Implement expand/collapse per transaction row showing item breakdown, payment method, cashier name
  - [x] 9.5 Add "Reprint Receipt" button per transaction that opens `ReceiptPreview` with that transaction's data
  - [x] 9.6 Add "Void" button per transaction that opens a confirmation dialog requiring a text reason before calling `voidSale()`
  - [x] 9.7 Show error toast and keep transaction in list if `voidSale` API call fails
  - [x] 9.8 Write property test for transaction sort order and example tests for void flow in `__tests__/pos/consolidated-sales-tab.test.ts`

- [x] 10 Update `POSLayout` and navigation structure
  - [x] 10.1 Update `components/pos/pos-layout.tsx` to display exactly three tabs: "Sale", "Sales History", "Customers"
  - [x] 10.2 Remove "Analytics" and "Inventory" tabs from the navigation
  - [x] 10.3 Render `QuickActionsBar` only on the "Sale" tab, between tab nav and main content
  - [x] 10.4 Add `lowStockAlerts` state from the Zustand store to the notification bell
  - [x] 10.5 Implement notification bell dropdown listing each `LowStockAlert` with product name and stock level
  - [x] 10.6 Implement dismiss action per alert (removes from list, decrements badge count)
  - [x] 10.7 Collapse tab labels to icons on screens narrower than 768px
  - [x] 10.8 Write property tests for low-stock badge count, alert dismissal, and alert persistence across tab switches in `__tests__/pos/pos-layout.test.ts`

- [-] 11 Update `app/(pos)/pos/page.tsx` — wire everything together
  - [x] 11.1 Replace inline product grid and order panel with `ProductGrid` and `OrderPanel` components
  - [x] 11.2 Replace inline payment section with `PaymentModal` triggered by the Charge button
  - [x] 11.3 Replace all `window.open` receipt calls with `ReceiptPreview` dialog
  - [x] 11.4 After `processSale` succeeds, check each sold product's remaining stock and call `addLowStockAlert` for products at or below `minStock`
  - [x] 11.5 Award loyalty points via `updateCustomerPoints` using `Math.floor(total)` when a customer is attached
  - [x] 11.6 Pass `onReprintReceipt` callback to `ConsolidatedSalesTab` so it can open `ReceiptPreview`

- [x] 12 Remove redundant components
  - [x] 12.1 Remove `pos-analytics.tsx` from the POS navigation (file can be kept for dashboard use but must not be rendered as a POS tab)
  - [x] 12.2 Remove `inventory-management.tsx` from the POS navigation
  - [x] 12.3 Remove `sales-reporting.tsx` from the POS navigation (consolidate into `ConsolidatedSalesTab`)
  - [x] 12.4 Audit all user-visible POS components for hardcoded mock data and replace with API calls or live cart state
  - [x] 12.5 Verify no `window.open` calls remain in any POS component

- [x] 13 Final verification
  - [x] 13.1 Run `npm run build` and confirm zero TypeScript errors
  - [x] 13.2 Run `npm test` and confirm all property tests and unit tests pass
  - [x] 13.3 Manually verify the full sale flow: select warehouse → add products → attach customer → charge → payment modal → receipt preview → print/download
  - [x] 13.4 Manually verify the Sales History tab shows live data and void flow works end-to-end
  - [x] 13.5 Manually verify low-stock notifications appear after a sale and persist across tab switches
