import { cn } from './cn';

export default function Card({ as: Component = 'div', className = '', ...props }) {
  return <Component className={cn('panel', className)} {...props} />;
}
