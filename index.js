import { ethers } from "./src/js/ethers.esm.min.js"
import { abi, contractAddress } from "./src/js/constants.js"

const connect_btn = document.getElementById("connect_btn")
const fund_btn = document.getElementById("fund_btn")
const balance_btn = document.getElementById("balance_btn")
const balance_lb = document.getElementById("balance")
const withdraw_btn = document.getElementById("withdraw_btn")

connect_btn.onclick = connect
fund_btn.onclick = fund
balance_btn.onclick = getbalance
withdraw_btn.onclick = withdraw

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        try {
            window.ethereum.request({ method: "eth_requestAccounts" })
            connect_btn.innerHTML = "Connected"
        } catch (error) {
            console.log(error)
        }
    } else {
        connect_btn.innerHTML = "Please install metamask etc !"
    }
}

async function fund(ethAmount) {
    console.log(`Funding with ${ethAmount}`)
    ethAmount = document.getElementById("fund_eth").value
    if (typeof window.ethereum !== "undefined") {
        //provider / connection to the blockchain
        //signer / wallet/ someone  with some gas
        //contract that we are interacting with
        //^ABI & Address
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()

        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionReponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            await listenForTransanctionMine(transactionReponse, provider)
            console.log("Fund successfully!")
        } catch (error) {
            console.log(error)
        }
    }
}

function listenForTransanctionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`
            )
            resolve()
        })
    })
}

async function getbalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = (await provider.getBalance(contractAddress)) / 1e18
        balance_lb.innerText = `${balance}ETH`
    }
}

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)

        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransanctionMine(transactionResponse, provider)

            console.log("withdrawsuccessfully")
        } catch (error) {
            console.log(error)
        }
    }
}

// module.exports = {
//   connect,
// };
