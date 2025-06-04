'use client'

import { useState, useEffect } from 'react';
import { Footer } from '@/components/Footer'
import NavBar from '@/components/NavBar'

// Simple icons
const ImageIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const VideoIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const CameraIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2-2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const ModelIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

export default function Dashboard() {
    const [stats, setStats] = useState({
        imageTracking: { total: 0, lastUsed: 'Never' },
        videoTracking: { total: 0, lastUsed: 'Never' },
        liveTracking: { total: 0, lastUsed: 'Never' },
        modelRetraining: { total: 0, lastUsed: 'Never' },
        totalRoses: 0,
        loading: true
    });

    const [recentActivity, setRecentActivity] = useState([]);

    // Fetch stats from your APIs
    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Get live tracking count - you can call your /track/realtime/count endpoint
                const liveResponse = await fetch('/track/realtime/count');
                const liveData = liveResponse.ok ? await liveResponse.json() : { count: 0 };

                // For now, simulate file system stats or use localStorage to track usage
                const imageCount = localStorage.getItem('imageTrackingCount') || 0;
                const videoCount = localStorage.getItem('videoTrackingCount') || 0;
                const liveCount = localStorage.getItem('liveSessionCount') || 0;
                const retrainingCount = localStorage.getItem('modelRetrainingCount') || 0;
                
                // Calculate total roses from localStorage or use live data
                const totalRoses = localStorage.getItem('totalRosesDetected') || liveData.count || 0;

                setStats({
                    imageTracking: { 
                        total: parseInt(imageCount), 
                        lastUsed: localStorage.getItem('lastImageTracking') || 'Never' 
                    },
                    videoTracking: { 
                        total: parseInt(videoCount), 
                        lastUsed: localStorage.getItem('lastVideoTracking') || 'Never' 
                    },
                    liveTracking: { 
                        total: parseInt(liveCount), 
                        lastUsed: localStorage.getItem('lastLiveTracking') || 'Never' 
                    },
                    modelRetraining: { 
                        total: parseInt(retrainingCount), 
                        lastUsed: localStorage.getItem('lastModelRetraining') || 'Never' 
                    },
                    totalRoses: parseInt(totalRoses),
                    loading: false
                });

                // Get recent activity from localStorage
                const recentData = JSON.parse(localStorage.getItem('recentActivity') || '[]');
                setRecentActivity(recentData);

            } catch (error) {
                console.error('Error fetching stats:', error);
                setStats(prev => ({ ...prev, loading: false }));
            }
        };

        fetchStats();
        // Refresh stats every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    // Function to add activity and update stats
    const addActivity = (type, filename, roseCount) => {
        const activity = {
            id: Date.now(),
            type,
            filename,
            roses: roseCount,
            time: new Date().toLocaleString()
        };

        // Update recent activity
        const updated = [activity, ...recentActivity.slice(0, 4)];
        setRecentActivity(updated);
        localStorage.setItem('recentActivity', JSON.stringify(updated));

        // Update counters
        const currentCount = localStorage.getItem(`${type}TrackingCount`) || 0;
        localStorage.setItem(`${type}TrackingCount`, parseInt(currentCount) + 1);
        localStorage.setItem(`last${type.charAt(0).toUpperCase() + type.slice(1)}Tracking`, new Date().toLocaleString());
        
        // Update total roses (for non-retraining activities)
        if (type !== 'modelRetraining') {
            const currentRoses = localStorage.getItem('totalRosesDetected') || 0;
            localStorage.setItem('totalRosesDetected', parseInt(currentRoses) + roseCount);
        }
    };

    if (stats.loading) {
        return (
            <>
                <NavBar />
                <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading dashboard...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <NavBar />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">🌹 Rose Tracking Dashboard</h1>
                        <p className="text-gray-600">Monitor your rose detection activities and model training</p>
                    </div>

                    {/* Summary Stats */}
                    <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-rose-600">{stats.totalRoses}</p>
                                <p className="text-sm text-gray-600">Total Roses Detected</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-blue-600">{stats.imageTracking.total}</p>
                                <p className="text-sm text-gray-600">Images Processed</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-green-600">{stats.videoTracking.total}</p>
                                <p className="text-sm text-gray-600">Videos Processed</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-purple-600">{stats.liveTracking.total}</p>
                                <p className="text-sm text-gray-600">Live Sessions</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-orange-600">{stats.modelRetraining.total}</p>
                                <p className="text-sm text-gray-600">Model Retraining</p>
                            </div>
                        </div>
                    </div>

                    {/* Tracking Methods */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        
                        {/* Image Tracking */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex items-center mb-4">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <ImageIcon className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Image Tracking</h3>
                                    <p className="text-sm text-gray-500">Upload images to detect roses</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Total processed:</span>
                                    <span className="text-sm font-medium text-gray-900">{stats.imageTracking.total}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Last used:</span>
                                    <span className="text-sm font-medium text-gray-900">{stats.imageTracking.lastUsed}</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => window.location.href = '/image'}
                                className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors">
                                Start Image Tracking
                            </button>
                        </div>

                        {/* Video Tracking */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex items-center mb-4">
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <VideoIcon className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Video Tracking</h3>
                                    <p className="text-sm text-gray-500">Upload videos to track roses</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Total processed:</span>
                                    <span className="text-sm font-medium text-gray-900">{stats.videoTracking.total}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Last used:</span>
                                    <span className="text-sm font-medium text-gray-900">{stats.videoTracking.lastUsed}</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => window.location.href = '/video'}
                                className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition-colors">
                                Start Video Tracking
                            </button>
                        </div>

                        {/* Live Tracking */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex items-center mb-4">
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <CameraIcon className="w-6 h-6 text-purple-600" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Live Tracking</h3>
                                    <p className="text-sm text-gray-500">Real-time camera detection</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Total sessions:</span>
                                    <span className="text-sm font-medium text-gray-900">{stats.liveTracking.total}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Last used:</span>
                                    <span className="text-sm font-medium text-gray-900">{stats.liveTracking.lastUsed}</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => window.location.href = '/webcam'}
                                className="w-full mt-4 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-md transition-colors">
                                Start Live Tracking
                            </button>
                        </div>

                        {/* Model Retraining */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex items-center mb-4">
                                <div className="p-3 bg-orange-100 rounded-lg">
                                    <ModelIcon className="w-6 h-6 text-orange-600" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Model Retraining</h3>
                                    <p className="text-sm text-gray-500">Improve model accuracy</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Training sessions:</span>
                                    <span className="text-sm font-medium text-gray-900">{stats.modelRetraining.total}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Last trained:</span>
                                    <span className="text-sm font-medium text-gray-900">{stats.modelRetraining.lastUsed}</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => window.location.href = '/training'}
                                className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md transition-colors">
                                Start Retraining
                            </button>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                        {recentActivity.length > 0 ? (
                            <div className="space-y-3">
                                {recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                                        <div className="flex items-center">
                                            {activity.type === 'image' && <ImageIcon className="w-4 h-4 text-blue-500 mr-3" />}
                                            {activity.type === 'video' && <VideoIcon className="w-4 h-4 text-green-500 mr-3" />}
                                            {activity.type === 'live' && <CameraIcon className="w-4 h-4 text-purple-500 mr-3" />}
                                            {activity.type === 'modelRetraining' && <ModelIcon className="w-4 h-4 text-orange-500 mr-3" />}
                                            <span className="text-sm text-gray-900">{activity.filename}</span>
                                        </div>
                                        <div className="text-right">
                                            {activity.type === 'modelRetraining' ? (
                                                <span className="text-sm font-medium text-gray-900">Training Complete</span>
                                            ) : (
                                                <span className="text-sm font-medium text-gray-900">{activity.roses} roses</span>
                                            )}
                                            <p className="text-xs text-gray-500">{activity.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No recent activity</p>
                                <p className="text-sm text-gray-400">Start tracking or training to see your activity here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}