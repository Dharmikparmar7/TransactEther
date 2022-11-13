import { useRef, useState, useEffect } from "react"
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { providers, Contract, ethers } from "ethers";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "../constants";

export default function home() {

    const [walletConnected, setWalletConnected] = useState(false);

    const [Address, setAddress] = useState('');

    const [Value, setValue] = useState('');

    const [Balance, setBalance] = useState('');

    const [loading, setLoading] = useState(false);

    const web3ModalRef = useRef()

    const getProviderOrSigner = async (needSigner = false) => {
        // Connect to Metamask
        // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
        const provider = await web3ModalRef.current.connect();
        const web3Provider = new providers.Web3Provider(provider);

        // If user is not connected to the Goerli network, let them know and throw an error
        const { chainId } = await web3Provider.getNetwork();
        if (chainId !== 5) {
            window.alert("Change the network to Goerli");
            throw new Error("Change network to Goerli");
        }

        if (needSigner) {
            const signer = web3Provider.getSigner();
            return signer;
        }
        return web3Provider;
    };

    const connectWallet = async () => {
        try {
            // Get the provider from web3Modal, which in our case is MetaMask
            // When used for the first time, it prompts the user to connect their wallet
            await getProviderOrSigner();
            setWalletConnected(true);

            //   checkIfAddressInWhitelist();
            //   getNumberOfWhitelisted();
        } catch (err) {
            console.error(err);
        }
    };

    const getBalance = async () => {
        try {

            const signer = await getProviderOrSigner(true);

            const transactEtherContract = new Contract(
                WHITELIST_CONTRACT_ADDRESS,
                abi,
                signer
            );

            setLoading(true);

            const balance = await transactEtherContract.getBalance();

            setBalance(ethers.utils.formatEther(balance));

            setLoading(false);

        } catch (error) {
            console.log(error);
        }
    };

    async function addBalance() {
        try {
            const signer = await getProviderOrSigner(true);

            if (!Address) {
                setAddress(WHITELIST_CONTRACT_ADDRESS)
            }

            const tx = await signer.sendTransaction({
                to: Address,
                value: ethers.utils.parseEther(Value)
            });

            setLoading(true);

            await tx.wait();

            await getBalance();

            setLoading(false);

        } catch (error) {

        }
    }

    const render = () => {
        if (loading) {
            return <label> Loading..... </label>
        }
    }


    useEffect(() => {
        // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
        if (!walletConnected) {
            // Assign the Web3Modal class to the reference object by setting it's `current` value
            // The `current` value is persisted throughout as long as this page is open
            web3ModalRef.current = new Web3Modal({
                network: "goerli",
                providerOptions: {},
                disableInjectedProvider: false,
            });
            connectWallet();
        }

        getBalance();

    }, [walletConnected]);

    return (
        // <div className={styles.main}>
        //     <input className={styles.input} type="text" name="address" placeholder="Enter Address" value={Address} onChange={event => {setAddress(event.currentTarget.value); }} />
        //     <input className={styles.input} type="text" name="value" placeholder="Enter Value" value={Value} onChange={event => {setValue(event.currentTarget.value); }} />

        //     <button onClick={addBalance} className={styles.button}>Add Balance</button>

        //     <label className={styles.description} > Current Balance = {Balance} </label>
        //     {render()}
        //     <label className={styles.description} > {Value} </label>

        // </div>

        <div className="flex min-h-full items-center justify-center py-32 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div className="flex-col items-center justify-center">
                    <h1 className="mt-6 mb-14 text-center text-6xl font-bold tracking-tight text-indigo-900">Transact <span className="text-indigo-500">Ether</span>.</h1>
                </div>
                <div className="flex justify-between p-4 rounded-md border border-indigo-500">
                    <p className="inline max-w-sm text-lg text-indigo-900 font-bold">Your Current Balance:<br /> {Balance} </p>
                    <button onClick={getBalance} className="group relative h-auto flex items-center justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                        Get Balance
                    </button>
                </div>
                <form className="mt-32 space-y-6" onSubmit={(event) => event.preventDefault()}>
                    <input type="hidden" name="remember" value="true" />
                    <div className="-space-y-px rounded-md shadow-sm">
                        <div>
                            <label htmlFor="address" className="sr-only">Contract Address</label>
                            <input type="text" id="address" name="address" value={Address} onChange={event => { setAddress(event.currentTarget.value); }} required className="relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm lg:text-lg" placeholder="Contract Address" />
                        </div>
                        <div>
                            <label htmlFor="value" className="sr-only">Ether Amount</label>
                            <input type="text" id="value" name="value" value={Value} onChange={event => { setValue(event.currentTarget.value); }} className="relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm lg:text-lg" placeholder="Ether Amount" />
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <button onClick={addBalance} className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                            Send Balance
                        </button>
                    </div>

                    <div>
                        {/* <label> {render} </label> */}
                    </div>
                </form>
                {/* <div className="flex-col justify-center">
          <p className="mt-2 text-center text-base text-gray-600">
            by,
          </p>
          <div className="flex justify-center">
            <Image src="/logo.svg" height={218} width={218} alt="ADITHS" />
          </div>
        </div> */}
            </div>
        </div>
    )
}