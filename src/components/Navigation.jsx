import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home, Image, Lock, Hourglass, LayoutDashboard,
    Link2, Heart, Star, Menu, X, LogOut, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navigation.css';

const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/memories', icon: Image, label: 'Memories' },
    { path: '/vault', icon: Lock, label: 'Secret Vault' },
    { path: '/timecapsule', icon: Hourglass, label: 'Time Capsule' },
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/connection', icon: Link2, label: 'Connection Hub' },
    { path: '/lovenotes', icon: Heart, label: 'Love Notes' },
    { path: '/oursky', icon: Star, label: 'Our Sky' },
];

const Navigation = () => {
    const { currentUser, userProfile, logout } = useAuth();
    const navigate = useNavigate();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <>
            {/* Desktop Navigation */}
            <nav className="nav-desktop">
                <div className="nav-container">
                    <NavLink to="/" className="nav-logo">
                        <span className="logo-heart">💕</span>
                        <span className="logo-text">K & I</span>
                    </NavLink>

                    <div className="nav-links">
                        {navItems.map(item => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            >
                                <item.icon size={18} />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </div>

                    <div className="nav-user">
                        {currentUser ? (
                            <div className="user-menu">
                                <span className="user-name">
                                    <User size={16} />
                                    {userProfile?.name || 'User'}
                                </span>
                                <button className="logout-btn" onClick={handleLogout}>
                                    <LogOut size={16} />
                                </button>
                            </div>
                        ) : (
                            <NavLink to="/login" className="login-btn">
                                Login
                            </NavLink>
                        )}
                    </div>
                </div>
            </nav>

            {/* Mobile Navigation */}
            <nav className="nav-mobile">
                <div className="nav-mobile-header">
                    <NavLink to="/" className="nav-logo">
                        <span className="logo-heart">💕</span>
                        <span className="logo-text">K & I</span>
                    </NavLink>

                    <button
                        className="mobile-toggle"
                        onClick={() => setIsMobileOpen(!isMobileOpen)}
                    >
                        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                <AnimatePresence>
                    {isMobileOpen && (
                        <motion.div
                            className="mobile-menu"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            {navItems.map(item => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) => `mobile-link ${isActive ? 'active' : ''}`}
                                    onClick={() => setIsMobileOpen(false)}
                                >
                                    <item.icon size={20} />
                                    <span>{item.label}</span>
                                </NavLink>
                            ))}

                            {currentUser ? (
                                <button className="mobile-logout" onClick={handleLogout}>
                                    <LogOut size={20} />
                                    <span>Logout</span>
                                </button>
                            ) : (
                                <NavLink
                                    to="/login"
                                    className="mobile-link"
                                    onClick={() => setIsMobileOpen(false)}
                                >
                                    <User size={20} />
                                    <span>Login</span>
                                </NavLink>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Bottom Navigation (Mobile) */}
            <div className="nav-bottom">
                {navItems.slice(0, 5).map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `bottom-link ${isActive ? 'active' : ''}`}
                    >
                        <item.icon size={22} />
                        <span>{item.label.split(' ')[0]}</span>
                    </NavLink>
                ))}
            </div>
        </>
    );
};

export default Navigation;
