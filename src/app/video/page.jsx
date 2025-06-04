'use client'

import { useState } from 'react';
import { Footer } from '@/components/Footer'
import NavBar from '@/components/NavBar'
import { PhotoIcon } from "@heroicons/react/24/solid";

export default function VideoTracking() {
  const [fileUploaded, setFileUploaded] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleUpload = () => {
    if (!uploadedFile) {
      alert('Please select a file first.');
    } else {
      console.log('Uploading:', uploadedFile.name);
      setFileUploaded(true);
    }
  };

  const processVideo = async () => {
    setIsProcessing(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile); // Fixed: was 'video', now 'file'

      const response = await fetch('http://localhost:5000/track/video', { // Added full URL
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      console.log('API response:', data);
      setResult(data);

      // Update dashboard stats
      const currentCount = localStorage.getItem('videoTrackingCount') || 0;
      localStorage.setItem('videoTrackingCount', parseInt(currentCount) + 1);
      localStorage.setItem('lastVideoTracking', new Date().toLocaleString());
      
      const currentRoses = localStorage.getItem('totalRosesDetected') || 0;
      localStorage.setItem('totalRosesDetected', parseInt(currentRoses) + data.number_of_roses);

      // Add to recent activity
      const activity = {
        id: Date.now(),
        type: 'video',
        filename: uploadedFile.name,
        roses: data.number_of_roses,
        time: new Date().toLocaleString()
      };
      const recentActivity = JSON.parse(localStorage.getItem('recentActivity') || '[]');
      const updatedActivity = [activity, ...recentActivity.slice(0, 4)];
      localStorage.setItem('recentActivity', JSON.stringify(updatedActivity));

    } catch (err) {
      console.error('Error processing video:', err);
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadProcessedVideo = async () => {
    if (result?.download_url) {
      try {
        // Add download=true parameter to force download
        const downloadUrl = `http://localhost:5000${result.download_url}?download=true`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `tracked_${uploadedFile.name}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Download error:', error);
        setError('Failed to download video');
      }
    }
  };

  const viewProcessedVideo = async () => {
    if (result?.download_url) {
      try {
        console.log('Starting video view process...');
        console.log('Download URL:', result.download_url);
        
        const videoElement = document.getElementById('processedVideoPlayer');
        if (!videoElement) {
          console.error('Video element not found!');
          setError('Video player not found');
          return;
        }
        
        videoElement.style.display = 'block';
        console.log('Video element shown');
        
        // Show loading message
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'videoLoading';
        loadingDiv.textContent = 'Loading video...';
        loadingDiv.style.cssText = 'text-align: center; padding: 20px; color: #666;';
        videoElement.parentNode.insertBefore(loadingDiv, videoElement);
        
        const fetchUrl = `http://localhost:5000${result.download_url}?download=true`;
        console.log('Fetching from:', fetchUrl);
        
        const response = await fetch(fetchUrl);
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (response.ok) {
          console.log('Response OK, creating blob...');
          const videoBlob = await response.blob();
          console.log('Blob created:', videoBlob.size, 'bytes, type:', videoBlob.type);
          
          const videoUrl = URL.createObjectURL(videoBlob);
          console.log('Video URL created:', videoUrl);
          
          videoElement.src = videoUrl;
          
          // Add event listeners to debug video loading
          videoElement.onloadstart = () => console.log('Video load started');
          videoElement.onloadedmetadata = () => console.log('Video metadata loaded');
          videoElement.onloadeddata = () => console.log('Video data loaded');
          videoElement.oncanplay = () => console.log('Video can play');
          videoElement.onerror = (e) => {
            console.error('Video error event:', e);
            console.error('Video error code:', videoElement.error?.code);
            console.error('Video error message:', videoElement.error?.message);
            
            // Error codes: 1=ABORTED, 2=NETWORK, 3=DECODE, 4=SRC_NOT_SUPPORTED
            const errorMessages = {
              1: 'Video loading was aborted',
              2: 'Network error while loading video',
              3: 'Video decoding error (corrupt file)',
              4: 'Video format not supported'
            };
            
            const errorCode = videoElement.error?.code;
            const errorMsg = errorMessages[errorCode] || 'Unknown video error';
            console.error('Video error details:', errorMsg);
            setError(`Video error: ${errorMsg}`);
          };
          
          videoElement.load();
          
          // Remove loading message
          const loading = document.getElementById('videoLoading');
          if (loading) loading.remove();
          
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error('View error:', error);
        setError(`Failed to view video: ${error.message}`);
        
        // Remove loading message if it exists
        const loading = document.getElementById('videoLoading');
        if (loading) loading.remove();
      }
    }
  };

  return (
    <>
      <NavBar />
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="shadow overflow-hidden rounded-lg bg-white">
          <div className="px-4 py-2 sm:px-3">
            <h1 className="font-semibold">Step 1 : Upload your video</h1>
          </div>
          <div className="rounded-lg bg-[#F3F5FD] px-4 py-5 sm:p-6">
            <div className="col-span-full">
              <div className="flex items-start justify-between">
                <label
                  htmlFor="cover-photo"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Upload your video
                </label>
                <button
                  type="button"
                  className="ml-4 inline-flex items-center rounded-md bg-[#202020] px-4 py-1 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  onClick={handleUpload}
                >
                  Upload
                </button>
              </div>
              <div
                className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 bg-white px-6 py-10"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) {
                    if (file.size > 50 * 1024 * 1024) {
                      alert("File size exceeds 50MB. Please upload a smaller video.");
                      return;
                    }
                    setUploadedFile(file);
                  }
                }}
              >
                <div className="text-center">
                  <PhotoIcon
                    aria-hidden="true"
                    className="mx-auto size-12 text-gray-300"
                  />
                  <div className="mt-4 flex text-sm/6 text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 focus-within:outline-none hover:text-indigo-500"
                    >
                      <span>Click here</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        accept="video/*"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 50 * 1024 * 1024) {
                              alert("File size exceeds 50MB. Please upload a smaller video.");
                              e.target.value = '';
                              return;
                            }
                            setUploadedFile(file);
                          }
                        }}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs/5 text-gray-600">
                    MP4, AVI, MOV up to 50MB
                  </p>
                  {uploadedFile && (
                    <div className="mt-4 text-sm text-gray-700">
                      <p><strong>Uploaded file(s):</strong> {uploadedFile.name}</p>
                      <a
                        href={URL.createObjectURL(uploadedFile)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline"
                      >
                        Preview file
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-4 mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <strong>Error:</strong> {error}
            </div>
          )}

          <div className="mt-10 space-y-6">
            {/* Step 2 */}
            <div className="flex items-start">
              <div className="mr-4 flex flex-col items-center">
                <div className={`flex h-6 w-14 items-center justify-center rounded text-xs font-semibold text-white ${fileUploaded ? 'bg-black' : 'bg-gray-300'}`}>
                  Step 2
                </div>
                <div className="mt-1 h-full w-px border-l-2 border-dashed bg-gray-300"></div>
              </div>
              <p className={`text-base font-semibold ${fileUploaded ? 'text-black' : 'text-gray-400'}`}>
                Review your video
              </p>
            </div>
            {fileUploaded && uploadedFile && (
              <>
                <div className="flex justify-center">
                  <video
                    src={URL.createObjectURL(uploadedFile)}
                    controls
                    className="w-full max-w-lg aspect-video rounded border border-gray-300"
                    webkit-playsinline="true"
                  />
                </div>
                <button
                  onClick={processVideo}
                  disabled={isProcessing}
                  className="mt-4 rounded bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:bg-gray-400"
                >
                  {isProcessing ? 'Processing video...' : 'Process video'}
                </button>
              </>
            )}

            {/* Step 3 - Results */}
            {result && (
              <>
                <div className="flex items-start">
                  <div className="mr-4 flex flex-col items-center">
                    <div className="flex h-6 w-14 items-center justify-center rounded bg-green-600 text-xs font-semibold text-white">
                      Step 3
                    </div>
                    <div className="mt-1 h-full w-px border-l-2 border-dashed bg-gray-300"></div>
                  </div>
                  <p className="text-base font-semibold text-green-700">
                    Result: Annotated video and generated data
                  </p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-green-800">
                        Processing Complete! 🎥
                      </h3>
                      <p className="text-green-700">
                        Found <strong>{result.number_of_roses}</strong> rose(s) in your video
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={viewProcessedVideo}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                      >
                        View Video
                      </button>
                      <button
                        onClick={downloadProcessedVideo}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                      >
                        Download Result
                      </button>
                    </div>
                  </div>
                  
                  {/* Embedded video player */}
                  <div className="mt-4">
                    <h4 className="font-medium text-green-800 mb-2">Processed Video:</h4>
                    <div className="flex justify-center">
                      <video
                        id="processedVideoPlayer"
                        controls
                        className="w-full max-w-2xl aspect-video rounded border border-green-300"
                        style={{ display: 'none' }}
                        crossOrigin="anonymous"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Step 4 */}
            <div className="flex items-start">
              <div className="mr-4 flex flex-col items-center">
                <div className="flex h-6 w-14 items-center justify-center rounded bg-gray-300 text-xs font-semibold text-white">
                  Step 4
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