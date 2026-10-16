/**
 * KrushiScan AI - Frontend API Client
 * Connects directly to the Python FastAPI backend (http://localhost:8000).
 */

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8000';

export interface HealthResponse {
  status: string;
  integrations: {
    database_postgresql_supabase: { status: string; provider: string; configured: boolean };
    ai_vision_disease_inference: { status: string; provider: string; configured: boolean };
    weather_meteorology: { status: string; provider: string; configured: boolean };
    mandi_market_rates: { status: string; provider: string; configured: boolean };
    payments_razorpay: { status: string; provider: string; configured: boolean };
  };
}

export interface NetReturnCalculationParams {
  modalPricePerQuintal: number;
  quantityQuintals: number;
  distanceKm: number;
  ratePerKm?: number;
  laborPerQuintal?: number;
  otherCess?: number;
}

export interface NetReturnCalculationResult {
  quantityQuintals: number;
  modalPricePerQuintal: number;
  grossRevenue: number;
  transportCost: number;
  laborCost: number;
  otherCess: number;
  totalDeductions: number;
  netReturn: number;
  effectivePricePerQuintal: number;
  currency: string;
  unit: string;
}

export const api = {
  health: {
    async get(): Promise<HealthResponse> {
      const res = await fetch(`${API_BASE_URL}/api/health`);
      if (!res.ok) throw new Error(`Health check returned ${res.status}`);
      return res.json();
    }
  },

  ai: {
    async scan(file: File, cropHint?: string, userId?: string) {
      const formData = new FormData();
      formData.append('file', file);
      if (cropHint) formData.append('crop_hint', cropHint);
      if (userId) formData.append('user_id', userId);

      const res = await fetch(`${API_BASE_URL}/api/ai/scan`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: 'Scan failed' }));
        throw new Error(error.detail || 'Crop scan request failed');
      }
      return res.json();
    },

    async chat(message: string, language = 'mr', district = 'Yavatmal', activeCrops?: string[]) {
      const res = await fetch(`${API_BASE_URL}/api/ai/assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          language,
          district,
          active_crops: activeCrops,
        }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: 'Chat failed' }));
        throw new Error(error.detail || 'Chat request failed');
      }
      return res.json();
    }
  },

  weather: {
    async getLive(district = 'Yavatmal', lat?: number, lon?: number) {
      let url = `${API_BASE_URL}/api/weather/live?district=${encodeURIComponent(district)}`;
      if (lat !== undefined && lon !== undefined) {
        url += `&lat=${lat}&lon=${lon}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Weather API returned ${res.status}`);
      return res.json();
    },

    async getDistricts() {
      const res = await fetch(`${API_BASE_URL}/api/weather/districts`);
      if (!res.ok) throw new Error(`Districts API returned ${res.status}`);
      return res.json();
    }
  },

  mandi: {
    async getRates(commodity?: string, district?: string) {
      let url = `${API_BASE_URL}/api/mandi/rates?`;
      if (commodity) url += `commodity=${encodeURIComponent(commodity)}&`;
      if (district) url += `district=${encodeURIComponent(district)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Mandi rates API returned ${res.status}`);
      return res.json();
    },

    async calculateNetReturn(params: NetReturnCalculationParams): Promise<NetReturnCalculationResult> {
      const res = await fetch(`${API_BASE_URL}/api/mandi/calculate-net-return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Calculation failed' }));
        throw new Error(err.detail || 'Net return calculation failed');
      }
      return res.json();
    }
  },

  payments: {
    async getStatus() {
      const res = await fetch(`${API_BASE_URL}/api/payments/status`);
      if (!res.ok) throw new Error(`Payments status API returned ${res.status}`);
      return res.json();
    },

    async createOrder(amountInr: number, orderId: string, customerName?: string, customerPhone?: string) {
      const res = await fetch(`${API_BASE_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountInr,
          orderId,
          customerName,
          customerPhone,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Order creation failed' }));
        throw new Error(err.detail || 'Payment order creation failed');
      }
      return res.json();
    },

    async verify(razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string, internalOrderId: string) {
      const res = await fetch(`${API_BASE_URL}/api/payments/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature,
          internalOrderId,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Verification failed' }));
        throw new Error(err.detail || 'Payment verification failed');
      }
      return res.json();
    }
  }
};
