'use client';
import { motion } from 'framer-motion';
import { User, UserRound } from 'lucide-react';

interface Props {
  males: number;
  females: number;
  total: number;
}

export default function GenderDist({ males, females, total }: Props) {
  const mPct = total > 0 ? (males / total) * 100 : 0;
  const fPct = total > 0 ? (females / total) * 100 : 0;

  // SVG Config
  const R = 36;
  const C = 2 * Math.PI * R;
  const maleOffset = C - (mPct / 100) * C;
  const femaleOffset = C - (fPct / 100) * C;

  return (
    <div className="gender-dist-v2">
      <div className="gender-chart-container">
        <svg viewBox="0 0 100 100" className="gender-svg">
          {/* Base Circle */}
          <circle cx="50" cy="50" r={R} fill="transparent" stroke="#f1f5f9" strokeWidth="10" />
          
          {/* Female Segment (Background) */}
          <motion.circle
            cx="50" cy="50" r={R} fill="transparent"
            stroke="url(#female-gradient)" strokeWidth="10"
            strokeDasharray={C}
            initial={{ strokeDashoffset: C }}
            animate={{ strokeDashoffset: femaleOffset }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
            strokeLinecap="round"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          />

          {/* Male Segment (Overlay) */}
          <motion.circle
            cx="50" cy="50" r={R} fill="transparent"
            stroke="url(#male-gradient)" strokeWidth="10"
            strokeDasharray={C}
            initial={{ strokeDashoffset: C }}
            animate={{ strokeDashoffset: maleOffset }}
            transition={{ duration: 1, ease: "easeOut" }}
            strokeLinecap="round"
            style={{ transform: `rotate(${-90 + (fPct/100)*360}deg)`, transformOrigin: '50% 50%' }}
          />

          {/* Gradients */}
          <defs>
            <linearGradient id="male-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
            <linearGradient id="female-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#db2777" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Label */}
        <div className="chart-center">
            <span className="center-total">{total}</span>
            <span className="center-label">মোট সদস্য</span>
        </div>
      </div>

      <div className="gender-legend-v2">
        <div className="legend-item-v2 male">
          <div className="legend-icon-box"><User size={20} /></div>
          <div className="legend-info">
            <span className="legend-name">পুরুষ</span>
            <div className="legend-val">
              <span className="val-num">{males}</span>
              <span className="val-pct">{mPct.toFixed(1)}%</span>
            </div>
          </div>
          <div className="legend-track">
            <motion.div 
              className="legend-fill" 
              initial={{ width: 0 }} 
              animate={{ width: `${mPct}%` }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
          </div>
        </div>

        <div className="legend-item-v2 female">
          <div className="legend-icon-box"><UserRound size={20} /></div>
          <div className="legend-info">
            <span className="legend-name">নারী</span>
            <div className="legend-val">
              <span className="val-num">{females}</span>
              <span className="val-pct">{fPct.toFixed(1)}%</span>
            </div>
          </div>
          <div className="legend-track">
            <motion.div 
              className="legend-fill" 
              initial={{ width: 0 }} 
              animate={{ width: `${fPct}%` }}
              transition={{ duration: 0.8, delay: 0.7 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
