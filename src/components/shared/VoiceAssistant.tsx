import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";

const VOICE_RESPONSES: Record<string, string> = {
  "harvest tomato": "Best harvest date for Tomato: October 15, 2024. Harvest Readiness Score is 78/100. Weather forecast shows rain on Oct 17 — harvest before that for optimal quality.",
  "sell crop": "Top 3 recommended markets: 1) Hyderabad Rythu Bazar — ₹35/kg, 2) Secunderabad Market — ₹33/kg, 3) Warangal Wholesale — ₹30/kg. Hyderabad has 25% higher demand this week.",
  "weather": "Current weather: 32°C, 68% humidity. Heavy rainfall expected in 2 days. Recommend harvesting ripe crops before Wednesday.",
  "loan": "Your loan eligibility score is 87/100. You qualify for up to ₹1,20,000 under PM Kisan Credit Card at 4% interest. Pre-orders from BigMart increase your eligibility.",
  "price": "Current tomato price: ₹28/kg. AI forecast shows prices rising to ₹35/kg in 2 weeks due to festival demand in Hyderabad. Good time to hold if storage is available.",
  "default": "I can help you with harvest timing, market prices, weather alerts, loans, and crop management. Ask me anything!",
};

function getResponse(query: string): string {
  const lower = query.toLowerCase();
  for (const [key, val] of Object.entries(VOICE_RESPONSES)) {
    if (key !== "default" && lower.includes(key.split(" ")[0])) return val;
  }
  return VOICE_RESPONSES.default;
}

export function VoiceAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "👋 Hello! I'm your AgroSense AI assistant. Ask me about harvest timing, market prices, weather, or loans!" },
  ]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "ai", text: getResponse(userMsg) }]);
    }, 800);
  };

  const simulateListen = () => {
    setListening(true);
    setTimeout(() => {
      setListening(false);
      setInput("When should I harvest tomatoes?");
    }, 2000);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center text-2xl"
      >
        🤖
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-card rounded-2xl shadow-2xl border border-primary/20 overflow-hidden animate-fade-in">
          <div className="bg-primary px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <div>
                <div className="text-primary-foreground font-semibold text-sm">AgroSense AI</div>
                <div className="text-primary-foreground/70 text-xs">Powered by AI</div>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary-foreground hover:bg-primary/80" onClick={() => setOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <ScrollArea className="h-64 p-3">
            <div className="space-y-2">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                    msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="p-3 border-t border-border flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask anything..."
              className="text-xs h-8"
            />
            <Button
              size="icon"
              variant="outline"
              className={`h-8 w-8 flex-shrink-0 ${listening ? "bg-destructive/20 border-destructive" : ""}`}
              onClick={simulateListen}
            >
              🎤
            </Button>
            <Button size="icon" className="h-8 w-8 flex-shrink-0 bg-primary" onClick={send}>→</Button>
          </div>
          <div className="px-3 pb-2 flex gap-1 flex-wrap">
            {["Harvest tomato?", "Best market?", "Price forecast"].map((q) => (
              <button key={q} onClick={() => { setInput(q); }} className="text-[10px] bg-muted text-muted-foreground rounded-full px-2 py-0.5 hover:bg-primary/10 transition-colors">
                {q}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
