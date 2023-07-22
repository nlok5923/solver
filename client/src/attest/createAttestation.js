import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk"
import { Banana, Chains }  from '../sdk/index'

const EASContractAddress = '0x1a5650d0ecbca349dd84bafa85790e3e6955eb84'
const eas = new EAS(EASContractAddress);

export const createAttestation = async (recipientAddress, intent) => {
    const bananaInstanceOptimism = new Banana(Chains.optimismTestnet);
    const walletName = bananaInstanceOptimism.getWalletName();
    const walletOptimism = await bananaInstanceOptimism.connectWallet(walletName);

    const signerOptimism = walletOptimism.getSigner();
    eas.connect(signerOptimism);

    // Initialize SchemaEncoder with the schema string
    const schemaEncoder = new SchemaEncoder("address user, string intent");
    const encodedData = schemaEncoder.encodeData([
        { name: "user", value: recipientAddress , type: "address" },
        { name: "intent", value: intent, type: "string" },
    ]);

    console.log('this is encoded data ', encodedData)

    const schemaUID = "0xac22e30ab401c38d89de29e34e4573511797e2f7aec22f55a56c8593a3fa20e3";
    
    const tx = await eas.attest({
        schema: schemaUID,
        data: {
          recipient: recipientAddress,
          expirationTime: 0,
          revocable: true,
          data: encodedData,
        },
      });
      
    const newAttestationUID = await tx.wait();
      
    console.log("New attestation UID:", newAttestationUID);
}