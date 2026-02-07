import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Music, ListChecks, HelpCircle, Plus, X, Check,
    ExternalLink, Heart, Trash2, Edit, Save
} from 'lucide-react';
import { collection, addDoc, onSnapshot, query, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useAchievements, ACHIEVEMENTS } from '../context/AchievementContext';
import './ConnectionHub.css';

// Pre-loaded songs
const preloadedSongs = [
    { name: "Le Aaunga", artist: "Arijit Singh", spotifyUrl: "https://open.spotify.com/track/4cOdK2wGLETKJWK5Qlgyqu", note: "Our first song together 💕" },
    { name: "Shayad", artist: "Arijit Singh", spotifyUrl: "https://open.spotify.com/track/5kJCvBGpIFvEgopGNfY9lK", note: "Makes me think of you 💭" },
    { name: "Into the Unknown", artist: "Frozen 2", spotifyUrl: "https://open.spotify.com/track/3Z0oQ8oqDX3OYLBIXYQXAU", note: "Our adventure song! ❄️" },
    { name: "Pain", artist: "Imagine Dragons", spotifyUrl: "https://open.spotify.com/track/6WQiZDlMKq6AnuGWgONg7X", note: "When we're apart 😢" },
    { name: "Believer", artist: "Imagine Dragons", spotifyUrl: "https://open.spotify.com/track/0pqnGHJpmpxLKifKRmU6WP", note: "Our power anthem! 💪" },
];

// Pre-loaded bucket list
const preloadedBucketList = [
    { item: "Finish the Portfolio", isCompleted: false, notes: "Working on it! 💻" },
    { item: "Visit Greece", isCompleted: false, notes: "Santorini sunsets await 🇬🇷" },
    { item: "Meet before Holi", isCompleted: false, notes: "Colorful plans! 🎨" },
    { item: "Buy a Macbook", isCompleted: false, notes: "Apple dreams 🍎" },
    { item: "Have a first kiss", isCompleted: false, notes: "💋💕" },
];

// Quiz questions
const quizQuestions = [
    { id: 1, question: "What's your favorite movie/TV show?", options: ["Action/Thriller", "Romance/Drama", "Comedy", "Sci-Fi/Fantasy"] },
    { id: 2, question: "Dream vacation destination?", options: ["Beach Paradise", "Mountain Adventure", "European Cities", "Asian Exploration"] },
    { id: 3, question: "Favorite food/cuisine?", options: ["Indian", "Italian", "Chinese", "Mexican"] },
    { id: 4, question: "Ideal date night?", options: ["Cozy movie night", "Fancy dinner", "Adventure activity", "Stargazing"] },
    { id: 5, question: "Favorite season?", options: ["Summer", "Winter", "Spring", "Monsoon"] },
    { id: 6, question: "Are you a morning person or night owl?", options: ["Early bird", "Night owl", "Somewhere in between", "Depends on mood"] },
    { id: 7, question: "Coffee or tea?", options: ["Coffee", "Tea", "Both", "Neither"] },
    { id: 8, question: "Favorite color?", options: ["Blue shades", "Pink/Red", "Green", "Purple"] },
    { id: 9, question: "What's your love language?", options: ["Words of affirmation", "Quality time", "Physical touch", "Acts of service"] },
    { id: 10, question: "Dream house location?", options: ["City apartment", "Suburban home", "Countryside villa", "Beach house"] },
];

