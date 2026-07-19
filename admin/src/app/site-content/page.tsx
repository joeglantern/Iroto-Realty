'use client';

import { useState, useEffect } from 'react';
import SimpleProtectedRoute from '@/components/SimpleProtectedRoute';
import AdminHeader from '@/components/layout/AdminHeader';
import { uploadFile, deleteFile, getStorageUrl, supabase } from '@/lib/supabase';
import { toast, confirmDialog } from '@/lib/notify';

interface ImageSlot {
  key: string;
  label: string;
  description: string;
  recommended: string;
}

const IMAGE_SLOTS: ImageSlot[] = [
  {
    key: 'about_hero_image',
    label: 'About Page Hero',
    description: 'Background image at the top of the About Us page',
    recommended: 'Recommended: 1920x1080px or larger, landscape'
  },
  {
    key: 'about_story_image',
    label: 'About Page - Our Story Photo',
    description: 'Photo shown beside the "Our Story" text on the About Us page',
    recommended: 'Recommended: 800x600px or larger'
  },
];

const SUPPORTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_HERO_IMAGES = 8;

interface PendingHeroFile {
  file: File;
  url: string;
}

export default function SiteContent() {
  // Homepage hero slideshow state
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [heroPending, setHeroPending] = useState<PendingHeroFile[]>([]);
  const [heroBusy, setHeroBusy] = useState(false);

  // Single-image slots state (about page)
  const [values, setValues] = useState<Record<string, string>>({});
  const [pendingFiles, setPendingFiles] = useState<Record<string, File | null>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_key, setting_value')
        .eq('category', 'site_images');

      if (error) throw error;

      const map: Record<string, string> = {};
      (data || []).forEach((row: any) => {
        if (row.setting_value) map[row.setting_key] = row.setting_value;
      });

      // Hero slideshow: JSON array, falling back to the legacy single image
      let slideshow: string[] = [];
      if (map.home_hero_images) {
        try {
          const parsed = JSON.parse(map.home_hero_images);
          if (Array.isArray(parsed)) slideshow = parsed.filter(Boolean);
        } catch {
          // Ignore malformed JSON and fall back to the legacy single image
        }
      }
      if (slideshow.length === 0 && map.home_hero_image) {
        slideshow = [map.home_hero_image];
      }
      setHeroImages(slideshow);

      delete map.home_hero_images;
      delete map.home_hero_image;
      setValues(map);
    } catch {
      toast.error('Error loading site images. Please refresh and try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateFile = (file: File): string | null => {
    if (!SUPPORTED_FORMATS.includes(file.type)) {
      return `${file.name}: Unsupported format. Please use JPEG, PNG, or WebP.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name}: Too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 10MB.`;
    }
    return null;
  };

  // ---- Homepage hero slideshow handlers ----

  const persistHeroImages = async (paths: string[]) => {
    const { error } = await supabase
      .from('system_settings')
      .upsert([
        {
          setting_key: 'home_hero_images',
          setting_value: JSON.stringify(paths),
          setting_type: 'json',
          is_public: true,
          category: 'site_images'
        },
        {
          // The JSON list is now the source of truth - clear the legacy single value
          setting_key: 'home_hero_image',
          setting_value: '',
          setting_type: 'text',
          is_public: true,
          category: 'site_images'
        }
      ], { onConflict: 'setting_key' });
    if (error) throw new Error(error.message || 'Failed to save slideshow');
  };

  const addHeroFiles = (files: File[]) => {
    if (files.length === 0) return;

    const errors: string[] = [];
    const valid: PendingHeroFile[] = [];
    files.forEach(file => {
      const err = validateFile(file);
      if (err) {
        errors.push(err);
      } else if (!heroPending.some(p => p.file.name === file.name && p.file.size === file.size)) {
        valid.push({ file, url: URL.createObjectURL(file) });
      }
    });

    if (errors.length > 0) {
      toast.error(`Some files were rejected:\n${errors.slice(0, 4).join('\n')}${errors.length > 4 ? '\n...' : ''}`);
    }
    if (valid.length === 0) return;

    const total = heroImages.length + heroPending.length + valid.length;
    if (total > MAX_HERO_IMAGES) {
      toast.warning(`The slideshow can have up to ${MAX_HERO_IMAGES} photos.`);
      valid.splice(MAX_HERO_IMAGES - heroImages.length - heroPending.length);
      if (valid.length === 0) return;
    }

    setHeroPending(prev => [...prev, ...valid]);
  };

  const removeHeroPending = (index: number) => {
    setHeroPending(prev => prev.filter((_, i) => i !== index));
  };

  const saveHeroPending = async () => {
    if (heroPending.length === 0 || heroBusy) return;

    try {
      setHeroBusy(true);

      const newPaths: string[] = [];
      for (const { file } of heroPending) {
        const path = `site/home_hero/${Date.now()}-${file.name}`;
        const { error: uploadError } = await uploadFile('property-images', path, file);
        if (uploadError) throw new Error(uploadError.message || `Upload failed for ${file.name}`);
        newPaths.push(path);
      }

      const updated = [...heroImages, ...newPaths];
      await persistHeroImages(updated);

      setHeroImages(updated);
      setHeroPending([]);
      toast.success(
        updated.length > 1
          ? `Slideshow saved! The homepage now plays transitions between ${updated.length} photos.`
          : 'Hero photo saved! The homepage shows it with a slow cinematic zoom.'
      );
    } catch (error) {
      toast.error(`Failed to save slideshow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setHeroBusy(false);
    }
  };

  const removeHeroImage = async (path: string) => {
    if (heroBusy) return;
    const confirmed = await confirmDialog(
      heroImages.length === 1
        ? 'This is the last photo - the homepage will go back to the default image.'
        : 'This photo will be removed from the homepage slideshow.',
      { title: 'Remove this photo?', confirmText: 'Remove', danger: true }
    );
    if (!confirmed) return;

    try {
      setHeroBusy(true);
      const updated = heroImages.filter(p => p !== path);
      await persistHeroImages(updated);
      if (path.startsWith('site/')) {
        await deleteFile('property-images', path).catch(() => {});
      }
      setHeroImages(updated);
      toast.success('Photo removed from the slideshow.');
    } catch (error) {
      toast.error(`Failed to remove photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setHeroBusy(false);
    }
  };

  const moveHeroImage = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (heroBusy || target < 0 || target >= heroImages.length) return;

    const updated = [...heroImages];
    [updated[index], updated[target]] = [updated[target], updated[index]];

    try {
      setHeroBusy(true);
      await persistHeroImages(updated);
      setHeroImages(updated);
    } catch (error) {
      toast.error(`Failed to reorder photos: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setHeroBusy(false);
    }
  };

  // ---- Single-image slot handlers (about page) ----

  const handleFileSelect = (key: string, file: File | null) => {
    if (!file) return;

    const err = validateFile(file);
    if (err) {
      toast.error(err);
      return;
    }

    setPendingFiles(prev => ({ ...prev, [key]: file }));
    setPreviews(prev => ({ ...prev, [key]: URL.createObjectURL(file) }));
  };

  const handleSave = async (key: string) => {
    const file = pendingFiles[key];
    if (!file || savingKey) return;

    try {
      setSavingKey(key);

      const oldPath = values[key];
      const path = `site/${key}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await uploadFile('property-images', path, file);
      if (uploadError) throw new Error(uploadError.message || 'Upload failed');

      const { error: upsertError } = await supabase
        .from('system_settings')
        .upsert({
          setting_key: key,
          setting_value: path,
          setting_type: 'text',
          is_public: true,
          category: 'site_images'
        }, { onConflict: 'setting_key' });
      if (upsertError) throw new Error(upsertError.message || 'Failed to save setting');

      // Clean up the replaced file (best effort - the setting already points to the new one)
      if (oldPath && oldPath !== path) {
        await deleteFile('property-images', oldPath).catch(() => {});
      }

      setValues(prev => ({ ...prev, [key]: path }));
      setPendingFiles(prev => ({ ...prev, [key]: null }));
      setPreviews(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      toast.success('Image updated! The website will show the new image immediately.');
    } catch (error) {
      toast.error(`Failed to save image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSavingKey(null);
    }
  };

  const handleRemove = async (key: string) => {
    const currentPath = values[key];
    if (!currentPath || savingKey) return;
    const confirmed = await confirmDialog('The website will go back to the default image.', {
      title: 'Remove this photo?',
      confirmText: 'Remove',
      danger: true
    });
    if (!confirmed) return;

    try {
      setSavingKey(key);

      const { error: upsertError } = await supabase
        .from('system_settings')
        .upsert({
          setting_key: key,
          setting_value: '',
          setting_type: 'text',
          is_public: true,
          category: 'site_images'
        }, { onConflict: 'setting_key' });
      if (upsertError) throw new Error(upsertError.message || 'Failed to remove setting');

      // Clean up the stored file (best effort - the setting is already cleared)
      await deleteFile('property-images', currentPath).catch(() => {});

      setValues(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      toast.success('Photo removed. The website is back to the default image.');
    } catch (error) {
      toast.error(`Failed to remove photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSavingKey(null);
    }
  };

  const handleCancel = (key: string) => {
    setPendingFiles(prev => ({ ...prev, [key]: null }));
    setPreviews(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  return (
    <SimpleProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />

        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-6 md:mb-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Site Content</h1>
            <p className="mt-2 text-sm md:text-base text-gray-600">
              Update the photos shown on the homepage and About Us page
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-500">Loading site images...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Homepage Hero Slideshow */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-5 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Homepage Hero Slideshow</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    The full-screen photos behind the search bar on the homepage. Add several photos and the
                    homepage plays smooth transitions between them - a single photo gets a slow cinematic zoom.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Recommended: 1920x1080px or larger, landscape. Up to {MAX_HERO_IMAGES} photos - they play in the order shown.
                  </p>
                </div>

                <div className="p-5">
                  {heroImages.length === 0 && heroPending.length === 0 && (
                    <p className="text-sm text-gray-500 mb-4">
                      No photos yet - the homepage is using its default image.
                    </p>
                  )}

                  {(heroImages.length > 0 || heroPending.length > 0) && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                      {heroImages.map((path, index) => (
                        <div key={path} className="relative group">
                          <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 border">
                            <img
                              src={getStorageUrl('property-images', path)}
                              alt={`Slideshow photo ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="absolute top-1.5 left-1.5 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                            {index + 1}
                          </span>
                          <div className="absolute bottom-1.5 right-1.5 flex gap-1">
                            <button
                              type="button"
                              onClick={() => moveHeroImage(index, -1)}
                              disabled={heroBusy || index === 0}
                              title="Move earlier"
                              className="w-7 h-7 bg-white/90 text-gray-700 rounded-full text-sm flex items-center justify-center shadow hover:bg-white disabled:opacity-40"
                            >
                              ←
                            </button>
                            <button
                              type="button"
                              onClick={() => moveHeroImage(index, 1)}
                              disabled={heroBusy || index === heroImages.length - 1}
                              title="Move later"
                              className="w-7 h-7 bg-white/90 text-gray-700 rounded-full text-sm flex items-center justify-center shadow hover:bg-white disabled:opacity-40"
                            >
                              →
                            </button>
                            <button
                              type="button"
                              onClick={() => removeHeroImage(path)}
                              disabled={heroBusy}
                              title="Remove photo"
                              className="w-7 h-7 bg-red-500 text-white rounded-full text-sm flex items-center justify-center shadow hover:bg-red-600 disabled:opacity-40"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}

                      {heroPending.map((pending, index) => (
                        <div key={pending.url} className="relative">
                          <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-primary/60">
                            <img
                              src={pending.url}
                              alt={`New photo ${index + 1}`}
                              className="w-full h-full object-cover opacity-90"
                            />
                          </div>
                          <span className="absolute top-1.5 left-1.5 bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                            New
                          </span>
                          <button
                            type="button"
                            onClick={() => removeHeroPending(index)}
                            disabled={heroBusy}
                            title="Remove"
                            className="absolute bottom-1.5 right-1.5 w-7 h-7 bg-red-500 text-white rounded-full text-sm flex items-center justify-center shadow hover:bg-red-600 disabled:opacity-40"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      multiple
                      className="hidden"
                      id="hero-slideshow-images"
                      onChange={(e) => {
                        addHeroFiles(Array.from(e.target.files || []));
                        e.target.value = '';
                      }}
                    />
                    <label
                      htmlFor="hero-slideshow-images"
                      className="px-4 py-2 border border-primary text-primary rounded-md cursor-pointer hover:bg-primary/10 transition-colors text-sm"
                    >
                      Add Photos
                    </label>

                    {heroPending.length > 0 && (
                      <button
                        onClick={saveHeroPending}
                        disabled={heroBusy}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm flex items-center"
                      >
                        {heroBusy ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          `Save ${heroPending.length} New Photo${heroPending.length > 1 ? 's' : ''}`
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* About page single-image slots */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {IMAGE_SLOTS.map((slot) => {
                  const currentPath = values[slot.key];
                  const preview = previews[slot.key];
                  const pending = pendingFiles[slot.key];
                  const isSaving = savingKey === slot.key;

                  return (
                    <div key={slot.key} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                      <div className="aspect-video bg-gray-100">
                        {preview ? (
                          <img src={preview} alt={`${slot.label} preview`} className="w-full h-full object-cover" />
                        ) : currentPath ? (
                          <img
                            src={getStorageUrl('property-images', currentPath)}
                            alt={slot.label}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                            <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm">Using default image</p>
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <h3 className="text-lg font-semibold text-gray-900">{slot.label}</h3>
                        <p className="text-sm text-gray-600 mt-1">{slot.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{slot.recommended}</p>

                        {preview && pending && (
                          <p className="text-sm text-primary mt-3 font-medium">
                            New: {pending.name} (not saved yet)
                          </p>
                        )}

                        <div className="mt-4 flex flex-wrap gap-3">
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            className="hidden"
                            id={`site-image-${slot.key}`}
                            onChange={(e) => {
                              handleFileSelect(slot.key, e.target.files?.[0] || null);
                              e.target.value = '';
                            }}
                          />
                          <label
                            htmlFor={`site-image-${slot.key}`}
                            className="px-4 py-2 border border-primary text-primary rounded-md cursor-pointer hover:bg-primary/10 transition-colors text-sm"
                          >
                            {currentPath || preview ? 'Choose New Image' : 'Choose Image'}
                          </label>

                          {pending && (
                            <>
                              <button
                                onClick={() => handleSave(slot.key)}
                                disabled={isSaving}
                                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm flex items-center"
                              >
                                {isSaving ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Saving...
                                  </>
                                ) : (
                                  'Save Image'
                                )}
                              </button>
                              <button
                                onClick={() => handleCancel(slot.key)}
                                disabled={isSaving}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
                              >
                                Cancel
                              </button>
                            </>
                          )}

                          {currentPath && !pending && (
                            <button
                              onClick={() => handleRemove(slot.key)}
                              disabled={isSaving}
                              className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 text-sm flex items-center"
                            >
                              {isSaving ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                                  Removing...
                                </>
                              ) : (
                                'Remove Photo'
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </SimpleProtectedRoute>
  );
}
