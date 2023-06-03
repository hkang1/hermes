import { NavRouteObject, NavSection } from '@/constants/routes';

export function isNavSection(item: object): item is NavSection {
  return 'label' in item && 'children' in item && 'type' in item && item.type === 'section';
}

export function isNavRouteObject(item: object): item is NavRouteObject {
  return 'label' in item && !('type' in item);
}
