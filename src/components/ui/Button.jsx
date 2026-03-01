import { cn } from './cn';

const variantClassName = {
  ghost: 'btn btn-ghost',
  primary: 'btn btn-primary',
  danger: 'btn btn-ghost btn-danger',
};

const sizeClassName = {
  sm: 'h-7 px-2 py-0 text-[11px]',
  md: '',
  icon: 'h-8 w-8 p-0 text-xs',
};

export default function Button({
  as: Component = 'button',
  type = 'button',
  variant = 'ghost',
  size = 'md',
  disabled = false,
  loading = false,
  loadingLabel = null,
  className = '',
  children,
  ...props
}) {
  const isButtonElement = Component === 'button';

  return (
    <Component
      {...props}
      type={isButtonElement ? type : undefined}
      disabled={isButtonElement ? disabled || loading : disabled}
      aria-busy={loading ? 'true' : undefined}
      className={cn(variantClassName[variant] || variantClassName.ghost, sizeClassName[size] || '', className)}
    >
      {loading && <span className="btn-spinner" aria-hidden="true" />}
      <span>{loading ? loadingLabel || children : children}</span>
    </Component>
  );
}
