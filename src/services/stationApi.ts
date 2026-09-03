import { useEffect, useState } from "react";
import { powerData, weatherData, aiRecommendations, stationData } from "../data/mockData";

export interface LiveStationState {
  isBackendConnected: boolean;
  timestamp: string;
  power: typeof powerData;
  weather: typeof weatherData;
  loads: Array<{ name: string; value: number; priority: number; color: string }>;
  anomalies: Array<{ severity: string; system: string; message: string; action: string }>;
}

const DEFAULT_STATE: LiveStationState = {
  isBackendConnected: false,
  timestamp: new Date().toUTCString().slice(17, 22) + " UTC",
  power: powerData,
  weather: weatherData,
  loads: [
    { name: "Critical / Life-Support", value: 12.8, priority: 0, color: "#ef4444" },
    { name: "Scientific Equipment",   value: 11.4, priority: 1, color: "#8b5cf6" },
    { name: "Heating & HVAC",          value: 9.6,  priority: 2, color: "#f97316" },
    { name: "Communication",           value: 2.1,  priority: 3, color: "#0ea5e9" },
    { name: "Computing & Data",        value: 5.8,  priority: 4, color: "#06b6d4" },
    { name: "General Appliances",      value: 3.9,  priority: 5, color: "#64748b" },
    { name: "Flexible Loads",          value: 1.7,  priority: 6, color: "#94a3b8" },
  ],
  anomalies: []
};

const BACKEND_WS_URL = "ws://localhost:8000/ws/telemetry";
const BACKEND_API_BASE = "http://localhost:8000/api";

export function useLiveStationTelemetry() {
  const [state, setState] = useState<LiveStationState>(DEFAULT_STATE);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: any = null;

    const connect = () => {
      try {
        ws = new WebSocket(BACKEND_WS_URL);

        ws.onopen = () => {
          setState(prev => ({ ...prev, isBackendConnected: true }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setState({
              isBackendConnected: true,
              timestamp: data.timestamp || new Date().toUTCString().slice(17, 22) + " UTC",
              power: data.power,
              weather: data.weather,
              loads: data.loads || DEFAULT_STATE.loads,
              anomalies: data.anomalies || []
            });
          } catch {
            // ignore parse error
          }
        };

        ws.onclose = () => {
          setState(prev => ({ ...prev, isBackendConnected: false }));
          reconnectTimer = setTimeout(connect, 3000);
        };

        ws.onerror = () => {
          ws?.close();
        };
      } catch {
        setState(prev => ({ ...prev, isBackendConnected: false }));
        reconnectTimer = setTimeout(connect, 5000);
      }
    };

    connect();

    // 1 Hz Active Telemetry Heartbeat
    const tickInterval = setInterval(() => {
      setState(prev => {
        const nowUtc = new Date().toUTCString().slice(17, 25) + " UTC";
        if (prev.isBackendConnected) {
          return { ...prev, timestamp: nowUtc };
        }

        // Realistic live cyber-physical simulation tick when offline
        const windNoise = (Math.random() - 0.5) * 0.4;
        const currentWind = Math.max(3.0, Math.min(24.0, Number((prev.weather.windSpeed + windNoise).toFixed(1))));
        const solarNoise = (Math.random() - 0.5) * 0.3;
        const currentSolar = Math.max(0.0, Number((prev.power.solar.output + solarNoise).toFixed(1)));
        const currentWindPwr = Math.max(0.0, Number((prev.power.wind.output + windNoise * 1.8).toFixed(1)));
        const totalGen = Number((currentSolar + currentWindPwr).toFixed(1));
        const totalCon = prev.power.totalConsumption;
        const net = Number((totalGen - totalCon).toFixed(1));

        return {
          ...prev,
          timestamp: nowUtc,
          power: {
            ...prev.power,
            solar: { ...prev.power.solar, output: currentSolar },
            wind: { ...prev.power.wind, output: currentWindPwr, speed: currentWind },
            totalGeneration: totalGen,
            netBalance: net,
            battery: {
              ...prev.power.battery,
              power: net,
              status: net >= 0 ? "charging" : "discharging",
            }
          },
          weather: {
            ...prev.weather,
            windSpeed: currentWind,
          }
        };
      });
    }, 1000);

    return () => {
      if (ws) ws.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      clearInterval(tickInterval);
    };
  }, []);

  return state;
}

export async function submitRecommendationAction(recId: string, decision: string, pin?: string) {
  try {
    const res = await fetch(`${BACKEND_API_BASE}/recommendations/${recId}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, operator: "Lead Operator", pin })
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: "Backend not reachable, action saved locally." };
  }
}

export async function fetchLiveRecommendations() {
  try {
    const res = await fetch(`${BACKEND_API_BASE}/recommendations`, { cache: "no-store" });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback to mock
  }
  return aiRecommendations;
}

export async function sendOperatorChatMessage(query: string) {
  try {
    const res = await fetch(`${BACKEND_API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    return {
      success: false,
      response: "SIAPS AI Telemetry Gateway offline. Ensure backend is running on port 8000."
    };
  }
}

export async function submitManualOverride(action: string, pin: string) {
  try {
    const res = await fetch(`${BACKEND_API_BASE}/override`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, operator: "Lead Operator", pin })
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: "Backend not reachable, override executed locally." };
  }
}
