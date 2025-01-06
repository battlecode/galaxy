import type React from "react";
import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { Link, useNavigate } from "react-router-dom";
import { AuthStateEnum, useCurrentUser } from "../contexts/CurrentUserContext";
import Icon from "./elements/Icon";
import { useEpisodeId } from "../contexts/EpisodeContext";
import EpisodeSwitcher from "./EpisodeSwitcher";
import { logout } from "../api/auth/authApi";
import { useQueryClient } from "@tanstack/react-query";
interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { authState, user } = useCurrentUser();
  const { episodeId } = useEpisodeId();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 z-30 h-16 w-full bg-gray-700">
      <div className="w-full px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* sidebar button */}
          <button className="z-20 mr-4 p-2" onClick={toggleSidebar}>
            <Icon
              name="bars_3"
              className="text-gray-300 hover:text-white"
              size="lg"
            />
          </button>
          {/* battlecode logo, episode select */}
          <div className="flex flex-1 items-center justify-center space-x-4 sm:items-stretch sm:justify-start">
            <div
              className="flex flex-shrink-0 items-center hover:cursor-pointer"
              onClick={() => {
                navigate(`/${episodeId}/home`);
              }}
            >
              <img
                className="hidden h-8 cursor-pointer sm:block"
                src="/battlecode-logo-horiz-white.png"
                alt="Battlecode Logo"
              />
              <img
                className="h-10 cursor-pointer sm:hidden"
                src="/battlecode-logo-vert-white.png"
                alt="Battlecode Logo"
              />
            </div>
            <EpisodeSwitcher />
          </div>
          {/* profile menu (if the user is logged in) */}
          {authState === AuthStateEnum.AUTHENTICATED && (
            <Menu>
              <div className="absolute inset-y-0 right-0 flex items-center pr-0 md:pr-2">
                <Menu.Button className="rounded-full focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                  <span className="sr-only">Open user menu</span>
                  <img
                    className="h-10 w-10 rounded-full bg-white"
                    src={
                      user.data?.profile?.avatar_url ??
                      "/default_profile_picture.png"
                    }
                    alt="Profile Picture"
                  />
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Menu.Items className="absolute right-1 top-12 z-10 mt-2 w-40 rounded-md bg-white py-1 text-gray-800 shadow-lg">
                  <Menu.Item>
                    <Link
                      className="flex w-full items-center rounded-lg px-4 py-2  sm:text-sm "
                      to="/account"
                    >
                      Your profile
                    </Link>
                  </Menu.Item>
                  <Menu.Item>
                    <button
                      onClick={() => {
                        void logout(queryClient);
                        navigate(`/${episodeId}/home`);
                      }}
                      className="flex w-full items-center rounded-lg px-4 py-2 sm:text-sm"
                    >
                      Sign out
                    </button>
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          )}
          {/* sign up / login button */}
          {authState === AuthStateEnum.NOT_AUTHENTICATED && (
            <div className="absolute inset-y-0 right-1 flex flex-row items-center justify-center gap-3">
              <Link
                to="/login"
                className="hidden rounded-full px-3 py-1.5 text-gray-200 ring-0 hover:bg-gray-100/10 sm:block"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="hidden rounded-full px-3 py-1.5 text-center text-white ring-2 ring-inset ring-gray-200 hover:bg-gray-100/10 sm:block"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
