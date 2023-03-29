import { Connection,clusterApiUrl, PublicKey, Signer, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js"
import {
    Metaplex,
    keypairIdentity,
    bundlrStorage,
    toMetaplexFile,
    NftWithToken,
    toBigNumber,
  } from "@metaplex-foundation/js"
import { initializeKeypair } from "./kp";


const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

const ownerAuthority = await initializeKeypair(connection);
console.log('owner publickey:' , ownerAuthority.publicKey.toBase58());

const metaplex = Metaplex.make(connection).use(keypairIdentity(ownerAuthority,)).use(bundlrStorage({
    address: "https://devnet.bundlr.network",
    providerUrl: "https://api.devnet.solana.com",
    timeout: 6000,
  }))




// Create the Collection NFT.
const collectionAuthority = Keypair.generate();
console.log('collection publickey:' , collectionAuthority.publicKey.toBase58());

const { nft: collectionNft } = await metaplex.nfts().create({
  name: "Honeyland Passes",
  uri: "https://content.honey.land/assets/collections/honeyland_passes.json",
  sellerFeeBasisPoints: 500,
  symbol: "HL_PASS",
  isCollection: true,
  collectionIsSized: true,
  updateAuthority: collectionAuthority,
});
console.log(
  `collection Mint: https://explorer.solana.com/address/${collectionNft.address.toString()}?cluster=devnet`);




// CM settings
// const candyMachineSettings = {
//   authority: ownerAuthority,
//   sellerFeeBasisPoints: 500,
//   maxEditionSupply: toBigNumber(0),
//   isMutable: true,
//   creators: [
//     {address: ownerAuthority.publicKey , share:100}
//   ],
//   itemsAvailable: toBigNumber(4),
//   itemSettings: {
//     type: "configLines",
//     prefixName: "My NFT Project #$ID+1$",
//     nameLength: 0,
//     prefixUri: "https://arweave.net/",
//     uriLength: 43,
//     isSequential: false,
//   },
//   collection: {
//     address: collectionNft.address,
//     updateAuthority: collectionAuthority,
//   },
  
// };


// create candy machine

const {candyMachine} = await metaplex.candyMachines().create({
  itemsAvailable: toBigNumber(4),
  sellerFeeBasisPoints: 500,
  authority: ownerAuthority,
  maxEditionSupply: toBigNumber(0),
  isMutable:true,
  collection: {
    address: collectionNft.address,
    updateAuthority: metaplex.identity(),
  },
  creators: [
    {address: ownerAuthority.publicKey, share:100}
  ],
  itemSettings: {
    type: "configLines",
    prefixName: "",
    nameLength: 0,
    prefixUri: "",
    uriLength: 0,
    isSequential: false,
  }

});






























// create new collection
// const {nft} = await metaplex.nfts().create(
//   {
//     uri:"https://content.honey.land/assets/collections/honeyland_passes.json",
//     name:"Honeyland Passes2",
//     sellerFeeBasisPoints: 500,
//     symbol: "HL_PASS2",
//     isCollection: true,
//     collectionIsSized: true,
//   }
// );
// console.log(
//   `collection Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`);
// console.log(`collection mint address: ${nft.mint.address}`);
// const collectionNft = nft.mint.address;