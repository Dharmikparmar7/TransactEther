import { useRef, useState, useEffect } from "react"
import Web3Modal from "web3modal";
import { providers ,Contract, ethers } from "ethers";

export default function common(){

    const [walletConnected, setWalletConnected] = useState(false);

    const web3ModalRef = useRef()

    const getProviderOrSigner = async (needSigner = false) => {

        const provider = await web3ModalRef.current.connect();

        const web3Provider = new providers.Web3Provider(provider);

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

    useEffect(() => {
        
        if (!walletConnected) {

            web3ModalRef.current = new Web3Modal({
                network: "goerli",
                providerOptions: {},
                disableInjectedProvider: false,
            });
            connectWallet();
        }

    }, [walletConnected]);
}