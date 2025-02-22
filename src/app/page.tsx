import { ResearchInterface } from "@/components/ResearchInterface";
import { ResearchResultsTable } from "../components/ResearchResultsTable";

export default function Home() {
  return (
    <main className="min-h-screen relative">
      <div className="absolute top-0 z-[-2] h-screen w-screen bg-white bg-[radial-gradient(100%_50%_at_50%_0%,rgba(0,163,255,0.13)_0,rgba(0,163,255,0)_50%,rgba(0,163,255,0)_100%)]"></div>
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-normal mb-4 text-gray-900">AI Company Research Agent</h1>
          <p className="text-med text-gray-600 max-w-2xl mx-auto">
            Research any company with AI for insights and comprehensive analysis
          </p>
        </div>
        <ResearchInterface />
      </div>
      <div className="w-full px-4">
        <ResearchResultsTable />
      </div>

      <div className="h-32"></div>
      <footer className="relative w-full py-6 px-4 mt-1">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-600 text-sm">
            Open Source and built with ❤️ at{" "}
            <a
              href="https://convex.link/chatsynclinks"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity">
              Convex
            </a>
            . Powered by{" "}
            <a
              href="https://convex.link/chatsynclinks"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity">
              Convex
            </a>
            . The source code is available on{" "}
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline text-blue-600">
              GitHub
            </a>
            .
          </p>
        </div>
      </footer>
    </main>
  );
}
