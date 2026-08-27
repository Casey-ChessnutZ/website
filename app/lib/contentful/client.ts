const CONTENTFUL_DELIVERY_URL = 'https://cdn.contentful.com';
const CONTENTFUL_PREVIEW_URL = 'https://preview.contentful.com';

type ContentfulClientConfig = {
  spaceId: string;
  accessToken: string;
  environment: string;
  preview: boolean;
};

export type ContentfulFetchOptions = { preview?: boolean };

export function getContentfulConfig(preview = false): ContentfulClientConfig | null {
  if (process.env.CONTENTFUL_OFFLINE === 'true') {
    return null;
  }

  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const accessToken = preview
    ? process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN
    : process.env.CONTENTFUL_ACCESS_TOKEN;
  const environment = process.env.CONTENTFUL_ENVIRONMENT ?? 'master';

  if (!spaceId || !accessToken) {
    return null;
  }

  return {
    spaceId,
    accessToken,
    environment,
    preview,
  };
}

export async function contentfulFetch<T>(
  path: string,
  params: Record<string, string | undefined> = {},
  tags: string[] = [],
  options: ContentfulFetchOptions = {},
): Promise<T | null> {
  const config = getContentfulConfig(options.preview);

  if (!config) {
    return null;
  }

  const url = new URL(
    `${config.preview ? CONTENTFUL_PREVIEW_URL : CONTENTFUL_DELIVERY_URL}/spaces/${config.spaceId}/environments/${config.environment}/${path}`,
  );

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  try {
    const disableDataCache = config.preview || process.env.NODE_ENV === 'development';
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
      },
      cache: disableDataCache ? 'no-store' : undefined,
      next: disableDataCache ? undefined : { revalidate: 3600, tags },
    });

    if (!response.ok) {
      console.error('[contentful] request failed', { path, preview: config.preview, status: response.status, statusText: response.statusText });
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error('[contentful] request failed', { path, preview: config.preview, errorName: error instanceof Error ? error.name : 'UnknownError' });
    return null;
  }
}
