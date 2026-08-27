import assert from 'node:assert/strict';
import test from 'node:test';

import { mapPhotoAlbumItem } from '../app/lib/contentful/photo-album.ts';

test('maps a photo album and resolves its gallery assets from Contentful includes', () => {
  const album = mapPhotoAlbumItem(
    {
      sys: { id: 'album-1' },
      fields: {
        title: 'Melbourne Open',
        slug: 'melbourne-open-2026',
        date: '2026-11-14T00:00:00.000Z',
        description: 'A weekend at the board.',
        images: [{ sys: { id: 'image-1', type: 'Link', linkType: 'Asset' } }],
      },
    },
    { Asset: [{ sys: { id: 'image-1' }, fields: { title: 'Players in the hall', file: { url: '//images.ctfassets.net/album-1.webp' } } }] },
  );

  assert.deepEqual(album, {
    sys: { id: 'album-1' },
    title: 'Melbourne Open',
    slug: 'melbourne-open-2026',
    date: '2026-11-14T00:00:00.000Z',
    description: 'A weekend at the board.',
    images: [{ sys: { id: 'image-1' }, url: 'https://images.ctfassets.net/album-1.webp', title: 'Players in the hall', fields: { title: 'Players in the hall', file: { url: '//images.ctfassets.net/album-1.webp' } } }],
  });
});
