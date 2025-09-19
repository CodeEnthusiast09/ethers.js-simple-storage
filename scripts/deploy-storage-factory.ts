import { ethers } from "ethers";
import * as fs from "fs-extra";
import { config as dotenvConfig } from "dotenv";
import {
    Contracts_extraStorage_sol_ExtraStorage,
    Contracts_storageFactory_sol_StorageFactory,
} from "../typechain-types";

dotenvConfig({ path: ".env", quiet: true });

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

    const privateKey = process.env.PRIVATE_KEY;

    if (!privateKey) {
        throw new Error("private key not found");
    }

    const wallet = new ethers.Wallet(privateKey, provider);

    // const encryptedJson = fs.readFileSync("./.encryptedKey.json", "utf-8");

    // const password = process.env.PRIVATE_KEY_PASSWORD;

    // if (!password) {
    //   throw new Error("private key not found");
    // }

    // let wallet = ethers.Wallet.fromEncryptedJsonSync(encryptedJson, password);

    // wallet = wallet.connect(provider);

    const abi = JSON.parse(
        fs.readFileSync(
            "./build/contracts_storage-factory_sol_StorageFactory.abi",
            "utf8",
        ),
    );

    const binary = fs.readFileSync(
        "./build/contracts_storage-factory_sol_StorageFactory.bin",
        "utf8",
    );

    const contractFactory = new ethers.ContractFactory(abi, binary, wallet);

    console.log("Deploying, please wait...");

    const contract =
        (await contractFactory.deploy()) as Contracts_storageFactory_sol_StorageFactory;

    // await contract.waitForDeployment();

    await contract.deploymentTransaction()?.wait(1);

    console.log(`Contract deployed to ${contract.target}`);

    await contract.createSimpleStorageContract();

    await contract.storageFactoryStore(0, 7);

    let address = await contract.simpleStorageArray(0);

    console.log("Simple storage contract address is:", address);

    let simpleStorageIndexFavNumber = await contract.storageFactoryGet(0);

    console.log(`Simple storage fav number is: ${simpleStorageIndexFavNumber}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
