'use client';
import React from 'react';
import Link, { LinkProps } from 'next/link';
import { buttonClasses, type ButtonSize, type ButtonVariant } from '@/utils/buttonStyles';

interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
}

export function ButtonLink({ variant = 'primary', size = 'md', className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClasses(variant, size, className)} {...props} />;
}