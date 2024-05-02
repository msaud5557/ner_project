import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Typography,
  IconButton,
  Snackbar,
  Alert,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  Paper,
} from "@mui/material";
import FileUpload from "./FileUpload";
import FilePreviews from "./FilePreviews";
import Sidebar from "./Sidebar";
import FloatingToolbar from "./FloatingToolbar";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import LockIcon from "@mui/icons-material/Lock";
import DownloadForOfflineIcon from "@mui/icons-material/DownloadForOffline";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import UndoIcon from "@mui/icons-material/Undo";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArchiveIcon from "@mui/icons-material/Archive";
import JSZip from "jszip";
import axios from "axios";
import { Stage, Layer, Image, Rect, Group, Transformer } from "react-konva";

const AnoMainSection = ({ authToken }) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedImageSrc, setSelectedImageSrc] = useState(null);
  const [showPreviews, setShowPreviews] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isLocked, setIsLocked] = useState(false);
  const [rectangles, setRectangles] = useState([]);
  const [selectedRectangleIndex, setSelectedRectangleIndex] = useState(null);
  const [isNewImageSelected, setIsNewImageSelected] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [labels, setLabels] = useState([]);
  const [generatedLabels, setGeneratedLabels] = useState([]);
  const [selectedLabel, setSelectedLabel] = useState("");
  const [showGenerateLabels, setShowGenerateLabels] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [tempRect, setTempRect] = useState(null);
  const [initialImagePosition, setInitialImagePosition] = useState({
    x: 0,
    y: 0,
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [instructions, setInstructions] = useState("");
  const [annotations, setAnnotations] = useState({});
  const [originalImageWidth, setOriginalImageWidth] = useState(null);
  const [originalImageHeight, setOriginalImageHeight] = useState(null);
  const [showFilesDialog, setShowFilesDialog] = useState(false);
  const [serverFiles, setServerFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [initialScale, setInitialScale] = useState(null);
  const [initialX, setInitialX] = useState(null);

  const imageRef = useRef(null);
  const stageRef = useRef(null);
  const layerRef = useRef(null);
  const imageElementRef = useRef(null);

  const crosshairCursorClass = "crosshair-cursor";

  const handleItemClick = (item) => {
    setSelectedItem(item);
    if (item.url) {
      const imageUrl = `http://135.181.6.243:9000${item.url}`;

      setSelectedImageSrc(imageUrl);
      setIsNewImageSelected(true);
      setRectangles([]);
      setShowPreviews(true);
      setSelectedFileName(item.name);
      setGeneratedLabels(item.labels);
      setShowGenerateLabels(true);
      setSelectedImageIndex(item.id);
      setOriginalImageWidth(item.width);
      setOriginalImageHeight(item.height);

      // Fetch the image file
      axios
        .get(imageUrl, { responseType: "blob" })
        .then((response) => {
          const file = new File([response.data], item.name, {
            type: response.headers["content-type"],
          });
          setUploadedFiles([file]);

          const img = new Image();
          const blobUrl = URL.createObjectURL(response.data);
          img.src = blobUrl;
          img.onload = () => {
            const width = img.naturalWidth;
            const height = img.naturalHeight;
            setOriginalImageWidth(width);
            setOriginalImageHeight(height);
            URL.revokeObjectURL(blobUrl);
          };
        })
        .catch((error) => {
          console.error("Error fetching the image:", error);
        });
    }
    if (item.labels) {
      const parsedLabels = JSON.parse(item.labels.text);
      const mappedLabels = parsedLabels.map((label) => ({
        label: label,
        color: getRandomColor(),
      }));
      setGeneratedLabels(mappedLabels);
      setLabels(mappedLabels);
    }
  };

  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const handleLoadServerFiles = () => {
    setShowFilesDialog(true);

    if (authToken) {
      setLoadingFiles(true);
      axios
        .get("http://135.181.6.243:9000/images/getAll/", {
          headers: {
            Authorization: `Token ${authToken}`,
          },
        })
        .then((response) => {
          setServerFiles(response.data);
          setLoadingFiles(false);
        })
        .catch((error) => {
          console.error("Error loading server files:", error);
          setLoadingFiles(false);
        });
    } else {
      // Handle the case when the user is not authenticated
    }
  };

  console.log("Width:",originalImageWidth);
  console.log("Height:",originalImageHeight);

  useEffect(() => {
    if (selectedImageSrc) {
      const image = new window.Image();
      image.src = selectedImageSrc;
      image.onload = async () => {
        imageRef.current = image;
        imageElementRef.current = image;
        const stage = stageRef.current;
        const stageWidth = stage.width();
        const stageHeight = stage.height();
        const imageWidth = image.width;
        const imageHeight = image.height;
        const scaleToFitWidth = stageWidth / imageWidth;
        const scaleToFitHeight = stageHeight / imageHeight;
        const initialScale = Math.min(scaleToFitWidth, scaleToFitHeight);
        const scaledWidth = imageWidth * initialScale;
        const scaledHeight = imageHeight * initialScale;
        const initialX = (stageWidth - scaledWidth) / 2;
        const initialY = (stageHeight - scaledHeight) / 2;
        setInitialImagePosition({ x: initialX, y: initialY });
        setZoomLevel(initialScale);
        const layer = layerRef.current;
        layer.destroyChildren();
        const validRectangles = rectangles.filter((rect) => {
          return (
            rect.label &&
            generatedLabels.some((labelObj) => labelObj.label === rect.label)
          );
        });
        const imageNode = new window.Konva.Image({
          image: image,
          x: initialX,
          y: initialY,
          scaleX: initialScale,
          scaleY: initialScale,
        });
        layer.add(imageNode);
        validRectangles.forEach((rect, index) => {
          const labelObj = generatedLabels.find(
            (labelObj) => labelObj.label === rect.label
          );
          const strokeColor = labelObj ? labelObj.color : "yellow";
          const konvaRect = new window.Konva.Rect({
            ...rect,
            stroke: selectedRectangleIndex === index ? "red" : strokeColor,
            strokeWidth: 2,
            label: rect.label,
          });
          konvaRect.on("click", () => {
            console.log("Selected Rectangle Properties:");
            console.log("X:", konvaRect.x());
            console.log("Y:", konvaRect.y());
            console.log("Width:", konvaRect.width());
            console.log("Height:", konvaRect.height());
            console.log("Label:", konvaRect.label);
          });
          layer.add(konvaRect);
        });

        layer.batchDraw();
        setIsNewImageSelected(false); 

        setInitialScale(initialScale);
        setInitialX(initialX);
        const yoloAnnotations = validRectangles
          .map((rect) => {
            const labelObj = generatedLabels.find(
              (labelObj) => labelObj.label === rect.label
            );
            if (labelObj) {
              const classId = labelObj.classId;
              const x = ((rect.x - initialX + rect.width / 2) / initialScale) / imageWidth;
              const y = ((rect.y + rect.height / 2) / initialScale) / imageHeight;
              const width = rect.width / (imageWidth * initialScale);
              const height = rect.height / (imageHeight * initialScale);
              return `${classId} ${x.toFixed(6)} ${y.toFixed(
                6
              )} ${width.toFixed(6)} ${height.toFixed(6)}`;
            }
            return null;
          })
          .filter((annotation) => annotation !== null);
      };
      if (
        selectedImageIndex !== null &&
        selectedImageIndex < uploadedFiles.length
      ) {
        const selectedFile = uploadedFiles[selectedImageIndex];
        setSelectedFileName(selectedFile.name);
      }
      setInstructions("Note: Lock screen to Annotate.");
    }
  }, [
    selectedImageSrc,
    isNewImageSelected,
    zoomLevel,
    rectangles,
    selectedImageIndex,
    uploadedFiles,
    generatedLabels,
    selectedRectangleIndex,
  ]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === "z") {
        event.preventDefault();
        undoLastRectangle();
      }
      if (event.ctrlKey && event.key === "l") {
        event.preventDefault();
        toggleLock();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (uploadedFiles.length === 0) {
      setSelectedImageSrc(null);
      setSelectedImageIndex(null);
      setRectangles([]);
      setIsNewImageSelected(false);
      setSelectedFileName("");
      setInstructions("");
    } else if (selectedImageIndex === null) {
      setSelectedImageIndex(0);
      setSelectedImageSrc(URL.createObjectURL(uploadedFiles[0]));
      setIsNewImageSelected(true);
      setSelectedFileName(uploadedFiles[0].name);
    }
  }, [uploadedFiles, selectedImageIndex]);

  const handleFilesSelect = (files) => {
    console.log("All Selected Files:");
    const imageFiles = files.filter((file) => {
      const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
      return validImageTypes.includes(file.type);
    });

    console.log("Filtered Image Files:", imageFiles);

    if (isNewImageSelected || rectangles.length === 0) {
      console.log("Setting up new image...");
      setUploadedFiles(imageFiles);
      setSelectedImageIndex(0);
      const imageUrl = URL.createObjectURL(imageFiles[0]);
      console.log("New Image URL:", imageUrl);
      setSelectedImageSrc(imageUrl);
      setShowPreviews(true);
      setRectangles([]);
      setIsNewImageSelected(false);
      setSelectedFileName(imageFiles[0].name);
    } else {
      const confirmChange = window.confirm(
        "Changing the image will discard your current annotations. Do you want to proceed?"
      );
      if (confirmChange) {
        console.log("Changing the image...");
        setUploadedFiles(imageFiles);
        setSelectedImageIndex(0);
        const imageUrl = URL.createObjectURL(imageFiles[0]);
        console.log("New Image URL:", imageUrl);
        setSelectedImageSrc(imageUrl);
        setShowPreviews(true);
        setRectangles([]);
        setIsNewImageSelected(false);
        setSelectedFileName(imageFiles[0].name);
      } else {
        console.log("Image change canceled.");
      }
    }
  };

  const saveAnnotations = () => {
    if (!authToken) {
      setSnackbarMessage("Please login to save file on the server.");
      setSnackbarOpen(true);
      return;
    }
    if (selectedImageSrc && rectangles.length > 0) {
      const formData = new FormData();
      formData.append("images", uploadedFiles[selectedImageIndex]);
      formData.append(
        "labels",
        JSON.stringify(generatedLabels.map((labelObj) => labelObj.label))
      );

      const imageWidth = originalImageWidth;
      const imageHeight = originalImageHeight;
      const normalizedRectangles = rectangles.map((rect) => {
        let x, y, width, height;

        if (rect.width >= 0 && rect.height >= 0) {
          x = ((rect.x - initialX + rect.width / 2) / initialScale) / imageWidth;
          y = ((rect.y + rect.height / 2) / initialScale) / imageHeight;
          width = Math.abs(rect.width) / (imageWidth * initialScale);
          height = Math.abs(rect.height) / (imageHeight * initialScale);
        } else {
          x = ((rect.x - initialX + rect.width / 2) / initialScale) / imageWidth;
          y = ((rect.y + rect.height / 2) / initialScale) / imageHeight;
          width = Math.abs(rect.width) / (imageWidth * initialScale);
          height = Math.abs(rect.height) / (imageHeight * initialScale);
        }

        const labelId = generatedLabels.findIndex(
          (labelObj) => labelObj.label === rect.label
        );
        return `${labelId} ${x.toFixed(6)} ${y.toFixed(6)} ${width.toFixed(
          6
        )} ${height.toFixed(6)}`;
      });

      formData.append("annotations", JSON.stringify(normalizedRectangles));
      formData.append("width", imageWidth);
      formData.append("height", imageHeight);

      axios
        .post("http://135.181.6.243:9000/images/upload/", formData, {
          headers: {
            Authorization: `Token ${authToken}`,
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          console.log("Upload successful:", response.data);
          setSnackbarMessage("Annotations uploaded successfully!");
          setSnackbarOpen(true);
        })
        .catch((error) => {
          console.error("Error uploading annotations:", error);
          setSnackbarMessage("Error uploading annotations. Please try again.");
          setSnackbarOpen(true);
        });
    } else {
      setSnackbarMessage(
        "Please select an image and annotate it before uploading."
      );
      setSnackbarOpen(true);
    }
  };

  const downloadAllAnnotations = () => {
    const zip = new JSZip();

    Object.entries(annotations).forEach(([fileName, rects]) => {
      const yoloData = rects.map((rect) => {
        const x = (rect.x + rect.width / 2) / imageRef.current.width;
        const y = (rect.y + rect.height / 2) / imageRef.current.height;
        const width = rect.width / imageRef.current.width;
        const height = rect.height / imageRef.current.height;
        const labelId = generatedLabels.findIndex(
          (labelObj) => labelObj.label === rect.label
        );
        return `${labelId} ${x.toFixed(6)} ${y.toFixed(6)} ${width.toFixed(
          6
        )} ${height.toFixed(6)}`;
      });

      const yoloText = yoloData.join("\n");
      zip.file(`${fileName.replace(/\s+/g, "_")}_annotations.txt`, yoloText);
    });

    zip.generateAsync({ type: "blob" }).then((blob) => {
      const zipUrl = URL.createObjectURL(blob);
      const zipDownloadLink = document.createElement("a");
      zipDownloadLink.style.display = "none";
      zipDownloadLink.href = zipUrl;
      zipDownloadLink.download = "annotations.zip";
      document.body.appendChild(zipDownloadLink);
      zipDownloadLink.click();

      URL.revokeObjectURL(zipUrl);
    });
  };

  const handleDeleteImage = (index) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
  };

  const handleImageSelect = (index) => {
    const selectedImageURL = URL.createObjectURL(uploadedFiles[index]);
  
    if (isNewImageSelected || rectangles.length === 0) {
      setSelectedImageSrc(selectedImageURL);
      setSelectedImageIndex(index);
      setRectangles([]);
      setIsNewImageSelected(true);
      setSelectedFileName(uploadedFiles[index].name);
    } else {
      const userConfirmed = window.confirm("Do you want to change the image?");
      if (userConfirmed) {
        const loadPreviousLabels = window.confirm("Do you want to load previous labels?");
        if (loadPreviousLabels) {
          setSelectedImageSrc(selectedImageURL);
          setSelectedImageIndex(index);
          setIsNewImageSelected(true);
          setSelectedFileName(uploadedFiles[index].name);
        } else {
          setSelectedImageSrc(selectedImageURL);
          setSelectedImageIndex(index);
          setRectangles([]);
          setIsNewImageSelected(true);
          setSelectedFileName(uploadedFiles[index].name);
        }
      }
    }
  };

  const toggleLock = () => {
    setIsLocked((prevIsLocked) => !prevIsLocked);
  };

  const handleLabelChange = (updatedLabels) => {
    setGeneratedLabels(updatedLabels);
  };

  const handleStageMouseDown = (e) => {
    if (isLocked && selectedLabel) {
      setDrawing(true);
      const stage = stageRef.current;
      const pointer = stage.getPointerPosition();
      setStartPoint({
        x: pointer.x,
        y: pointer.y,
      });
      const labelObj = generatedLabels.find(
        (labelObj) => labelObj.label === selectedLabel
      );
      if (labelObj) {
        const color = labelObj.color;
        setTempRect({
          x: pointer.x,
          y: pointer.y,
          width: 0,
          height: 0,
          label: selectedLabel,
          stroke: color,
          strokeWidth: 2,
        });
      }
    }
  };

  const handleMouseUp = () => {
    if (tempRect) {
      const updatedRectangles = [...rectangles];
      updatedRectangles.push(tempRect);
      setRectangles(updatedRectangles);
      setTempRect(null);
      setDrawing(false);
    }
  };

  const handleMouseMove = (e) => {
    if (drawing) {
      const stage = stageRef.current;
      const pointer = stage.getPointerPosition();
      const width = pointer.x - startPoint.x;
      const height = pointer.y - startPoint.y;

      setTempRect((prevTempRect) => ({
        ...prevTempRect,
        width: width,
        height: height,
      }));
    }
  };

  const undoLastRectangle = () => {
    setRectangles((prevRectangles) => {
      if (prevRectangles.length === 0) {
        return prevRectangles;
      }
      const newRectangles = [...prevRectangles];
      newRectangles.pop();
      return newRectangles;
    });
  };

  const generateAndDownloadYOLOData = () => {
    const imageWidth = originalImageWidth;
    const imageHeight = originalImageHeight;
    const fileNameWithoutExtension = selectedFileName.replace(/\..+$/, "");
    const normalizedRectangles = rectangles.map((rect) => {
      let x, y, width, height;

      if (rect.width >= 0 && rect.height >= 0) {
        x = ((rect.x - initialX + rect.width / 2) / initialScale) / imageWidth;
        y = ((rect.y + rect.height / 2) / initialScale) / imageHeight;
        width = Math.abs(rect.width) / (imageWidth * initialScale);
        height = Math.abs(rect.height) / (imageHeight * initialScale);
      } else {
        x = ((rect.x - initialX + rect.width / 2) / initialScale) / imageWidth;
        y = ((rect.y + rect.height / 2) / initialScale) / imageHeight;
        width = Math.abs(rect.width) / (imageWidth * initialScale);
        height = Math.abs(rect.height) / (imageHeight * initialScale);
      }
      const labelId = generatedLabels.findIndex(
        (labelObj) => labelObj.label === rect.label
      );
      return `${labelId} ${x.toFixed(6)} ${y.toFixed(6)} ${width.toFixed(
        6
      )} ${height.toFixed(6)}`;
    });

    const yoloText = normalizedRectangles.join("\n");

    const yoloBlob = new Blob([yoloText], { type: "text/plain" });

    const yoloUrl = URL.createObjectURL(yoloBlob);
    const yoloDownloadLink = document.createElement("a");
    yoloDownloadLink.style.display = "none";
    yoloDownloadLink.href = yoloUrl;
    yoloDownloadLink.download = `${fileNameWithoutExtension.replace(
      /\s+/g,
      "_"
    )}.txt`;

    document.body.appendChild(yoloDownloadLink);
    yoloDownloadLink.click();

    URL.revokeObjectURL(yoloUrl);

    const stage = stageRef.current;
    const layer = layerRef.current;
    stage.toDataURL({
      callback: function (dataUrl) {
        const imageBlob = dataURItoBlob(dataUrl);
        const imageUrl = URL.createObjectURL(imageBlob);
        const imageDownloadLink = document.createElement("a");
        imageDownloadLink.style.display = "none";
        imageDownloadLink.href = imageUrl;
        imageDownloadLink.download = `${fileNameWithoutExtension.replace(
          /\s+/g,
          "_"
        )}.png`;

        document.body.appendChild(imageDownloadLink);
        imageDownloadLink.click();
        URL.revokeObjectURL(imageUrl);
      },
    });
  };

  function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(",")[1]);
    const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  const handleTransform = (index, e) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const newRectangles = [...rectangles];
    newRectangles[index] = {
      ...newRectangles[index],
      x: node.x(),
      y: node.y(),
      width: node.width() * scaleX,
      height: node.height() * scaleY,
    };
    setRectangles(newRectangles);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        style={{
          backgroundColor: "#333333",
          minHeight: "90vh",
          display: "flex",
        }}
      >
        <Container
          maxWidth="sm"
          sx={{
            backgroundColor: "#333333",
            minHeight: "80vh",
            display: "flex",
            width: "30%",
            flexDirection: "column",
            justifyContent: "center",
            gap: 1,
          }}
        >
          <Container
            className="scrollbar-container"
            sx={{
              backgroundColor: "#28231D",
              minHeight: "65vh",
              maxHeight: "65vh",
              borderRadius: "6px",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                backgroundColor: "#fff",
                color: "#28231D",
                padding: "2px 4px",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: "1rem",
              }}
            >
              <span
                style={{
                  marginRight: "4px",
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              >
                - Total Files: {uploadedFiles.length} -
              </span>
            </div>
            <FilePreviews
              uploadedFiles={uploadedFiles}
              onDeleteImage={handleDeleteImage}
              onSelectImage={handleImageSelect}
              selectedImage={selectedImageSrc}
              selectedImageIndex={selectedImageIndex}
            />
          </Container>
          <Container
            sx={{
              backgroundColor: "#28231D",
              maxHeight: "18vh",
              padding: "10px 20px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "6px",
              marginTop: "0.5rem",
            }}
          >
            <FileUpload
              authToken={authToken}
              onFilesSelect={handleFilesSelect}
              onOriginalImageWidth={originalImageWidth}
              onOriginalImageHeight={originalImageHeight}
              setOriginalImageWidth={setOriginalImageWidth}
              setOriginalImageHeight={setOriginalImageHeight}
            />
          </Container>
        </Container>

        <div
          style={{
            backgroundColor: "#28231D",
            minHeight: "80vh",
            display: "flex",
            flexDirection: "row",
            maxwidth: "70%",
          }}
        >
          <div>
            <Container
              sx={{
                backgroundColor: "#333333",
                minHeight: "9vh",
                maxHeight: "9vh",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "0.25rem",
                borderLeft: "2px solid #28231D",
                borderRight: "2px solid #28231D",
              }}
            >
              <div
                style={{
                  display: "flex",
                  minWidth: "30%",
                }}
              >
                <Typography
                  variant="overline"
                  sx={{ color: "white", cursor: "pointer" }}
                >
                  {selectedFileName}
                </Typography>
              </div>
              <div
                style={{
                  display: "flex",
                  minWidth: "40%",
                  justifyContent: "center",
                }}
              >
                <Tooltip title="Lock Layout to Draw">
                  <IconButton onClick={toggleLock} sx={{ color: "white" }}>
                    {isLocked ? <LockIcon /> : <LockOpenIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Undo Last Rect">
                  <IconButton
                    onClick={undoLastRectangle}
                    sx={{ color: "white" }}
                  >
                    <UndoIcon />
                  </IconButton>
                </Tooltip>

                <FloatingToolbar
                  isLocked={!isLocked}
                  onLabelsGenerated={handleLabelChange}
                  generatedLabels={generatedLabels}
                  selectedLabel={selectedLabel}
                  setSelectedLabel={setSelectedLabel}
                  selectedFileName={selectedFileName}
                  instructions="Instructions: Lock the screen to generate rectangles based on labels."
                />
                <Tooltip title="Generate Single Annotation">
                  <IconButton
                    onClick={generateAndDownloadYOLOData}
                    sx={{ color: "white", cursor: "pointer" }}
                  >
                    <DownloadForOfflineIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Save Annotations">
                  <IconButton
                    onClick={saveAnnotations}
                    sx={{ color: "white", cursor: "pointer" }}
                  >
                    <CloudUploadIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download All Annotations">
                  <IconButton
                    onClick={downloadAllAnnotations}
                    sx={{ color: "white", cursor: "pointer" }}
                  >
                    <ArchiveIcon />
                  </IconButton>
                </Tooltip>
              </div>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleLoadServerFiles}
                sx={{
                  color: "white",
                }}
              >
                Load Server Files
              </Button>
            </Container>
            <TransformWrapper
              options={{
                limitToBounds: false,
              }}
              disabled={isLocked}
            >
              <TransformComponent>
                <Stage
                  width={window.innerWidth * 0.5}
                  height={window.innerHeight * 0.82}
                  ref={stageRef}
                  onMouseDown={handleStageMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  className={isLocked ? crosshairCursorClass : ""}
                >
                  <Layer ref={layerRef}>
                    {selectedImageSrc && (
                      <Image
                        image={imageElementRef.current}
                        maxWidth="350px"
                        maxHeight="100%"
                        scaleX={zoomLevel}
                        scaleY={zoomLevel}
                        x={initialImagePosition.x}
                        y={initialImagePosition.y}
                      />
                    )}

                    {rectangles.map((rect, index) => (
                      <Group
                        key={index}
                        onTransform={(e) => handleTransform(index, e)}
                      >
                        {selectedRectangleIndex === index && (
                          <Transformer anchorSize={6} borderDash={[6, 2]} />
                        )}
                        <Rect
                          {...rect}
                          strokeWidth={rect.strokeWidth}
                          stroke={rect.stroke}
                          onDragMove={(e) => {
                            const newRectangles = [...rectangles];
                            newRectangles[index] = {
                              ...newRectangles[index],
                              x: e.target.x(),
                              y: e.target.y(),
                            };
                            setRectangles(newRectangles);
                          }}
                          onClick={(e) => {
                            console.log(
                              `Rectangle clicked: `,
                              rectangles[index]
                            );
                            setSelectedRectangleIndex(index);
                            e.cancelBubble = true;
                            if (e.stopPropagation) e.stopPropagation();
                          }}
                          onTransform={(e) => {
                            const node = e.target;
                            const scaleX = node.scaleX();
                            const scaleY = node.scaleY();
                            const newRectangles = [...rectangles];
                            newRectangles[index] = {
                              ...newRectangles[index],
                              x: node.x(),
                              y: node.y(),
                              width: node.width() * scaleX,
                              height: node.height() * scaleY,
                            };
                            setRectangles(newRectangles);
                          }}
                        />
                      </Group>
                    ))}

                    {tempRect && (
                      <Rect
                        {...tempRect}
                        strokeWidth={tempRect.strokeWidth}
                        stroke={tempRect.stroke}
                      />
                    )}
                  </Layer>
                </Stage>
              </TransformComponent>
            </TransformWrapper>
          </div>
          <div
            className="scrollbar-container1"
            style={{
              backgroundColor: "#333333",
              maxHeight: "91vh",
              width: "20vw",
              overflowY: "auto",
            }}
          >
            <Sidebar
              onLabelsGenerated={setGeneratedLabels}
              rectangles={rectangles}
              setRectangles={setRectangles}
              showGenerateLabels={showGenerateLabels}
              setShowGenerateLabels={setShowGenerateLabels}
              generatedLabels={generatedLabels}
              setGeneratedLabels={setGeneratedLabels}
              labels={labels}
              setLabels={setLabels}
            />
          </div>
        </div>
      </div>
      <Dialog
        open={showFilesDialog}
        onClose={() => setShowFilesDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: "#28231D",
          },
        }}
      >
        <DialogTitle sx={{ color: "white", fontWeight: "bold" }}>
          Server Files
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {loadingFiles ? (
              <Typography>Loading...</Typography>
            ) : (
              serverFiles.map((item) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                >
                  <Paper
                    elevation={3}
                    style={{
                      height: 370,
                      maxHeight: 370,
                      width: 250,
                      padding: 16,
                      display: "flex",
                      flexDirection: "column",
                      backgroundColor:
                        selectedItem && selectedItem.id === item.id
                          ? "#CFF4D2"
                          : "#FFFFF0",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        marginBottom: "10px",
                        border: "2px solid grey",
                        borderRadius: "2px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <img
                        src={`http://135.181.6.243:9000${item.url}`}
                        alt={`Image ${item.id}`}
                        width="80%"
                        style={{ padding: "6px" }}
                      />
                    </div>
                    <Divider my={2} />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        textAlign: "left",
                        overflowY: "auto",
                      }}
                    >
                      <Typography variant="caption">
                        Name: {item.name}
                      </Typography>
                      {item.labels && item.labels.text ? (
                        <Typography variant="caption">
                          Labels: {item.labels.text}
                        </Typography>
                      ) : (
                        <Typography variant="caption">Labels: N/A</Typography>
                      )}
                      {item.annotations && item.annotations ? (
                        <Typography variant="caption">
                          Annotations: {item.annotations}
                        </Typography>
                      ) : (
                        <Typography variant="caption">
                          Annotations: N/A
                        </Typography>
                      )}
                    </div>
                  </Paper>
                </Grid>
              ))
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            sx={{ color: "white" }}
            onClick={() => setShowFilesDialog(false)}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert variant="filled">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </DndProvider>
  );
};

export default AnoMainSection;
