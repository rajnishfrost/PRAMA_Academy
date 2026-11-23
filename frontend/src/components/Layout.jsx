import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import ScrollToTop from './ScrollToTop'
import { trackVisit } from '../lib/trackVisit'

export default function Layout() {
  const location = useLocation()

  // Record a page view on every public-site navigation.
  useEffect(() => {
    trackVisit(location.pathname + location.search)
  }, [location.pathname, location.search])

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
