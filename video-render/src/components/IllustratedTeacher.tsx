import React from 'react';
import {useCurrentFrame,interpolate} from 'remotion';
/** IMPROVED PLACEHOLDER: reusable illustrated teacher, not the final 3D asset.
 * Audio-duration driven mouth motion is illustrative, not phoneme lip sync. */
export const IllustratedTeacher:React.FC<{speakingFrames:number;pose?:string}>=({speakingFrames,pose})=>{
 const f=useCurrentFrame(),blink=f%137<5,talk=f<speakingFrames?4+5*Math.abs(Math.sin(f*.37)):2;
 const lift=pose==='point'?-26:pose==='welcome'?-15:-5;
 return <svg viewBox="0 0 420 740" width="420" height="740" style={{transform:`translateY(${interpolate(f,[0,18],[24,0],{extrapolateRight:'clamp'})}px)`}} aria-label="Illustrated ELARION teacher">
 <defs><linearGradient id="shirt" x2="1" y2="1"><stop stopColor="#355AC7"/><stop offset="1" stopColor="#182C70"/></linearGradient><linearGradient id="hair" x2="1" y2="1"><stop stopColor="#684239"/><stop offset="1" stopColor="#382723"/></linearGradient></defs>
 <ellipse cx="200" cy="710" rx="130" ry="17" fill="#23366E" opacity=".14"/>
 <path d="M135 532 L125 680 Q130 705 172 695 L192 544 M212 544 L224 690 Q260 711 280 686 L270 532" fill="#26354F"/>
 <path d="M120 678 Q102 699 127 706 H174 V681 M226 681 V708 H282 Q296 693 275 681" fill="#F5F0E7" stroke="#26354F" strokeWidth="5"/>
 <path d="M113 155 Q106 40 207 41 Q308 44 306 157 L322 328 Q267 365 113 328Z" fill="url(#hair)"/>
 <path d="M173 259 L171 310 L225 317 L232 254" fill="#EAB08B"/>
 <path d="M151 298 Q107 304 94 352 L113 539 Q196 560 278 538 L291 352 Q276 310 232 300 L200 332Z" fill="url(#shirt)"/>
 <path d="M115 328 Q87 329 81 364 L57 459 Q60 485 82 476 L134 369" fill="#EAB08B"/>
 <g transform={`rotate(${lift},273,342)`}><path d="M262 330 Q288 324 303 353 L330 399 L383 368 Q402 359 408 378 Q414 390 390 405 L331 438 Q316 447 300 425 L263 378" fill="#EAB08B"/><path d="M260 328 Q283 321 303 350 L311 367 L271 395 L249 361" fill="#355AC7"/></g>
 <ellipse cx="205" cy="170" rx="80" ry="106" fill="#F5C29E"/>
 <path d="M126 147 Q107 59 191 55 Q278 38 285 133 Q235 133 197 82 Q175 127 126 147Z" fill="url(#hair)"/>
 <path d="M149 161 Q162 151 179 159 M226 158 Q245 151 258 162" fill="none" stroke="#493332" strokeWidth="5" strokeLinecap="round"/>
 {blink?<path d="M151 178 H175 M230 178 H254" stroke="#35292A" strokeWidth="5"/>:<><ellipse cx="164" cy="177" rx="7" ry="10" fill="#35292A"/><ellipse cx="243" cy="177" rx="7" ry="10" fill="#35292A"/><circle cx="166" cy="174" r="2" fill="white"/><circle cx="245" cy="174" r="2" fill="white"/></>}
 <path d="M201 177 L196 203 Q206 209 215 202" fill="none" stroke="#D28D6B" strokeWidth="4" strokeLinecap="round"/>
 <ellipse cx="205" cy="229" rx="19" ry={talk} fill="#A14E4F"/><path d="M189 225 Q205 232 221 225" fill="none" stroke="#FFF5EF" strokeWidth="3"/>
 <ellipse cx="149" cy="211" rx="15" ry="8" fill="#EE997E" opacity=".4"/><ellipse cx="258" cy="211" rx="15" ry="8" fill="#EE997E" opacity=".4"/>
 <text x="195" y="398" textAnchor="middle" fill="white" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="27">ELARION</text><path d="M183 426 L200 437 L218 426 L200 415Z" fill="#E9C761"/>
 </svg>;
};
