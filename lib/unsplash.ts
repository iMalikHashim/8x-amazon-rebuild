/**
 * Builds a direct images.unsplash.com URL from a verified photo ID.
 * Every ID that reaches this function has already been curl-checked to
 * return HTTP 200 with an image/* content-type (see scripts referenced
 * in the Step 1 commit) - this function does no validation of its own.
 */
export function unsplashUrl(photoId: string, width: number, quality = 80): string {
  return `https://images.unsplash.com/photo-${photoId}?w=${width}&q=${quality}&auto=format&fit=crop`;
}
