"use client"

import { motion } from "framer-motion"
import {
  Instagram, Twitter, Facebook, Linkedin,
  Youtube, Music, AtSign, Rss,
  MapPin, Mail, Phone,
} from "lucide-react"
import type { NavLink, SocialLink, FooterClosing } from "@/lib/content/types"

const PLATFORM_ICONS: Record<string, React.ElementType> = {
  instagram: Instagram,
  twitter:   Twitter,
  x:         Twitter,
  facebook:  Facebook,
  linkedin:  Linkedin,
  youtube:   Youtube,
  tiktok:    Music,
  threads:   AtSign,
  substack:  Rss,
}

interface FooterProps {
  navLinks?: NavLink[]
  socialLinks?: SocialLink[]
  footerData?: FooterClosing
}

export default function Footer({ navLinks = [], socialLinks = [], footerData }: FooterProps) {
  const brandHeading          = footerData?.brand_heading          || ""
  const brandDescription      = footerData?.brand_description      || ""
  const contactLocation       = footerData?.contact_location       || ""
  const contactEmail          = footerData?.contact_email          || ""
  const contactPhone          = footerData?.contact_phone          || ""
  const newsletterHeading     = footerData?.newsletter_heading     || ""
  const newsletterDescription = footerData?.newsletter_description || ""
  const newsletterButtonText  = footerData?.newsletter_button_text || ""
  const copyright             = footerData?.copyright_text         || ""
  const privacyLabel          = footerData?.privacy_policy_label   || ""
  const privacyUrl            = footerData?.privacy_policy_url     || ""
  const termsLabel            = footerData?.terms_label            || ""
  const termsUrl              = footerData?.terms_url              || ""

  const hasContactInfo    = contactLocation || contactEmail || contactPhone
  const hasNewsletterCopy = newsletterHeading || newsletterDescription
  const hasBottomLinks    = (privacyLabel && privacyUrl) || (termsLabel && termsUrl)

  return (
    <footer className="relative bg-white border-t border-gray-200">
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-grid-subtle opacity-20 pointer-events-none" />

      <div className="container mx-auto px-6 py-16 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            {brandHeading && (
              <h3 className="text-3xl md:text-4xl font-black tracking-wider text-gray-900 mb-4">
                {brandHeading}
              </h3>
            )}
            {brandDescription && (
              <p className="text-lg text-gray-600 leading-relaxed mb-6 max-w-md">
                {brandDescription}
              </p>
            )}

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex space-x-4">
                {socialLinks.map((link) => {
                  const Icon = PLATFORM_ICONS[link.platform] ?? AtSign
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Follow us on ${link.platform}`}
                      className="w-12 h-12 bg-gray-900 hover:bg-gray-700 text-white rounded-full flex items-center justify-center transition-colors duration-300"
                    >
                      <Icon size={20} />
                    </a>
                  )
                })}
              </div>
            )}
          </motion.div>

          {/* Quick Links */}
          {navLinks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className="text-xl font-bold text-gray-900 mb-6 tracking-wide">QUICK LINKS</h4>
              <ul className="space-y-3">
                {navLinks.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.href}
                      target={link.open_in_new_tab ? "_blank" : undefined}
                      rel={link.open_in_new_tab ? "noopener noreferrer" : undefined}
                      className="text-gray-600 hover:text-gray-900 transition-colors duration-300 font-medium"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Contact Info */}
          {hasContactInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h4 className="text-xl font-bold text-gray-900 mb-6 tracking-wide">GET IN TOUCH</h4>
              <div className="space-y-4">
                {contactLocation && (
                  <div className="flex items-center space-x-3">
                    <MapPin size={18} className="text-gray-600" />
                    <span className="text-gray-600 font-medium">{contactLocation}</span>
                  </div>
                )}
                {contactEmail && (
                  <div className="flex items-center space-x-3">
                    <Mail size={18} className="text-gray-600" />
                    <a
                      href={`mailto:${contactEmail}`}
                      className="text-gray-600 hover:text-gray-900 transition-colors duration-300 font-medium"
                    >
                      {contactEmail}
                    </a>
                  </div>
                )}
                {contactPhone && (
                  <div className="flex items-center space-x-3">
                    <Phone size={18} className="text-gray-600" />
                    <a
                      href={`tel:${contactPhone}`}
                      className="text-gray-600 hover:text-gray-900 transition-colors duration-300 font-medium"
                    >
                      {contactPhone}
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Newsletter Signup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="border-t border-gray-200 pt-12 mb-12"
        >
          <div className="max-w-2xl mx-auto text-center">
            {newsletterHeading && (
              <h4 className="text-2xl md:text-3xl font-black text-gray-900 mb-4 tracking-wide">
                {newsletterHeading}
              </h4>
            )}
            {newsletterDescription && (
              <p className="text-lg text-gray-600 mb-8">
                {newsletterDescription}
              </p>
            )}
            {hasNewsletterCopy && (
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-md focus:border-gray-900 focus:outline-none text-gray-900 font-medium"
                />
                <button className="px-8 py-3 bg-gray-900 hover:bg-gray-700 text-white font-bold rounded-md transition-colors duration-300 tracking-wide">
                  {newsletterButtonText || "SUBSCRIBE"}
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Bottom Bar */}
        {(copyright || hasBottomLinks) && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
          >
            {copyright && (
              <p className="text-gray-600 font-medium">{copyright}</p>
            )}
            {hasBottomLinks && (
              <div className="flex space-x-6">
                {privacyLabel && privacyUrl && (
                  <a
                    href={privacyUrl}
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-300 font-medium"
                  >
                    {privacyLabel}
                  </a>
                )}
                {termsLabel && termsUrl && (
                  <a
                    href={termsUrl}
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-300 font-medium"
                  >
                    {termsLabel}
                  </a>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </footer>
  )
}
