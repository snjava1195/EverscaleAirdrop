import { defineStore } from 'pinia';
import { ProviderRpcClient, Address } from 'everscale-inpage-provider';
import distributerTvc from '../../../build/Distributer.base64?raw';
import tip3DistributerTvc from '../../../build/Tip31Distributer.base64?raw';
import airdrop2Abi from '../../../build/Airdrop.abi.json';
import airdrop2Tvc from '../../../build/Airdrop.base64?raw';
import { toNano, fromNano, getRandomNonce } from '@/utils';
import { useWalletStore } from '@/stores/wallet';
import { getSeconds, chunk } from '@/utils';
import tokensList from '@/utils/tokens-list';
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
    lockDuration: new Date().toLocaleDateString(),
    topUpRequiredAmount: 0,
    loopCount: 0,
    currentBatch: 0,
    maxBatches: 0,
    abi: null,
    token: null,
    token_root_address: "",
    hash2: "",
    airdrops: null,
    airdropData: [],
    airdropsLoading: false,
    step: 1,
    fees: 0,
  }),
  getters: {},
  actions: {
    async getExpectedAddress(token) {
      console.log('token:', token);
       const walletStore = useWalletStore();
     
       const code2  = await ever.splitTvc(airdrop2Tvc);
       //(code2);
       this.hash2 = await ever.setCodeSalt({code: code2.code, salt: { structure: [{name:'ownerAddress', type: 'address'}], data: {ownerAddress: walletStore.profile.address}}});
      
      try {
        this.token = token;
        this.deployOptions.initParams._randomNonce = getRandomNonce();
        this.topUpRequiredAmount = 0;
        this.lockDuration = null;
        let address;
        this.abi = airdrop2Abi;
        this.deployOptions.tvc = airdrop2Tvc;
        if (token.label === 'EVER') {
        //  this.abi = airdropAbi;
          const { code } = await ever.splitTvc(distributerTvc);
          this.deployOptions.initParams['distributerCode'] = code;
          this.token_root_address="0:0000000000000000000000000000000000000000000000000000000000000000";
         // this.deployOptions.tvc = airdropTvc;
        } else {
        //  this.abi = tip3Abi;
          const { code } = await ever.splitTvc(tip3DistributerTvc);
          this.deployOptions.initParams['distributerCode'] = code;
          this.token_root_address = token.address;
          
         // this.deployOptions.tvc = tip3Tvc;
        }
        
      //  console.log(this.deployOptions.initParams);

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
       // console.log('rec:', recipientsListLength, amount);
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
        walletStore.getBalance();
        return Promise.resolve(sendTransaction);
      } catch (e) {
        console.log(e);
        return Promise.reject(e);
      }
    },

    async calculateFees(method, contract, tokenLabel, arr)
    {
      const walletStore = useWalletStore();
      let sendTransaction;
      if(contract == "giver")
      {
        const giverContract = new ever.Contract(giverAbi, this.address);
        
        if(method=="deploy")
        {
          
          if(tokenLabel=='EVER')
          {
            
            sendTransaction = await giverContract.methods.sendTransaction({
              value: toNano(0.5, 9),
              dest: this.address,
              bounce: bounce,
            }).estimateFees({from: walletStore.profile.address, amount: toNano(0.5, 9)});
            this.fees = fromNano(sendTransaction, 9);
            console.log('Transaction fees: ', this.fees);
          }
          else
          {
             sendTransaction = await giverContract.methods.sendTransaction({
              value: toNano(1.5, 9),
              dest: this.address,
              bounce: bounce,
            }).estimateFees({from: walletStore.profile.address, amount: toNano(1.5, 9)});
            this.fees = fromNano(sendTransaction, 9);
            console.log('Transaction fees: ', this.fees);
          }
        }
        else
        {
          sendTransaction = await giverContract.methods
            .sendTransaction({
              value: toNano(1, 9),
              dest: this.address,
              bounce: false,
            })
            .estimateFees({from: walletStore.profile.address, amount: toNano(this.topUpRequiredAmount, 9)});
            this.fees = fromNano(sendTransaction, 9);
            console.log('Transaction fees: ', this.fees);
        }
      }
      else
      {
        const everAirDropContract = new ever.Contract(this.abi, new Address(this.address));
        if(method=="distribute")
        {
          const addresses = arr.map((address) => address.address);
       // console.log('Mapirane adrese:', addresses);

        const amounts = arr.map((amount) => toNano(amount.amount, this.token.decimals));
       // console.log('Mapirane amounts:', amounts);
        const chunkAddresses = chunk(addresses, maxNumberOfAddresses);
       // console.log('Cankovane adrese', chunkAddresses);
        const chunkAmounts = chunk(amounts, maxNumberOfAddresses);
        for(let i=0; i<this.loopCount; i++) {
        const totalAmount = chunkAmounts[i][1].reduce(
          (previousValue, currentValue) => previousValue + fromNano(currentValue, this.token.decimals),
          0
        );
          sendTransaction = await everAirDropContract.methods.distribute({
            _addresses: chunkAddresses[i][1],
            _amounts: chunkAmounts[i][1],
            _wid: 0,
            _totalAmount: toNano(totalAmount, this.token.decimals)
          }).estimateFees({from: walletStore.profile.address, amount: toNano(0.8, 9)});
          this.fees = fromNano(sendTransaction,9);
          console.log('Transaction fees: ', this.fees);
        }
        }
        else if(method=="redeem")
        {
          sendTransaction = await everAirDropContract.methods.refund({}).estimateFees({from: walletStore.profile.address, amount: toNano(0.5, 9)});
          this.fees = fromNano(sendTransaction,9);
          console.log('Transaction fees: ', this.fees);
        }
      }
    },

    
      async getGiverContract2(tokenLabel, recipientsListLength)
    {
      try {
        const giverContract = new ever.Contract(giverAbi, this.address);
        const walletStore = useWalletStore();
        let sendTransaction;
        this.loopCount = Math.floor(recipientsListLength / maxNumberOfAddresses);
        if (recipientsListLength % maxNumberOfAddresses !== 0) {
          this.loopCount++;
        }
        let amountForSetting=0;
        if(recipientsListLength==1)
        {
          amountForSetting = 0.02;
        }
        else 
        {
          amountForSetting = 0.02+((recipientsListLength*0.006)*2);
        }
        /*for(let i=0;i<this.loopCount;i++)
        { console.log(recipientsListLength);
          if(recipientsListLength==1)
          {
            amountForSetting += 0.02;
           // console.log('Usao u jednog');
          }
          else if(recipientsListLength%maxNumberOfAddresses==0)
          {
            amountForSetting += 0.02+(maxNumberOfAddresses*0.006*2);
           // console.log('Usao u 99');
          }
          else if(recipientsListLength<maxNumberOfAddresses)
          {
            console.log('Usao u manje od 99');
            amountForSetting += 0.02+(recipientsListLength *0.006*2);
          }
          else if(recipientsListLength%99!=0)
          {
            amountForSetting += 0.02+((recipientsListLength-(i+1)*99)*0.006*2);
          }
        }*/
        console.log('Amount for setting: ', amountForSetting);
        //if(th)
        if(tokenLabel=='EVER')
        {
          const trx = await giverContract.methods.sendTransaction({
            value: toNano((0.5+amountForSetting), 9),
            dest: this.address,
            bounce: false,
          }).estimateFees({from: walletStore.profile.address, amount: toNano(0.5, 9)});
          this.fees = fromNano(trx, 9);
          console.log('Transaction fees: ', this.fees);

        sendTransaction = await giverContract.methods
          .sendTransaction({
            value: toNano((0.5+amountForSetting), 9),
            dest: this.address,
            bounce: false,
          })
          .send({
            from: walletStore.profile.address,
            amount: toNano((0.5+amountForSetting), 9),
            bounce: false,
          });

         
        }
        else
        {
          const trx = await giverContract.methods.sendTransaction({
            value: toNano((1.5+amountForSetting), 9),
            dest: this.address,
            bounce: false,
          }).estimateFees({from: walletStore.profile.address, amount: toNano(0.5, 9)});
          this.fees = fromNano(trx, 9);
          console.log('Transaction fees: ', this.fees);

          sendTransaction = await giverContract.methods
          .sendTransaction({
            value: toNano((1.5+amountForSetting), 9),
            dest: this.address,
            bounce: false,
          })
          .send({
            from: walletStore.profile.address,
            amount: toNano((1.5+amountForSetting), 9),
            bounce: false,
          });
        }
          console.log('giverContract: ', giverContract);
          console.log('sendTransaction: ', sendTransaction);
          walletStore.getBalance();
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

        const data = /*token.label === 'EVER' ?*/ {
          _contract_notes: airdropName,
          _refund_destination: walletStore.profile.address,
          _refund_lock_duration: getSeconds(this.lockDuration),
          _newCode: this.hash2.code,
          _sender_address: walletStore.profile.address,
          _token_root_address: this.token_root_address,
          _number_of_recipients: totalRecipients,
          _total_amount: toNano(totalTokens,9),
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
        /*  if(sendTransaction.transaction.aborted==false)
          {
          this.creationTimes.push(sendTransaction.transaction.createdAt);
          console.log('Usao u creation times: ', this.creationTimes);
          }
          console.log(sendTransaction.transaction.createdAt);*/

        this.getRequiredAmount(totalTokens, totalRecipients);

        console.log('sendTransaction: ', sendTransaction);
        walletStore.getBalance();
        return Promise.resolve(sendTransaction);
      } catch (e) {
        console.log(e);
        return Promise.reject(e);
      }
    },

    async setRecipients(arr)
    {
      const walletStore = useWalletStore();
      try {
        const addresses = arr.map((address) => address.address);
        const amounts = arr.map((amount) => toNano(amount.amount, this.token.decimals));
        const chunkAddresses = chunk(addresses, maxNumberOfAddresses);
       // console.log(chunkAddresses);
        const chunkAmounts = chunk(amounts, maxNumberOfAddresses);
      //  console.log(chunkAmounts);

        const everAirDropContract = new ever.Contract(this.abi, new Address(this.address));
        //console.log('Address: ', this.address);
        let loopStart = 0;
        //console.log('loopStart:', loopStart);
        
        let sendTransaction;
        console.log('Loop start:', loopStart);
        console.log('Loop count: ', this.loopCount);
        const providerState = await ever.getProviderState();
        const publicKey = providerState.permissions.accountInteraction.publicKey;
          
       // let firstResumed = isResumed;
        for(let i=loopStart; i<this.loopCount; i++) {
         
          //const totalAmount = chunkAmounts[i][1].reduce(
            //(previousValue, currentValue) => previousValue + fromNano(currentValue, this.token.decimals),
            //0
          //);
         // const sendTransactionAmount = chunkAmounts[i][1].length*0.1;
          //console.log('totalAmount:', totalAmount);
          //console.log('totalAmount to nano', toNano(totalAmount, this.token.decimals));
          let amount = 0;
          if(chunkAddresses[i][1].length>1)
          {
            amount = 0.02+(chunkAddresses[i][1].length*0.006);
            console.log(amount);
          }
          else
          {
            amount = chunkAddresses[i][1].length*0.02;
          }
          sendTransaction = await everAirDropContract.methods.setRecipients({recipients: chunkAddresses[i][1]}).sendExternal({publicKey: publicKey, withoutSignature: true});
          const recipients = await everAirDropContract.methods.allRecipients({}).call();
          console.log('Recipients:', recipients);
          /*sendTransaction = await everAirDropContract.methods.setRecipients({
            recipients: chunkAddresses[i][1]
          }).send({
            from: walletStore.profile.address,
            amount: toNano(amount, 9),
            bounce: true,
          });*/
          console.log(sendTransaction);
         // firstResumed = false;
          // const futureEvent = await everAirDropContract.waitForEvent({ filter: event => event.event === "StateChanged" });
          // console.log(futureEvent);
        }

        // const sendTransaction = await everAirDropContract.methods.distribute({}).send({
        //   from: walletStore.profile.address,
        //   amount: toNano(0.5),
        //   bounce: true,
        // });

        console.log('distribute:', sendTransaction);
        walletStore.getBalance();
        return Promise.resolve(sendTransaction);
      } catch (e) {
        console.log(e);
        return Promise.reject(e);
      }

    },

    async setAmounts(arr)
    {
      const walletStore = useWalletStore();
      try {
        const addresses = arr.map((address) => address.address);
        const amounts = arr.map((amount) => toNano(amount.amount, this.token.decimals));
        const chunkAddresses = chunk(addresses, maxNumberOfAddresses);
        //console.log(chunkAddresses);
        const chunkAmounts = chunk(amounts, maxNumberOfAddresses);
      //  console.log(chunkAmounts);

        const everAirDropContract = new ever.Contract(this.abi, new Address(this.address));
       // console.log('Address: ', this.address);
        let loopStart = 0;
     //   console.log('loopStart:', loopStart);
        
        let sendTransaction;
        const providerState = await ever.getProviderState();
          const publicKey = providerState.permissions.accountInteraction.publicKey;
          
       // let firstResumed = isResumed;
        for(let i=loopStart; i<this.loopCount; i++) {
         
          //const totalAmount = chunkAmounts[i][1].reduce(
            //(previousValue, currentValue) => previousValue + fromNano(currentValue, this.token.decimals),
            //0
          //);
         // const sendTransactionAmount = chunkAmounts[i][1].length*0.1;
          //console.log('totalAmount:', totalAmount);
          //console.log('totalAmount to nano', toNano(totalAmount, this.token.decimals));
          let amount = 0;
          if(chunkAddresses[i][1].length>1)
          {
            amount = 0.02+(chunkAddresses[i][1].length*0.006);
          }
          else
          {
            amount = chunkAddresses[i][1].length*0.02;
          }
          sendTransaction = await everAirDropContract.methods.setAmounts({amounts: chunkAmounts[i][1]}).sendExternal({publicKey: publicKey, withoutSignature:true});
          const amounts = await everAirDropContract.methods.allAmounts({}).call();
          console.log('Amounts: ', amounts);
          /*sendTransaction = await everAirDropContract.methods.setAmounts({
            amounts: chunkAmounts[i][1]
          }).send({
            from: walletStore.profile.address,
            amount: toNano(amount, 9),
            bounce: true,
          });*/
         // firstResumed = false;
          // const futureEvent = await everAirDropContract.waitForEvent({ filter: event => event.event === "StateChanged" });
          // console.log(futureEvent);
        }

        // const sendTransaction = await everAirDropContract.methods.distribute({}).send({
        //   from: walletStore.profile.address,
        //   amount: toNano(0.5),
        //   bounce: true,
        // });

        console.log('distribute:', sendTransaction);
        walletStore.getBalance();
        return Promise.resolve(sendTransaction);
      } catch (e) {
        console.log(e);
        return Promise.reject(e);
      }

    },

    async getRequiredAmount(totalTokens, totalRecipients) {
      console.log('Total tokens', totalTokens);
      console.log('Total recipients', totalRecipients);
      if (this.token.label !== 'EVER') {
        this.topUpRequiredAmount = totalTokens;
      //  console.log('Nije Ever usao');
      } else {
        this.loopCount = Math.floor(totalRecipients / maxNumberOfAddresses);
          if (totalRecipients % maxNumberOfAddresses !== 0) {
            this.loopCount++;
          }
        this.topUpRequiredAmount = totalTokens + ((this.loopCount - 1) * 0.5);
      //  console.log('Je ever usao');
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
         // console.log('Ever!!!!');
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
         // console.log('Not Ever!!!!');
          const rootAcc = new ever.Contract(rootAbi, this.token.address);
          const response = await rootAcc.methods
            .walletOf({
              answerId: 1,
              walletOwner: walletStore.profile.address
            })
            .call();
          console.log('rootAcc response:', response.value0._address);
          const userTokenWalletAddress = response.value0._address;
          const tokenWalletAddress = new Address(userTokenWalletAddress);
          const walletContract = new ever.Contract(giverAbi, tokenWalletAddress);
          sendTransaction = await walletContract.methods
            .transfer({
              amount: toNano(this.topUpRequiredAmount, this.token.decimals),
              recipient: this.address,
              deployWalletValue: 0,//toNano(0.5, 9),
              remainingGasTo: walletStore.profile.address,
              notify: true,
              payload: ''
            })
            .send({
              from: walletStore.profile.address,
              amount: toNano(0.5, 9),
              bounce: true,
            });
            
        }

        
        walletStore.getBalance();
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
       // console.log('Mapirane adrese:', addresses);

        const amounts = arr.map((amount) => toNano(amount.amount, this.token.decimals));
       // console.log('Mapirane amounts:', amounts);
        const chunkAddresses = chunk(addresses, maxNumberOfAddresses);
       // console.log('Cankovane adrese', chunkAddresses);
        const chunkAmounts = chunk(amounts, maxNumberOfAddresses);
       // console.log('Cankovani amounti', chunkAmounts);

        const everAirDropContract = await new ever.Contract(this.abi, new Address(this.address));
        const deployed = await everAirDropContract.methods.getDeployedContracts({}).call();
       // console.log('Address: ', this.address);
        //let loopStart = isResumed ? this.currentBatch - 1 : 0;
        let loopStart = deployed.value0.length;
        //console.log('loopStart:', loopStart);
        
          this.currentBatch=loopStart;
        
        
        
        let sendTransaction;
        let firstResumed = isResumed;
        for(let i=loopStart; i<this.loopCount; i++) {
          //if (!firstResumed) {
            this.currentBatch++;
          //}
          const totalAmount = chunkAmounts[i][1].reduce(
            (previousValue, currentValue) => previousValue + fromNano(currentValue, this.token.decimals),
            0
          );
         // const sendTransactionAmount = chunkAmounts[i][1].length*0.1;
         // console.log('totalAmount:', totalAmount);
          //console.log('totalAmount to nano', toNano(totalAmount, this.token.decimals));
          if (this.token.label === 'EVER')
          {
          sendTransaction = await everAirDropContract.methods.distribute({
            _addresses: chunkAddresses[i][1],
            _amounts: chunkAmounts[i][1],
            _wid: 0,
            _totalAmount: toNano(totalAmount, this.token.decimals)
          }).send({
            from: walletStore.profile.address,
            amount: toNano(1, 9),
            bounce: true,
          });
          firstResumed = false;
        }
        else
        {
          let fee;
          if(chunkAddresses[i][1].length ==1)
          {
            fee = 0.08;
            console.log('Fee: ', fee);
          }
          else
          {
            fee = 0.5+(chunkAddresses[i][1].length*0.08);
            console.log('Fee: ', fee);
          }
          sendTransaction = await everAirDropContract.methods.distribute({
            _addresses: chunkAddresses[i][1],
            _amounts: chunkAmounts[i][1],
            _wid: 0,
            _totalAmount: toNano(totalAmount, this.token.decimals)
          }).send({
            from: walletStore.profile.address,
            amount: toNano(fee, 9),
            bounce: true,
          });
          firstResumed = false;
        }
          // const futureEvent = await everAirDropContract.waitForEvent({ filter: event => event.event === "StateChanged" });
          // console.log(futureEvent);
        }

        // const sendTransaction = await everAirDropContract.methods.distribute({}).send({
        //   from: walletStore.profile.address,
        //   amount: toNano(0.5),
        //   bounce: true,
        // });

        console.log('distribute:', sendTransaction);
        walletStore.getBalance();
        return Promise.resolve(sendTransaction);
      } catch (e) {
        console.log(e);
        return Promise.reject(e);
      }
    },
    async redeemFunds() {
      const walletStore = useWalletStore();
      const airdropStore = useAirdropStore();
      let sendTransaction;
      try {
        const everAirDropContract = await new ever.Contract(this.abi, new Address(this.address));
        if (this.token.label === 'EVER')
          {
        sendTransaction = await everAirDropContract.methods.refund({}).send({
          from: walletStore.profile.address,
          amount: toNano(0.5, 9),
          bounce: false,
        });
      }
      else
      {
        sendTransaction = await everAirDropContract.methods.refund({}).send({
          from: walletStore.profile.address,
          amount: toNano(airdropStore.loopCount*0.1+0.1, 9),
          bounce: false,
        });
      }
        console.log('redeemFunds:', sendTransaction);
        walletStore.getBalance();
        return Promise.resolve(sendTransaction);
      } catch (e) {
        console.log(e);
        return Promise.reject(e);
      }
    },
    getAirdrops() {
      // Treba da se zove neka funkcija koja daje sve airdropove (kontrakte) sa walleta logovanog usera
    },

    async getAirdropTransactions(limit, page) {
     // const transactions = await ever.getTransactions({address:"0:b7fc4427d121e5449518b863dbc0633ad591aa5f98dd03e6fa40c2294ce70233", limit: 10});
     // console.log(transactions);
      const walletStore = useWalletStore();
      const existingPage = walletStore.getExistingPage(page);
     // console.log('Existing page', existingPage);
      let accounts;
      this.airdropsLoading = true;
      if (page > walletStore.currentPage) {
        if (existingPage !== undefined) {
          walletStore.continuation = existingPage.continuation;
        }
      } else {
        await walletStore.getPagination(page);
      }
      this.currentPage = page;
      try {
        
        const codeEver = await ever.splitTvc(airdrop2Tvc);
       // console.log(codeEver);
        const hashEver = await ever.setCodeSalt({ code: codeEver.code, salt: { structure: [{ name: 'ownerAddress', type: 'address' }], data: { ownerAddress: walletStore.profile.address } } });
        const bocHashEver = await ever.getBocHash(hashEver.code);
        const paginationObject = { codeHash: bocHashEver, limit: limit }
       // console.log('Page:', page);
        if(page>1)
        {
          paginationObject.continuation = walletStore.continuation; 
        }

        accounts = await ever.getAccountsByCodeHash(paginationObject);

        this.airdrops =accounts;
        
        
       // console.log(this.airdrops);
       // console.log(this.airdrops.accounts);
        this.airdropData=[];
        for (let i = 0; i < this.airdrops.accounts.length; i++) {

          const contract = new ever.Contract(airdrop2Abi, this.airdrops.accounts[i]._address);
          const names = await contract.methods.contract_notes({}).call();
          const status = await contract.methods.status({}).call();
          const recipientsNr = await contract.methods.recipientNumber({}).call();
          const totalAmount = await contract.methods.totalAmount({}).call();
          const date = await contract.methods.creationDate({}).call();
          const batches = await contract.methods.batches({}).call();
          const distributed = await contract.methods.getDistributedContracts({}).call();
          const tokenAddress = await contract.methods.tokenRootAddress({}).call();
          
         // console.log('Token list:', tokensList);
         // console.log('Token root address: ', tokenAddress.tokenRootAddress);
          let tokensLabel = "";
          let icon ="";
          let token=null;
          
            if(tokenAddress.tokenRootAddress._address=="0:0000000000000000000000000000000000000000000000000000000000000000")
            {
             token = tokensList.find(token=>token.label=='EVER');
              tokensLabel = token.label;
              icon = token.icon;
              //console.log('Usao u ever');
            }
            else //if(tokenAddress.tokenRootAddress._address==tokensList[i].address)
            {
             token = tokensList.find(token=>token.address == tokenAddress.tokenRootAddress._address);
              tokensLabel = token.label;
              icon = token.icon;
            //  console.log('Usao u tip3', icon);
            }
          
          let workDone = "";//status.status + " " + distributed.value0.length + "/" + batches.batches;
          if(batches.batches==1)
          {
            workDone = status.status + " " + distributed.value0.length *recipientsNr.recipientNumber +"/" + batches.batches*recipientsNr.recipientNumber;
          }
          else if(batches.batches>1)
          {
            workDone = status.status + " " + distributed.value0.length * maxNumberOfAddresses + "/" + recipientsNr.recipientNumber;
          }
          //const workDone = status.status + " " + distributed.value0.length + "/" + batches.batches;
          let finalStatus=""
          const balanceAfterDeploy = await ever.getBalance(this.airdrops.accounts[i]._address);
          
          if(status.status == "Deployed")
          {
            if(fromNano(balanceAfterDeploy, 9)>(fromNano(totalAmount.totalAmount,9)+0.4))
            {
              finalStatus = "Preparing";
            }
            else
              finalStatus = status.status;
          }
          else if(status.status=="Executing")
          {
            finalStatus=workDone;
          }
          else
          {
            //const executedBalance = await ever.getBalance(this.airdrops.accounts[i]._address);
            //if(fromNano(executedBalance, 9)==0)
            //{
            //  finalStatus = "Redeemed";
            //}
            //else
            //{
            finalStatus = status.status;
            //}
          }
        
          //console.log(finalStatus);
          //console.log(names);
          //console.log(date);
         // console.log(this.airdrops.accounts[0]._address);
          let createdStatus = "";
          if(status.status!="Executed")
          {
            createdStatus = "Created";
          }
          else
          {
            createdStatus="Executed";
          }
          this.airdropData.push({
                                      airdropName:names.contract_notes, 
                                      status: finalStatus, 
                                      //status: "Deployed",
                                      amount: fromNano(totalAmount.totalAmount,token.decimals),
                                      recipientsNumber: recipientsNr.recipientNumber,
                                      dateCreated: date.creationDate,
                                      statusCreated: createdStatus,
                                      address: this.airdrops.accounts[i]._address,
                                      tokenLabel: tokensLabel,
                                      tokenIcon: icon,
                                    });
        }
        console.log(accounts);
       


        //address: accounts.accounts,
        //...(Object.keys(accounts.continuation).length !== 0 && {
        //  continuation: { hash: accounts.continuation.hash, lt: accounts.continuation.lt },
        //}),
        //limit: limit,
        // });
        const existingPage = walletStore.getExistingPage(walletStore.nextPage);
        //console.log('Existing page: ', existingPage);
        if (existingPage === undefined) {
          if(accounts.length<limit)
          {
          //const idx = walletStore.findIndex(p=>p.page==page);
          await walletStore.updatePagination(walletStore.nextPage, undefined);
          }
          else
          {
            const temp = { 
              codeHash: bocHashEver, 
              limit: limit,
              continuation: accounts.continuation

            }
            const accByCodeHash = await ever.getAccountsByCodeHash(temp);
            if(accByCodeHash.length!=0)
            {
              await walletStore.updatePagination(walletStore.nextPage, this.airdrops.continuation);
            }
            
            //console.log('existing page undefined');
          }
      }
        
        this.airdropsLoading = false;
        //await this.setAirdropData();
      } catch (e) {
        console.log('e: ', e);
        this.airdropsLoading = false;
      }
      //console.log(this.airdrops);
    },

    async getEstimatedFee()
    {
      const walletStore = useWalletStore();
      const fees = await ever.estimateFees( walletStore.profile.address, this.address, 1000000000, {abi: airdrop2Abi, method: "constructor", params: ["0:a49cd4e158a9a15555e624759e2e4e766d22600b7800d891e46f9291f044a93d"]});
      console.log('Fees: ', fees);
    },
  },
});
