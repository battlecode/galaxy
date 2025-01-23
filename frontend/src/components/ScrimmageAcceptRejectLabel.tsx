import { ScrimmageRequestAcceptRejectEnum } from "api/_autogen";
import Icon from "./elements/Icon";

interface ScrimmageAcceptRejectLabelProps {
  acceptRejectStatus?: ScrimmageRequestAcceptRejectEnum;
}

const ScrimmageAcceptRejectLabel: React.FC<ScrimmageAcceptRejectLabelProps> = ({
  acceptRejectStatus = ScrimmageRequestAcceptRejectEnum.M,
}) => {
  const baseClasses =
    "flex flex-row items-center justify-center gap-2 py-1.5 rounded-lg border-1 w-36";

  switch (acceptRejectStatus) {
    case ScrimmageRequestAcceptRejectEnum.A:
      return (
        <div
          className={`${baseClasses} border-green-400 bg-green-200 text-green-700`}
        >
          Auto-Accept
          <Icon name="check" />
        </div>
      );
    case ScrimmageRequestAcceptRejectEnum.R:
      return (
        <div
          className={`${baseClasses} border-red-400 bg-red-200 text-red-700`}
        >
          Auto-Reject
          <Icon name="x_mark" />
        </div>
      );
    default:
      return (
        <div
          className={`${baseClasses} border-gray-400 bg-gray-200 text-gray-700`}
        >
          Manual
          <Icon name="magnifying_glass" />
        </div>
      );
  }
};

export default ScrimmageAcceptRejectLabel;
