import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { X, Mic, MicOff, Send, Bot, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Language = "en" | "te" | "hi";
type Message = { role: "user" | "assistant"; content: string };

const LANG_LABELS: Record<Language, string> = { en: "EN", te: "తె", hi: "हि" };
const LANG_NAMES: Record<Language, string> = { en: "English", te: "Telugu", hi: "Hindi" };

const QUICK_PROMPTS: Record<Language, string[]> = {
  en: ["Best time to sell tomatoes?", "Transport rates Hyderabad?", "Should I store or sell now?"],
  te: ["టమాటాలు ఎప్పుడు అమ్మాలి?", "నా పంట ధర ఎంత?", "నిల్వ చేయాలా అమ్మాలా?"],
  hi: ["टमाटर कब बेचें?", "भाड़ा दर क्या है?", "अभी बेचें या रखें?"],
};

// Stream SSE response from edge function
async function streamCopilot({
  messages,
  language,
  supabaseUrl,
  onDelta,
  onDone,
  onError,
}: {
  messages: Message[];
  language: Language;
  supabaseUrl: string;
  onDelta: (chunk: string) => void;
  onDone: () => void;
  onError: (err: string) => void;
}) {
  try {
    const resp = await fetch(`${supabaseUrl}/functions/v1/farmer-copilot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, language }),
    });

    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}));
      onError(data.error || `Error ${resp.status}`);
      return;
    }

    if (!resp.body) { onError("No response body"); return; }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let done = false;

    while (!done) {
      const { done: d, value } = await reader.read();
      if (d) break;
      buffer += decoder.decode(value, { stream: true });

      let newline: number;
      while ((newline = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, newline);
        buffer = buffer.slice(newline + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (!line.startsWith("data: ") || line.trim() === "") continue;
        const json = line.slice(6).trim();
        if (json === "[DONE]") { done = true; break; }
        try {
          const parsed = JSON.parse(json);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          buffer = line + "\n" + buffer;
          break;
        }
      }
    }
    onDone();
  } catch (e) {
    onError(e instanceof Error ? e.message : "Network error");
  }
}

export function AICopilot() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<Language>("en");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;

  // Greeting on open
  useEffect(() => {
    if (open && messages.length === 0) {
      const greetings: Record<Language, string> = {
        en: "🌾 Namaste! I'm your AgroSense AI Copilot. Ask me about best sell time, transport rates, storage options, or pre-harvest predictions!",
        te: "🌾 నమస్కారం! నేను మీ AgroSense AI కోపైలట్. అమ్మడానికి సరైన సమయం, రవాణా రేట్లు, నిల్వ ఎంపికలు — ఏదైనా అడగండి!",
        hi: "🌾 नमस्ते! मैं आपका AgroSense AI कोपायलट हूँ। बेचने का सही समय, ट्रांसपोर्ट रेट, स्टोरेज — कुछ भी पूछें!",
      };
      setMessages([{ role: "assistant", content: greetings[lang] }]);
    }
  }, [open]);

  // Re-greet on language change
  useEffect(() => {
    if (open && messages.length > 0) {
      const greetings: Record<Language, string> = {
        en: "Language switched to English. How can I help you?",
        te: "భాష తెలుగుకు మార్చబడింది. నేను ఎలా సహాయపడగలను?",
        hi: "भाषा हिंदी में बदल दी गई है। मैं कैसे मदद करूँ?",
      };
      setMessages((prev) => [...prev, { role: "assistant", content: greetings[lang] }]);
    }
  }, [lang]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setInput("");
    const userMsg: Message = { role: "user", content: userText };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    let assistantText = "";
    await streamCopilot({
      messages: [...messages, userMsg],
      language: lang,
      supabaseUrl,
      onDelta: (chunk) => {
        assistantText += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) =>
              i === prev.length - 1 ? { ...m, content: assistantText } : m
            );
          }
          return [...prev, { role: "assistant", content: assistantText }];
        });
      },
      onDone: () => setLoading(false),
      onError: (err) => {
        setLoading(false);
        toast({ variant: "destructive", title: "AI Error", description: err });
      },
    });
  };

  const toggleVoice = () => {
    type SpeechRecognitionCtor = new () => SpeechRecognitionEvent & {
      lang: string; interimResults: boolean;
      onresult: ((e: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => void) | null;
      onerror: (() => void) | null;
      onend: (() => void) | null;
      start: () => void; stop: () => void;
    };
    const w = window as unknown as { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;

    if (!SR) {
      toast({ title: "Not supported", description: "Voice input not supported on this browser." });
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const rec = new SR();
    rec.lang = lang === "te" ? "te-IN" : lang === "hi" ? "hi-IN" : "en-IN";
    rec.interimResults = false;
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-2xl hover:shadow-primary/40 hover:scale-110 transition-all flex items-center justify-center"
        title="AI Copilot"
      >
        <span className="text-2xl">🤖</span>
        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center animate-pulse">AI</span>
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-card rounded-2xl shadow-2xl border border-primary/20 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-foreground/20 flex items-center justify-center text-lg flex-shrink-0">🤖</div>
            <div className="flex-1 min-w-0">
              <div className="text-primary-foreground font-semibold text-sm leading-tight">AgroSense Copilot</div>
              <div className="text-primary-foreground/70 text-[10px]">AI · Sell Time · Transport · Storage</div>
            </div>
            {/* Language switcher */}
            <div className="flex gap-1 mr-1">
              {(["en", "te", "hi"] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  title={LANG_NAMES[l]}
                  className={`w-7 h-7 rounded-full text-[11px] font-bold transition-all ${
                    lang === l
                      ? "bg-primary-foreground text-primary"
                      : "bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/40"
                  }`}
                >
                  {LANG_LABELS[l]}
                </button>
              ))}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-primary-foreground hover:bg-primary/60 flex-shrink-0"
              onClick={() => setOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 h-72 overflow-y-auto p-3 space-y-2 bg-background/50"
          >
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-1.5 flex-shrink-0 mt-0.5 text-sm">🤖</div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted text-foreground rounded-tl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-1.5 text-sm">🤖</div>
                <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Thinking…</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick prompts */}
          <div className="px-3 pt-2 flex gap-1.5 flex-wrap border-t border-border/50">
            {QUICK_PROMPTS[lang].map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                disabled={loading}
                className="text-[10px] bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-1 hover:bg-primary/20 transition-colors disabled:opacity-50 leading-tight"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input bar */}
          <div className="p-3 flex gap-2 items-center">
            <button
              onClick={toggleVoice}
              className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center transition-all ${
                listening
                  ? "bg-destructive text-destructive-foreground animate-pulse"
                  : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
              }`}
              title={listening ? "Stop listening" : `Speak in ${LANG_NAMES[lang]}`}
            >
              {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder={
                lang === "te" ? "మీ ప్రశ్న అడగండి..." :
                lang === "hi" ? "अपना सवाल पूछें..." :
                "Ask your farming question..."
              }
              className="h-8 text-xs flex-1"
              disabled={loading}
            />
            <Button
              size="icon"
              className="h-8 w-8 flex-shrink-0 bg-primary"
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="px-3 pb-2 text-center">
            <span className="text-[9px] text-muted-foreground">Powered by Lovable AI · gemini-3-flash-preview</span>
          </div>
        </div>
      )}
    </>
  );
}
