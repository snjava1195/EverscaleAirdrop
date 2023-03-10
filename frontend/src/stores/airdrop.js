import { defineStore } from 'pinia';
import { ProviderRpcClient, Address } from 'everscale-inpage-provider';
//import distributerTvc from '../../../build/Distributer.base64?raw';
//import tip3DistributerTvc from '../../../build/Tip31Distributer.base64?raw';
import airdrop2Abi from '../../../build/Airdrop.abi.json';
import tokenWalletAbi from '../../../build/TokenWallet.abi.json';
//import tokenRootAbi from '../../../build/TokenRoot.abi.json';
import airdrop2Tvc from '../../../build/Airdrop.base64?raw';
import tokenWalletTvc from '../../../build/TokenWallet.base64?raw';
import { toNano, fromNano, getRandomNonce } from '@/utils';
import { useWalletStore } from '@/stores/wallet';
import { getSeconds, chunk } from '@/utils';
import tokensList from '@/utils/tokens-list';
import axios from 'axios';
import { ref, computed } from 'vue';

//import {ResponseData}  from './ResponseData';
const ever = new ProviderRpcClient();
// const waiting = ref(false);
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
      name: 'transfer',
      inputs: [
        { name: 'amount', type: 'uint128' },
        { name: 'recipient', type: 'address' },
        { name: 'deployWalletValue', type: 'uint128' },
        { name: 'remainingGasTo', type: 'address' },
        { name: 'notify', type: 'bool' },
        { name: 'payload', type: 'cell' },
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
    {
      name: 'balance',
      inputs: [{ name: 'answerId', type: 'uint32' }],
      outputs: [{ name: 'value0', type: 'uint128' }],
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

const rootAbi = {
  'ABI version': 2,
  version: '2.2',
  header: ['pubkey', 'time', 'expire'],
  functions: [
    {
      name: 'walletOf',
      inputs: [
        { name: 'answerId', type: 'uint32' },
        { name: 'walletOwner', type: 'address' },
      ],
      outputs: [{ name: 'value0', type: 'address' }],
    },
    {
      name: 'symbol',
      inputs: [{ name: 'answerId', type: 'uint32' }],
      outputs: [{ name: 'value0', type: 'string' }],
    },
    {
      name: 'decimals',
      inputs: [{ name: 'answerId', type: 'uint32' }],
      outputs: [{ name: 'value0', type: 'uint8' }],
    },
    {
      name: 'name',
      inputs: [{ name: 'answerId', type: 'uint32' }],
      outputs: [{ name: 'value0', type: 'string' }],
    },
  ],
  data: [],
  events: [],
};

//const maxNumberOfAddresses = 3;
const maxNumberOfAddresses = 99;

export const useAirdropStore = defineStore({
  id: 'airdrop',
  state: () => ({
    address: null,
    deployOptions: {
      initParams: { _randomNonce: 0 },
      tvc: null,
    },
    waiting: false,
    lockDuration: new Date().toLocaleDateString(),
    topUpRequiredAmount: 0,
    loopCount: 0,
    currentBatch: 0,
    maxBatches: 0,
    abi: null,
    token: null,
    token_root_address: '',
    hash2: '',
    airdrops: null,
    airdropData: [],
    airdropsLoading: false,
    responseData: [],
    tokenAddr: {
      balances: [],
      offset: 0,
      limit: 0,
      totalCount: 0,
    },
    step: 1,
    fees: 0,
    transactionId: {
      giverContractId: '',
      deployContractId: '',
      amountContractId: '',
      distributeContractId: '',
      redeemContractId: '',
    },
    airdropName: '',
    deployStatus: '',
    existingAirdropAddress: null,
    tokenWalletBalance: 0,
    errorFlag: 0,
  }),
  getters: {},
  actions: {
    async getExpectedAddress(token) {
      const walletStore = useWalletStore();

      try {
        this.token = token;
        this.deployOptions.initParams._randomNonce = getRandomNonce();
        this.topUpRequiredAmount = 0;
        this.lockDuration = null;
        let address;
        this.abi = airdrop2Abi;
        this.deployOptions.tvc = airdrop2Tvc;
        if (token.label === 'EVER') {
          this.token_root_address =
            '0:0000000000000000000000000000000000000000000000000000000000000000';
        } else {
          this.token_root_address = token.address;
        }

        address = await ever.getExpectedAddress(this.abi, this.deployOptions);
        this.address = address._address;
      } catch (e) {
        this.errorFlag = 1;
      }
    },

    async calculateFees(method, contract, tokenLabel, arr) {
      const walletStore = useWalletStore();

      let sendTransaction;
      if (contract == 'giver') {
        const giverContract = new ever.Contract(giverAbi, this.address);

        if (method == 'deploy') {
          if (tokenLabel == 'EVER') {
            sendTransaction = await giverContract.methods
              .sendTransaction({
                value: toNano(0.5, 9),
                dest: this.address,
                bounce: false,
              })
              .estimateFees({ from: walletStore.profile.address, amount: toNano(0.5, 9) });
            this.fees = fromNano(sendTransaction, 9);
          } else {
            sendTransaction = await giverContract.methods
              .sendTransaction({
                value: toNano(1.5, 9),
                dest: this.address,
                bounce: false,
              })
              .estimateFees({ from: walletStore.profile.address, amount: toNano(1.5, 9) });
            this.fees = fromNano(sendTransaction, 9);
          }
        } else {
          sendTransaction = await giverContract.methods
            .sendTransaction({
              value: toNano(1, 9),
              dest: this.address,
              bounce: false,
            })
            .estimateFees({
              from: walletStore.profile.address,
              amount: toNano(this.topUpRequiredAmount, 9),
            });
          this.fees = fromNano(sendTransaction, 9);
        }
      } else {
        this.abi = airdrop2Abi;
        const everAirDropContract = new ever.Contract(this.abi, new Address(this.address));
        if (method == 'distribute') {
          const addresses = arr.map((address) => address.address);

          const amounts = arr.map((amount) => toNano(amount.amount, this.token.decimals));

          const chunkAddresses = chunk(addresses, maxNumberOfAddresses);

          const chunkAmounts = chunk(amounts, maxNumberOfAddresses);
          for (let i = 0; i < this.loopCount; i++) {
            const totalAmount = chunkAmounts[i][1].reduce(
              (previousValue, currentValue) =>
                previousValue + fromNano(currentValue, this.token.decimals),
              0
            );
            if (tokenLabel == 'EVER') {
              sendTransaction = await everAirDropContract.methods.distribute2({}).estimateFees({
                from: walletStore.profile.address,
                amount: toNano(addresses.length * 0.3, 9),
              });
              this.fees = fromNano(sendTransaction, 9);
            } else {
              let fee;
              if (addresses.length == 1) {
                fee = 0.5;
              } else {
                fee = 0.5 + addresses.length * 0.12;
              }

              sendTransaction = await everAirDropContract.methods
                .distribute2({})
                .estimateFees({ from: walletStore.profile.address, amount: toNano(fee, 9) });
              this.fees = fromNano(sendTransaction, 9);
            }
          }
        } else if (method == 'redeem') {
          sendTransaction = await everAirDropContract.methods
            .refund({})
            .estimateFees({ from: walletStore.profile.address, amount: toNano(0.5, 9) });
          this.fees = fromNano(sendTransaction, 9);
        }
      }
    },

    async getGiverContract2(tokenLabel, recipientsListLength) {
      try {
        const giverContract = new ever.Contract(giverAbi, this.address);

        const walletStore = useWalletStore();
        let sendTransaction;

        this.loopCount = Math.floor(recipientsListLength / maxNumberOfAddresses);
        if (recipientsListLength % maxNumberOfAddresses !== 0) {
          this.loopCount++;
        }
        let amountForSetting = 0;
        if (recipientsListLength == 1) {
          amountForSetting = 0.02;
        } else {
          amountForSetting = 0.02 + recipientsListLength * 0.006 * 2;
        }

        if (tokenLabel == 'EVER') {
          const trx = await giverContract.methods
            .sendTransaction({
              value: toNano(0.5 + amountForSetting, 9),
              dest: this.address,
              bounce: false,
            })
            .estimateFees({ from: walletStore.profile.address, amount: toNano(0.5, 9) });
          this.fees = fromNano(trx, 9);

          sendTransaction = await giverContract.methods
            .sendTransaction({
              value: toNano(0.5 + amountForSetting, 9),
              dest: this.address,
              bounce: false,
            })
            .send({
              from: walletStore.profile.address,
              amount: toNano(0.5 + amountForSetting, 9),
              bounce: false,
            });
        } else {
          const trx = await giverContract.methods
            .sendTransaction({
              value: toNano(1.5 + amountForSetting, 9),
              dest: this.address,
              bounce: false,
            })
            .estimateFees({ from: walletStore.profile.address, amount: toNano(0.5, 9) });
          this.fees = fromNano(trx, 9);

          sendTransaction = await giverContract.methods
            .sendTransaction({
              value: toNano(1.5 + amountForSetting, 9),
              dest: this.address,
              bounce: false,
            })
            .send({
              from: walletStore.profile.address,
              amount: toNano(1.5 + amountForSetting, 9),
              bounce: false,
            });
        }
        this.errorFlag = 0;
        walletStore.getBalance();
        return Promise.resolve(sendTransaction);
      } catch (e) {
        this.errorFlag = 1;
        return Promise.reject(e);
      }
    },
    async deployContract(airdropName, totalTokens, totalRecipients, token) {
      const walletStore = useWalletStore();
      try {
        const code2 = await ever.splitTvc(airdrop2Tvc);
        this.hash2 = await ever.setCodeSalt({
          code: code2.code,
          salt: {
            structure: [{ name: 'ownerAddress', type: 'address' }],
            data: { ownerAddress: walletStore.profile.address },
          },
        });
        this.deployOptions.tvc = airdrop2Tvc;
        this.abi = airdrop2Abi;
        const everAirDropContract = new ever.Contract(this.abi, new Address(this.address));

        const providerState = await ever.getProviderState();
        const stateInit = await ever.getStateInit(this.abi, this.deployOptions);
        const publicKey = providerState.permissions.accountInteraction.publicKey;

        if (this.token_root_address === '' || this.token_root_address === undefined) {
          this.token_root_address = token.address;
        }

        const data = /*token.label === 'EVER' ?*/ {
          _contract_notes: airdropName,
          _refund_destination: walletStore.profile.address,
          _refund_lock_duration: getSeconds(this.lockDuration),
          _newCode: this.hash2.code,
          _sender_address: walletStore.profile.address,
          _token_root_address: this.token_root_address,
          _number_of_recipients: totalRecipients,
          _total_amount: toNano(totalTokens, 9),
        };
        const sendTransaction = await everAirDropContract.methods.constructor(data).sendExternal({
          stateInit: stateInit.stateInit,
          publicKey: publicKey,
          withoutSignature: true,
        });
        this.getRequiredAmount(totalTokens, totalRecipients);
        const status = await everAirDropContract.methods.status({}).call();
        if (status.status * 1 == 0) {
          this.deployStatus = 'Deploying';
        } else if (status.status * 1 == 1) {
          this.deployStatus = 'Deployed';
        }
        walletStore.getBalance();
        this.errorFlag = 0;
        return Promise.resolve(sendTransaction);
      } catch (e) {
        this.errorFlag = 1;
        return Promise.reject(e);
      }
    },
    async getDeploymentStatus() {
      this.abi = airdrop2Abi;
      const everAirDropContract = new ever.Contract(this.abi, new Address(this.address));

      try {
        const statusTx = await everAirDropContract.methods.status({}).call();

        if (statusTx.status * 1 == 0) {
          this.deployStatus = 'Deploying';
        } else if (statusTx.status * 1 == 1) {
          this.deployStatus = 'Deployed';
        } else {
          this.deployStatus = '';
        }
        return Promise.resolve(statusTx);
      } catch (e) {
        return Promise.reject(e);
      }
    },

    async setTransactionsHash(hash) {
      const walletStore = useWalletStore();
      try {
        this.abi = airdrop2Abi;
        const everAirDropContract = new ever.Contract(this.abi, new Address(this.address));
        let sendTransaction;
        const providerState = await ever.getProviderState();
        const publicKey = providerState.permissions.accountInteraction.publicKey;
        sendTransaction = await everAirDropContract.methods
          .setTransaction({ transaction: hash })
          .sendExternal({ publicKey: publicKey, withoutSignature: true });
        const recipients = await everAirDropContract.methods.transactionHashes({}).call();

        const batch = await everAirDropContract.methods.batches({}).call();

        return Promise.resolve(sendTransaction);
      } catch (e) {
        return Promise.reject(e);
      }
    },

    async setRecipients(arr) {
      const walletStore = useWalletStore();
      try {
        const addresses = arr.map((address) => address.address);
        const amounts = arr.map((amount) => toNano(amount.amount, this.token.decimals));
        const chunkAddresses = chunk(addresses, maxNumberOfAddresses);

        const chunkAmounts = chunk(amounts, maxNumberOfAddresses);

        const everAirDropContract = new ever.Contract(this.abi, new Address(this.address));

        const batchesDone = await everAirDropContract.methods.batchAddresses({}).call();
        let loopStart = batchesDone.batchAddresses.length;

        let sendTransaction;

        const providerState = await ever.getProviderState();
        const publicKey = providerState.permissions.accountInteraction.publicKey;

        for (let i = loopStart; i < this.loopCount; i++) {
          let amount = 0;
          if (chunkAddresses[i][1].length > 1) {
            amount = 0.02 + chunkAddresses[i][1].length * 0.006;
          } else {
            amount = chunkAddresses[i][1].length * 0.02;
          }
          sendTransaction = await everAirDropContract.methods
            .setRecipients({ recipients: chunkAddresses[i][1] })
            .sendExternal({ publicKey: publicKey, withoutSignature: true });
        }

        walletStore.getBalance();
        return Promise.resolve(sendTransaction);
      } catch (e) {
        return Promise.reject(e);
      }
    },

    async setAmounts(arr) {
      const walletStore = useWalletStore();
      try {
        const addresses = arr.map((address) => address.address);
        const amounts = arr.map((amount) => toNano(amount.amount, this.token.decimals));
        const chunkAddresses = chunk(addresses, maxNumberOfAddresses);
        const chunkAmounts = chunk(amounts, maxNumberOfAddresses);

        const everAirDropContract = new ever.Contract(this.abi, new Address(this.address));
        const batchesDone = await everAirDropContract.methods.batchAmounts({}).call();
        let loopStart = batchesDone.batchAmounts.length;

        let sendTransaction;
        const providerState = await ever.getProviderState();
        const publicKey = providerState.permissions.accountInteraction.publicKey;

        for (let i = loopStart; i < this.loopCount; i++) {
          let amount = 0;
          if (chunkAddresses[i][1].length > 1) {
            amount = 0.02 + chunkAddresses[i][1].length * 0.006;
          } else {
            amount = chunkAddresses[i][1].length * 0.02;
          }
          sendTransaction = await everAirDropContract.methods
            .setAmounts({ amounts: chunkAmounts[i][1] })
            .sendExternal({ publicKey: publicKey, withoutSignature: true });
        }
        const status = await everAirDropContract.methods.status({}).call();
        if (status.status * 1 == 1) {
          this.deployStatus = 'Deployed';
        }
        walletStore.getBalance();
        return Promise.resolve(sendTransaction);
      } catch (e) {
        return Promise.reject(e);
      }
    },
    async getRecipients() {
      const everAirDropContract = new ever.Contract(this.abi, new Address(this.address));
      try {
        const recipients = await everAirDropContract.methods.batchAddresses({}).call();
        return Promise.resolve(recipients);
      } catch (e) {
        return Promise.reject(e);
      }
    },

    async getAmounts() {
      const everAirDropContract = new ever.Contract(this.abi, new Address(this.address));
      try {
        const recipients = await everAirDropContract.methods.batchAmounts({}).call();
        return Promise.resolve(recipients);
      } catch (e) {
        return Promise.reject(e);
      }
    },

    async getTransactionHashes() {
      const everAirDropContract = new ever.Contract(this.abi, new Address(this.address));
      try {
        const transactionHashes = await everAirDropContract.methods.transactionHashes({}).call();
        return Promise.resolve(transactionHashes);
      } catch (e) {
        return Promise.reject(e);
      }
    },

    async getRequiredAmount(totalTokens, totalRecipients) {
      if (this.token.label !== 'EVER') {
        this.topUpRequiredAmount = totalTokens;
      } else {
        this.loopCount = Math.floor(totalRecipients / maxNumberOfAddresses);
        if (totalRecipients % maxNumberOfAddresses !== 0) {
          this.loopCount++;
        }
        this.topUpRequiredAmount = totalTokens;
      }
      this.maxBatches = this.loopCount;
    },
    async topUp() {
      const walletStore = useWalletStore();
      try {
        const giverContract = new ever.Contract(giverAbi, this.address);

        let sendTransaction;
        if (this.token.label === 'EVER') {
          sendTransaction = await giverContract.methods
            .sendTransaction({
              value: toNano(1, 9),
              dest: this.address,
              bounce: false,
            })
            .send({
              from: walletStore.profile.address,
              amount: toNano(this.topUpRequiredAmount, 9),
              bounce: false,
            });
        } else {
          const rootAcc = new ever.Contract(rootAbi, this.token.address);
          const response = await rootAcc.methods
            .walletOf({
              answerId: 1,
              walletOwner: walletStore.profile.address,
            })
            .call();

          const userTokenWalletAddress = response.value0._address;
          const tokenWalletAddress = new Address(userTokenWalletAddress);
          const walletContract = new ever.Contract(giverAbi, tokenWalletAddress);
          sendTransaction = await walletContract.methods
            .transfer({
              amount: toNano(this.topUpRequiredAmount, this.token.decimals),
              recipient: this.address,
              deployWalletValue: 0, //toNano(0.5, 9),
              remainingGasTo: walletStore.profile.address,
              notify: true,
              payload: '',
            })
            .send({
              from: walletStore.profile.address,
              amount: toNano(0.5, 9),
              bounce: true,
            });
        }

        walletStore.getBalance();
        this.errorFlag = 0;
        return Promise.resolve(sendTransaction);
      } catch (e) {
        this.errorFlag = 1;
        return Promise.reject(e);
      }
    },
    async distribute(arr, isResumed) {
      const walletStore = useWalletStore();
      this.abi = airdrop2Abi;
      try {
        const addresses = arr.map((address) => address.address);

        const amounts = arr.map((amount) => toNano(amount.amount, this.token.decimals));

        const chunkAddresses = chunk(addresses, maxNumberOfAddresses);

        const chunkAmounts = chunk(amounts, maxNumberOfAddresses);

        const everAirDropContract = new ever.Contract(this.abi, new Address(this.address));
        const deployed = await everAirDropContract.methods.usao({}).call();
        let loopStart = deployed.usao;

        this.currentBatch = loopStart * 1;
        this.loopCount = Math.floor(addresses.length / maxNumberOfAddresses);
        if (addresses.length % maxNumberOfAddresses !== 0) {
          this.loopCount++;
        }
        const providerState = await ever.getProviderState();
        const publicKey = providerState.permissions.accountInteraction.publicKey;

        let sendTransaction;
        let firstResumed = isResumed;
        if (!firstResumed) {
          this.currentBatch++;
          if (this.token.label === 'EVER') {
            sendTransaction = await everAirDropContract.methods.distribute2({}).send({
              from: walletStore.profile.address,
              amount: toNano(this.loopCount * 0.4, 9),
              bounce: true,
            });
            this.getEvents();
            firstResumed = false;
          } else {
            let fee = 0;
            if (addresses.length == 1) {
              fee = 0.5;
            } else {
              fee = 0.5 + addresses.length * 0.12 + this.loopCount * 0.13;
            }

            sendTransaction = await everAirDropContract.methods.distribute2({}).send({
              from: walletStore.profile.address,
              amount: toNano(fee, 9),
              bounce: true,
            });
            this.getEvents();
            firstResumed = false;
          }
        } else {
          const loopNr = everAirDropContract.methods.usao({}).call();
          this.currentBatch = loopNr.usao * 1;
          if (loopNr.usao == undefined) {
            this.currentBatch = loopStart * 1 + 1;
          } else {
            this.currentBatch = loopNr.usao * 1;
          }
          if (this.token.label === 'EVER') {
            sendTransaction = await everAirDropContract.methods.distribute2({}).send({
              from: walletStore.profile.address,
              amount: toNano(this.loopCount * 0.3, 9),
              bounce: true,
            });
            this.getEvents();
            firstResumed = false;
          } else {
            let fee = 0;
            if (addresses.length == 1) {
              fee = 0.5;
            } else {
              fee = 0.5 + addresses.length * 0.12 + this.loopCount * 0.12;
            }
            sendTransaction = await everAirDropContract.methods.distribute2({}).send({
              from: walletStore.profile.address,
              amount: toNano(fee, 9),
              bounce: true,
            });
            this.getEvents();
            firstResumed = false;
          }
        }
        walletStore.getBalance();
        return Promise.resolve(sendTransaction);
      } catch (e) {
        return Promise.reject(e);
      }
    },
    async redeemFunds() {
      const walletStore = useWalletStore();
      const airdropStore = useAirdropStore();
      let sendTransaction;
      this.abi = airdrop2Abi;
      try {
        const everAirDropContract = await new ever.Contract(this.abi, new Address(this.address));

        if (this.token.label === 'EVER') {
          sendTransaction = await everAirDropContract.methods.refund({}).send({
            from: walletStore.profile.address,
            amount: toNano(0.5, 9),
            bounce: false,
          });
        } else {
          sendTransaction = await everAirDropContract.methods.refund({}).send({
            from: walletStore.profile.address,
            amount: toNano(airdropStore.loopCount * 0.1 + 0.1 + 0.2, 9),
            bounce: false,
          });
        }
        walletStore.getBalance();
        return Promise.resolve(sendTransaction);
      } catch (e) {
        return Promise.reject(e);
      }
    },
    async getEvents() {
      const everAirDropContract = new ever.Contract(this.abi, new Address(this.address));
      try {
        const event = await everAirDropContract.waitForEvent();
        this.currentBatch = event.data.batchProcesses * 1;
        return Promise.resolve(event);
      } catch (e) {
        return Promise.reject(e);
      }
    },

    async getAirdropTransactions(limit, page) {
      const walletStore = useWalletStore();
      const existingPage = walletStore.getExistingPage(page);
      let accounts;
      this.airdropsLoading = true;
      if (page > walletStore.currentPage) {
        if (existingPage !== undefined) {
          walletStore.continuation = existingPage.continuation;
        }
      } else {
        await walletStore.getPagination(page);
      }
      walletStore.currentPage = page;
      try {
        const codeEver = await ever.splitTvc(airdrop2Tvc);

        const hashEver = await ever.setCodeSalt({
          code: codeEver.code,
          salt: {
            structure: [{ name: 'ownerAddress', type: 'address' }],
            data: { ownerAddress: walletStore.profile.address },
          },
        });
        const bocHashEver = await ever.getBocHash(hashEver.code);
        const paginationObject = { codeHash: bocHashEver, limit: limit };

        if (page > 1) {
          paginationObject.continuation = walletStore.continuation;
        }

        accounts = await ever.getAccountsByCodeHash(paginationObject);
        this.airdrops = accounts;
        this.airdropData = [];
        for (let i = 0; i < this.airdrops.accounts.length; i++) {
          const contract = new ever.Contract(airdrop2Abi, this.airdrops.accounts[i]._address);
          const names = await contract.methods.contract_notes({}).call();
          const status = await contract.methods.status({}).call();
          const recipientsNr = await contract.methods.recipientNumber({}).call();
          const totalAmount = await contract.methods.totalAmount({}).call();
          const date = await contract.methods.creationDate({}).call();
          const batches = await contract.methods.batches({}).call();
          const distributed = await contract.methods.usao({}).call();
          const tokenAddress = await contract.methods.tokenRootAddress({}).call();
          const deposit = await ever.getBalance(this.airdrops.accounts[i]._address);
          let tokensLabel = '';
          let icon = '';
          let token = null;

          if (
            tokenAddress.tokenRootAddress._address ==
            '0:0000000000000000000000000000000000000000000000000000000000000000'
          ) {
            token = tokensList.find((token) => token.label == 'EVER');
            tokensLabel = token.label;
            icon = token.icon;
          } else {
            token = tokensList.find(
              (token) => token.address == tokenAddress.tokenRootAddress._address
            );
            tokensLabel = token.label;
            icon = token.icon;
          }

          let workDone = '';
          if (batches.batches == 1) {
            workDone =
              'Executing ' +
              distributed.usao * recipientsNr.recipientNumber +
              '/' +
              batches.batches * recipientsNr.recipientNumber;
          } else if (batches.batches > 1) {
            workDone =
              'Executing ' +
              distributed.usao * maxNumberOfAddresses +
              '/' +
              recipientsNr.recipientNumber;
          }
          let finalStatus = '';
          const balanceAfterDeploy = await ever.getBalance(this.airdrops.accounts[i]._address);

          if (status.status * 1 == 1) {
            if (token.label == 'EVER') {
              if (fromNano(balanceAfterDeploy, 9) > fromNano(totalAmount.totalAmount, 9) + 0.4) {
                finalStatus = 'Preparing';
              } else finalStatus = 'Deployed';
            } else {
              if (status.status * 1 == 2)
                ///TODO: staviti pravu cifru
                finalStatus = 'Preparing';
              else finalStatus = 'Deployed';
            }
          } else if (status.status * 1 == 5) {
            finalStatus = workDone;
          } else if (status.status * 1 == 0) {
            finalStatus = 'Deploying';
            //}
          } else if (status.status * 1 == 3) {
            finalStatus = 'Executed';
          } else if (status.status * 1 == 4) {
            finalStatus = 'Redeemed';
          }

          let createdStatus = '';
          if (status.status * 1 != 3 && status.status * 1 != 4) {
            createdStatus = 'Created';
          } else {
            createdStatus = 'Executed';
          }
          this.airdropData.push({
            airdropName: names.contract_notes,
            status: finalStatus,
            amount: fromNano(totalAmount.totalAmount, 9),
            recipientsNumber: recipientsNr.recipientNumber,
            dateCreated: date.creationDate,
            statusCreated: createdStatus,
            address: this.airdrops.accounts[i]._address,
            tokenLabel: tokensLabel,
            tokenIcon: icon,
          });
        }

        const existingPage = walletStore.getExistingPage(walletStore.nextPage);

        if (existingPage === undefined) {
          if (accounts.length < limit) {
            await walletStore.updatePagination(walletStore.nextPage, undefined);
          } else {
            const temp = {
              codeHash: bocHashEver,
              limit: limit,
              continuation: accounts.continuation,
            };
            const accByCodeHash = await ever.getAccountsByCodeHash(temp);
            if (accByCodeHash.length != 0) {
              await walletStore.updatePagination(walletStore.nextPage, this.airdrops.continuation);
            }
          }
        }

        let airdropsList = JSON.parse(localStorage.getItem('airdropsListData'));
        for (let i = 0; i < airdropsList.length; i++) {
          if (airdropsList[i].step == 1 || airdropsList[i].step == 2) {
            const totalRecipientsTokens = airdropsList[i].items.reduce((accumulator, object) => {
              const acc = toNano(accumulator, 9);
              const objc = toNano(object.amount, 9);

              const sum = acc * 1 + objc * 1;

              const sum2 = fromNano(sum, 9);

              return sum2 * 1;
            }, 0);

            const token = await this.returnTokenInfo(airdropsList[i].tokenRootAddr);
            this.airdropData.push({
              airdropName: airdropsList[i].airdropName,
              status: 'Preparing',
              amount: totalRecipientsTokens,
              recipientsNumber: airdropsList[i].items.length,
              dateCreated: airdropsList[i].date,
              statusCreated: 'Preparing',
              address: airdropsList[i].contractAddr,
              tokenLabel: token.label,
              tokenIcon: token.icon,
            });
          }
        }

        this.airdropsLoading = false;
      } catch (e) {
        this.airdropsLoading = false;
      }
    },

    async getEstimatedFee() {
      const walletStore = useWalletStore();
      const fees = await ever.estimateFees(walletStore.profile.address, this.address, 1000000000, {
        abi: airdrop2Abi,
        method: 'constructor',
        params: ['0:a49cd4e158a9a15555e624759e2e4e766d22600b7800d891e46f9291f044a93d'],
      });
    },

    async addCustomTokens() {
      const walletStore = useWalletStore();
      var data = JSON.stringify({
        ownerAddress: walletStore.profile.address,
        limit: 100,
        offset: 0,
        ordering: 'amountdescending',
      });

      var config = {
        method: 'post',
        url: 'https://tokens.everscan.io/v1/balances',
        headers: {
          'Content-Type': 'application/json',
        },
        data: data,
      };

      return axios(config)
        .then((response) => {
          this.tokenAddr = response.data;
        })
        .catch((error) => {});
    },

    async getBalances() {
      const axiosRes = await this.addCustomTokens();

      const ever = new ProviderRpcClient();
      let counter = 0;
      for (let i = 0; i < this.tokenAddr.balances.length; i++) {
        const rootAcc = new ever.Contract(rootAbi, this.tokenAddr.balances[i].rootAddress);
        const decimal = await rootAcc.methods.decimals({ answerId: 1 }).call();
        const token = tokensList.find(
          (token) => token.address == this.tokenAddr.balances[i].rootAddress
        );
        if (token == undefined) {
          counter++;
          tokensList.push({
            label: this.tokenAddr.balances[i].token,
            decimals: decimal.value0 * 1,
            address: this.tokenAddr.balances[i].rootAddress,
            icon: `/avatar/${counter}.svg`,
          });
        }
        if (counter == 10) {
          counter = 0;
        }
      }
    },

    async getToken(tokenAddr) {
      const root = new ever.Contract(rootAbi, tokenAddr);
      const walletStore = useWalletStore();
      try {
        const response = await root.methods
          .walletOf({
            answerId: 1,
            walletOwner: walletStore.profile.address,
          })
          .call();

        const decimals = await root.methods.decimals({ answerId: 0 }).call();
        const userTokenWalletAddress = response.value0._address;

        const tokenWalletAddress = new Address(userTokenWalletAddress);
        const tokenWallet = new ever.Contract(tokenWalletAbi, tokenWalletAddress);
        const tokenBalance = await tokenWallet.methods.balance({ answerId: 0 }).call();

        const label = await root.methods.symbol({ answerId: 1 }).call();

        tokensList.push({
          label: label.value0,
          decimals: decimals.value0 * 1,
          address: tokenAddr,
          icon: `/avatar/5.svg`,
        });

        const tokenInfo = {
          label: label.value0,
          decimals: decimals.value0 * 1,
          address: tokenAddr,
          balance: fromNano(tokenBalance.value0 * 1, decimals.value0 * 1),
        };
        return Promise.resolve(tokenInfo);
      } catch (e) {
        return Promise.reject(e);
      }
    },
    async returnTokenInfo(addr) {
      let token;
      if (addr != '0:0000000000000000000000000000000000000000000000000000000000000000') {
        //const token = new ever.Contract(rootAbi, addr)
        token = tokensList.find((token) => token.address == addr);
        if (!token) {
          const tokenContract = new ever.Contract(rootAbi, addr);
          const label = await tokenContract.methods.symbol({ answerId: 0 }).call();
          const decimals = await tokenContract.methods.decimals({ answerId: 0 }).call();

          token = {
            label: label.value0,
            decimals: decimals.value0,
            address: addr,
            icon: '/avatar/1.svg',
          };
          //return Promise.resolve(token);
        }
      } else {
        token = tokensList.find((token) => token.label == 'EVER');
      }

      return Promise.resolve(token);
    },
  },
});
