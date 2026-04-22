import {createFileRoute, notFound} from '@tanstack/react-router';

import PackageDetailsComponent from '@/components/PackageDetails';
import SplitPackageDetails from '@/components/SplitPackageDetails';
import {FetcherError} from '@/lib/errors';
import {
  getPackageDetails,
  getSourceUrl,
  getSplitPackages,
} from '@/lib/server/actions';
import {
  type BriefPackage,
  type PackageArch,
  type PackageDetails,
  PackageDetailsPathParamsSchema,
  SplitPackagesQueryParamsSchema,
} from '@/lib/types';

type LoaderData = {
  package: null | PackageDetails;
  sourceUrl: null | string;
  splitBase?: string;
  splits: BriefPackage[];
};

async function loadSplitFallback(
  pkgname: string,
  repo: string
): Promise<BriefPackage[]> {
  const validation = SplitPackagesQueryParamsSchema.safeParse({
    pkgbase: pkgname,
    repo,
  });
  if (!validation.success) throw notFound();
  try {
    const response = await getSplitPackages({data: validation.data});
    if (response.length === 0) throw notFound();
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'NotFoundError') throw error;
    console.error(`Failed to fetch split packages for ${pkgname}:`, error);
    throw notFound();
  }
}

async function loadSplitsForBase(
  pkg: PackageDetails,
  repo: string
): Promise<BriefPackage[]> {
  if (pkg.pkg_name !== pkg.pkg_base) return [];
  const validation = SplitPackagesQueryParamsSchema.safeParse({
    pkgbase: pkg.pkg_base,
    repo,
  });
  if (!validation.success) return [];
  try {
    const response = await getSplitPackages({data: validation.data});
    return response.filter(p => p.pkg_name !== pkg.pkg_base);
  } catch (error) {
    console.error('Failed to fetch split packages:', error);
    return [];
  }
}

async function resolvePackage({
  arch,
  pkgname,
  repo,
}: {
  arch: PackageArch;
  pkgname: string;
  repo: string;
}): Promise<LoaderData> {
  try {
    const {package: pkg} = await getPackageDetails({
      data: {arch, pkgname, repo},
    });
    const [splits, sourceUrl] = await Promise.all([
      loadSplitsForBase(pkg, repo),
      getSourceUrl({
        data: {
          pkg_base: pkg.pkg_base,
          pkg_name: pkg.pkg_name,
          pkg_version: pkg.pkg_version,
          repo_name: pkg.repo_name,
        },
      }),
    ]);
    return {package: pkg, sourceUrl, splits};
  } catch (error) {
    if (error instanceof FetcherError && error.status === 404) {
      const splits = await loadSplitFallback(pkgname, repo);
      return {package: null, sourceUrl: null, splitBase: pkgname, splits};
    }
    console.error(`Failed to fetch package details for ${pkgname}:`, error);
    throw notFound();
  }
}

export const Route = createFileRoute('/package/$repo/$arch/$pkgname')({
  component: PackageDetailsPage,
  head: ({loaderData, params}) => {
    const arch = decodeURIComponent(params.arch);
    const pkgname = decodeURIComponent(params.pkgname);
    const repo = decodeURIComponent(params.repo);
    const title = `${pkgname} - ${repo} (${arch})`;
    const pkg = (loaderData as LoaderData | undefined)?.package;
    if (!pkg) return {meta: [{title: `CachyOS | ${title}`}]};
    const description = pkg.pkg_desc || `Details for ${pkgname}`;
    return {
      meta: [
        {title: `CachyOS | ${title}`},
        {content: description, name: 'description'},
        {
          content: [
            pkg.pkg_name,
            pkg.pkg_base,
            repo,
            arch,
            ...pkg.pkg_groups,
            ...pkg.pkg_license,
          ]
            .filter(Boolean)
            .join(', '),
          name: 'keywords',
        },
        {content: title, property: 'og:title'},
        {content: description, property: 'og:description'},
        {content: 'website', property: 'og:type'},
      ],
    };
  },
  loader: async ({params}) => {
    const validation = PackageDetailsPathParamsSchema.safeParse(params);
    if (!validation.success) throw notFound();
    const arch = decodeURIComponent(validation.data.arch) as PackageArch;
    const pkgname = decodeURIComponent(validation.data.pkgname);
    const repo = decodeURIComponent(validation.data.repo);
    return resolvePackage({arch, pkgname, repo});
  },
});

function PackageDetailsPage() {
  const data = Route.useLoaderData() as LoaderData;
  const params = Route.useParams();

  if (!data.package) {
    return (
      <main className="container mx-auto p-4 md:p-8">
        <SplitPackageDetails
          arch={decodeURIComponent(params.arch) as PackageArch}
          packages={data.splits}
          pkgname={data.splitBase ?? decodeURIComponent(params.pkgname)}
        />
      </main>
    );
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <PackageDetailsComponent
        pkg={data.package}
        pkgSplits={data.splits}
        sourceUrl={data.sourceUrl}
      />
    </main>
  );
}
