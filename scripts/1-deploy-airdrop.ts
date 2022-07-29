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
        },
        /*{
            type: 'text',
            name: 'owner',
            message: 'Airdrop owner',
            validate: value => isValidTonAddress(value) ? true : 'Invalid address'
        },
        {
            type: 'text',
            name: 'token',
            message: 'Token root',
            validate: value => isValidTonAddress(value) ? true : 'Invalid address'
        },*/
        {
            type: 'number',
            name: 'start_timestamp',
            initial: Math.floor(Date.now() / 1000),
            message: 'Airdrop start timestamp',
        },
        {
            type: 'number',
            name: 'claim_period_in_seconds',
            initial: 60 * 60 * 24 * 30,
            message: 'Claim period duration in seconds (default = 1 month)'
        },
        {
            type: 'number',
            name: 'claim_periods_amount',
            initial: 12,
            message: 'Claim periods amount'
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
    
    console.log("Account deployed");
	
    const { contract } = await locklift.factory.deployContract({
        contract: "EverAirdrop",
        publicKey: signer.publicKey,
        initParams: {
        
        },
        constructorParams: {
             _refund_destination: "0:102cf118b6875d201a3011d5dc17a358ee4d4333ad7e167824515171ed8f6f63",
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
