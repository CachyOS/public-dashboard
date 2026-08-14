import {cn} from '@/lib/utils';

export function PageMain({
  children,
  className,
  ...props
}: React.ComponentProps<'main'>) {
  return (
    <main
      className={cn('container mx-auto p-2 sm:p-4 md:p-8', className)}
      {...props}
    >
      {children}
    </main>
  );
}
