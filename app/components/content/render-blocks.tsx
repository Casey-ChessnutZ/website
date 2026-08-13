import type { LandingPageBlock } from '@/app/lib/contentful/types';
import RenderBlock from './block-registry';

export default function RenderBlocks({ sections }: { sections: LandingPageBlock[] }) {
  if (!sections || !sections.length) return null;

  return (
    <div>
      {sections.map((s) => (
        <RenderBlock key={s.sys.id} block={s} />
      ))}
    </div>
  );
}
