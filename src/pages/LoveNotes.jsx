import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart, Mic, MessageCircle, Plus, X, Play,
    Pause, Upload, Volume2, Sparkles
} from 'lucide-react';
import { collection, addDoc, onSnapshot, query } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useAchievements, ACHIEVEMENTS } from '../context/AchievementContext';
import './LoveNotes.css';

// Pre-loaded compliments
const preloadedCompliments = [
    "You look like a cute little squirrel 🐿️",
    "You are smarty pants 🧠",
    "You make my heart go on a roller coaster ride 🎢",
    "Your surprises are so romantic 🌹",
    "Your sassy eye rolls make my cheeks flush 😏",
];

// Traits with descriptions
const traits = [
    { front: "💕", back: "How you become cutie when I am sad" },
    { front: "😊", back: "How you try to make me happy" },
    { front: "✨", back: "Your fluffy hair" },
    { front: "🎯", back: "Your seriousness towards your goal" },
    { front: "💋", back: "The mole on your upper lips" },
];

const LoveNotes = () => {
    const { currentUser, userProfile } = useAuth();
    const { unlockAchievement, isUnlocked } = useAchievements();
    const [activeTab, setActiveTab] = useState('compliments');
    const [compliments, setCompliments] = useState(preloadedCompliments);
    const [voiceNotes, setVoiceNotes] = useState([]);
    const [currentCompliment, setCurrentCompliment] = useState(null);
    const [isJarAnimating, setIsJarAnimating] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [flippedCards, setFlippedCards] = useState([]);
    const [complimentCount, setComplimentCount] = useState(0);

    // Audio state
    const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
    const audioRef = useRef(null);

    // Form states
    const [newCompliment, setNewCompliment] = useState('');
    const [newVoiceNote, setNewVoiceNote] = useState({ file: null, memory: '' });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        // Load compliments from Firebase
        const complimentsQuery = query(collection(db, 'compliments'));
        const unsubscribe = onSnapshot(complimentsQuery, (snapshot) => {
            const dbCompliments = snapshot.docs.map(doc => doc.data().text);
            setCompliments([...preloadedCompliments, ...dbCompliments]);
        });

        // Load voice notes from Firebase
        const voiceQuery = query(collection(db, 'voiceNotes'));
        const unsubscribeVoice = onSnapshot(voiceQuery, (snapshot) => {
            const notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setVoiceNotes(notes);
        });

        return () => {
            unsubscribe();
            unsubscribeVoice();
        };
    }, []);

    const pullCompliment = () => {
        if (isJarAnimating) return;

        setIsJarAnimating(true);

        // Get a random compliment (avoiding same as current)
        let available = compliments.filter(c => c !== currentCompliment);
        if (available.length === 0) available = compliments;
        const randomCompliment = available[Math.floor(Math.random() * available.length)];

        setTimeout(() => {
            setCurrentCompliment(randomCompliment);
            setIsJarAnimating(false);

            // Track compliment reads
            setComplimentCount(prev => {
                const newCount = prev + 1;
                if (newCount >= 10 && !isUnlocked(ACHIEVEMENTS.COMPLIMENT_READ.id)) {
                    unlockAchievement(ACHIEVEMENTS.COMPLIMENT_READ.id);
                }
                return newCount;
            });
        }, 1000);
    };

    const handleAddCompliment = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            alert("You must be logged in!");
            return;
        }

        if (!newCompliment.trim()) return;

        try {
            await addDoc(collection(db, 'compliments'), {
                text: newCompliment,
                addedBy: currentUser.uid,
                createdAt: new Date()
            });
            setNewCompliment('');
            setIsModalOpen(false);
            alert("Compliment added to the jar! 🍯");
        } catch (error) {
            console.error('Error adding compliment:', error);
            alert(`Failed to add compliment. Error: ${error.message}`);
        }
    };

    const handleVoiceUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Max 10MB for audio
        if (file.size > 10 * 1024 * 1024) {
            alert("Audio file too large (max 10MB)");
            return;
        }

        setNewVoiceNote(prev => ({ ...prev, file }));
    };

    const handleSubmitVoiceNote = async (e) => {
        e.preventDefault();
        if (!newVoiceNote.file || !currentUser) {
            alert("Please select a file and ensure you are logged in.");
            return;
        }

        setUploading(true);
        try {
            const fileName = `${Date.now()}-${newVoiceNote.file.name}`;
            const storageRef = ref(storage, `voiceNotes/${fileName}`);
            await uploadBytes(storageRef, newVoiceNote.file);
            const url = await getDownloadURL(storageRef);

            await addDoc(collection(db, 'voiceNotes'), {
                fileURL: url,
                memory: newVoiceNote.memory,
                addedBy: currentUser.uid,
                addedByName: userProfile?.name || 'Unknown',
                createdAt: new Date()
            });

            setNewVoiceNote({ file: null, memory: '' });
            setIsModalOpen(false);
            alert("Voice note saved! 🎤");
        } catch (error) {
            console.error('Error uploading voice note:', error);
            alert(`Failed to upload voice note. Error: ${error.message}`);
        }
        setUploading(false);
    };

    const playVoiceNote = (note) => {
        if (currentlyPlaying === note.id) {
            audioRef.current?.pause();
            setCurrentlyPlaying(null);
        } else {
            if (audioRef.current) {
                audioRef.current.src = note.fileURL;
                audioRef.current.play();
                setCurrentlyPlaying(note.id);

                if (!isUnlocked(ACHIEVEMENTS.VOICE_LISTENED.id)) {
                    unlockAchievement(ACHIEVEMENTS.VOICE_LISTENED.id);
                }
            }
        }
    };

    const toggleCard = (index) => {
        setFlippedCards(prev => {
            const newFlipped = prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index];

            // Check if all cards are flipped
            if (newFlipped.length === traits.length && !isUnlocked(ACHIEVEMENTS.TRAIT_EXPLORER.id)) {
                unlockAchievement(ACHIEVEMENTS.TRAIT_EXPLORER.id);
            }

            return newFlipped;
        });
    };

    return (
        <div className="lovenotes-page">
            <audio ref={audioRef} onEnded={() => setCurrentlyPlaying(null)} />

            <motion.div
                className="page-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="page-title">
                    <span className="title-icon">💝</span>
                    Love Notes
                </h1>
                <p className="page-subtitle">
                    Sweet compliments, voice memories, and traits I adore
                </p>
            </motion.div>

            {/* Tabs */}
            <div className="tabs-container">
                {[
                    { id: 'compliments', label: 'Compliment Jar', icon: MessageCircle },
                    { id: 'voice', label: 'Voice Notes', icon: Mic },
                    { id: 'traits', label: 'Traits I Adore', icon: Heart },
                ].map(tab => (
                    <button
                        key={tab.id}
                        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {/* Compliment Jar */}
                {activeTab === 'compliments' && (
                    <motion.div
                        key="compliments"
                        className="tab-content compliment-section"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <div className="jar-container">
                            <motion.div
                                className={`jar ${isJarAnimating ? 'shaking' : ''}`}
                                onClick={pullCompliment}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className="jar-body">
                                    <div className="jar-contents">
                                        {[...Array(8)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                className="jar-heart"
                                                animate={isJarAnimating ? {
                                                    y: [0, -10, 0],
                                                    rotate: [-5, 5, -5]
                                                } : {}}
                                                transition={{ delay: i * 0.1, duration: 0.3 }}
                                                style={{
                                                    left: `${15 + (i % 4) * 20}%`,
                                                    bottom: `${10 + Math.floor(i / 4) * 25}%`
                                                }}
                                            >
                                                💕
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                                <div className="jar-lid"></div>
                            </motion.div>
                            <p className="jar-instruction">
                                {isJarAnimating ? 'Pulling a compliment...' : 'Tap the jar for a sweet compliment!'}
                            </p>
                        </div>

                        <AnimatePresence>
                            {currentCompliment && (
                                <motion.div
                                    className="compliment-card"
                                    initial={{ opacity: 0, y: 50, rotateX: -15 }}
                                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                                    exit={{ opacity: 0, y: -50 }}
                                    key={currentCompliment}
                                >
                                    <Sparkles className="compliment-sparkle left" />
                                    <p className="compliment-text">{currentCompliment}</p>
                                    <Sparkles className="compliment-sparkle right" />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            className="btn btn-secondary add-btn"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <Plus size={18} /> Add Compliment
                        </button>
                    </motion.div>
                )}

                {/* Voice Notes */}
                {activeTab === 'voice' && (
                    <motion.div
                        key="voice"
                        className="tab-content voice-section"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <div className="section-header">
                            <h2>🎤 Voice Memories</h2>
                            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                                <Plus size={18} /> Add Voice Note
                            </button>
                        </div>

                        {voiceNotes.length === 0 ? (
                            <div className="empty-state">
                                <Mic size={48} className="empty-icon" />
                                <h3>No voice notes yet</h3>
                                <p>Record special moments and add them here!</p>
                            </div>
                        ) : (
                            <div className="voice-grid">
                                {voiceNotes.map((note, index) => (
                                    <motion.div
                                        key={note.id}
                                        className={`voice-card ${currentlyPlaying === note.id ? 'playing' : ''}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <button
                                            className="play-btn"
                                            onClick={() => playVoiceNote(note)}
                                        >
                                            {currentlyPlaying === note.id ? (
                                                <Pause size={24} />
                                            ) : (
                                                <Play size={24} />
                                            )}
                                        </button>

                                        <div className="voice-info">
                                            <span className="voice-memory">{note.memory || 'Voice Note'}</span>
                                            <span className="voice-by">By {note.addedByName}</span>
                                        </div>

                                        {currentlyPlaying === note.id && (
                                            <div className="waveform">
                                                {[...Array(5)].map((_, i) => (
                                                    <motion.span
                                                        key={i}
                                                        className="wave-bar"
                                                        animate={{ height: [10, 25, 10] }}
                                                        transition={{
                                                            repeat: Infinity,
                                                            duration: 0.5,
                                                            delay: i * 0.1
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Traits I Adore */}
                {activeTab === 'traits' && (
                    <motion.div
                        key="traits"
                        className="tab-content traits-section"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <h2 className="traits-title">Things I Love About You 💖</h2>
                        <p className="traits-subtitle">Click each card to reveal what I adore</p>

                        <div className="traits-grid">
                            {traits.map((trait, index) => (
                                <motion.div
                                    key={index}
                                    className={`trait-card ${flippedCards.includes(index) ? 'flipped' : ''}`}
                                    onClick={() => toggleCard(index)}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <div className="trait-inner">
                                        <div className="trait-front">
                                            <span className="trait-emoji">{trait.front}</span>
                                            <span className="trait-hint">Click to reveal</span>
                                        </div>
                                        <div className="trait-back">
                                            <p>{trait.back}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                                <X size={24} />
                            </button>

                            {activeTab === 'compliments' ? (
                                <>
                                    <h2 className="modal-title">💕 Add Sweet Compliment</h2>
                                    <form onSubmit={handleAddCompliment}>
                                        <div className="form-group">
                                            <label>Your Compliment</label>
                                            <textarea
                                                className="input textarea"
                                                value={newCompliment}
                                                onChange={(e) => setNewCompliment(e.target.value)}
                                                placeholder="Write something sweet..."
                                                rows={4}
                                                required
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-primary w-full">
                                            <Heart size={18} /> Add to Jar
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <>
                                    <h2 className="modal-title">🎤 Add Voice Note</h2>
                                    <form onSubmit={handleSubmitVoiceNote}>
                                        <div className="form-group">
                                            <label>Voice Recording</label>
                                            <div className="upload-area">
                                                <input
                                                    type="file"
                                                    accept="audio/*"
                                                    onChange={handleVoiceUpload}
                                                    className="file-input"
                                                    id="voice-upload"
                                                />
                                                <label htmlFor="voice-upload" className="upload-label">
                                                    <Upload size={24} />
                                                    <span>{newVoiceNote.file ? newVoiceNote.file.name : 'Click to upload audio'}</span>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Memory/Context</label>
                                            <input
                                                type="text"
                                                className="input"
                                                value={newVoiceNote.memory}
                                                onChange={(e) => setNewVoiceNote(prev => ({ ...prev, memory: e.target.value }))}
                                                placeholder="Why is this recording special?"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="btn btn-primary w-full"
                                            disabled={!newVoiceNote.file || uploading}
                                        >
                                            <Mic size={18} /> {uploading ? 'Uploading...' : 'Save Voice Note'}
                                        </button>
                                    </form>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LoveNotes;
