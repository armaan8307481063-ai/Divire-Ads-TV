import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  FileCheck,
  AlertCircle,
  Loader2,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { MediaFile } from '../../types.js';
import { getAuthHeaders } from '../../lib/authHeader.js';

interface MediaLibraryTabProps {
  token: string;
  onSelectAsHeroImage?: (imageUrl: string) => void;
}

export const MediaLibraryTab: React.FC<MediaLibraryTabProps> = ({ token, onSelectAsHeroImage }) => {
  const [mediaList, setMediaList] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/media', {
        headers: getAuthHeaders(token),
      });
      const json = await res.json();
      if (json.success) {
        setMediaList(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load media:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [token]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', files[0]);

      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to upload media file.');
      }

      setStatusMessage(`"${files[0].name}" uploaded successfully!`);
      fetchMedia();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}" from media library?`)) return;
    try {
      const res = await fetch(`/api/admin/media/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
      });
      if (res.ok) {
        setMediaList((prev) => prev.filter((m) => m.id !== id));
      }
    } catch (err) {
      console.error('Error deleting media:', err);
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Upload Section */}
      <div className="bg-white dark:bg-neutral-800 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
              Agency Media Library
            </h1>
            <p className="text-xs text-neutral-500">
              Upload marketing images, banners, campaign graphics, and client logos to use across the live website.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchMedia}
              disabled={loading}
              className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 hover:bg-neutral-100 text-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 bg-[#28651B] hover:bg-[#1C4813] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-70"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4 text-[#D9A51B]" />}
              <span>{uploading ? 'Uploading...' : 'Upload Media File'}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/mp4"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Drag & Drop Visual Box */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-neutral-300 dark:border-neutral-600 hover:border-[#28651B] rounded-2xl p-6 sm:p-8 text-center bg-neutral-50 dark:bg-neutral-750/50 hover:bg-emerald-50/30 transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-neutral-700 flex items-center justify-center mx-auto mb-2 text-[#28651B] group-hover:scale-110 transition-transform shadow-xs">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
            Click here to browse &amp; upload images or videos
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            Supports PNG, JPG, JPEG, WEBP, SVG, and MP4 up to 25MB
          </p>
        </div>

        {statusMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{statusMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#28651B] mx-auto mb-2" />
          <p className="text-xs text-neutral-500">Loading media library...</p>
        </div>
      ) : mediaList.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-neutral-800 rounded-3xl border border-dashed border-neutral-300 p-8">
          <ImageIcon className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
          <h4 className="text-base font-bold text-neutral-800 dark:text-neutral-200">No media uploaded yet</h4>
          <p className="text-xs text-neutral-500 mt-1">Upload brand photos, client campaign graphics, and video teasers above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {mediaList.map((media) => {
            const isCopied = copiedId === media.id;
            const isVideo = media.mimeType?.startsWith('video');

            return (
              <div
                key={media.id}
                className="bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-700 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                {/* Thumbnail */}
                <div className="h-32 bg-neutral-100 dark:bg-neutral-700 relative overflow-hidden flex items-center justify-center">
                  {isVideo ? (
                    <div className="flex flex-col items-center justify-center text-neutral-500">
                      <ImageIcon className="w-8 h-8" />
                      <span className="text-[10px] uppercase font-bold mt-1">Video</span>
                    </div>
                  ) : (
                    <img
                      src={media.url}
                      alt={media.originalName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/logo.jpg';
                      }}
                    />
                  )}

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewImage(media.url)}
                      className="p-1.5 bg-white text-neutral-900 rounded-lg hover:scale-110 transition-transform cursor-pointer shadow-md"
                      title="Preview"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(media.url, media.id)}
                      className="p-1.5 bg-white text-neutral-900 rounded-lg hover:scale-110 transition-transform cursor-pointer shadow-md"
                      title="Copy URL"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteMedia(media.id, media.originalName)}
                      className="p-1.5 bg-white text-red-600 rounded-lg hover:scale-110 transition-transform cursor-pointer shadow-md"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="p-3 text-xs space-y-1">
                  <p className="font-bold text-neutral-900 dark:text-white truncate" title={media.originalName}>
                    {media.originalName}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-neutral-400">
                    <span>{formatFileSize(media.size)}</span>
                    <span>{new Date(media.uploadedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                  </div>

                  {onSelectAsHeroImage && (
                    <button
                      type="button"
                      onClick={() => onSelectAsHeroImage(media.url)}
                      className="w-full mt-2 py-1 text-[11px] font-bold text-[#1C4813] bg-[#D9A51B]/20 hover:bg-[#D9A51B]/30 rounded-lg transition-colors cursor-pointer text-center"
                    >
                      Set as Hero Image
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULLSIZE IMAGE PREVIEW MODAL */}
      {previewImage && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-3xl max-h-[85vh] bg-neutral-900 rounded-3xl overflow-hidden p-2 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <img src={previewImage} alt="Preview" className="w-full h-auto max-h-[80vh] object-contain rounded-2xl" />
            <div className="p-3 bg-neutral-900 text-white flex items-center justify-between text-xs">
              <span className="font-mono text-neutral-400 truncate max-w-md">{previewImage}</span>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
