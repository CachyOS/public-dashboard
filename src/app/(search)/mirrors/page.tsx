import {Package} from 'lucide-react';
import {Metadata} from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {connection} from 'next/server';
import {Suspense} from 'react';

import icon from '@/app/icon.svg';
import MirrorslistSkeleton from '@/components/MirrorslistSkeleton';
import MirrorslistTable from '@/components/MirrorslistTable';
import {ThemeToggle} from '@/components/theme-toggle';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {getMirrorsData} from '@/lib/mirrors';

export const metadata: Metadata = {
  title: 'Mirrors List',
};

export default async function Mirrors() {
  return (
    <main className="container mx-auto p-2 sm:p-4 md:p-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-start sm:items-center space-x-4">
              <Link className="shrink-0" href="/">
                <Image alt="CachyOS Logo" className="h-12 w-12" src={icon} />
              </Link>
              <div className="space-y-1 mt-0.5">
                <CardTitle>CachyOS Package Repository Mirrors</CardTitle>
                <CardDescription>
                  List of CachyOS package repository mirrors.
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center justify-between space-x-1 sm:space-x-4">
              <Link
                className="inline-flex items-center text-base text-primary hover:underline"
                href="/"
              >
                <Package className="w-5 h-5 sm:mr-2" />
                <span className="sr-only sm:not-sr-only">Packages</span>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<MirrorslistSkeleton />}>
            <MirrorslistPage />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}

async function MirrorslistPage() {
  await connection();
  const {baselines, mirrors} = await getMirrorsData();
  return <MirrorslistTable baselines={baselines} mirrors={mirrors} />;
}