const ConnectionHub = () => {
    const { currentUser, userProfile } = useAuth();
    const { unlockAchievement, isUnlocked } = useAchievements();
    const [activeTab, setActiveTab] = useState('playlist');
    const [songs, setSongs] = useState(preloadedSongs);
    const [bucketList, setBucketList] = useState(preloadedBucketList);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Quiz state
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [quizComplete, setQuizComplete] = useState(false);
    const [partnerAnswers, setPartnerAnswers] = useState({});
    const [compatibility, setCompatibility] = useState(null);

    // Form states
    const [newSong, setNewSong] = useState({ name: '', artist: '', spotifyUrl: '', note: '' });
    const [newBucketItem, setNewBucketItem] = useState({ item: '', notes: '' });

    useEffect(() => {
        // Load songs from Firebase
        const songsQuery = query(collection(db, 'playlist'));
        const unsubscribeSongs = onSnapshot(songsQuery, (snapshot) => {
            const dbSongs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSongs([...preloadedSongs, ...dbSongs]);
        });

        // Load bucket list from Firebase
        const bucketQuery = query(collection(db, 'bucketList'));
        const unsubscribeBucket = onSnapshot(bucketQuery, (snapshot) => {
            const dbItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setBucketList([...preloadedBucketList.map((item, i) => ({ ...item, id: `preloaded-${i}` })), ...dbItems]);
        });

        return () => {
            unsubscribeSongs();
            unsubscribeBucket();
        };
    }, []);

    const handleAddSong = async (e) => {
        e.preventDefault();
        if (!currentUser) return;

        try {
            await addDoc(collection(db, 'playlist'), {
                ...newSong,
                addedBy: currentUser.uid,
                createdAt: new Date()
            });

            if (!isUnlocked(ACHIEVEMENTS.PLAYLIST_ADDED.id)) {
                unlockAchievement(ACHIEVEMENTS.PLAYLIST_ADDED.id);
            }

            setNewSong({ name: '', artist: '', spotifyUrl: '', note: '' });
            setIsAddModalOpen(false);
        } catch (error) {
            console.error('Error adding song:', error);
        }
    };

    const handleAddBucketItem = async (e) => {
        e.preventDefault();
        if (!currentUser) return;

        try {
            await addDoc(collection(db, 'bucketList'), {
                ...newBucketItem,
                isCompleted: false,
                addedBy: currentUser.uid,
                createdAt: new Date()
            });

            setNewBucketItem({ item: '', notes: '' });
            setIsAddModalOpen(false);
        } catch (error) {
            console.error('Error adding bucket item:', error);
        }
    };

    const toggleBucketComplete = async (item) => {
        if (item.id?.startsWith('preloaded')) return;

        try {
            await updateDoc(doc(db, 'bucketList', item.id), {
                isCompleted: !item.isCompleted,
                completedDate: !item.isCompleted ? new Date() : null
            });

            if (!item.isCompleted && !isUnlocked(ACHIEVEMENTS.BUCKET_COMPLETED.id)) {
                unlockAchievement(ACHIEVEMENTS.BUCKET_COMPLETED.id);
            }
        } catch (error) {
            console.error('Error updating bucket item:', error);
        }
    };

    const handleQuizAnswer = (questionId, answer) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));

        if (currentQuestion < quizQuestions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        } else {
            // Quiz complete
            setQuizComplete(true);

            // Calculate compatibility (mock for now)
            const mockPartnerAnswers = {
                1: "Romance/Drama", 2: "Beach Paradise", 3: "Indian", 4: "Cozy movie night",
                5: "Winter", 6: "Night owl", 7: "Tea", 8: "Blue shades",
                9: "Quality time", 10: "Beach house"
            };
            setPartnerAnswers(mockPartnerAnswers);

            // Calculate match percentage
            const finalAnswers = { ...answers, [questionId]: answer };
            let matches = 0;
            Object.keys(finalAnswers).forEach(key => {
                if (finalAnswers[key] === mockPartnerAnswers[key]) matches++;
            });
            setCompatibility(Math.round((matches / quizQuestions.length) * 100));

            if (!isUnlocked(ACHIEVEMENTS.QUIZ_COMPLETED.id)) {
                unlockAchievement(ACHIEVEMENTS.QUIZ_COMPLETED.id);
            }
        }
    };

    const completedItems = bucketList.filter(item => item.isCompleted).length;
    const totalItems = bucketList.length;

    return (
        <div className="connection-page">
            <motion.div
                className="page-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="page-title">
                    <span className="title-icon">🔗</span>
                    Connection Hub
                </h1>
                <p className="page-subtitle">
                    Our shared playlist, compatibility quiz, and bucket list
                </p>
            </motion.div>

            {/* Tabs */}
            <div className="tabs-container">
                {[
                    { id: 'playlist', label: 'Playlist', icon: Music },
                    { id: 'quiz', label: 'Compatibility', icon: HelpCircle },
                    { id: 'bucket', label: 'Bucket List', icon: ListChecks },
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

            {/* Content */}
            <AnimatePresence mode="wait">
                {/* Playlist Tab */}
                {activeTab === 'playlist' && (
                    <motion.div
                        key="playlist"
                        className="tab-content"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <div className="section-header">
                            <h2>🎵 Our Shared Playlist</h2>
                            <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
                                <Plus size={18} /> Add Song
                            </button>
                        </div>

                        {/* Spotify Embed */}
                        <div className="spotify-embed">
                            <iframe
                                style={{ borderRadius: '12px' }}
                                src="https://open.spotify.com/embed/playlist/37i9dQZF1DX0XUsuxWHRQd?utm_source=generator&theme=0"
                                width="100%"
                                height="152"
                                frameBorder="0"
                                allowFullScreen=""
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                loading="lazy"
                            ></iframe>
                        </div>

                        <div className="songs-grid">
                            {songs.map((song, index) => (
                                <motion.div
                                    key={index}
                                    className="song-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <div className="song-icon">🎵</div>
                                    <div className="song-info">
                                        <span className="song-name">{song.name}</span>
                                        <span className="song-artist">{song.artist}</span>
                                        {song.note && <span className="song-note">{song.note}</span>}
                                    </div>
                                    {song.spotifyUrl && (
                                        <a
                                            href={song.spotifyUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="song-link"
                                        >
                                            <ExternalLink size={18} />
                                        </a>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Quiz Tab */}
                {activeTab === 'quiz' && (
                    <motion.div
                        key="quiz"
                        className="tab-content"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        {!quizComplete ? (
                            <div className="quiz-container">
                                <div className="quiz-progress">
                                    <div className="progress-bar">
                                        <motion.div
                                            className="progress-fill"
                                            animate={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
                                        />
                                    </div>
                                    <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
                                </div>

                                <motion.div
                                    key={currentQuestion}
                                    className="quiz-question"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <h3>{quizQuestions[currentQuestion].question}</h3>
                                    <div className="quiz-options">
                                        {quizQuestions[currentQuestion].options.map((option, index) => (
                                            <motion.button
                                                key={option}
                                                className="quiz-option"
                                                onClick={() => handleQuizAnswer(quizQuestions[currentQuestion].id, option)}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                            >
                                                {option}
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>
                        ) : (
                            <motion.div
                                className="quiz-results"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <div className="compatibility-circle">
                                    <svg viewBox="0 0 100 100">
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="45"
                                            fill="none"
                                            stroke="#FFE4EC"
                                            strokeWidth="8"
                                        />
                                        <motion.circle
                                            cx="50"
                                            cy="50"
                                            r="45"
                                            fill="none"
                                            stroke="url(#gradient)"
                                            strokeWidth="8"
                                            strokeLinecap="round"
                                            strokeDasharray={`${compatibility * 2.83} 283`}
                                            transform="rotate(-90 50 50)"
                                            initial={{ strokeDasharray: "0 283" }}
                                            animate={{ strokeDasharray: `${compatibility * 2.83} 283` }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                        />
                                        <defs>
                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#FF69B4" />
                                                <stop offset="100%" stopColor="#DC143C" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="compatibility-value">
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.5 }}
                                        >
                                            {compatibility}%
                                        </motion.span>
                                        <span className="compatibility-label">Compatible</span>
                                    </div>
                                </div>

                                <h2 className="results-title">You're a Perfect Match! 💕</h2>
                                <p className="results-subtitle">
                                    {compatibility >= 80
                                        ? "Wow! Your souls are truly connected! 🌟"
                                        : compatibility >= 60
                                            ? "Great compatibility! You complement each other perfectly! ✨"
                                            : "Opposites attract! Your differences make you stronger! 💪"}
                                </p>

                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setQuizComplete(false);
                                        setCurrentQuestion(0);
                                        setAnswers({});
                                        setCompatibility(null);
                                    }}
                                >
                                    Retake Quiz
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {/* Bucket List Tab */}
                {activeTab === 'bucket' && (
                    <motion.div
                        key="bucket"
                        className="tab-content"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <div className="section-header">
                            <div>
                                <h2>✅ Our Bucket List</h2>
                                <p className="bucket-progress">
                                    {completedItems} of {totalItems} completed
                                </p>
                            </div>
                            <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
                                <Plus size={18} /> Add Item
                            </button>
                        </div>

                        <div className="progress-bar bucket-bar">
                            <motion.div
                                className="progress-fill"
                                animate={{ width: `${(completedItems / totalItems) * 100}%` }}
                            />
                        </div>

                        <div className="bucket-list">
                            {bucketList.map((item, index) => (
                                <motion.div
                                    key={item.id || index}
                                    className={`bucket-item ${item.isCompleted ? 'completed' : ''}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    layout
                                >
                                    <button
                                        className="bucket-check"
                                        onClick={() => toggleBucketComplete(item)}
                                    >
                                        {item.isCompleted ? <Check size={18} /> : null}
                                    </button>
                                    <div className="bucket-content">
                                        <span className="bucket-text">{item.item}</span>
                                        {item.notes && <span className="bucket-notes">{item.notes}</span>}
                                    </div>
                                    {item.isCompleted && (
                                        <motion.div
                                            className="bucket-celebration"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                        >
                                            🎉
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsAddModalOpen(false)}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className="modal-close" onClick={() => setIsAddModalOpen(false)}>
                                <X size={24} />
                            </button>

                            {activeTab === 'playlist' ? (
                                <>
                                    <h2 className="modal-title">🎵 Add New Song</h2>
                                    <form onSubmit={handleAddSong} className="add-form">
                                        <div className="form-group">
                                            <label>Song Name</label>
                                            <input
                                                type="text"
                                                className="input"
                                                value={newSong.name}
                                                onChange={(e) => setNewSong(prev => ({ ...prev, name: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Artist</label>
                                            <input
                                                type="text"
                                                className="input"
                                                value={newSong.artist}
                                                onChange={(e) => setNewSong(prev => ({ ...prev, artist: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Spotify URL (optional)</label>
                                            <input
                                                type="url"
                                                className="input"
                                                value={newSong.spotifyUrl}
                                                onChange={(e) => setNewSong(prev => ({ ...prev, spotifyUrl: e.target.value }))}
                                                placeholder="https://open.spotify.com/track/..."
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Memory/Note (optional)</label>
                                            <input
                                                type="text"
                                                className="input"
                                                value={newSong.note}
                                                onChange={(e) => setNewSong(prev => ({ ...prev, note: e.target.value }))}
                                                placeholder="Why is this song special?"
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-primary w-full">
                                            <Music size={18} /> Add Song
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <>
                                    <h2 className="modal-title">✅ Add Bucket Item</h2>
                                    <form onSubmit={handleAddBucketItem} className="add-form">
                                        <div className="form-group">
                                            <label>What do you want to do?</label>
                                            <input
                                                type="text"
                                                className="input"
                                                value={newBucketItem.item}
                                                onChange={(e) => setNewBucketItem(prev => ({ ...prev, item: e.target.value }))}
                                                placeholder="e.g., Travel to Japan together"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Notes (optional)</label>
                                            <textarea
                                                className="input textarea"
                                                value={newBucketItem.notes}
                                                onChange={(e) => setNewBucketItem(prev => ({ ...prev, notes: e.target.value }))}
                                                placeholder="Any details or thoughts..."
                                                rows={3}
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-primary w-full">
                                            <Plus size={18} /> Add to List
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

export default ConnectionHub;
