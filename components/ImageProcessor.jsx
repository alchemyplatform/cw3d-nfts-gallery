import React, {
    useRef,
    useState,
    useImperativeHandle,
    forwardRef,
  } from "react";
  
  const bricks = {
    6284070: "#7f7f7f",
    6284071: "#b3b3b3",
    6284572: "#ffffff",
    6284573: "#d9c58a",
    6284574: "#ff2928",
    6284575: "#4d95fb",
    6284577: "#ffed02",
    6284582: "#ff9634",
    6284583: "#b9e74f",
    6284584: "#506c9d",
    6284585: "#88323f",
    6284586: "#835138",
    6284587: "#feb5f0",
    6284589: "#9c734f",
    6284592: "#fffbe0",
    6284595: "#7a803a",
    6284596: "#7e7e7e",
    6284598: "#ddec9b",
    6284602: "#90bbf7",
    6311436: "#ff719d",
    6311437: "#1fa6a0",
    6315196: "#ffddb9",
    6322813: "#503b16",
    6322818: "#d8f9f0",
    6322819: "#71bddc",
    6322820: "#d0a7e3",
    6322821: "#fc44bf",
    6322822: "#ffbf31",
    6322823: "#c1e0fe",
    6322824: "#3f99cc",
    6322840: "#ac603d",
    6322841: "#a69579",
    6322842: "#99a6af",
    6343472: "#e79f71",
    6343806: "#fffe88",
    6353793: "#6cd554",
    6376825: "#fffd04",
    6396247: "#38c764",
  };
  
  const ImageProcessor = forwardRef(
    ({ imageProcessorRef, selectedNftImage }, ref) => {
      const imageInputRef = useRef(null);
      const pixelArtCanvasRef = useRef(null);
      const scaledCanvasRef = useRef(null);
      const thumbnailCanvasRef = useRef(null);
      const legoBoardColorButtonRef = useRef(null);
      const colorKeyDivRef = useRef(null);
      const instructionsDivRef = useRef(null);
      const heightInputRef = useRef(null);
      const widthInputRef = useRef(null);
      const piecesCountRef = useRef(null);
      const generateButtonSpinnerRef = useRef(null);
      const generateButtonTextRef = useRef(null);
      const mosaicTitleRef = useRef(null);
  
      const [customWidth, setCustomWidth] = useState(32);
      const [customHeight, setCustomHeight] = useState(32);
      const [customColor, setCustomColor] = useState("white");
      const [layers, setLayers] = useState(1);
  
      useImperativeHandle(ref, () => ({
        processImage: handleImageUpload,
      }));
  
      function getBrickLink(uuid) {
        let url = `https://www.lego.com/en-gb/pick-and-build/pick-a-brick?designNumber=35381&query=${uuid}`;
        return url;
      }
  
      const handleHeightWidthChange = () => {
        const pixelArtCanvas = pixelArtCanvasRef.current;
        const heightInput = heightInputRef.current;
        const widthInput = widthInputRef.current;
  
        if (pixelArtCanvas && heightInput && widthInput) {
          pixelArtCanvas.classList.remove(`b-${customWidth}x${customHeight}`);
          setCustomHeight(parseInt(heightInput.value));
          setCustomWidth(parseInt(widthInput.value));
          pixelArtCanvas.classList.add(
            `b-${widthInput.value}x${heightInput.value}`,
          );
        }
      };
  
      const setBoardColor = () => {
        const dropdownItems = document.querySelectorAll(".dropdown-item");
        dropdownItems.forEach((item) => {
          item.classList.remove("active");
          item.removeAttribute("aria-current");
        });
  
        const clickedButton = document.querySelector(
          `.dropdown-item[data-color="${color}"]`,
        );
        clickedButton?.classList.add("active");
        clickedButton?.setAttribute("aria-current", "true");
  
        const pixelArtCanvas = pixelArtCanvasRef.current;
        const legoBoardColorButton = legoBoardColorButtonRef.current;
  
        if (pixelArtCanvas && legoBoardColorButton) {
          pixelArtCanvas.classList.remove(`b-${customColor}`);
          setCustomColor(color);
          pixelArtCanvas.classList.add(`b-${color}`);
          const buttonTextColor = color === "white" ? "t-black" : "t-white";
          legoBoardColorButton.className = `btn btn-secondary dropdown-toggle pt-sans bg-${color} ${buttonTextColor}`;
        }
      };
  
      const downloadImage = async (url) => {
        const ipfsGatewayUrl = url.replace("ipfs://", "https://ipfs.io/ipfs/");
        const response = await fetch(ipfsGatewayUrl);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = (error) => reject(error);
          image.src = URL.createObjectURL(blob);
        });
      };
  
      const handleImageUpload = async () => {
        const generateButtonSpinner = generateButtonSpinnerRef.current;
        const generateButtonText = generateButtonTextRef.current;
  
        if (generateButtonSpinner && generateButtonText) {
          generateButtonSpinner.classList.remove("d-none");
          generateButtonSpinner.classList.add("d-block");
          generateButtonText.innerText = "Loading..";
  
          try {
            if (selectedNftImage && selectedNftImage.raw.length > 0) {
              const ipfsGatewayUrl = selectedNftImage.raw;
              const image = await downloadImage(ipfsGatewayUrl);
              await processImage();
              return pixelArtCanvasRef.current;
            } else {
              console.error("Invalid selectedNftImage object");
              return null;
            }
          } catch (ex) {
            console.error(`Something went wrong during processImage(): ${ex}`);
            return null;
          } finally {
            generateButtonSpinner.classList.remove("d-block");
            generateButtonSpinner.classList.add("d-none");
            generateButtonText.innerText = "Generate Instructions";
          }
        }
      };
  
      const processImage = (image) => {
        return new Promise((resolve, reject) => {
          const imageInput = imageInputRef.current;
          const pixelArtCanvas = pixelArtCanvasRef.current;
          const scaledCanvas = scaledCanvasRef.current;
          const thumbnailCanvas = thumbnailCanvasRef.current;
  
          if (pixelArtCanvas && scaledCanvas && thumbnailCanvas) {
            const file = imageInput?.files ? imageInput.files[0] : null;
            const imageUrl =
              selectedNftImage.raw?.replace("ipfs://", "https://ipfs.io/ipfs/") ||
              (file ? URL.createObjectURL(file) : null);
  
            if (imageUrl) {
              const heightPixels = 27 * customHeight;
              const widthPixels = 27 * customWidth;
  
              pixelArtCanvas.width = widthPixels;
              pixelArtCanvas.height = heightPixels;
  
              scaledCanvas.height = customHeight;
              scaledCanvas.width = customWidth;
  
              const img = new Image();
              img.crossOrigin = "Anonymous"; // Add this line
              img.onload = () => {
                const scaleFactor = Math.max(
                  widthPixels / img.width,
                  heightPixels / img.height,
                );
                const scaledWidth = img.width * scaleFactor;
                const scaledHeight = img.height * scaleFactor;
  
                thumbnailCanvas.width = scaledWidth;
                thumbnailCanvas.height = scaledHeight;
  
                const scaledCtx = scaledCanvas.getContext("2d");
                const pixelArtCtx = pixelArtCanvas.getContext("2d");
                const thumbnailCtx = thumbnailCanvas.getContext("2d");
  
                if (scaledCtx && pixelArtCtx && thumbnailCtx) {
                  scaledCtx.clearRect(
                    0,
                    0,
                    scaledCanvas.width,
                    scaledCanvas.height,
                  );
                  pixelArtCtx.clearRect(
                    0,
                    0,
                    pixelArtCanvas.width,
                    pixelArtCanvas.height,
                  );
                  thumbnailCtx.clearRect(
                    0,
                    0,
                    thumbnailCanvas.width,
                    thumbnailCanvas.height,
                  );
  
                  scaledCtx.drawImage(
                    img,
                    0,
                    0,
                    img.width,
                    img.height,
                    0,
                    0,
                    customWidth,
                    customHeight,
                  );
                  thumbnailCtx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
  
                  drawPixelArt(customWidth, customHeight, pixelArtCtx, scaledCtx);
                  resolve();
                }
              };
              img.src = imageUrl;
            } else {
              reject(new Error("No image selected"));
            }
          } else {
            reject(new Error("Required elements not found"));
          }
        });
      };
  
      const drawPixelArt = (width, height, pixelArtCtx, scaledCtx) => {
        const circleRadius = 13.5;
        const colorKey = {};
        const colorKeyCount = {};
        let colorNumber = 1;
        const colorKeyDiv = colorKeyDivRef.current;
  
        if (colorKeyDiv) {
          pixelArtCtx.clearRect(0, 0, width, height);
          const canvas = pixelArtCanvasRef.current;
          colorKeyDiv.innerHTML = "";
  
          for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
              const pixelRGBA = getPixelColor(x, y, scaledCtx);
              if (pixelRGBA.a !== 0) {
                const closestColorKey = findClosestColor(
                  pixelRGBA.r,
                  pixelRGBA.g,
                  pixelRGBA.b,
                );
                const pixelColor = hexToRgb(bricks[closestColorKey]);
  
                let key = findColorKey(colorKey, pixelColor);
                if (key === null) {
                  key = `color_${colorNumber}`;
                  colorKey[key] = pixelColor;
                  colorKeyCount[key] = 1;
                  colorNumber++;
                } else {
                  colorKeyCount[key]++;
                }
  
                const color = colorKey[key];
                const label = key.split("_")[1];
  
                drawNumberedCircle(
                  x * (circleRadius * 2),
                  y * (circleRadius * 2),
                  circleRadius,
                  color,
                  label,
                  pixelArtCtx,
                );
              }
            }
          }
  
          applyLayerAdjustment(colorKeyCount);
  
          let colorKeyTable = "<table>";
          let count = 0;
          let piecesCountTotal = 0;
  
          Object.entries(colorKey).forEach(([key, pixelColor]) => {
            let hexColor = rgbToHex(pixelColor.r, pixelColor.g, pixelColor.b);
            let label = key.split("_")[1];
            let brickCount = colorKeyCount[key];
            piecesCountTotal += brickCount;
  
            if (count % 5 === 0) {
              colorKeyTable += "<tr>";
            }
  
            let uuid = reverseLookup(hexColor, bricks);
  
            colorKeyTable += `<td class="mr-2">${label}: <a target="_blank" rel="noopener noreferrer" href="${getBrickLink(uuid)}">${uuid}</a><span>x ${brickCount}</span></td>`;
          });
  
          piecesCountRef.current.textContent = piecesCountTotal;
          colorKeyTable += "</table>";
          colorKeyDiv.innerHTML = colorKeyTable;
        }
      };
  
      const applyLayerAdjustment = (colorKeyCount) => {
        const sortedColorKeyCount = Object.entries(colorKeyCount).sort(
          (a, b) => b[1] - a[1],
        );
        const groupSize = Math.ceil(sortedColorKeyCount.length / layers);
        let layerMultiplier = 1;
        for (let i = 0; i < sortedColorKeyCount.length; i++) {
          const [key, count] = sortedColorKeyCount[i];
          colorKeyCount[key] = count * layerMultiplier;
          if ((i + 1) % groupSize === 0) {
            layerMultiplier++;
          }
        }
      };
  
      const getPixelColor = (x, y, ctx) => {
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        return { r: pixel[0], g: pixel[1], b: pixel[2], a: pixel[3] };
      };
  
      function reverseLookup(hexColor, bricksObject) {
        for (const [id, color] of Object.entries(bricksObject)) {
          if (color === hexColor) {
            return id;
          }
        }
        return null; // Return null if no matching id is found
      }
  
      const findColorKey = (colorKey, color) => {
        for (const key in colorKey) {
          const pixelColor = colorKey[key];
          if (
            pixelColor.r === color.r &&
            pixelColor.g === color.g &&
            pixelColor.b === color.b
          ) {
            return key;
          }
        }
        return null;
      };
  
      const findClosestColor = (r, g, b) => {
        let minDistance = Number.MAX_VALUE;
        let closestColorKey = "";
        Object.keys(bricks).forEach((key) => {
          const rgb = hexToRgb(bricks[key]);
          const distance = Math.sqrt(
            (rgb.r - r) ** 2 + (rgb.g - g) ** 2 + (rgb.b - b) ** 2,
          );
          if (distance < minDistance) {
            minDistance = distance;
            closestColorKey = key;
          }
        });
        return closestColorKey;
      };
  
      const drawNumberedCircle = (x, y, radius, color, label, ctx) => {
        ctx.beginPath();
        ctx.arc(x + radius, y + radius, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#003300";
        ctx.stroke();
  
        ctx.fillStyle = "black";
        ctx.font = "bold 13px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, x + radius, y + radius);
      };
  
      const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
          ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
            }
          : { r: 0, g: 0, b: 0 };
      };
  
      const rgbToHex = (r, g, b) => {
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
      };
  
      const downloadCanvas = () => {
        const canvas = pixelArtCanvasRef.current;
        const dataURL = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = dataURL;
        link.download = "mosaic.png";
        link.click();
      };
  
      return (
        <div>
          <h2>Mosaic Builder</h2>
          <div className="mb-3">
            <label htmlFor="widthInput" className="form-label">
              Width (in bricks)
            </label>
            <input
              type="number"
              className="form-control"
              id="widthInput"
              min="1"
              max="100"
              value={customWidth}
              onChange={handleHeightWidthChange}
              ref={widthInputRef}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="heightInput" className="form-label">
              Height (in bricks)
            </label>
            <input
              type="number"
              className="form-control"
              id="heightInput"
              min="1"
              max="100"
              value={customHeight}
              onChange={handleHeightWidthChange}
              ref={heightInputRef}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="layersInput" className="form-label">
              Layers
            </label>
            <input
              type="number"
              className="form-control"
              id="layersInput"
              min="1"
              max="10"
              value={layers}
              onChange={(e) => setLayers(parseInt(e.target.value))}
            />
          </div>
          <div></div>
          <button className="btn btn-primary" onClick={handleImageUpload}>
            <div
              ref={generateButtonSpinnerRef}
              className="d-none spinner-border spinner-border-sm text-light mr-2"
              role="status"
            ></div>
            <span ref={generateButtonTextRef}>Generate Instructions</span>
          </button>
          <canvas ref={scaledCanvasRef} style={{ display: "none" }}></canvas>
          <canvas ref={thumbnailCanvasRef} style={{ display: "none" }}></canvas>
          <div ref={colorKeyDivRef} className="mt-3"></div>
          <div ref={piecesCountRef} className="mt-3"></div>
          <canvas
            ref={pixelArtCanvasRef}
            className={`b-${customWidth}x${customHeight}`}
            style={{ width: "100%" }}
          ></canvas>
          <button onClick={downloadCanvas}>Download Instructions</button>
        </div>
      );
    },
  );
  
  export default ImageProcessor;