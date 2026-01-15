import {Package} from 'lucide-react';
import {Metadata} from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {Suspense} from 'react';

import icon from '@/app/icon.svg';
import MirrorslistSkeleton from '@/components/MirrorslistSkeleton';
import MirrorslistTable from '@/components/MirrorslistTable';
import {ThemeToggle} from '@/components/theme-toggle';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {fetchMirrorlist} from '@/lib/github';
import {Mirror, RepoCheck, RepoStatus} from '@/lib/types';

export const metadata: Metadata = {
  title: 'Mirrors List',
};

export default function Mirrors() {
  return (
    <main className="container mx-auto p-2 sm:p-4 md:p-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-start sm:items-center space-x-4">
              <Link className="shrink-0" href="/">
                <Image alt="CachyOS Logo" className="h-12 w-12" src={icon} />
              </Link>
              <div className="space-y-1 mt-0.5">
                <CardTitle>CachyOS Package Repository Mirrors</CardTitle>
                <CardDescription>
                  List of CachyOS package repository mirrors.
                </CardDescription>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<MirrorslistSkeleton />}>
            <MirrorslistPage />
          </Suspense>
        </CardContent>
        <CardFooter>
          <Link
            className="inline-flex items-center text-base text-primary hover:underline"
            href="/"
          >
            <Package className="w-4 h-4 mr-2" />
            Packages
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}

const PRIMARY_MIRROR_URL = 'https://build.cachyos.org/repo';
const FETCH_TIMEOUT_MS = 6000;
const SYNC_TOLERANCE_SECONDS = 3600;

const REPO_PATHS = [
  'x86_64/cachyos',
  'x86_64_v3/cachyos-v3',
  'x86_64_v3/cachyos-core-v3',
  'x86_64_v3/cachyos-extra-v3',
  'x86_64_v4/cachyos-v4',
  'x86_64_v4/cachyos-core-v4',
  'x86_64_v4/cachyos-extra-v4',
  'x86_64_v4/cachyos-znver4',
  'x86_64_v4/cachyos-core-znver4',
  'x86_64_v4/cachyos-extra-znver4',
] as const;

async function fetchRepoTimestamp(
  baseUrl: string,
  repoPath: string,
  signal: AbortSignal
): Promise<null | number> {
  try {
    const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    const fullUrl = `${base}${repoPath}/lastupdate`;

    const res = await fetch(fullUrl, {next: {revalidate: 60}, signal});
    if (!res.ok) return null;

    const text = await res.text();
    const timestamp = Number.parseInt(text.trim(), 10);
    return Number.isNaN(timestamp) ? null : timestamp / 1000;
  } catch {
    return null;
  }
}

async function MirrorslistPage() {
  const mirrorsList = await fetchMirrorlist().catch(() => [] as string[]);

  const baselineController = new AbortController();
  const baselineTimeout = setTimeout(
    () => baselineController.abort(),
    FETCH_TIMEOUT_MS
  );

  const baselinePromises = REPO_PATHS.map(async path => ({
    path,
    timestamp: await fetchRepoTimestamp(
      PRIMARY_MIRROR_URL,
      path,
      baselineController.signal
    ),
  }));

  const baselines = await Promise.all(baselinePromises);
  clearTimeout(baselineTimeout);

  const baselineMap = new Map(baselines.map(b => [b.path, b.timestamp]));

  const mirrorChecks = mirrorsList.map(async mirrorUrl => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const checks = await Promise.all(
      REPO_PATHS.map(async path => {
        const timestamp = await fetchRepoTimestamp(
          mirrorUrl,
          path,
          controller.signal
        );
        const baseline = baselineMap.get(path);

        let status: RepoStatus = 'error';
        let lag: null | number = null;

        if (timestamp !== null) {
          if (baseline) {
            lag = baseline - timestamp;
            status = lag <= SYNC_TOLERANCE_SECONDS ? 'synced' : 'out-of-sync';
          } else {
            status = 'synced';
          }
        }

        return {
          lastUpdated: timestamp,
          path,
          status,
          syncLagSeconds: lag,
        } satisfies RepoCheck;
      })
    );

    clearTimeout(timeout);

    const validChecks = checks.filter(c => c.status !== 'error');
    const totalChecks = checks.length;
    const errorChecks = checks.length - validChecks.length;
    const syncedChecks = checks.filter(c => c.status === 'synced').length;

    let overallStatus: Mirror['overallStatus'] = 'error';

    if (validChecks.length === 0) {
      overallStatus = 'error';
    } else if (syncedChecks === totalChecks) {
      overallStatus = 'healthy';
    } else if (errorChecks > 0 || syncedChecks < totalChecks) {
      overallStatus = 'partial';
      if (syncedChecks === 0) overallStatus = 'out-of-sync';
    }

    const lags = validChecks.map(c => c.syncLagSeconds).filter(l => l !== null);

    const averageLag =
      lags.length > 0 ? lags.reduce((a, b) => a + b, 0) / lags.length : null;

    const url = new URL(mirrorUrl);

    return {
      averageLagSeconds: averageLag,
      checks,
      name: url.hostname,
      overallStatus,
      url: mirrorUrl,
    } satisfies Mirror;
  });

  const mirrors = await Promise.all(mirrorChecks);

  mirrors.sort((a, b) => {
    const score = (s: Mirror['overallStatus']) => {
      switch (s) {
        case 'error':
          return 3;
        case 'healthy':
          return 0;
        case 'out-of-sync':
          return 2;
        case 'partial':
          return 1;
      }
    };
    return score(a.overallStatus) - score(b.overallStatus);
  });

  return <MirrorslistTable baselines={baselines} mirrors={mirrors} />;
}
