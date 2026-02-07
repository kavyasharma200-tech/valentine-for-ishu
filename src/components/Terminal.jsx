import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Terminal as TerminalIcon } from 'lucide-react';
import { useAchievements, ACHIEVEMENTS } from '../context/AchievementContext';
import './Terminal.css';

const loveMessages = [
    "You are my sunshine on a cloudy day ☀️",
    "Every moment with you is a treasure 💎",
    "You make my heart skip a beat 💓",
    "You're the reason I believe in love 💕",
    "With you, forever doesn't seem long enough 💑",
    "You're my favorite notification 📱",
    "You are my today and all of my tomorrows 🌅",
    "You're the peanut butter to my jelly 🥪",
];

const terminalCommands = {
    help: {
        output: `
Available commands:
─────────────────────
  help           - Shows this help message
  love           - Shows a random love message
  memory [n]     - Show memory number n
  dates          - Shows our important dates
  secret         - Reveals hidden content
  about          - About us
  clear          - Clears the terminal
  countdown      - Time until next special date
  hearts         - Love animation
  exit           - Close terminal
─────────────────────
Type any command and press Enter
    `
    },
    love: {
        output: () => loveMessages[Math.floor(Math.random() * loveMessages.length)],
    },
    dates: {
        output: `
✨ Our Important Dates ✨
─────────────────────────
📅 Dec 30 - Our Anniversary 💕
📅 Apr 24 - Kavya's Birthday 🎂
📅 Dec 1  - Ishaan's Birthday 🎉
📅 2011   - When we joined school 📚
📅 2022   - Scored well in 10th 🎓
📅 2024   - Started college 🏛️
─────────────────────────
    `
    },
    secret: {
        output: `
🔐 SECRET UNLOCKED 🔐
━━━━━━━━━━━━━━━━━━━━

"In a world full of temporary things,
you are a perpetual feeling."

━━━━━━━━━━━━━━━━━━━━
P.S. You found the secret terminal!
You're awesome! 💖
    `
    },
    about: {
        output: `
💕 About Us 💕
─────────────────
Kavya & Ishaan
Together since: Dec 30, 2024
Status: Madly in Love
Bond: Unbreakable
─────────────────
"Two hearts, one love"
    `
    },
    countdown: {
        output: () => {
            const now = new Date();
            const events = [
                { name: "Kavya's Birthday", date: new Date(now.getFullYear(), 3, 24) },
                { name: "Anniversary", date: new Date(now.getFullYear(), 11, 30) },
                { name: "Ishaan's Birthday", date: new Date(now.getFullYear(), 11, 1) },
            ];

            // Find next upcoming event
            for (let event of events) {
                if (event.date < now) {
                    event.date.setFullYear(event.date.getFullYear() + 1);
                }
            }
            events.sort((a, b) => a.date - b.date);
            const next = events[0];
            const diff = next.date - now;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));

            return `
⏰ Next Event: ${next.name}
─────────────────────────
${days} days remaining
─────────────────────────
      `;
        }
    },
    hearts: {
        output: `
    💕💕💕💕💕💕💕💕💕💕
  💕                    💕
 💕   You are loved!     💕
  💕                    💕
    💕💕💕💕💕💕💕💕💕💕
    `
    }
};

const TerminalOverlay = ({ isOpen, onClose }) => {
    const { unlockAchievement, isUnlocked } = useAchievements();
    const [history, setHistory] = useState([
        { type: 'system', text: 'Welcome to Love Terminal v1.0 💕' },
        { type: 'system', text: 'Type "help" for available commands' },
        { type: 'system', text: '' },
    ]);
    const [input, setInput] = useState('');
    const inputRef = useRef(null);
    const historyRef = useRef(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        if (historyRef.current) {
            historyRef.current.scrollTop = historyRef.current.scrollHeight;
        }
    }, [history]);

    const executeCommand = (cmd) => {
        const command = cmd.toLowerCase().trim();
        const args = command.split(' ');
        const baseCmd = args[0];

        let output = '';

        if (baseCmd === 'clear') {
            setHistory([]);
            return;
        }

        if (baseCmd === 'exit') {
            onClose();
            return;
        }

        if (baseCmd === 'memory') {
            const num = parseInt(args[1]);
            if (isNaN(num) || num < 1) {
                output = 'Usage: memory [number]\nExample: memory 1';
            } else {
                output = `Memory #${num}: Coming soon... 📸\n(This will link to the memory lane page!)`;
            }
        } else if (terminalCommands[baseCmd]) {
            const cmdData = terminalCommands[baseCmd];
            output = typeof cmdData.output === 'function' ? cmdData.output() : cmdData.output;
        } else {
            output = `Command not found: ${baseCmd}\nType "help" for available commands`;
        }

        setHistory(prev => [
            ...prev,
            { type: 'input', text: `> ${cmd}` },
            { type: 'output', text: output }
        ]);

        // Unlock achievement for using terminal
        if (!isUnlocked(ACHIEVEMENTS.TERMINAL_USER.id)) {
            unlockAchievement(ACHIEVEMENTS.TERMINAL_USER.id);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim()) {
            executeCommand(input);
            setInput('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="terminal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="terminal-window"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="terminal-header">
                            <div className="terminal-buttons">
                                <span className="btn red" onClick={onClose}></span>
                                <span className="btn yellow"></span>
                                <span className="btn green"></span>
                            </div>
                            <div className="terminal-title">
                                <TerminalIcon size={14} />
                                <span>love_terminal@kavya-ishaan: ~</span>
                            </div>
                            <button className="terminal-close" onClick={onClose}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="terminal-body" ref={historyRef}>
                            {history.map((line, index) => (
                                <motion.div
                                    key={index}
                                    className={`terminal-line ${line.type}`}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.02 }}
                                >
                                    <pre>{line.text}</pre>
                                </motion.div>
                            ))}

                            <form onSubmit={handleSubmit} className="terminal-input-line">
                                <span className="prompt">{'>'}</span>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="terminal-input"
                                    placeholder="Type command..."
                                    autoFocus
                                    spellCheck="false"
                                    autoComplete="off"
                                />
                            </form>
                        </div>
                    </motion.div>

                    <div className="terminal-hint">
                        Press Ctrl+Shift+T or click elsewhere to close
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TerminalOverlay;
