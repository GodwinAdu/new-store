# Requirements Document

## Introduction

This feature modernizes and streamlines the existing Point of Sale (POS) system. The current POS has several pain points: duplicate analytics panels (`pos-analytics.tsx` and `sales-reporting.tsx` both show the same summary cards), a standalone `inventory-management.tsx` tab that duplicates the main inventory module, mock/hardcoded data scattered across components, a cluttered navigation bar with too many tabs, and a receipt workflow that opens a raw `window.open` popup instead of an in-app preview. The goal is to consolidate redundant screens, elevate the visual design to a modern, focused cashier interface, and ensure every interaction is fast and keyboard-friendly.

## Glossary

- **POS_Interface**: The main point-of-sale screen where cashiers ring up products and process payments.
- **Cart**: The in-progress list of items a cashier has added for the current transaction.
- **Transaction**: A completed sale record stored in the database.
- **Receipt**: The printed or digital proof of a completed transaction.
- **Quick_Actions_Bar**: The toolbar below the top navigation that provides one-click access to calculator, no-sale drawer open, and last-receipt reprint.
- **Product_Grid**: The scrollable grid of product cards on the left side of the POS_Interface.
- **Order_Panel**: The right-side panel showing the Cart, payment controls, and checkout button.
- **Sales_Tab**: The consolidated tab that replaces the old "Sales" and separate analytics views, showing today's transactions and summary metrics.
- **Customers_Tab**: The tab for managing customer profiles and loyalty points.
- **Warehouse_Selector**: The dropdown that lets a cashier choose which warehouse's stock to sell from.
- **Payment_Modal**: The full-screen overlay that appears when the cashier clicks "Charge", collecting payment method and amount before confirming the sale.
- **Receipt_Preview**: The in-app dialog that shows a formatted receipt after a sale completes, replacing the raw `window.open` popup.
- **Notification_Badge**: The red dot on the bell icon showing unread alert count.
- **Low_Stock_Alert**: A system notification triggered when a product's stock falls at or below its minimum threshold.

---

## Requirements

### Requirement 1: Consolidated Navigation Structure

**User Story:** As a cashier, I want a clean, minimal navigation bar with only the tabs I actually use during a shift, so that I can switch between tasks without cognitive overload.

#### Acceptance Criteria

1. THE POS_Interface SHALL display exactly three top-level navigation tabs: "Sale", "Sales History", and "Customers".
2. WHEN the current navigation renders an "Analytics" or "Inventory" tab, THE POS_Interface SHALL remove those tabs from the navigation bar.
3. THE POS_Interface SHALL preserve the top bar elements: store logo/name, live clock, online/offline badge, notification bell, and user menu.
4. WHEN the screen width is below 768px, THE POS_Interface SHALL collapse the tab labels and show only icons, maintaining full functionality.
5. WHEN a tab is active, THE POS_Interface SHALL highlight it with a bottom border in the primary brand color and keep all other tabs visually neutral.

---

### Requirement 2: Modern Product Grid with Fast Search

**User Story:** As a cashier, I want to find and add products quickly using search or category filters, so that I can serve customers without delays.

#### Acceptance Criteria

1. THE Product_Grid SHALL display products as cards with product name, price, stock badge, and a one-tap "Add" affordance.
2. WHEN a cashier types in the search field, THE Product_Grid SHALL filter visible products to those whose name or SKU contains the search string, updating results within 300ms of the last keystroke.
3. WHEN a product's stock is zero, THE Product_Grid SHALL render that product card in a visually disabled state and prevent it from being added to the Cart.
4. WHEN a product has multiple units defined, THE Product_Grid SHALL open a unit-selection dialog before adding the item to the Cart.
5. THE Product_Grid SHALL display a category filter row above the grid; WHEN a category is selected, THE Product_Grid SHALL show only products belonging to that category.
6. WHEN no products match the active search or category filter, THE Product_Grid SHALL display an empty-state message with a suggestion to clear the filter.
7. WHEN the Warehouse_Selector value changes, THE Product_Grid SHALL reload products from the newly selected warehouse within 1 second.

---

### Requirement 3: Streamlined Order Panel

**User Story:** As a cashier, I want the order panel to show the cart clearly and let me adjust quantities or remove items without extra dialogs, so that I can correct mistakes fast.

#### Acceptance Criteria

