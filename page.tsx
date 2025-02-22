import { ResearchInterface } from "./components/ResearchInterface";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">AI Research Engine</h1>
        <ResearchInterface />
      </div>
    </main>
  );
}
