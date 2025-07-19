import {notFound} from 'next/navigation';

import PackageDetailsComponent from '@/components/PackageDetails';
import {getPackageDetails, getSplitPackages} from '@/lib/actions';
import {BriefPackage, PackageArch, PackageRepo} from '@/lib/types';

// Define the page's props, which include the dynamic route params
type PackageDetailsPageProps = {
  arch: PackageArch;
  pkgname: string;
  repo: PackageRepo;
};

export default async function PackageDetailsPage({
  params,
}: {
  params: Promise<PackageDetailsPageProps>;
}) {
  const {arch, pkgname, repo} = await params;

  let packageResponse;
  try {
    packageResponse = await getPackageDetails({
      arch: arch,
      pkgname: pkgname,
      repo: repo,
    });
  } catch (error) {
    // render Next.js's default 404 page.
    console.error(`Failed to fetch package details for ${pkgname}:`, error);
    notFound();
  }
  const pkg = packageResponse.package;

  let splitPackagesResponse: BriefPackage[] = [];
  if (pkg.pkg_name === pkg.pkg_base) {
    try {
      splitPackagesResponse = await getSplitPackages({
        pkgbase: pkg.pkg_base,
        repo: repo,
      });
    } catch (error) {
      console.error(`Failed to fetch split packages:`, error);
    }
  }

  const pkgSplits = splitPackagesResponse.filter(
    p => p.pkg_name !== pkg.pkg_base
  );

  return (
    <main className="container mx-auto p-4 md:p-8">
      <PackageDetailsComponent pkg={pkg} pkgSplits={pkgSplits} />
    </main>
  );
}
