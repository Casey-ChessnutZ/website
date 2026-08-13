import type { LandingPageBlock } from '@/app/lib/contentful/types';
import HeroBlock from './hero-block';
import FeaturedEventsBlock from './featured-events-block';
import EditorialTextBlock from './editorial-text-block';
import ImageGalleryBlock from './image-gallery-block';
import TimelineBlock from './timeline-block';
import CtaBlock from './cta-block';
import CountdownBlock from './countdown-block';
import ImageBlock from './image-block';
import CardBlock from './card-block';

export default function RenderBlock({ block }: { block: LandingPageBlock }) {
  switch (block.type) {
    case 'hero':
      return <HeroBlock block={block} />;
    case 'featuredEvents':
      return <FeaturedEventsBlock block={block} />;
    case 'editorialText':
      return <EditorialTextBlock block={block} />;
    case 'imageGallery':
      return <ImageGalleryBlock block={block} />;
    case 'timeline':
      return <TimelineBlock block={block} />;
    case 'cta':
      return <CtaBlock block={block} />;
    case 'countdown':
      return <CountdownBlock block={block} />;
    case 'imageBlock':
      return <ImageBlock block={block} />;
    case 'cardBlock':
      return <CardBlock block={block} />;
    default:
      return (
        <section className="content-section unsupported-block">
          <p>This content section is not available yet.</p>
        </section>
      );
  }
}
