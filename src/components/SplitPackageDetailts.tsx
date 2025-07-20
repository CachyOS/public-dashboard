import {ArrowLeft} from 'lucide-react';
import Link from 'next/link';

import {BriefPackage} from '@/lib/types';

import PackageTable from './PackageTable';
import {Card, CardContent, CardHeader, CardTitle} from './ui/card';

interface SplitPackageDetailsProps {
  arch: string;
  packages: BriefPackage[];
  pkgname: string;
}

export default function SplitPackageDetails({
  arch,
  packages,
  pkgname,
}: SplitPackageDetailsProps) {
  return (
    <>
      <div className="mb-4">
        <Link
          className="inline-flex items-center text-sm text-primary hover:underline"
          href="/"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Search
        </Link>
      </div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>
                Split Package Details - {pkgname} ({arch})
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div className="space-y-4">
              <PackageTable packages={packages} />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
