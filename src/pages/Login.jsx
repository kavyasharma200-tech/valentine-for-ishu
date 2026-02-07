import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import './Login.css';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login, signup } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await signup(email, password);
            }
            navigate('/valentine-for-ishu/');
        } catch (err) {
            setError(err.message || 'Failed to authenticate');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="universe-bg" />
            <div className="nebula-layer" />

            <motion.div
                className="login-cosmic-portal"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
            >
                <div className="login-header-celestial">
                    <span className="login-star-symbol">✦</span>
                    <h1 className="login-title-celestial">PORTAL</h1>
                    <p className="login-subtitle-stardust">UNIVERSE ACCESS GRANTED FOR ISHU GUPTA</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group-cosmic">
                        <label className="label-gold">User Identifier</label>
                        <input
                            type="email"
                            className="input-stardust"
                            placeholder="Enter registry mail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group-cosmic">
                        <label className="label-gold">Universe Key</label>
                        <input
                            type="password"
                            className="input-stardust"
                            placeholder="Secure connection key"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p className="text-red-500 text-xs text-center font-bold">{error}</p>}

                    <button className="btn-celestial-access" type="submit" disabled={loading}>
                        {loading ? 'CALIBRATING...' : (isLogin ? 'INITIATE JOURNEY' : 'REGISTER ACCESS')}
                    </button>
                </form>

                <div className="login-switch-celestial">
                    {isLogin ? "No registry found?" : "Already registered?"}
                    <button className="switch-btn-gold" onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? 'Request Access' : 'Return to Portal'}
                    </button>
                </div>

                <div className="login-auth-footer">
                    Strictly for Authorized Perspective: Constellation 01 / ISHU.
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
