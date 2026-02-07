import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Terminal, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAchievements, ACHIEVEMENTS } from '../context/AchievementContext';
import './SecretVault.css';

const FINAL_PASSWORD = 'Misupot';

const puzzleStages = [
    {
        id: 1,
        title: 'Stage 1: Cipher Decode',
        description: 'Decode this love cipher. Each letter is shifted by the position of our anniversary month (December = 12)',
        hint: 'Think about Caesar cipher with shift 12. What does "YADKOL" decode to?',
        answer: 'KAVYA',
        type: 'cipher'
    },
    {
        id: 2,
        title: 'Stage 2: Date Pattern',
        description: 'Find the pattern in these special numbers:\n30, 24, 1\nThese represent ___ of important dates.',
        hint: 'Our Anniversary (30th Dec), Kavya\'s Birthday (24th April), Ishaan\'s Birthday (1st Dec). What are these?',
        answer: 'DAYS',
        type: 'pattern'
    },
    {
        id: 3,
        title: 'Stage 3: Terminal Command',
        description: 'In this love terminal, type the command that reveals what Kavya feels for Ishaan.\n\nAvailable commands:\n> show_feelings\n> display_love\n> echo_heart\n> print_forever',
        hint: 'It\'s the one that shows feelings!',
        answer: 'show_feelings',
        type: 'terminal'
    },
    {
        id: 4,
        title: 'Stage 4: Memory Puzzle',
        description: 'Unscramble these letters from a special phrase:\nT O P U S I M\n\nThis is what Kavya calls Ishaan with love.',
        hint: 'Rearrange to form a cute nickname... Mi ____ ot',
        answer: 'MISUPOT',
        type: 'scramble'
    },
    {
        id: 5,
        title: 'Final Stage: Enter the Vault',
        description: 'You\'ve solved all puzzles! Now enter the secret password to unlock the vault.',
        hint: 'You just unscrambled it in the previous puzzle!',
        answer: FINAL_PASSWORD,
        type: 'password'
    }
];

