import { defineStore } from 'pinia';
import { ProviderRpcClient, Address } from 'everscale-inpage-provider';
import airdropAbi from '../../../build/EverAirdrop.abi.json';
import tvc from '../../../build/EverAirdrop.base64?raw';
import distributerTvc from '../../../build/Distributer.base64?raw';
import { toNano, getRandomNonce } from '@/utils';
import { useWalletStore } from '@/stores/wallet';
import { getSeconds, chunk } from '@/utils';
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

// const maxNumberOfAddresses = 99;
const maxNumberOfAddresses = 3;

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
    loopCount: 0,
    currentBatch: 0,
    maxBatches: 0,
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
    async deployContract(airdropName, totalTokens, totalRecipients) {
      const walletStore = useWalletStore();
      try {
        const everAirDropContract = await new ever.Contract(airdropAbi, new Address(this.address));
        // this.everAirDropContract = everAirDropContract;

        const providerState = await ever.getProviderState();
        const stateInit = await ever.getStateInit(airdropAbi, this.deployOptions);

        const publicKey = providerState.permissions.accountInteraction.publicKey;
        // const addresses = arr.map((address) => address.address);
        // const amounts = arr.map((amount) => toNano(amount.amount));

        const sendTransaction = await everAirDropContract.methods
          .constructor({
            _contract_notes: airdropName,
            _refund_destination: walletStore.profile.address,
            // _addresses: addresses,
            // _amounts: amounts,
            _refund_lock_duration: getSeconds(this.lockDuration),
          })
          .sendExternal({
            stateInit: stateInit.stateInit,
            publicKey: publicKey,
            withoutSignature: true,
            // local: true,
          });

        this.getRequiredAmount(totalTokens, totalRecipients);
        // this.topUpRequiredAmount = totalTokens + 2; // TODO racun je totalTokens + ((broj petlji - 1) * 0.5) (0.5 po deployovanom kontraktu)

        console.log('sendTransaction: ', sendTransaction);
        return Promise.resolve(sendTransaction);
      } catch (e) {
        console.log(e);
        return Promise.reject(e);
      }
    },
    async getRequiredAmount(totalTokens, totalRecipients) {
      this.loopCount = Math.floor(totalRecipients / maxNumberOfAddresses);
        if (totalRecipients % maxNumberOfAddresses !== 0) {
          this.loopCount++;
        }
      this.topUpRequiredAmount = totalTokens + ((this.loopCount - 1) * 0.5);
      this.maxBatches = this.loopCount;
    },
    async topUp() {
      const walletStore = useWalletStore();
      try {
        const giverContract = await new ever.Contract(giverAbi, this.address);

        console.log('this.topUpRequiredAmount + 0.5:', toNano(this.topUpRequiredAmount));
        const sendTransaction = await giverContract.methods
          .sendTransaction({
            value: toNano(1),
            dest: this.address,
            bounce: false,
          })
          .send({
            from: walletStore.profile.address,
            amount: toNano(this.topUpRequiredAmount),
            bounce: false,
          });

        return Promise.resolve(sendTransaction);
      } catch (e) {
        console.log(e);
        return Promise.reject(e);
      }
    },
    async distribute(arr) {
      const walletStore = useWalletStore();
      try {
        const addresses = arr.map((address) => address.address);
        const amounts = arr.map((amount) => toNano(amount.amount));
        const chunkAddresses = chunk(addresses, maxNumberOfAddresses);
        console.log(chunkAddresses);
        const chunkAmounts = chunk(amounts, maxNumberOfAddresses);
        console.log(chunkAmounts);

        const everAirDropContract = await new ever.Contract(airdropAbi, new Address(this.address));

        const { code } = await ever.splitTvc(distributerTvc);

        let sendTransaction;
        for(let i=0; i<this.loopCount; i++) {
          this.currentBatch++;
          sendTransaction = await everAirDropContract.methods.distribute({
            _addresses: chunkAddresses[i][1],
            _amounts: chunkAmounts[i][1],
            _wid: 0,
            _code: code
          }).send({
            from: walletStore.profile.address,
            amount: toNano(0.5),
            bounce: true,
          });

          // const futureEvent = await everAirDropContract.waitForEvent({ filter: event => event.event === "StateChanged" });
          // console.log(futureEvent);
        }

        const transaction = await everAirDropContract.methods.getStatus({}).call();
        console.log('transaction:', transaction);
        console.log('transaction.value0:', transaction.value0);

        // const sendTransaction = await everAirDropContract.methods.distribute({}).send({
        //   from: walletStore.profile.address,
        //   amount: toNano(0.5),
        //   bounce: true,
        // });

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
          bounce: false,
        });

        console.log('redeemFunds:', sendTransaction);
        return Promise.resolve(sendTransaction);
      } catch (e) {
        console.log(e);
        return Promise.reject(e);
      }
    },
    getAirdrops() {
      // Treba da se zove neka funkcija koja daje sve airdropove (kontrakte) sa walleta logovanog usera
    }
  },
});
