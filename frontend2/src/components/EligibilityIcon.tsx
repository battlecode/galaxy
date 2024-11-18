import type React from "react";
import type { EligibilityCriterion } from "../api/_autogen";
import Tooltip from "./elements/Tooltip";

interface EligibilityIconProps {
  criterion: EligibilityCriterion;
}

const EligibilityIcon: React.FC<EligibilityIconProps> = ({ criterion }) => (
  <Tooltip text={criterion.title}>{criterion.icon}</Tooltip>
);

export default EligibilityIcon;
