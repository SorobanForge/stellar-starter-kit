import { Horizon } from '@stellar/stellar-sdk';
export function getHorizonServer(url) {
  return new Horizon.Server(url);
}
