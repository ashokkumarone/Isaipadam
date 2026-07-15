import React, { useState, useEffect } from 'react';
import { Send, Users, Vote, Heart, MessageSquare, Zap } from 'lucide-react';

interface ActiveAudienceProps {
  trackId: string;
  isIplStream: boolean;
}

export default function ActiveAudience({ trackId, isIplStream }: ActiveAudienceProps) {
  // Local state for Polling
  const [cskVotes, setCskVotes] = useState(254200);
  const [miVotes, setMiVotes] = useState(142100);
  const [votedOption, setVotedOption] = useState<string | null>(null);

  // Reaction counters
  const [reactions, setReactions] = useState({
    fire: 24500,
    shock: 18200,
    applause: 12100,
    cricket: 31200,
  });

  // Chat comments list
  const [chatList, setChatList] = useState([
    { id: 1, name: 'RajeshCSK', avatar: 'R', text: 'Dhoni finishing it in style! 🏏🔥', color: 'text-yellow-500' },
    { id: 2, name: 'Vikram_MI', avatar: 'V', text: 'Boom boom Bumrah is ready today! 💙', color: 'text-blue-500' },
    { id: 3, name: 'PriyaS', avatar: 'P', text: 'This polling feature on TuneTube is absolutely amazing! 👏', color: 'text-purple-500' },
  ]);
  const [inputMsg, setInputMsg] = useState('');

  // Handle live chat ticking simulation
  useEffect(() => {
    const chatTemplates = isIplStream
      ? [
          { name: 'Karthik_Super', text: 'Yellow Army storming Chepauk today! 💛🦁', color: 'text-yellow-500' },
          { name: 'RohitFanatic', text: 'Pull shot master Rohit is set! 💥', color: 'text-blue-500' },
          { name: 'Srinivasan', text: 'Thala Dhoni coming at No.8 will still hit 3 sixes!', color: 'text-yellow-600' },
          { name: 'Nisha_MI', text: 'Mumbai Indians are bowling first, nice call!', color: 'text-blue-400' },
          { name: 'RonaldoLover', text: 'Wait is this CSK vs MI? Let\'s go!', color: 'text-gray-400' },
        ]
      : [
          { name: 'ZenStudy', text: 'Finally finished my React tutorial! ☕', color: 'text-green-500' },
          { name: 'CodeGrind', text: 'Lofi beats keep me sane at 2 AM 💻☕', color: 'text-indigo-400' },
          { name: 'Nila_S', text: 'Rain in Chennai + Lofi Girl = Bliss ❤️', color: 'text-purple-400' },
          { name: 'VibeCheck', text: 'Greetings from Japan! Best coding radio 🌸', color: 'text-pink-400' },
        ];

    const interval = setInterval(() => {
      const template = chatTemplates[Math.floor(Math.random() * chatTemplates.length)];
      setChatList((prev) => [
        ...prev.slice(-20), // limit chat list length
        {
          id: Date.now(),
          name: template.name,
          avatar: template.name.charAt(0),
          text: template.text,
          color: template.color,
        },
      ]);

      // Ticker votes & reactions randomly
      setCskVotes((v) => v + Math.floor(Math.random() * 8) + 1);
      setMiVotes((v) => v + Math.floor(Math.random() * 5) + 1);
      setReactions((r) => ({
        fire: r.fire + Math.floor(Math.random() * 3),
        shock: r.shock + Math.floor(Math.random() * 2),
        applause: r.applause + Math.floor(Math.random() * 2),
        cricket: r.cricket + Math.floor(Math.random() * 4),
      }));
    }, 2500);

    return () => clearInterval(interval);
  }, [isIplStream]);

  const handleVote = (option: 'csk' | 'mi') => {
    if (votedOption) return;
    setVotedOption(option);
    if (option === 'csk') {
      setCskVotes((v) => v + 1);
    } else {
      setMiVotes((v) => v + 1);
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    setChatList((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: 'You (Ashok Kumar)',
        avatar: 'Y',
        text: inputMsg,
        color: 'text-red-500 font-bold',
      },
    ]);
    setInputMsg('');
  };

  const triggerReaction = (type: 'fire' | 'shock' | 'applause' | 'cricket') => {
    setReactions((prev) => ({
      ...prev,
      [type]: prev[type] + 1,
    }));
  };

  const totalVotes = cskVotes + miVotes;
  const cskPercentage = totalVotes > 0 ? Math.round((cskVotes / totalVotes) * 100) : 50;
  const miPercentage = totalVotes > 0 ? Math.round((miVotes / totalVotes) * 100) : 50;

  return (
    <div className="bg-theme-card border border-theme-border rounded-3xl p-6 h-full flex flex-col justify-between shadow-2xl relative overflow-hidden select-none">
      <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-[50px] rounded-full pointer-events-none"></div>

      {/* Header section */}
      <div className="flex items-center justify-between border-b border-theme-border pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00e676] animate-pulse"></div>
          <span className="text-sm font-extrabold text-theme-text">Active Audience Arena</span>
        </div>
        <div className="flex items-center gap-1 bg-theme-sidebar px-2.5 py-1 rounded-full border border-theme-border text-[10px] font-extrabold text-theme-highlight">
          <Users className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>SIMULATED LIVE</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-1">
        {/* Polling Module */}
        <div className="bg-theme-sidebar rounded-2xl p-4 border border-theme-border">
          <div className="flex items-center gap-2 mb-3">
            <Vote className="w-4 h-4 text-red-500" />
            <span className="text-xs font-bold text-theme-text">
              {isIplStream ? '🏏 Who will win Match 42?' : '☕ What is your study stack?'}
            </span>
          </div>

          <div className="space-y-2.5">
            {/* Option 1 */}
            <button
              onClick={() => handleVote('csk')}
              disabled={!!votedOption}
              className="w-full relative py-3 px-4 rounded-xl text-left overflow-hidden transition-all duration-300 border border-theme-border hover:border-theme-text-muted/30 disabled:cursor-default"
            >
              <div
                className="absolute inset-y-0 left-0 bg-yellow-500/10 transition-all duration-500"
                style={{ width: `${votedOption ? cskPercentage : 0}%` }}
              ></div>
              <div className="relative flex justify-between items-center text-xs font-bold text-theme-text">
                <span>{isIplStream ? '🟡 Chennai Super Kings' : '💻 Full-stack Web (React + Node)'}</span>
                {votedOption && <span className="text-yellow-500">{cskPercentage}%</span>}
              </div>
            </button>

            {/* Option 2 */}
            <button
              onClick={() => handleVote('mi')}
              disabled={!!votedOption}
              className="w-full relative py-3 px-4 rounded-xl text-left overflow-hidden transition-all duration-300 border border-theme-border hover:border-theme-text-muted/30 disabled:cursor-default"
            >
              <div
                className="absolute inset-y-0 left-0 bg-blue-500/10 transition-all duration-500"
                style={{ width: `${votedOption ? miPercentage : 0}%` }}
              ></div>
              <div className="relative flex justify-between items-center text-xs font-bold text-theme-text">
                <span>{isIplStream ? '🔵 Mumbai Indians' : '🎨 Creative & UX (Figma + CSS)'}</span>
                {votedOption && <span className="text-blue-500">{miPercentage}%</span>}
              </div>
            </button>
          </div>

          <p className="text-[9px] text-theme-text-muted/70 font-semibold text-right mt-2">
            {(totalVotes / 1000).toFixed(0)}K votes total · {votedOption ? 'Vote logged!' : 'Click to log vote'}
          </p>
        </div>

        {/* Reaction Chip module */}
        <div>
          <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-theme-text-muted mb-3">
            ⚡ Quick React Live
          </h4>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => triggerReaction('fire')}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-theme-sidebar border border-theme-border hover:bg-theme-sidebar-hover transition cursor-pointer active:scale-95"
            >
              <span className="text-base">🔥</span>
              <span className="text-[10px] font-bold text-theme-text">
                {(reactions.fire / 1000).toFixed(1)}K
              </span>
            </button>
            <button
              onClick={() => triggerReaction('shock')}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-theme-sidebar border border-theme-border hover:bg-theme-sidebar-hover transition cursor-pointer active:scale-95"
            >
              <span className="text-base">😱</span>
              <span className="text-[10px] font-bold text-theme-text">
                {(reactions.shock / 1000).toFixed(1)}K
              </span>
            </button>
            <button
              onClick={() => triggerReaction('applause')}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-theme-sidebar border border-theme-border hover:bg-theme-sidebar-hover transition cursor-pointer active:scale-95"
            >
              <span className="text-base">👏</span>
              <span className="text-[10px] font-bold text-theme-text">
                {(reactions.applause / 1000).toFixed(1)}K
              </span>
            </button>
            <button
              onClick={() => triggerReaction('cricket')}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-theme-sidebar border border-theme-border hover:bg-theme-sidebar-hover transition cursor-pointer active:scale-95"
            >
              <span className="text-base">{isIplStream ? '🏏' : '☕'}</span>
              <span className="text-[10px] font-bold text-theme-text">
                {(reactions.cricket / 1000).toFixed(1)}K
              </span>
            </button>
          </div>
        </div>

        {/* Rolling Live Chat stream */}
        <div className="border-t border-theme-border pt-4 flex-1 flex flex-col min-h-[160px]">
          <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-theme-text-muted mb-3">
            💬 Simulated Live Chat
          </h4>
          <div className="flex-1 overflow-y-auto space-y-3 h-[180px] pr-1">
            {chatList.map((chat) => (
              <div key={chat.id} className="flex gap-2.5 items-start text-xs leading-relaxed">
                <div className="w-6 h-6 rounded-full bg-theme-sidebar border border-theme-border flex items-center justify-center font-extrabold text-theme-text text-[10px] shrink-0">
                  {chat.avatar}
                </div>
                <div>
                  <span className={`font-bold mr-1.5 ${chat.color}`}>{chat.name}</span>
                  <span className="text-theme-text-secondary">{chat.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Input messaging form */}
      <form onSubmit={handleSendChat} className="flex gap-2 mt-4 pt-4 border-t border-theme-border">
        <input
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          placeholder="Send a live message..."
          className="flex-1 bg-theme-sidebar border border-theme-border rounded-xl px-4 py-2.5 text-xs text-theme-text placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors animate-fade-in"
        />
        <button
          type="submit"
          className="bg-red-500 hover:bg-red-400 text-white p-2.5 rounded-xl flex items-center justify-center active:scale-95 transition cursor-pointer"
        >
          <Send className="w-4 h-4 fill-white" />
        </button>
      </form>
    </div>
  );
}
