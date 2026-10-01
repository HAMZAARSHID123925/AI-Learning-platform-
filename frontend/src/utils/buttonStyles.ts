import { twMerge } from 'tailwind-merge';

export type ButtonVariant = 'primary' | 'secondary' | 'brand' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-ink text-white shadow-[0_3px_0_0_#000] active:translate-y-[3px] active:shadow-none hover:bg-black',
  brand: 'bg-brand-500 text-white shadow-[0_3px_0_0_#2438B0] active:translate-y-[3px] active:shadow-none hover:bg-brand-600',
  secondary: 'bg-white text-ink border-2 border-line shadow-[0_3px_0_0_#E8E9EE] active:translate-y-[3px] active:shadow-none hover:bg-surface',
  ghost: 'bg-transparent text-ink-soft hover:bg-surface hover:text-ink'
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-sm rounded-xl',
  md: 'h-11 px-5 text-[15px] rounded-2xl',
  lg: 'h-14 px-7 text-base rounded-2xl'
};

export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string): string {
  return twMerge(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap font-extrabold transition-[transform,box-shadow,background-color,color] duration-100 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100 disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    sizes[size],
    className
  );
}