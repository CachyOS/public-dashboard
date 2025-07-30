import {Metadata} from 'next';
import {notFound} from 'next/navigation';

import PackageDetailsComponent from '@/components/PackageDetails';
import SplitPackageDetails from '@/components/SplitPackageDetails';
import {getPackageDetails, getSplitPackages} from '@/lib/actions';
import {FetcherError} from '@/lib/errors';
import {
  BriefPackage,
  PackageArch,
  PackageDetails,
  PackageRepo,
} from '@/lib/types';

// Define the page's props, which include the dynamic route params
type PackageDetailsPageProps = {
  arch: PackageArch;
  pkgname: string;
  repo: PackageRepo;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<PackageDetailsPageProps>;
}): Promise<Metadata> {
  const {arch, pkgname, repo} = await params;

  return {
    title: `${pkgname} - ${repo} (${arch})`,
  };
}

export default async function PackageDetailsPage({
  params,
}: {
  params: Promise<PackageDetailsPageProps>;
}) {
  let {arch, pkgname, repo} = await params;
  arch = decodeURIComponent(arch) as PackageArch;
  pkgname = decodeURIComponent(pkgname);
  repo = decodeURIComponent(repo) as PackageRepo;

  const packageResponse = await getPackageDetailsOrSplits({
    arch,
    pkgname,
    repo,
  });

  if (packageResponse.splits) {
    return (
      <main className="container mx-auto p-4 md:p-8">
        <SplitPackageDetails
          arch={arch}
          packages={packageResponse.splits}
          pkgname={pkgname}
        />
      </main>
    );
  }

  const pkg = packageResponse.package;
  const pkgSplits = await getSplitPackagesForBase(pkg, repo);

  return (
    <main className="container mx-auto p-4 md:p-8">
      <PackageDetailsComponent pkg={pkg} pkgSplits={pkgSplits} />
    </main>
  );
}

async function getPackageDetailsOrSplits({
  arch,
  pkgname,
  repo,
}: {
  arch: PackageArch;
  pkgname: string;
  repo: PackageRepo;
}) {
  try {
    const packageResponse = await getPackageDetails({arch, pkgname, repo});
    return {package: packageResponse.package};
  } catch (error) {
    if (error instanceof FetcherError && error.status === 404) {
      const splits = await handleSplitPackageFallback(pkgname, repo);
      return {splits};
    }
    console.error(`Failed to fetch package details for ${pkgname}:`, error);
    notFound();
  }
}

async function getSplitPackagesForBase(
  pkg: PackageDetails,
  repo: PackageRepo
): Promise<BriefPackage[]> {
  if (pkg.pkg_name !== pkg.pkg_base) {
    return [];
  }

  try {
    const splitPackagesResponse = await getSplitPackages({
      pkgbase: pkg.pkg_base,
      repo: repo,
    });

    return splitPackagesResponse.filter(p => p.pkg_name !== pkg.pkg_base);
  } catch (error) {
    console.error(`Failed to fetch split packages:`, error);
    return [];
  }
}

async function handleSplitPackageFallback(
  pkgname: string,
  repo: PackageRepo
): Promise<BriefPackage[]> {
  try {
    const splitsResponse = await getSplitPackages({
      pkgbase: pkgname,
      repo: repo,
    });

    if (splitsResponse.length === 0) {
      notFound();
    }

    return splitsResponse;
  } catch (error) {
    console.error(`Failed to fetch split packages for ${pkgname}:`, error);
    notFound();
  }
}