1. THE Order_Panel SHALL display each Cart item with: product name, unit label (if applicable), quantity controls (increment/decrement), unit price, line total, and a remove button.
2. WHEN a cashier taps the increment button on a Cart item, THE Order_Panel SHALL increase that item's quantity by one, provided the new quantity does not exceed available stock.
3. WHEN a cashier taps the decrement button and the quantity is greater than one, THE Order_Panel SHALL decrease that item's quantity by one.
4. WHEN a cashier taps the decrement button and the quantity equals one, THE Order_Panel SHALL remove the item from the Cart.
5. THE Order_Panel SHALL display a running subtotal, discount amount, tax amount, and grand total that update immediately on every Cart change.
6. WHEN the Cart is empty, THE Order_Panel SHALL display an empty-state illustration and disable the "Charge" button.
7. WHEN a discount percentage is entered, THE Order_Panel SHALL compute and display the discount amount in real time without requiring a separate confirmation step.
8. WHEN a tax rate is entered, THE Order_Panel SHALL compute and display the tax amount in real time.
9. THE Order_Panel SHALL provide a "Clear Cart" button that removes all items after a single confirmation prompt.

---

### Requirement 4: Payment Modal with Streamlined Checkout

**User Story:** As a cashier, I want a focused payment screen that guides me through collecting payment and confirming the sale, so that I make fewer errors at checkout.

#### Acceptance Criteria

1. WHEN the cashier clicks "Charge", THE Payment_Modal SHALL open as a full-screen overlay displaying the grand total prominently.
2. THE Payment_Modal SHALL offer three payment method options: Cash, Card, and Mobile Money.
3. WHEN "Cash" is selected, THE Payment_Modal SHALL display a numeric input for cash received and SHALL compute and display the change amount in real time.
4. WHEN the cash received amount is less than the grand total, THE Payment_Modal SHALL disable the "Confirm Payment" button and display an inline error indicating the shortfall.
5. WHEN "Card" or "Mobile Money" is selected, THE Payment_Modal SHALL hide the cash-received input and set the received amount equal to the grand total automatically.
6. WHEN the cashier confirms payment, THE Payment_Modal SHALL call the sale processing API, show a loading state on the confirm button, and prevent duplicate submissions.
7. WHEN the sale API returns success, THE Payment_Modal SHALL close and THE Receipt_Preview SHALL open automatically.
8. IF the sale API returns an error, THEN THE Payment_Modal SHALL display the error message inline and allow the cashier to retry without re-entering payment details.
9. THE Payment_Modal SHALL support keyboard navigation: Tab to move between fields, Enter to confirm, Escape to cancel.

---

### Requirement 5: In-App Receipt Preview

**User Story:** As a cashier, I want to preview, print, and share receipts inside the app rather than in a browser popup, so that the workflow feels integrated and professional.

#### Acceptance Criteria

1. THE Receipt_Preview SHALL render inside a Dialog component, not in a `window.open` popup.
2. THE Receipt_Preview SHALL display: store name, warehouse name/location, receipt number, date/time, cashier name, itemized list with quantities and prices, subtotal, discount, tax, total, payment method, cash received and change (when applicable), and customer name (when a customer is attached).
3. WHEN the cashier clicks "Print", THE Receipt_Preview SHALL trigger the browser print dialog scoped to the receipt content only, leaving the rest of the UI unaffected.
4. WHEN the cashier clicks "Download", THE Receipt_Preview SHALL generate and download a plain-text receipt file named `receipt-{receiptNumber}.txt`.
5. WHEN a customer with an email address is attached to the sale, THE Receipt_Preview SHALL display an "Email Receipt" button; WHEN clicked, THE Receipt_Preview SHALL call the email API and show a success or error toast.
6. WHEN the cashier closes the Receipt_Preview, THE POS_Interface SHALL return focus to the product search field, ready for the next transaction.
7. THE Receipt_Preview SHALL display the customer's earned loyalty points for the transaction when a customer is attached.

---

### Requirement 6: Consolidated Sales History Tab

**User Story:** As a cashier or manager, I want a single "Sales History" tab that shows today's transactions with summary metrics, so that I don't have to navigate between multiple screens to review sales.

#### Acceptance Criteria

