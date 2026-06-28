import Link from "next/link";

const FOOTER_LINKS = {
  explore: {
    title: "探索",
    links: [
      { href: "/", label: "首页" },
      { href: "/ai-planner", label: "AI 规划" },
    ],
  },
  popular: {
    title: "热门目的地",
    links: [
      { href: "/destinations/tokyo", label: "东京" },
      { href: "/destinations/paris", label: "巴黎" },
      { href: "/destinations/new-york", label: "纽约" },
      { href: "/destinations/bangkok", label: "曼谷" },
    ],
  },
  about: {
    title: "关于",
    links: [
      { href: "#", label: "关于我们" },
      { href: "#", label: "隐私政策" },
      { href: "#", label: "使用条款" },
    ],
  },
};

export function Footer() {
  return (
    <footer className="bg-surface-900 text-surface-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 font-display text-xl font-bold text-white mb-3"
            >
              <span>✈️</span>
              <span>TravelGuide</span>
            </Link>
            <p className="text-surface-400 text-sm leading-relaxed">
              AI 智能旅游攻略平台
              <br />
              让你的每一次旅行都完美无憾
            </p>
          </div>

          {/* Link Columns */}
          {Object.values(FOOTER_LINKS).map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-surface-400 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-surface-700 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-surface-500 text-sm">
            © {new Date().getFullYear()} TravelGuide. All rights reserved.
          </p>
          <p className="text-surface-500 text-sm">
            Powered by DeepSeek AI · Built with Next.js
          </p>
        </div>
      </div>
    </footer>
  );
}
