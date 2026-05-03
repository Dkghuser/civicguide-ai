import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  ChevronRight, 
  RefreshCcw,
  Sparkles,
  Info
} from "lucide-react";
import { streamChatMessage, updateRoadmapStatus, generateVoterRoadmap, RoadmapStep } from "./lib/gemini";
import { Message, CivicState } from "./types";
import { ChatMessage } from "./components/ChatMessage";
import { RoadmapDisplay } from "./components/RoadmapDisplay";
import { PollingFinder } from "./components/PollingFinder";

export default function App() {
  const [state, setState] = useState<CivicState>({
    location: "",
    age: 0,
    roadmap: null,
    currentStepIndex: 0,
    messages: [
      { role: "assistant", content: "Hi! I'm CivicGuide AI. I can help you understand how to register and vote in your area. To get started, where are you located and what is your age?" }
    ],
    isLoading: false
  });

  const [inputValue, setInputValue] = useState("");
  const [showSetup, setShowSetup] = useState(true);
  const [locationInput, setLocationInput] = useState("");
  const [ageInput, setAgeInput] = useState("");
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.messages]);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationInput || !ageInput) return;

    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const roadmapData = await generateVoterRoadmap(locationInput, parseInt(ageInput));
      setState(prev => ({
        ...prev,
        location: locationInput,
        age: parseInt(ageInput),
        roadmap: roadmapData.steps,
        isLoading: false,
        messages: [
          ...prev.messages,
          { role: "user", content: `I'm in ${locationInput} and I'm ${ageInput} years old.` },
          { role: "assistant", content: `Great! I've generated a custom voter roadmap for ${locationInput}. ${roadmapData.advice}` }
        ]
      }));
      setShowSetup(false);
    } catch (err) {
      console.error(err);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const onSend = async () => {
    if (!inputValue.trim() || state.isLoading) return;

    const userMsg: Message = { role: "user", content: inputValue };
    const newMessages = [...state.messages, userMsg];
    const aiMessageIndex = newMessages.length;
    
    setState(prev => ({
      ...prev,
      messages: [...newMessages, { role: "assistant", content: "" }],
      isLoading: true
    }));
    setInputValue("");

    try {
      let isFirstChunk = true;
      await streamChatMessage(inputValue, newMessages, (chunk) => {
        setState(prev => {
          if (isFirstChunk) {
            isFirstChunk = false;
            prev.isLoading = false;
          }
          const msgs = [...prev.messages];
          msgs[aiMessageIndex] = { 
            ...msgs[aiMessageIndex], 
            content: msgs[aiMessageIndex].content + chunk 
          };
          return { ...prev, messages: msgs, isLoading: false };
        });
      });

      // After generation, evaluate if roadmap needs an update
      setState(prev => {
        if (prev.roadmap) {
          updateRoadmapStatus(prev.messages, prev.roadmap).then(updatedRoadmap => {
            setState(p => ({ ...p, roadmap: updatedRoadmap }));
          });
        }
        return { ...prev, isLoading: false };
      });

    } catch (err) {
      console.error(err);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] font-sans text-zinc-900 selection:bg-blue-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-bottom border-zinc-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">CivicGuide AI</h1>
              <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">Non-Partisan Assistant</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-medium text-zinc-500">
            <span className="hidden sm:inline flex items-center gap-1">
              <Info size={14} /> Fact-Checked by Gemini
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        <AnimatePresence mode="wait">
          {showSetup ? (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto mt-12"
            >
              <div className="bg-white p-8 rounded-3xl shadow-xl shadow-zinc-200/50 border border-zinc-100">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles size={32} />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Welcome to your Voter Path</h2>
                  <p className="text-zinc-500 text-sm">Enter your details to generate a customized roadmap for the upcoming election cycle.</p>
                </div>

                <form onSubmit={handleSetup} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Location (State/Region)</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                      <input
                        type="text"
                        value={locationInput}
                        onChange={(e) => setLocationInput(e.target.value)}
                        placeholder="e.g. Karnataka, California..."
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Your Age</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                      <input
                        type="number"
                        value={ageInput}
                        onChange={(e) => setAgeInput(e.target.value)}
                        placeholder="18"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                        required
                        min="1"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={state.isLoading}
                    className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {state.isLoading ? (
                      <RefreshCcw className="animate-spin" size={20} />
                    ) : (
                      <>
                        Generate My Roadmap
                        <ChevronRight size={20} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Sidebar Checklist */}
              <div className="lg:col-span-4 space-y-8">
                <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                      Your Voter Journey
                    </h3>
                  </div>
                  {state.roadmap && <RoadmapDisplay steps={state.roadmap} />}
                </div>

                <PollingFinder />
                
                <div className="p-6 bg-blue-600 rounded-3xl text-white shadow-xl shadow-blue-600/20">
                  <h4 className="font-bold mb-2 flex items-center gap-2">
                    <ShieldCheck size={18} />
                    Myth Buster
                  </h4>
                  <p className="text-xs text-blue-100 leading-relaxed">
                    Unsure about something you heard? Ask me! I'm trained to verify election procedures and correct misinformation with simple facts.
                  </p>
                </div>
              </div>

              {/* Chat Interface */}
              <div className="lg:col-span-8 flex flex-col h-[70vh] lg:h-[80vh] bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-6 scroll-smooth"
                >
                  {state.messages.map((msg, i) => (
                    <div key={i}>
                      <ChatMessage message={msg} />
                    </div>
                  ))}
                  {state.isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-3 mb-6"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                        <BotAnimation />
                      </div>
                      <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="p-4 border-t border-zinc-100">
                  <div className="relative max-w-4xl mx-auto flex gap-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && onSend()}
                      placeholder="Ask about registration, deadlines, or myths..."
                      className="flex-1 bg-zinc-50 border border-zinc-200 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-sm"
                    />
                    <button
                      onClick={onSend}
                      disabled={state.isLoading || !inputValue.trim()}
                      className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function BotAnimation() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  );
}
