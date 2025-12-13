import {BackLink} from '@/components/BackLink';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Skeleton} from '@/components/ui/skeleton';

export default function PackageDetailsSkeleton() {
  return (
    <main className="container mx-auto p-4 md:p-8">
      <PackageDetailsComponentSkeleton />
    </main>
  );
}

function DetailRowSkeleton({label}: {label: string}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 py-3 border-b last:border-b-0">
      <dt className="font-semibold text-muted-foreground">{label}</dt>
      <dd className="md:col-span-3">
        <Skeleton className="h-4 w-1/2" />
      </dd>
    </div>
  );
}

function PackageDetailsComponentSkeleton() {
  return (
    <>
      <div className="mb-4">
        <BackLink />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl break-all">
            <Skeleton className="h-6 w-1/4" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-1/3" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl>
            <DetailRowSkeleton label="Description" />
            <DetailRowSkeleton label="Homepage" />
            <DetailRowSkeleton label="Source Files" />
            <DetailRowSkeleton label="Split Packages" />
            <DetailRowSkeleton label="Base Package" />
            <DetailRowSkeleton label="License(s)" />
            <DetailRowSkeleton label="Build Date" />
            <DetailRowSkeleton label="Packager" />
            <DetailRowSkeleton label="Package Size" />
            <DetailRowSkeleton label="Installed Size" />
            <DetailRowSkeleton label="Download Mirror" />
            <DetailRowSkeleton label="SHA256 Sum" />
            <DetailRowSkeleton label="Dependencies" />
            <DetailRowSkeleton label="Optional Deps" />
            <DetailRowSkeleton label="Provides" />
            <DetailRowSkeleton label="Conflicts With" />
            <DetailRowSkeleton label="Replaces" />
            <DetailRowSkeleton label="Package Files" />
          </dl>
        </CardContent>
      </Card>
    </>
  );
}
