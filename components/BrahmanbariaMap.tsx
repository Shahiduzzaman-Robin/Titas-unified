'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface UpazilaData { label: string; count: number; }
interface Props { upazilas: UpazilaData[]; total: number; }

const ID_TO_BN: Record<string, string> = {
  Sadar: 'সদর',
  Kasba: 'কসবা',
  Nabinagar: 'নবীনগর',
  Nasirnagar: 'নাসিরনগর',
  Sarail: 'সরাইল',
  Ashuganj: 'আশুগঞ্জ',
  Akhaura: 'আখাউড়া',
  Bancharampur: 'বাঞ্ছারামপুর',
  Bijoynagar: 'বিজয়নগর',
};

export default function BrahmanbariaMap({ upazilas, total }: Props) {
  const [active, setActive] = useState<string | null>(null);
  const [paths, setPaths] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/upazila-paths.json').then(r => r.json()).then(setPaths);
  }, []);

  const dataMap: Record<string, UpazilaData> = {};
  upazilas.forEach(u => { dataMap[u.label] = u; });

  const getCount = (id: string) => dataMap[ID_TO_BN[id]]?.count ?? 0;
  const getPct = (id: string) => total > 0 ? ((getCount(id) / total) * 100).toFixed(1) : '0';

  const maxCount = Math.max(...Object.keys(ID_TO_BN).map(id => getCount(id)), 1);
  const getColor = (id: string) => {
    const ratio = getCount(id) / maxCount;
    const l = Math.round(88 - ratio * 48);
    const s = Math.round(45 + ratio * 45);
    return `hsl(220,${s}%,${l}%)`;
  };

  const activeData = active
    ? { bn: ID_TO_BN[active], count: getCount(active), pct: getPct(active) }
    : null;

  const sorted = [...upazilas].sort((a, b) => b.count - a.count);

  return (
    <div className="bb-map-wrapper">
      <div className="bb-map-container">
        {Object.keys(paths).length > 0 ? (
          <svg viewBox="0 0 836.37 940.14" className="bb-map-svg" xmlns="http://www.w3.org/2000/svg">
            {Object.entries(paths).map(([id, d]) => (
              <path
                key={id}
                d={d}
                className={`bb-upazila${active === id ? ' bb-active' : ''}`}
                style={{ fill: getColor(id), stroke: '#fff', strokeWidth: 3 }}
                onMouseEnter={() => setActive(id)}
                onMouseLeave={() => setActive(null)}
              />
            ))}
          </svg>
        ) : (
          <div className="bb-map-loading">মানচিত্র লোড হচ্ছে...</div>
        )}

        <AnimatePresence>
          {activeData && (
            <motion.div
              className="bb-tooltip"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
            >
              <div className="bb-tooltip-name">{activeData.bn}</div>
              <div className="bb-tooltip-count">{activeData.count} <span>জন</span></div>
              <div className="bb-tooltip-pct">{activeData.pct}%</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="bb-legend">
        {sorted.map(u => {
          const id = Object.keys(ID_TO_BN).find(k => ID_TO_BN[k] === u.label);
          const isActive = active && ID_TO_BN[active] === u.label;
          const pct = total > 0 ? ((u.count / total) * 100) : 0;
          return (
            <div
              key={u.label}
              className={`bb-legend-item${isActive ? ' bb-legend-active' : ''}`}
              onMouseEnter={() => { if (id) setActive(id); }}
              onMouseLeave={() => setActive(null)}
            >
              <span className="bb-legend-dot" style={{ background: id ? getColor(id) : '#ccc' }} />
              <span className="bb-legend-label">{u.label}</span>
              <span className="bb-legend-num">{u.count}</span>
              <div className="bb-legend-bar-bg">
                <motion.div
                  className="bb-legend-bar"
                  style={{ background: id ? getColor(id) : '#ccc' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
              <span className="bb-legend-pct">{pct.toFixed(1)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
