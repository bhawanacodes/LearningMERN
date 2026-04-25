import React, { useState, useRef, useEffect } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  icon: string;
  label: string;
  active?: boolean;
}

interface BentoInsight {
  icon: string;
  title: string;
  value: string;
  sub?: string;
  colSpan?: boolean;
}

type MessageRole = 'ai' | 'user';

interface ChatMessage {
  id: number;
  role: MessageRole;
  text?: string;
  bentoInsights?: BentoInsight[];
  timestamp: string;
  isTyping?: boolean;
}

// ── Static data ───────────────────────────────────────────────────────────────

const sideNavItems: NavItem[] = [
  { icon: 'home', label: 'Home' },
  { icon: 'auto_awesome', label: 'Kaira AI', active: true },
  { icon: 'horoscope', label: 'Horoscope' },
  { icon: 'group', label: 'Community' },
  { icon: 'person', label: 'Profile' },
];

const bottomNavItems: NavItem[] = [
  { icon: 'home', label: 'Home' },
  { icon: 'horoscope', label: 'Horoscope' },
  { icon: 'auto_awesome', label: 'Kaira', active: true },
  { icon: 'group', label: 'Community' },
  { icon: 'person', label: 'Profile' },
];

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    role: 'ai',
    text: 'Namaste! 🙏 I\'m Kaira, your cosmic guide. The stars have a lot to tell you today. Here\'s what the universe has in store for you...',
    bentoInsights: [
      { icon: 'wb_sunny', title: 'Sun Sign', value: 'Scorpio', sub: '♏ Deep & Intense' },
      { icon: 'brightness_3', title: 'Moon Sign', value: 'Cancer', sub: '♋ Emotional' },
      { icon: 'bolt', title: 'Rising Sign', value: 'Aries', sub: '♈ Bold Energy' },
      {
        icon: 'favorite',
        title: 'Love & Relationships',
        value: 'Venus in your 7th house brings harmony. A meaningful conversation today could deepen your bond.',
        colSpan: true,
      },
      {
        icon: 'trending_up',
        title: 'Career Fortune',
        value: '87%',
        sub: 'Mercury supports your communication skills',
      },
      {
        icon: 'self_improvement',
        title: 'Spiritual Energy',
        value: 'High',
        sub: 'Jupiter blesses your intuition',
      },
      {
        icon: 'diamond',
        title: "Today's Lucky Charm",
        value: 'Ruby Stone',
        sub: 'Wear red for confidence & power',
        colSpan: true,
      },
    ],
    timestamp: '9:41 AM',
  },
  {
    id: 2,
    role: 'user',
    text: 'What should I focus on for my career this week?',
    timestamp: '9:43 AM',
  },
  {
    id: 3,
    role: 'ai',
    isTyping: true,
    timestamp: '9:44 AM',
  },
];

// ── Helper components ─────────────────────────────────────────────────────────

const MaterialIcon: React.FC<{ name: string; className?: string; filled?: boolean; style?: React.CSSProperties }> = ({
  name,
  className = '',
  filled = false,
  style,
}) => (
  <span
    className={`material-symbols-rounded ${className}`}
    style={{
      fontVariationSettings: filled
        ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
        : "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24",
      ...style,
    }}
  >
    {name}
  </span>
);

const BentoCard: React.FC<{ insight: BentoInsight }> = ({ insight }) => (
  <div
    className={`rounded-xl p-3 ${insight.colSpan ? 'col-span-2' : ''}`}
    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
  >
    <div className="flex items-center gap-2 mb-1">
      <MaterialIcon
        name={insight.icon}
        className="text-sm"
        filled
        style={{ fontSize: '14px', color: '#a78bfa' }}
      />
      <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
        {insight.title}
      </span>
    </div>
    <p className="text-white font-semibold text-sm leading-snug">{insight.value}</p>
    {insight.sub && (
      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
        {insight.sub}
      </p>
    )}
  </div>
);

