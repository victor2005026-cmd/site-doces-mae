const VARIANTS = {
  gold: 'bg-gold text-text-primary shadow-sm hover:bg-gold-dark hover:-translate-y-[3px] hover:shadow-md',
  'gold-outline':
    'block mt-[18px] bg-transparent border-2 border-gold text-text-primary px-6 py-3 hover:bg-gold hover:-translate-y-[2px]',
  outline: 'border-2 border-white text-white bg-transparent hover:bg-white/15 hover:-translate-y-[3px]',
  'outline-gold':
    'border-2 border-gold text-gold bg-transparent hover:bg-gold hover:text-text-primary hover:-translate-y-[3px]',
};

export default function Button({
  href = '#',
  variant = 'gold',
  size,
  pulse = false,
  className = '',
  children,
  ...rest
}) {
  const sizeClasses = size === 'lg' ? 'px-[42px] py-[18px] text-[1.05rem]' : 'px-[30px] py-[14px] text-[0.95rem]';

  return (
    <a
      href={href}
      className={`inline-block rounded-full text-center font-bold tracking-[0.3px] transition-all duration-250 ease-in-out ${sizeClasses} ${VARIANTS[variant]} ${
        pulse ? 'animate-waPulse' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </a>
  );
}
