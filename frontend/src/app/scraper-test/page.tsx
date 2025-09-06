// Test page for scraper functionality
// This page contains various elements that the scraper can extract

export default function ScraperTestPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Scraper Test Page
          </h1>
          <p className="text-lg text-gray-600">
            This page is designed to test the integrated scraper functionality in HoloLight OS
          </p>
        </header>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Introduction */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Welcome to the Secure Content Area
            </h2>
            <p className="text-gray-700 leading-relaxed">
              This is a demonstration page for testing web scraping capabilities.
              The scraper should be able to extract this text content, identify links,
              and parse the structured data below.
            </p>
          </section>

          {/* Sample Data Table */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Sample Product Data
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-gray-600">Product</th>
                    <th className="px-4 py-2 text-left text-gray-600">Price</th>
                    <th className="px-4 py-2 text-left text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-4 py-2">Widget A</td>
                    <td className="border px-4 py-2">$29.99</td>
                    <td className="border px-4 py-2">Available</td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2">Widget B</td>
                    <td className="border px-4 py-2">$49.99</td>
                    <td className="border px-4 py-2">Out of Stock</td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2">Widget C</td>
                    <td className="border px-4 py-2">$19.99</td>
                    <td className="border px-4 py-2">Available</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Links Section */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Navigation Links
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Internal Links</h3>
                <ul className="space-y-2">
                  <li><a href="/dashboard" className="text-blue-600 hover:underline">Dashboard</a></li>
                  <li><a href="/profile" className="text-blue-600 hover:underline">User Profile</a></li>
                  <li><a href="/settings" className="text-blue-600 hover:underline">Settings</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">External Links</h3>
                <ul className="space-y-2">
                  <li><a href="https://github.com" className="text-blue-600 hover:underline">GitHub</a></li>
                  <li><a href="https://vercel.com" className="text-blue-600 hover:underline">Vercel</a></li>
                  <li><a href="https://nextjs.org" className="text-blue-600 hover:underline">Next.js</a></li>
                </ul>
              </div>
            </div>
          </section>

          {/* Metadata Section */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Page Metadata
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Technical Info</h3>
                <dl className="space-y-1">
                  <dt className="font-medium text-gray-600">Framework:</dt>
                  <dd className="text-gray-800">Next.js 14</dd>

                  <dt className="font-medium text-gray-600">Language:</dt>
                  <dd className="text-gray-800">TypeScript</dd>

                  <dt className="font-medium text-gray-600">Styling:</dt>
                  <dd className="text-gray-800">Tailwind CSS</dd>
                </dl>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Content Info</h3>
                <dl className="space-y-1">
                  <dt className="font-medium text-gray-600">Last Updated:</dt>
                  <dd className="text-gray-800">{new Date().toLocaleDateString()}</dd>

                  <dt className="font-medium text-gray-600">Version:</dt>
                  <dd className="text-gray-800">1.0.0</dd>

                  <dt className="font-medium text-gray-600">Purpose:</dt>
                  <dd className="text-gray-800">Scraper Testing</dd>
                </dl>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="text-center text-gray-500 mt-12">
            <p>This is the end of the test page content.</p>
            <p className="mt-2">Scrapers should be able to extract all the content above.</p>
          </footer>
        </div>
      </div>
    </div>
  )
}


