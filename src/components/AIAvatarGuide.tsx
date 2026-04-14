import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Sparkles, Volume2, VolumeX, Play, RotateCcw, MessageSquare } from "lucide-react";
import aiDoctorAvatar from "@/assets/ai-doctor-avatar.png";
import type { AnalysisResult } from "@/services/labAnalyzer";

interface AIAvatarGuideProps {
  results: AnalysisResult;
}

type SummaryMode = "full" | "critical" | "lifestyle";

function generateMessages(results: AnalysisResult, mode: SummaryMode): string[] {
  const msgs: string[] = [];
  const { healthScore, abnormalTests, totalTests, tests } = results;

  if (mode === "critical") {
    const criticalTests = tests.filter(t => t.status.includes("critical"));
    if (criticalTests.length === 0) {
      msgs.push("Great news — no critical findings in your report! All values are within safe ranges.");
    } else {
      msgs.push(`⚠️ You have ${criticalTests.length} critical findings that need immediate attention.`);
      criticalTests.forEach(t => {
        msgs.push(`🔴 ${t.name}: ${t.rawValue} — This is critically ${t.status.includes("high") ? "high" : "low"} (normal: ${t.normalRange}). Please see a doctor right away.`);
      });
    }
    return msgs;
  }

  if (mode === "lifestyle") {
    msgs.push("Here are some lifestyle tips based on your results:");
    if (tests.some(t => t.panel === "Blood Sugar" && t.status !== "normal")) {
      msgs.push("🍎 Your blood sugar needs attention. Reduce refined carbs, increase fiber, and consider regular walks after meals.");
    }
    if (tests.some(t => t.panel === "Lipid Profile" && t.status !== "normal")) {
      msgs.push("❤️ Focus on heart health: choose healthy fats, eat more omega-3 rich foods, and exercise 30 minutes daily.");
    }
    if (tests.some(t => t.name === "Iron" && t.status !== "normal")) {
      msgs.push("🥬 Boost your iron with spinach, lentils, and vitamin C-rich foods for better absorption.");
    }
    if (tests.some(t => t.panel === "Electrolytes" && t.status !== "normal")) {
      msgs.push("💧 Stay well hydrated and ensure balanced electrolyte intake through bananas, coconut water, and leafy greens.");
    }
    if (msgs.length === 1) msgs.push("✅ Your results look good! Keep up a balanced diet, regular exercise, and good sleep habits.");
    return msgs;
  }

  // Full summary
  if (healthScore >= 80) {
    msgs.push("Great news! Your overall health looks really good. Let me walk you through the details.");
  } else if (healthScore >= 60) {
    msgs.push("I've reviewed your results. Most things look fine, but there are a few areas that need attention.");
  } else {
    msgs.push("I need to flag some important findings. Please review carefully and consult your doctor soon.");
  }

  msgs.push(`I analyzed ${totalTests} tests across ${results.panels.length} panels. ${results.normalTests} came back normal and ${abnormalTests} need attention.`);

  const criticalTests = tests.filter(t => t.status.includes("critical"));
  const slightlyOff = tests.filter(t => t.status.includes("slightly"));

  if (criticalTests.length > 0) {
    msgs.push(`⚠️ Critical: ${criticalTests.map(t => t.name).join(", ")} — these values need immediate medical attention.`);
  }
  if (slightlyOff.length > 0) {
    msgs.push(`${slightlyOff.map(t => t.name).join(", ")} are slightly outside normal — not dangerous but worth monitoring.`);
  }

  msgs.push("Scroll down for detailed panel breakdowns, recommendations, and when to see a doctor. Remember — I'm an AI assistant, not a replacement for your doctor! 😊");
  return msgs;
}

const modeLabels: Record<SummaryMode, string> = {
  full: "Full Summary",
  critical: "Critical Only",
  lifestyle: "Lifestyle Tips",
};

