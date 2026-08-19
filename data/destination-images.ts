import { popularDestinations } from "./destinations";

// Keep the destination cards focused on landmarks, skylines, coastlines, and
// other scenery. These overrides replace legacy assets that were portraits,
// workout/product photos, mismatched cities, or no longer resolved.
const curatedImagePaths: Partial<Record<string, string>> = {
  chengdu: "photo-1593007187880-0d2dee3c90e8",
  guangzhou: "photo-1636259584602-5a3c9c0d05ff",
  shenzhen: "photo-1631111758461-f824ecdc58d1",
  chongqing: "photo-1617805801790-c31b0d2eea32",
  guilin: "photo-1597890883648-68ff65e8ffed",
  lijiang: "photo-1637872937209-e1a5ccdc90cc",
  dali: "photo-1678620071844-8377e26f1944",
  sanya: "photo-1507525428034-b723cf961d3e",
  lhasa: "photo-1703842079863-20413f288d03",
  suzhou: "photo-1601732804101-e4b6ac8ed204",
  xiamen: "photo-1709229919646-3699ead369b5",
  qingdao: "photo-1739436598532-f22747099b6f",
  huangshan: "photo-1718697912731-e6b550d212dd",
  kunming: "photo-1678288661010-762afc729414",
  seoul: "photo-1702738684583-8bdb8ca121bf",
  "chiang-mai": "photo-1775527567703-206aa7e31b13",
};

function buildUnsplashUrl(imagePath: string, width: number, quality: number) {
  return `https://images.unsplash.com/${imagePath}?w=${width}&q=${quality}`;
}

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
      (() => {
        const curatedImagePath = curatedImagePaths[destination.slug];

        return {
          heroUrl: curatedImagePath
            ? buildUnsplashUrl(curatedImagePath, 800, 80)
            : destination.imageUrl,
          thumbnailUrl: curatedImagePath
            ? buildUnsplashUrl(curatedImagePath, 400, 60)
            : destination.thumbnailUrl,
          alt: `${destination.name}城市风景`,
          credit: "Unsplash" as const,
        };
      })(),
    ])
  );

export function getDestinationImage(
  slug: string
): DestinationImageAsset | undefined {
  return destinationImageManifest[slug];
}
