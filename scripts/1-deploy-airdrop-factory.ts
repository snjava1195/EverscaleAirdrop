import { Contract, Signer } from "locklift";
import { FactorySource } from "../build/factorySource";
//import  ora  from 'ora';
const {
    afterRun,
} = require('./../test/utils');
const {load} = require('csv-load-sync');
const {use} = require("chai");

const prompts = require('prompts');
const _ = require('underscore');
const fs  = require("fs");
const { parse } = require('csv-parse/lib/sync');


//const ora = require('ora');
const isValidTonAddress = (address) => /^(?:-1|0):[0-9a-fA-F]{64}$/.test(address);
let signer: Signer;
let owner: Contract<FactorySource["Wallet"]>;
let airdropCon: Contract<FactorySource["Airdrop"]>;

let airdropDeployer: Contract<FactorySource["EverAirdropFactory"]>;

let root: Contract<FactorySource["TokenRoot"]>;
const main = async () => {
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

    // Read csv
    const data = load(response.data);
    const chunks = _.chunk(data, 50);
  const signer = (await locklift.keystore.getSigner("0"))!;
  const _randomNonce = locklift.utils.getRandomNonce();
  //const [keyPair] = await locklift.keystore.keyPair();
  let accountsFactory = await locklift.factory.getAccountsFactory("Wallet");
  //const spinner = ora('Deploying initial owner').start();
  let records;
    records = parse(fs.readFileSync(response.data));
    
    const { contract } = await locklift.factory.deployContract({
        contract: "EverAirdropFactory",
        publicKey: signer.publicKey,
        initParams: {},
        constructorParams: {},
        value: locklift.utils.toNano(10),
    });
    	airdropDeployer = contract;
      console.log(`Airdrop factory deployed at: ${airdropDeployer.address.toString()}`);
    }
    
    main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
