import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Heart, Mail, Lock, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { login, signup } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(formData.email, formData.password);
            } else {
                await signup(formData.email, formData.password, formData.name);
            }
            navigate('/');
        } catch (error) {
            console.error('Auth error:', error);
            setError(
                error.code === 'auth/invalid-email' ? 'Invalid email address' :
                    error.code === 'auth/user-not-found' ? 'No account found with this email' :
                        error.code === 'auth/wrong-password' ? 'Incorrect password' :
                            error.code === 'auth/email-already-in-use' ? 'Email already in use' :
                                error.code === 'auth/weak-password' ? 'Password should be at least 6 characters' :
                                    'An error occurred. Please try again.'
            );
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    return (
        <div className="login-page">
            <div className="login-background">
                {[...Array(20)].map((_, i) => (
                    <span
                        key={i}
                        className="floating-heart"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            fontSize: `${16 + Math.random() * 24}px`
                        }}
                    >
                        💕
                    </span>
                ))}
            </div>

            <motion.div
                className="login-container"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="login-header">
                    <motion.div
                        className="login-logo"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        💕
                    </motion.div>
                    <h1 className="login-title">
                        {isLogin ? 'Welcome Back' : 'Join Us'}
                    </h1>
                    <p className="login-subtitle">
                        {isLogin
                            ? 'Enter our special world'
                            : 'Create your love account'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {!isLogin && (
                        <motion.div
                            className="form-group"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <label className="form-label">
                                <Heart size={16} />
                                Your Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Kavya or Ishaan"
                                required={!isLogin}
                            />
                        </motion.div>
                    )}

                    <div className="form-group">
                        <label className="form-label">
                            <Mail size={16} />
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <Lock size={16} />
                            Password
                        </label>
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            className="error-message"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            {error}
                        </motion.div>
                    )}

                    <motion.button
                        type="submit"
                        className="submit-btn"
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {loading ? (
                            <span className="loading-spinner">💕</span>
                        ) : (
                            <>
                                {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                                {isLogin ? 'Enter Our World' : 'Create Account'}
                            </>
                        )}
                    </motion.button>
                </form>

                <div className="login-switch">
                    <span>
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                    </span>
                    <button
                        type="button"
                        className="switch-btn"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                        }}
                    >
                        {isLogin ? 'Sign Up' : 'Log In'}
                    </button>
                </div>

                <div className="login-note">
                    <Heart size={14} />
                    <span>This is our private love space</span>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
