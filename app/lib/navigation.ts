export type NavigationItem = {
  href?: string;
  label?: string;
  style?: 'primary' | 'text';
  enabled?: boolean;
};

export type PrimaryNavigationItem = Required<Pick<NavigationItem, 'href' | 'label' | 'style'>>;

const fallbackNavigation: PrimaryNavigationItem[] = [
  { href: '/events', label: 'Tournaments', style: 'text' },
  { href: '/news', label: 'News', style: 'text' },
  { href: '/#about', label: 'About', style: 'text' },
  { href: '/events', label: 'Find an event', style: 'primary' },
];

export function getPrimaryNavigation(items?: NavigationItem[]): PrimaryNavigationItem[] {
  if (!items?.length) return fallbackNavigation;

  return items
    .filter((item) => Boolean(item.enabled && item.label?.trim() && item.href?.startsWith('/')))
    .map((item) => ({ href: item.href as string, label: item.label!.trim(), style: item.style === 'primary' ? 'primary' : 'text' }));
}
