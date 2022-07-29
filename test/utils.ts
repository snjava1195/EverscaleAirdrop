import { Contract, Signer } from "locklift";
import { FactorySource } from "../build/factorySource";
//const logger = require('mocha-logger');
const chai = require('chai');
//chai.use(require('chai-bignumber')());

const { expect } = chai;

let owner: Contract<FactorySource["Wallet"]>;
let root: Contract<FactorySource["TokenRoot"]>;
let airdrop: Contract<FactorySource["Airdrop"]>;

//const TOKEN_PATH = 'build';


async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Due to the network lag, graphql may not catch wallets updates instantly
const afterRun = async (tx) => {
    if (locklift.network === 'dev' || locklift.network === 'prod') {
        await sleep(100000);
    }
};


const stringToBytesArray = (dataString) => {
    return Buffer.from(dataString).toString('hex')
};


const setupAirdrop = async (_start_timestamp, _claim_period_in_seconds, _claim_periods_amount) => {
    
    
    //const [keyPair] = await locklift.keys.getKeyPairs();
    const _randomNonce = locklift.utils.getRandomNonce();
    const signer = (await locklift.keystore.getSigner("0"))!;
    const accountFactory = locklift.factory.getAccountsFactory("Wallet");
  	const {account} = await accountFactory.deployNewAccount({
  		value: locklift.utils.toNano(3),
  		publicKey: signer.publicKey,
  		initParams: {
  			_randomNonce: locklift.utils.getRandomNonce(),
  		},
  		constructorParams: {},
  		});
  		owner = account;
    owner.publicKey = signer.publicKey;
    owner.afterRun = afterRun;
    owner.name = 'Airdrop owner';

  //  logger.log(`Owner: ${owner.address}`);

    // Token
  //  const RootToken = await locklift.factory.getContractArtifacts("../contracts/TokenRoot");
  //  const TokenWallet = await locklift.factory.getContractArtifacts("../contracts/TokenWallet");

    const sampleRootData = await locklift.factory.getContractArtifacts("TokenRoot");
  	const { tokenRoot } = await locklift.factory.deployContract({
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
	root = tokenRoot;
    //logger.log(`Token root: ${root.address}`);


    // Airdrop
    //const Airdrop = await locklift.factory.getContractArtifacts("Airdrop");
    const airdropDep = await locklift.factory.deployContract({
        contract: "Airdrop",
        constructorParams: {
            _token: "0:a49cd4e158a9a15555e624759e2e4e766d22600b7800d891e46f9291f044a93d",
            _owner: owner.address,
            _start_timestamp,
            _claim_period_in_seconds,
            _claim_periods_amount
        },
        initParams: {
            _randomNonce,
        },
       publicKey: signer.publicKey,
       value: locklift.utils.toNano(10),
    }); 
    airdrop = airdropDep;

    //logger.log(`Airdrop: ${airdrop.address}`);

    return [owner, root, airdrop];
};


module.exports = {
    setupAirdrop,
    expect,
    afterRun,
    sleep,
};
