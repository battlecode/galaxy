import React, { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  type GameMap,
  Status526Enum,
  type TeamPublic,
  PlayerOrderEnum,
} from "api/_autogen";
import { useRequestScrimmage } from "api/compete/useCompete";
import Modal from "components/Modal";
import { useEpisodeId } from "contexts/EpisodeContext";
import { clone } from "lodash";
import SelectMenu from "components/elements/SelectMenu";
import SelectMultipleMenu from "components/elements/SelectMultipleMenu";
import Button from "components/elements/Button";
import DescriptiveCheckbox, {
  CheckboxState,
} from "components/elements/DescriptiveCheckbox";

interface RequestScrimModalProps {
  teamToRequest: TeamPublic;
  maps: GameMap[];
  isOpen: boolean;
  closeModal: () => void;
}

// Team statuses that allow for ranked scrims.
const ALLOWS_RANKED = Status526Enum.R;
const MAX_MAPS_PER_SCRIM = 10;
const ORDER_OPTIONS = [
  { label: "Alternating", value: PlayerOrderEnum.QuestionMark },
  { label: "Requestor First", value: PlayerOrderEnum.Plus },
  { label: "Requestor Last", value: PlayerOrderEnum.Minus },
];

const RequestScrimModal: React.FC<RequestScrimModalProps> = ({
  teamToRequest,
  maps,
  isOpen,
  closeModal,
}) => {
  const { episodeId } = useEpisodeId();
  const queryClient = useQueryClient();
  const request = useRequestScrimmage({ episodeId }, queryClient);

  const getRandomMaps: () => string[] = useCallback(() => {
    const possibleMaps = clone(maps);
    // Pick a random subset of 3 maps, assuming that there are at least 3 possible maps.
    const randomMaps: GameMap[] = [];
    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * possibleMaps.length);
      const randomMap = possibleMaps[randomIndex];
      randomMaps.push(randomMap);
      possibleMaps.splice(randomIndex, 1);
    }
    return randomMaps.map((map) => map.name);
  }, [maps]);

  const [selectedOrder, setSelectedOrder] = useState<PlayerOrderEnum>(
    PlayerOrderEnum.QuestionMark,
  );

  const [selectedMapNames, setSelectedMapNames] = useState<string[]>(
    getRandomMaps(),
  );
  const [mapErrorMessage, setMapErrorMessage] = useState<string | undefined>();
  const [ranked, setRanked] = useState<boolean>(false);

  return (
    <Modal
      isOpen={isOpen}
      closeModal={closeModal}
      title={`Request scrimmage with ${teamToRequest.name}`}
    >
      {
        <div className="mt-4 flex flex-col gap-2">
          <SelectMenu
            disabled={ranked}
            label="Player Order"
            options={ORDER_OPTIONS}
            value={selectedOrder}
            onChange={(newOrder) => {
              setSelectedOrder(newOrder);
            }}
          />
          <SelectMultipleMenu<string>
            errorMessage={mapErrorMessage}
            disabled={ranked}
            label="Select Maps"
            placeholder={ranked ? "Random 3 maps!" : "Select up to 10 maps..."}
            options={
              maps.map((map) => ({
                value: map.name,
                label: map.name,
              })) ?? []
            }
            value={selectedMapNames}
            onChange={(newMapNames) => {
              if (newMapNames.length > MAX_MAPS_PER_SCRIM) {
                setMapErrorMessage("You can only select up to 10 maps.");
                return;
              }
              setMapErrorMessage(undefined);
              setSelectedMapNames(newMapNames);
            }}
          />
          <Button
            disabled={ranked}
            label={"Use random 3 maps"}
            onClick={() => {
              setSelectedMapNames(getRandomMaps());
            }}
          />
          <DescriptiveCheckbox
            status={ranked ? CheckboxState.CHECKED : CheckboxState.UNCHECKED}
            title="Ranked?"
            disabled={teamToRequest.status !== ALLOWS_RANKED}
            description="Request a ranked scrimmage. All ranked scrimmages are played with alternating player order on 3 random maps."
            onChange={(checked) => {
              if (checked) {
                setSelectedOrder(PlayerOrderEnum.QuestionMark);
                setSelectedMapNames([]);
              } else {
                setSelectedMapNames(getRandomMaps());
              }
              setRanked(checked);
            }}
          />
          <Button
            label="Request Scrimmage"
            fullWidth
            loading={request.isPending}
            onClick={() => {
              void request
                .mutateAsync({
                  episodeId,
                  scrimmageRequestRequest: {
                    requested_to: teamToRequest.id,
                    is_ranked: ranked,
                    map_names: selectedMapNames,
                    player_order: selectedOrder,
                  },
                })
                .then(() => {
                  closeModal();
                })
                .catch((err: string) => {
                  console.error(`Error requesting scrimmage: ${err}`);
                });
            }}
          />
        </div>
      }
    </Modal>
  );
};

export default RequestScrimModal;
