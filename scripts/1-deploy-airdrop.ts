import { Contract, Signer } from "locklift";
import { FactorySource } from "../build/factorySource";
//const { setupTip31Airdrop } = require('./utils');
const {load} = require('csv-load-sync');
const {use} = require("chai");

const prompts = require('prompts');
const _ = require('underscore');
const fs  = require("fs");
const { parse } = require('csv-parse/lib/sync');
let airdrop: Contract<FactorySource["Airdrop"]>;
let user: Contract<FactorySource["Wallet"]>;
let tokenOwner: Contract<FactorySource["Wallet"]>;
let owner: Contract<FactorySource["Wallet"]>;
let root: Contract<FactorySource["TokenRoot"]>;

async function main() {
 	const response = await prompts([
        			{
            				type: 'text',
            				name: 'data',
            				message: 'Name of the csv file with airdrop addresses and amount, should be placed in the repo root',
            				initial: 'proba2.csv',
        			}
    			]);

	let records;

    	records = parse(fs.readFileSync(response.data));
    
	const addresses = records.map(i => i[0]);
	const amounts = records.map(i => parseInt(i[1], 10));
	let total =0;
	for(let i=0;i<amounts.length;i++)
	{
		total+=amounts[i];
	}
	console.log('Total amount: ', total);
  	//const codeDistributer = locklift.factory.getContractArtifacts("Tip31Distributer");
  	const refund_lock_duration = 120;
  	let accountsFactory = await locklift.factory.getAccountsFactory("Wallet");
	const _randomNonce = locklift.utils.getRandomNonce();
	const signer = (await locklift.keystore.getSigner("0"))!;
	console.log(addresses);
	
	function chunk(array, chunkSize) { 
  // Create a plain object for housing our named properties: row1, row2, ...rowN
  let output=[];
  // Cache array.length
  let arrayLength = array.length;
  // Loop variables
  let arrayIndex = 0, chunkOrdinal = 1;
  // Loop over chunks
  while (arrayIndex < arrayLength) {
    // Use slice() to select a chunk. Note the incrementing operations.
    output.push([chunkOrdinal++, array.slice(arrayIndex, arrayIndex += chunkSize)]);
  }
  return output;
}

const chunkAddresses = chunk(addresses, 99);
	console.log(chunkAddresses);
	const chunkAmounts = chunk(amounts, 99);
	console.log(chunkAmounts);
	//deploys future contract's owner
	const { account: tokenOwner } = await accountsFactory.deployNewAccount({
		constructorParams: {},
		initParams: {
				_randomNonce,
		},
		publicKey: signer.publicKey,
		value:locklift.utils.toNano(100)
		});
		//tokenOwner = account;
		tokenOwner.publicKey = signer.publicKey;
		console.log(`Account deployed at ${tokenOwner.address}`);
		//let nrOfRecipients = addresses.length;
		//console.log('Number of rec: ', nrOfRecipients);

		/*const { account:owner } = await accountsFactory.deployNewAccount({
								constructorParams: {},
								initParams: {
		    							_randomNonce,
								},
								publicKey: signer.publicKey,
								value:locklift.utils.toNano(15)
	    						});
    	//const owner = account;
    	owner.publicKey = signer.publicKey;
    	console.log(`Account deployed at ${owner.address}`);*/
		let nrOfRecipients = addresses.length;
		console.log('Number of rec: ', nrOfRecipients);
	//deploys EverAirdrop contract
	//const codeDistributer = locklift.factory.getContractArtifacts("Distributer");

	const sampleRootData = await locklift.factory.getContractArtifacts("TokenWallet");
  const { contract: root } = await locklift.factory.deployContract({
  		contract: "TokenRoot",
  		constructorParams: {
            initialSupplyTo: tokenOwner.address,
            initialSupply: 500000000,

            deployWalletValue: locklift.utils.toNano(1),
            mintDisabled: false,
            burnByRootDisabled: true,
            burnPaused: false,
            remainingGasTo: "0:0000000000000000000000000000000000000000000000000000000000000000",
        },
        initParams: {
            deployer_: "0:0000000000000000000000000000000000000000000000000000000000000000",
            randomNonce_: locklift.utils.getRandomNonce(),
            rootOwner_: tokenOwner.address,
            name_: 'Airdrop token',
            symbol_: 'AIRDROP_5',
            decimals_: 5,
            walletCode_: sampleRootData.code,
        },
        publicKey: tokenOwner.publicKey,
        value: locklift.utils.toNano(3),
        });
        console.log(root.address);
        //root = contract;

	const codeAirdrop = locklift.factory.getContractArtifacts("Airdrop");
   	const { contract, tx } = await locklift.factory.deployContract({
        				contract: "Airdrop",
        				publicKey: signer.publicKey,
        				initParams: {
        					_randomNonce: locklift.utils.getRandomNonce(),
						//distributerCode: codeDistributer.code,
        				},
        				constructorParams: {
             						_contract_notes: 'Airdrop_12345',
             						_refund_destination: tokenOwner.address,
             						_refund_lock_duration: refund_lock_duration,
             						_newCode: codeAirdrop.code,
             						_sender_address: tokenOwner.address,
             						//_token_root_address: "0:0000000000000000000000000000000000000000000000000000000000000000",
             						_token_root_address: root.address,
             						_number_of_recipients: nrOfRecipients,
             						_total_amount: total,
        				},
        				value: locklift.utils.toNano(5),
    					});
    	const airdrop = contract;
    	console.log(`Airdrop deployed at: ${airdrop.address.toString()}`);
		console.log('Token root address: ', root.address);
		for(let i=0;i<chunkAddresses.length;i++)
		{
		const setRecipients = await airdrop.methods.setRecipients({recipients: chunkAddresses[i][1]}).sendExternal({publicKey: tokenOwner.publicKey, withoutSignature: true});
		console.log('Set recipients: ', setRecipients);
		const setAmounts = await airdrop.methods.setAmounts({amounts: chunkAmounts[i][1]}).sendExternal({publicKey: tokenOwner.publicKey, withoutSignature: true});
		console.log('Set amounts: ', setAmounts);

		}
		//await locklift.giver.sendTo("0:102cf118b6875d201a3011d5dc17a358ee4d4333ad7e167824515171ed8f6f63", locklift.utils.toNano(50));
    	/*const batch = await airdrop.methods.batches({}).call();
    	console.log(batch);
    	let totalFileAmount=0;
    	for(let i=0;i<addresses.length;i++)
    	{
    		totalFileAmount+=amounts[i];
    	}
    	totalFileAmount = totalFileAmount/1000000000;
    	console.log(totalFileAmount);
    	await locklift.giver.sendTo(airdrop.address, locklift.utils.toNano(totalFileAmount));
        await locklift.giver.sendTo(owner.address, locklift.utils.toNano(100));
    	for(let i=0; i<chunkAddresses.length; i++)
 	{
 	let amounts = chunkAmounts[i][1];	
    	console.log(amounts);
    	let totAmount=0;			
    	for(let i=0;i<amounts.length;i++)
    	{
    		totAmount+=amounts[i];
    	}
    	console.log(totAmount);
    	const amount = chunkAddresses[i][1].length*0.06;
 	console.log(amount);*/
    	/*const distribution = await owner.runTarget({
    		contract: airdrop,
    		value: locklift.utils.toNano(amount),
    		publicKey: signer.publicKey,
    		},
    		airdrop =>
    			airdrop.methods.distribute({
    				_addresses: chunkAddresses[i][1],
    				_amounts: chunkAmounts[i][1],
    				_wid: 0,
    				_totalAmount: totAmount
    			}),
    	);
    	const message = await airdrop.methods.messageValue({}).call();
    	console.log(message);
    	//console.log(distribution);
    	const contracts = await airdrop.methods.getDistributedContracts({}).call();
    	console.log(contracts);*/
    	/*let maybe = 0;
 	if(amounts.length>1)
 	{
 		maybe = 0.02+(amounts.length*0.006);
 	}
 	else
 	{
 		maybe=0.02;
 	}
 	console.log('Maybe: ', maybe);
    	const addressesR = await owner.runTarget({
      					contract: airdrop,
    					value: locklift.utils.toNano(maybe),
    					publicKey: signer.publicKey,
    					},
    					airdrop =>
    						airdrop.methods.setRecipients({recipients: chunkAddresses[i][1]*/ /*["0:102cf118b6875d201a3011d5dc17a358ee4d4333ad7e167824515171ed8f6f63"]*//*,
    						amounts: chunkAmounts[i][1]*///}),
    						//);
    	//console.log(addressesR);
    	
    	/*const amountsR = await owner.runTarget({
    					contract: airdrop,
    					value: locklift.utils.toNano(maybe),
    					publicKey: signer.publicKey,
    					},
    					airdrop =>
    						airdrop.methods.setAmounts({amounts: chunkAmounts[i][1]*//*[20000000000]*//*}),
    		
    	);*/
    	//console.log(amountsR);
    	
    	
    	
    	//}
  	//call setupTip31Airdrop to deploy user and airdrop contract
  	//[user, airdrop] = await setupTip31Airdrop(codeDistributer.code, refund_lock_duration);
  	//const rootAddrVal = await airdrop.methods.getTokenRootAddrValue({addr: "0:0000000000000000000000000000000000000000000000000000000000000000"}).call();
  	//console.log(rootAddrVal);
  	/*const addressesS = await airdrop.methods.allRecipients({}).call();
  	const amountsS = await airdrop.methods.allAmounts({}).call();
  	console.log(addressesS.allRecipients.length);
  	console.log(amountsS.allAmounts.length);*/
  	//const constructorMV = await airdrop.mehtods.constructorMessValue({}).call();
  	//console.log(constructorMV);
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
