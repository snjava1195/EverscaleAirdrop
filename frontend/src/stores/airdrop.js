import { defineStore } from 'pinia';
import { ProviderRpcClient, Address, Subscriber } from 'everscale-inpage-provider';
import airdropAbi from '../../../build/EverAirdrop.abi.json';
import tvc from '../../../build/EverAirdrop.base64?raw';
import distributerTvc from '../../../build/Distributer.base64?raw';
import { toNano, getRandomNonce } from '@/utils';
import { useWalletStore } from '@/stores/wallet';
import { getSeconds, chunk } from '@/utils';
import axios from 'axios';
import dayjs from 'dayjs';
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

// const maxNumberOfAddresses = 3;
const maxNumberOfAddresses = 99;

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
    airdropsLoading: false,
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
    async distribute(arr, isResumed) {
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

        let loopStart = isResumed ? this.currentBatch - 1 : 0;
        console.log('loopStart:', loopStart);

        let sendTransaction;
        let firstResumed = isResumed;
        for(let i=loopStart; i<this.loopCount; i++) {
          if (!firstResumed) {
            this.currentBatch++;
          }
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
          firstResumed = false;
          // const futureEvent = await everAirDropContract.waitForEvent({ filter: event => event.event === "StateChanged" });
          // console.log(futureEvent);
        }

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
    resetState() {
      this.address = null;
      this.lockDuration = null,
      this.topUpRequiredAmount = 0;
      this.loopCount = 0;
      this.currentBatch = 0;
      this.maxBatches = 0;
      this.airdropsLoading = false;
      this.airdropsList = [];
    },
    async getAirdrops() {
      this.airdropsLoading = true;
      const walletStore = useWalletStore();
      const { accounts } = await ever.getAccountsByCodeHash({codeHash:'96bc9c33975d4c7a743030652a8a9a61a17ee5df991bee4c6c7587b5868470ad', limit:10});
      console.log('getAccountsByCodeHash:', accounts);
      // Treba da se zove neka funkcija koja daje sve airdropove (kontrakte) sa walleta logovanog usera
      const graphqlQuery = {
        "operationName": null,
        "query": `query($a1: String!){
          blockchain{
            account(address:$a1){
              messages(msg_type:[IntOut], last:10){
                edges{
                  node{
                    dst,
                    created_at_string,
                  }
                  cursor
                }
                pageInfo{
                  hasNextPage
                }
              }
            }
          }
        }`,
        // "query": `query{
        //   counterparties(account:"0:e2332476d7c48622df13732ee89bfe0bd045fb15c4d639768d8fab864adeab09", first: 10) {
        //       counterparty
        //   }
        // }`,
        "variables": {"a1": walletStore.profile.address}
      };

      const headers = {
        "Content-Type": "application/json",
      };

      try {
        const resp = await axios.post('https://devnet.evercloud.dev/graphql', graphqlQuery, headers);
        console.log(resp.data);

        const subscriber = new Subscriber(ever);
        console.log(await subscriber.oldTransactions({address: walletStore.profile.address}));

        // const unique = resp.data.data.blockchain.account.messages.edges.filter((value, index, self) =>
        //   index === self.findIndex((t) => (
        //     t.node.dst === value.node.dst
        //   ))
        // )
        // console.log('unique:', unique);

        // for (let i=0; i<unique.length; i++) {
        //   console.log(unique[i].node.dst);
        //   const contractAddress = unique[i].node.dst;
        //   const everAirdropContract = await new ever.Contract(airdropAbi, new Address(contractAddress));
        //   console.log('contract:', everAirdropContract);
        //   const resp = await everAirdropContract.methods.getContractNotes({}).call();
        //   const airdrop = {
        //     name: resp.value0,
        //     status: 'Pending',
        //     amount: 100,
        //     recipientsNumber: 100,
        //     createdAt: dayjs(unique[i].node.created_at_string).format('DD MMM YYYY')
        //   };
        //   this.airdropsList.push(airdrop);
        // };
        for (let i=0; i<accounts.length; i++) {
          const everAirdropContract = new ever.Contract(airdropAbi, accounts[i]);
          const resp = await everAirdropContract.methods.getContractNotes({}).call();
          const airdrop = {
            name: resp.value0,
            status: 'Pending',
            amount: 100,
            recipientsNumber: 100,
            createdAt: dayjs.unix(Date.now()).format('DD MMM YYYY')
          };
          this.airdropsList.push(airdrop);

        };
        this.airdropsLoading = false;
        return Promise.resolve();
      } catch(error) {
        console.log('getAirdrops e:', error);
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
          this.airdropsLoading = false;
          return Promise.reject(error.response.data);
        }
        this.airdropsLoading = false;
        return Promise.reject(error)
      } finally {
        this.airdropsLoading = false;
      };
    }
  },
});
