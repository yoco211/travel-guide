import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SafeImage } from "@/components/ui/SafeImage";
import { attractions, getAttraction } from "@/data/attractions";
import { getDestination } from "@/data/destinations";
import { getDestinationImage } from "@/data/destination-images";

export function generateStaticParams() {
  return attractions.map((attraction) => ({ slug: attraction.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const attraction = getAttraction(slug);
  if (!attraction) return { title: "景点未找到" };

  return {
    title: `${attraction.name} | ${attraction.cityName}景点攻略`,
    description: attraction.description,
    openGraph: {
      title: `${attraction.name} — ${attraction.cityName}景点攻略`,
      description: attraction.shortDescription,
      images: [{ url: attraction.imageUrl, width: 800, height: 600 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${attraction.name} — ${attraction.cityName}景点攻略`,
      description: attraction.shortDescription,
      images: [attraction.imageUrl],
    },
  };
}

export default async function AttractionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const attraction = getAttraction(slug);
  if (!attraction) notFound();

  const city = getDestination(attraction.citySlug);
  const cityImage = city ? getDestinationImage(city.slug) : undefined;

  return (
    <main className="min-h-screen bg-surface-50">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-surface-500" aria-label="面包屑导航">
          <Link href="/" className="hover:text-primary-700">首页</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/destinations/${attraction.citySlug}`} className="hover:text-primary-700">{attraction.cityName}</Link>
          <span aria-hidden="true">/</span>
          <span className="text-surface-900">{attraction.name}</span>
        </nav>

        <section className="grid overflow-hidden rounded-3xl border border-surface-200 bg-white shadow-sm lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative min-h-[280px] bg-surface-100 lg:min-h-[460px]">
            <SafeImage slug={attraction.slug} alt={`${attraction.name}景色`} imageUrl={attraction.imageUrl} fallbackLabel={attraction.name} className="h-full w-full" />
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-10">
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">景点</span>
              <span className="rounded-full bg-surface-100 px-3 py-1 text-sm text-surface-600">{attraction.category}</span>
            </div>
            <h1 className="mb-3 font-display text-3xl font-bold text-surface-900 sm:text-4xl">{attraction.name}</h1>
            <p className="mb-5 text-lg text-primary-700">{attraction.cityName} · {attraction.country}</p>
            <p className="leading-7 text-surface-600">{attraction.shortDescription}</p>
            <Link href={`/destinations/${attraction.citySlug}`} className="mt-8 inline-flex w-fit items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 font-medium text-white transition-colors hover:bg-primary-700">
              查看{attraction.cityName}城市攻略 <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <article className="rounded-3xl border border-surface-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-4 font-display text-2xl font-bold text-surface-900">景点介绍</h2>
            <p className="whitespace-pre-line leading-8 text-surface-700">{attraction.description}</p>
            <div className="mt-8 flex flex-wrap gap-2">
              {attraction.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-primary-50 px-3 py-1 text-sm text-primary-700">#{tag}</span>
              ))}
            </div>
          </article>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-surface-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 font-semibold text-surface-900">游览信息</h2>
              <dl className="space-y-4 text-sm">
                <div><dt className="text-surface-500">建议游览时长</dt><dd className="mt-1 font-medium text-surface-900">{attraction.suggestedDuration}</dd></div>
                <div><dt className="text-surface-500">适合季节</dt><dd className="mt-1 font-medium text-surface-900">{attraction.bestSeason}</dd></div>
                <div><dt className="text-surface-500">所属城市</dt><dd className="mt-1 font-medium text-surface-900">{attraction.cityName}</dd></div>
              </dl>
            </div>

            {city && (
              <Link href={`/destinations/${city.slug}`} className="group block overflow-hidden rounded-3xl border border-surface-200 bg-white shadow-sm">
                <div className="relative h-36 bg-surface-100">
                  <SafeImage slug={city.slug} alt={`${city.name}城市风景`} imageUrl={cityImage?.thumbnailUrl ?? city.thumbnailUrl} fallbackLabel={city.name} className="h-full w-full transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-5"><p className="text-xs font-medium text-primary-600">城市攻略</p><p className="mt-1 font-semibold text-surface-900 group-hover:text-primary-700">继续探索 {city.name}</p></div>
              </Link>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
