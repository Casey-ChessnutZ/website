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
import QuoteSection from './quote-section';

export default function RenderBlock({ block }: { block: LandingPageBlock }) {
  switch (block.type) {
    case 'homeHero':
      return <HeroBlock block={block} />;
    case 'featuredEventsSection':
      return <FeaturedEventsBlock block={block} />;
    case 'richTextSection':
      return <EditorialTextBlock block={block} />;
    case 'imageGallerySection':
      return <ImageGalleryBlock block={block} />;
    case 'timelineSection':
      return <TimelineBlock block={block} />;
    case 'ctaBannerSection':
      return <CtaBlock block={block} />;
    case 'eventCountdownSection':
      return <CountdownBlock block={block} />;
    case 'imageTextSection':
      return <ImageBlock block={block} />;
    case 'featureCardsSection':
      return <CardBlock block={block} />;
    case 'quoteSection':
      return <QuoteSection block={block} />;
    default:
      return (
        <section className="mx-auto mt-28 max-w-304 px-5 text-muted">
          <p>This content section is not available yet.</p>
        </section>
      );
  }
}
