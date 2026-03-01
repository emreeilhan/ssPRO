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
  className = '',
  ...props
}) {
  return (
    <Component
      type={Component === 'button' ? type : undefined}
      className={cn(variantClassName[variant] || variantClassName.ghost, sizeClassName[size] || '', className)}
      {...props}
    />
  );
}
