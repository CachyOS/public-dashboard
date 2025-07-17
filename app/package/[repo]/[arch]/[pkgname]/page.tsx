import { notFound } from 'next/navigation';
import { PackageArch, PackageRepo } from '@/lib/types';
import { getPackageDetails } from '@/lib/actions';
import PackageDetailsComponent from '@/components/PackageDetails';

// Define the page's props, which include the dynamic route params
type PackageDetailsPageProps = {
  repo: PackageRepo;
  arch: PackageArch;
  pkgname: string;
};

export default async function PackageDetailsPage({ params }: { params: Promise<PackageDetailsPageProps>}) {
  const { repo, arch, pkgname } = await params;

  let packageResponse;
  try {
    packageResponse = await getPackageDetails({
      repo: repo,
      arch: arch,
      pkgname: pkgname,
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
