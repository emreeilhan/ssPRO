import { cn } from './cn';

const baseClassName = 'hairline rounded-lg bg-white px-2 py-1.5 text-sm text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200';

export function Input({ className = '', ...props }) {
  return <input className={cn(baseClassName, className)} {...props} />;
}

export function Select({ className = '', ...props }) {
  return <select className={cn(baseClassName, className)} {...props} />;
}

export function Textarea({ className = '', ...props }) {
  return <textarea className={cn(baseClassName, className)} {...props} />;
}
