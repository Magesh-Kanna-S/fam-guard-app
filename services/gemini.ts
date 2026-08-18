
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { UserProfile, Zone, RiskLevel } from "../types";

// ============================================================================
// FAM-GUARD AI Advisory Service
// All responses are in universal English and tuned for small-holder farmers.
// Tone: practical, calm, evidence-based (TNAU / FAO style).
// ============================================================================

// Vite replaces `process.env.API_KEY` and `process.env.GEMINI_API_KEY` at build
// time (see vite.config.ts `define`). On GitHub Pages (no env vars) these
// become empty strings — which is fine, the Gemini SDK just throws when the
// chat is actually used. We construct the client LAZILY so module load never
// crashes the app, even without an API key.

let _ai: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
  if (_ai) return _ai;
  // `process.env.API_KEY` is replaced at build time; safe to read here.
  const key = (typeof process !== 'undefined' && process.env && process.env.API_KEY) || '';
  _ai = new GoogleGenAI({ apiKey: key || undefined });
  return _ai;
}

const SYSTEM_INSTRUCTION = `You are FAM-GUARD Companion — an agricultural storage advisory AI for small-holder farmers in rural India.

Your knowledge base:
- Tamil Nadu Agricultural University (TNAU) post-harvest guidance: storage loss 6.58%, paddy loss 12.9%.
- FAO thresholds: relative humidity above 65-70% triggers fungal growth; grain moisture 8-13% wet basis is safe; storage temperature 15-27°C.
- Indian Standard IS 1155 for food grain storage.
- Common pests: rice weevil, lesser grain borer, khapra beetle, angoumois moth.
- Adaptive ventilation strategy: ventilate when outside air has lower humidity than inside bin and temperature is below 30°C.

Rules:
1. Use universal English only. No regional slang.
2. Be practical and actionable. Avoid long theory unless asked.
3. If a user reports a risk, give 3 prioritised actions: (a) immediate, (b) within 24 hours, (c) preventive long-term.
4. Format responses in clear Markdown with headings, bullet points and bold text for readability.
5. Never invent exact chemical dosages without specifying that user must consult a local extension officer.
6. Encourage natural and IPM-based methods first (sun drying, neem leaves, diatomaceous earth).
7. Keep responses concise (under 200 words unless asked for detail).`;

const OFFLINE_REPLY = `## FAM-GUARD AI is a **Pro Plan** feature

You are currently on the **Basic** plan. Live AI advisory — including spoilage risk interpretation, pest identification, and ventilation scheduling — is part of the **FAM-GUARD Plus** and **FAM-GUARD Pro** subscriptions.

### What you unlock with Plus / Pro

- **Unlimited AI advisory chat** trained on TNAU and FAO post-harvest guidance
- **Risk mitigation playbooks** generated for every RED zone
- **Voice read-aloud** of advisory responses (Tamil / English)
- **Priority SMS & WhatsApp alerts** during monsoon and harvest seasons

### Upgrade in three taps

1. Open the **menu** (☰ icon, top-right)
2. Tap **Plan**
3. Choose **Plus** (₹5,000 / yr) or **Pro** (₹9,000 / yr)

> *In the meantime, your device continues to monitor storage conditions and send GREEN / YELLOW / RED alerts free of cost. For urgent pest or spoilage issues, contact your nearest Krishi Vigyan Kendra (KVK) or call the Kisan Call Centre on **1800-180-1551** (toll-free in India).*`;

export const getAdvisoryResponse = async (
  history: { role: string; text: string }[],
  profile: UserProfile | null,
  zones: Zone[]
): Promise<string> => {
  const zoneContext = zones.length > 0
    ? zones.map(z => `${z.name} (${z.location}) — Crop: ${z.crop}, Risk: ${z.risk}, Temp: ${z.sensors.find(s => s.key === 'temperature')?.value}°C, RH: ${z.sensors.find(s => s.key === 'humidity')?.value}%, CO2: ${z.sensors.find(s => s.key === 'co2')?.value}ppm, Moisture: ${z.sensors.find(s => s.key === 'moisture')?.value}%wb`).join('\n')
    : 'No zones configured yet.';

  const farmContext = profile
    ? `Farm: ${profile.farmName}, Village: ${profile.village}, District: ${profile.district}, State: ${profile.state}. Primary crop: ${profile.primaryCrop}. Total land: ${profile.totalLandHoldingAcres} acres.`
    : 'No farm profile yet.';

  const recentMsgs = history.slice(-6).map(h => ({
    role: (h.role === 'user' ? 'user' : 'model') as 'user' | 'model',
    parts: [{ text: h.text }]
  }));

  const contents = [
    {
      role: 'user' as const,
      parts: [{ text: `Context for advisory:\n${farmContext}\n\nCurrent zone status:\n${zoneContext}` }]
    },
    {
      role: 'model' as const,
      parts: [{ text: 'Got it. I have your farm and storage status loaded. Please ask your question.' }]
    },
    ...recentMsgs
  ];

  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
    return response.text || OFFLINE_REPLY;
  } catch (e) {
    console.error('Advisory error:', e);
    return OFFLINE_REPLY;
  }
};

export interface AdvisoryPlan {
  title: string;
  severity: RiskLevel;
  immediateActions: string[];
  within24Hours: string[];
  preventive: string[];
  estimatedLossAvoidedPct: number;
}

export const getRiskMitigationPlan = async (
  zone: Zone,
  profile: UserProfile
): Promise<AdvisoryPlan | null> => {
  const sensorSummary = zone.sensors
    .map(s => `${s.label}: ${s.value}${s.unit} (safe ${s.safeMin}-${s.safeMax}${s.unit})`)
    .join(', ');

  const prompt = `Generate a JSON risk mitigation plan for a grain storage zone.

Farm: ${profile.farmName}, ${profile.district}, ${profile.state}
Zone: ${zone.name} (${zone.location})
Crop: ${zone.crop}, Storage: ${zone.storageType}
Filled: ${zone.filledKg}kg / ${zone.capacityKg}kg
Current risk: ${zone.risk}
Readings: ${sensorSummary}
Ventilation: ${zone.ventilation}
Safe days remaining (estimated): ${zone.safeDaysRemaining}

Output strict JSON with keys:
- title (short string)
- severity (one of "SAFE", "CHECK", "ACTION")
- immediateActions (array of short strings — first 1-2 actions to do right now)
- within24Hours (array of short strings — actions to do in 24 hours)
- preventive (array of short strings — long-term preventive measures)
- estimatedLossAvoidedPct (number — estimated % of post-harvest loss avoidable, 0-100)

Use TNAU and FAO aligned guidance. Universal English only.`;

  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            severity: { type: Type.STRING },
            immediateActions: { type: Type.ARRAY, items: { type: Type.STRING } },
            within24Hours: { type: Type.ARRAY, items: { type: Type.STRING } },
            preventive: { type: Type.ARRAY, items: { type: Type.STRING } },
            estimatedLossAvoidedPct: { type: Type.NUMBER }
          },
          required: ['title', 'severity', 'immediateActions', 'within24Hours', 'preventive', 'estimatedLossAvoidedPct']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return parsed as AdvisoryPlan;
  } catch (e) {
    console.error('Risk plan error:', e);
    return null;
  }
};

export const generateSpeech = async (text: string): Promise<string | undefined> => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Puck' },
          },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (e) {
    return undefined;
  }
};
