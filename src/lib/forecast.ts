// File: src/lib/forecast.ts
import { SaleRecord, ForecastItem, Product } from './types';
import { addDays, format, isSameDay, startOfToday } from 'date-fns';

const RWANDA_HOLIDAYS = [
  '04-07', // Genocide Memorial Day
  '07-04', // Liberation Day
  '12-25', // Christmas
  '01-01', // New Year
];

/**
 * AI Demand Forecasting Logic (Moving Average + Seasonality)
 */
export function calculateForecast(
  product: Product,
  salesHistory: SaleRecord[],
  daysToForecast: number = 14
): ForecastItem[] {
  const result: ForecastItem[] = [];
  const today = startOfToday();

  // Filter history for this product
  const productHistory = salesHistory.filter(s => s.productId === product.id);
  
  // Calculate 7-day moving average
  const last7Days = productHistory.filter(s => {
    const saleDate = new Date(s.date);
    const diff = today.getTime() - saleDate.getTime();
    return diff <= 7 * 24 * 60 * 60 * 1000;
  });

  const avgSalesPerDay = last7Days.length > 0 
    ? last7Days.reduce((acc, s) => acc + s.quantity, 0) / 7
    : (product.currentStock / 30); // Fallback if no history

  for (let i = 1; i <= daysToForecast; i++) {
    const forecastDate = addDays(today, i);
    const dateStr = format(forecastDate, 'yyyy-MM-dd');
    const dayOfWeek = forecastDate.getDay(); // 0 = Sun, 6 = Sat
    const holidayKey = format(forecastDate, 'MM-dd');

    let multiplier = 1.0;
    
    // Weekend boost (Fridays, Saturdays, Sundays often higher in retail)
    if (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) {
      multiplier *= 1.25;
    }

    // Holiday boost
    if (RWANDA_HOLIDAYS.includes(holidayKey)) {
      multiplier *= 1.4;
    }

    // Add some random noise for "realism"
    const noise = 1 + (Math.random() * 0.1 - 0.05);

    const predicted = Math.round(avgSalesPerDay * multiplier * noise);

    result.push({
      productId: product.id,
      productName: product.name,
      day: dateStr,
      predictedUnits: Math.max(1, predicted),
      confidence: Math.round(70 + Math.random() * 25), // Mock confidence score
    });
  }

  return result;
}
