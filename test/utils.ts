/*import { Contract, Signer } from "locklift";
import { FactorySource } from "../build/factorySource";
const chai = require('chai');

const { expect } = chai;

let owner: Contract<FactorySource["Wallet"]>;
let root: Contract<FactorySource["TokenRoot"]>;
let airdrop: Contract<FactorySource["Airdrop"]>;


const setupAirdrop = async () => {
    
    
    const _randomNonce = locklift.utils.getRandomNonce();
    const signer = (await locklift.keystore.getSigner("0"))!;
    const accountFactory = locklift.factory.getAccountsFactory("Wallet");
  	const {account} = await accountFactory.deployNewAccount({
  		value: locklift.utils.toNano(10),
  		publicKey: signer.publicKey,
  		initParams: {
  			_randomNonce: locklift.utils.getRandomNonce(),
  		},
  		constructorParams: {},
  		});
  		owner = account;
    owner.publicKey = signer.publicKey;
    owner.name = 'Airdrop owner';*/

 // console.log(`Owner: ${owner.address}`);

    // Token

   /* const sampleRootData = await locklift.factory.getContractArtifacts("TokenWallet");
  const { contract } = await locklift.factory.deployContract({
  		contract: "TokenRoot",
  		constructorParams: {
            initialSupplyTo: owner.address,
            initialSupply: 0,
            deployWalletValue: locklift.utils.toNano(1),
            mintDisabled: false,
            burnByRootDisabled: true,
            burnPaused: false,
            remainingGasTo: "0:0000000000000000000000000000000000000000000000000000000000000000",
        },
        initParams: {
            deployer_: "0:0000000000000000000000000000000000000000000000000000000000000000",
            randomNonce_: locklift.utils.getRandomNonce(),
            rootOwner_: owner.address,
            name_: 'Airdrop token',
            symbol_: 'AIRDROP',
            decimals_: 9,
            walletCode_: sampleRootData.code,
        },
        publicKey: signer.publicKey,
        value: locklift.utils.toNano(2),
        });
        
        root = contract;
	console.log(`Token root: ${root.address}`);*/

    // Airdrop
/*     const {contract: airdrop, tx} = await locklift.factory.deployContract({
        contract: "Tip31Airdrop",
        constructorParams: {
            senderAddr: owner.address,
            tokenRootAddr: "0:b1ed038c07d92522924b87de7866a2eabc36e27cc76a2a3b41ddbb97368c4289",
            recipients: ["0:102cf118b6875d201a3011d5dc17a358ee4d4333ad7e167824515171ed8f6f63", "0:b5e9240fc2d2f1ff8cbb1d1dee7fb7cae155e5f6320e585fcc685698994a19a5", "0:f507994482f8aff121f55f474e976c9826709c0fb22d052172d71156b7d9e8dc"],
            amounts: [locklift.utils.toNano(5), locklift.utils.toNano(10), locklift.utils.toNano(7)]
        },
        initParams: {
            _randomNonce,
        },
        publicKey: signer.publicKey,
        value: locklift.utils.toNano(10),
    });
//	console.log(`Airdrop: ${airdrop.address}`);

    return [owner, airdrop];
};

module.exports = {
    setupAirdrop,
    expect,
};*/