const SecretVault = () => {
    const { unlockAchievement, isUnlocked } = useAchievements();
    const [currentStage, setCurrentStage] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [error, setError] = useState('');
    const [showHint, setShowHint] = useState(false);
    const [isUnlockedVault, setIsUnlockedVault] = useState(false);
    const [completedStages, setCompletedStages] = useState([]);
    const [terminalHistory, setTerminalHistory] = useState([
        { type: 'system', text: '> INITIALIZING LOVE VAULT SECURITY SYSTEM...' },
        { type: 'system', text: '> 5 SECURITY LAYERS DETECTED' },
        { type: 'system', text: '> BEGIN AUTHENTICATION SEQUENCE' },
    ]);
    const inputRef = useRef(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [currentStage]);

    const addTerminalLog = (type, text) => {
        setTerminalHistory(prev => [...prev, { type, text }]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const currentPuzzle = puzzleStages[currentStage];
        const userAnswer = userInput.trim().toUpperCase();
        const correctAnswer = currentPuzzle.answer.toUpperCase();

        if (userAnswer === correctAnswer) {
            addTerminalLog('success', `> STAGE ${currentStage + 1} COMPLETE ✓`);
            addTerminalLog('system', `> DECRYPTION: ${currentPuzzle.answer}`);

            setCompletedStages(prev => [...prev, currentStage]);
            setError('');
            setUserInput('');
            setShowHint(false);

            if (currentStage === puzzleStages.length - 1) {
                // Final password entered correctly
                setIsUnlockedVault(true);
                addTerminalLog('success', '> ACCESS GRANTED');
                addTerminalLog('success', '> VAULT UNLOCKED 🔓');

                // Unlock achievement
                if (!isUnlocked(ACHIEVEMENTS.VAULT_CRACKED.id)) {
                    unlockAchievement(ACHIEVEMENTS.VAULT_CRACKED.id);
                }
            } else {
                // Move to next stage
                setTimeout(() => {
                    setCurrentStage(prev => prev + 1);
                    addTerminalLog('system', `> LOADING STAGE ${currentStage + 2}...`);
                }, 1000);
            }
        } else {
            setError('Incorrect answer. Try again!');
            addTerminalLog('error', '> ACCESS DENIED - INVALID INPUT');
        }
    };

    const renderPuzzleInput = () => {
        const puzzle = puzzleStages[currentStage];

        return (
            <form onSubmit={handleSubmit} className="puzzle-form">
                <div className="input-wrapper">
                    <span className="input-prefix">{'>'}</span>
                    <input
                        ref={inputRef}
                        type={puzzle.type === 'password' ? 'password' : 'text'}
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder={puzzle.type === 'terminal' ? 'Enter command...' : 'Enter answer...'}
                        className="vault-input"
                        autoComplete="off"
                        spellCheck="false"
                    />
                </div>
                <button type="submit" className="submit-btn">
                    <ArrowRight size={20} />
                </button>
            </form>
        );
    };

    return (
        <div className="vault-page">
            <div className="vault-scanlines"></div>

            <motion.div
                className="vault-container"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header */}
                <div className="vault-header">
                    <div className="vault-icon">
                        {isUnlockedVault ? <Unlock size={40} /> : <Lock size={40} />}
                    </div>
                    <h1 className="vault-title">
                        {isUnlockedVault ? 'Vault Unlocked!' : 'Secret Vault'}
                    </h1>
                    <p className="vault-subtitle">
                        {isUnlockedVault
                            ? 'You cracked all the codes! 🎉'
                            : 'Crack the code to unlock a special message'}
                    </p>
                </div>

                {!isUnlockedVault ? (
                    <>
                        {/* Progress Bar */}
                        <div className="progress-container">
                            <div className="progress-bar">
                                <motion.div
                                    className="progress-fill"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(completedStages.length / puzzleStages.length) * 100}%` }}
                                />
                            </div>
                            <div className="progress-stages">
                                {puzzleStages.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`stage-dot ${completedStages.includes(index) ? 'completed' : ''} ${currentStage === index ? 'active' : ''}`}
                                    >
                                        {completedStages.includes(index) ? <CheckCircle2 size={14} /> : index + 1}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Terminal Display */}
                        <div className="terminal-display">
                            <div className="terminal-header">
                                <div className="terminal-dots">
                                    <span className="dot red"></span>
                                    <span className="dot yellow"></span>
                                    <span className="dot green"></span>
                                </div>
                                <span className="terminal-title">LOVE_VAULT_v1.0</span>
                            </div>
                            <div className="terminal-body">
                                {terminalHistory.map((line, index) => (
                                    <motion.div
                                        key={index}
                                        className={`terminal-line ${line.type}`}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        {line.text}
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Current Puzzle */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStage}
                                className="puzzle-container"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <div className="puzzle-header">
                                    <Terminal size={20} />
                                    <span>{puzzleStages[currentStage].title}</span>
                                </div>
                                <pre className="puzzle-description">
                                    {puzzleStages[currentStage].description}
                                </pre>

                                {renderPuzzleInput()}

                                {error && (
                                    <motion.div
                                        className="error-message"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <AlertCircle size={16} />
                                        {error}
                                    </motion.div>
                                )}

                                <button
                                    className="hint-btn"
                                    onClick={() => setShowHint(!showHint)}
                                >
                                    {showHint ? 'Hide Hint' : 'Need a Hint?'}
                                </button>

                                <AnimatePresence>
                                    {showHint && (
                                        <motion.div
                                            className="hint-box"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                        >
                                            💡 {puzzleStages[currentStage].hint}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </AnimatePresence>
                    </>
                ) : (
                    /* Unlocked Message */
                    <motion.div
                        className="unlocked-content"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring' }}
                    >
                        <div className="success-animation">
                            <div className="heart-burst">
                                {[...Array(12)].map((_, i) => (
                                    <span
                                        key={i}
                                        className="burst-heart"
                                        style={{ '--i': i }}
                                    >
                                        💕
                                    </span>
                                ))}
                            </div>
                            <div className="success-icon">🎉</div>
                        </div>

                        <div className="secret-message">
                            <h2>Kudos! Since you are here...</h2>
                            <p className="message-text">
                                I wanna tell you that you are the <strong>cutest human</strong> I have ever met.
                                You look like a <strong>cute little dumpling</strong> and sometimes I feel like eating you.
                                <br /><br />
                                I love you <span className="love-emphasis">soooooooooo</span> much.
                                <br /><br />
                                You are the best, Ishu! 💕
                            </p>
                            <div className="message-signature">
                                With all my love,<br />
                                <span>Your Kavya 💕</span>
                            </div>
                        </div>

                        <div className="celebration-hearts">
                            {[...Array(20)].map((_, i) => (
                                <span
                                    key={i}
                                    className="floating-celebration-heart"
                                    style={{
                                        left: `${Math.random() * 100}%`,
                                        animationDelay: `${Math.random() * 3}s`,
                                        fontSize: `${16 + Math.random() * 24}px`
                                    }}
                                >
                                    💖
                                </span>
                            ))}
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default SecretVault;
