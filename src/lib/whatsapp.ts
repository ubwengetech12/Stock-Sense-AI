// File: src/lib/whatsapp.ts
import { Supplier, PurchaseOrder } from './types';

/**
 * Mock WhatsApp Order Sender
 * In a real app, this would call the WhatsApp Business API
 */
export async function sendPurchaseOrder(
  supplier: Supplier, 
  order: PurchaseOrder,
  shopName: string = "StockSense Store"
): Promise<boolean> {
  // Construct the message
  const itemsList = order.items
    .map(item => `- ${item.productName}: ${item.quantity} units`)
    .join('\n');

  const message = `
📦 *NEW PURCHASE ORDER*
Order ID: ${order.id}
From: ${shopName}
Date: ${new Date().toLocaleDateString()}

Items:
${itemsList}

Please confirm receipt and let us know the delivery time.
  `.trim();

  console.log(`Sending WhatsApp message to ${supplier.whatsappNumber}:`, message);

  // In the real world: 
  // const response = await fetch('/api/send-whatsapp', { method: 'POST', body: JSON.stringify({ to: supplier.whatsappNumber, message }) });
  
  // For the demo, we'll simulate a 1-second delay and success
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real browser, we might open a whatsapp link if it's a "demo"
      const encodedMsg = encodeURIComponent(message);
      window.open(`https://wa.me/${supplier.whatsappNumber.replace('+', '')}?text=${encodedMsg}`, '_blank');
      resolve(true);
    }, 1000);
  });
}
