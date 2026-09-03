export const stationData = {
  name: "SIAPS — Bharati Antarctic Station",
  location: "69°24′S 76°11′E · Larsemann Hills, Antarctica",
  agency: "NCPOR · Ministry of Earth Sciences, Govt. of India",
  altStation: "Maitri Station · 70°46′S 11°44′E · Schirmacher Oasis",
  operatingMode: "autonomous",
  overallHealth: 94,
  lastUpdated: "2025-03-14T09:42:00Z",
  uptime: "127d 14h 22m",
};

export const powerData = {
  solar: { output: 18.4, capacity: 48, status: "normal", irradiance: 312 },
  wind: { output: 31.2, capacity: 60, status: "normal", speed: 8.7 },
  generator: { output: 0, capacity: 80, status: "standby", fuel: 87, runtime: 1247 },
  battery: {
    soc: 78,
    voltage: 54.2,
    current: 42.4,
    power: 2.3,
    health: 96,
    temperature: 18.4,
    capacity: 400,
    remaining: 312,
    runtime: 14.2,
    status: "charging",
    degradation: 4,
  },
  totalGeneration: 49.6,
  totalConsumption: 47.3,
  netBalance: 2.3,
  renewableContribution: 100,
  gridExport: 0,
};

export const loadsData = [
  { name: "Critical / Life-Support", value: 12.8, color: "#ef4444", priority: 0 },
  { name: "Scientific Equipment", value: 11.4, color: "#8b5cf6", priority: 1 },
  { name: "Heating & HVAC", value: 9.6, color: "#f97316", priority: 2 },
  { name: "Communication", value: 2.1, color: "#0ea5e9", priority: 3 },
  { name: "Computing & Data", value: 5.8, color: "#06b6d4", priority: 4 },
  { name: "General Appliances", value: 3.9, color: "#64748b", priority: 5 },
  { name: "Flexible Loads", value: 1.7, color: "#94a3b8", priority: 6 },
];

export const weatherData = {
  temperature: -18.4,
  feelsLike: -26.1,
  windSpeed: 8.7,
  windDirection: "NNE",
  windGust: 13.2,
  solarRadiation: 312,
  visibility: 6.4,
  snowDepth: 84,
  humidity: 71,
  pressure: 1013,
  condition: "Partly Cloudy",
  alerts: [
    {
      id: "wa1",
      type: "wind",
      severity: "warning",
      message: "Strong wind advisory — gusts up to 28 m/s expected 14:00–22:00",
    },
  ],
  forecast: [
    { day: "Today", high: -16, low: -24, condition: "Partly Cloudy", wind: 9, solar: 310 },
    { day: "Thu", high: -14, low: -22, condition: "Overcast", wind: 18, solar: 80 },
    { day: "Fri", high: -19, low: -27, condition: "Snow / Blizzard", wind: 26, solar: 20 },
    { day: "Sat", high: -21, low: -30, condition: "Blizzard", wind: 31, solar: 5 },
    { day: "Sun", high: -17, low: -25, condition: "Clearing", wind: 14, solar: 180 },
  ],
};

export const aiRecommendations = [
  {
    id: "rec1",
    title: "Delay non-critical heating by 40 minutes",
    reason: "Low renewable generation forecast for 14:00–18:00 due to incoming overcast",
    impact: "Preserves ~28 kWh battery reserve before severe weather window",
    confidence: 91,
    level: 1,
    status: "awaiting_approval",
    category: "load_shift",
    urgency: "medium",
    createdAt: "09:38",
  },
  {
    id: "rec2",
    title: "Charge battery to 90% SOC in next 2 hours",
    reason: "Strong renewable output now; blizzard forecast reduces generation for 36 hours",
    impact: "Extends autonomous runtime from 14.2h to 19.8h during weather event",
    confidence: 96,
    level: 1,
    status: "approved",
    category: "battery",
    urgency: "high",
    createdAt: "09:12",
  },
  {
    id: "rec3",
    title: "Pre-position generator to warm-standby",
    reason: "Probability of prolonged renewable gap exceeds 80% (Friday–Saturday blizzard)",
    impact: "Reduces generator start latency from 45s to 8s; ensures no power gap",
    confidence: 84,
    level: 2,
    status: "awaiting_approval",
    category: "generator",
    urgency: "medium",
    createdAt: "09:41",
  },
  {
    id: "rec4",
    title: "Reduce scientific instrument heating to 65%",
    reason: "Instruments thermally stable; minor heating reduction causes no measurement impact",
    impact: "Saves 1.8 kW continuously; extends battery runtime by ~2.3 hours",
    confidence: 88,
    level: 1,
    status: "approved",
    category: "load_reduction",
    urgency: "low",
    createdAt: "08:55",
  },
  {
    id: "rec5",
    title: "Suspend data archival upload to satellite",
    reason: "Communication satellite window available; however battery reserve should be prioritized",
    impact: "Saves 0.4 kW; data can be deferred to Sunday window with no science impact",
    confidence: 79,
    level: 1,
    status: "rejected",
    category: "load_shift",
    urgency: "low",
    createdAt: "08:30",
  },
];

