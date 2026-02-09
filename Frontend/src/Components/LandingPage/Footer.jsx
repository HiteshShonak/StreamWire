import { motion } from 'framer-motion'
import { Instagram, Github, Linkedin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CustomLogo } from './CustomLogo'

export const Footer = ({ isStealth }) => {
  const footerLinks = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "Pricing", href: "#" },
        { label: "Security", href: "#" },
        { label: "Roadmap", href: "#" }
      ]
    },
        {
          title: "Company",
          links: [
            { label: "About", href: "/about" },
            { label: "Blog", href: "https://blogideasandstories.vercel.app/" },
            { label: "Careers", href: "#" },
            { label: "Press", href: "#" }
          ]
        },
    {
      title: "Resources",
      links: [
        { label: "Documentation", href: "#" },
        { label: "Help Center", href: "/support" },
        { label: "Community", href: "#" },
        { label: "Contact", href: "/contact" }
      ]
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy", href: "#" },
        { label: "Terms", href: "#" },
        { label: "Cookie Policy", href: "#" },
        { label: "Licenses", href: "#" }
      ]
    }
  ]

  const socialLinks = [
    { icon: Github, href: "https://github.com/HiteshShonak" },
    { icon: Linkedin, href: "https://www.linkedin.com/in/hiteshshonak/" },
    { icon: Instagram, href: "https://www.instagram.com/ayeehitesh" }
  ]

  return (
    <footer className={`relative z-10 border-t transition-colors duration-700 ${
      isStealth ? 'bg-zinc-950/50 border-zinc-800' : 'bg-white border-zinc-200'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Logo & Description */}
          <div className="col-span-2">
            <CustomLogo isStealth={isStealth} />
            <p className={`mt-4 text-sm leading-relaxed max-w-xs transition-colors duration-700 ${
              isStealth ? 'text-zinc-500' : 'text-zinc-600'
            }`}>
              The dual-mode streaming platform where creators shine and whistleblowers speak freely.
            </p>
            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
              {socialLinks.map((social, idx) => (
                <motion.a
                  key={idx}
                  href={social.href}
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    isStealth 
                      ? 'bg-zinc-900 text-zinc-400 hover:text-green-400 hover:bg-zinc-800 hover:shadow-lg hover:shadow-green-500/10' 
                      : 'bg-zinc-100 text-zinc-600 hover:text-indigo-600 hover:bg-indigo-50 hover:shadow-lg hover:shadow-indigo-500/10'
                  }`}
                >
                  <social.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((section, idx) => (
            <div key={idx}>
              <h3 className={`font-bold mb-4 text-sm transition-colors duration-700 ${
                isStealth ? 'text-white' : 'text-zinc-900'
              }`}>
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIdx) => {
                  const isInternalLink = link.href?.startsWith('/')
                  const LinkComponent = isInternalLink ? Link : 'a'
                  const linkProps = isInternalLink ? { to: link.href } : { href: link.href || '#' }
                  
                  return (
                    <li key={linkIdx}>
                      <LinkComponent
                        {...linkProps}
                        className={`text-sm transition-colors duration-300 ${
                          isStealth 
                            ? 'text-zinc-500 hover:text-green-400' 
                            : 'text-zinc-600 hover:text-indigo-600'
                        }`}
                      >
                        {link.label}
                      </LinkComponent>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className={`pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 transition-colors duration-700 ${
          isStealth ? 'border-zinc-800' : 'border-zinc-200'
        }`}>
          <p className={`text-sm transition-colors duration-700 ${
            isStealth ? 'text-zinc-600' : 'text-zinc-500'
          }`}>
            © {new Date().getFullYear()} StreamWire. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className={`text-xs transition-colors duration-300 ${
              isStealth ? 'text-zinc-600 hover:text-green-400' : 'text-zinc-500 hover:text-indigo-600'
            }`}>
              Status
            </a>
            <a href="#" className={`text-xs transition-colors duration-300 ${
              isStealth ? 'text-zinc-600 hover:text-green-400' : 'text-zinc-500 hover:text-indigo-600'
            }`}>
              Changelog
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
