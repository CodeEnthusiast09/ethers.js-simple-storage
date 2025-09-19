import { ethers } from "ethers"
import * as fs from "fs-extra"
import { config as dotenvConfig } from "dotenv"
import {
    Contracts_extraStorage_sol_ExtraStorage,
} from "../typechain-types"

dotenvConfig({ path: ".env", quiet: true })

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL)

    const privateKey = process.env.PRIVATE_KEY

    if (!privateKey) {
        throw new Error("private key not found")
    }

    const wallet = new ethers.Wallet(privateKey, provider)

    // const encryptedJson = fs.readFileSync("./.encryptedKey.json", "utf-8");

    // const password = process.env.PRIVATE_KEY_PASSWORD;

    // if (!password) {
    //   throw new Error("private key not found");
    // }

    // let wallet = ethers.Wallet.fromEncryptedJsonSync(encryptedJson, password);

    // wallet = wallet.connect(provider);

    const abi = JSON.parse(
        fs.readFileSync(
            "./build/contracts_extra-storage_sol_ExtraStorage.abi",
            "utf8",
        ),
    )

    const binary = fs.readFileSync(
        "./build/contracts_extra-storage_sol_ExtraStorage.bin",
        "utf8",
    )

    const contractFactory = new ethers.ContractFactory(abi, binary, wallet)

    console.log("Deploying, please wait...")

    const contract =
        (await contractFactory.deploy()) as Contracts_extraStorage_sol_ExtraStorage

    // await contract.waitForDeployment();

    await contract.deploymentTransaction()?.wait(1)

    console.log(`Contract deployed to ${contract.target}`)

    await contract.addPerson("O'Brien", 7)

    console.log("Adding a person...")

    let personFavNumber = await contract.nameToFavoriteNumber("O'Brien")

    console.log(`O'Brien's fav number is ${personFavNumber}`)

    let people = await contract.people(0)

    console.log(
        `This person's name is ${people.name} and their fav number is ${people.favoriteNumber}`,
    )

    let currentFavoriteNumber = await contract.retrieve()

    console.log(`Current Favorite Number: ${currentFavoriteNumber}`)

    console.log("Updating favorite number...")

    let transactionResponse = await contract.store(9)

    await transactionResponse.wait()

    currentFavoriteNumber = await contract.retrieve()

    console.log(`New Favorite Number: ${currentFavoriteNumber}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
