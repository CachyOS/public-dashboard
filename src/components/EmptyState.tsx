import {Button} from '@/components/ui/button';

export function EmptyState({
  action,
  description,
  onAction,
  title,
}: {
  action: string;
  description: string;
  onAction: () => void;
  title: string;
}) {
  return (
    <div className="rounded-md border border-dashed p-8 text-center">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-muted-foreground text-sm">{description}</p>
      <Button
        className="mt-4"
        onClick={onAction}
        size="sm"
        type="button"
        variant="outline"
      >
        {action}
      </Button>
    </div>
  );
}
