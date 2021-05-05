const filesInput = document.querySelector('#filesInput');
const fileChosenFilenames = document.querySelector('#file-chosen-filenames');
const imageGallery = document.querySelector('.image-gallery');
const inputImageCanvasList = document.querySelector('.input-image-canvas-list');
const outputImageCanvasList = document.querySelector('.output-image-canvas-list');
const downloadButton = document.querySelector('#download-button');

function clearAllContents() {
    imageGallery.innerHTML = '';
    inputImageCanvasList.innerHTML = '';
    outputImageCanvasList.innerHTML = '';
}

function setAllowDownload(downloadButtonState) {
    downloadButton.disabled = !downloadButtonState;
}

// Declare global zip object
let zip;

downloadButton.addEventListener('click', (event) => {
    zip && zip.generateAsync({ type: 'blob' })
        .then((content) => {
            console.log('Generated!');
            saveAs(content, 'images.zip');
        });
});


filesInput.addEventListener('change', (event) => {
    clearAllContents();
    setAllowDownload(false);
    // Initialize JSZip object
    zip = new JSZip();

    const filesList = event.target.files;

    // Create an images folder in the zip file
    const imagesFolder = zip.folder('images');

    // Count how many files have been added to zip
    let renderedFileCounter = 0;

    // Generate the zip file when all files uploaded are added to it
    const generateZipAndDownload = () => {
        if (renderedFileCounter === filesList.length) {

        }
    };

    // Iterate through all uploaded files
    for (let i = 0; i < filesList.length; i++) {
        const file = filesList[i];
        const fileName = file.name;

        // Show image in image gallery
        const fileImageElement = document.createElement('img');
        fileImageElement.src = URL.createObjectURL(file);
        const fileImageContainer = document.createElement('div');
        fileImageContainer.classList.add('col-md-4', 'p-4', 'd-flex', 'justify-content-center');
        fileImageElement.classList.add('uploaded-image');
        fileImageElement.setAttribute('id', `uploaded-image-${i}`);
        fileImageContainer.appendChild(fileImageElement);
        imageGallery.appendChild(fileImageContainer);

        // Create Canvas for each input image and draw to canvas from image object from Blob
        const inputImageCanvasElement = document.createElement('canvas');
        const inputImageContext = inputImageCanvasElement.getContext('2d');
        const imageObject = new Image();
        imageObject.src = URL.createObjectURL(file);
        inputImageCanvasElement.classList.add('input-image-canvas');
        inputImageCanvasElement.setAttribute('id', `input-image-canvas-${i}`);
        inputImageCanvasList.appendChild(inputImageCanvasElement);

        // Create a canvas for each output image
        const outputImageCanvasElement = document.createElement('canvas');
        outputImageCanvasElement.classList.add('output-image-canvas');
        outputImageCanvasElement.setAttribute('id', `output-image-canvas-${i}`);
        outputImageCanvasList.appendChild(outputImageCanvasElement);

        // Perform image operations on Image load
        imageObject.onload = () => {
            // Draw image on canvas
            inputImageCanvasElement.width = imageObject.width;
            inputImageCanvasElement.height = imageObject.height;
            inputImageContext.drawImage(imageObject, 0, 0);

            // Read into cv.Mat from input canvas
            const sourceImageMat = cv.imread(inputImageCanvasElement);
            // Compute borderwidth = imageHeight * 0.05
            const borderWidth = Math.round(sourceImageMat.size().height * 0.05);
            // Output cv.Mat
            const destImageMat = new cv.Mat();
            // Define colour scale
            const colorScale = new cv.Scalar(255, 255, 255, 255);
            // Add border
            cv.copyMakeBorder(sourceImageMat, destImageMat, borderWidth, borderWidth, borderWidth, borderWidth, cv.BORDER_CONSTANT, colorScale);
            // Draw on output canvas with cv.imshow()
            cv.imshow(outputImageCanvasElement, destImageMat);
            // Free resources
            sourceImageMat.delete();
            destImageMat.delete();

            // Convert canvas to Data URL
            const outputURI = outputImageCanvasElement.toDataURL('image/png', 1.0);
            // Extract base64 data from Data URL
            const base64Data = outputURI.split(';base64,')[1];
            imagesFolder.file(fileName, base64Data, { base64: true });
            // Increment rendered file counter since current file is added to zip file
            renderedFileCounter++;

            // Enable download when all files are added to zip file
            if (renderedFileCounter === filesList.length) {
                setAllowDownload(true);
            }
        };
    }
});