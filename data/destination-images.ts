import { popularDestinations } from "./destinations";

export interface DestinationImageAsset {
  heroUrl: string;
  thumbnailUrl: string;
  alt: string;
  credit: "Unsplash";
}

export const destinationImageManifest: Record<string, DestinationImageAsset> =
  Object.fromEntries(
    popularDestinations.map((destination) => [
      destination.slug,
      {
        heroUrl: destination.imageUrl,
        thumbnailUrl: destination.thumbnailUrl,
        alt: `${destination.name}城市风景`,
        credit: "Unsplash" as const,
      },
    ])
  );

export function getDestinationImage(
  slug: string
): DestinationImageAsset | undefined {
  return destinationImageManifest[slug];
}
