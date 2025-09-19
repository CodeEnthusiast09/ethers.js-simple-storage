import { ethers } from "ethers";
import * as fs from "fs-extra";
import { config as dotenvConfig } from "dotenv";
import { Contracts_storageFactory_sol_StorageFactory } from "../typechain-types";

dotenvConfig({ path: ".env", quiet: true });

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

    const privateKey = process.env.PRIVATE_KEY;

    if (!privateKey) {
        throw new Error("private key not found");
    }

    const wallet = new ethers.Wallet(privateKey, provider);

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

    console.log("Deploying StorageFactory, please wait...");

    const contract =
        (await contractFactory.deploy()) as Contracts_storageFactory_sol_StorageFactory;

    const deploymentTx = contract.deploymentTransaction();

    if (deploymentTx) {
        await deploymentTx.wait(1);
    }

    console.log(`StorageFactory deployed to ${contract.target}`);

    console.log("Creating SimpleStorage contract...");

    const createTx = await contract.createSimpleStorageContract();

    await createTx.wait(1);

    console.log("SimpleStorage contract created!");

    console.log("Storing value in SimpleStorage contract...");

    const storeTx = await contract.storageFactoryStore(0, 7);

    await storeTx.wait(1);

    let address = await contract.simpleStorageArray(0);

    console.log(`Simple storage contract address is: ${address}`);

    let simpleStorageIndexFavNumber = await contract.storageFactoryGet(0);

    console.log(`Simple storage fav number is: ${simpleStorageIndexFavNumber}`);

    console.log("Creating second SimpleStorage contract...");

    const createTx2 = await contract.createSimpleStorageContract();

    await createTx2.wait(1);

    console.log("Storing value in second SimpleStorage contract...");

    const storeTx2 = await contract.storageFactoryStore(1, 42);

    await storeTx2.wait(1);

    let address2 = await contract.simpleStorageArray(1);

    console.log(`Second simple storage contract address is: ${address2}`);

    let simpleStorageIndexFavNumber2 = await contract.storageFactoryGet(1);

    console.log(
        `Second simple storage fav number is: ${simpleStorageIndexFavNumber2}`,
    );
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
