// components/TrainingConfig.jsx
const TrainingConfig = ({ config, updateConfig, showConfig, setShowConfig }) => {
    if (!showConfig) return null;

    return (
        <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Training Configuration</h3>
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="text-blue-800 text-sm">
                    <strong>Note:</strong> These settings match your ModelRetrainerService defaults. 
                    Training uses real YOLO algorithms for production-quality results.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model Name</label>
                    <input
                        type="text"
                        value={config.model_name}
                        onChange={(e) => updateConfig('model_name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="custom_rose_detector"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Epochs</label>
                    <select
                        value={config.epochs}
                        onChange={(e) => updateConfig('epochs', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value={10}>10 (Quick Test)</option>
                        <option value={20}>20 (Default)</option>
                        <option value={50}>50 (Thorough)</option>
                        <option value={100}>100 (Extensive)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch Size</label>
                    <select
                        value={config.batch_size}
                        onChange={(e) => updateConfig('batch_size', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value={8}>8 (Low Memory)</option>
                        <option value={16}>16 (Default)</option>
                        <option value={32}>32 (High Memory)</option>
                    </select>
                </div>
            </div>
            
            <div className="flex items-center space-x-6">
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={config.early_stopping}
                        onChange={(e) => updateConfig('early_stopping', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enable Early Stopping</span>
                </label>
                {config.early_stopping && (
                    <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-700">Patience:</label>
                        <input
                            type="number"
                            value={config.patience}
                            onChange={(e) => updateConfig('patience', parseInt(e.target.value))}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            min="1"
                            max="100"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrainingConfig;