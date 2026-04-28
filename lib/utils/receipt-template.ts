export function generateReceiptHTML(receiptData: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt - ${receiptData.verificationCode}</title>
      <style>
        body { font-family: 'Courier New', monospace; margin: 0; padding: 20px; background: white; }
        .receipt { max-width: 300px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 18px; }
        .header p { margin: 2px 0; font-size: 12px; color: #666; }
        .verification-box { 
          margin: 15px 0; 
          padding: 15px; 
          background: #f8f8f8; 
          border: 2px dashed #333; 
          text-align: center;
          border-radius: 8px;
        }
        .verification-title { 
          font-size: 11px; 
          font-weight: bold; 
          margin-bottom: 8px; 
          color: #666;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .verification-code { 
          font-size: 18px; 
          font-weight: bold; 
          letter-spacing: 3px; 
          font-family: monospace;
          color: #000;
          margin: 8px 0;
        }
        .verification-note { 
          font-size: 9px; 
          color: #666; 
          margin-top: 8px;
          line-height: 1.4;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          background: #fbbf24;
          color: #000;
          font-size: 10px;
          font-weight: bold;
          border-radius: 4px;
          margin-top: 5px;
        }
        .divider { border-top: 1px dashed #999; margin: 10px 0; }
        .row { display: flex; justify-content: space-between; margin: 2px 0; font-size: 12px; }
        .item { margin-bottom: 8px; }
        .item-name { font-weight: bold; }
        .item-details { font-size: 11px; color: #666; margin-left: 10px; }
        .total-row { font-weight: bold; font-size: 14px; }
        .footer { text-align: center; margin-top: 20px; font-size: 11px; color: #666; }
        .important-note {
          background: #fff3cd;
          border: 1px solid #ffc107;
          padding: 10px;
          margin: 15px 0;
          border-radius: 4px;
          font-size: 10px;
          text-align: center;
        }
        @media print { 
          body { margin: 0; }
          .verification-box { background: #f0f0f0; }
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <h1>MODERN POS</h1>
          <p>${receiptData.warehouse?.name || 'Main Store'}</p>
          <p>${receiptData.warehouse?.location || 'Location'}</p>
        </div>
        
        <div class="verification-box">
          <div class="verification-title">⚠ Verification Required</div>
          <div class="verification-code">${receiptData.verificationCode}</div>
          <div class="status-badge">PENDING VERIFICATION</div>
          <div class="verification-note">
            Present this code to accounts department<br/>
            for payment verification and approval
          </div>
        </div>
        
        <div class="divider"></div>
        <div class="row"><span>Receipt #:</span><span>${receiptData.receiptNumber}</span></div>
        <div class="row"><span>Date:</span><span>${new Date(receiptData.timestamp).toLocaleString()}</span></div>
        ${receiptData.customer ? `<div class="row"><span>Customer:</span><span>${receiptData.customer.name}</span></div>` : ''}
        <div class="row"><span>Cashier:</span><span>${receiptData.cashier}</span></div>
        <div class="divider"></div>
        
        ${receiptData.items.map(item => `
          <div class="item">
            <div class="row">
              <span class="item-name">${item.name}</span>
              <span>₵${(item.unitPrice * item.quantity).toFixed(2)}</span>
            </div>
            <div class="item-details">
              ${item.quantity} x ₵${item.unitPrice.toFixed(2)}${item.selectedUnit ? ` (${item.selectedUnit.name})` : ''}
            </div>
          </div>
        `).join('')}
        
        <div class="divider"></div>
        <div class="row"><span>Subtotal:</span><span>₵${receiptData.subtotal.toFixed(2)}</span></div>
        ${receiptData.discount > 0 ? `<div class="row" style="color: green;"><span>Discount:</span><span>-₵${receiptData.discount.toFixed(2)}</span></div>` : ''}
        ${receiptData.tax > 0 ? `<div class="row"><span>Tax:</span><span>₵${receiptData.tax.toFixed(2)}</span></div>` : ''}
        <div class="divider"></div>
        <div class="row total-row"><span>TOTAL:</span><span>₵${receiptData.total.toFixed(2)}</span></div>
        <div class="divider"></div>
        <div class="row"><span>Payment:</span><span>${receiptData.paymentMethod.toUpperCase()}</span></div>
        ${receiptData.paymentMethod === 'cash' ? `
          <div class="row"><span>Cash Received:</span><span>₵${receiptData.cashReceived.toFixed(2)}</span></div>
          <div class="row"><span>Change:</span><span>₵${receiptData.change.toFixed(2)}</span></div>
        ` : ''}
        
        <div class="important-note">
          <strong>⚠ IMPORTANT</strong><br/>
          This receipt must be verified by accounts<br/>
          before products can be released
        </div>
        
        <div class="footer">
          <div class="divider"></div>
          <p>Thank you for your business!</p>
          <p>Visit us again soon</p>
          ${receiptData.customer?.loyaltyPoints ? `<p>Loyalty Points: ${receiptData.customer.loyaltyPoints}</p>` : ''}
          <p style="margin-top: 15px;">★ ★ ★ ★ ★</p>
          <p>Powered by Modern POS</p>
        </div>
      </div>
      <script>
        window.onload = function() {
          window.print();
          setTimeout(() => window.close(), 1000);
        }
      </script>
    </body>
    </html>
  `
}
