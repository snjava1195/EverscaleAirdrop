import { defineStore } from 'pinia';
import { ProviderRpcClient, Address } from 'everscale-inpage-provider';
// import DePoolAbi from '../../../EverAirdrop.abi.json';
import tvc from '../../../EverAirdrop.base64?raw';
import { toNano, getRandomNonce } from '@/utils';
import { useWalletStore } from '@/stores/wallet';
import { getSeconds } from '@/utils';
const ever = new ProviderRpcClient();
// const walletStore = useWalletStore();

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
    deployOptions: {
      initParams: { _randomNonce: 0 },
      tvc: tvc,
    },
    lockDuration: new Date().toLocaleDateString(),
    topUpRequiredAmount: 0,
    // everAirDropContract: null,
    // randomNumber: getRandomNonce(),
    // randomNumber: 0,
    airdrop: {
      name: null,
      status: 'Preparing',
      address: null,
      recipientsNumber: 0,
      totalTokens: 0,
      step: 1,
      createdDate: null,
      token: {}
    },
    airdropsList: []
  }),
  getters: {},
  actions: {
    async getExpectedAddress() {
      try {
        this.deployOptions.initParams._randomNonce = getRandomNonce();
        this.topUpRequiredAmount = 0;
        this.lockDuration = null;
        const address = await ever.getExpectedAddress(airdropAbi, this.deployOptions);

        this.address = address._address;
      } catch (e) {
        console.log('e: ', e);
      }
    },
    async getGiverContract() {
      const walletStore = useWalletStore();
      const seconds = getSeconds(this.lockDuration);
      console.log('seconds:', seconds);
      try {
        const giverContract = await new ever.Contract(giverAbi, this.address);

        const estimateFees = await giverContract.methods
          .sendTransaction({
            value: toNano(1),
            dest: this.address,
            bounce: false,
          })
          .estimateFees({
            from: walletStore.profile.address,
            amount: toNano(1),
            bounce: false,
          });

        console.log('estimateFees: ', parseInt(estimateFees) / Math.pow(10, 9));

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
        this.airdrop.status = 'Failed';
        return Promise.reject(e);
      }
    },
    async deployContract(arr) {
      const walletStore = useWalletStore();
      try {
        const everAirDropContract = await new ever.Contract(airdropAbi, new Address(this.address));
        // this.everAirDropContract = everAirDropContract;

        const providerState = await ever.getProviderState();
        const stateInit = await ever.getStateInit(airdropAbi, this.deployOptions);

        const publicKey = providerState.permissions.accountInteraction.publicKey;
        const addresses = arr.map((address) => address.address);
        const amounts = arr.map((amount) => toNano(amount.amount));

        const sendTransaction = await everAirDropContract.methods
          .constructor({
            _refund_destination: walletStore.profile.address,
            _addresses: addresses,
            _amounts: amounts,
            _refund_lock_duration: getSeconds(this.lockDuration), // TODO proveri da li su stvarno sekunde za lock_duration?
          })
          .sendExternal({
            stateInit: stateInit.stateInit,
            publicKey: publicKey,
            withoutSignature: true,
            // local: true,
          });

        await this.getRequiredAmount();

        console.log('sendTransaction: ', sendTransaction);
        return Promise.resolve(sendTransaction);
      } catch (e) {
        console.log(e);
        return Promise.reject(e);
      }
    },
    async getRequiredAmount() {
      const everAirDropContract = await new ever.Contract(airdropAbi, new Address(this.address));
      const requiredAmount = await everAirDropContract.methods.get_required_amount({}).call();
      this.topUpRequiredAmount = requiredAmount.value0;
    },
    async topUp() {
      const walletStore = useWalletStore();
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
            amount: this.topUpRequiredAmount,
            bounce: false,
          });

        return Promise.resolve(sendTransaction);
      } catch (e) {
        console.log(e);
        return Promise.reject(e);
      }
    },
    async distribute() {
      const walletStore = useWalletStore();
      try {
        const everAirDropContract = await new ever.Contract(airdropAbi, new Address(this.address));
        const sendTransaction = await everAirDropContract.methods.distribute({}).send({
          from: walletStore.profile.address,
          amount: toNano(0.5),
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
      const walletStore = useWalletStore();
      try {
        const everAirDropContract = await new ever.Contract(airdropAbi, new Address(this.address));
        const sendTransaction = await everAirDropContract.methods.refund({}).send({
          from: walletStore.profile.address,
          amount: toNano(0.5),
          bounce: true,
        });

        console.log('redeemFunds:', sendTransaction);
        return Promise.resolve(sendTransaction);
      } catch (e) {
        console.log(e);
        return Promise.reject(e);
      }
    },
    updateAirdropsList() {
      // Treba da se zove neka funkcija koja daje sve airdropove (kontrakte) sa walleta logovanog usera
    },
    getAirdrops() {
      // Treba da se zove neka funkcija koja daje sve airdropove (kontrakte) sa walleta logovanog usera
    }
  },
});
