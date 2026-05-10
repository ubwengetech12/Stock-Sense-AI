// File: src/lib/gemini.ts
import { GoogleGenAI } from "@google/genai";
import { Product, SaleRecord, StockAlert, Supplier } from './types';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
const model = "gemini-2.0-flash";

// ─── Existing: Ask inventory question ────────────────────────────────────────

export async function askInventoryQuestion(
  question: string,
  products: Product[]
): Promise<string> {
  const context = `
You are StockSense AI, a helpful inventory assistant for shop owners in Rwanda.
Current Inventory:
${products.map(p => `- ${p.name}: ${p.currentStock} ${p.unit} in stock (Min: ${p.minStock})`).join('\n')}

The user is asking: "${question}"
Provide a clear, friendly answer. If they ask in Kinyarwanda, reply in Kinyarwanda. Otherwise reply in English.
Keep it business-focused and helpful. Maximum 3 sentences.
  `.trim();

  try {
    const response = await ai.models.generateContent({ model, contents: context });
    return response.text ?? "I'm sorry, I couldn't process that request at the moment.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The AI assistant is temporarily unavailable. Please check your stock manually.";
  }
}

// ─── Existing: Generate order suggestion ─────────────────────────────────────

export async function generateOrderSuggestion(
  alert: StockAlert,
  salesHistory: SaleRecord[]
): Promise<string> {
  const productSales = salesHistory.filter(s => s.productId === alert.productId);
  const recentSales = productSales.slice(-30).reduce((acc, s) => acc + s.quantity, 0);

  const prompt = `
Product: ${alert.productName}
Current Stock: ${alert.currentStock}
Recent Sales (30 days): ${recentSales} units
Urgency: ${alert.urgency}

Draft a short, encouraging message to the shop owner about why they should order more of this product.
Mention that based on their recent sales, they might run out soon. Maximum 2 sentences.
  `.trim();

  try {
    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text ?? "You should consider reordering soon to avoid stockouts.";
  } catch (error) {
    return "Stock is low. Recommend reordering to maintain availability.";
  }
}

// ─── Types for AI Insights ────────────────────────────────────────────────────

export interface PriceRecommendation {
  productName: string;
  currentPrice: number;
  suggestedPrice: number;
  direction: 'raise' | 'lower' | 'hold';
  reason: string;
}

export interface AIInsights {
  generatedAt: string;
  summary: string;
  marketMood: 'growing' | 'stable' | 'declining';
  priceRecommendations: PriceRecommendation[];
  restockUrgent: string[];
  topOpportunity: string;
  riskWarning: string;
}

// ─── Build slim summary context (avoids sending raw records) ─────────────────

function buildSlimContext(
  products: Product[],
  sales: SaleRecord[],
  suppliers: Supplier[]
): string {
  const now = Date.now();
  const MS_7 = 7 * 24 * 60 * 60 * 1000;
  const MS_30 = 30 * 24 * 60 * 60 * 1000;

  // Per-product summary only — never raw records
  const productSummaries = products.map(p => {
    const last7 = sales.filter(s => s.productId === p.id && now - new Date(s.date).getTime() <= MS_7);
    const last30 = sales.filter(s => s.productId === p.id && now - new Date(s.date).getTime() <= MS_30);
    const units7 = last7.reduce((a, s) => a + s.quantity, 0);
    const units30 = last30.reduce((a, s) => a + s.quantity, 0);
    const revenue7 = last7.reduce((a, s) => a + s.totalAmount, 0);
    const supplier = suppliers.find(s => s.id === p.supplierId);
    const stockStatus = p.currentStock <= p.minStock / 2 ? 'CRITICAL'
      : p.currentStock <= p.minStock ? 'LOW' : 'OK';

    return `${p.name} | stock:${p.currentStock}(min:${p.minStock},${stockStatus}) | price:${p.sellingPrice}RWF | sold7d:${units7}units | sold30d:${units30}units | rev7d:${revenue7}RWF | supplier:${supplier?.name ?? 'none'}`;
  });

  // Overall store totals
  const totalRev7 = sales
    .filter(s => now - new Date(s.date).getTime() <= MS_7)
    .reduce((a, s) => a + s.totalAmount, 0);
  const totalRev30 = sales
    .filter(s => now - new Date(s.date).getTime() <= MS_30)
    .reduce((a, s) => a + s.totalAmount, 0);

  return `
STORE SUMMARY (Rwanda retail shop, Kigali):
Total revenue last 7 days: ${totalRev7.toLocaleString()} RWF
Total revenue last 30 days: ${totalRev30.toLocaleString()} RWF
Total products: ${products.length}
Critical stock items: ${products.filter(p => p.currentStock <= p.minStock / 2).length}
Low stock items: ${products.filter(p => p.currentStock <= p.minStock).length}

PRODUCT DETAILS (one line each):
${productSummaries.join('\n')}
  `.trim();
}

// ─── Main: Generate AI Insights (one call, full JSON response) ───────────────

export async function generateAIInsights(
  products: Product[],
  sales: SaleRecord[],
  suppliers: Supplier[]
): Promise<AIInsights> {
  const context = buildSlimContext(products, sales, suppliers);

  const prompt = `
You are StockSense AI, a retail business advisor for a shop owner in Kigali, Rwanda.
Analyze the store data below and return ONLY a valid JSON object — no markdown, no backticks, no explanation.

STORE DATA:
${context}

Return this exact JSON structure:
{
  "summary": "2-3 sentence overview of shop performance this week",
  "marketMood": "growing" | "stable" | "declining",
  "priceRecommendations": [
    {
      "productName": "exact product name",
      "currentPrice": number,
      "suggestedPrice": number,
      "direction": "raise" | "lower" | "hold",
      "reason": "one sentence why"
    }
  ],
  "restockUrgent": ["product name 1", "product name 2"],
  "topOpportunity": "one sentence about the biggest revenue opportunity right now",
  "riskWarning": "one sentence about the biggest risk to watch"
}

Rules:
- priceRecommendations: include only products where direction is raise or lower (skip hold), max 4 items
- restockUrgent: only CRITICAL or LOW stock products, max 5
- Base price changes on sales velocity — fast-moving products can raise price, slow-moving should lower
- Consider Rwanda market context: weekend sales are higher, end-of-month spending increases
- Keep all text short and actionable
- Return ONLY the JSON object, nothing else
  `.trim();

  try {
    const response = await ai.models.generateContent({ model, contents: prompt });
    const raw = (response.text ?? "").trim();

    // Strip markdown fences if model adds them despite instructions
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

    const parsed = JSON.parse(cleaned) as Omit<AIInsights, 'generatedAt'>;

    return {
      ...parsed,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Gemini AI Insights error:", error);
    // Return a safe fallback so the UI never crashes
    return {
      generatedAt: new Date().toISOString(),
      summary: "AI insights temporarily unavailable. Your store data is still being tracked normally.",
      marketMood: "stable",
      priceRecommendations: [],
      restockUrgent: products
        .filter(p => p.currentStock <= p.minStock / 2)
        .map(p => p.name)
        .slice(0, 5),
      topOpportunity: "Add more sales data for better AI recommendations.",
      riskWarning: "Check your critical stock items manually.",
    };
  }
}