import React, { useState, useEffect } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import axios from "axios";
import { create as ipfsHttpClient } from "ipfs-http-client";
import router from "next/router";
import { MarketAddress, MarketAddressABI } from "./constants";

const apiKey = "2U9ckw31gxyNm5EgGKXaKBUoKZr";
const secretApiKey = "eaa4ada032b0172bfa221b3d0e82b144";

const client = ipfsHttpClient({
  url: "https://ipfs.infura.io:5001/api/v0",
  headers: {
    Authorization:
      "Basic " + Buffer.from(apiKey + ":" + secretApiKey).toString("base64"),
  },
});

const fetchContract = (signerOrProvider) =>
  new ethers.Contract(MarketAddress, MarketAddressABI, signerOrProvider);

export const NFTContext = React.createContext();

export const NFTProvider = ({ children }) => {
  const [currentAccount, setcurrentAccount] = useState("");
  const nftCurrency = "ETH";

  const checkIfWalletIsConnected = async () => {
    if (!window.ethereum) return alert("Please install MetaMask");

    const accounts = await window.ethereum.request({ method: "eth_accounts" });

    if (accounts.length > 0) {
      setcurrentAccount(accounts[0]);
    } else {
      console.log("No accounts found");
    }

    console.log(accounts);
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    // createSale("test", "0.025");
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Please install MetaMask");

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    setcurrentAccount(accounts[0]);

    window.location.reload();
  };

  const uploadToIPFS = async (file) => {
    try {
      const added = await client.add({ content: file });
      const url = `https://ipfs.io/ipfs/${added.path}`;
      return url;
    } catch (error) {
      console.log("Error uploading file to IPFS: ", error);
    }
  };

  const NFTCreate = async (formInput,fileUrl, router) => {
    const { name, description, price } = formInput;

    console.log("Form Input111:", formInput)
    
    if (!name || !description || !price || !fileUrl) return;

    const data = JSON.stringify({
      name,
      description,
      image: fileUrl,
    });
    console.log("🚀 ~ file: NFTContext.js:82 ~ NFTCreate ~ data:", data)

    try {
      const added = await client.add(data);


      const url = `https://ipfs.io/ipfs/${added.path}`;

      await createSale(url, price);

      router.push("/");

    } catch (error) {
      console.log("Error uploading file to IPFS: ", error);
    }
  };

  const createSale = async (url, formInputPrice, isReselling, id) => {
    try {
      const web3modal = new Web3Modal();
      const connection = await web3modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();

      const price = ethers.utils.parseUnits(formInputPrice, "ether");
      const contract = fetchContract(signer);

      const listingPrice = await contract.getListingPrice();

      const transaction = await contract.createToken(url, price, {
        value: listingPrice.toString(),
      });

      await transaction.wait();

      console.log("Transaction completed successfully");
    } catch (error) {
      console.error("Error creating sale:", error);
    }
  };

  return (
    <NFTContext.Provider
      value={{
        nftCurrency,
        connectWallet,
        currentAccount,
        uploadToIPFS,
        NFTCreate,
      }}
    >
      {children}
    </NFTContext.Provider>
  );
};
