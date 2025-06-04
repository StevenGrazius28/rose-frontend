'use client'

import { useState, useEffect } from 'react';
import { Footer } from '@/components/Footer'
import NavBar from '@/components/NavBar'
import { Button } from '@/components/Button'  // Using your actual Button component

export default function TrainingPage() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAnnotations, setShowAnnotations] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [isTraining, setIsTraining] = useState(false);
    const [trainingResult, setTrainingResult] = useState(null);

    const [summary, setSummary] = useState({
        total_images: 0,
        total_annotations: 0,
        images_with_annotations: 0
    });

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        setLoading(true);
        setError('');
        
        try {
            const response = await fetch('http://localhost:5000/training/images');
            
            if (!response.ok) {
                throw new Error(`Failed to fetch images: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            setImages(data.images || []);
            setSummary(data.summary || {});
            
        } catch (err) {
            console.error('Error fetching images:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleImageSelection = (filename, isSelected) => {
        if (isSelected) {
            setSelectedImages(prev => [...prev, filename]);
        } else {
            setSelectedImages(prev => prev.filter(img => img !== filename));
        }
    };

    const handleSelectAll = () => {
        const validImages = images.filter(img => img.has_annotations).map(img => img.filename);
        setSelectedImages(prev => prev.length === validImages.length ? [] : validImages);
    };

    const handleStartTraining = async () => {
        if (selectedImages.length === 0) {
            setError('Please select at least one image for training');
            return;
        }

        setIsTraining(true);
        setError('');

        try {
            const payload = {
                selected_images: selectedImages,
                training_config: {
                    model_name: 'custom_rose_detector',
                    epochs: 20,
                    batch_size: 16,
                    annotation_format: "yolo",
                    class_names: ["rose"]
                },
                metadata: {
                    description: `Custom training with ${selectedImages.length} selected images`,
                    timestamp: new Date().toISOString(),
                    total_images: selectedImages.length
                }
            };

            const response = await fetch('http://localhost:5000/training/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Training failed: ${response.status}`);
            }

            const result = await response.json();

            if (result.error) {
                throw new Error(result.error);
            }

            setTrainingResult(result);

        } catch (err) {
            console.error('Error starting training:', err);
            setError(err.message);
        } finally {
            setIsTraining(false);
        }
    };

    if (loading) {
        return (
            <>
                <NavBar />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="min-h-screen py-8 flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading training images...</p>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <NavBar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="min-h-screen py-8">
                    
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            🧪 Train Custom Rose Model
                        </h1>
                        <p className="text-gray-600">Select annotated images to train a custom rose detection model</p>
                    </div>

                    {/* Summary Stats */}
                    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-blue-600">{summary.total_images}</p>
                                <p className="text-sm text-gray-600">Total Images</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-green-600">{summary.images_with_annotations}</p>
                                <p className="text-sm text-gray-600">Ready for Training</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-rose-600">{summary.total_annotations}</p>
                                <p className="text-sm text-gray-600">Total Annotations</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-purple-600">{selectedImages.length}</p>
                                <p className="text-sm text-gray-600">Selected</p>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center">
                                <span className="text-red-500 mr-3">⚠️</span>
                                <div>
                                    <h3 className="text-red-800 font-medium">Error</h3>
                                    <p className="text-red-700 text-sm">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Training Result */}
                    {trainingResult && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                            <h3 className="text-lg font-semibold text-green-800 mb-4">
                                ✨ Training Completed Successfully!
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="bg-white rounded p-3 border border-green-200">
                                    <p className="text-sm text-gray-600">Model</p>
                                    <p className="font-semibold">{trainingResult.model_name}</p>
                                </div>
                                <div className="bg-white rounded p-3 border border-green-200">
                                    <p className="text-sm text-gray-600">Images</p>
                                    <p className="font-semibold">{trainingResult.total_images}</p>
                                </div>
                                <div className="bg-white rounded p-3 border border-green-200">
                                    <p className="text-sm text-gray-600">Status</p>
                                    <p className="font-semibold text-green-600">{trainingResult.status}</p>
                                </div>
                            </div>

                            {trainingResult.metrics && (
                                <div className="bg-white rounded p-4 border border-green-200 mb-4">
                                    <h4 className="font-medium mb-2">Training Metrics</h4>
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <p className="text-xl font-bold text-blue-600">
                                                {(trainingResult.metrics.mAP50 * 100).toFixed(1)}%
                                            </p>
                                            <p className="text-sm text-gray-600">Accuracy</p>
                                        </div>
                                        <div>
                                            <p className="text-xl font-bold text-green-600">
                                                {(trainingResult.metrics.precision * 100).toFixed(1)}%
                                            </p>
                                            <p className="text-sm text-gray-600">Precision</p>
                                        </div>
                                        <div>
                                            <p className="text-xl font-bold text-purple-600">
                                                {(trainingResult.metrics.recall * 100).toFixed(1)}%
                                            </p>
                                            <p className="text-sm text-gray-600">Recall</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex space-x-3">
                                <Button 
                                    variant="solid" 
                                    color="blue"
                                    onClick={() => window.location.href = '/retrain/models'}
                                >
                                    View All Models
                                </Button>
                                <Button 
                                    variant="outline" 
                                    color="blue"
                                    onClick={() => {
                                        setTrainingResult(null);
                                        fetchImages();
                                    }}
                                >
                                    Train Another
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Controls */}
                    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center space-x-4">
                                <Button
                                    variant="outline"
                                    color="blue"
                                    onClick={() => setShowAnnotations(!showAnnotations)}
                                >
                                    {showAnnotations ? '👁️‍🗨️ Hide Annotations' : '👁️ Show Annotations'}
                                </Button>

                                <Button
                                    variant="outline"
                                    color="slate"
                                    onClick={handleSelectAll}
                                    disabled={images.filter(img => img.has_annotations).length === 0}
                                >
                                    ✓ {selectedImages.length > 0 ? 'Deselect All' : 'Select All'}
                                </Button>

                                <Button
                                    variant="outline"
                                    color="slate"
                                    onClick={fetchImages}
                                >
                                    🔄 Refresh
                                </Button>
                            </div>

                            <div>
                                <Button
                                    variant="solid"
                                    color="blue"
                                    onClick={handleStartTraining}
                                    disabled={selectedImages.length === 0 || isTraining}
                                >
                                    {isTraining ? '⏳ Training...' : `🚀 Train Model (${selectedImages.length})`}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Images Grid */}
                    {images.length > 0 ? (
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Training Images</h2>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {images.map((image) => (
                                    <div key={image.id} className={`bg-gray-50 rounded-lg p-4 border-2 transition-all ${
                                        selectedImages.includes(image.filename) 
                                            ? 'border-blue-500 bg-blue-50' 
                                            : image.has_annotations 
                                                ? 'border-gray-200 hover:border-gray-300' 
                                                : 'border-red-200 bg-red-50 opacity-60'
                                    }`}>
                                        <div className="relative mb-3">
                                            <img
                                                src={`http://localhost:5000${showAnnotations ? image.annotated_url : image.clean_url}`}
                                                alt={image.filename}
                                                className="w-full h-48 object-cover rounded-md"
                                                loading="lazy"
                                            />
                                            
                                            {/* Selection Checkbox */}
                                            <div className="absolute top-2 right-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedImages.includes(image.filename)}
                                                    onChange={(e) => handleImageSelection(image.filename, e.target.checked)}
                                                    disabled={!image.has_annotations}
                                                    className="w-5 h-5 rounded border-gray-300 text-blue-600"
                                                />
                                            </div>

                                            {/* Status Badge */}
                                            <div className="absolute top-2 left-2">
                                                {image.has_annotations ? (
                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        ✅ Ready
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        ❌ No Labels
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Image Info */}
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900 truncate mb-2">
                                                {image.filename}
                                            </h4>
                                            <div className="text-xs text-gray-600 space-y-1">
                                                <div className="flex justify-between">
                                                    <span>🌹 Roses:</span>
                                                    <span className="font-medium">{image.annotation_count}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>📏 Size:</span>
                                                    <span className="font-medium">{image.width}×{image.height}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                            <div className="text-6xl mb-4">📁</div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Training Images Found</h3>
                            <p className="text-gray-600 mb-6">
                                Add images and annotations to your temp directory to get started.
                            </p>
                            
                            <Button 
                                variant="solid" 
                                color="blue"
                                onClick={fetchImages}
                            >
                                🔄 Refresh Images
                            </Button>
                        </div>
                    )}

                    {/* Footer Info */}
                    <div className="mt-8 text-center text-xs text-gray-500">
                        <p>Training uses your ModelRetrainerService with real YOLO algorithms.</p>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}