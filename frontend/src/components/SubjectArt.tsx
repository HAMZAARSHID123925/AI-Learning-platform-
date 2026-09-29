import React from 'react';
import { SubjectId } from '../types/learning';
import { subjectTheme } from '../utils/subjectTheme';

interface SubjectArtProps {
  subject: SubjectId;
  size?: number;
  tone?: 'color' | 'inverse';
  className?: string;
}

export function SubjectArt({ subject, size = 64, tone = 'color', className }: SubjectArtProps) {
  const main = tone === 'inverse' ? '#FFFFFF' : subjectTheme[subject].hex;
  const faint = tone === 'inverse' ? 'rgba(255,255,255,0.35)' : subjectTheme[subject].mid;

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" className={className}>
      {subject === 'math' &&
      <>
          <path d="M32 32 L32 12 A20 20 0 0 1 52 32 Z" fill={main} />
          <path d="M32 32 L52 32 A20 20 0 0 1 32 52 Z" fill={main} />
          <path d="M32 32 L32 52 A20 20 0 0 1 12 32 Z" fill={main} />
          <path d="M32 32 L12 32 A20 20 0 0 1 32 12 Z" fill={faint} />
          <path d="M32 12 V52 M12 32 H52" stroke={faint} strokeWidth="2" />
        </>
      }
      {subject === 'science' &&
      <>
          <path d="M16 46 C16 27 29 15 48 15 C48 34 36 46 16 46 Z" fill={main} />
          <path d="M16 46 L38 25" stroke={faint} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M12 52 H52" stroke={faint} strokeWidth="3" strokeLinecap="round" />
        </>
      }
      {subject === 'english' &&
      <>
          <text x="32" y="36" textAnchor="middle" fontSize="24" fontWeight="600" fill={main} fontFamily="Lexend, sans-serif">
            Aa
          </text>
          <rect x="14" y="43" width="36" height="3.5" rx="1.75" fill={faint} />
          <rect x="14" y="50" width="22" height="3.5" rx="1.75" fill={faint} />
        </>
      }
      {subject === 'cs' &&
      [1, 0, 1, 0, 1, 1, 1, 1, 0].map((on, i) =>
      <rect
        key={i}
        x={13 + i % 3 * 14}
        y={13 + Math.floor(i / 3) * 14}
        width="10"
        height="10"
        rx="2.5"
        fill={on ? main : faint} />

      )}
    </svg>);

}