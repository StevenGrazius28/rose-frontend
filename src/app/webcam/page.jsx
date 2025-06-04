'use client'

import { useState, useRef, useEffect } from 'react';
import { Footer } from '@/components/Footer'
import NavBar from '@/components/NavBar'
import { ChevronDownIcon } from '@heroicons/react/16/solid'
import {PhotoIcon} from "@heroicons/react/24/solid";

export default function Home() {
    const [fileUploaded, setFileUploaded] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [showWebcam, setShowWebcam] = useState(false);
    const videoRef = useRef(null);
    // --- Webcam streaming frame capture additions ---
    const canvasRef = useRef(null);
    const isProcessing = useRef(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (showWebcam && videoRef.current) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then((stream) => {
                    videoRef.current.srcObject = stream;
                })
                .catch((err) => {
                    console.error("Error accessing webcam:", err);
                    alert("Unable to access webcam");
                });
        }
    }, [showWebcam]);

    // --- Frame capture and API sending effect ---
    useEffect(() => {
        if (showWebcam && videoRef.current) {
            const startStreaming = () => {
                intervalRef.current = setInterval(async () => {
                    if (!videoRef.current || !canvasRef.current || isProcessing.current) return;

                    isProcessing.current = true;

                    const canvas = canvasRef.current;
                    const ctx = canvas.getContext('2d');
                    canvas.width = videoRef.current.videoWidth;
                    canvas.height = videoRef.current.videoHeight;
                    ctx.drawImage(videoRef.current, 0, 0);

                    const dataUrl = canvas.toDataURL('image/jpeg', 0.6);

                    try {
                        await fetch("http://localhost:8000/track/realtime/stream", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({ image: dataUrl })
                        });
                    } catch (err) {
                        console.error("Failed to send frame", err);
                    }

                    isProcessing.current = false;
                }, 100); // 10 FPS
            };

            if (videoRef.current.readyState >= 2) {
                startStreaming();
            } else {
                videoRef.current.onloadeddata = () => startStreaming();
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [showWebcam]);

    return (
        <>
            <NavBar />
            <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden rounded-lg bg-white">
                    <div className="px-4 py-2 sm:px-3">
                        <h1 className="font-semibold">Step 1 : Start webcam streaming</h1>
                    </div>
                    <div className="rounded-lg bg-[#F3F5FD] px-4 py-5 sm:p-6">
                        <div className="col-span-full">
                            <div className="flex items-start justify-start">
                                <label
                                    htmlFor="cover-photo"
                                    className="block text-sm/6 font-medium text-gray-900"
                                >
                                    Start streaming
                                </label>
                                <button
                                    type="button"
                                    className="ml-4 inline-flex items-center rounded-md bg-[#202020] px-4 py-1 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                    onClick={() => {
                                        if (showWebcam && videoRef.current?.srcObject) {
                                            const stream = videoRef.current.srcObject;
                                            const tracks = stream.getTracks();
                                            tracks.forEach(track => track.stop());
                                            videoRef.current.srcObject = null;
                                        }

                                        setShowWebcam(false);
                                        setFileUploaded(true);
                                    }}
                                >
                                    Stop
                                </button>
                                <button
                                    type="button"
                                    className="ml-4 inline-flex items-center rounded-md bg-green-600 px-4 py-1 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
                                    onClick={() => setShowWebcam(true)}
                                >
                                    Use Webcam
                                </button>
                            </div>
                            {showWebcam && (
                                <div className="mt-6">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        className="w-full aspect-video rounded border border-gray-300"
                                    />
                                    <canvas ref={canvasRef} className="hidden" />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mt-10 space-y-6">
                        {fileUploaded && uploadedFile && (
                            <video
                                src={URL.createObjectURL(uploadedFile)}
                                controls
                                className="w-full aspect-video rounded border border-gray-300"
                                webkit-playsinline="true"
                            />
                        )}

                        {/* Step 2 */}
                        <div className="flex items-start">
                            <div className="mr-4 flex flex-col items-center">
                                <div className="flex h-6 w-14 items-center justify-center rounded bg-gray-300 text-xs font-semibold text-white">
                                    Step 2
                                </div>
                            </div>
                            <p className="text-base font-semibold text-gray-400">
                                Give us feedback
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    )
}
