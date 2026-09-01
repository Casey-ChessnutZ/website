import type { NavigationConfig, NavigationItem } from '@/app/lib/contentful/types';

export type { NavigationConfig, NavigationItem };

export type PrimaryNavigationItem = Required<Pick<NavigationItem, 'href' | 'label' | 'style'>>;
export type NavigationLink = Required<Pick<NavigationItem, 'href' | 'label'>>;
export type NavigationGroup = { label: string; href?: string; items: NavigationLink[] };

const fallbackNavigation: PrimaryNavigationItem[] = [
  { href: '/events', label: 'Tournaments', style: 'text' },
  { href: '/news', label: 'News', style: 'text' },
  { href: '/team', label: 'Our Team', style: 'text' },
  { href: '/#about', label: 'About', style: 'text' },
  { href: '/events', label: 'Find an event', style: 'primary' },
];

const fallbackFooterNavigation: NavigationGroup[] = [
  { label: 'Explore', items: [{ href: '/events', label: 'Tournaments' }, { href: '/news', label: 'News' }, { href: '/#about', label: 'About' }] },
  { label: 'Information', items: [{ href: '/contact', label: 'Contact' }, { href: '/events', label: 'Event calendar' }] },
];

export function getPrimaryNavigation(items?: NavigationItem[]): PrimaryNavigationItem[] {
  if (!items?.length) return fallbackNavigation;

  return items
    .filter((item) => Boolean(item.enabled && item.label?.trim() && item.href?.startsWith('/')))
    .map((item) => ({ href: item.href as string, label: item.label!.trim(), style: item.style === 'primary' ? 'primary' : 'text' }));
}

function getConfiguredNavigationGroups(config?: NavigationConfig): NavigationGroup[] {
  const groups = config?.groups?.flatMap((group) => {
    if (!group.enabled || !group.label?.trim()) return [];

    const items = (group.items ?? []).flatMap((item) => (
      item.enabled && item.label?.trim() && item.href?.startsWith('/')
        ? [{ label: item.label.trim(), href: item.href }]
        : []
    ));

    return items.length || group.href?.startsWith('/')
      ? [{ label: group.label.trim(), ...(group.href?.startsWith('/') ? { href: group.href } : {}), items }]
      : [];
  });

  return groups ?? [];
}

export function getNavigationGroups(config?: NavigationConfig): NavigationGroup[] {
  const groups = getConfiguredNavigationGroups(config);

  return groups.length
    ? groups
    : getPrimaryNavigation(config?.items).map(({ label, href }) => ({ label, href, items: [] }));
}

export function getFooterNavigationGroups(config?: NavigationConfig): NavigationGroup[] {
  const groups = getConfiguredNavigationGroups(config);

  return groups.length ? groups : fallbackFooterNavigation;
}
