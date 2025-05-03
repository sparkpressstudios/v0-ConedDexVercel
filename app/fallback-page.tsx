export default function FallbackPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-3xl font-bold">Welcome to ConeDex</h1>
      <p className="text-gray-500 mt-2">The ultimate ice cream explorer</p>
      <div className="mt-8">
        <a href="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Go to Dashboard
        </a>
      </div>
    </div>
  )
}
