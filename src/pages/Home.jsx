import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Sparkles, ArrowDown } from 'lucide-react';
import Hero3D from '../components/3D/Hero3D';
import { useAchievements, ACHIEVEMENTS } from '../context/AchievementContext';
import './Home.css';

const Home = () => {
    const { unlockAchievement, isUnlocked } = useAchievements();

    useEffect(() => {
        // Unlock first visit achievement
        if (!isUnlocked(ACHIEVEMENTS.FIRST_VISIT.id)) {
            unlockAchievement(ACHIEVEMENTS.FIRST_VISIT.id);
        }
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: 'easeOut' }
        }
    };

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <motion.div
                    className="hero-content"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div className="hero-badge" variants={itemVariants}>
                        <Sparkles size={16} />
                        Made with love
                    </motion.div>

                    <motion.h1 className="hero-title" variants={itemVariants}>
                        Welcome{' '}
                        <span className="hero-name">Ishu Pie</span>
                        <span className="hero-heart">💕</span>
                    </motion.h1>

                    <motion.p className="hero-subtitle" variants={itemVariants}>
                        A special place created just for you, filled with our memories,
                        dreams, and endless love. Explore our little corner of the internet.
                    </motion.p>

                    <motion.div className="hero-buttons" variants={itemVariants}>
                        <a href="#explore" className="btn btn-primary">
                            <Heart size={18} />
                            Start Exploring
                        </a>
                        <a href="#3d-section" className="btn btn-secondary">
                            View Gifts
                        </a>
                    </motion.div>

                    <motion.div className="hero-stats" variants={itemVariants}>
                        <div className="stat-item">
                            <span className="stat-value">∞</span>
                            <span className="stat-label">Love</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <span className="stat-value">Dec 30</span>
                            <span className="stat-label">Our Day</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <span className="stat-value">Forever</span>
                            <span className="stat-label">Together</span>
                        </div>
                    </motion.div>
                </motion.div>

                <motion.div
                    className="scroll-indicator"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                >
                    <ArrowDown className="scroll-arrow" />
                    <span>Scroll to explore</span>
                </motion.div>
            </section>

            {/* 3D Interactive Section */}
            <section id="3d-section" className="section-3d">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <h2 className="section-title">
                        <span className="title-icon">🎁</span>
                        Virtual Gifts for You
                    </h2>
                    <p className="section-description">
                        Swipe through these 3D gifts I've prepared for you. Click on each one for a special message!
                    </p>
                    <Hero3D />
                </motion.div>
            </section>

            {/* Features Preview */}
            <section id="explore" className="features-section">
                <motion.h2
                    className="section-title"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <span className="title-icon">✨</span>
                    Explore Our World
                </motion.h2>

                <div className="features-grid">
                    {[
                        { icon: '📸', title: 'Memory Lane', desc: 'Our photo album filled with beautiful moments', link: '/memories' },
                        { icon: '🔐', title: 'Secret Vault', desc: 'Crack the code to unlock a special message', link: '/vault' },
                        { icon: '💌', title: 'Time Capsule', desc: 'Messages that unlock on special dates', link: '/timecapsule' },
                        { icon: '📊', title: 'Our Dashboard', desc: 'Countdowns, achievements, and milestones', link: '/dashboard' },
                        { icon: '🎵', title: 'Connection Hub', desc: 'Music, quizzes, and bucket list', link: '/connection' },
                        { icon: '💝', title: 'Love Notes', desc: 'Compliments, voice notes, and adorable traits', link: '/lovenotes' },
                        { icon: '⭐', title: 'Our Sky', desc: 'A constellation of our special dates', link: '/oursky' },
                    ].map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            className="feature-card"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -10, scale: 1.02 }}
                        >
                            <Link to={feature.link} className="feature-link">
                                <span className="feature-icon">{feature.icon}</span>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-desc">{feature.desc}</p>
                                <div className="feature-arrow">→</div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Love Message */}
            <section className="love-section">
                <motion.div
                    className="love-message-container"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <div className="love-hearts">
                        {[...Array(20)].map((_, i) => (
                            <span
                                key={i}
                                className="floating-mini-heart"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 3}s`,
                                    fontSize: `${12 + Math.random() * 16}px`
                                }}
                            >
                                💕
                            </span>
                        ))}
                    </div>
                    <h2 className="love-title">To My Dearest Ishu</h2>
                    <p className="love-text">
                        Every pixel of this website is filled with my love for you.
                        You are the reason I smile every day, and I wanted to create
                        something special that we can cherish together.
                        <br /><br />
                        <strong>I love you to the moon and back! 🌙</strong>
                    </p>
                    <div className="love-signature">
                        Forever Yours,<br />
                        <span className="signature-name">Kavya 💕</span>
                    </div>
                </motion.div>
            </section>
        </div>
    );
};

export default Home;