1. THE Sales_Tab SHALL display three summary metric cards at the top: today's total revenue, total transaction count, and average order value — all sourced from live API data, not mock values.
2. WHEN the Sales_Tab loads, THE Sales_Tab SHALL fetch today's transactions from the API and display them in a scrollable list sorted by most recent first.
3. WHEN a transaction row is expanded or clicked, THE Sales_Tab SHALL show the full item breakdown, payment method, cashier name, and a "Reprint Receipt" button.
4. WHEN the cashier clicks "Reprint Receipt" on a transaction, THE Receipt_Preview SHALL open with that transaction's data.
5. WHEN the cashier clicks "Void" on a transaction, THE Sales_Tab SHALL open a confirmation dialog requiring a text reason before calling the void API.
6. IF the void API call fails, THEN THE Sales_Tab SHALL display an error toast and keep the transaction in the list unchanged.
7. THE Sales_Tab SHALL remove the duplicate `pos-analytics.tsx` component and the `sales-reporting.tsx` component from the navigation; their summary metrics SHALL be absorbed into the Sales_Tab header cards.

---

### Requirement 7: Customer Quick-Attach During Sale

**User Story:** As a cashier, I want to attach a customer to the current transaction directly from the Order Panel without navigating away, so that loyalty points are captured on every eligible sale.

#### Acceptance Criteria

1. THE Order_Panel SHALL display a "Add Customer" button that opens an inline search popover.
2. WHEN the cashier types at least 2 characters in the customer search popover, THE Order_Panel SHALL display matching customers by name, phone, or email within 300ms.
3. WHEN a customer is selected, THE Order_Panel SHALL display the customer's name and current loyalty point balance in the Order_Panel header area.
4. WHEN a sale is completed with an attached customer, THE POS_Interface SHALL automatically award loyalty points equal to the integer floor of the transaction total.
5. WHEN the cashier clicks the attached customer's name, THE Order_Panel SHALL allow removing the customer from the current transaction.
6. THE Order_Panel SHALL provide a "New Customer" shortcut inside the search popover that opens the customer creation form in a dialog without navigating away from the POS_Interface.

---

### Requirement 8: Quick Actions Bar

**User Story:** As a cashier, I want one-click access to the calculator, cash drawer (no-sale), and last receipt reprint, so that common non-sale actions don't interrupt my workflow.

#### Acceptance Criteria

1. THE Quick_Actions_Bar SHALL be displayed below the top navigation bar and above the main content area on the POS "Sale" tab only.
2. THE Quick_Actions_Bar SHALL contain exactly three actions: "Calculator", "No Sale" (open cash drawer), and "Last Receipt".
3. WHEN the cashier clicks "Calculator", THE POS_Interface SHALL open the built-in calculator dialog.
4. WHEN the cashier clicks "No Sale", THE POS_Interface SHALL open the no-sale reason dialog and, upon confirmation, record the cash drawer event via the API.
5. WHEN the cashier clicks "Last Receipt", THE POS_Interface SHALL open the Receipt_Preview with the most recent completed transaction's data.
6. IF no transactions have been completed in the current session, THEN clicking "Last Receipt" SHALL display a toast message stating "No recent sale to reprint".

---

### Requirement 9: Low Stock Notifications

**User Story:** As a cashier, I want to be notified when a product I just sold drops to or below its minimum stock threshold, so that I can alert the manager before the item runs out.

#### Acceptance Criteria

1. WHEN a sale is processed and any sold product's remaining stock is at or below its minimum stock threshold, THE POS_Interface SHALL increment the Notification_Badge count by one for each such product.
2. WHEN the cashier clicks the notification bell, THE POS_Interface SHALL display a dropdown listing each Low_Stock_Alert with the product name and current stock level.
3. WHEN a Low_Stock_Alert is dismissed by the cashier, THE POS_Interface SHALL remove it from the dropdown and decrement the Notification_Badge count.
4. THE POS_Interface SHALL persist Low_Stock_Alert items across tab switches within the same session so that alerts are not lost when the cashier navigates to Sales History or Customers.

---

### Requirement 10: Removal of Redundant Components

**User Story:** As a developer, I want the POS codebase to be free of duplicate and unused components, so that future changes are made in one place and the bundle stays lean.

#### Acceptance Criteria

1. THE POS_Interface SHALL NOT render `pos-analytics.tsx` as a standalone tab or panel; its real-time metric data SHALL be surfaced in the Sales_Tab header cards instead.
2. THE POS_Interface SHALL NOT render `inventory-management.tsx` as a POS tab; inventory management SHALL remain accessible only through the main dashboard inventory module.
3. THE POS_Interface SHALL NOT use `window.open` for receipt rendering; all receipt display SHALL use the Receipt_Preview dialog.
4. THE POS_Interface SHALL NOT display hardcoded mock data in any user-visible component; all displayed figures SHALL be sourced from API calls or derived from live Cart state.
5. THE `sales-reporting.tsx` component SHALL be consolidated into the Sales_Tab; its standalone route or tab entry SHALL be removed from the POS navigation.
