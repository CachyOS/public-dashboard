import {Metadata} from 'next';
import {notFound} from 'next/navigation';

import PackageDetailsComponent from '@/components/PackageDetails';
import SplitPackageDetails from '@/components/SplitPackageDetails';
import {
  getPackageDetails,
  getPackageFiles,
  getSplitPackages,
} from '@/lib/actions';
import {FetcherError} from '@/lib/errors';
import {
  BriefPackage,
  PackageArch,
  PackageDetails,
  PackageDetailsPathParamsSchema,
  SplitPackagesQueryParamsSchema,
} from '@/lib/types';

export async function generateMetadata({
  params,
}: PageProps<'/package/[repo]/[arch]/[pkgname]'>): Promise<Metadata> {
  const {arch, pkgname, repo} = await params;

  return {
    title: `${decodeURIComponent(pkgname)} - ${decodeURIComponent(repo)} (${decodeURIComponent(arch)})`,
  };
}

export default async function PackageDetailsPage({
  params,
}: PageProps<'/package/[repo]/[arch]/[pkgname]'>) {
  const validation = PackageDetailsPathParamsSchema.safeParse(await params);
  if (!validation.success) {
    notFound();
  }
  let {arch, pkgname, repo} = validation.data;
  arch = decodeURIComponent(arch) as PackageArch;
  pkgname = decodeURIComponent(pkgname);
  repo = decodeURIComponent(repo);

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
  repo: string;
}) {
  try {
    const [packageResponse, filesResponse] = await Promise.all([
      getPackageDetails({arch, pkgname, repo}),
      getPackageFiles({arch, pkgname, repo}),
    ]);
    packageResponse.package.pkg_files = filesResponse;
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
  repo: string
): Promise<BriefPackage[]> {
  if (pkg.pkg_name !== pkg.pkg_base) {
    return [];
  }

  try {
    const validation = SplitPackagesQueryParamsSchema.safeParse({
      pkgbase: pkg.pkg_base,
      repo: repo,
    });
    if (!validation.success) {
      console.error(validation.error);
      return [];
    }

    const splitPackagesResponse = await getSplitPackages(validation.data);
    return splitPackagesResponse.filter(p => p.pkg_name !== pkg.pkg_base);
  } catch (error) {
    console.error(`Failed to fetch split packages:`, error);
    return [];
  }
}

async function handleSplitPackageFallback(
  pkgname: string,
  repo: string
): Promise<BriefPackage[]> {
  try {
    const validation = SplitPackagesQueryParamsSchema.safeParse({
      pkgbase: pkgname,
      repo: repo,
    });
    if (!validation.success) {
      console.error(validation.error);
      notFound();
    }

    const splitsResponse = await getSplitPackages(validation.data);
    if (splitsResponse.length === 0) {
      notFound();
    }

    return splitsResponse;
  } catch (error) {
    console.error(`Failed to fetch split packages for ${pkgname}:`, error);
    notFound();
  }
}
