import { Contract, Signer } from "locklift";
import { FactorySource } from "../build/factorySource";
let owner: Contract<FactorySource["Wallet"]>;
async function main() {

const signer = (await locklift.keystore.getSigner("0"))!;
  let accountsFactory = await locklift.factory.getAccountsFactory("Wallet");
   const _randomNonce = locklift.utils.getRandomNonce();
	const get_airdrop = await locklift.factory.getDeployedContract(
  "EverAirdrop", // name of your contract
  "0:5f06218426cb6f9c7e2be63f46f7cbdd3c1d840835aeea32c20f777552258791",
);

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

    await get_airdrop.methods.distribute({}).sendExternal({ publicKey: signer.publicKey} );
    /*  const accountTransaction = await owner.runTarget(
    		{
    		contract: get_airdrop,
    		value: locklift.utils.toNano(1),
    		},
    		get_airdrop =>
    			get_airdrop.methods.distribute({}),
    		);
      
    	//console.log("Amount minted");
   //await get_airdrop.methods.distribute({}).call();*/
   console.log("Tokens distributed!")
   
   const pubKey = await get_airdrop.methods.getPubkey({}).call();
   console.log(`Pubkey is: ${pubKey.value0.toString()}`);
	//await airdrop.methods.distribute({}).call();
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
