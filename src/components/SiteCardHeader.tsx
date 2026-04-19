import {Link} from '@tanstack/react-router';
import {Package, ServerIcon} from 'lucide-react';
import icon from '@/assets/icon.svg';
import {ThemeToggle} from '@/components/theme-toggle';
import {CardDescription, CardHeader, CardTitle} from '@/components/ui/card';

type NavTarget = 'mirrors' | 'packages';

export function SiteCardHeader({
  description,
  navTarget,
  title,
}: {
  description: string;
  navTarget: NavTarget;
  title: string;
}) {
  return (
    <CardHeader>
      <div className="flex justify-between items-start">
        <div className="flex items-start sm:items-center space-x-4">
          <Link className="shrink-0" to="/">
            <img alt="CachyOS Logo" className="h-12 w-12" src={icon} />
          </Link>
          <div className="space-y-1 mt-0.5">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>

        <div className="flex items-center justify-between space-x-1 sm:space-x-4">
          {navTarget === 'mirrors' ? (
            <Link
              className="inline-flex items-center text-base text-primary hover:underline"
              to="/mirrors"
            >
              <ServerIcon className="w-5 h-5 sm:mr-2" />
              <span className="sr-only sm:not-sr-only">Mirrors</span>
            </Link>
          ) : (
            <Link
              className="inline-flex items-center text-base text-primary hover:underline"
              to="/"
            >
              <Package className="w-5 h-5 sm:mr-2" />
              <span className="sr-only sm:not-sr-only">Packages</span>
            </Link>
          )}
          <ThemeToggle />
        </div>
      </div>
    </CardHeader>
  );
}
