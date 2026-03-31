export default function NotFound() {
  return (
    <div className="min-h-screen bg-dashboard-bg flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-text-primary mb-2">404</h1>
        <p className="text-text-secondary">页面未找到</p>
        <a href="/" className="mt-4 inline-block text-accent-blue hover:underline">
          返回首页
        </a>
      </div>
    </div>
  );
}
