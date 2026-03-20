import React from 'react';
import './TrainAnimation.css';

interface TrainAnimationProps {
    className?: string;
}

const TrainAnimation: React.FC<TrainAnimationProps> = ({ className = '' }) => {
    return (
        <div className={`train-pill-container ${className}`}>
            <div className="train-track-area">
                <img src="/train.svg" alt="Titas Train" className="moving-train" />
                <div className="track-rail"></div>
                <div className="track-sleepers">
                    {[...Array(24)].map((_, i) => (
                        <div key={i} className="sleeper"></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TrainAnimation;
