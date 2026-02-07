import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar, Trophy, Heart, Star,
    Clock, TrendingUp, Award, Sparkles,
    Gift, Music, Image, Lock
} from 'lucide-react';
import { useAchievements, ACHIEVEMENTS } from '../context/AchievementContext';
import './Dashboard.css';

// Important dates
const countdowns = [
    {
        id: 'kavya-birthday',
        title: "Kavya's Birthday",
        date: new Date(2026, 3, 24), // April 24, 2026
        emoji: '🎂',
        color: '#FF69B4'
    },
    {
        id: 'ishaan-birthday',
        title: "Ishaan's Birthday",
        date: new Date(2026, 11, 1), // December 1, 2026
        emoji: '🎉',
        color: '#4682B4'
    },
    {
        id: 'anniversary',
        title: "Our Anniversary",
        date: new Date(2026, 11, 30), // December 30, 2026
        emoji: '💕',
        color: '#DC143C'
    }
];

const Dashboard = () => {
    const { unlockedAchievements, isUnlocked } = useAchievements();
    const [timeLeft, setTimeLeft] = useState({});
    const [stats, setStats] = useState({
        daysTogether: 0,
        memoriesCreated: 0,
        messagesUnlocked: 0,
        songsAdded: 5
    });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const newTimeLeft = {};

            countdowns.forEach(countdown => {
                let targetDate = new Date(countdown.date);

                // If date has passed this year, set for next year
                if (targetDate < now) {
                    targetDate.setFullYear(targetDate.getFullYear() + 1);
                }

                const diff = targetDate - now;

                newTimeLeft[countdown.id] = {
                    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((diff % (1000 * 60)) / 1000)
                };
            });

            setTimeLeft(newTimeLeft);
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        // Calculate days together (from Dec 30, 2024)
        const startDate = new Date(2024, 11, 30);
        const today = new Date();
        const daysTogether = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
        setStats(prev => ({ ...prev, daysTogether: Math.max(0, daysTogether) }));

        return () => clearInterval(timer);
    }, []);

    const achievementsList = Object.values(ACHIEVEMENTS);

    return (
        <div className="dashboard-page">
            <motion.div
                className="page-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="page-title">
                    <span className="title-icon">📊</span>
                    Us Dashboard
                </h1>
                <p className="page-subtitle">
                    Our milestones, countdowns, and achievements together
                </p>
            </motion.div>

            {/* Stats Overview */}
            <motion.div
                className="stats-grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #FF69B4, #FF1493)' }}>
                        <Heart size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.daysTogether}</span>
                        <span className="stat-label">Days Together</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #87CEEB, #4682B4)' }}>
                        <Image size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.memoriesCreated}</span>
                        <span className="stat-label">Memories Created</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)' }}>
                        <Gift size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.messagesUnlocked}</span>
                        <span className="stat-label">Messages Unlocked</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #9B59B6, #8E44AD)' }}>
                        <Music size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.songsAdded}</span>
                        <span className="stat-label">Songs in Playlist</span>
                    </div>
                </div>
            </motion.div>

            {/* Countdown Timers */}
            <section className="countdown-section">
                <h2 className="section-title">
                    <Clock size={24} />
                    Countdown to Special Days
                </h2>

                <div className="countdown-grid">
                    {countdowns.map((countdown, index) => (
                        <motion.div
                            key={countdown.id}
                            className="countdown-card"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                            style={{ '--accent-color': countdown.color }}
                        >
                            <div className="countdown-emoji">{countdown.emoji}</div>
                            <h3 className="countdown-title">{countdown.title}</h3>

                            {timeLeft[countdown.id] && (
                                <div className="countdown-timer">
                                    <div className="time-unit">
                                        <motion.span
                                            className="time-value"
                                            key={timeLeft[countdown.id].days}
                                            initial={{ scale: 1.2, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                        >
                                            {timeLeft[countdown.id].days}
                                        </motion.span>
                                        <span className="time-label">Days</span>
                                    </div>
                                    <span className="time-separator">:</span>
                                    <div className="time-unit">
                                        <motion.span
                                            className="time-value"
                                            key={timeLeft[countdown.id].hours}
                                            initial={{ scale: 1.1, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                        >
                                            {String(timeLeft[countdown.id].hours).padStart(2, '0')}
                                        </motion.span>
                                        <span className="time-label">Hours</span>
                                    </div>
                                    <span className="time-separator">:</span>
                                    <div className="time-unit">
                                        <motion.span
                                            className="time-value"
                                            key={timeLeft[countdown.id].minutes}
                                            initial={{ scale: 1.1, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                        >
                                            {String(timeLeft[countdown.id].minutes).padStart(2, '0')}
                                        </motion.span>
                                        <span className="time-label">Mins</span>
                                    </div>
                                    <span className="time-separator">:</span>
                                    <div className="time-unit">
                                        <motion.span
                                            className="time-value seconds"
                                            key={timeLeft[countdown.id].seconds}
                                            initial={{ scale: 1.1 }}
                                            animate={{ scale: 1 }}
                                        >
                                            {String(timeLeft[countdown.id].seconds).padStart(2, '0')}
                                        </motion.span>
                                        <span className="time-label">Secs</span>
                                    </div>
                                </div>
                            )}

                            <div className="countdown-glow"></div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Achievements */}
            <section className="achievements-section">
                <h2 className="section-title">
                    <Trophy size={24} />
                    Achievements
                    <span className="achievement-count">
                        {unlockedAchievements.length} / {achievementsList.length}
                    </span>
                </h2>

                <div className="achievements-grid">
                    {achievementsList.map((achievement, index) => {
                        const unlocked = isUnlocked(achievement.id);

                        return (
                            <motion.div
                                key={achievement.id}
                                className={`achievement-card ${unlocked ? 'unlocked' : 'locked'}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + index * 0.05 }}
                                whileHover={unlocked ? { scale: 1.05 } : {}}
                            >
                                <div className="achievement-icon">
                                    {unlocked ? (
                                        <span className="achievement-emoji">{achievement.icon}</span>
                                    ) : (
                                        <Lock size={24} />
                                    )}
                                </div>
                                <div className="achievement-info">
                                    <span className="achievement-name">{achievement.name}</span>
                                    <span className="achievement-desc">
                                        {unlocked ? achievement.description : '???'}
                                    </span>
                                </div>
                                {unlocked && (
                                    <div className="achievement-badge">
                                        <Sparkles size={16} />
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* Milestones Timeline */}
            <section className="milestones-section">
                <h2 className="section-title">
                    <TrendingUp size={24} />
                    Our Journey
                </h2>

                <div className="timeline">
                    {[
                        { year: '2011', event: 'We both joined school 📚', icon: '🏫' },
                        { year: '2022', event: 'Scored well in 10th grade 🎓', icon: '📝' },
                        { year: '2024', event: 'Scored well in 12th grade 🎉', icon: '🎓' },
                        { year: '2024', event: 'Started our college journey 🎒', icon: '🏛️' },
                        { year: 'Dec 30, 2024', event: 'We became ONE 💕', icon: '💍' },
                        { year: 'Forever', event: 'And our story continues...', icon: '∞' },
                    ].map((milestone, index) => (
                        <motion.div
                            key={index}
                            className="timeline-item"
                            initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="timeline-marker">
                                <span>{milestone.icon}</span>
                            </div>
                            <div className="timeline-content">
                                <span className="timeline-year">{milestone.year}</span>
                                <p className="timeline-event">{milestone.event}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
