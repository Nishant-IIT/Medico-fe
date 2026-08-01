// config
import { ASSETS_API } from 'src/config-global';

// ----------------------------------------------------------------------

/**
 * profiles has no photo column (no upload feature) -- this deterministically
 * picks one of the Minimals demo avatar images from the same asset CDN
 * medico-fe already points NEXT_PUBLIC_ASSETS_API at, so the same user
 * always gets the same placeholder avatar.
 */
export function mockAvatarUrl(seed: string) {
  const hash = [...seed].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = (hash % 24) + 1;
  return `${ASSETS_API}/assets/images/avatar/avatar_${index}.jpg`;
}
