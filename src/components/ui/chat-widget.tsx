"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send } from "lucide-react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Sorry, I am unable to reply at the moment." },
        ]);
        return;
      }
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "A network issue occurred, please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 flex h-[450px] w-[350px] flex-col overflow-hidden rounded-2xl border border-border/60 bg-background/95 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-border/60 bg-card/50 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-hero text-xs font-bold text-primary-foreground">M</span>
                <span className="font-serif text-lg font-medium tracking-tight">Support</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close chat" className="h-8 w-8 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
              {messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center space-y-3 text-center text-muted-foreground">
                  <MessageCircle className="h-10 w-10 opacity-20" />
                  <p className="text-sm">
                    Ask something — I can help with products, orders, and shipping.
                  </p>
                </div>
              )}
              {messages.map((m, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i}
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.role === "user"
                      ? "ml-auto rounded-br-sm bg-gradient-hero text-primary-foreground shadow-sm"
                      : "rounded-bl-sm bg-muted text-foreground"
                  }`}
                >
                  {m.content}
                </motion.div>
              ))}
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5 py-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/40"></span>
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/40" style={{ animationDelay: "150ms" }}></span>
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/40" style={{ animationDelay: "300ms" }}></span>
                  </span>
                </motion.div>
              )}
            </div>

            <div className="border-t border-border/60 bg-card/50 p-3">
              <div className="flex items-center gap-2 rounded-full border border-border bg-background px-2 py-1 shadow-sm focus-within:ring-1 focus-within:ring-primary/50">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Message..."
                  disabled={loading}
                  className="h-9 border-0 bg-transparent px-2 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button size="icon" onClick={sendMessage} disabled={loading || !input.trim()} className="h-8 w-8 shrink-0 rounded-full bg-gradient-hero text-primary-foreground shadow-sm hover:opacity-90">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        size="icon"
        className={`h-14 w-14 rounded-full bg-gradient-hero text-primary-foreground shadow-gold transition-all duration-300 hover:scale-105 hover:opacity-90 ${open ? "pointer-events-none scale-90 opacity-0" : "scale-100 opacity-100"}`}
        onClick={() => setOpen(true)}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </div>
  );
}