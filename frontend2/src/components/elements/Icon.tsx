import React from "react";
import {
  ClipboardDocumentIcon as ClipboardDocumentIcon24,
  HomeIcon as HomeIcon24,
  MapIcon as MapIcon24,
  TrophyIcon as TrophyIcon24,
  ChartBarIcon as ChartBarIcon24,
  ClockIcon as ClockIcon24,
  UserGroupIcon as UserGroupIcon24,
  ArrowUpTrayIcon as ArrowUpTrayIcon24,
  PlayCircleIcon as PlayCircleIcon24,
  ChevronDownIcon as ChevronDownIcon24,
  CheckIcon as CheckIcon24,
} from "@heroicons/react/24/outline";

import {
  ClipboardDocumentIcon as ClipboardDocumentIcon20,
  HomeIcon as HomeIcon20,
  MapIcon as MapIcon20,
  TrophyIcon as TrophyIcon20,
  ChartBarIcon as ChartBarIcon20,
  ClockIcon as ClockIcon20,
  UserGroupIcon as UserGroupIcon20,
  ArrowUpTrayIcon as ArrowUpTrayIcon20,
  PlayCircleIcon as PlayCircleIcon20,
  ChevronDownIcon as ChevronDownIcon20,
  CheckIcon as CheckIcon20,
} from "@heroicons/react/20/solid";

const icons24 = {
  clipboard_document: ClipboardDocumentIcon24,
  home: HomeIcon24,
  map: MapIcon24,
  trophy: TrophyIcon24,
  chart_bar: ChartBarIcon24,
  clock: ClockIcon24,
  user_group: UserGroupIcon24,
  arrow_up_tray: ArrowUpTrayIcon24,
  play_circle: PlayCircleIcon24,
  chevron_down: ChevronDownIcon24,
  check: CheckIcon24,
};

const icons20 = {
  clipboard_document: ClipboardDocumentIcon20,
  home: HomeIcon20,
  map: MapIcon20,
  trophy: TrophyIcon20,
  chart_bar: ChartBarIcon20,
  clock: ClockIcon20,
  user_group: UserGroupIcon20,
  arrow_up_tray: ArrowUpTrayIcon20,
  play_circle: PlayCircleIcon20,
  chevron_down: ChevronDownIcon20,
  check: CheckIcon20,
};

export type IconName = keyof typeof icons24 | keyof typeof icons20;

export interface IconProps {
  name: IconName;
  size?: "sm" | "md";
}

const sizeToClass = {
  sm: "h-5 w-5",
  md: "h-6 w-6",
};

const Icon: React.FC<IconProps> = ({ name, size = "md" }: IconProps) => {
  const IconComponent = size === "md" ? icons24[name] : icons20[name];
  return <IconComponent className={sizeToClass[size]} />;
};

export default Icon;
