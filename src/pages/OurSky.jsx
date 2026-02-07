import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Plus, X, Calendar, Sparkles, ZoomIn, ZoomOut } from 'lucide-react';
import { collection, addDoc, onSnapshot, query } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useAchievements, ACHIEVEMENTS } from '../context/AchievementContext';
import './OurSky.css';

// Pre-loaded stars (important dates)
const preloadedStars = [
    { date: "30th Dec", description: "Anniversary when we became one 💕", year: 2024, position: { x: 20, y: 30 } },
    { date: "24th April", description: "When Kavya was born 🎂", year: null, position: { x: 70, y: 20 } },
    { date: "1st Dec", description: "When Ishaan was born 🎉", year: null, position: { x: 50, y: 60 } },
    { date: "2011", description: "When we both joined school 📚", year: 2011, position: { x: 30, y: 70 } },
    { date: "2022", description: "Scored well in 10th 🎓", year: 2022, position: { x: 80, y: 45 } },
    { date: "2024", description: "Scored well in 12th & went to college 🏛️", year: 2024, position: { x: 60, y: 80 } },
];

const OurSky = () => {
    const { currentUser, userProfile } = useAuth();
    const { unlockAchievement, isUnlocked } = useAchievements();
    const [stars, setStars] = useState(preloadedStars);
    const [selectedStar, setSelectedStar] = useState(null);
    const [viewedStars, setViewedStars] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [newStar, setNewStar] = useState({ date: '', description: '' });
    const skyRef = useRef(null);

    // Shooting star state
    const [shootingStar, setShootingStar] = useState(null);

    useEffect(() => {
        // Load stars from Firebase
        const starsQuery = query(collection(db, 'starMap'));
        const unsubscribe = onSnapshot(starsQuery, (snapshot) => {
            const dbStars = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                position: {
                    x: 10 + Math.random() * 80,
                    y: 10 + Math.random() * 80
                }
            }));
            setStars([...preloadedStars, ...dbStars]);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        // Create shooting stars periodically
        const interval = setInterval(() => {
            setShootingStar({
                id: Date.now(),
                startX: Math.random() * 100,
                startY: Math.random() * 30,
            });

            setTimeout(() => setShootingStar(null), 1500);
        }, 8000);

        return () => clearInterval(interval);
    }, []);

    const handleStarClick = (star, index) => {
        setSelectedStar(star);

        // Track viewed stars
        if (!viewedStars.includes(index)) {
            const newViewed = [...viewedStars, index];
            setViewedStars(newViewed);

            // Check if all stars are viewed
            if (newViewed.length >= stars.length && !isUnlocked(ACHIEVEMENTS.STAR_EXPLORER.id)) {
                unlockAchievement(ACHIEVEMENTS.STAR_EXPLORER.id);
            }
        }
    };

    const handleAddStar = async (e) => {
        e.preventDefault();
        if (!newStar.date.trim() || !newStar.description.trim() || !currentUser) return;

        try {
            await addDoc(collection(db, 'starMap'), {
                date: newStar.date,
                description: newStar.description,
                addedBy: currentUser.uid,
                createdAt: new Date()
            });

            setNewStar({ date: '', description: '' });
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error adding star:', error);
        }
    };

    // Generate twinkling stars background
    const backgroundStars = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1 + Math.random() * 2,
        delay: Math.random() * 3
    }));

    return (
        <div className="oursky-page">
            <motion.div
                className="page-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="page-title">
                    <span className="title-icon">⭐</span>
                    Our Sky
                </h1>
                <p className="page-subtitle">
                    A constellation of our special moments
                </p>
            </motion.div>

            {/* Controls */}
            <div className="sky-controls">
                <div className="zoom-controls">
                    <button
                        className="control-btn"
                        onClick={() => setZoom(z => Math.max(0.5, z - 0.2))}
                    >
                        <ZoomOut size={18} />
                    </button>
                    <span className="zoom-level">{Math.round(zoom * 100)}%</span>
                    <button
                        className="control-btn"
                        onClick={() => setZoom(z => Math.min(2, z + 0.2))}
                    >
                        <ZoomIn size={18} />
                    </button>
                </div>

                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} /> Add Star
                </button>
            </div>

            {/* Star Map */}
            <div className="sky-container">
                <motion.div
                    className="sky-canvas"
                    ref={skyRef}
                    style={{ transform: `scale(${zoom})` }}
                >
                    {/* Background stars */}
                    {backgroundStars.map(star => (
                        <div
                            key={`bg-${star.id}`}
                            className="background-star"
                            style={{
                                left: `${star.x}%`,
                                top: `${star.y}%`,
                                width: `${star.size}px`,
                                height: `${star.size}px`,
                                animationDelay: `${star.delay}s`
                            }}
                        />
                    ))}

                    {/* Constellation lines */}
                    <svg className="constellation-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
                        {stars.slice(0, -1).map((star, i) => {
                            const nextStar = stars[i + 1];
                            return (
                                <motion.line
                                    key={`line-${i}`}
                                    x1={`${star.position.x}%`}
                                    y1={`${star.position.y}%`}
                                    x2={`${nextStar.position.x}%`}
                                    y2={`${nextStar.position.y}%`}
                                    stroke="rgba(255, 215, 0, 0.3)"
                                    strokeWidth="0.3"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ delay: i * 0.3, duration: 1 }}
                                />
                            );
                        })}
                    </svg>

                    {/* Shooting star */}
                    <AnimatePresence>
                        {shootingStar && (
                            <motion.div
                                className="shooting-star"
                                initial={{
                                    left: `${shootingStar.startX}%`,
                                    top: `${shootingStar.startY}%`,
                                    opacity: 1
                                }}
                                animate={{
                                    left: `${shootingStar.startX + 30}%`,
                                    top: `${shootingStar.startY + 40}%`,
                                    opacity: 0
                                }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1.5, ease: 'linear' }}
                            />
                        )}
                    </AnimatePresence>

                    {/* Interactive stars */}
                    {stars.map((star, index) => (
                        <motion.button
                            key={star.id || index}
                            className={`star-point ${viewedStars.includes(index) ? 'viewed' : ''} ${selectedStar === star ? 'selected' : ''}`}
                            style={{
                                left: `${star.position.x}%`,
                                top: `${star.position.y}%`
                            }}
                            onClick={() => handleStarClick(star, index)}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: index * 0.1, type: 'spring' }}
                            whileHover={{ scale: 1.3 }}
                        >
                            <Star size={24} fill="#FFD700" color="#FFD700" />
                            <span className="star-pulse"></span>
                        </motion.button>
                    ))}
                </motion.div>
            </div>

            {/* Star Info */}
            <AnimatePresence>
                {selectedStar && (
                    <motion.div
                        className="star-info-card"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                    >
                        <button className="close-info" onClick={() => setSelectedStar(null)}>
                            <X size={20} />
                        </button>
                        <div className="star-info-header">
                            <Sparkles className="info-sparkle" />
                            <span className="star-date">
                                <Calendar size={16} />
                                {selectedStar.date}
                            </span>
                        </div>
                        <p className="star-description">{selectedStar.description}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Legend */}
            <div className="sky-legend">
                <p>✨ Click on stars to discover our special memories</p>
                <p className="progress-text">
                    {viewedStars.length} / {stars.length} stars explored
                </p>
            </div>

            {/* Add Star Modal */}
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

                            <h2 className="modal-title">⭐ Add a New Star</h2>
                            <p className="modal-subtitle">Create a star for a special moment</p>

                            <form onSubmit={handleAddStar} className="star-form">
                                <div className="form-group">
                                    <label>Date / Title</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={newStar.date}
                                        onChange={(e) => setNewStar(prev => ({ ...prev, date: e.target.value }))}
                                        placeholder="e.g., Feb 14, 2025"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Memory / Description</label>
                                    <textarea
                                        className="input textarea"
                                        value={newStar.description}
                                        onChange={(e) => setNewStar(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="What makes this date special?"
                                        rows={3}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary w-full">
                                    <Star size={18} /> Place Star in Our Sky
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OurSky;
