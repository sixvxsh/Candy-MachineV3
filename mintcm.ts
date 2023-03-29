import { Connection,clusterApiUrl, PublicKey, Signer, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js"
import {
    Metaplex,
    keypairIdentity,
    bundlrStorage,
    toMetaplexFile,
    NftWithToken,
    toBigNumber,
    sol,
    toDateTime,
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
const collectionUpdateAuthority = new PublicKey(collectionAuthority);
console.log("collection UA:", collectionUpdateAuthority );

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





// create candy machine
const {candyMachine} = await metaplex.candyMachines().create({
  itemsAvailable: toBigNumber(4),
  sellerFeeBasisPoints: 500,
  authority: ownerAuthority,
  symbol: "HL_PL",
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
    prefixName: "Platinum Pass #",
    nameLength: 4,
    prefixUri: "https://storage.googleapis.com/fractal-launchpad-public-assets/honeyland/assets_platinum_pass/",
    uriLength: 8,
    isSequential: false,
  },
  guards: {
    botTax: { lamports: sol(0.01), lastInstruction: false },
    redeemedAmount: {
      maximum: toBigNumber(4),
    },
  },
  groups: [
    {
      label: "off",
      guards: {
        solPayment: { amount: sol(0.5), destination: ownerAuthority.publicKey } ,
        startDate: { date: toDateTime("2023-3-29T16:00:00Z") },
      },
    },
    {
      label: "primary",
      guards: {
        solPayment: { amount: sol(1), destination: ownerAuthority.publicKey } ,
        startDate: { date: toDateTime("2023-3-29T20:00:00Z") },
      }
    },
  ]
});
console.log("CM successfully created");

// inserting items
await metaplex.candyMachines().insertItems({
  candyMachine,
  items: [
    {name:"008", uri:"8.json"},
    {name:"144", uri:"144.json"},
    {name:"135", uri:"135.json"},
    {name:"196", uri:"196.json"},
  ],
});
console.log("items successfully added");

// basic mint
const { nft } = await metaplex.candyMachines().mint({
  candyMachine,
  collectionUpdateAuthority,
});

console.log("items successfully minted");

























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