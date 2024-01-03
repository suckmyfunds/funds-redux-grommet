
import { createTransform } from 'redux-persist';
import traverse from 'traverse';

var PERSIST_EXPIRE_DEFAULT_KEY = 'persistExpiresAt';

export interface PersistExpireConfig {
  expireKey: string;
  defaultState?: any;
}
export default function (config: PersistExpireConfig) {
  config = config || {};
  config.expireKey = config.expireKey || PERSIST_EXPIRE_DEFAULT_KEY;
  config.defaultState = config.defaultState || {};

  function dateToUnix(date: Date) {
    return +(date.getTime() / 1000).toFixed(0);
  }

  function inbound(state: any) {
    if (!state) return state;

    return state;
  }

  function outbound(state: any) {
    if (!state) return state;

    var validState = traverse(state).forEach(function (value) {
      if (!value || typeof value !== 'object') {
        return;
      }

      if (!value.hasOwnProperty(config.expireKey)) {
        return;
      }

      var expireDate = value[config.expireKey];

      if (!expireDate) {
        return;
      }

      if (dateToUnix(new Date(expireDate)) < dateToUnix(new Date())) {
        this.update(config.defaultState);
      }
    });

    return validState;
  }

  return createTransform(inbound, outbound);
};
