import { PlayerOrderEnum } from "api/_autogen";

export type Maybe<T> = T | undefined;

/**
 * Helper function to remove nothing types from a type.
 * @param val Item to check if is present.
 * @returns Whether val is not null or undefined.
 */
export function isPresent<T>(val: T | undefined | null): val is T {
  return val !== undefined && val !== null;
}

/**
 * Helper function to stringify a PlayerOrderEnum.
 * @param order PlayerOrderEnum to stringify.
 * @returns Description of the player order.
 */
export const stringifyPlayerOrder = (order: PlayerOrderEnum): string => {
  switch (order) {
    case PlayerOrderEnum.QuestionMark:
      return "Alternating";
    case PlayerOrderEnum.Plus:
      return "Requestor First";
    case PlayerOrderEnum.Minus:
      return "Requestor Last";
    default:
      return "???";
  }
};
