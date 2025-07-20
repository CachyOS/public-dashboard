import {Metadata} from 'next';
import {notFound} from 'next/navigation';

import PackageDetailsComponent from '@/components/PackageDetails';
import {getPackageDetails} from '@/lib/actions';
import {PackageArch, PackageRepo} from '@/lib/types';

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

  return (
    <main className="container mx-auto p-4 md:p-8">
      <PackageDetailsComponent pkg={packageResponse.package} />
    </main>
  );
}
