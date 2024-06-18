import React, { useRef } from "react";
import styles from "../styles/Modal.module.css";
import ImageProcessor from "./ImageProcessor";

export default function Modal({ nft, onClose, selectedChain }) {
  const imageProcessorRef = useRef(null);

  const handleProcessImage = async () => {
    const processedCanvas = await imageProcessorRef.current.processImage();
    if (processedCanvas) {
      const processedImageData = processedCanvas.toDataURL();
      nft.media = processedImageData;
    }
  };

  if (!nft) return null;

  return (
    <div className={styles.modal_overlay}>
      <div className={styles.modal_content}>
        <button className={styles.close_button} onClick={onClose}>
          &times;
        </button>
        <div className={styles.image_container}>
          {nft.format === "mp4" ? (
            <video src={nft.media.gateway} controls>
              Your browser does not support the video tag.
            </video>
          ) : (
            <img src={nft.media.gateway} alt={nft.title} />
          )}
        </div>
        <div className={styles.info_container}>
          <h3>{nft.title}</h3>
          <p>{nft.description}</p>
        </div>
        <ImageProcessor ref={imageProcessorRef} selectedNftImage={nft.media} />
      </div>
    </div>
  );
}