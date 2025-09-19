import { ethers } from "ethers";
import * as fs from "fs-extra";
import { config as dotenvConfig } from "dotenv";
import { Contracts_extraStorage_sol_ExtraStorage } from "../typechain-types";

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
            "./build/contracts_extra-storage_sol_ExtraStorage.abi",
            "utf8",
        ),
    );

    const binary = fs.readFileSync(
        "./build/contracts_extra-storage_sol_ExtraStorage.bin",
        "utf8",
    );

    const contractFactory = new ethers.ContractFactory(abi, binary, wallet);

    console.log("Deploying, please wait...");

    const contract =
        (await contractFactory.deploy()) as Contracts_extraStorage_sol_ExtraStorage;

    const deploymentTx = contract.deploymentTransaction();

    if (deploymentTx) {
        await deploymentTx.wait(1);
    }

    console.log(`Contract deployed to ${contract.target}`);

    console.log("Testing basic functionality...");

    let currentFavoriteNumber = await contract.retrieve();

    console.log(`Initial Favorite Number: ${currentFavoriteNumber}`);

    console.log("Storing favorite number...");

    let storeTransaction = await contract.store(9);

    await storeTransaction.wait(1);

    currentFavoriteNumber = await contract.retrieve();

    console.log(`New Favorite Number: ${currentFavoriteNumber}`);

    console.log("Adding a person...");

    try {
        const addPersonTransaction = await contract.addPerson("O'Brien", 7);

        await addPersonTransaction.wait(1);

        console.log("Person added successfully!");

        let personFavNumber = await contract.nameToFavoriteNumber("O'Brien");

        console.log(`O'Brien's fav number is ${personFavNumber}`);

        if (personFavNumber > 0) {
            let people = await contract.people(0);

            console.log(
                `This person's name is ${people.name} and their fav number is ${people.favoriteNumber}`,
            );
        } else {
            console.log("Warning: Person was not added correctly!");
        }
    } catch (error) {
        console.error("Error adding person:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
