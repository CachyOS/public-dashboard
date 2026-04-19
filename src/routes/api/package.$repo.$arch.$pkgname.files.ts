import {createFileRoute} from '@tanstack/react-router';

import {getPackageFiles} from '@/lib/server/actions';
import {type PackageArch, PackageDetailsPathParamsSchema} from '@/lib/types';

export const Route = createFileRoute('/api/package/$repo/$arch/$pkgname/files')(
  {
    server: {
      handlers: {
        GET: async ({params}) => {
          const validation = PackageDetailsPathParamsSchema.safeParse(params);
          if (!validation.success) {
            return Response.json({error: 'Invalid parameters'}, {status: 400});
          }
          const arch = decodeURIComponent(validation.data.arch) as PackageArch;
          const pkgname = decodeURIComponent(validation.data.pkgname);
          const repo = decodeURIComponent(validation.data.repo);

          const files = await getPackageFiles({
            data: {arch, pkgname, repo},
          });
          if (!files) {
            return Response.json({error: 'Files not found'}, {status: 404});
          }
          return Response.json(files);
        },
      },
    },
  }
);
