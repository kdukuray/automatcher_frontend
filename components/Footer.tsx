import Link from "next/link";
import Image from "next/image";

/**
 * Site-wide footer — adapts to three breakpoints:
 *   - Mobile (< sm):   brand stacked on top, three equal link columns below.
 *                      Columns are narrow but consistent, so nothing feels
 *                      "orphaned" the way a 2x2 grid would leave a stray block.
 *   - sm – lg:         brand on top, three link columns side by side.
 *   - lg+:             4-column grid (brand + 3 link sections) for wide screens.
 */
export default function Footer() {
  return (
    <footer className="border-t border-blue-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="flex flex-col gap-10 lg:grid lg:grid-cols-4 lg:gap-8">
          {/* --- Brand block --- */}
          {/* Kept left-aligned on mobile (not centered) so it reads naturally
              alongside the link columns beneath it, and the copy line has a
              clear left edge instead of floating in the middle. */}
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-2">
              <Image
                src="/automatcher_logo.svg"
                alt="AutoMatcher logo"
                width={52}
                height={24}
                className="h-6 w-auto"
              />
              <span className="text-xl font-bold tracking-tight text-blue-600">AutoMatcher</span>
            </Link>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
              Connecting car buyers with the right dealers. Find the exact vehicle you&apos;re looking for.
            </p>
          </div>

          {/* --- Link columns ---
               On mobile these sit in an evenly-spaced 3-column grid so every
               section has matching width. On lg+ they become peers of the
               brand column in the parent grid. */}
          <div className="grid grid-cols-3 gap-6 sm:gap-8 lg:col-span-3">
            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Quick Links</h3>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link href="/" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/requests/create" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                    Find a Car
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                    Help
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Support</h3>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link href="/contact#contact-form" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/resources" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                    Resources
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Legal</h3>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link href="/privacy" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* --- Copyright strip ---
             Left-aligned on mobile (matches the brand above), centered on
             sm+ where the footer is wider and a centered line reads best. */}
        <div className="mt-10 border-t border-blue-100 pt-6 text-left sm:text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} AutoMatcher. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
