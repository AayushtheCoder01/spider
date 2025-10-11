import { useTheme } from '../contexts/ThemeContext';

const VARIANT_MAP = {
  premium: {
    icon: '⭐',
    bg: (theme) => theme.accent + '20',
    fg: (theme) => theme.accent,
    border: (theme) => theme.accent + '60',
  },
  active: {
    icon: '✓',
    bg: (theme) => theme.correct + '20',
    fg: (theme) => theme.correct,
    border: (theme) => theme.correct + '60',
  },
  free: {
    icon: '⚡',
    bg: (theme) => theme.border,
    fg: (theme) => theme.textSecondary,
    border: (theme) => theme.border,
  },
  promo: {
    icon: '🎉',
    bg: (theme) => theme.correct + '25',
    fg: (theme) => theme.correct,
    border: (theme) => theme.correct + '70',
  },
};

export default function PremiumBadge({
  variant = 'premium',
  label,
  className = '',
  subtle = false,
  as = 'span',
}) {
  const { theme } = useTheme();
  const Component = as;
  const variantStyles = VARIANT_MAP[variant] || VARIANT_MAP.premium;
  const text = label ?? (variant === 'free' ? 'Free Tier' : variant === 'active' ? 'Premium Active' : 'Premium');

  const baseClasses = 'inline-flex items-center gap-1 font-semibold uppercase tracking-wide rounded-full';
  const sizeClasses = subtle ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';
  const combinedClasses = `${baseClasses} ${sizeClasses} ${className}`.trim();

  return (
    <Component
      className={combinedClasses}
      style={{
        backgroundColor: variantStyles.bg(theme),
        color: variantStyles.fg(theme),
        border: `1px solid ${variantStyles.border(theme)}`,
        boxShadow: subtle ? 'none' : `0 4px 12px ${variantStyles.bg(theme)}`,
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        if (!subtle) {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = `0 6px 20px ${variantStyles.bg(theme)}`;
        }
      }}
      onMouseLeave={(e) => {
        if (!subtle) {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = `0 4px 12px ${variantStyles.bg(theme)}`;
        }
      }}
    >
      <span aria-hidden="true" style={{ display: 'inline-block', animation: variant === 'promo' ? 'float 2s ease-in-out infinite' : 'none' }}>
        {variantStyles.icon}
      </span>
      <span>{text}</span>
    </Component>
  );
}
