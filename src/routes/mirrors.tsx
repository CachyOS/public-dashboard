import {createFileRoute} from '@tanstack/react-router';

import MirrorslistTable from '@/components/MirrorslistTable';
import {SiteCardHeader} from '@/components/SiteCardHeader';
import {Card, CardContent} from '@/components/ui/card';
import {getMirrorsData} from '@/lib/server/actions';

export const Route = createFileRoute('/mirrors')({
  component: MirrorsPage,
  head: () => ({meta: [{title: 'CachyOS | Mirrors List'}]}),
  loader: () => getMirrorsData(),
});

function MirrorsPage() {
  const {baselines, mirrors} = Route.useLoaderData();
  return (
    <main className="container mx-auto p-2 sm:p-4 md:p-8">
      <Card>
        <SiteCardHeader
          description="List of CachyOS package repository mirrors."
          navTarget="packages"
          title="CachyOS Package Repository Mirrors"
        />
        <CardContent>
          <MirrorslistTable baselines={baselines} mirrors={mirrors} />
        </CardContent>
      </Card>
    </main>
  );
}
