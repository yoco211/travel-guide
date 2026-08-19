export default function PrivacyPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl md:text-4xl font-display font-bold text-surface-900 mb-6">
        隐私政策
      </h1>
      <div className="prose max-w-none">
        <p>
          AI 规划器会将你主动提交的出发地、目的地、日期和偏好发送到 AI 服务，用于生成旅游建议。
        </p>
        <p>
          请不要提交身份证号、银行卡号、密码或其他敏感个人信息。攻略生成结果不会替代旅行机构、交通部门或当地官方的专业建议。
        </p>
      </div>
    </article>
  );
}
