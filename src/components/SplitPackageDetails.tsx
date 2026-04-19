import {BackLink} from '@/components/BackLink';
import PackageTable from '@/components/PackageTable';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import type {BriefPackageList, PackageArch} from '@/lib/types';

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
  return (
    <>
      <div className="mb-4">
        <BackLink />
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
