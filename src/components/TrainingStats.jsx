// components/TrainingStats.jsx
const TrainingStats = ({ summary, selectedCount }) => {
    return (
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
                    <p className="text-sm text-gray-600">Total Rose Annotations</p>
                </div>
                <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600">{selectedCount}</p>
                    <p className="text-sm text-gray-600">Selected for Training</p>
                </div>
            </div>
        </div>
    );
};

export default TrainingStats;