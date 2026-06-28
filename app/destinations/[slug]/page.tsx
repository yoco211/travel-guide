import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DestinationHero } from "@/components/destination/DestinationHero";
import { DestinationGuideLoader } from "@/components/destination/DestinationGuideLoader";
import { popularDestinations, getDestination as getDest } from "@/data/destinations";

// Static params for ISR (page shell only — guide content loads client-side)
export function generateStaticParams() {
  return popularDestinations.map((dest) => ({ slug: dest.slug }));
}

// Dynamic metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const destination = getDest(slug);
  if (!destination) return { title: "目的地未找到" };

  return {
    title: `${destination.name} 旅游攻略`,
    description: `探索 ${destination.name}，${destination.country}。涵盖景点推荐、交通攻略、美食指南、住宿推荐。${destination.description}`,
    openGraph: {
      title: `${destination.name} 旅游攻略 — TravelGuide`,
      description: destination.description,
      images: [{ url: destination.imageUrl, width: 800, height: 600 }],
    },
  };
}

export default async function DestinationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const destination = getDest(slug);

  if (!destination) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <DestinationHero destination={destination} />
      <DestinationGuideLoader
        destinationName={destination.name}
        destinationCountry={destination.country}
        destinationImage={destination.imageUrl}
      />
    </div>
  );
}
