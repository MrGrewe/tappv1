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
    return <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 text-xl font-semibold text-gray-700">Lädt...</div>;
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 px-4">
      <div className="w-full max-w-md flex flex-col h-[80vh] bg-white/90 rounded-2xl shadow-xl p-4 border border-gray-100">
        <div className="flex-1 overflow-y-auto p-2">
          {messages.length === 0 && <div className="text-center text-gray-400 mt-8 text-base">Noch keine Nachrichten.</div>}
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`mb-3 flex ${msg.sender_id === userId ? "justify-end" : "justify-start"}`}
            >
              <div className={`px-4 py-2 rounded-2xl max-w-[70%] text-base shadow font-medium ${msg.sender_id === userId ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"}`}>
                {msg.content}
                <div className="text-[11px] text-right mt-1 opacity-60">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={sendMessage} className="flex gap-2 p-2 border-t mt-2 bg-white rounded-b-2xl">
          <input
            type="text"
            className="flex-1 rounded-lg px-4 py-3 border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Nachricht..."
            value={input}
            onChange={e => setInput(e.target.value)}
            required
            autoFocus
          />
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-lg px-5 py-3 font-semibold text-base hover:bg-blue-700 active:bg-blue-800 transition shadow-md disabled:opacity-60"
            disabled={!input.trim()}
          >
            Senden
          </button>
        </form>
      </div>
    </main>
  );
} 