'use client'

import { useState, useRef } from 'react';
import { Footer } from '@/components/Footer'
import NavBar from '@/components/NavBar'
import { PhotoIcon } from "@heroicons/react/24/solid";
import BoundingBoxAnnotator from '@/components/BoundingBoxAnnotator';

export default function ImageTracking() {
  const [fileUploaded, setFileUploaded] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isSavingAnnotation, setIsSavingAnnotation] = useState(false);
  
  const imageRef = useRef(null);

  const handleUpload = () => {
    if (!uploadedFile) {
      alert('Please select a file first.');
    } else {
      console.log('Uploading:', uploadedFile.name);
      setFileUploaded(true);
    }
  };

  const processImage = async () => {
    setIsProcessing(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);

      const response = await fetch('http://localhost:5000/track/image', {
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
      const currentCount = localStorage.getItem('imageTrackingCount') || 0;
      localStorage.setItem('imageTrackingCount', parseInt(currentCount) + 1);
      localStorage.setItem('lastImageTracking', new Date().toLocaleString());
      
      const currentRoses = localStorage.getItem('totalRosesDetected') || 0;
      localStorage.setItem('totalRosesDetected', parseInt(currentRoses) + data.number_of_roses);

      // Add to recent activity
      const activity = {
        id: Date.now(),
        type: 'image',
        filename: uploadedFile.name,
        roses: data.number_of_roses,
        time: new Date().toLocaleString()
      };
      const recentActivity = JSON.parse(localStorage.getItem('recentActivity') || '[]');
      const updatedActivity = [activity, ...recentActivity.slice(0, 4)];
      localStorage.setItem('recentActivity', JSON.stringify(updatedActivity));

    } catch (err) {
      console.error('Error processing image:', err);
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadProcessedImage = async () => {
    if (result?.download_url) {
      try {
        const downloadUrl = `http://localhost:5000${result.download_url}?download=true`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `tracked_${uploadedFile.name}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Download error:', error);
        setError('Failed to download image');
      }
    }
  };

  const viewProcessedImage = async () => {
    if (result?.download_url) {
      try {
        console.log('Starting image view process...');
        console.log('Download URL:', result.download_url);
        
        const imageElement = imageRef.current;
        if (!imageElement) {
          console.error('Image element not found!');
          setError('Image display element not found');
          return;
        }
        
        imageElement.style.display = 'block';
        console.log('Image element shown');
        
        // Show loading message
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'imageLoading';
        loadingDiv.textContent = 'Loading image...';
        loadingDiv.style.cssText = 'text-align: center; padding: 20px; color: #666;';
        imageElement.parentNode.insertBefore(loadingDiv, imageElement);
        
        // Fetch the image without download parameter to avoid forced download
        const fetchUrl = `http://localhost:5000${result.download_url}`;
        console.log('Fetching from:', fetchUrl);
        
        const response = await fetch(fetchUrl);
        console.log('Response status:', response.status);
        
        if (response.ok) {
          console.log('Response OK, creating blob...');
          const imageBlob = await response.blob();
          console.log('Blob created:', imageBlob.size, 'bytes, type:', imageBlob.type);
          
          const imageUrl = URL.createObjectURL(imageBlob);
          console.log('Image URL created:', imageUrl);
          
          imageElement.src = imageUrl;
          
          // Add event listeners to debug image loading
          imageElement.onload = () => {
            console.log('Image loaded successfully');
            // Remove loading message
            const loading = document.getElementById('imageLoading');
            if (loading) loading.remove();
          };
          
          imageElement.onerror = (e) => {
            console.error('Image error event:', e);
            setError('Failed to load processed image');
            // Remove loading message
            const loading = document.getElementById('imageLoading');
            if (loading) loading.remove();
          };
          
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error('View error:', error);
        setError(`Failed to view image: ${error.message}`);
        
        // Remove loading message if it exists
        const loading = document.getElementById('imageLoading');
        if (loading) loading.remove();
      }
    }
  };

  const handleSaveAnnotations = async (annotationData) => {
    setIsSavingAnnotation(true);
    setError('');

    try {
      // Extract UUID from download_url and create the actual saved filename
      // "/tracked-image/1c659428-cdfa-4594-8c66-04820124dc73" → "1c659428-cdfa-4594-8c66-04820124dc73.jpg"
      const urlParts = result.download_url.split('/');
      const uuid = urlParts[urlParts.length - 1];
      const savedFilename = `${uuid}.jpg`;
      
      console.log('Original filename:', uploadedFile.name);
      console.log('Saved filename (UUID):', savedFilename);
      console.log('Download URL:', result.download_url);

      // Convert bounding boxes to proper annotation format with pixel coordinates
      const annotations = annotationData.annotation.boxes.map(box => {
        // Convert normalized coordinates (0-1) back to pixel coordinates for 640x640 image
        const x_center_pixels = box.x * 640;
        const y_center_pixels = box.y * 640;
        const width_pixels = box.width * 640;
        const height_pixels = box.height * 640;
        
        return {
          class: 0, // Rose class
          x_center: x_center_pixels,
          y_center: y_center_pixels,
          width: width_pixels,
          height: height_pixels,
          confidence: 1.0, // User annotation, full confidence
          source: 'user_correction'
        };
      });

      // Prepare the data for the backend - using the actual saved filename (UUID)
      const correctedAnnotationData = {
        original_image_path: savedFilename, // Use UUID filename that actually exists
        annotation: {
          boxes: annotations,
          image_dimensions: {
            width: 640,
            height: 640
          },
          annotation_type: 'user_correction',
          created_at: new Date().toISOString()
        }
      };

      console.log('Sending annotation data:', correctedAnnotationData);

      const response = await fetch('http://localhost:5000/retrain/save-annotation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(correctedAnnotationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to save annotation: ${response.status}`);
      }

      const data = await response.json();
      console.log('Annotation saved:', data);
      
      alert(`${annotations.length} annotation(s) saved successfully! This data will help improve the model.`);

    } catch (err) {
      console.error('Error saving annotations:', err);
      throw new Error(`Failed to save annotations: ${err.message}`);
    } finally {
      setIsSavingAnnotation(false);
    }
  };

  return (
    <>
      <NavBar />
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="shadow overflow-hidden rounded-lg bg-white">
          <div className="px-4 py-2 sm:px-3">
            <h1 className="font-semibold">Step 1: Upload your image</h1>
          </div>
          <div className="rounded-lg bg-[#F3F5FD] px-4 py-5 sm:p-6">
            <div className="col-span-full">
              <div className="flex items-start justify-between">
                <label
                  htmlFor="cover-photo"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Upload your image
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
                    if (file.size > 10 * 1024 * 1024) {
                      alert("File size exceeds 10MB. Please upload a smaller image.");
                      return;
                    }
                    if (file.type.startsWith('image/')) {
                      setUploadedFile(file);
                    } else {
                      alert('Please drop an image file');
                    }
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
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 10 * 1024 * 1024) {
                              alert("File size exceeds 10MB. Please upload a smaller image.");
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
                    PNG, JPG, JPEG, GIF up to 10MB
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
                Review your image
              </p>
            </div>
            {fileUploaded && uploadedFile && (
              <>
                <div className="flex justify-center">
                  <img
                    src={URL.createObjectURL(uploadedFile)}
                    alt="Original uploaded image"
                    className="w-full max-w-lg aspect-auto rounded border border-gray-300"
                  />
                </div>
                <button
                  onClick={processImage}
                  disabled={isProcessing}
                  className="mt-4 rounded bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:bg-gray-400"
                >
                  {isProcessing ? 'Processing image...' : 'Process image'}
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
                    Result: Annotated image and generated data
                  </p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-green-800">
                        Processing Complete! 🌹
                      </h3>
                      <p className="text-green-700">
                        Found <strong>{result.number_of_roses}</strong> rose(s) in your image
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={viewProcessedImage}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                      >
                        View Image
                      </button>
                      <button
                        onClick={downloadProcessedImage}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                      >
                        Download Result
                      </button>
                    </div>
                  </div>
                  
                  {/* Embedded image display with annotation feature */}
                  <div className="mt-4">
                    <div className="flex justify-center">
                      <div className="relative inline-block">
                        {/* Image fixed to 640x640 */}
                        <img
                          ref={imageRef}
                          alt="Processed image with rose annotations"
                          className="rounded border border-green-300"
                          style={{ 
                            display: 'none',
                            width: '640px',
                            height: '640px',
                            objectFit: 'cover'
                          }}
                        />
                        
                        {/* Reusable Bounding Box Annotator */}
                        <BoundingBoxAnnotator
                          mediaRef={imageRef}
                          isVisible={result !== null}
                          onSaveAnnotations={handleSaveAnnotations}
                          isSaving={isSavingAnnotation}
                          mediaType="image"
                          originalFileName={uploadedFile?.name || ''}
                          disabled={false}
                        />
                      </div>
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