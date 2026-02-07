import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const AchievementContext = createContext();

export const useAchievements = () => {
    const context = useContext(AchievementContext);
    if (!context) {
        throw new Error('useAchievements must be used within an AchievementProvider');
    }
    return context;
};

// Achievement definitions
export const ACHIEVEMENTS = {
    FIRST_VISIT: { id: 'first_visit', name: 'First Steps', description: 'Visited the website for the first time', icon: '🌟' },
    MEMORY_ADDED: { id: 'memory_added', name: 'Memory Maker', description: 'Added your first memory', icon: '📸' },
    TEN_MEMORIES: { id: 'ten_memories', name: 'Memory Collector', description: 'Added 10 memories', icon: '🎞️' },
    VAULT_CRACKED: { id: 'vault_cracked', name: 'Code Breaker', description: 'Cracked the secret vault', icon: '🔓' },
    MESSAGE_UNLOCKED: { id: 'message_unlocked', name: 'Time Traveler', description: 'Unlocked a time capsule message', icon: '💌' },
    PLAYLIST_ADDED: { id: 'playlist_added', name: 'DJ of Love', description: 'Added a song to playlist', icon: '🎵' },
    ALL_SONGS_PLAYED: { id: 'all_songs_played', name: 'Music Lover', description: 'Played all songs in playlist', icon: '🎧' },
    COMPLIMENT_READ: { id: 'compliment_read', name: 'Sweet Talker', description: 'Read 10 compliments', icon: '💝' },
    BUCKET_COMPLETED: { id: 'bucket_completed', name: 'Dream Achiever', description: 'Completed a bucket list item', icon: '✅' },
    VOICE_LISTENED: { id: 'voice_listened', name: 'Voice of Love', description: 'Listened to a voice note', icon: '🎤' },
    STAR_EXPLORER: { id: 'star_explorer', name: 'Stargazer', description: 'Explored all stars in the sky', icon: '⭐' },
    TERMINAL_MASTER: { id: 'terminal_master', name: 'Hacker Heart', description: 'Found the terminal easter egg', icon: '💻' },
    QUIZ_COMPLETED: { id: 'quiz_completed', name: 'Soul Connector', description: 'Completed the compatibility quiz', icon: '💕' },
    TRAIT_EXPLORER: { id: 'trait_explorer', name: 'Trait Hunter', description: 'Viewed all adorable traits', icon: '💖' },
    LOVE_GURU: { id: 'love_guru', name: 'Love Guru', description: 'Unlocked 10 achievements', icon: '👑' }
};

export const AchievementProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [unlockedAchievements, setUnlockedAchievements] = useState([]);
    const [newAchievement, setNewAchievement] = useState(null);

    useEffect(() => {
        if (currentUser) {
            loadAchievements();
        }
    }, [currentUser]);

    const loadAchievements = async () => {
        if (!currentUser) return;

        try {
            const docRef = doc(db, 'achievements', currentUser.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setUnlockedAchievements(docSnap.data().unlockedBadges || []);
            } else {
                // First time user - create achievements doc
                await setDoc(docRef, {
                    uid: currentUser.uid,
                    unlockedBadges: [],
                    updatedAt: new Date()
                });
            }
        } catch (error) {
            console.error('Error loading achievements:', error);
        }
    };

    const unlockAchievement = async (achievementId) => {
        if (!currentUser || unlockedAchievements.includes(achievementId)) return;

        try {
            const newUnlocked = [...unlockedAchievements, achievementId];
            setUnlockedAchievements(newUnlocked);

            // Show notification
            const achievement = Object.values(ACHIEVEMENTS).find(a => a.id === achievementId);
            setNewAchievement(achievement);

            // Clear notification after 3 seconds
            setTimeout(() => setNewAchievement(null), 3000);

            // Save to Firebase
            const docRef = doc(db, 'achievements', currentUser.uid);
            await updateDoc(docRef, {
                unlockedBadges: newUnlocked,
                updatedAt: new Date()
            });

            // Check if unlocked 10 achievements
            if (newUnlocked.length >= 10) {
                unlockAchievement(ACHIEVEMENTS.LOVE_GURU.id);
            }
        } catch (error) {
            console.error('Error unlocking achievement:', error);
        }
    };

    const isUnlocked = (achievementId) => {
        return unlockedAchievements.includes(achievementId);
    };

    const value = {
        unlockedAchievements,
        newAchievement,
        unlockAchievement,
        isUnlocked,
        ACHIEVEMENTS
    };

    return (
        <AchievementContext.Provider value={value}>
            {children}
        </AchievementContext.Provider>
    );
};
