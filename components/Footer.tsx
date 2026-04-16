import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-blue-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Mobile: brand spans full row (centered), link columns sit side by side in pairs.
            lg+: 4-column layout fills the wide container without excess whitespace. */}
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {/* Brand — full-width row on mobile, single column on lg+ */}
          <div className="col-span-2 flex flex-col items-center text-center lg:col-span-1 lg:items-start lg:text-left">
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
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-blue-100 pt-6 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} AutoMatcher. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
