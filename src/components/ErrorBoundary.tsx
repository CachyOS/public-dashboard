import {
  type ErrorComponentProps,
  Link,
  useRouter,
} from '@tanstack/react-router';
import {Loader2, SearchX} from 'lucide-react';

import {ErrorState} from '@/components/ErrorState';
import {PageMain} from '@/components/PageMain';
import {Button} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function RouteError({error, reset}: ErrorComponentProps) {
  const router = useRouter();

  const retry = () => {
    reset();
    router.invalidate();
  };

  return (
    <PageMain>
      <Card>
        <CardContent className="space-y-4">
          <ErrorState
            message={error.message || 'This page could not be loaded.'}
            title="Something went wrong"
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={retry} type="button">
              Try again
            </Button>
            <Button asChild variant="ghost">
              <Link to="/">Back to package search</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageMain>
  );
}

export function RouteNotFound() {
  return (
    <PageMain>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SearchX className="size-5 text-muted-foreground" />
            Page not found
          </CardTitle>
          <CardDescription>
            This address does not match any page. The package may have been
            dropped from the repositories, or the link may be mistyped.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to="/">Back to package search</Link>
          </Button>
        </CardContent>
      </Card>
    </PageMain>
  );
}

export function RoutePending() {
  return (
    <PageMain
      className="flex items-center justify-center gap-3 text-muted-foreground"
      role="status"
    >
      <Loader2 aria-hidden="true" className="size-5 animate-spin" />
      <span>Loading…</span>
    </PageMain>
  );
}
