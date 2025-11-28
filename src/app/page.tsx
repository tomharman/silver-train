export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-yellow-300 to-yellow-500 font-sans">
      <main className="flex flex-col items-center gap-4">
        <h1 className="text-4xl font-bold text-black">
          Hello Tom
        </h1>
        <p className="text-lg text-gray-800">Coming soon</p>
        <button className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          Click Me
        </button>
      </main>
    </div>
  );
}
