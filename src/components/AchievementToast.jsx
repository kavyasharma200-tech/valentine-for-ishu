import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAchievements } from '../context/AchievementContext';
import './AchievementToast.css';

const AchievementToast = () => {
    const { newAchievement } = useAchievements();

    return (
        <AnimatePresence>
            {newAchievement && (
                <motion.div
                    className="achievement-toast"
                    initial={{ x: 400, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 400, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                >
                    <div className="achievement-icon">
                        {newAchievement.icon}
                    </div>
                    <div className="achievement-content">
                        <span className="achievement-label">Achievement Unlocked!</span>
                        <span className="achievement-name">{newAchievement.name}</span>
                        <span className="achievement-desc">{newAchievement.description}</span>
                    </div>
                    <div className="achievement-glow"></div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AchievementToast;
