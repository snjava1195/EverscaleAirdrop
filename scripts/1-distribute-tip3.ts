import { Contract, Signer } from "locklift";
import { FactorySource } from "../build/factorySource";

const prompts = require('prompts');
const _ = require('underscore');
const fs  = require("fs");
const { parse } = require('csv-parse/lib/sync');
const {load} = require('csv-load-sync');

let root: Contract<FactorySource["TokenRoot"]>;
let airdrop: Contract<FactorySource["Tip31Airdrop"]>;
let user: Contract<FactorySource["Wallet"]>;
let distributer: Contract<FactorySource["Tip31Distributer"]>;
let distributer1: Contract<FactorySource["Tip31Distributer"]>;
let distributer2: Contract<FactorySource["Tip31Distributer"]>;
let distributer3: Contract<FactorySource["Tip31Distributer"]>;
let distributer4: Contract<FactorySource["Tip31Distributer"]>;
let distributer5: Contract<FactorySource["Tip31Distributer"]>;
let distributer6: Contract<FactorySource["Tip31Distributer"]>;
let signer: Signer;
let owner: Contract<FactorySource["Wallet"]>;


async function main() {
	const response = await prompts([
        {
            type: 'text',
            name: 'data',
            message: 'Name of the csv file with airdrop addresses and amount, should be placed in the repo root',
            initial: 'proba.csv',
        }
    ]);
    
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
	let records;

    	records = parse(fs.readFileSync(response.data));
	const addresses = records.map(i => i[0]);
	const amounts = records.map(i => parseInt(i[1], 10));

	//array of chunks (99 recipient per chunk)
	const chunkAddresses = chunk(addresses, 2);
	console.log(chunkAddresses);
	
	//array of chunk amounts
	const chunkAmounts = chunk(amounts, 2);
	console.log(chunkAmounts);
	const _randomNonce = locklift.utils.getRandomNonce();
	const accountFactory = locklift.factory.getAccountsFactory("Wallet");
	signer = (await locklift.keystore.getSigner("0"))!;
	
	/*********************Get root***********************/
	root = await locklift.factory.getDeployedContract(
  	"TokenRoot", // name of your contract
  	"0:a50def2df0f7f531b82b7ffec7baf8e7ce4279605726b94927c9ee6ded09f5c2",
	);
	console.log(`Token root: ${root.address}`);
	
	/*********************Get root owner***********************/
	
	owner = 				accountFactory.getAccount("0:82b691ef4e8e2bd754c76e167bb09bd0125a9e80979ced10b33d43d45f2d874c", signer.publicKey);
  	console.log(`Owner: ${owner.address}`);
  	
	/*********************User deploy***************************/
	
	/*const {account} = await accountFactory.deployNewAccount({
  		value: locklift.utils.toNano(3),
  		publicKey: signer.publicKey,
  		initParams: {
  			_randomNonce: locklift.utils.getRandomNonce(),
  		},
  		constructorParams: {},
  		});
  	user = account;
    	user.publicKey = signer.publicKey;
    	user.name = 'Regular user';*/
    	
    	user = 				accountFactory.getAccount("0:7448b7233c21968949be3ba5fc0c1521dfd3ac81f33cee70836bd72620258c55", signer.publicKey);
  	console.log(`User: ${user.address}`);
    	
    	await locklift.giver.sendTo(user.address, locklift.utils.toNano(100));
    	 
  	const codeDistributer = locklift.factory.getContractArtifacts("Tip31Distributer");
  	
  	/*********************Deploy airdrop***********************/
  	/*const { contract: airdrop, tx } = await locklift.factory.deployContract({
        contract: "Tip31Airdrop",
        constructorParams: {
            senderAddr: user.address,
            tokenRootAddr: root.address,
        },
        initParams: {
            _randomNonce,
            tip31distributerCode: codeDistributer.code
            
        },
        publicKey: signer.publicKey,
        value: locklift.utils.toNano(10),
   	});*/
   	
   		airdrop = await locklift.factory.getDeployedContract(
  	"Tip31Airdrop", // name of your contract
  	"0:baea7204c3c9c074b7d5f5567f174647b7868d749ab7dbc397deb5711bf20409",
	);
	console.log(`Token root: ${airdrop.address}`);
    
    
    	await locklift.giver.sendTo(airdrop.address, locklift.utils.toNano(100));
    
    	console.log("Airdrop address:");
    	console.log(airdrop.address);
    	
    	/*const key = await airdrop.methods.getPubKey({}).call();
    	console.log("Airdrop public key:");
    	console.log(key);*/
    	
    	await locklift.giver.sendTo(owner.address, locklift.utils.toNano(100));
    	
    	/************************Mint tokens to airdrop***********************/
    	/*await owner.runTarget({
  		contract: root,
    		value: locklift.utils.toNano(2.2),
    		publicKey: signer.publicKey,
    		},
    		root =>
    			root.methods.mint({ 
    				amount: locklift.utils.toNano(100), 
    				recipient: airdrop.address, 
    				deployWalletValue: locklift.utils.toNano(1), 
    				remainingGasTo: airdrop.address, 
    				notify: false, 
    				payload: '', 
    				}),
    		);*/
    		
    	/*********************Start distribution***********************/	
    	for(let i=0; i<chunkAddresses.length; i++)
 	{
 		let totAmount=0;
 		const amountsArray = chunkAmounts[i][1];
 		for(let i=0;i<amountsArray.length;i++)
 		{
 			totAmount+=amountsArray[i];
 		}
 		console.log(totAmount);	
  	await user.runTarget(
  	{
  		contract: airdrop,
    		value: locklift.utils.toNano(2.1),
  	},
  		airdrop =>
  			airdrop.methods.multiTransfer({
  			recipients: chunkAddresses[i][1],
            		amounts: chunkAmounts[i][1], 
            		totalAmount: totAmount}),
  		);
  		
  		}
  	
  	const details = await airdrop.methods.getDetails({}).call();
  	const distributed = await airdrop.methods.getDistributers({}).call();
    	console.log("Airdrop details:");
    	console.log(details);
    	console.log("Deployed distributers: ");
    	console.log(distributed);
    	
    	/**********************Get distributer details************************/
    /*	const callback = await user.runTarget(
 	{
 		contract: airdrop,
 		value: locklift.utils.toNano(2.1),
 	},   	
 	airdrop =>
 		airdrop.methods.triggerDistributer({}),
 	);
 	*/
 	
    	distributer = await locklift.factory.getDeployedContract(
  	"Tip31Distributer", 
  	distributed.value0[0]
	);
	
	distributer1 = await locklift.factory.getDeployedContract(
  	"Tip31Distributer", 
  	distributed.value0[1]
	);
	distributer2 = await locklift.factory.getDeployedContract(
  	"Tip31Distributer", 
  	distributed.value0[2]
	);
/*	distributer3 = await locklift.factory.getDeployedContract(
  	"Tip31Distributer", 
  	distributed.value0[3]
	);
	distributer4 = await locklift.factory.getDeployedContract(
  	"Tip31Distributer", 
  	distributed.value0[4]
	);
	distributer5 = await locklift.factory.getDeployedContract(
  	"Tip31Distributer", 
  	distributed.value0[5]
	);
	distributer6 = await locklift.factory.getDeployedContract(
  	"Tip31Distributer", 
  	distributed.value0[6]
	);*/
	console.log(`Token root: ${distributer.address}`);
	
  	const ownerTokenWalletAddress = await root.methods.walletOf({answerId: 4, walletOwner: distributed.value0[0]}).call();
  	console.log(`User's token wallet: ${ownerTokenWalletAddress.value0}`);
  	const ownerTokenWallet = await locklift.factory.getDeployedContract("TokenWallet", ownerTokenWalletAddress.value0);
  	const balanceWallet = await ownerTokenWallet.methods.balance({answerId:0}).call();
  	console.log(`Distributers balance: ${balanceWallet.value0}`);
  	
  	const ownerTokenWalletAddress1 = await root.methods.walletOf({answerId: 4, walletOwner: distributed.value0[1]}).call();
  	console.log(`User's token wallet: ${ownerTokenWalletAddress1.value0}`);
  	const ownerTokenWallet1 = await locklift.factory.getDeployedContract("TokenWallet", ownerTokenWalletAddress1.value0);
  	const balanceWallet1 = await ownerTokenWallet1.methods.balance({answerId:0}).call();
  	console.log(`Distributers balance: ${balanceWallet1.value0}`);
  	
  	const ownerTokenWalletAddress2 = await root.methods.walletOf({answerId: 4, walletOwner: distributed.value0[2]}).call();
  	console.log(`User's token wallet: ${ownerTokenWalletAddress2.value0}`);
  	const ownerTokenWallet2 = await locklift.factory.getDeployedContract("TokenWallet", ownerTokenWalletAddress2.value0);
  	const balanceWallet2 = await ownerTokenWallet2.methods.balance({answerId:0}).call();
  	console.log(`Distributers balance: ${balanceWallet2.value0}`);
  	
  /*	const ownerTokenWalletAddress3 = await root.methods.walletOf({answerId: 4, walletOwner: distributed.value0[3]}).call();
  	console.log(`User's token wallet: ${ownerTokenWalletAddress3.value0}`);
  	const ownerTokenWallet3 = await locklift.factory.getDeployedContract("TokenWallet", ownerTokenWalletAddress3.value0);
  	const balanceWallet3 = await ownerTokenWallet3.methods.balance({answerId:0}).call();
  	console.log(`Distributers balance: ${balanceWallet3.value0}`);
  	
  	const ownerTokenWalletAddress4 = await root.methods.walletOf({answerId: 4, walletOwner: distributed.value0[4]}).call();
  	console.log(`User's token wallet: ${ownerTokenWalletAddress4.value0}`);
  	const ownerTokenWallet4 = await locklift.factory.getDeployedContract("TokenWallet", ownerTokenWalletAddress4.value0);
  	const balanceWallet4 = await ownerTokenWallet4.methods.balance({answerId:0}).call();
  	console.log(`Distributers balance: ${balanceWallet4.value0}`);
  	
  	const ownerTokenWalletAddress5 = await root.methods.walletOf({answerId: 4, walletOwner: distributed.value0[5]}).call();
  	console.log(`User's token wallet: ${ownerTokenWalletAddress5.value0}`);
  	const ownerTokenWallet5 = await locklift.factory.getDeployedContract("TokenWallet", ownerTokenWalletAddress5.value0)
  	const balanceWallet5 = await ownerTokenWallet5.methods.balance({answerId:0}).call();
  	console.log(`Distributers balance: ${balanceWallet5.value0}`);
  	
  	const ownerTokenWalletAddress6 = await root.methods.walletOf({answerId: 4, walletOwner: distributed.value0[6]}).call();
  	console.log(`User's token wallet: ${ownerTokenWalletAddress6.value0}`);
  	const ownerTokenWallet6 = await locklift.factory.getDeployedContract("TokenWallet", ownerTokenWalletAddress6.value0);
  	const balanceWallet6 = await ownerTokenWallet6.methods.balance({answerId:0}).call();
  	console.log(`Distributers balance: ${balanceWallet6.value0}`);*/
  	
  	const ownerWallet = await ownerTokenWallet.methods.owner({answerId: 0}).call();
  	console.log(ownerWallet);
  	const refund = await user.runTarget(
  	{
  		contract: airdrop,
    		value: locklift.utils.toNano(2.1),
  	},
  		airdrop =>
  			airdrop.methods.refund({}),
  		);
  	console.log(refund);
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });

