import type { ContentfulAsset, ContentfulReference, PhotoAlbumEntry } from './types';

type ContentfulPhotoAlbumItem = {
  sys: { id: string };
  fields: {
    title?: string;
    slug?: string;
    date?: string;
    description?: string;
    images?: ContentfulReference[];
  };
};

type AssetIncludes = { Asset?: ContentfulAsset[] };

function normalizeAsset(asset?: ContentfulAsset): ContentfulAsset | undefined {
  if (!asset) return undefined;
  const fileUrl = asset.fields?.file?.url ?? asset.url;
  const title = asset.fields?.title ?? asset.title;
  const description = asset.fields?.description ?? asset.description;
  return {
    ...asset,
    ...(fileUrl ? { url: fileUrl.startsWith('//') ? `https:${fileUrl}` : fileUrl } : {}),
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
  };
}

export function mapPhotoAlbumItem(item: ContentfulPhotoAlbumItem, includes?: AssetIncludes): PhotoAlbumEntry {
  const assets = new Map((includes?.Asset ?? []).map((asset) => [asset.sys?.id, asset]));

  return {
    sys: item.sys,
    title: item.fields.title ?? 'Photo album',
    slug: item.fields.slug ?? '',
    date: item.fields.date,
    description: item.fields.description,
    images: (item.fields.images ?? []).flatMap((reference) => {
      const image = normalizeAsset(assets.get(reference.sys.id));
      return image ? [image] : [];
    }),
  };
}
