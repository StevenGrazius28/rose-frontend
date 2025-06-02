'use client'

import { useState } from 'react';
import { Footer } from '@/components/Footer'
import NavBar from '@/components/NavBar'
import { ChevronDownIcon } from '@heroicons/react/16/solid'
import {PhotoIcon} from "@heroicons/react/24/solid";

export default function Home() {
  const [fileUploaded, setFileUploaded] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

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
                  onClick={() => {
                    if (!uploadedFile) {
                      alert('Please select a file first.');
                    } else {
                      console.log('Uploading:', uploadedFile.name);
                      setFileUploaded(true);
                    }
                  }}
                >
                  Upload
                </button>
              </div>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 bg-white px-6 py-10">
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
              <video
                src={URL.createObjectURL(uploadedFile)}
                controls
                className="w-full aspect-video rounded border border-gray-300"
                webkit-playsinline="true"
              />
            )}

            {/* Step 3 */}
            <div className="flex items-start">
              <div className="mr-4 flex flex-col items-center">
                <div className="flex h-6 w-14 items-center justify-center rounded bg-gray-300 text-xs font-semibold text-white">
                  Step 3
                </div>
                <div className="mt-1 h-full w-px border-l-2 border-dashed bg-gray-300"></div>
              </div>
              <p className="text-base font-semibold text-gray-400">
                Result: Annotated video and generated data
              </p>
            </div>

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
