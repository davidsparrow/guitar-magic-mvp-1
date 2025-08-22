// components/Header.js - Reusable Header Component with Conditional Icons
import { useRouter } from 'next/router'
import { IoMdPower } from "react-icons/io"
import { RiLogoutCircleRLine } from "react-icons/ri"
import { FaHamburger } from "react-icons/fa"
import { LuBrain } from "react-icons/lu"

export default function Header({ 
  showBrainIcon = false,
  showSearchIcon = false,
  onAuthClick,
  onMenuClick,
  isAuthenticated = false
}) {
  const router = useRouter()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-3 md:py-4 bg-black/80 md:bg-transparent">
      <div className="flex justify-between items-center">
        {/* Logo - Upper Left - WIDE LOGO */}
        <a 
          href="/?home=true" 
          className="hover:opacity-80 transition-opacity"
        >
          <img 
            src="/images/gt_logo_wide_on_black_450x90.png" 
            alt="GuitarTube Logo" 
            className="h-8 md:h-10 w-auto" // Mobile: h-8, Desktop: h-10
          />
        </a>
        
        {/* Right side buttons */}
        <div className="flex items-center space-x-1 md:space-x-2"> {/* Mobile: space-x-1, Desktop: space-x-2 */}
          {/* Brain Icon Button - Conditional */}
          {showBrainIcon && (
            <button
              onClick={() => router.push('/features')}
              className="p-2 rounded-lg transition-colors duration-300 relative group text-white hover:bg-white/10"
              title="GuitarTube Features"
            >
              <LuBrain className="w-5 h-5 group-hover:text-yellow-400 transition-colors" />
            </button>
          )}
          
          {/* Search Icon Button - Conditional */}
          {showSearchIcon && (
            <button
              onClick={() => router.push('/search')}
              className="p-2 rounded-lg transition-colors duration-300 relative group text-white hover:bg-white/10"
              title="Search Videos"
            >
              <svg className="w-5 h-5 group-hover:text-yellow-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          )}
          
          {/* Login/Logout Icon */}
          <button 
            onClick={onAuthClick}
            className="p-[7px] rounded-lg transition-colors duration-300 relative group text-white hover:bg-white/10"
            title={isAuthenticated ? "End of the Party" : "Start Me Up"}
          >
            {isAuthenticated ? (
              <RiLogoutCircleRLine className="w-[21.5px] h-[21.5px] group-hover:text-yellow-400 transition-colors" />
            ) : (
              <IoMdPower className="w-[21.5px] h-[21.5px] group-hover:text-green-400 transition-colors" />
            )}
          </button>
          
          {/* Menu Icon */}
          <button 
            onClick={onMenuClick}
            className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors group relative"
            title="Yummy!"
          >
            <FaHamburger className="w-5 h-5 group-hover:text-yellow-400 transition-colors" />
          </button>
        </div>
      </div>
    </header>
  )
}
