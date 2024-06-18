import { useEffect, useState } from "react";
import styles from "../styles/NftGallery.module.css";
import { useAccount } from "wagmi";
import Modal from "./modal";

export default function NFTGallery() {
  const [nfts, setNfts] = useState([]);
  const [filteredNfts, setFilteredNfts] = useState([]); // State for filtered NFTs
  const [walletOrCollectionAddress, setWalletOrCollectionAddress] =
    useState("Connect wallet");
  const [fetchMethod, setFetchMethod] = useState("connectedWallet");
  const [pageKey, setPageKey] = useState();
  const [spamFilter, setSpamFilter] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { address, isConnected } = useAccount();
  const [chain, setChain] = useState(process.env.NEXT_PUBLIC_ALCHEMY_NETWORK);
  const [selectedNft, setSelectedNft] = useState(null); // State for selected NFT
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  let [collectionNames, setCollectionNames] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(""); // State for selected collection

  const changeFetchMethod = (e) => {
    setNfts([]);
    setFilteredNfts([]);
    setPageKey();
    setSelectedCollection(""); // Reset selected collection
    switch (e.target.value) {
      case "wallet":
        setWalletOrCollectionAddress("vitalik.eth");
        break;
      case "collection":
        setWalletOrCollectionAddress(
          "0x8a90CAb2b38dba80c64b7734e58Ee1dB38B8992e",
        );
        break;
      case "connectedWallet":
        setWalletOrCollectionAddress(address);
        break;
    }
    setFetchMethod(e.target.value);
  };

  const fetchNFTs = async (pagekey) => {
    if (!pageKey) setIsLoading(true);
    const endpoint =
      fetchMethod === "wallet" || fetchMethod === "connectedWallet"
        ? "/api/getNftsForOwner"
        : "/api/getNftsForCollection";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify({
          address:
            fetchMethod === "connectedWallet"
              ? address
              : walletOrCollectionAddress,
          pageKey: pagekey ? pagekey : null,
          chain: chain,
        }),
      }).then((res) => res.json());
      const newNfts = res.nfts;
      if (nfts?.length && pageKey) {
        setNfts((prevState) => [...prevState, ...newNfts]);
        let uniqueCollectionNames = [
          ...new Set(nfts.map((nft) => nft.collectionName)),
        ];
        setCollectionNames(uniqueCollectionNames);
        console.log(collectionNames);
      } else {
        setNfts(newNfts);
        setFilteredNfts(newNfts);
      }
      if (res.pageKey) {
        setPageKey(res.pageKey);
      } else {
        setPageKey();
      }
      const uniqueCollectionNames = [
        ...new Set(newNfts.map((nft) => nft.collectionName)),
      ];
      setCollectionNames(uniqueCollectionNames);
    } catch (e) {
      console.log(e);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchNFTs();
  }, [fetchMethod, spamFilter]);

  useEffect(() => {
    if (selectedCollection) {
      setFilteredNfts(
        nfts.filter((nft) => nft.collectionName === selectedCollection),
      );
    } else {
      setFilteredNfts(nfts);
    }
  }, [selectedCollection, nfts]);

  const handleCardClick = (nft) => {
    const selectedNftWithMedia = {
      ...nft,
      media: nft.media || nft.tokenUri.gateway,
    };
    setSelectedNft(selectedNftWithMedia);
    setIsModalOpen(true);
  };

  return (
    <div className={styles.nft_gallery_page}>
      <div>
        <div className={styles.fetch_selector_container}>
          <h2 style={{ fontSize: "20px" }}>Explore NFTs by</h2>
          <div className={styles.select_container}>
            <select
              defaultValue={"connectedWallet"}
              onChange={(e) => changeFetchMethod(e)}
            >
              <option value={"connectedWallet"}>connected wallet</option>
              <option value={"wallet"}>wallet</option>
              <option value={"collection"}>collection</option>
            </select>
          </div>
        </div>
        <div className={styles.inputs_container}>
          <div className={styles.input_button_container}>
            {(fetchMethod === "wallet" || fetchMethod === "collection") && (
              <div className={n.input_button_container}>
                <input
                  value={s}
                  onChange={(e) => d(e.target.value)}
                  placeholder="Insert NFTs contract or wallet address"
                />
              </div>
            )}
            <div className={styles.select_container}>
              <select
                onChange={(e) => setChain(e.target.value)}
                defaultValue={process.env.NEXT_PUBLIC_ALCHEMY_NETWORK}
              >
                <option value={"ETH_MAINNET"}>Ethereum</option>
                <option value={"MATIC_MAINNET"}>Polygon</option>
                <option value={"OPT_MAINNET"}>Optimism</option>
                <option value={"BASE_MAINNET"}>Base</option>
                <option value={"ARB_MAINNET"}>Arbitrum</option>
              </select>
            </div>
            <div onClick={() => fetchNFTs()} className={styles.button_black}>
              <a>Search</a>
            </div>
          </div>
        </div>
        {collectionNames.length > 0 && (
          <div className={styles.select_container}>
            <select
              onChange={(e) => setSelectedCollection(e.target.value)}
              defaultValue=""
            >
              <option value="">All Collections</option>
              {collectionNames.map((name, index) => (
                <option key={index} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className={styles.loading_box}>
          <p>Loading...</p>
        </div>
      ) : (
        <div className={styles.nft_gallery}>
          <div className={styles.nfts_display}>
          {filteredNfts?.length ? (
            filteredNfts
              .filter((nft) => nft.media && nft.media.raw && nft.media.raw.includes('ipfs'))
              .map((nft, index) => (
                <NftCard
                  key={index}
                  nft={nft}
                  onClick={() => handleCardClick(nft)}
                />
              ))
          ) : (
              <div className={styles.loading_box}>
                <p>No NFTs found for the selected address</p>
              </div>
            )}
          </div>
        </div>
      )}

      {pageKey && nfts?.length && (
        <div>
          <a className={styles.button_black} onClick={() => fetchNFTs(pageKey)}>
            Load more
          </a>
        </div>
      )}

      {isModalOpen && (
        <Modal nft={selectedNft} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}
function NftCard({ nft, onClick }) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div
      className={`${styles.card_container} ${styles.clickable}`}
      onClick={onClick}
    >
      <div className={styles.image_container}>
        {nft.format === "mp4" ? (
          <video src={nft.media.gateway} controls>
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            src={
              imageError ? "https://placehold.co/600x400" : nft.media.gateway
            }
            alt={nft.title}
            onError={handleImageError}
          />
        )}
      </div>
      <div className={styles.info_container}>
        <div className={styles.info_container}>
          <div className={styles.title_container}>
            <h3>{nft.title}</h3>
          </div>
          <hr className={styles.separator} />
          <div className={styles.symbol_contract_container}>
            <div className={styles.symbol_container}>
              <p>{nft.symbol}</p>
              {nft.verified === "verified" && (
                <img
                  src={
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Twitter_Verified_Badge.svg/2048px-Twitter_Verified_Badge.svg.png"
                  }
                  width="20px"
                  height="20px"
                  alt="Verified"
                />
              )}
            </div>
            <div className={styles.contract_container}>
              <p className={styles.contract_container}>
                {nft.contract?.slice(0, 6)}...{nft.contract?.slice(38)}
              </p>
              <img
                src={
                  "https://etherscan.io/images/brandassets/etherscan-logo-circle.svg"
                }
                width="15px"
                height="15px"
                alt="Etherscan"
              />
            </div>
          </div>
          <div className={styles.description_container}>
            <p>{nft.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}