import { Link } from 'react-router-dom'
import { Github, Linkedin, Instagram } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-12 pt-8 border-t border-zinc-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-400">
      <p>© {new Date().getFullYear()} StreamWire Inc. All rights reserved.</p>
      <div className="flex items-center gap-6">
        <Link to="/about" className="hover:text-zinc-600 transition-colors">About</Link>
        <a href="#" className="hover:text-zinc-600 transition-colors">Privacy Policy</a>
        <a href="#" className="hover:text-zinc-600 transition-colors">Terms of Service</a>
        <Link to="/contact" className="hover:text-zinc-600 transition-colors">Contact Us</Link>

        <div className="flex items-center gap-3 ml-4">
          <a href="https://github.com/HiteshShonak" target="_blank" rel="noreferrer" className="hover:text-zinc-600">
            <Github className="w-4 h-4" />
          </a>
          <a href="https://www.linkedin.com/in/hiteshshonak/" target="_blank" rel="noreferrer" className="hover:text-zinc-600">
            <Linkedin className="w-4 h-4" />
          </a>
          <a href="https://www.instagram.com/ayeehitesh" target="_blank" rel="noreferrer" className="hover:text-zinc-600">
            <Instagram className="w-4 h-4" />
          </a>
        </div>
      </div>
    </footer>
  )
}