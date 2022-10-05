import { defineStore } from 'pinia';
import { ProviderRpcClient, Address } from 'everscale-inpage-provider';
import airdropAbi from '../../../build/EverAirdrop.abi.json';
import tip3Abi from '../../../build/Tip31Airdrop.abi.json';
import airdropTvc from '../../../build/EverAirdrop.base64?raw';
import tip3Tvc from '../../../build/Tip31Airdrop.base64?raw';
import distributerTvc from '../../../build/Distributer.base64?raw';
import tip3DistributerTvc from '../../../build/Tip31Distributer.base64?raw';
import { toNano, fromNano, getRandomNonce } from '@/utils';
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
			name: "transfer",
			inputs: [
				{name:"amount", type:"uint128"},
				{name:"recipient", type:"address"},
				{name:"deployWalletValue", type:"uint128"},
				{name:"remainingGasTo", type:"address"},
				{name:"notify", type:"bool"},
				{name:"payload", type:"cell"}
			],
			outputs: [
			]
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

const rootAbi = {
  'ABI version': 2,
  version: '2.2',
  header: ['pubkey', 'time', 'expire'],
  functions: [
    {
      name: 'walletOf',
      inputs: [
        { name: 'answerId', type: 'uint32' },
        { name: 'walletOwner', type: 'address' }
      ],
      outputs: [
        { name: 'value0', type: 'address' }
      ]
    },
    {
      name: 'symbol',
      inputs: [
        { name: 'answerId', type: 'uint32' }
      ],
      outputs: [
        { name: 'value0', type: 'string' }
      ]
    },
    {
      name: 'decimals',
      inputs: [
        { name: 'answerId', type: 'uint32' }
      ],
      outputs: [
        { name: 'value0', type: 'uint8' }
      ]
    }
  ],
  data: [],
  events: []
}

// const maxNumberOfAddresses = 3;
const maxNumberOfAddresses = 99;

