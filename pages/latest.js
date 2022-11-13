import { useRef, useState, useEffect } from "react"
import styles from "../styles/Home.module.css";
import { providers ,Contract, ethers } from "ethers";
import Web3Modal from "web3modal";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "../constants";
import Image from 'next/image'
import common from "./common";
// import { getProviderOrSigner } from "./common";

export default function latest(){

    common();

    const [Address, setAddress] = useState('');

    const [Value, setValue] = useState('');

    const [Balance, setBalance] = useState('');

    const [loading, setLoading] = useState(false);

    const web3ModalRef2 = useRef()

    // const getProviderOrSigner = async (needSigner = false) => {

    //     const provider = await web3ModalRef2.current.connect();

    //     const web3Provider = new providers.Web3Provider(provider);

    //     const { chainId } = await web3Provider.getNetwork();

    //     if (chainId !== 5) {
    //         window.alert("Change the network to Goerli");
    //         throw new Error("Change network to Goerli");
    //     }

    //     if (needSigner) {
    //         const signer = web3Provider.getSigner();
    //         return signer;
    //     }
    //     return web3Provider;
    // };

    const getBalance = async () => {

        console.log("get balance")

        try {

            const signer = await common.getProviderOrSigner(true);

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
        
        getBalance();

    }, []);

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
                        <button onClick={getBalance} className={styles.card}>Get Balance</button><br/>
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