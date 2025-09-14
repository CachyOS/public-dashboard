import {NextRequest, NextResponse} from 'next/server';

import {getPackageFiles} from '@/lib/actions';
import {PackageArch, PackageDetailsPathParamsSchema} from '@/lib/types';

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<'/api/package/[repo]/[arch]/[pkgname]/files'>
) {
  const validation = PackageDetailsPathParamsSchema.safeParse(await ctx.params);
  if (!validation.success) {
    return NextResponse.json({error: 'Invalid parameters'}, {status: 400});
  }
  let {arch, pkgname, repo} = validation.data;
  arch = decodeURIComponent(arch) as PackageArch;
  pkgname = decodeURIComponent(pkgname);
  repo = decodeURIComponent(repo);

  const files = await getPackageFiles({arch, pkgname, repo});

  if (!files) {
    return NextResponse.json({error: 'Files not found'}, {status: 404});
  }

  return NextResponse.json(files);
}