export const useAirdropStore = defineStore({
  id: 'airdrop',
  state: () => ({
    address: null,
    deployOptions: {
      initParams: { _randomNonce: 0 },
      tvc: null,
    },
    lockDuration: new Date().toLocaleDateString(),
    topUpRequiredAmount: 0,
    loopCount: 0,
    currentBatch: 0,
    maxBatches: 0,
    abi: null,
    token: null,
    airdropsList: []
  }),
  getters: {},
  actions: {
    async getExpectedAddress(token) {
      console.log('token:', token);
      try {
        this.token = token;
        this.deployOptions.initParams._randomNonce = getRandomNonce();
        this.topUpRequiredAmount = 0;
        this.lockDuration = null;
        let address;
        if (token.label === 'EVER') {
          this.abi = airdropAbi;
          const { code } = await ever.splitTvc(distributerTvc);
          this.deployOptions.initParams['distributerCode'] = code;
          this.deployOptions.tvc = airdropTvc;
        } else {
          this.abi = tip3Abi;
          const { code } = await ever.splitTvc(tip3DistributerTvc);
          this.deployOptions.initParams['tip31distributerCode'] = code;
          this.deployOptions.tvc = tip3Tvc;
        }
        
        address = await ever.getExpectedAddress(this.abi, this.deployOptions);
        this.address = address._address;
      } catch (e) {
        console.log('e: ', e);
      }
    },
    async getGiverContract(recipientsListLength) {
      const walletStore = useWalletStore();
      const seconds = getSeconds(this.lockDuration);
      console.log('seconds:', seconds);
      try {
        const giverContract = await new ever.Contract(giverAbi, this.address);

        // const estimateFees = await giverContract.methods
        //   .sendTransaction({
        //     value: toNano(1, 9),
        //     dest: this.address,
        //     bounce: false,
        //   })
        //   .estimateFees({
        //     from: walletStore.profile.address,
        //     amount: toNano(1, 9),
        //     bounce: false,
        //   });

        // console.log('estimateFees: ', parseInt(estimateFees) / Math.pow(10, 9));

        this.loopCount = Math.floor(recipientsListLength / maxNumberOfAddresses);
        if (recipientsListLength % maxNumberOfAddresses !== 0) {
          this.loopCount++;
        }
        const amount = (recipientsListLength * 0.8) + 1 + ((this.loopCount - 1) * 0.5);
        console.log('rec:', recipientsListLength, amount);
        const sendTransaction = await giverContract.methods
          .sendTransaction({
            value: toNano(amount, 9),
            dest: this.address,
            bounce: false,
          })
          .send({
            from: walletStore.profile.address,
            amount: toNano(amount, 9),
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
    async deployContract(airdropName, totalTokens, totalRecipients, token) {
      const walletStore = useWalletStore();
      try {
        const everAirDropContract = await new ever.Contract(this.abi, new Address(this.address));
        // this.everAirDropContract = everAirDropContract;

        const providerState = await ever.getProviderState();
        const stateInit = await ever.getStateInit(this.abi, this.deployOptions);

        const publicKey = providerState.permissions.accountInteraction.publicKey;
        // const addresses = arr.map((address) => address.address);
        // const amounts = arr.map((amount) => toNano(amount.amount));

        console.log('token address', token.address);

        const data = token.label === 'EVER' ? {
          _contract_notes: airdropName,
          _refund_destination: walletStore.profile.address,
          // _addresses: addresses,
          // _amounts: amounts,
          _refund_lock_duration: getSeconds(this.lockDuration),
        } : {
          senderAddr: walletStore.profile.address,
          tokenRootAddr: token.address,
          _refund_lock_duration: getSeconds(this.lockDuration),
        };

        console.log('data:', data);

        const sendTransaction = await everAirDropContract.methods
          .constructor(data)
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
      if (this.token.label !== 'EVER') {
        this.topUpRequiredAmount = totalTokens;
      } else {
        this.loopCount = Math.floor(totalRecipients / maxNumberOfAddresses);
          if (totalRecipients % maxNumberOfAddresses !== 0) {
            this.loopCount++;
          }
        this.topUpRequiredAmount = totalTokens + ((this.loopCount - 1) * 0.5);
      }
      this.maxBatches = this.loopCount;
    },
    async topUp() {
      const walletStore = useWalletStore();
      try {
        const giverContract = await new ever.Contract(giverAbi, this.address);

        // console.log('this.topUpRequiredAmount + 0.5:', toNano(this.topUpRequiredAmount));
        let sendTransaction;
        if (this.token.label === 'EVER') {
          console.log('Ever!!!!');
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
          console.log('Not Ever!!!!');
          const rootAcc = new ever.Contract(rootAbi, this.token.address);
          const response = await rootAcc.methods
            .walletOf({
              answerId: 1,
              walletOwner: walletStore.profile.address
            }).call();
          console.log('rootAcc response:', response.value0._address);
          const userTokenWalletAddress = response.value0._address;
          const tokenWalletAddress = new Address(userTokenWalletAddress);
          const walletContract = new ever.Contract(giverAbi, tokenWalletAddress);
          sendTransaction = await walletContract.methods
            .transfer({
              amount: toNano(this.topUpRequiredAmount, this.token.decimals),
              recipient: this.address,
              deployWalletValue: toNano(0.5, 9),
              remainingGasTo: walletStore.profile.address,
              notify: true,
              payload: ''
            })
            .send({
              from: walletStore.profile.address,
              amount: toNano(0.8, 9),
              bounce: true,
            });
        }

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
        const amounts = arr.map((amount) => toNano(amount.amount, this.token.decimals));
        const chunkAddresses = chunk(addresses, maxNumberOfAddresses);
        console.log(chunkAddresses);
        const chunkAmounts = chunk(amounts, maxNumberOfAddresses);
        console.log(chunkAmounts);

        const everAirDropContract = await new ever.Contract(this.abi, new Address(this.address));

        let loopStart = isResumed ? this.currentBatch - 1 : 0;
        console.log('loopStart:', loopStart);

        let sendTransaction;
        let firstResumed = isResumed;
        for(let i=loopStart; i<this.loopCount; i++) {
          if (!firstResumed) {
            this.currentBatch++;
          }
          const totalAmount = chunkAmounts[i][1].reduce(
            (previousValue, currentValue) => previousValue + fromNano(currentValue, this.token.decimals),
            0
          );
          console.log('totalAmount:', totalAmount);
          console.log('totalAmount to nano', toNano(totalAmount, this.token.decimals));
          sendTransaction = await everAirDropContract.methods.distribute({
            _addresses: chunkAddresses[i][1],
            _amounts: chunkAmounts[i][1],
            _wid: 0,
            _totalAmount: toNano(totalAmount, this.token.decimals)
          }).send({
            from: walletStore.profile.address,
            amount: toNano(0.5, 9),
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
        const everAirDropContract = await new ever.Contract(this.abi, new Address(this.address));
        const sendTransaction = await everAirDropContract.methods.refund({}).send({
          from: walletStore.profile.address,
          amount: toNano(0.5, 9),
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
