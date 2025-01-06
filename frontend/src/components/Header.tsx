import type React from "react";
import { Fragment, useMemo } from "react";
import { Menu, Transition } from "@headlessui/react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthStateEnum, useCurrentUser } from "../contexts/CurrentUserContext";
import Icon from "./elements/Icon";
import { useEpisodeId } from "../contexts/EpisodeContext";
import { ALL_SIDEBAR_ITEMS, renderableItems } from "./sidebar";
import EpisodeSwitcher from "./EpisodeSwitcher";
import { logout } from "../api/auth/authApi";
import { useQueryClient } from "@tanstack/react-query";
import { useUserTeam } from "api/team/useTeam";
import { useEpisodeInfo } from "api/episode/useEpisode";

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { authState, user } = useCurrentUser();
  const { episodeId } = useEpisodeId();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const teamData = useUserTeam({ episodeId });
  const episodeData = useEpisodeInfo({ id: episodeId });

  const renderedItems = useMemo(
    () => renderableItems(ALL_SIDEBAR_ITEMS, episodeData, authState, teamData),
    [episodeData, teamData, authState],
  );

  return (
    <nav className="fixed top-0 z-30 h-16 w-full bg-gray-700">
      <div className="w-full px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* mobile menu */}
          <button
          className="z-20"
          onClick={toggleSidebar}
          >
            <Icon name="bars_3" className="text-gray-300 hover:text-white" size="lg" />
          </button>
          {/* <Menu>
            <div className="absolute inset-y-0 left-3 flex items-center sm:hidden">
              <Menu.Button className="rounded-md px-1 py-1.5 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                <span className="sr-only">Open main menu</span>
                <Icon
                  name="bars_3"
                  className="text-gray-300 hover:text-white"
                  size="lg"
                />
              </Menu.Button>
            </div>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Menu.Items className="absolute left-1 top-12 z-10 mt-2 w-64 gap-2 rounded-md bg-white p-2 font-light shadow-lg sm:hidden">
                {renderedItems.map(({ iconName, text, linkTo }, index) => (
                  <Menu.Item key={index}>
                    <NavLink
                      className={({ isActive }) =>
                        "flex items-center gap-3 rounded-lg py-2 pl-1.5 pr-8 text-base " +
                        (isActive
                          ? "cursor-default text-cyan-600"
                          : "text-gray-800 ui-active:bg-gray-500 ui-active:text-gray-100")
                      }
                      to={`/${episodeId}/${linkTo}`}
                    >
                      <Icon name={iconName} size="md" />
                      {text}
                    </NavLink>
                  </Menu.Item>
                ))}

                {authState === AuthStateEnum.NOT_AUTHENTICATED && (
                  <>
                    <hr className="m-2" />
                    <Menu.Item as="div" className="w-full pb-2 pt-1">
                      <Link
                        to="/login"
                        className="rounded-full px-2.5 text-cyan-600 ring-0 hover:bg-gray-100/10"
                      >
                        Log in
                      </Link>
                    </Menu.Item>
                    <hr className="m-2" />
                    <Menu.Item as="div" className="w-full pb-2 pt-1">
                      <Link
                        to="/register"
                        className="rounded-full px-2.5 text-cyan-600 ring-0 hover:bg-gray-100/10"
                      >
                        Register
                      </Link>
                    </Menu.Item>
                  </>
                )}
              </Menu.Items>
            </Transition>
          </Menu> */}
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
