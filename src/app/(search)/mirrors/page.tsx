import {Package} from 'lucide-react';
import {Metadata} from 'next';
import Image from 'next/image';
import Link from 'next/link';

import icon from '@/app/icon.svg';
import {ThemeToggle} from '@/components/theme-toggle';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

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
            <ThemeToggle />
          </div>
        </CardHeader>
        <CardContent>Mirrors</CardContent>
        <CardFooter>
          <Link
            className="inline-flex items-center text-base text-primary hover:underline"
            href="/"
          >
            <Package className="w-4 h-4 mr-2" />
            Packages
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
