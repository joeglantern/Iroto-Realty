'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase, TravelSection } from '@/lib/supabase';
import SimpleProtectedRoute from '@/components/SimpleProtectedRoute';
import RichTextEditor from '@/components/RichTextEditor';

function TravelPages() {
  const [selectedPage, setSelectedPage] = useState<'pre_arrival' | 'getting_there'>('pre_arrival');
  const [sections, setSections] = useState<TravelSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSection, setEditingSection] = useState<TravelSection | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    is_active: true
  });

  useEffect(() => {
    loadSections();
  }, [selectedPage]);

  const loadSections = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('travel_sections')
        .select('*')
        .eq('page_type', selectedPage)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error('Error loading sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSection) {
        // Update existing section
        const { error } = await supabase
          .from('travel_sections')
          .update({
            title: formData.title,
            content: formData.content,
            is_active: formData.is_active
          })
          .eq('id', editingSection.id);

        if (error) throw error;
      } else {
        // Create new section
        const maxSortOrder = sections.length > 0 ? Math.max(...sections.map(s => s.sort_order)) : 0;
        const { error } = await supabase
          .from('travel_sections')
          .insert({
            page_type: selectedPage,
            title: formData.title,
            content: formData.content,
            sort_order: maxSortOrder + 1,
            is_active: formData.is_active
          });

        if (error) throw error;
      }

      // Reset form and reload sections
      setFormData({ title: '', content: '', is_active: true });
      setEditingSection(null);
      setShowForm(false);
      loadSections();
    } catch (error) {
      console.error('Error saving section:', error);
      alert('Error saving section. Please try again.');
    }
  };

  const handleEdit = (section: TravelSection) => {
    setEditingSection(section);
    setFormData({
      title: section.title,
      content: section.content,
      is_active: section.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (section: TravelSection) => {
    if (!confirm('Are you sure you want to delete this section?')) return;

    try {
      const { error } = await supabase
        .from('travel_sections')
        .delete()
        .eq('id', section.id);

      if (error) throw error;
      loadSections();
    } catch (error) {
      console.error('Error deleting section:', error);
      alert('Error deleting section. Please try again.');
    }
  };

  const moveSection = async (sectionId: string, direction: 'up' | 'down') => {
    const currentIndex = sections.findIndex(s => s.id === sectionId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    try {
      // Swap sort orders
      const currentSection = sections[currentIndex];
      const targetSection = sections[newIndex];

      const updates = [
        {
          id: currentSection.id,
          sort_order: targetSection.sort_order
        },
        {
          id: targetSection.id,
          sort_order: currentSection.sort_order
        }
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('travel_sections')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);

        if (error) throw error;
      }

      loadSections();
    } catch (error) {
      console.error('Error moving section:', error);
      alert('Error reordering section. Please try again.');
    }
  };

  const toggleActive = async (section: TravelSection) => {
    try {
      const { error } = await supabase
        .from('travel_sections')
        .update({ is_active: !section.is_active })
        .eq('id', section.id);

      if (error) throw error;
      loadSections();
    } catch (error) {
      console.error('Error toggling section status:', error);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', is_active: true });
    setEditingSection(null);
    setShowForm(false);
  };

  return (
    <SimpleProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Travel Pages</h1>
                <p className="mt-2 text-gray-600">Manage content for pre-arrival and getting there pages</p>
              </div>
              <Link
                href="/dashboard"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>

          {/* Page Selector */}
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Page to Edit</h2>
              <div className="flex space-x-4">
                <button
                  onClick={() => setSelectedPage('pre_arrival')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    selectedPage === 'pre_arrival'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Pre-Arrival Guide
                </button>
                <button
                  onClick={() => setSelectedPage('getting_there')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    selectedPage === 'getting_there'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Getting There
                </button>
              </div>
            </div>
          </div>

          {/* Add Section Button */}
          {!showForm && (
            <div className="mb-6">
              <button
                onClick={() => setShowForm(true)}
                className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-md font-medium transition-colors"
              >
                Add New Section
              </button>
            </div>
          )}

          {/* Section Form */}
          {showForm && (
            <div className="mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingSection ? 'Edit Section' : 'Add New Section'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Section Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                      Content
                    </label>
                    <RichTextEditor
                      value={formData.content}
                      onChange={(content) => setFormData({ ...formData, content })}
                      className="min-h-[300px]"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                      Active (visible on website)
                    </label>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-md font-medium transition-colors"
                    >
                      {editingSection ? 'Update Section' : 'Create Section'}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-md font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Sections List */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedPage === 'pre_arrival' ? 'Pre-Arrival Guide' : 'Getting There'} Sections
              </h2>
            </div>

            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading sections...</p>
              </div>
            ) : sections.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No sections found. Create your first section to get started.
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {sections.map((section) => (
                  <div key={section.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-primary rounded-full">
                            {sections.findIndex(s => s.id === section.id) + 1}
                          </span>
                          <h3 className="text-lg font-medium text-gray-900">{section.title}</h3>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              section.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {section.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div
                          className="text-gray-600 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: section.content.substring(0, 200) + '...' }}
                        />
                        <p className="text-xs text-gray-400 mt-2">
                          Created: {new Date(section.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {/* Move Up/Down Buttons */}
                        <div className="flex flex-col space-y-1">
                          <button
                            onClick={() => moveSection(section.id, 'up')}
                            disabled={sections.findIndex(s => s.id === section.id) === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Move up"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => moveSection(section.id, 'down')}
                            disabled={sections.findIndex(s => s.id === section.id) === sections.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Move down"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleActive(section)}
                            className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                              section.is_active
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {section.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleEdit(section)}
                            className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 text-sm font-medium rounded transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(section)}
                            className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 text-sm font-medium rounded transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </SimpleProtectedRoute>
  );
}

export default TravelPages;