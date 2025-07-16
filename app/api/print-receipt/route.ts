import escpos, { USB } from 'escpos';
import { NextApiRequest, NextApiResponse } from 'next';

// Use USB adapter

interface ReceiptItem {
    name: string;
    quantity: number;
    price: number;
}

interface ReceiptData {
    storeName: string;
    storeAddress: string;
    storePhone: string;
    items: ReceiptItem[];
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod: string;
    receiptNumber: string;
    cashier: string;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const receiptData: ReceiptData = req.body;
        const device = new USB();
        const printer = new escpos.Printer(device);

        device.open(() => {
            printer
                .font('A')
                .align('CT')
                .style('B')
                .size(1, 1)
                .text(receiptData.storeName)
                .size(1, 1)
                .style('NORMAL')
                .text(receiptData.storeAddress)
                .text(receiptData.storePhone)
                .text('------------------------')
                .align('LT')
                .text('Item         Qty    Price')
                .text('------------------------');

            receiptData.items.forEach((item) => {
                printer.text(
                    `${item.name.padEnd(12)}${item.quantity.toString().padEnd(6)}$${item.price.toFixed(2)}`
                );
            });

            printer
                .text('------------------------')
                .text(`Subtotal: $${receiptData.subtotal.toFixed(2)}`)
                .text(`Tax: $${receiptData.tax.toFixed(2)}`)
                .text(`Total: $${receiptData.total.toFixed(2)}`)
                .text('------------------------')
                .text(`Payment: ${receiptData.paymentMethod}`)
                .text(`Receipt: ${receiptData.receiptNumber}`)
                .text(`Date: ${new Date().toLocaleString()}`)
                .text(`Cashier: ${receiptData.cashier}`)
                .text('------------------------')
                .align('CT')
                .text('Thank you for your purchase!')
                .text('Please keep this receipt')
                .text('for your records.')
                .cut()
                .close();

            res.status(200).json({ message: 'Print successful' });
        });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}