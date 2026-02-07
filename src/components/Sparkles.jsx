import React, { useEffect, useState } from 'react';
import './Sparkles.css';

const Sparkles = () => {
    const [sparkles, setSparkles] = useState([]);

    useEffect(() => {
        const createSparkle = () => {
            const sparkle = {
                id: Date.now() + Math.random(),
                left: Math.random() * 100,
                top: Math.random() * 100,
                size: 4 + Math.random() * 8,
                duration: 1 + Math.random() * 2,
                delay: Math.random() * 2
            };

            setSparkles(prev => [...prev.slice(-30), sparkle]);
        };

        // Create initial sparkles
        for (let i = 0; i < 15; i++) {
            setTimeout(createSparkle, i * 200);
        }

        const interval = setInterval(createSparkle, 300);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="sparkles-container">
            {sparkles.map(sparkle => (
                <div
                    key={sparkle.id}
                    className="sparkle"
                    style={{
                        left: `${sparkle.left}%`,
                        top: `${sparkle.top}%`,
                        width: `${sparkle.size}px`,
                        height: `${sparkle.size}px`,
                        animationDuration: `${sparkle.duration}s`,
                        animationDelay: `${sparkle.delay}s`
                    }}
                />
            ))}
        </div>
    );
};

export default Sparkles;
