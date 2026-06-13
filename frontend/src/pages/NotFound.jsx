import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <>
      <section className="relative pt-32 pb-20 bg-gray-900">
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <p className="text-primary font-semibold text-8xl md:text-9xl font-bold mb-4">404</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Page Not Found</h1>
          <p className="text-gray-400 max-w-md mx-auto mb-8">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/"
              className="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
            >
              Go Home
            </Link>
            <Link
              to="/tools"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
            >
              Explore Tools
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Here are some helpful links</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { to: '/', label: 'Home' },
              { to: '/about', label: 'About Us' },
              { to: '/team', label: 'Our Team' },
              { to: '/tools', label: 'Tools' },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="bg-gray-50 hover:bg-primary/5 hover:border-primary/20 border border-gray-100 rounded-xl p-4 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
