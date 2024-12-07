import type React from "react";
import { useCallback, useState } from "react";
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
import Checkbox from "components/elements/Checkbox";

interface RequestScrimModalProps {
  teamToRequest: TeamPublic;
  maps: GameMap[];
  isOpen: boolean;
  closeModal: () => void;
}

// Only allow ranked scrims against "Regular" teams.
const { R: ALLOWS_RANKED } = Status526Enum;
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
  const MAP_COUNT = 3;

  const { episodeId } = useEpisodeId();
  const queryClient = useQueryClient();

  const request = useRequestScrimmage({ episodeId }, queryClient, () => {
    closeModal();
  });

  const getRandomMaps: () => string[] = useCallback(() => {
    const possibleMaps = clone(maps);
    // Pick a random subset of 3 maps, assuming that there are at least 3 possible maps.
    const randomMaps: GameMap[] = [];
    for (let i = 0; i < MAP_COUNT; i++) {
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
        <div className="mt-4 flex flex-col gap-4">
          <Checkbox
            disabled={teamToRequest.status !== ALLOWS_RANKED}
            checked={ranked}
            onChange={(checked) => {
              if (checked) {
                setSelectedOrder(PlayerOrderEnum.QuestionMark);
                setSelectedMapNames([]);
                setMapErrorMessage(undefined);
              } else {
                setSelectedMapNames(getRandomMaps());
              }
              setRanked(checked);
            }}
            label="Ranked?"
          />
          <SelectMenu
            disabled={ranked}
            label="Player order"
            options={ORDER_OPTIONS}
            value={selectedOrder}
            onChange={(newOrder): void => {
              setSelectedOrder(newOrder);
            }}
          />
          <div className="flex flex-col gap-2">
            <SelectMultipleMenu<string>
              errorMessage={mapErrorMessage}
              disabled={ranked}
              label="Maps"
              placeholder={
                ranked ? "Random 3 maps!" : "Select up to 10 maps..."
              }
              options={maps.map((map) => ({
                value: map.name,
                label: map.name,
              }))}
              value={ranked ? [] : selectedMapNames}
              onChange={(newMapNames) => {
                setSelectedMapNames(newMapNames);
                if (newMapNames.length > MAX_MAPS_PER_SCRIM) {
                  setMapErrorMessage("You can only select up to 10 maps.");
                } else if (newMapNames.length === 0) {
                  setMapErrorMessage("You must select at least one map");
                } else {
                  setMapErrorMessage(undefined);
                }
              }}
            />
            <div
              hidden={ranked}
              onClick={() => {
                setMapErrorMessage(undefined);
                setSelectedMapNames(getRandomMaps());
              }}
              className="mt-0 cursor-pointer text-sm text-cyan-600"
            >
              [Click to use 3 random maps]
            </div>
          </div>
          <div className="mt-2 flex flex-row gap-4">
            <Button
              label="Request Scrimmage"
              variant="dark"
              fullWidth
              disabled={mapErrorMessage !== undefined}
              loading={request.isPending}
              onClick={() => {
                request.mutate({
                  episodeId,
                  scrimmageRequestRequest: {
                    requested_to: teamToRequest.id,
                    is_ranked: ranked,
                    map_names: selectedMapNames,
                    player_order: selectedOrder,
                  },
                });
              }}
            />
            <Button fullWidth label="Cancel" onClick={closeModal} />
          </div>
        </div>
      }
    </Modal>
  );
};

export default RequestScrimModal;
