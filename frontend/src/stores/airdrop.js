import { defineStore } from 'pinia';
import { ProviderRpcClient } from 'everscale-inpage-provider';
import DePoolAbi from '../../../EverAirdrop.abi.json';
import tvc from '../../../EverAirdrop.base64?raw';
const ever = new ProviderRpcClient();

export const useAirdropStore = defineStore({
  id: 'airdrop',
  state: () => ({
    address: null,
  }),
  getters: {},
  actions: {
    async getExpectedAddress() {
      try {
        const address = await ever.getExpectedAddress(DePoolAbi, {
          initParams: {},
          tvc: tvc,
        });

        this.address = address._address;
      } catch (e) {
        console.log('e: ', e);
      }
    },
  },
});
