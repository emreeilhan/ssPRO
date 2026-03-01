import { cn } from './cn';

export const inputBaseClassName = 'hairline rounded-lg bg-white px-2 py-1.5 text-sm text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200';

export function Input({ className = '', ...props }) {
  return <input className={cn(inputBaseClassName, className)} {...props} />;
}

export function Select({ className = '', ...props }) {
  return <select className={cn(inputBaseClassName, className)} {...props} />;
}

export function Textarea({ className = '', ...props }) {
  return <textarea className={cn(inputBaseClassName, className)} {...props} />;
}