const TypingIndicator: React.FC = () => (
  <div className="flex gap-3 max-w-[85%]">
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
    >
      <MaterialIcon name="auto_awesome" style={{ fontSize: '14px', color: 'white' }} filled />
    </div>
    <div
      className="rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5"
      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full animate-bounce"
          style={{
            background: 'rgba(167,139,250,0.8)',
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

const KairaAstrologyChat: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const nextIdRef = useRef(initialMessages.length + 1);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const sendMessage = () => {
    const text = inputValue.trim();
    if (!text) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add user message, replace any existing typing indicator with the user message + new typing indicator
    setMessages((prev) => {
      const withoutTyping = prev.filter((m) => !m.isTyping);
      const userMsg: ChatMessage = { id: nextIdRef.current++, role: 'user', text, timestamp: now };
      const typingMsg: ChatMessage = { id: nextIdRef.current++, role: 'ai', isTyping: true, timestamp: now };
      return [...withoutTyping, userMsg, typingMsg];
    });

    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0a0015 0%, #0d0025 30%, #060012 60%, #0a0015 100%)',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── Background decorative elements ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        {/* Gradient orbs */}
        <div
          className="absolute rounded-full opacity-20 blur-3xl"
          style={{
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)',
            top: '-100px',
            left: '-100px',
          }}
        />
        <div
          className="absolute rounded-full opacity-15 blur-3xl"
          style={{
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, #4f46e5 0%, transparent 70%)',
            bottom: '0',
            right: '0',
          }}
        />
        <div
          className="absolute rounded-full opacity-10 blur-2xl"
          style={{
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, #9333ea 0%, transparent 70%)',
            top: '40%',
            left: '30%',
          }}
        />

        {/* Mandala SVG */}
        <svg
          className="absolute opacity-5"
          style={{ width: '600px', height: '600px', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g fill="none" stroke="#a78bfa" strokeWidth="0.3">
            <circle cx="100" cy="100" r="90" />
            <circle cx="100" cy="100" r="75" />
            <circle cx="100" cy="100" r="60" />
            <circle cx="100" cy="100" r="45" />
            <circle cx="100" cy="100" r="30" />
            <circle cx="100" cy="100" r="15" />
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 30 * Math.PI) / 180;
              return (
                <line
                  key={i}
                  x1={100 + Math.cos(angle) * 15}
                  y1={100 + Math.sin(angle) * 15}
                  x2={100 + Math.cos(angle) * 90}
                  y2={100 + Math.sin(angle) * 90}
                />
              );
            })}
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i * 45 * Math.PI) / 180;
              const x = 100 + Math.cos(angle) * 55;
              const y = 100 + Math.sin(angle) * 55;
              return <circle key={i} cx={x} cy={y} r="4" />;
            })}
          </g>
        </svg>
      </div>

      {/* ── Side Navigation (desktop) ── */}
      <nav
        className="hidden lg:flex flex-col items-center py-6 gap-2 flex-shrink-0"
        style={{
          width: '72px',
          background: 'rgba(255,255,255,0.03)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          zIndex: 10,
        }}
      >
        {/* Logo */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
        >
          <MaterialIcon name="auto_awesome" style={{ color: 'white', fontSize: '20px' }} filled />
        </div>

        {/* Nav items */}
        <div className="flex flex-col items-center gap-1 flex-1">
          {sideNavItems.map((item) => (
            <button
              key={item.label}
              title={item.label}
              className="relative w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all duration-200 group"
              style={{
                background: item.active ? 'rgba(124,58,237,0.25)' : 'transparent',
                border: item.active ? '1px solid rgba(124,58,237,0.4)' : '1px solid transparent',
              }}
            >
              <MaterialIcon
                name={item.icon}
                filled={item.active}
                style={{
                  fontSize: '22px',
                  color: item.active ? '#a78bfa' : 'rgba(255,255,255,0.45)',
                }}
              />
              <span
                className="text-[9px] font-medium leading-none"
                style={{ color: item.active ? '#a78bfa' : 'rgba(255,255,255,0.4)' }}
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* Settings */}
        <button
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          <MaterialIcon name="settings" style={{ fontSize: '22px' }} />
        </button>
      </nav>

      {/* ── Main content ── */}
      <div className="flex flex-col flex-1 min-w-0 relative" style={{ zIndex: 1 }}>
        {/* ── Top App Bar ── */}
        <header
          className="flex items-center px-4 lg:px-6 h-14 flex-shrink-0 gap-3"
          style={{
            background: 'rgba(255,255,255,0.03)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
          >
            <MaterialIcon name="auto_awesome" style={{ color: 'white', fontSize: '16px' }} filled />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-white font-semibold text-sm leading-none">Kaira AI</h1>
              <span
                className="text-xs px-1.5 py-0.5 rounded-full font-medium leading-none"
                style={{ background: 'rgba(124,58,237,0.3)', color: '#c4b5fd', border: '1px solid rgba(124,58,237,0.4)' }}
              >
                ✦ Cosmic
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Your personal astrology guide
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              <MaterialIcon name="more_vert" style={{ fontSize: '20px' }} />
            </button>
          </div>
        </header>

        {/* ── Chat area ── */}
        <div
          className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 flex flex-col gap-5"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(124,58,237,0.4) transparent',
          }}
        >
          {messages.map((msg) => (
            <div key={msg.id}>
              {msg.role === 'ai' && msg.isTyping ? (
                /* Typing indicator */
                <TypingIndicator />
              ) : msg.role === 'ai' ? (
                /* AI message */
                <div className="flex gap-3 max-w-[90%] lg:max-w-[75%]">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
                  >
                    <MaterialIcon name="auto_awesome" style={{ fontSize: '14px', color: 'white' }} filled />
                  </div>

                  <div className="flex flex-col gap-2 flex-1 min-w-0">
                    {/* Bubble */}
                    <div
                      className="rounded-2xl rounded-tl-sm px-4 py-3"
                      style={{
                        background: 'linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(79,70,229,0.15) 100%)',
                        border: '1px solid rgba(124,58,237,0.25)',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.9)' }}>
                        {msg.text}
                      </p>
                    </div>

                    {/* Bento grid insights */}
                    {msg.bentoInsights && (
                      <div
                        className="grid grid-cols-2 gap-2 rounded-2xl p-3"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          backdropFilter: 'blur(8px)',
                        }}
                      >
                        <div className="col-span-2 mb-1">
                          <p className="text-xs font-semibold" style={{ color: 'rgba(167,139,250,0.9)' }}>
                            ✦ Your Cosmic Overview
                          </p>
                        </div>
                        {msg.bentoInsights.map((insight, idx) => (
                          <BentoCard key={idx} insight={insight} />
                        ))}
                      </div>
                    )}

                    <span className="text-xs pl-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ) : (
                /* User message */
                <div className="flex justify-end">
                  <div className="max-w-[75%] lg:max-w-[60%] flex flex-col items-end gap-1">
                    <div
                      className="rounded-2xl rounded-tr-sm px-4 py-3"
                      style={{
                        background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                        boxShadow: '0 4px 20px rgba(124,58,237,0.3)',
                      }}
                    >
                      <p className="text-sm leading-relaxed text-white">{msg.text}</p>
                    </div>
                    <span className="text-xs pr-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* ── Input area ── */}
        <div
          className="flex-shrink-0 px-4 lg:px-6 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] lg:pb-3"
          style={{
            background: 'rgba(255,255,255,0.02)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Quick suggestion chips */}
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {['💫 Today\'s forecast', '❤️ Love insights', '💼 Career guidance', '🌙 Moon energy'].map((chip) => (
              <button
                key={chip}
                onClick={() => setInputValue(chip.slice(chip.indexOf(' ') + 1))}
                className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-200 whitespace-nowrap"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Composer row */}
          <div
            className="flex items-end gap-2 rounded-2xl px-3 py-2"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <button className="flex-shrink-0 mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
              <MaterialIcon name="add_circle" style={{ fontSize: '22px' }} />
            </button>

            <textarea
              ref={textareaRef}
              rows={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onInput={handleInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask Kaira about your stars..."
              className="flex-1 bg-transparent resize-none outline-none text-sm leading-relaxed"
              style={{
                color: 'rgba(255,255,255,0.9)',
                maxHeight: '120px',
              }}
            />

            <div className="flex items-center gap-1 flex-shrink-0 mb-1">
              <button style={{ color: 'rgba(255,255,255,0.45)' }}>
                <MaterialIcon name="mic" style={{ fontSize: '22px' }} />
              </button>
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
                style={{
                  background: inputValue.trim()
                    ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
                    : 'rgba(255,255,255,0.1)',
                  opacity: inputValue.trim() ? 1 : 0.5,
                }}
                onClick={sendMessage}
              >
                <MaterialIcon
                  name="arrow_upward"
                  filled
                  style={{ fontSize: '18px', color: 'white' }}
                />
              </button>
            </div>
          </div>

          <p className="text-center text-xs mt-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Kaira may make mistakes. Verify important cosmic guidance.
          </p>
        </div>
      </div>

      {/* ── Bottom Navigation (mobile) ── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around h-16 px-2"
        style={{
          background: 'rgba(10,0,21,0.85)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
          zIndex: 50,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {bottomNavItems.map((item) => (
          <button
            key={item.label}
            className="flex flex-col items-center gap-0.5 w-14 py-1 rounded-xl transition-all duration-200"
            style={{ color: item.active ? '#a78bfa' : 'rgba(255,255,255,0.4)' }}
          >
            {item.active ? (
              <div
                className="w-12 h-7 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(124,58,237,0.25)' }}
              >
                <MaterialIcon name={item.icon} filled style={{ fontSize: '20px', color: '#a78bfa' }} />
              </div>
            ) : (
              <MaterialIcon name={item.icon} style={{ fontSize: '24px' }} />
            )}
            <span className="text-[10px] font-medium leading-none">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default KairaAstrologyChat;
