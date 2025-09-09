import React, { useState, useRef, useCallback } from 'react';
import { Upload, Play, Pause, Download, Eye, Loader2, CheckCircle, AlertCircle, Film, Headphones, RotateCcw } from 'lucide-react';

interface ProcessingStep {
  name: string;
  description: string;
  progress: number;
  completed: boolean;
}

interface VideoFile {
  file: File;
  url: string;
  name: string;
  size: string;
  duration?: string;
}

function App() {
  const [currentStep, setCurrentStep] = useState<'upload' | 'processing' | 'preview' | 'download'>('upload');
  const [uploadedVideo, setUploadedVideo] = useState<VideoFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([
    { name: '3D Depth Mapping', description: 'Creating detailed depth maps from 2D footage using AI', progress: 0, completed: false },
    { name: 'Stereoscopic Rendering', description: 'Generating left and right eye views for 3D effect', progress: 0, completed: false },
    { name: 'VR 180 Conversion', description: 'Converting to immersive 3D VR 180 format', progress: 0, completed: false },
    { name: '3D Quality Enhancement', description: 'Optimizing 3D depth and VR viewing experience', progress: 0, completed: false },
  ]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const leftVideoRef = useRef<HTMLVideoElement>(null);
  const rightVideoRef = useRef<HTMLVideoElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const togglePlayback = () => {
    const leftVideo = leftVideoRef.current;
    const rightVideo = rightVideoRef.current;
    
    if (leftVideo && rightVideo) {
      if (isPlaying) {
        leftVideo.pause();
        rightVideo.pause();
        setIsPlaying(false);
      } else {
        leftVideo.play();
        rightVideo.play();
        setIsPlaying(true);
      }
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
  };
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const videoFile = files.find(file => file.type.startsWith('video/'));
    
    if (videoFile) {
      handleVideoUpload(videoFile);
    }
  }, []);

  const handleVideoUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    const videoFile: VideoFile = {
      file,
      url,
      name: file.name,
      size: formatFileSize(file.size),
    };
    
    setUploadedVideo(videoFile);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleVideoUpload(file);
    }
  };

  const startProcessing = () => {
    setCurrentStep('processing');
    setIsProcessing(true);
    
    // Simulate processing steps
    const steps = [...processingSteps];
    let currentStepIndex = 0;
    
    const processStep = () => {
      if (currentStepIndex >= steps.length) {
        setOverallProgress(100);
        setIsProcessing(false);
        setCurrentStep('preview');
        return;
      }
      
      const step = steps[currentStepIndex];
      const progressIncrement = 100 / 50; // 50 iterations per step for smooth animation
      let stepProgress = 0;
      
      const stepInterval = setInterval(() => {
        stepProgress += progressIncrement;
        
        if (stepProgress >= 100) {
          stepProgress = 100;
          step.progress = 100;
          step.completed = true;
          clearInterval(stepInterval);
          
          setProcessingSteps([...steps]);
          setOverallProgress(((currentStepIndex + 1) / steps.length) * 100);
          
          currentStepIndex++;
          setTimeout(processStep, 500);
        } else {
          step.progress = stepProgress;
          setProcessingSteps([...steps]);
          setOverallProgress((currentStepIndex / steps.length) * 100 + (stepProgress / steps.length));
        }
      }, 80);
    };
    
    processStep();
  };

  const resetProcess = () => {
    setCurrentStep('upload');
    setUploadedVideo(null);
    setIsProcessing(false);
    setOverallProgress(0);
    setProcessingSteps(processingSteps.map(step => ({
      ...step,
      progress: 0,
      completed: false
    })));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadVideo = () => {
    // Simulate download
    const link = document.createElement('a');
    link.href = uploadedVideo?.url || '';
    link.download = `${uploadedVideo?.name.split('.')[0]}_VR180.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setCurrentStep('download');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Film className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">VR Transform</h1>
              <p className="text-sm text-gray-300">Convert 2D videos to immersive VR 180 experiences</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {[
              { step: 'upload', label: 'Upload Video', icon: Upload },
              { step: 'processing', label: 'AI Processing', icon: Loader2 },
              { step: 'preview', label: 'Preview & Review', icon: Eye },
              { step: 'download', label: 'Download VR Video', icon: Download },
            ].map(({ step, label, icon: Icon }, index) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center gap-3 ${
                  currentStep === step ? 'text-purple-400' : 
                  ['processing', 'preview', 'download'].indexOf(currentStep) > ['processing', 'preview', 'download'].indexOf(step) ? 'text-emerald-400' : 'text-gray-500'
                }`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                    currentStep === step ? 'bg-purple-500/20 border-purple-400' :
                    ['processing', 'preview', 'download'].indexOf(currentStep) > ['processing', 'preview', 'download'].indexOf(step) ? 'bg-emerald-500/20 border-emerald-400' : 'border-gray-600'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-medium hidden sm:block">{label}</span>
                </div>
                {index < 3 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    ['processing', 'preview', 'download'].indexOf(currentStep) > index ? 'bg-emerald-400' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Upload Section */}
        {currentStep === 'upload' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Transform Your 2D Videos into 3D VR 180</h2>
              <p className="text-xl text-gray-300 mb-8">Upload your 2D video clip and watch it transform into an immersive 3D VR experience</p>
            </div>

            {!uploadedVideo ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                  isDragging ? 'border-purple-400 bg-purple-500/10' : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-white mb-2">Drop your video here or click to browse</p>
                    <p className="text-gray-400">Support MP4, MOV, AVI files up to 500MB</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <div className="flex items-start gap-6">
                  <div className="relative">
                    <video
                      src={uploadedVideo.url}
                      className="w-64 h-36 object-cover rounded-lg"
                      controls
                    />
                    <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">{uploadedVideo.name}</h3>
                    <p className="text-gray-400 mb-4">Size: {uploadedVideo.size}</p>
                    <div className="flex gap-3">
                      <button
                        onClick={startProcessing}
                        className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                      >
                        <Loader2 className="w-5 h-5" />
                        Start 3D VR Conversion
                      </button>
                      <button
                        onClick={() => setUploadedVideo(null)}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                      >
                        Choose Different Video
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Processing Section */}
        {currentStep === 'processing' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Converting to 3D VR 180</h2>
              <p className="text-xl text-gray-300">Our AI is transforming your 2D video into an immersive 3D VR experience</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              {/* Overall Progress */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-semibold text-white">Overall Progress</span>
                  <span className="text-lg font-bold text-purple-400">{Math.round(overallProgress)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-cyan-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
              </div>

              {/* Processing Steps */}
              <div className="space-y-6">
                {processingSteps.map((step, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step.completed ? 'bg-emerald-500' : step.progress > 0 ? 'bg-purple-500' : 'bg-gray-600'
                    }`}>
                      {step.completed ? (
                        <CheckCircle className="w-6 h-6 text-white" />
                      ) : step.progress > 0 ? (
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      ) : (
                        <div className="w-3 h-3 bg-gray-400 rounded-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-white">{step.name}</span>
                        <span className="text-sm text-gray-400">{Math.round(step.progress)}%</span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{step.description}</p>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            step.completed ? 'bg-emerald-500' : 'bg-purple-500'
                          }`}
                          style={{ width: `${step.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Preview Section */}
        {currentStep === 'preview' && uploadedVideo && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">3D VR 180 Preview Ready</h2>
              <p className="text-xl text-gray-300">Your video has been successfully converted to immersive 3D VR 180 format</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">3D VR 180 Preview</h3>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle className="w-5 h-5" />
                    <span>3D Conversion Complete</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400">3D Stereoscopic VR 180 Format (Side-by-Side)</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                      <span>Left Eye</span>
                      <span className="w-3 h-3 bg-cyan-500 rounded-full ml-3"></span>
                      <span>Right Eye</span>
                    </div>
                  </div>
                  
                  <div className="relative bg-black rounded-lg overflow-hidden group">
                    <div className="flex relative">
                      {/* Left Eye View */}
                      <div className="w-1/2 relative border-r border-purple-500/50">
                        <video
                          ref={leftVideoRef}
                          src={uploadedVideo.url}
                          className="w-full h-64 object-cover"
                          onEnded={handleVideoEnd}
                          style={{ filter: 'hue-rotate(10deg) contrast(1.1)' }}
                        />
                        <div className="absolute top-2 left-2 bg-purple-500/80 text-white text-xs px-2 py-1 rounded">
                          Left Eye (3D)
                        </div>
                      </div>
                      
                      {/* Right Eye View */}
                      <div className="w-1/2 relative">
                        <video
                          ref={rightVideoRef}
                          src={uploadedVideo.url}
                          className="w-full h-64 object-cover"
                          onEnded={handleVideoEnd}
                          style={{ filter: 'hue-rotate(-10deg) contrast(1.1) brightness(0.95)' }}
                        />
                        <div className="absolute top-2 right-2 bg-cyan-500/80 text-white text-xs px-2 py-1 rounded">
                          Right Eye (3D)
                        </div>
                      </div>
                      
                      {/* Centered Play/Pause Button */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 group-hover:opacity-100">
                        <button
                          onClick={togglePlayback}
                          className="w-16 h-16 bg-black/70 hover:bg-black/80 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/40 hover:scale-110"
                        >
                          {isPlaying ? (
                            <Pause className="w-8 h-8 text-white" />
                          ) : (
                            <Play className="w-8 h-8 text-white ml-1" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {/* VR 180 Overlay Indicator */}
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-1 rounded-full flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      VR 180° 3D Format
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-lg p-6 border border-purple-500/30">
                  <div className="flex items-start gap-3">
                    <Headphones className="w-6 h-6 text-purple-400 mt-1" />
                    <div>
                      <h4 className="font-semibold text-white mb-2">3D VR Viewing Instructions</h4>
                      <p className="text-sm text-gray-300 mb-2">This 3D VR 180 video is optimized for immersive viewing. Each eye sees a slightly different perspective to create true 3D depth.</p>
                      <p className="text-xs text-gray-400">Compatible with: Oculus Quest, HTC Vive, PlayStation VR, and any VR headset supporting 180° 3D content.</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={downloadVideo}
                    className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <Download className="w-5 h-5" />
                    Download 3D VR 180 Video
                  </button>
                  <button
                    onClick={resetProcess}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Convert Another Video
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Download Complete Section */}
        {currentStep === 'download' && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Download Complete!</h2>
              <p className="text-xl text-gray-300 mb-8">Your 3D VR 180 video is ready to be experienced in immersive virtual reality</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
              <h3 className="text-xl font-semibold text-white mb-4">What's Next?</h3>
              <div className="grid md:grid-cols-3 gap-6 mt-6">
                <div className="p-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-6 h-6 text-purple-400" />
                  </div>
                  <h4 className="font-medium text-white mb-2">Transfer to VR Device</h4>
                  <p className="text-sm text-gray-400">Copy the 3D VR 180 file to your VR headset or mobile VR device</p>
                </div>
                <div className="p-4">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Headphones className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h4 className="font-medium text-white mb-2">Open in VR Player</h4>
                  <p className="text-sm text-gray-400">Use a VR video player that supports 3D 180° stereoscopic content</p>
                </div>
                <div className="p-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Eye className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h4 className="font-medium text-white mb-2">Experience VR</h4>
                  <p className="text-sm text-gray-400">Enjoy your 2D video transformed into immersive 3D VR 180 content with true depth</p>
                </div>
              </div>
              
              <button
                onClick={resetProcess}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 mt-8"
              >
                Convert Another Video
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2025 VR Transform. Powered by advanced AI 3D depth estimation and stereoscopic rendering technology.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;