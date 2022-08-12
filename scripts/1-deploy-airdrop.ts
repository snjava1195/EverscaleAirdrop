import { Contract, Signer } from "locklift";
import { FactorySource } from "../build/factorySource";

const {load} = require('csv-load-sync');
const {use} = require("chai");

const prompts = require('prompts');
const _ = require('underscore');
const fs  = require("fs");
const { parse } = require('csv-parse/lib/sync');
let owner: Contract<FactorySource["Wallet"]>;
let airdropDeployer: Contract<FactorySource["EverAirdrop"]>;


	

const main = async () => {
const signer = (await locklift.keystore.getSigner("0"))!;
  let accountsFactory = await locklift.factory.getAccountsFactory("Wallet");
   const _randomNonce = locklift.utils.getRandomNonce();
    const response = await prompts([
        {
            type: 'text',
            name: 'data',
            message: 'Name of the csv file with airdrop addresses and amount, should be placed in the repo root',
            initial: 'proba.csv',
        }
    ]);

let records;
    records = parse(fs.readFileSync(response.data));
      const { account } = await accountsFactory.deployNewAccount({
        constructorParams: {},
        initParams: {
            _randomNonce,
        },
        publicKey: signer.publicKey,
        value:locklift.utils.toNano(5)
    });
    owner = account;
    owner.publicKey = signer.publicKey;
    console.log("Account deployed");
	
    const { contract } = await locklift.factory.deployContract({
        contract: "EverAirdrop",
        publicKey: signer.publicKey,
        initParams: {
        
        },
        constructorParams: {
             _refund_destination: owner.address,
             _addresses: records.map(i => i[0]), 
             _amounts: records.map(i => parseInt(i[1], 10)),
             _refund_lock_duration: 2000,
        },
        value: locklift.utils.toNano(10),
    });
    	airdropDeployer = contract;
      console.log(`Airdrop deployed at: ${airdropDeployer.address.toString()}`);
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
