import { Console } from "console";
import React, { useState } from "react";


interface HeaderProps {
  loggedIn: boolean;
  logoPath: string;
}

const Header: React.FC<HeaderProps> = ({ loggedIn, logoPath }): JSX.Element => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false)
  const [activeLink, setActiveLink] = useState('Dashboard');

  const handleLinkClick = (linkName: string): void => {
    setActiveLink(linkName);
  };
  const toggleMobileMenu = (): void =>{
    setMobileMenu((prev: boolean): boolean => !prev)
  };
  const toggleUserMenu = (): void => {
    setIsUserMenuOpen((prev: boolean): boolean => !prev);
  };

  return (
    <nav className="bg-gray-800">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <button
              type="button"
              className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
              onClick={toggleMobileMenu}
            >
              <span className="absolute -inset-0.5"></span>
              <span className="sr-only">Open main menu</span>
              <svg
                className="block h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
              <svg
                className="hidden h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex flex-shrink-0 items-center">
              <img className="h-8 w-auto" src={require(`../${logoPath}`)} alt="Battlecode" />
            </div>
            <div className="hidden sm:ml-6 sm:block">
        {/* <div className="flex space-x-4">
          <a
            href="#"
            className={`${
              activeLink === 'Info' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            } rounded-md px-3 py-2 text-sm font-medium`}
            onClick={() => {handleLinkClick('info')}}
            aria-current={activeLink === 'Info' ? 'page' : undefined}
          >
            Info
          </a>
          <a
            href="#"
            className={`${
              activeLink === 'Team' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            } rounded-md px-3 py-2 text-sm font-medium`}
            onClick={() => {handleLinkClick('Team')}}
            aria-current={activeLink === 'Team' ? 'page' : undefined}
          >
            Team
          </a>
          <a
            href="#"
            className={`${
              activeLink === 'Dev Team' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            } rounded-md px-3 py-2 text-sm font-medium`}
            onClick={() => {handleLinkClick('Dev Team')}}
            aria-current={activeLink === 'Dev Team' ? 'page' : undefined}
          >
            Dev Team
          </a>
          <a
            href="#"
            className={`${
              activeLink === 'Sponsors' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            } rounded-md px-3 py-2 text-sm font-medium`}
            onClick={() => {handleLinkClick('Sponsors')}}
            aria-current={activeLink === 'Sponsors' ? 'page' : undefined}
          >
            Sponsors
          </a>
        </div> */}
      </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <button
              type="button"
              className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              <span className="absolute -inset-1.5"></span>
              <span className="sr-only">View notifications</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </button>

            <div className="relative ml-3">
              <div>
              <button
            type="button"
            onClick={toggleUserMenu}
            className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
            id="user-menu-button"
            aria-expanded={isUserMenuOpen}
            aria-haspopup="true"
          >
            <span className="absolute -inset-1.5"></span>
            <span className="sr-only">Open user menu</span>
            <img
              className="h-8 w-8 rounded-full"
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt="profile pic"
            />
          </button>
        </div>

        {isUserMenuOpen && (
          <div
            className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="user-menu-button"
            tabIndex={-1}
          >
            <a href="#" className="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabIndex={-1} id="user-menu-item-0">
              Your Profile
            </a>
            <a href="#" className="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabIndex={-1} id="user-menu-item-1">
              Settings
            </a>
            <a href="#" className="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabIndex={-1} id="user-menu-item-2">
              Sign out
            </a>
          </div>
        )}
            </div>
          </div>
        </div>
      </div>

      {mobileMenu && <div className="sm:hidden" id="mobile-menu">
    <div className="space-y-1 px-2 pb-3 pt-2">
      <a
        href="#"
        className={`${
          activeLink === "Home"
            ? "bg-gray-900 text-white"
            : "text-gray-300 hover:bg-gray-700 hover:text-white"
        } block rounded-md px-3 py-2 text-base font-medium`}
        onClick={() => {
          handleLinkClick("Home");
          toggleMobileMenu();
        }}
        aria-current={activeLink === "Home" ? "page" : undefined}
      >
        Home
      </a>
      <a
        href="#"
        className={`${
          activeLink === "Getting Started"
            ? "bg-gray-900 text-white"
            : "text-gray-300 hover:bg-gray-700 hover:text-white"
        } block rounded-md px-3 py-2 text-base font-medium`}
        onClick={() => {
          handleLinkClick("Getting Started");
          toggleMobileMenu();
        }}
        aria-current={activeLink === "Getting Started" ? "page" : undefined}
      >
        Getting Started
      </a>
      <a
        href="#"
        className={`${
          activeLink === "Resources"
            ? "bg-gray-900 text-white"
            : "text-gray-300 hover:bg-gray-700 hover:text-white"
        } block rounded-md px-3 py-2 text-base font-medium`}
        onClick={() => {
          handleLinkClick("Resources");
          toggleMobileMenu();
        }}
        aria-current={activeLink === "Resources" ? "page" : undefined}
      >
        Resources
      </a>
      <a
        href="#"
        className={`${
          activeLink === "Tournaments"
            ? "bg-gray-900 text-white"
            : "text-gray-300 hover:bg-gray-700 hover:text-white"
        } block rounded-md px-3 py-2 text-base font-medium`}
        onClick={() => {
          handleLinkClick("Tournaments");
          toggleMobileMenu();
        }}
        aria-current={activeLink === "Tournaments" ? "page" : undefined}
      >
        Tournaments
      </a>
      <a
        href="#"
        className={`${
          activeLink === "Rankings"
            ? "bg-gray-900 text-white"
            : "text-gray-300 hover:bg-gray-700 hover:text-white"
        } block rounded-md px-3 py-2 text-base font-medium`}
        onClick={() => {
          handleLinkClick("Rankings");
          toggleMobileMenu();
        }}
        aria-current={activeLink === "Rankings" ? "page" : undefined}
      >
        Rankings
      </a>
      <a
        href="#"
        className={`${
          activeLink === "Queue"
            ? "bg-gray-900 text-white"
            : "text-gray-300 hover:bg-gray-700 hover:text-white"
        } block rounded-md px-3 py-2 text-base font-medium`}
        onClick={() => {
          handleLinkClick("Queue");
          toggleMobileMenu();
        }}
        aria-current={activeLink === "Queue" ? "page" : undefined}
      >
        Queue
      </a>
      <a
        href="#"
        className={`${
          activeLink === "Team"
            ? "bg-gray-900 text-white"
            : "text-gray-300 hover:bg-gray-700 hover:text-white"
        } block rounded-md px-3 py-2 text-base font-medium`}
        onClick={() => {
          handleLinkClick("Team");
          toggleMobileMenu();
        }}
        aria-current={activeLink === "Team" ? "page" : undefined}
      >
        Team
      </a>
      <a
        href="#"
        className={`${
          activeLink === "Submissions"
            ? "bg-gray-900 text-white"
            : "text-gray-300 hover:bg-gray-700 hover:text-white"
        } block rounded-md px-3 py-2 text-base font-medium`}
        onClick={() => {
          handleLinkClick("Submissions");
          toggleMobileMenu();
        }}
        aria-current={activeLink === "Submissions" ? "page" : undefined}
      >
        Submissions
      </a>
      <a
        href="#"
        className={`${
          activeLink === "Scrimaging"
            ? "bg-gray-900 text-white"
            : "text-gray-300 hover:bg-gray-700 hover:text-white"
        } block rounded-md px-3 py-2 text-base font-medium`}
        onClick={() => {
          handleLinkClick("Scrimaging");
          toggleMobileMenu();
        }}
        aria-current={activeLink === "Scrimaging" ? "page" : undefined}
      >
        Scrimaging
      </a>
    </div>
  </div>}
    </nav>
  );
};

export default Header;
// const Header: React.FC<headerProps> = ({loggedIn, logoPath}): JSX.Element => {


//     return(
//     <nav className="flex items-center justify-between flex-wrap bg-teal-500 p-6">
//         <div className="flex items-center flex-shrink-0 text-white mr-6">
//           <img
//             className="h-14 w-14 mr-2"
//             src={require(`../${logoPath}`)}
//             alt="Logo"
//             style={{ width: 54, height: 54 }}
//           />
//           <span className="font-semibold text-xl tracking-tight">BattleCode</span>
//         </div>
//   <div className="block lg:hidden">
//   </div>
//   <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
//     <div className="text-sm lg:flex-grow">
//       <a href="#responsive-header" className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4">
//         Info
//       </a>
//       <a href="#responsive-header" className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4">
//         Sponsors
//       </a>
//       <a href="#responsive-header" className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white">
//         Dev Team
//       </a>
//     </div>
//     <div>
//       {loggedIn && <a href="#" className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white mt-4 lg:mt-0">Sign Out</a>}
//       {!loggedIn && <a href="#" className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white mt-4 lg:mt-0">Login</a>}
//     </div>
//   </div>
// </nav>
//     )
// }
