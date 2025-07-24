import {Metadata} from 'next';
import {Suspense} from 'react';

import PackageSearch from '@/components/PackageSearch';
import PackageSearchSkeleton from '@/components/PackageSearchSkeleton';
import {ThemeToggle} from '@/components/theme-toggle';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Package Search | CachyOS',
};

export default function Home() {
  return (
    <div className="font-[family-name:var(--font-geist-sans)]">
      <main className="container mx-auto p-4 md:p-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>CachyOS Package Repository Search</CardTitle>
                <CardDescription>
                  Find packages across all CachyOS repositories.
                </CardDescription>
              </div>
              <ThemeToggle />
            </div>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<PackageSearchSkeleton />}>
              <PackageSearch />
            </Suspense>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
