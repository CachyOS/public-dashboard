'use client';

import {ArrowLeft} from 'lucide-react';
import {useRouter} from 'next/navigation';

import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {BriefPackageList, PackageArch} from '@/lib/types';

import PackageTable from './PackageTable';

interface SplitPackageDetailsProps {
  arch: PackageArch;
  packages: BriefPackageList;
  pkgname: string;
}

export default function SplitPackageDetails({
  arch,
  packages,
  pkgname,
}: SplitPackageDetailsProps) {
  const {back} = useRouter();
  return (
    <>
      <div className="mb-4">
        <button
          className="inline-flex items-center text-sm text-primary hover:underline"
          onClick={() => back()}
          type="button"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Search
        </button>
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
