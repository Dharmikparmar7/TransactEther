import { useRef, useState, useEffect } from "react"
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { providers, Contract, ethers } from "ethers";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "../constants";
import Image from 'next/image'

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

            await getProviderOrSigner();

            setWalletConnected(true);

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

            setAddress("");

            setValue("");

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
        <div className={styles.main}>
            <div className={styles.container}>
                <div className={styles.divform} >
                    <div className={styles.innerform} > 

                        <div className={styles.title}>
                            <h1>Transact Ether</h1>
                        </div>

                        <input className={styles.input} type="text" name="address" placeholder="Enter Address" value={Address} onChange={event => {setAddress(event.currentTarget.value); }} /><br/>
                        
                        <input required className={styles.input} type="text" name="value" placeholder="Enter Value" value={Value} onChange={event => {setValue(event.currentTarget.value); }} /><br/>
                        
                        <button onClick={addBalance} className={styles.card}>Add Balance</button><br/>
                        
                        <div className={styles.divBalance}>
                            <label> Current Balance = {Balance} </label>
                        </div>

                        {render()}<br/>

                    </div>
                </div>

                <div className={styles.divimg} >
                    <Image src="/image.png" alt="Picture of the author" width={500} height={500}/>
                </div>
            </div>
        </div>
    )
}