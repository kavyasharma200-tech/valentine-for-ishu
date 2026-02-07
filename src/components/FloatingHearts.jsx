import React, { useEffect, useState } from 'react';
import './FloatingHearts.css';

const FloatingHearts = () => {
    const [hearts, setHearts] = useState([]);

    useEffect(() => {
        const createHeart = () => {
            const heart = {
                id: Date.now() + Math.random(),
                left: Math.random() * 100,
                animationDuration: 6 + Math.random() * 6,
                size: 15 + Math.random() * 20,
                delay: Math.random() * 2,
                type: Math.random() > 0.5 ? '💕' : Math.random() > 0.5 ? '❤️' : '💗'
            };

            setHearts(prev => [...prev, heart]);

            // Remove heart after animation
            setTimeout(() => {
                setHearts(prev => prev.filter(h => h.id !== heart.id));
            }, (heart.animationDuration + heart.delay) * 1000);
        };

        // Create initial hearts
        for (let i = 0; i < 5; i++) {
            setTimeout(createHeart, i * 500);
        }

        // Create new hearts periodically
        const interval = setInterval(createHeart, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="floating-hearts">
            {hearts.map(heart => (
                <span
                    key={heart.id}
                    className="heart"
                    style={{
                        left: `${heart.left}%`,
                        animationDuration: `${heart.animationDuration}s`,
                        animationDelay: `${heart.delay}s`,
                        fontSize: `${heart.size}px`
                    }}
                >
                    {heart.type}
                </span>
            ))}
        </div>
    );
};

export default FloatingHearts;
