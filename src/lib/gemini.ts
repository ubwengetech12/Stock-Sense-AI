// File: src/lib/gemini.ts
import { GoogleGenAI } from "@google/genai";
import { Product, SaleRecord, StockAlert } from './types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const model = "gemini-2.0-flash";

/**
 * Ask Gemini questions about inventory in plain English or Kinyarwanda
 */
export async function askInventoryQuestion(question: string, products: Product[]): Promise<string> {
  const context = `
    You are StockSense AI, a helpful inventory assistant for shop owners in Rwanda.
    Current Inventory:
    ${products.map(p => `- ${p.name}: ${p.currentStock} ${p.unit} in stock (Min: ${p.minStock})`).join('\n')}
    
    The user is asking: "${question}"
    Provide a clear, friendly answer. If they ask in Kinyarwanda, reply in Kinyarwanda. Otherwise, reply in English.
    Keep it business-focused and helpful. Maximum 3 sentences.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: context,
    });
    return response.text ?? "I'm sorry, I couldn't process that request at the moment.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The AI assistant is temporarily unavailable. Please check your stock manually.";
  }
}

/**
 * Generate a purchase order suggestion message
 */
export async function generateOrderSuggestion(alert: StockAlert, salesHistory: SaleRecord[]): Promise<string> {
  const productSales = salesHistory.filter(s => s.productId === alert.productId);
  const recentSales = productSales.slice(-30).reduce((acc, s) => acc + s.quantity, 0);

  const prompt = `
    Product: ${alert.productName}
    Current Stock: ${alert.currentStock}
    Recent Sales (30 days): ${recentSales} units
    Urgency: ${alert.urgency}
    
    Draft a short, encouraging message to the shop owner about why they should order more of this product. 
    Mention that based on their recent sales, they might run out soon. Maximum 2 sentences.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text ?? "You should consider reordering soon to avoid stockouts.";
  } catch (error) {
    return "Stock is low. Recommend reordering to maintain availability.";
  }
}