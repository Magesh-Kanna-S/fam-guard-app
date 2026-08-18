
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, UserProfile, Zone } from '../types';
import { getAdvisoryResponse, generateSpeech } from '../services/gemini';

interface AdvisoryChatProps {
  profile: UserProfile | null;
  zones: Zone[];
}

const SUGGESTED_PROMPTS = [
  'My paddy is at 14% moisture — should I dry it now?',
  'How do I prevent rice weevil without chemicals?',
  'Best ventilation timing during monsoon?',
  'What CO₂ level signals insect infestation?',
  'How long can I store ragi safely?',
  'My bin temperature hit 32°C — what to do?',
];

const AdvisoryChat: React.FC<AdvisoryChatProps> = ({ profile, zones }) => {
  const [history, setHistory] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: `Hello ${profile?.name?.split(' ')[0] || 'farmer'}! I am your **FAM-GUARD Companion**.

I can see you have ${zones.length} storage zone${zones.length === 1 ? '' : 's'} configured — ${zones.filter(z => z.risk === 'SAFE').length} safe, ${zones.filter(z => z.risk === 'CHECK').length} need a check, and ${zones.filter(z => z.risk === 'ACTION').length} need action.

Ask me anything about grain storage, pests, ventilation, or spoilage signs.`,
      timestamp: new Date().toISOString(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const speakText = async (text: string) => {
    if (isSpeaking) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    try {
      const base64Audio = await generateSpeech(text);
      if (base64Audio) {
        const audio = new Audio(`data:audio/mpeg;base64,${base64Audio}`);
        audioRef.current = audio;
        audio.onended = () => { setIsSpeaking(false); audioRef.current = null; };
        audio.onerror = () => { setIsSpeaking(false); audioRef.current = null; };
        await audio.play();
      } else {
        setIsSpeaking(false);
      }
    } catch (e) {
      setIsSpeaking(false);
    }
  };

  const handleSend = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg) return;
    const userMsg: ChatMessage = { role: 'user', text: msg, timestamp: new Date().toISOString() };
    setHistory(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const allMessages = [...history, userMsg].map(m => ({ role: m.role, text: m.text }));
      const reply = await getAdvisoryResponse(allMessages, profile, zones);
      setHistory(prev => [...prev, { role: 'model', text: reply, timestamp: new Date().toISOString() }]);
    } catch (e) {
      setHistory(prev => [...prev, { role: 'model', text: '## FAM-GUARD AI is a **Pro Plan** feature\n\nPlease upgrade to **FAM-GUARD Plus** or **Pro** to unlock live AI advisory. Open the menu (☰) → **Plan** to upgrade.\n\nFor urgent pest or spoilage issues, call the Kisan Call Centre on **1800-180-1551**.', timestamp: new Date().toISOString() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 text-stone-900 dark:text-stone-100">
      {/* Header context strip */}
      <div className="px-4 md:px-8 py-3 bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--color-brand-forest)] text-white flex items-center justify-center shadow-md">
            <i className="fa-solid fa-seedling"></i>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">FAM-GUARD AI · TNAU/FAO Aligned</p>
            <p className="text-xs font-bold text-stone-700 dark:text-stone-300">
              {zones.length} zones live · Last sync {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
            <i className="fa-solid fa-circle text-[6px] animate-pulse"></i>Connected
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {history.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 md:p-5 rounded-[1.8rem] text-sm font-medium leading-relaxed ${
              msg.role === 'user'
                ? 'bg-[var(--color-brand-forest)] text-white rounded-tr-none shadow-lg'
                : 'bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 text-stone-800 dark:text-stone-200 rounded-tl-none shadow-md'
            }`}>
              <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:mb-2 prose-headings:mt-4 first:prose-headings:mt-0 prose-li:my-0.5">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
              {msg.role === 'model' && (
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-stone-100 dark:border-stone-800">
                  <button
                    onClick={() => speakText(msg.text)}
                    className="text-[var(--color-brand-leaf)] dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors flex items-center gap-1"
                  >
                    <i className={`fa-solid ${isSpeaking ? 'fa-stop' : 'fa-volume-high'}`}></i>
                    {isSpeaking ? 'Stop Audio' : 'Read Aloud'}
                  </button>
                  <span className="text-[9px] text-stone-400">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 p-5 rounded-[1.8rem] rounded-tl-none shadow-md">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-emerald-400 dark:bg-emerald-700 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-emerald-400 dark:bg-emerald-700 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-emerald-400 dark:bg-emerald-700 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={scrollRef}></div>
      </div>

      {/* Suggested prompts */}
      {history.length <= 1 && (
        <div className="px-4 md:px-6 pb-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Try asking…</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {SUGGESTED_PROMPTS.map(p => (
              <button
                key={p}
                onClick={() => handleSend(p)}
                className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-3 py-2 rounded-xl text-xs font-bold text-stone-700 dark:text-stone-300 hover:border-emerald-300 dark:hover:border-emerald-700 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all shrink-0 active:scale-95"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 md:p-6 bg-white dark:bg-stone-950 border-t border-stone-100 dark:border-stone-800 sticky bottom-0 z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
        <div className="flex gap-3">
          <button
            onClick={() => alert('Voice input listening… (Simulated for prototype.)')}
            className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 text-[var(--color-brand-leaf)] dark:text-emerald-400 rounded-2xl flex items-center justify-center shadow-inner hover:bg-emerald-100 dark:hover:bg-emerald-900/50 active:scale-90 transition-all border border-emerald-100 dark:border-emerald-800"
          >
            <i className="fa-solid fa-microphone text-xl"></i>
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about grain storage, pests, ventilation…"
            className="input-field flex-1"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="btn-primary w-14 h-14 flex items-center justify-center p-0"
          >
            <i className="fa-solid fa-paper-plane text-xl"></i>
          </button>
        </div>
        <p className="text-[10px] text-stone-400 text-center mt-3">
          FAM-GUARD AI provides general storage guidance. For urgent pest infestation or contamination, contact your nearest KVK or TNAU officer.
        </p>
      </div>
    </div>
  );
};

export default AdvisoryChat;