export const approvalQueue = [
  {
    id: "apv1",
    level: 2,
    levelLabel: "Level 2 — Human Approval Required",
    action: "Pre-position generator to warm-standby mode",
    ai_reasoning:
      "Blizzard forecast (Friday 06:00 – Saturday 18:00) will reduce solar to <5% and wind to uncertain. Battery reserve at 78% SOC. Pre-positioning warm-standby ensures <8s start time if renewable gap exceeds battery capacity.",
    risk: "Low — ~0.8 L/h coolant loop heating only; no engine load; safe auto-shutdown on fault before load transfer",
    expectedResult: "Thermal pre-conditioning complete in 12 min; generator response time reduced from 45s to 8s",
    requestedAt: "09:41",
    requiredBy: "11:00",
    category: "generator",
  },
  {
    id: "apv2",
    level: 3,
    levelLabel: "Level 3 — Two-Person Authorization",
    action: "Activate Emergency Load Shedding Protocol — Tier 1",
    ai_reasoning:
      "If blizzard scenario manifests AND battery drops below 25% SOC, automatic Tier 1 load shedding is required. This pre-authorization enables autonomous execution during the weather event without communication delay.",
    risk: "Medium — suspends flexible loads, non-critical heating, and science instruments tier 2",
    expectedResult: "Consumption reduction from 47.3 kW to 28.1 kW; extends battery runway by 6.4 hours",
    requestedAt: "09:38",
    requiredBy: "12:00",
    category: "safety",
  },
];

export const safetyData = {
  status: "normal",
  criticalSystems: [
    { name: "Life Support", status: "normal", detail: "O₂ 20.9%, CO₂ 412 ppm, cabin +19°C — within limits" },
    { name: "Emergency Heating", status: "normal", detail: "Backup circuit ready" },
    { name: "Fire Detection", status: "normal", detail: "28/28 sensors active" },
    { name: "CO₂ / Air Quality", status: "normal", detail: "CO₂ 412 ppm, O₂ 20.9%" },
    { name: "Structural Integrity", status: "normal", detail: "Snow load 0.84 kN/m², door seals 14 Pa — no breach" },
    { name: "Emergency Comm", status: "normal", detail: "Iridium link active" },
    { name: "Medical Systems", status: "warning", detail: "AED battery check overdue 3d" },
    { name: "Emergency Generator", status: "normal", detail: "Tested 2025-03-11" },
  ],
  occupancy: 4,
  maxOccupancy: 8,
  emergencyStatus: "none",
  activeAlerts: 2,
};

export const equipmentHealth = [
  {
    id: "eq1",
    name: "Solar Array — Array A",
    category: "Solar",
    health: 97,
    status: "normal",
    anomalies: 0,
    lastMaintenance: "2025-01-15",
    nextMaintenance: "2025-07-15",
    predictedFailure: null,
    detail: "All 48 panels nominal; soiling loss 2.1%",
  },
  {
    id: "eq2",
    name: "Solar Array — Array B",
    category: "Solar",
    health: 91,
    status: "normal",
    anomalies: 1,
    lastMaintenance: "2025-01-15",
    nextMaintenance: "2025-07-15",
    predictedFailure: null,
    detail: "Panel B-14 degraded output (-18%); monitoring",
  },
  {
    id: "eq3",
    name: "Wind Turbine T-1",
    category: "Wind",
    health: 98,
    status: "normal",
    anomalies: 0,
    lastMaintenance: "2025-02-01",
    nextMaintenance: "2025-08-01",
    predictedFailure: null,
    detail: "42 rpm rotor, pitch 12°, gearbox 38°C — within spec",
  },
  {
    id: "eq4",
    name: "Wind Turbine T-2",
    category: "Wind",
    health: 89,
    status: "warning",
    anomalies: 1,
    lastMaintenance: "2025-02-01",
    nextMaintenance: "2025-05-15",
    predictedFailure: "Gearbox bearing wear — 45 days",
    detail: "Vibration anomaly detected; recommend inspection",
  },
  {
    id: "eq5",
    name: "Battery Bank — Rack 1–4",
    category: "Battery",
    health: 96,
    status: "normal",
    anomalies: 0,
    lastMaintenance: "2025-03-01",
    nextMaintenance: "2025-06-01",
    predictedFailure: null,
    detail: "Capacity 400 kWh, degradation 4%, all cells balanced",
  },
  {
    id: "eq6",
    name: "Diesel Generator G-1",
    category: "Generator",
    health: 94,
    status: "normal",
    anomalies: 0,
    lastMaintenance: "2025-02-20",
    nextMaintenance: "2025-05-20",
    predictedFailure: null,
    detail: "1247 hours total runtime; oil change due in 253h",
  },
  {
    id: "eq7",
    name: "HVAC / Heating System",
    category: "HVAC",
    health: 88,
    status: "warning",
    anomalies: 1,
    lastMaintenance: "2025-01-10",
    nextMaintenance: "2025-04-10",
    predictedFailure: "Filter efficiency — 22 days",
    detail: "Air filter 78% loaded; schedule replacement",
  },
  {
    id: "eq8",
    name: "Meteorological Station",
    category: "Sensors",
    health: 99,
    status: "normal",
    anomalies: 0,
    lastMaintenance: "2025-02-28",
    nextMaintenance: "2025-08-28",
    predictedFailure: null,
    detail: "All 14 sensors active and calibrated",
  },
  {
    id: "eq9",
    name: "Satellite Comm — VSAT",
    category: "Communication",
    health: 95,
    status: "normal",
    anomalies: 0,
    lastMaintenance: "2025-01-20",
    nextMaintenance: "2025-07-20",
    predictedFailure: null,
    detail: "12.4 Mbps uplink; 98.7% uptime (30d)",
  },
];

