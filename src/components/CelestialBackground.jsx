import React, { useMemo, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const CelestialBackground = () => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
    const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            const { clientX, clientY } = e;
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            mouseX.set(clientX - centerX);
            mouseY.set(clientY - centerY);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    const stars = useMemo(() => {
        return Array.from({ length: 350 }, (_, i) => ({
            id: i,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            size: Math.random() * 2 + 0.5,
            duration: Math.random() * 4 + 3,
            delay: Math.random() * 5,
            parallaxFactor: Math.random() * 50 + 20,
            driftX: (Math.random() - 0.5) * 50,
            driftY: (Math.random() - 0.5) * 50,
            color: Math.random() > 0.88
                ? (Math.random() > 0.5 ? '#06B6D4' : '#C084FC')
                : '#FFFFFF'
        }));
    }, []);

    const shootingStars = useMemo(() => {
        return Array.from({ length: 5 }, (_, i) => ({
            id: `ss-${i}`,
            top: `${Math.random() * 60}%`,
            left: `${Math.random() * 60}%`,
            delay: Math.random() * 20,
            duration: Math.random() * 2 + 1,
            trailColor: i % 2 === 0 ? '#06B6D4' : '#7C3AED'
        }));
    }, []);

    return (
        <div className="celestial-container-global">
            {/* The Aurora Lights */}
            <div className="aurora-bg" />
            <div className="aurora-blur" />

            {/* The Infinite Star Field */}
            {stars.map((star) => (
                <StarItem
                    key={star.id}
                    star={star}
                    springX={springX}
                    springY={springY}
                />
            ))}

            {/* The Magical Shooting Stars */}
            {shootingStars.map((ss) => (
                <motion.div
                    key={ss.id}
                    className="shooting-star-vFX"
                    style={{
                        top: ss.top,
                        left: ss.left,
                        background: `linear-gradient(90deg, #fff, ${ss.trailColor}, transparent)`,
                        opacity: 0
                    }}
                    animate={{
                        x: [0, 800],
                        y: [0, 800],
                        opacity: [0, 1, 0],
                        scaleX: [0.1, 1, 0.1]
                    }}
                    transition={{
                        duration: ss.duration,
                        repeat: Infinity,
                        delay: ss.delay,
                        repeatDelay: Math.random() * 25 + 15,
                        ease: "easeOut"
                    }}
                />
            ))}
        </div>
    );
};

const StarItem = ({ star, springX, springY }) => {
    const mouseTranslX = useTransform(springX, (value) => value / star.parallaxFactor);
    const mouseTranslY = useTransform(springY, (value) => value / star.parallaxFactor);

    return (
        <motion.div
            className="star-vFX"
            style={{
                top: star.top,
                left: star.left,
                width: star.size,
                height: star.size,
                backgroundColor: star.color,
                boxShadow: star.size > 1.2 ? `0 0 8px ${star.color}` : 'none',
                x: mouseTranslX,
                y: mouseTranslY
            }}
            animate={{
                opacity: [0.1, 0.8, 1, 0.8, 0.1],
                scale: [1, 1.2, 1, 1.1, 1],
                translateX: [0, star.driftX, 0],
                translateY: [0, star.driftY, 0]
            }}
            transition={{
                opacity: { duration: star.duration, repeat: Infinity, delay: star.delay, ease: "easeInOut" },
                scale: { duration: star.duration, repeat: Infinity, delay: star.delay, ease: "easeInOut" },
                translateX: { duration: star.duration * 4, repeat: Infinity, ease: "easeInOut" },
                translateY: { duration: star.duration * 4, repeat: Infinity, ease: "easeInOut" }
            }}
        />
    );
};

export default CelestialBackground;
