import React from 'react';
import logoEducar from '../images/logo_educar_principal.png';

interface EducarLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSlogan?: boolean;
  light?: boolean;
}

export const EducarLogo: React.FC<EducarLogoProps> = ({
  className = '',
  size = 'md',
  light = false
}) => {
  const sizeClasses = {
    sm: 'h-8 sm:h-9 w-auto',
    md: 'h-10 sm:h-12 w-auto',
    lg: 'h-14 sm:h-16 w-auto',
  }[size];

  const imageElement = (
    <img
      src={logoEducar}
      alt="Colégio Educar - Construindo valores."
      className={`object-contain transition-transform hover:scale-102 ${sizeClasses}`}
      loading="eager"
    />
  );

  if (light) {
    return (
      <div className={`inline-flex items-center bg-white px-3.5 py-1.5 rounded-xl shadow-sm border border-white/20 select-none ${className}`}>
        {imageElement}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      {imageElement}
    </div>
  );
};
