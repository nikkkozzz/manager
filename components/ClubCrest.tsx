
import React from 'react';
import { CrestData } from '../types';

interface Props {
  crest: CrestData;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const ClubCrest: React.FC<Props> = ({ crest, size = 'md' }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-20 h-20',
    xl: 'w-40 h-40'
  };

  const { primaryColor, secondaryColor, pattern, shape, symbol } = crest;

  const renderPattern = () => {
    switch (pattern) {
      case 'STRIPES':
        return (
          <g>
            <rect x="0" y="0" width="20" height="100" fill={secondaryColor} />
            <rect x="40" y="0" width="20" height="100" fill={secondaryColor} />
            <rect x="80" y="0" width="20" height="100" fill={secondaryColor} />
          </g>
        );
      case 'DIAGONAL':
        return <polygon points="0,0 100,100 0,100" fill={secondaryColor} />;
      case 'CROSS':
        return (
          <g>
            <rect x="40" y="0" width="20" height="100" fill={secondaryColor} />
            <rect x="0" y="40" width="100" height="20" fill={secondaryColor} />
          </g>
        );
      case 'CHEVRON':
        return <polygon points="0,0 50,50 100,0 100,30 50,80 0,30" fill={secondaryColor} />;
      default:
        return null;
    }
  };

  const renderShape = (content: React.ReactNode) => {
    switch (shape) {
      case 'CIRCLE':
        return (
          <mask id="circleMask">
            <circle cx="50" cy="50" r="50" fill="white" />
          </mask>
        );
      case 'DIAMOND':
        return (
          <mask id="diamondMask">
            <polygon points="50,0 100,50 50,100 0,50" fill="white" />
          </mask>
        );
      default: // SHIELD
        return (
          <mask id="shieldMask">
            <path d="M10,0 L90,0 L90,60 C90,85 50,100 50,100 C50,100 10,85 10,60 Z" fill="white" />
          </mask>
        );
    }
  };

  const maskId = `${shape.toLowerCase()}Mask`;

  return (
    <div className={`${sizes[size]} relative flex items-center justify-center drop-shadow-xl`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          {renderShape(null)}
        </defs>
        
        {/* Background Layer */}
        <g mask={`url(#${maskId})`}>
          <rect x="0" y="0" width="100" height="100" fill={primaryColor} />
          {renderPattern()}
        </g>

        {/* Border / Outline */}
        {shape === 'CIRCLE' && <circle cx="50" cy="50" r="48" fill="none" stroke="white" strokeWidth="4" opacity="0.3" />}
        {shape === 'DIAMOND' && <polygon points="50,2 98,50 50,98 2,50" fill="none" stroke="white" strokeWidth="4" opacity="0.3" />}
        {shape === 'SHIELD' && <path d="M10,2 L90,2 L90,60 C90,84 50,98 50,98 C50,98 10,84 10,60 Z" fill="none" stroke="white" strokeWidth="4" opacity="0.3" />}

        {/* Center Symbol */}
        <text 
          x="50" 
          y="55" 
          fontSize="40" 
          textAnchor="middle" 
          dominantBaseline="middle" 
          className="select-none"
          style={{ filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.5))' }}
        >
          {symbol}
        </text>
      </svg>
    </div>
  );
};

export default ClubCrest;
