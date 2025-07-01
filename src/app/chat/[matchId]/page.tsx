"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/supabaseClient";
import { useParams, useRouter } from "next/navigation";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export default function ChatPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/");
        return;
      }
      setUserId(user.id);
      const { data: msgs } = await supabase
        .from("messages")
        .select("id, sender_id, content, created_at")
        .eq("match_id", matchId)
        .order("created_at", { ascending: true });
      setMessages(msgs || []);
      setLoading(false);
    };
    fetchMessages();
    // Realtime-Subscription
    const channel = supabase
      .channel('messages-chat-' + matchId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` }, payload => {
        if (payload.eventType === 'INSERT') {
          setMessages(msgs => [...msgs, payload.new as Message]);
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !userId) return;
    await supabase.from("messages").insert({
      match_id: matchId,
      sender_id: userId,
      content: input.trim(),
    });
    setInput("");
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Lädt...</div>;
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-blue-100 to-white">
      <div className="w-full max-w-xs flex flex-col h-[80vh] bg-white rounded-xl shadow p-2">
        <div className="flex-1 overflow-y-auto p-2">
          {messages.length === 0 && <div className="text-center text-gray-400 mt-8">Noch keine Nachrichten.</div>}
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`mb-2 flex ${msg.sender_id === userId ? "justify-end" : "justify-start"}`}
            >
              <div className={`px-3 py-2 rounded-lg max-w-[70%] text-sm ${msg.sender_id === userId ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"}`}>
                {msg.content}
                <div className="text-[10px] text-right mt-1 opacity-60">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={sendMessage} className="flex gap-2 p-2 border-t">
          <input
            type="text"
            className="flex-1 rounded px-3 py-2 border"
            placeholder="Nachricht..."
            value={input}
            onChange={e => setInput(e.target.value)}
            required
            autoFocus
          />
          <button
            type="submit"
            className="bg-blue-600 text-white rounded px-4 py-2 font-semibold hover:bg-blue-700 transition"
            disabled={!input.trim()}
          >
            Senden
          </button>
        </form>
      </div>
    </main>
  );
} 