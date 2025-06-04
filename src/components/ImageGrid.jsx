// components/TrainingResult.jsx
import Button from '@/components/Button'

const TrainingResult = ({ result, onViewModels, onTrainAnother }) => {
    if (!result) return null;

    return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                    <div className="w-6 h-6 text-green-600 mr-3">✨</div>
                    <div>
                        <h3 className="text-lg font-semibold text-green-800">Training Completed Successfully! 🎉</h3>
                        <p className="text-green-700 text-sm">Your custom model has been trained using real YOLO algorithms</p>
                    </div>
                </div>
                <div className="text-green-600 text-sm font-medium">
                    Status: {result.status}
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="bg-white rounded-lg p-3 border border-green-200">
                    <p className="text-sm text-gray-600">Model Name</p>
                    <p className="font-semibold text-gray-800 text-sm">{result.model_name}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-green-200">
                    <p className="text-sm text-gray-600">Images Trained</p>
                    <p className="font-semibold text-gray-800">{result.total_images}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-green-200">
                    <p className="text-sm text-gray-600">Total Annotations</p>
                    <p className="font-semibold text-gray-800">{result.total_annotations}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-green-200">
                    <p className="text-sm text-gray-600">Training ID</p>
                    <p className="font-mono text-xs text-gray-800">{result.training_id.slice(0, 8)}...</p>
                </div>
            </div>

            {/* Training Metrics */}
            {result.metrics && (
                <div className="bg-white rounded-lg p-4 border border-green-200 mb-4">
                    <h4 className="font-medium text-green-800 mb-3">Training Metrics</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">{(result.metrics.mAP50 * 100).toFixed(1)}%</p>
                            <p className="text-sm text-gray-600">mAP50 (Accuracy)</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{(result.metrics.precision * 100).toFixed(1)}%</p>
                            <p className="text-sm text-gray-600">Precision</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-purple-600">{(result.metrics.recall * 100).toFixed(1)}%</p>
                            <p className="text-sm text-gray-600">Recall</p>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="flex items-center justify-between">
                <p className="text-green-700 text-sm">{result.message}</p>
                <div className="flex space-x-3">
                    <Button onClick={onViewModels} variant="primary">
                        View All Models
                    </Button>
                    <Button onClick={onTrainAnother} variant="secondary">
                        Train Another Model
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TrainingResult;