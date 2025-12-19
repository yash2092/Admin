import React from 'react';
import '../styles/admin/ui/Stepper.css';

export default function Stepper({ steps, activeIndex = 0 }) {
  const safeSteps = Array.isArray(steps) ? steps : [];
  const stepCount = safeSteps.length;

  // CSS uses this variable to size the track evenly.
  // WHY:
  // - Keeping the layout logic in CSS makes the component easier to maintain.
  const trackStyle = { '--steps': stepCount };

  return (
    <div className="stepper">
      <div className="stepTrack" style={trackStyle}>
        {safeSteps.map((step, index) => {
          // A step is "active" if we have reached it or passed it.
          const isActive = index <= activeIndex;

          const key = step.key || step.label || index;
          const isLastStep = index === stepCount - 1;
          const dotClassName = isActive ? 'stepDot stepDotActive' : 'stepDot';

          return (
            <div className="step" key={key}>
              {isLastStep ? null : <div className="stepLine" />}
              <div className={dotClassName}>{index + 1}</div>
              <div className="stepLabel">{step.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
