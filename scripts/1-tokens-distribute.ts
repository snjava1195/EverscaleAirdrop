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
const get_airdrop = await locklift.factory.getDeployedContract(
  "EverAirdrop", // name of your contract
  "0:f3e5f32461547c0ab64af9b97f127c800fd5bb7c16d0920fdecf88fcb933a1d4",
);
console.log(`Factory successfully retrieved at address: ${get_airdrop.address.toString()}`);
const pubKey = await get_airdrop.methods.getPubkey({}).call();
   console.log(`Pubkey is: ${pubKey.value0.toString()}`);
await get_airdrop.methods.distribute({}).run();
console.log("Tokens distributed!");

}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
