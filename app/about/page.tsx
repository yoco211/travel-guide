export default function AboutPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl md:text-4xl font-display font-bold text-surface-900 mb-6">
        关于 TravelGuide
      </h1>
      <div className="prose max-w-none">
        <p>
          TravelGuide 是一个 AI 旅游攻略工具，帮助你快速整理目的地、交通、美食、住宿和行程建议。
        </p>
        <p>
          旅行信息会随时间变化，使用攻略时请以当地官方信息和实际情况为准。
        </p>
      </div>
    </article>
  );
}
