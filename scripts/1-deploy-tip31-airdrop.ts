import { Contract, Signer } from "locklift";
import { FactorySource } from "../build/factorySource";
const { setupTip31Airdrop } = require('./utils');
let airdrop: Contract<FactorySource["Tip31Airdrop"]>;
let user: Contract<FactorySource["Wallet"]>;


async function main() {
 
  	const codeDistributer = locklift.factory.getContractArtifacts("Tip31Distributer");
  	const refund_lock_duration = 2000;
  	//call setupTip31Airdrop to deploy user and airdrop contract
  	[user, airdrop] = await setupTip31Airdrop(codeDistributer.code, refund_lock_duration);
  	 	
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });


