import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

type Variant = 'primary' | 'ghost' | 'quiet';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const STYLES: Record<Variant, string> = {
  primary: 'bg-beam text-void shadow-[0_0_28px_-8px_#5FE3D6] hover:brightness-110',
  ghost: 'border border-edge bg-panel/70 text-chalk hover:bg-panel',
  quiet: 'text-dust hover:text-chalk min-h-[44px] px-4',
};

/** 공용 버튼. 터치 목표 크기(최소 44~52px)를 항상 만족하도록 패딩을 크게 잡습니다. */
const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'primary', className = '', children, ...rest },
  ref,
) {
  const base =
    'inline-flex items-center justify-center gap-2 min-h-[52px] px-6 rounded-2xl font-display text-lg tracking-wide transition-transform duration-150 active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100';

  return (
    <button ref={ref} className={`${base} ${STYLES[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
});

export default Button;
