import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Lock, Unlock, Plus, X, Send,
    Clock, Heart, Sparkles, Mail
} from 'lucide-react';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useAchievements, ACHIEVEMENTS } from '../context/AchievementContext';
import './TimeCapsule.css';

// Pre-loaded messages for Valentine's Week 2025
const preloadedMessages = [
    { date: '2025-02-08', message: "Will you be the husband of my dreams? 💍", title: "Propose Day" },
    { date: '2025-02-09', message: "You are soft and fluffy, even more than Mr. Potter 🧸", title: "Teddy Day" },
    { date: '2025-02-10', message: "I will never leave you alone 🤝", title: "Promise Day" },
    { date: '2025-02-11', message: "You are sweeter than Amul Chocominis 🍫", title: "Chocolate Day" },
    { date: '2025-02-12', message: "Muah, muah, muah 💋", title: "Kiss Day" },
    { date: '2025-02-13', message: "You would make a cool cuddly bear 🤗", title: "Hug Day" },
    { date: '2025-02-14', message: "If not you, then no one. Together till Ragnarok ⚔️💕", title: "Valentine's Day" },
];

const TimeCapsule = () => {
    const { currentUser, userProfile } = useAuth();
    const { unlockAchievement, isUnlocked } = useAchievements();
    const [messages, setMessages] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMonth, setViewMonth] = useState(new Date());

    // Form state
    const [newMessage, setNewMessage] = useState({
        message: '',
        unlockDate: '',
        isRecurring: false
    });

    useEffect(() => {
        // Update current time every minute
        const timer = setInterval(() => setCurrentDate(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const q = query(collection(db, 'timeCapMessages'), orderBy('unlockDate', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messagesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Merge with preloaded messages
            const allMessages = [...preloadedMessages.map((m, i) => ({
                id: `preloaded-${i}`,
                ...m,
                unlockDate: new Date(m.date),
                isPreloaded: true
            })), ...messagesData];

            setMessages(allMessages);
        });

        return () => unsubscribe();
    }, []);

    const isUnlockedMessage = (message) => {
        const unlockDate = message.unlockDate?.toDate ? message.unlockDate.toDate() : new Date(message.unlockDate);
        return currentDate >= unlockDate;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            alert("You must be logged in!");
            return;
        }

        if (!newMessage.message.trim() || !newMessage.unlockDate) {
            alert("Please provide a message and date.");
            return;
        }

        try {
            await addDoc(collection(db, 'timeCapMessages'), {
                message: newMessage.message,
                unlockDate: new Date(newMessage.unlockDate),
                isRecurring: newMessage.isRecurring,
                addedBy: currentUser.uid,
                addedByName: userProfile?.name || 'Unknown',
                createdAt: new Date(),
                isUnlocked: false
            });

            setNewMessage({ message: '', unlockDate: '', isRecurring: false });
            setIsModalOpen(false);
            alert("Time Capsule locked successfully! 💌");
        } catch (error) {
            console.error('Error adding message:', error);
            alert(`Failed to save message. Error: ${error.message}`);
        }
    };

    const handleMessageClick = (message) => {
        if (isUnlockedMessage(message)) {
            setSelectedMessage(message);

            // Unlock achievement
            if (!isUnlocked(ACHIEVEMENTS.MESSAGE_UNLOCKED.id)) {
                unlockAchievement(ACHIEVEMENTS.MESSAGE_UNLOCKED.id);
            }
        }
    };

    const formatDate = (date) => {
        const d = date?.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getTimeUntilUnlock = (message) => {
        const unlockDate = message.unlockDate?.toDate ? message.unlockDate.toDate() : new Date(message.unlockDate);
        const diff = unlockDate - currentDate;

        if (diff <= 0) return null;

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) return `${days}d ${hours}h`;
        return `${hours}h`;
    };

    // Calendar helpers
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDay = firstDay.getDay();

        const days = [];
        for (let i = 0; i < startDay; i++) {
            days.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    const getMessagesForDate = (date) => {
        if (!date) return [];
        return messages.filter(m => {
            const mDate = m.unlockDate?.toDate ? m.unlockDate.toDate() : new Date(m.unlockDate);
            return mDate.getDate() === date.getDate() &&
                mDate.getMonth() === date.getMonth() &&
                mDate.getFullYear() === date.getFullYear();
        });
    };

    return (
        <div className="timecapsule-page">
            <motion.div
                className="page-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="page-title">
                    <span className="title-icon">💌</span>
                    Time Capsule
                </h1>
                <p className="page-subtitle">
                    Messages in bottles, waiting to be opened on special dates
                </p>
            </motion.div>

            <div className="timecapsule-content">
                {/* Calendar View */}
                <motion.div
                    className="calendar-section card"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="calendar-header">
                        <button
                            className="calendar-nav"
                            onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1))}
                        >
                            ←
                        </button>
                        <h3 className="calendar-title">
                            {viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h3>
                        <button
                            className="calendar-nav"
                            onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1))}
                        >
                            →
                        </button>
                    </div>

                    <div className="calendar-weekdays">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <span key={day} className="weekday">{day}</span>
                        ))}
                    </div>

                    <div className="calendar-days">
                        {getDaysInMonth(viewMonth).map((date, index) => {
                            const dayMessages = date ? getMessagesForDate(date) : [];
                            const hasMessage = dayMessages.length > 0;
                            const isToday = date && date.toDateString() === currentDate.toDateString();
                            const hasUnlocked = dayMessages.some(m => isUnlockedMessage(m));

                            return (
                                <div
                                    key={index}
                                    className={`calendar-day ${!date ? 'empty' : ''} ${isToday ? 'today' : ''} ${hasMessage ? 'has-message' : ''} ${hasUnlocked ? 'unlocked' : ''}`}
                                    onClick={() => {
                                        if (hasMessage && hasUnlocked) {
                                            handleMessageClick(dayMessages.find(m => isUnlockedMessage(m)));
                                        }
                                    }}
                                >
                                    {date && (
                                        <>
                                            <span className="day-number">{date.getDate()}</span>
                                            {hasMessage && (
                                                <span className="message-indicator">
                                                    {hasUnlocked ? '💌' : '🔒'}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Messages List */}
                <motion.div
                    className="messages-section"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="messages-header">
                        <h3>All Messages</h3>
                        <button
                            className="btn btn-primary"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <Plus size={18} />
                            New Message
                        </button>
                    </div>

                    <div className="messages-list">
                        {messages
                            .sort((a, b) => {
                                const dateA = a.unlockDate?.toDate ? a.unlockDate.toDate() : new Date(a.unlockDate);
                                const dateB = b.unlockDate?.toDate ? b.unlockDate.toDate() : new Date(b.unlockDate);
                                return dateA - dateB;
                            })
                            .map((message, index) => {
                                const unlocked = isUnlockedMessage(message);
                                const timeUntil = getTimeUntilUnlock(message);

                                return (
                                    <motion.div
                                        key={message.id}
                                        className={`message-card ${unlocked ? 'unlocked' : 'locked'}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => handleMessageClick(message)}
                                        whileHover={unlocked ? { scale: 1.02 } : {}}
                                    >
                                        <div className="message-icon">
                                            {unlocked ? <Unlock size={24} /> : <Lock size={24} />}
                                        </div>
                                        <div className="message-info">
                                            <span className="message-title">
                                                {message.title || (unlocked ? 'Open me! 💕' : 'Secret Message')}
                                            </span>
                                            <span className="message-date">
                                                <Calendar size={14} />
                                                {formatDate(message.unlockDate)}
                                            </span>
                                            {!unlocked && timeUntil && (
                                                <span className="message-countdown">
                                                    <Clock size={14} />
                                                    Unlocks in {timeUntil}
                                                </span>
                                            )}
                                        </div>
                                        {unlocked && (
                                            <div className="message-preview">
                                                <Heart size={16} fill="#FF69B4" color="#FF69B4" />
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                    </div>
                </motion.div>
            </div>

            {/* Add Message Modal */}
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

                            <div className="modal-header">
                                <Mail size={32} className="modal-icon" />
                                <h2>Create Time Capsule Message</h2>
                                <p>Write a message to be unlocked on a special date</p>
                            </div>

                            <form onSubmit={handleSubmit} className="message-form">
                                <div className="form-group">
                                    <label className="label">Your Message</label>
                                    <textarea
                                        className="input textarea"
                                        placeholder="Write something beautiful..."
                                        value={newMessage.message}
                                        onChange={(e) => setNewMessage(prev => ({ ...prev, message: e.target.value }))}
                                        rows={4}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="label">Unlock Date</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={newMessage.unlockDate}
                                        onChange={(e) => setNewMessage(prev => ({ ...prev, unlockDate: e.target.value }))}
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                </div>

                                <div className="form-group checkbox-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={newMessage.isRecurring}
                                            onChange={(e) => setNewMessage(prev => ({ ...prev, isRecurring: e.target.checked }))}
                                        />
                                        <span className="checkbox-text">Repeat annually</span>
                                    </label>
                                </div>

                                <button type="submit" className="btn btn-primary w-full">
                                    <Send size={18} />
                                    Seal Message
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* View Message Modal */}
            <AnimatePresence>
                {selectedMessage && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedMessage(null)}
                    >
                        <motion.div
                            className="modal-content message-reveal-modal"
                            initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
                            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                            exit={{ scale: 0.8, opacity: 0, rotateY: 90 }}
                            transition={{ type: 'spring', duration: 0.6 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className="modal-close" onClick={() => setSelectedMessage(null)}>
                                <X size={24} />
                            </button>

                            <div className="message-reveal">
                                <div className="reveal-sparkles">
                                    <Sparkles className="sparkle-icon" />
                                </div>

                                {selectedMessage.title && (
                                    <h3 className="reveal-title">{selectedMessage.title}</h3>
                                )}

                                <div className="reveal-date">
                                    <Calendar size={16} />
                                    {formatDate(selectedMessage.unlockDate)}
                                </div>

                                <div className="reveal-message">
                                    <p>{selectedMessage.message}</p>
                                </div>

                                <div className="reveal-hearts">
                                    {[...Array(5)].map((_, i) => (
                                        <span
                                            key={i}
                                            className="reveal-heart"
                                            style={{ animationDelay: `${i * 0.2}s` }}
                                        >
                                            💕
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TimeCapsule;
