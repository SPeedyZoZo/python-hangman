import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { Icon, type IconName } from './Icon.tsx';

type Variant = 'primary' | 'secondary' | 'ghost';

interface CommonProps {
  variant?: Variant;
  icon?: IconName;
  size?: 'md' | 'lg' | 'sm';
  children?: ReactNode;
}

function cls(variant: Variant, size: string, extra?: string) {
  return ['btn', `btn-${variant}`, `btn-${size}`, extra].filter(Boolean).join(' ');
}

export function Button({
  variant = 'secondary',
  icon,
  size = 'md',
  children,
  className,
  type = 'button',
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={cls(variant, size, className)} {...rest}>
      {icon && <Icon name={icon} />}
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = 'secondary',
  icon,
  size = 'md',
  children,
  className,
  ...rest
}: CommonProps & LinkProps) {
  return (
    <Link className={cls(variant, size, className)} {...rest}>
      {icon && <Icon name={icon} />}
      {children}
    </Link>
  );
}
