import type React from "react";
import AsyncSelectMenu from "../elements/AsyncSelectMenu";
import { useSearchTeams } from "../../api/team/useTeam";
import type { TeamPublic } from "../../api/_autogen";

interface SearchMenuProps {
  onChange: (selection: { value: number; label: string } | null) => void;
  selected: { value: number; label: string } | null;
  label?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

const SearchTeamsMenu: React.FC<SearchMenuProps> = ({
  onChange,
  selected,
  label,
  required,
  placeholder,
  className,
}) => (
  <AsyncSelectMenu<number, TeamPublic>
    useQueryResult={useSearchTeams}
    resultToOptions={(result) =>
      result.map((team) => ({
        value: team.id,
        label: team.name,
      }))
    }
    onChange={onChange}
    selected={selected}
    label={label}
    required={required}
    placeholder={placeholder}
    className={className}
  />
);

export default SearchTeamsMenu;
