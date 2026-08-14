import {createFileRoute} from '@tanstack/react-router';

import MirrorslistTable from '@/components/MirrorslistTable';
import {PageMain} from '@/components/PageMain';
import {SiteCardHeader} from '@/components/SiteCardHeader';
import {Card, CardContent} from '@/components/ui/card';
import {getMirrorsData} from '@/lib/server/actions';

export const Route = createFileRoute('/mirrors')({
  component: MirrorsPage,
  loader: () => getMirrorsData(),
  head: () => ({meta: [{title: 'CachyOS | Mirrors List'}]}),
});

function MirrorsPage() {
  const {baselines, mirrors} = Route.useLoaderData();
  return (
    <PageMain>
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
    </PageMain>
  );
}
