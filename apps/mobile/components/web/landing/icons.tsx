import { ReactElement } from 'react';

interface IconProps {
  size?: number;
  color?: string;
}

function SvgIcon({ size = 24, color = 'currentColor', children }: IconProps & { children: ReactElement | ReactElement[] }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export function CalendarIcon({ size, color }: IconProps) {
  return (
    <SvgIcon size={size} color={color}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </SvgIcon>
  );
}

export function ChartIcon({ size, color }: IconProps) {
  return (
    <SvgIcon size={size} color={color}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </SvgIcon>
  );
}

export function UsersIcon({ size, color }: IconProps) {
  return (
    <SvgIcon size={size} color={color}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </SvgIcon>
  );
}

export function ClockIcon({ size, color }: IconProps) {
  return (
    <SvgIcon size={size} color={color}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </SvgIcon>
  );
}

export function ScatteredIcon({ size, color }: IconProps) {
  return (
    <SvgIcon size={size} color={color}>
      <rect x="2" y="3" width="8" height="6" rx="1" />
      <rect x="14" y="3" width="8" height="4" rx="1" />
      <rect x="2" y="13" width="8" height="4" rx="1" />
      <rect x="14" y="11" width="8" height="6" rx="1" />
      <line x1="10" y1="6" x2="14" y2="5" />
      <line x1="10" y1="15" x2="14" y2="14" />
    </SvgIcon>
  );
}

export function CheckIcon({ size, color }: IconProps) {
  return (
    <SvgIcon size={size} color={color}>
      <polyline points="20 6 9 17 4 12" />
    </SvgIcon>
  );
}

export function ArrowRightIcon({ size, color }: IconProps) {
  return (
    <SvgIcon size={size} color={color}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </SvgIcon>
  );
}

export function PlusIcon({ size, color }: IconProps) {
  return (
    <SvgIcon size={size} color={color}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </SvgIcon>
  );
}

export function MinusIcon({ size, color }: IconProps) {
  return (
    <SvgIcon size={size} color={color}>
      <line x1="5" y1="12" x2="19" y2="12" />
    </SvgIcon>
  );
}

export function MenuIcon({ size, color }: IconProps) {
  return (
    <SvgIcon size={size} color={color}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </SvgIcon>
  );
}

export function CloseIcon({ size, color }: IconProps) {
  return (
    <SvgIcon size={size} color={color}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </SvgIcon>
  );
}

export function ChevronDownIcon({ size, color }: IconProps) {
  return (
    <SvgIcon size={size} color={color}>
      <polyline points="6 9 12 15 18 9" />
    </SvgIcon>
  );
}
