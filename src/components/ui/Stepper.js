import React from 'react';

export default function Stepper({ steps, activeIndex = 0 }) {
  return (
    <div className="stepper">
      <div className="stepTrack" style={{ '--steps': steps.length }}>
        {steps.map((s, idx) => {
          const active = idx <= activeIndex;
          return (
            <div className="step" key={s.key || s.label || idx}>
              {idx < steps.length - 1 ? <div className="stepLine" /> : null}
              <div className={active ? 'stepDot stepDotActive' : 'stepDot'}>{idx + 1}</div>
              <div className="stepLabel">{s.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
