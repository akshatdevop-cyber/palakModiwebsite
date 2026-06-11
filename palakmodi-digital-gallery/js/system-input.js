import { sendContribution } from "./firebase.js";

const imageInput = document.getElementById("imageInput");
const processingText = document.getElementById("processingText");
const outputDiv = document.querySelector(".output");
const outputCanvas = document.getElementById("outputCanvas");
const statusText = document.getElementById("system-status-text");
const saveBtn = document.getElementById("saveBtn");
const shareBtn = document.getElementById("shareBtn");
const uploadBtn = document.querySelector(".upload-btn");
const inputPrompt = document.querySelector(".input-prompt");

if (outputCanvas) {
    const ctx = outputCanvas.getContext("2d");

    imageInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Show processing state
        uploadBtn.classList.add("hidden");
        inputPrompt.classList.add("hidden");
        processingText.classList.remove("hidden");

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                // Process image on canvas (make it square)
                const size = Math.min(img.width, img.height);
                const sx = (img.width - size) / 2;
                const sy = (img.height - size) / 2;

                outputCanvas.width = 400;
                outputCanvas.height = 400;

                // Draw cropped image
                ctx.drawImage(img, sx, sy, size, size, 0, 0, 400, 400);

                try {
                    // Apply 4 to 5 random distortions at 60% intensity
                    const numDistortions = Math.floor(Math.random() * 2) + 4; // 4 or 5
                    const intensity = 0.60;
                    const cw = 400;
                    const ch = 400;

                    for (let i = 0; i < numDistortions; i++) {
                        const type = Math.floor(Math.random() * 3);
                        const shiftAmount = cw * 0.15 * intensity;

                        // Type 0: Horizontal slice glitch
                        if (type === 0) {
                            const sliceY = Math.floor(Math.random() * (ch - 1));
                            const sliceH = Math.max(1, Math.floor(Math.random() * (ch * 0.3) * intensity));
                            const shiftX = Math.floor((Math.random() - 0.5) * 2 * shiftAmount);

                            const validH = Math.min(sliceH, ch - sliceY);
                            if (validH > 0) {
                                const sliceData = ctx.getImageData(0, sliceY, cw, validH);
                                ctx.fillStyle = "#0d0e13";
                                ctx.fillRect(0, sliceY, cw, validH);
                                ctx.putImageData(sliceData, shiftX, sliceY);
                            }
                        }
                        // Type 1: Channel shift glitch
                        else if (type === 1) {
                            const imgData = ctx.getImageData(0, 0, cw, ch);
                            const data = imgData.data;
                            const shiftChannel = Math.floor(Math.random() * 3); // R, G, or B
                            const shiftVal = Math.floor((Math.random() - 0.5) * 2 * shiftAmount * 1.5);

                            const newImgData = ctx.createImageData(cw, ch);
                            newImgData.data.set(data);

                            for (let y = 0; y < ch; y++) {
                                for (let x = 0; x < cw; x++) {
                                    const srcIdx = (y * cw + x) * 4;
                                    let destX = x + shiftVal;
                                    destX = Math.max(0, Math.min(cw - 1, destX));
                                    const destIdx = (y * cw + destX) * 4;
                                    newImgData.data[destIdx + shiftChannel] = data[srcIdx + shiftChannel];
                                }
                            }
                            ctx.putImageData(newImgData, 0, 0);
                        }
                        // Type 2: Block inversion / noise
                        else if (type === 2) {
                            const blockW = Math.max(1, Math.floor(Math.random() * cw * 0.4 * intensity));
                            const blockH = Math.max(1, Math.floor(Math.random() * ch * 0.4 * intensity));
                            const blockX = Math.max(0, Math.min(cw - 1, Math.floor(Math.random() * (cw - blockW))));
                            const blockY = Math.max(0, Math.min(ch - 1, Math.floor(Math.random() * (ch - blockH))));

                            const validW = Math.min(blockW, cw - blockX);
                            const validH = Math.min(blockH, ch - blockY);

                            if (validW > 0 && validH > 0) {
                                const blockData = ctx.getImageData(blockX, blockY, validW, validH);
                                const bdata = blockData.data;
                                for (let j = 0; j < bdata.length; j += 4) {
                                    if (Math.random() < intensity) {
                                        bdata[j] = 255 - bdata[j];
                                        bdata[j + 1] = 255 - bdata[j + 1];
                                        bdata[j + 2] = 255 - bdata[j + 2];
                                    }
                                }
                                ctx.putImageData(blockData, blockX, blockY);
                            }
                        }
                    }
                } catch (e) {
                    console.error("Distortion effect failed:", e);
                }

                // Extract resulting dataURL
                const processedDataURL = outputCanvas.toDataURL("image/jpeg", 0.85);

                // Simulate processing delay for cinematic effect
                setTimeout(() => {
                    processingText.classList.add("hidden");
                    outputDiv.classList.remove("hidden");

                    // Trigger CSS transition
                    requestAnimationFrame(() => {
                        outputDiv.classList.add("show");
                    });

                    statusText.textContent = "INPUT ASSIMILATED INTO SHARED SYSTEM.";

                    // Enable buttons
                    saveBtn.disabled = false;
                    shareBtn.disabled = false;

                    // Send to Firebase system view
                    sendContribution(processedDataURL);
                }, 1200);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    // Save Button logic
    saveBtn.addEventListener("click", () => {
        const link = document.createElement("a");
        link.download = `system-input-${Date.now()}.jpg`;
        link.href = outputCanvas.toDataURL("image/jpeg");
        link.click();
    });

    // Share Button logic
    shareBtn.addEventListener("click", () => {
        if (navigator.share) {
            outputCanvas.toBlob(async (blob) => {
                const file = new File([blob], "system-input.jpg", { type: "image/jpeg" });
                try {
                    await navigator.share({
                        title: "System Input",
                        text: "My contribution to the system.",
                        files: [file]
                    });
                } catch (err) {
                    // user cancelled share
                }
            }, "image/jpeg");
        } else {
            alert("Sharing is not supported on your current browser/device.");
        }
    });
}