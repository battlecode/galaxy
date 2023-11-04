import React from "react";
import type { EligibilityCriterion } from "../utils/types";
import Tooltip from "./elements/Tooltip";

interface EligibilityIconProps {
  criterion: EligibilityCriterion;
}

const EligibilityIcon: React.FC<EligibilityIconProps> = ({ criterion }) => {
  return <Tooltip text={criterion.title}>{criterion.icon}</Tooltip>;
};

export default EligibilityIcon;
