import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, X, Upload, Calendar, User, Filter,
    Grid, List, Heart, Trash2, Image as ImageIcon
} from 'lucide-react';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useAchievements, ACHIEVEMENTS } from '../context/AchievementContext';
import './Memories.css';

const Memories = () => {
    const { currentUser, userProfile } = useAuth();
    const { unlockAchievement, isUnlocked } = useAchievements();
    const [memories, setMemories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMemory, setSelectedMemory] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    // Form state
    const [newMemory, setNewMemory] = useState({
        text: '',
        date: new Date().toISOString().split('T')[0],
        images: []
    });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const q = query(collection(db, 'memories'), orderBy('date', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const memoriesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMemories(memoriesData);
            setLoading(false);

            // Check for achievements
            if (memoriesData.length >= 10 && !isUnlocked(ACHIEVEMENTS.TEN_MEMORIES.id)) {
                unlockAchievement(ACHIEVEMENTS.TEN_MEMORIES.id);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        if (!currentUser) {
            alert("You must be logged in to upload images!");
            return;
        }

        setUploading(true);
        const uploadedUrls = [];

        for (const file of files) {
            try {
                // Validate file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    alert(`File ${file.name} is too large (max 5MB)`);
                    continue;
                }

                const fileName = `${Date.now()}-${file.name}`;
                const storageRef = ref(storage, `images/memories/${fileName}`);
                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);
                uploadedUrls.push(url);
            } catch (error) {
                console.error('Upload error:', error);
                alert(`Failed to upload ${file.name}. Error: ${error.message}`);
            }
        }

        setNewMemory(prev => ({
            ...prev,
            images: [...prev.images, ...uploadedUrls]
        }));
        setUploading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            alert("You must be logged in to add memories!");
            return;
        }

        if (!newMemory.text.trim()) {
            alert("Please write a description for your memory.");
            return;
        }

        try {
            await addDoc(collection(db, 'memories'), {
                ...newMemory,
                addedBy: currentUser.uid,
                addedByName: userProfile?.name || 'Unknown',
                createdAt: new Date(),
                date: new Date(newMemory.date)
            });

            // Unlock achievement
            if (!isUnlocked(ACHIEVEMENTS.MEMORY_ADDED.id)) {
                unlockAchievement(ACHIEVEMENTS.MEMORY_ADDED.id);
            }

            setNewMemory({ text: '', date: new Date().toISOString().split('T')[0], images: [] });
            setIsModalOpen(false);
            alert("Memory added successfully! 💕");
        } catch (error) {
            console.error('Error adding memory:', error);
            alert(`Failed to save memory. Error: ${error.message}`);
        }
    };

    const handleDelete = async (memoryId) => {
        if (!window.confirm('Are you sure you want to delete this memory?')) return;

        try {
            await deleteDoc(doc(db, 'memories', memoryId));
        } catch (error) {
            console.error('Error deleting memory:', error);
        }
    };

    const filteredMemories = memories.filter(memory => {
        if (filter === 'all') return true;
        return memory.addedBy === filter;
    });

    const formatDate = (date) => {
        if (!date) return '';
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="memories-page">
            <div className="memories-header">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="page-title">
                        <span className="title-icon">📸</span>
                        Our Memory Lane
                    </h1>
                    <p className="page-subtitle">
                        A collection of our beautiful moments together
                    </p>
                </motion.div>

                <div className="memories-controls">
                    <div className="filter-group">
                        <Filter size={18} />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Memories</option>
                            <option value="kavya">By Kavya</option>
                            <option value="ishaan">By Ishaan</option>
                        </select>
                    </div>

                    <div className="view-toggle">
                        <button
                            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid size={18} />
                        </button>
                        <button
                            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                        >
                            <List size={18} />
                        </button>
                    </div>

                    <button
                        className="btn btn-primary add-memory-btn"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Plus size={18} />
                        Add Memory
                    </button>
                </div>
            </div>

            {/* Memories Grid/List */}
            <div className={`memories-container ${viewMode}`}>
                {loading ? (
                    <div className="loading-state">
                        <div className="loader-heart">💕</div>
                        <p>Loading memories...</p>
                    </div>
                ) : filteredMemories.length === 0 ? (
                    <motion.div
                        className="empty-state"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <span className="empty-icon">📷</span>
                        <h3>No memories yet</h3>
                        <p>Start creating beautiful memories together!</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <Plus size={18} />
                            Add First Memory
                        </button>
                    </motion.div>
                ) : (
                    <AnimatePresence>
                        {filteredMemories.map((memory, index) => (
                            <motion.div
                                key={memory.id}
                                className="memory-card"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.05 }}
                                layout
                                onClick={() => setSelectedMemory(memory)}
                            >
                                <div className="memory-image-container">
                                    {memory.images && memory.images.length > 0 ? (
                                        <img
                                            src={memory.images[0]}
                                            alt="Memory"
                                            className="memory-image"
                                        />
                                    ) : (
                                        <div className="memory-placeholder">
                                            <ImageIcon size={40} />
                                        </div>
                                    )}
                                    {memory.images && memory.images.length > 1 && (
                                        <span className="image-count">+{memory.images.length - 1}</span>
                                    )}
                                </div>
                                <div className="memory-content">
                                    <p className="memory-text">{memory.text}</p>
                                    <div className="memory-meta">
                                        <span className="memory-date">
                                            <Calendar size={14} />
                                            {formatDate(memory.date)}
                                        </span>
                                        <span className="memory-author">
                                            <User size={14} />
                                            {memory.addedByName}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    className="memory-delete"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(memory.id);
                                    }}
                                >
                                    <Trash2 size={16} />
                                </button>
                                <div className="memory-heart">
                                    <Heart size={20} fill="#FF69B4" color="#FF69B4" />
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* Add Memory Modal */}
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
                            className="modal-content add-memory-modal"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                                <X size={24} />
                            </button>

                            <h2 className="modal-title">
                                <span>✨</span> Add New Memory
                            </h2>

                            <form onSubmit={handleSubmit} className="memory-form">
                                <div className="form-group">
                                    <label className="label">Memory Description</label>
                                    <textarea
                                        className="input textarea"
                                        placeholder="Describe this beautiful moment..."
                                        value={newMemory.text}
                                        onChange={(e) => setNewMemory(prev => ({ ...prev, text: e.target.value }))}
                                        rows={4}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="label">Date</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={newMemory.date}
                                        onChange={(e) => setNewMemory(prev => ({ ...prev, date: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="label">Photos</label>
                                    <div className="upload-area">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="file-input"
                                            id="image-upload"
                                        />
                                        <label htmlFor="image-upload" className="upload-label">
                                            <Upload size={24} />
                                            <span>{uploading ? 'Uploading...' : 'Click to upload images'}</span>
                                        </label>
                                    </div>

                                    {newMemory.images.length > 0 && (
                                        <div className="preview-images">
                                            {newMemory.images.map((url, index) => (
                                                <div key={index} className="preview-image">
                                                    <img src={url} alt={`Preview ${index}`} />
                                                    <button
                                                        type="button"
                                                        className="remove-image"
                                                        onClick={() => setNewMemory(prev => ({
                                                            ...prev,
                                                            images: prev.images.filter((_, i) => i !== index)
                                                        }))}
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-full"
                                    disabled={uploading}
                                >
                                    <Heart size={18} />
                                    Save Memory
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* View Memory Modal */}
            <AnimatePresence>
                {selectedMemory && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedMemory(null)}
                    >
                        <motion.div
                            className="modal-content view-memory-modal"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className="modal-close" onClick={() => setSelectedMemory(null)}>
                                <X size={24} />
                            </button>

                            {selectedMemory.images && selectedMemory.images.length > 0 && (
                                <div className="modal-images">
                                    {selectedMemory.images.map((url, index) => (
                                        <img key={index} src={url} alt={`Memory ${index}`} />
                                    ))}
                                </div>
                            )}

                            <div className="modal-body">
                                <p className="modal-text">{selectedMemory.text}</p>
                                <div className="modal-meta">
                                    <span>
                                        <Calendar size={16} />
                                        {formatDate(selectedMemory.date)}
                                    </span>
                                    <span>
                                        <User size={16} />
                                        Added by {selectedMemory.addedByName}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Memories;
