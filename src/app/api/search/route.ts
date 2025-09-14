import {NextRequest, NextResponse} from 'next/server';

import {searchPackages} from '@/lib/actions';
import {PackagesSearchQueryParamsSchema, PAGE_SIZE} from '@/lib/types';

export async function GET(req: NextRequest) {
  const params = parseUrlSearchParams(req.nextUrl.searchParams);

  const packages = await searchPackages(params);

  if (!packages) {
    return NextResponse.json({error: 'Packages not found'}, {status: 404});
  }

  return NextResponse.json(packages);
}

function parseUrlSearchParams(searchParams: URLSearchParams) {
  return PackagesSearchQueryParamsSchema.parse({
    arch: searchParams.get('arch') ?? '',
    current_page: Number(searchParams.get('current_page')) || 1,
    page_size: Number(searchParams.get('page_size')) || PAGE_SIZE[0],
    repo: searchParams.getAll('repo').join(','),
    search: searchParams.getAll('search').join(','),
  });
}
