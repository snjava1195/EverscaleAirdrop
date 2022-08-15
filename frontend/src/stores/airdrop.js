import { defineStore } from 'pinia';
import { ProviderRpcClient, Address } from 'everscale-inpage-provider';
// import DePoolAbi from '../../../EverAirdrop.abi.json';
import tvc from '../../../EverAirdrop.base64?raw';
import { toNano, getRandomNonce } from '@/utils';
import { useWalletStore } from '@/stores/wallet';
const ever = new ProviderRpcClient();
const walletStore = useWalletStore();

const giverAbi = {
  'ABI version': 2,
  version: '2.2',
  header: ['time', 'expire'],
  functions: [
    {
      name: 'sendTransaction',
      inputs: [
        { name: 'dest', type: 'address' },
        { name: 'value', type: 'uint128' },
        { name: 'bounce', type: 'bool' },
      ],
      outputs: [],
    },
    {
      name: 'getMessages',
      inputs: [],
      outputs: [
        {
          components: [
            { name: 'hash', type: 'uint256' },
            { name: 'expireAt', type: 'uint64' },
          ],
          name: 'messages',
          type: 'tuple[]',
        },
      ],
    },
    {
      name: 'upgrade',
      inputs: [{ name: 'newcode', type: 'cell' }],
      outputs: [],
    },
    {
      name: 'constructor',
      inputs: [],
      outputs: [],
    },
  ],
  data: [],
  events: [],
  fields: [
    { name: '_pubkey', type: 'uint256' },
    { name: '_constructorFlag', type: 'bool' },
    { name: 'm_messages', type: 'map(uint256,uint64)' },
  ],
};
const airdropAbi = {
  'ABI version': 2,
  version: '2.2',
  header: ['time', 'expire'],
  functions: [
    {
      name: 'constructor',
      inputs: [
        { name: '_refund_destination', type: 'address' },
        { name: '_addresses', type: 'address[]' },
        { name: '_amounts', type: 'uint128[]' },
        { name: '_refund_lock_duration', type: 'uint256' },
      ],
      outputs: [],
    },
    {
      name: 'distribute',
      inputs: [],
      outputs: [],
    },
    {
      name: 'refund',
      inputs: [],
      outputs: [],
    },
    {
      name: 'get_required_amount',
      inputs: [],
      outputs: [{ name: 'value0', type: 'uint256' }],
    },
    {
      name: '_randomNonce',
      inputs: [],
      outputs: [{ name: '_randomNonce', type: 'uint32' }],
    },
  ],
  data: [{ key: 1, name: '_randomNonce', type: 'uint32' }],
  events: [],
  fields: [
    { name: '_pubkey', type: 'uint256' },
    { name: '_timestamp', type: 'uint64' },
    { name: '_constructorFlag', type: 'bool' },
    { name: 'timeStamps', type: 'uint48[]' },
    { name: 'addresses', type: 'address[]' },
    { name: 'amounts', type: 'uint128[]' },
    { name: 'refund_destination', type: 'address' },
    { name: 'refund_lock_duration_end', type: 'uint256' },
    { name: 'distributed', type: 'bool' },
    { name: 'total_amount', type: 'uint256' },
    { name: 'required_fee', type: 'uint256' },
    { name: 'transferGas', type: 'uint128' },
    { name: '_randomNonce', type: 'uint32' },
  ],
};

export const useAirdropStore = defineStore({
  id: 'airdrop',
  state: () => ({
    address: null,
    everAirDropContract: null,
    randomNumber: getRandomNonce(),
  }),
  getters: {},
  actions: {
    async getExpectedAddress() {
      try {
        const address = await ever.getExpectedAddress(airdropAbi, {
          initParams: { _randomNonce: this.randomNumber },
          tvc: tvc,
        });

        this.address = address._address;
      } catch (e) {
        console.log('e: ', e);
      }
    },
    async getGiverContract() {
      try {
        const giverContract = await new ever.Contract(giverAbi, this.address);

        const sendTransaction = await giverContract.methods
          .sendTransaction({
            value: toNano(1),
            dest: this.address,
            bounce: false,
          })
          .send({
            from: walletStore.profile.address,
            amount: toNano(1),
            bounce: false,
          });

        console.log('giverContract: ', giverContract);
        console.log('sendTransaction: ', sendTransaction);
        return Promise.resolve(sendTransaction);
      } catch (e) {
        console.log(e);
        return Promise.reject(e);
      }
    },
    async deployContract(arr) {
      try {
        const everAirDropContract = await new ever.Contract(airdropAbi, new Address(this.address));
        this.everAirDropContract = everAirDropContract;

        const providerState = await ever.getProviderState();
        const stateInit = await ever.getStateInit(airdropAbi, {
          initParams: { _randomNonce: this.randomNumber },
          tvc: tvc,
        });

        const publicKey = providerState.permissions.accountInteraction.publicKey;
        const addresses = arr.map((address) => address.address);
        const amounts = arr.map((amount) => toNano(amount.amount));

        const sendTransaction = await everAirDropContract.methods
          .constructor({
            _refund_destination: walletStore.profile.address,
            _addresses: addresses,
            _amounts: amounts,
            _refund_lock_duration: 120,
          })
          .sendExternal({
            stateInit: stateInit.stateInit,
            publicKey: publicKey,
            withoutSignature: true,
            // local: true,
          });

        console.log('sendTransaction: ', sendTransaction);
        return Promise.resolve(sendTransaction);
      } catch (e) {
        console.log(e);
        return Promise.reject(e);
      }
    },
    async topUp() {
      try {
        const requiredAmount = await this.everAirDropContract.methods
          .get_required_amount({})
          .call();

        const giverContract = await new ever.Contract(giverAbi, this.address);

        const sendTransaction = await giverContract.methods
          .sendTransaction({
            value: toNano(1),
            dest: this.address,
            bounce: false,
          })
          .send({
            from: walletStore.profile.address,
            amount: requiredAmount.value0,
            bounce: false,
          });

        return Promise.resolve([requiredAmount, sendTransaction]);
      } catch (e) {
        console.log(e);
        return Promise.reject(e);
      }
    },
    async distribute() {
      try {
        const sendTransaction = await this.everAirDropContract.methods.distribute({}).send({
          from: walletStore.profile.address,
          amount: toNano(1),
          bounce: true,
        });

        console.log('distribute:', sendTransaction);
        return Promise.resolve(sendTransaction);
      } catch (e) {
        console.log(e);
        return Promise.reject(e);
      }
    },
    async redeemFunds() {
      try {
        const sendTransaction = await this.everAirDropContract.methods.refund({}).send({
          from: walletStore.profile.address,
          amount: toNano(1),
          bounce: true,
        });

        console.log('redeemFunds:', sendTransaction);
        return Promise.resolve(sendTransaction);
      } catch (e) {
        console.log(e);
        return Promise.reject(e);
      }
    },
  },
});
