const syncRegistry = [
  ['person', 'People'],
  ['event', 'Events'],
  ['news', 'News'],
  ['page', 'Pages'],
  ['contactForm', 'Contact Form'],
  ['photoAlbum', 'Photo Albums'],
  ['mediaEmbeded', 'Media Embeds'],
  ['homeHero', 'Home Hero'],
  ['richTextSection', 'Rich Text Sections'],
  ['imageTextSection', 'Image Text Sections'],
  ['featuredEventsSection', 'Featured Events Sections'],
  ['eventCountdownSection', 'Event Countdown Sections'],
  ['featureCard', 'Feature Cards'],
  ['featureCardsSection', 'Feature Card Sections'],
  ['imageGallerySection', 'Image Gallery Sections'],
  ['timelineItem', 'Timeline Items'],
  ['timelineSection', 'Timeline Sections'],
  ['quoteSection', 'Quote Sections'],
  ['ctaBannerSection', 'CTA Banner Sections'],
  ['landingPage', 'Landing Pages'],
  ['siteSettings', 'Site Settings'],
];

function getSyncRegistry() {
  return syncRegistry.map(([id, label]) => ({ id, label }));
}

module.exports = { getSyncRegistry };