export const alerts: {
  id: string;
  severity: "warning" | "error" | "info";
  time: string;
  system: string;
  message: string;
  action: string;
  acknowledged: boolean;
}[] = [
  {
    id: "alt1",
    severity: "warning",
    time: "09:38",
    system: "Weather",
    message: "Strong wind advisory: gusts up to 28 m/s expected 14:00–22:00 today",
    action: "Monitor turbine output; auto-feathering enabled at 25 m/s",
    acknowledged: false,
  },
  {
    id: "alt2",
    severity: "info",
    time: "09:12",
    system: "Battery",
    message: "AI initiated pre-storm charging cycle — target 90% SOC",
    action: "AI charging at +2.3 kW; estimated 90% SOC by 11:28 — no intervention needed",
    acknowledged: true,
  },
  {
    id: "alt3",
    severity: "warning",
    time: "08:47",
    system: "Equipment",
    message: "Wind Turbine T-2: vibration anomaly on gearbox bearing (0.87 mm/s RMS, threshold 0.80)",
    action: "Inspect at next maintenance window; AI monitoring continuously",
    acknowledged: false,
  },
  {
    id: "alt4",
    severity: "info",
    time: "07:22",
    system: "Safety",
    message: "AED battery replacement overdue by 3 days — unit still functional",
    action: "Schedule replacement during next resupply (March 28)",
    acknowledged: true,
  },
  {
    id: "alt5",
    severity: "warning",
    time: "06:15",
    system: "HVAC",
    message: "HVAC air filter efficiency at 78% — replacement recommended within 22 days",
    action: "Add to upcoming maintenance task list",
    acknowledged: true,
  },
];

export const generateTimeSeriesData = (hours = 24) => {
  const data = [];
  for (let i = hours; i >= 0; i--) {
    const h = new Date();
    h.setHours(h.getHours() - i);
    const hour = h.getHours();
    const solarMultiplier = hour >= 8 && hour <= 18 ? Math.sin(((hour - 8) / 10) * Math.PI) : 0;
    data.push({
      time: `${hour.toString().padStart(2, "0")}:00`,
      solar: Math.round(solarMultiplier * 22 * (0.8 + Math.random() * 0.4)),
      wind: Math.round(28 + Math.sin(i * 0.3) * 8 + Math.random() * 5),
      consumption: Math.round(44 + Math.sin(i * 0.2) * 6 + Math.random() * 4),
      battery: Math.round(65 + Math.sin(i * 0.15) * 12),
    });
  }
  return data;
};

export const communicationData = {
  links: [
    { name: "VSAT Primary", status: "active", latency: 580, bandwidth: 12.4, uptime: 98.7 },
    { name: "Iridium Backup", status: "active", latency: 1240, bandwidth: 0.1, uptime: 99.9 },
    { name: "HF Radio", status: "active", latency: null, bandwidth: null, uptime: 100 },
    { name: "AIS Beacon", status: "active", latency: null, bandwidth: null, uptime: 100 },
  ],
  edgeComputing: {
    cpuLoad: 34,
    memoryUsed: 62,
    storageUsed: 71,
    pendingSync: "2.3 GB",
    lastSync: "08:55",
  },
};
