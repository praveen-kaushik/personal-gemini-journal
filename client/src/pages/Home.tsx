import { useMemo, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { startLogin } from "@/const";
import { firebaseReady, signInWithFirebase, signOutFirebase } from "@/lib/firebase";
import { ArrowRight, BookOpen, BrainCircuit, Loader2, LogOut, Orbit, Plus, ShieldCheck, Sparkles, Telescope } from "lucide-react";
import { toast } from "sonner";

const suggestedPrompts = ["What is asking for my attention lately?", "Help me explore a creative idea without judging it.", "Give me a gentle way to begin today."];

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const signIn = async () => { try { if (firebaseReady()) { await signInWithFirebase(); } else startLogin(); } catch (error) { toast.error(error instanceof Error ? error.message : "Sign-in could not be completed."); } 
  const createConversation = trpc.journal.createConversation.useMutation({ 
  onSuccess: (id) => { 
    if (id) {
      setConversationId(id); 
      setMessages([]); // Clear local temporary messages
      conversations.refetch();
      toast.success("New constellation started.");
    } else {
      toast.error("Failed to sync observatory session.");
    }
  },
  onError: (error) => toast.error(`Error: ${error.message}`)});};
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const conversations = trpc.journal.conversations.useQuery(undefined, { enabled: isAuthenticated });
  const current = trpc.journal.conversation.useQuery({ conversationId: conversationId! }, { enabled: Boolean(conversationId) });
  const latestInsight = trpc.journal.latestInsight.useQuery(undefined, { enabled: isAuthenticated });
  const createConversation = trpc.journal.createConversation.useMutation({ onSuccess: (id) => { setConversationId(id ?? null); setMessages([]); conversations.refetch(); } });
  const respond = trpc.journal.respond.useMutation({ onSuccess: ({ answer }) => { setMessages(prev => [...prev, { role: "assistant", content: answer }]); }, onError: (error) => toast.error(error.message) });
  const reflect = trpc.journal.reflect.useMutation({ onSuccess: () => { latestInsight.refetch(); toast.success("A new constellation is ready."); }, onError: (error) => toast.error(error.message) });

  const displayMessages = useMemo(() => current.data?.messages?.length ? current.data.messages.map(m => ({ role: m.role, content: m.content } as Message)) : messages, [current.data, messages]);
  const begin = () => {
  if (createConversation.isPending) return;
  createConversation.mutate({ title: "New constellation" });};
  const send = (content: string) => {
  // Check both the state and the mutation status
  if (!conversationId) { 
    toast.error("Start a new constellation first.", {
      description: "Click the 'New constellation' button above to begin.",
    }); 
    return; 
  }
  
  const next = [...displayMessages, { role: "user" as const, content }];
  setMessages(next);
  respond.mutate({ conversationId, content });};

  if (loading) return <div className="cosmic-shell flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-cyan-300" /></div>;
  if (!isAuthenticated) return <div className="cosmic-shell"><div className="stars" /><main className="relative mx-auto flex min-h-screen max-w-6xl items-center px-6 py-14"><div className="grid w-full items-center gap-12 lg:grid-cols-[1.05fr_.95fr]"><section className="space-y-8"><Badge className="border-cyan-300/30 bg-cyan-300/10 text-cyan-200">PRIVATE AI JOURNAL</Badge><div><p className="eyebrow">A quiet place between thoughts</p><h1 className="cosmic-title mt-3">Make space for<br /><span>what is emerging.</span></h1><p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">A private cosmic observatory for honest brainstorming, reflective journaling, and the small signals that become clear over time.</p></div><Button onClick={signIn} className="glow-button h-12 rounded-full px-7 text-base">Enter your observatory <ArrowRight className="ml-2 h-4 w-4" /></Button><div className="flex items-center gap-3 text-sm text-slate-400"><ShieldCheck className="h-4 w-4 text-cyan-300" /> Your journal is designed around private, user-scoped access.</div></section><div className="planet-card relative mx-auto h-[420px] w-full max-w-[460px]"><div className="planet-glow" /><div className="planet-orb"><div className="orb-ring ring-one" /><div className="orb-ring ring-two" /><div className="orb-shine" /></div><div className="flare flare-one" /><div className="flare flare-two" /><div className="orbit-label label-one">REFLECT</div><div className="orbit-label label-two">IMAGINE</div></div></div></main></div>;

  return <div className="cosmic-shell"><div className="stars" /><div className="nebula nebula-one" /><div className="nebula nebula-two" /><header className="relative z-10 border-b border-white/10"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5"><div className="flex items-center gap-3"><div className="brand-mark"><Orbit className="h-5 w-5" /></div><div><p className="text-sm font-semibold tracking-[.18em] text-white">LUMEN / ORBIT</p><p className="text-[11px] uppercase tracking-[.24em] text-slate-500">Personal Gemini Journal</p></div></div><div className="flex items-center gap-4"><div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex"><span className="status-dot" /> Private session · {user?.name ?? "Explorer"}</div><Button variant="ghost" size="icon" onClick={async () => { await signOutFirebase(); await logout(); }} className="text-slate-400 hover:bg-white/10 hover:text-white"><LogOut className="h-4 w-4" /></Button></div></div></header><main className="relative z-10 mx-auto max-w-7xl px-6 py-8"><div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow">Your inner sky</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Good evening, {user?.name?.split(" ")[0] ?? "explorer"}.</h1><p className="mt-2 text-slate-400">What would you like to bring into focus?</p></div><Button onClick={begin} disabled={createConversation.isPending} className="glow-button rounded-full"><Plus className="mr-2 h-4 w-4" /> New constellation</Button></div><div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]"><Card className="cosmic-panel min-h-[650px] overflow-hidden"><CardHeader className="border-b border-white/10 pb-4"><div className="flex items-center justify-between"><div><CardTitle className="flex items-center gap-2 text-lg text-white"><Sparkles className="h-4 w-4 text-cyan-300" /> Thoughtstream</CardTitle><p className="mt-1 text-sm text-slate-500">A non-judgmental space to think out loud with Gemini.</p></div><Badge variant="outline" className="border-cyan-300/20 text-cyan-200">{conversationId ? "LIVE" : "READY"}</Badge></div></CardHeader><CardContent className="p-0"><AIChatBox key={conversationId ?? "empty"} messages={displayMessages} onSendMessage={send} isLoading={respond.isPending} height="560px" className="rounded-none border-0 bg-transparent" placeholder="Write a thought, question, or possibility…" emptyStateMessage="Choose a prompt, or begin a new constellation." suggestedPrompts={conversationId ? suggestedPrompts : []} /></CardContent></Card><aside className="space-y-6"><Card className="cosmic-panel"><CardHeader><CardTitle className="flex items-center gap-2 text-base text-white"><Telescope className="h-4 w-4 text-violet-300" /> Reflection constellation</CardTitle><p className="text-sm leading-6 text-slate-400">Notice the recurring signals across your private journal history.</p></CardHeader><CardContent>{latestInsight.data ? <div className="space-y-4"><div className="flex flex-wrap gap-2">{latestInsight.data.themes.split(" · ").map(theme => <Badge key={theme} className="border-violet-300/20 bg-violet-300/10 text-violet-200">{theme}</Badge>)}</div><p className="text-sm leading-6 text-slate-300">{latestInsight.data.reflection}</p><Separator className="bg-white/10" /><p className="text-sm italic leading-6 text-cyan-100">“{latestInsight.data.followUpPrompt}”</p></div> : <div className="rounded-xl border border-dashed border-white/10 p-4 text-sm leading-6 text-slate-500">Your first reflection will appear here after a few journal moments.</div>}<Button onClick={() => reflect.mutate()} disabled={reflect.isPending} variant="outline" className="mt-5 w-full border-white/10 bg-white/5 text-slate-200 hover:bg-white/10">{reflect.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />} Generate private reflection</Button></CardContent></Card><Card className="cosmic-panel"><CardHeader><CardTitle className="flex items-center gap-2 text-base text-white"><BookOpen className="h-4 w-4 text-cyan-300" /> Recent orbits</CardTitle></CardHeader><CardContent className="space-y-2">{conversations.data?.length ? conversations.data.slice(0, 5).map(item => <button key={item.id} onClick={() => { setConversationId(item.id); setMessages([]); }} className="w-full rounded-lg px-3 py-3 text-left transition hover:bg-white/5"><p className="truncate text-sm text-slate-200">{item.title}</p><p className="mt-1 text-xs text-slate-500">{new Date(item.updatedAt).toLocaleDateString()}</p></button>) : <p className="text-sm leading-6 text-slate-500">No saved orbits yet. Your next thought can be the first.</p>}</CardContent></Card></aside></div></main></div>;
}
