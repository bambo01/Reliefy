import React from 'react'

const LandingNavBar = () => {
  return (
    <header className="sticky top-0 bg-white shadow z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <img src="/logo.png" alt="" />

        {/* Links */}
        <nav className="space-x-6 hidden md:flex">
          <a href="#how" className="hover:text-blue-600">Home</a>
          <a href="#proof" className="hover:text-blue-600">Features</a>
          <a href="#faq" className="hover:text-blue-600">About Us</a>
          <a href="#faq" className="hover:text-blue-600">Contact Us</a>
        </nav>

        {/* Buttons */}
        <div className="space-x-2">
          <a
            href="/admin/login"
            className="px-4 py-2 bg-[#3563E9] text-white rounded-lg hover:bg-blue-700"
          >
            Admin Portal
          </a>
        </div>
      </div>
    </header>
  )
}

export default LandingNavBar
