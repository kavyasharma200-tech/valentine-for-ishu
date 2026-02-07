import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Star } from 'lucide-react';
import Hero3D from '../components/3D/Hero3D';
import { useAchievements, ACHIEVEMENTS } from '../context/AchievementContext';
import './Home.css';

const Home = () => {
    const { unlockAchievement, isUnlocked } = useAchievements();
    const { scrollYProgress } = useScroll();

    // High-Precision Space Physics
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 40, damping: 20, restDelta: 0.001 });

    // Cinematic Astral Parallax
    const titleY = useTransform(smoothProgress, [0, 0.3], [0, 200]);
    const titleOpacity = useTransform(smoothProgress, [0, 0.25], [1, 0]);
    const titleScale = useTransform(smoothProgress, [0, 0.3], [1, 1.1]);

    const layer1Y = useTransform(smoothProgress, [0.1, 0.45], [100, 0]);
    const layer2Y = useTransform(smoothProgress, [0.4, 0.8], [100, 0]);

    useEffect(() => {
        if (!isUnlocked(ACHIEVEMENTS.FIRST_VISIT.id)) {
            unlockAchievement(ACHIEVEMENTS.FIRST_VISIT.id);
        }
    }, [unlockAchievement, isUnlocked]);

    const astralNavigation = [
        { icon: '📽️', label: 'THE REELS', desc: 'A cinematic timeline of shared space and time.', link: '/memories' },
        { icon: '💎', label: 'THE VAULT', desc: 'Secure sanctuary for private transmissions.', link: '/vault' },
        { icon: '📫', label: 'THE ECHO', desc: 'Scripted recordings for future timelines.', link: '/timecapsule' },
        { icon: '🌠', label: 'THE MAP', desc: 'Tracking our coordinates through the stars.', link: '/oursky' },
        { icon: '📡', label: 'THE PULSE', desc: 'The rhythmic frequency of our connection.', link: '/dashboard' },
        { icon: '📜', label: 'THE SCRIPT', desc: 'Archive of reasons why you define my universe.', link: '/lovenotes' },
    ];

    return (
        <div className="home-astral">
            {/* The Ethereal Atmosphere */}


            {/* Stage I: The Entrance */}
            <section className="hero-astral-wrap">
                <motion.div
                    style={{ y: titleY, opacity: titleOpacity, scale: titleScale }}
                    className="relative z-10"
                >
                    <span className="hero-astral-label shimmer-text">Perspective v5.0</span>
                    <h1 className="hero-astral-title shimmer-text">
                        ISHU.
                    </h1>
                    <div className="hero-astral-tag">Constellation 01 / North Star</div>
                </motion.div>
            </section>

            {/* Stage II: Artifacts */}
            <section className="frame-astral-container">
                <motion.div style={{ y: layer1Y }} className="w-full">
                    <div className="flex flex-col items-center mb-16">
                        <span className="hero-astral-label">Object Collection</span>
                        <h2 className="a-title text-4xl">Virtual Artifacts</h2>
                    </div>

                    <div className="a-frame">
                        <Hero3D />
                    </div>
                </motion.div>
            </section>

            {/* Stage III: Navigation Grid */}
            <section className="astral-grid">
                {astralNavigation.map((item, index) => (
                    <motion.div
                        key={item.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ delay: index * 0.1, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <Link to={item.link} className="astral-card-link">
                            <div className="astral-card">
                                <span className="a-icon">{item.icon}</span>
                                <h3 className="a-title">{item.label}</h3>
                                <p className="a-desc">{item.desc}</p>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </section>

            {/* Stage IV: The Void Message */}
            <section className="void-message">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 2 }}
                    viewport={{ once: true }}
                >
                    <div className="flex justify-center mb-12">
                        <Star className="text-cyan-400" size={32} fill="var(--aurora-cyan)" />
                    </div>
                    <p className="void-body">
                        "Your light is the only constant <br />
                        in an infinite universe of variables."
                    </p>
                    <div className="void-sig">Transmission End. / Kavya.</div>
                </motion.div>
            </section>
        </div>
    );
};

export default Home;
