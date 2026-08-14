import {AlertCircle} from 'lucide-react';

import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';

export function ErrorState({
  actions,
  message,
  title,
}: {
  actions?: React.ReactNode;
  message: string;
  title: string;
}) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        {message}
        {actions}
      </AlertDescription>
    </Alert>
  );
}
