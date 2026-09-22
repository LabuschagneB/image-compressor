document.addEventListener("DOMContentLoaded", () => {
    const dropzone = document.getElementById("icDropzone");
    const fileInput = document.getElementById("icFileInput");
    const browseBtn = document.getElementById("icBrowseBtn");
    const actionPanel = document.getElementById("icActionPanel");
    const statusText = document.getElementById("icStatusText");
    const compressBtn = document.getElementById("icCompressBtn");

    let filesArray = [];

    browseBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        fileInput.click();
    });

    dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropzone.classList.add("dragover");
    });

    dropzone.addEventListener("dragleave", () => {
        dropzone.classList.remove("dragover");
    });

    dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropzone.classList.remove("dragover");
        if (e.dataTransfer.files.length) {
            processSelectedFiles(e.dataTransfer.files);
        }
    });

    fileInput.addEventListener("change", () => {
        if (fileInput.files.length) {
            processSelectedFiles(fileInput.files);
        }
    });

    function processSelectedFiles(files) {
        filesArray = Array.from(files).filter((file) =>
            file.type.startsWith("image/")
        );
        if (filesArray.length > 0) {
            actionPanel.style.display = "block";
            statusText.innerText = `${filesArray.length} image(s) selected. Ready to compress.`;
        }
    }

    function compressImage(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext("2d");

                    ctx.drawImage(img, 0, 0);

                    let mimeType = file.type;
                    if (mimeType !== "image/jpeg" && mimeType !== "image/webp") {
                        mimeType = "image/jpeg";
                    }

                    canvas.toBlob(
                        (blob) => {
                            let finalName = file.name;

                            if (
                                mimeType === "image/jpeg" &&
                                !finalName.match(/\.(jpg|jpeg)$/i)
                            ) {
                                finalName =
                                    finalName.substring(0, finalName.lastIndexOf(".")) + ".jpg";
                            }

                            resolve({ name: finalName, blob: blob });
                        },
                        mimeType,
                        0.7
                    );
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    compressBtn.addEventListener("click", async () => {
        if (filesArray.length === 0) return;

        compressBtn.disabled = true;

        try {
            const zip = new JSZip();
            const folder = zip.folder("compressed_images");

            for (let i = 0; i < filesArray.length; i++) {
                statusText.innerText = `Compressing ${i + 1} of ${filesArray.length
                    }...`;
                const compressedData = await compressImage(filesArray[i]);
                folder.file(compressedData.name, compressedData.blob);
            }

            statusText.innerText = "Creating ZIP file...";

            const zipContent = await zip.generateAsync({ type: "blob" });
            const downloadLink = document.createElement("a");
            downloadLink.href = URL.createObjectURL(zipContent);
            downloadLink.download = "compressed_images.zip";
            downloadLink.click();

            statusText.innerText = "Download successful!";
        } catch (error) {
            statusText.innerText = "An error occurred during compression.";
            console.error(error);
        } finally {
            compressBtn.disabled = false;
        }
    });
});