const AIAvatarGuide = ({ results }: AIAvatarGuideProps) => {
  const [mode, setMode] = useState<SummaryMode>("full");
  const messages = generateMessages(results, mode);
  const [currentMsg, setCurrentMsg] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setCurrentMsg(0);
  }, [mode]);

  useEffect(() => {
    setDisplayedText("");
    setIsTyping(true);
    const text = messages[currentMsg];
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 18);
    return () => clearInterval(interval);
  }, [currentMsg, mode]);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[⚠️🔴🍎❤️🥬💧✅😊]/g, ""));
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  useEffect(() => {
    if (!isMuted && !isTyping) {
      speak(messages[currentMsg]);
    }
    return () => { stopSpeaking(); };
  }, [currentMsg, isTyping, isMuted]);

  const toggleMute = () => {
    if (!isMuted) {
      stopSpeaking();
    }
    setIsMuted(!isMuted);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-24"
    >
      <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-24 h-24 rounded-full bg-accent/10 blur-3xl" />

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 relative z-10">
          <motion.div
            className="relative"
            animate={isSpeaking ? { y: [0, -2, 0, -1, 0] } : { y: [0, -3, 0] }}
            transition={isSpeaking ? { duration: 0.6, repeat: Infinity } : { duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className={`w-14 h-14 rounded-full overflow-hidden ring-2 ring-offset-2 ring-offset-card shadow-lg transition-all duration-300 ${isSpeaking ? "ring-status-normal shadow-[0_0_20px_hsl(var(--status-normal)/0.3)]" : "ring-primary/30"}`}>
              <img src={aiDoctorAvatar} alt="AI Doctor" className="w-full h-full object-cover" width={512} height={512} />
            </div>
            <motion.div
              className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-card ${isSpeaking ? "bg-status-normal" : "bg-status-normal"}`}
              animate={isSpeaking ? { scale: [1, 1.4, 1] } : { scale: [1, 1.2, 1] }}
              transition={{ duration: isSpeaking ? 0.8 : 2, repeat: Infinity }}
            />
          </motion.div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-sm text-foreground">Dr. AI</span>
              <Sparkles className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-[10px] text-muted-foreground">
              {isSpeaking ? "Speaking..." : "AI Health Assistant"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={toggleMute} className="p-1.5 rounded-lg hover:bg-secondary/80 transition-colors" title={isMuted ? "Unmute" : "Mute"}>
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-muted-foreground" /> : <Volume2 className="w-3.5 h-3.5 text-primary" />}
            </button>
            <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 rounded-lg hover:bg-secondary/80 transition-colors">
              {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative z-10"
            >
              {/* Mode switcher */}
              <div className="flex gap-1 mb-3 bg-secondary/50 rounded-lg p-0.5">
                {(Object.keys(modeLabels) as SummaryMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 text-[9px] font-medium py-1 px-1.5 rounded-md transition-all ${
                      mode === m ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {modeLabels[m]}
                  </button>
                ))}
              </div>

              {/* Chat bubble */}
              <motion.div
                key={`${mode}-${currentMsg}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary/5 border border-primary/10 rounded-xl rounded-tl-sm p-3.5 mb-3"
              >
                {showSubtitles && (
                  <p className="text-xs text-foreground/85 leading-relaxed min-h-[3rem]">
                    {displayedText}
                    {isTyping && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        className="inline-block w-1 h-3.5 bg-primary ml-0.5 align-middle"
                      />
                    )}
                  </p>
                )}
              </motion.div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  {messages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentMsg(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === currentMsg ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex gap-1">
                  {!isMuted && (
                    <button
                      onClick={() => speak(messages[currentMsg])}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors flex items-center gap-1"
                    >
                      <Play className="w-2.5 h-2.5" />
                      Replay
                    </button>
                  )}
                  <button
                    onClick={() => setCurrentMsg(Math.max(0, currentMsg - 1))}
                    disabled={currentMsg === 0}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-secondary hover:bg-secondary/80 text-muted-foreground disabled:opacity-30 transition-colors"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setCurrentMsg(Math.min(messages.length - 1, currentMsg + 1))}
                    disabled={currentMsg === messages.length - 1}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary disabled:opacity-30 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>

              {/* Accessibility toggles */}
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/30">
                <button
                  onClick={() => setShowSubtitles(!showSubtitles)}
                  className={`text-[9px] px-2 py-0.5 rounded-md transition-colors flex items-center gap-1 ${showSubtitles ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}
                >
                  <MessageSquare className="w-2.5 h-2.5" />
                  Subtitles
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-3 glass-card rounded-xl p-4 space-y-2.5"
      >
        <h4 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Quick Summary</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Health Score</span>
            <span className={`text-xs font-bold ${results.healthScore >= 80 ? "text-status-normal" : results.healthScore >= 60 ? "text-status-attention" : "text-status-critical"}`}>
              {results.healthScore}/100
            </span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${results.healthScore}%` }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 1 }}
              className="h-full rounded-full hero-gradient"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="text-center p-2 rounded-lg bg-status-normal/10">
            <div className="text-sm font-bold text-status-normal">{results.normalTests}</div>
            <div className="text-[9px] text-muted-foreground">Normal</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-status-critical/10">
            <div className="text-sm font-bold text-status-critical">{results.abnormalTests}</div>
            <div className="text-[9px] text-muted-foreground">Flagged</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AIAvatarGuide;
