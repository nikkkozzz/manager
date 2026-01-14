import React from 'react';
import { CrestData } from '../types';

interface Props {
  crest: CrestData;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const ClubCrest: React.FC<Props> = ({ crest, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-20 h-20',
    xl: 'w-40 h-40'
  };

  const { primaryColor, secondaryColor, pattern, shape, symbol } = crest;
  const gradientId = `grad-${primaryColor.replace('#', '')}`;
  const glossId = `gloss-${primaryColor.replace('#', '')}`;

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
        return <polygon points="0,0 100,100 0,100" fill={secondaryColor} opacity="0.6" />;
      case 'CROSS':
        return (
          <g opacity="0.6">
            <rect x="42" y="0" width="16" height="100" fill={secondaryColor} />
            <rect x="0" y="42" width="100" height="16" fill={secondaryColor} />
          </g>
        );
      case 'CHEVRON':
        return <polygon points="0,0 50,40 100,0 100,30 50,70 0,30" fill={secondaryColor} opacity="0.6" />;
      case 'CHECKERED':
        return (
          <g opacity="0.4">
            <rect x="0" y="0" width="50" height="50" fill={secondaryColor} />
            <rect x="50" y="50" width="50" height="50" fill={secondaryColor} />
          </g>
        );
      case 'STARS':
        return (
          <g fill={secondaryColor} opacity="0.3">
             <circle cx="20" cy="20" r="3" /><circle cx="80" cy="20" r="3" />
             <circle cx="20" cy="80" r="3" /><circle cx="80" cy="80" r="3" />
             <circle cx="50" cy="50" r="3" />
          </g>
        );
      default:
        return null;
    }
  };

  const renderShapePath = () => {
    switch (shape) {
      case 'CIRCLE':
        return <circle cx="50" cy="50" r="50" />;
      case 'DIAMOND':
        return <polygon points="50,0 100,50 50,100 0,50" />;
      case 'HEXAGON':
        return <polygon points="25,5 75,5 100,50 75,95 25,95 0,50" />;
      case 'SQUARE':
        return <rect x="5" y="5" width="90" height="90" rx="10" />;
      default: // SHIELD
        return <path d="M10,0 L90,0 L90,60 C90,85 50,100 50,100 C50,100 10,85 10,60 Z" />;
    }
  };

  return (
    <div className={`${sizes[size]} relative flex items-center justify-center drop-shadow-2xl ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: primaryColor, stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: primaryColor, stopOpacity: 0.8 }} />
          </linearGradient>
          
          <linearGradient id={glossId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'white', stopOpacity: 0.4 }} />
            <stop offset="50%" style={{ stopColor: 'white', stopOpacity: 0 }} />
          </linearGradient>

          <clipPath id={`clip-${gradientId}`}>
            {renderShapePath()}
          </clipPath>
          
          <filter id="shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.5"/>
          </filter>
        </defs>
        
        {/* Background con Degradado */}
        <g clipPath={`url(#clip-${gradientId})`}>
          <rect x="0" y="0" width="100" height="100" fill={`url(#${gradientId})`} />
          {renderPattern()}
          
          {/* Capa de Brillo Superior (Glossy) */}
          <rect x="0" y="0" width="100" height="50" fill={`url(#${glossId})`} />
        </g>

        {/* Borde de la forma */}
        <g fill="none" stroke="white" strokeWidth="3" opacity="0.3">
           {renderShapePath()}
        </g>

        {/* Símbolo Central con Sombra */}
        <text 
          x="50" 
          y="56" 
          fontSize="44" 
          textAnchor="middle" 
          dominantBaseline="middle" 
          filter="url(#shadow)"
          className="select-none pointer-events-none"
        >
          {symbol}
        </text>
      </svg>
    </div>
  );
};

export default ClubCrest;
