'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SimpleProtectedRoute from '@/components/SimpleProtectedRoute';
import AdminHeader from '@/components/layout/AdminHeader';
import { useSimpleAuth } from '@/contexts/SimpleAuthContext';
import { supabase } from '@/lib/supabase';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  inquiry_type: 'general' | 'property' | 'investment' | 'booking';
  status: 'new' | 'in_progress' | 'replied' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  admin_notes?: string;
  responded_at?: string;
  created_at: string;
  updated_at: string;
}

export default function Messages() {
  const { signOut, user, isAdmin } = useSimpleAuth();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  });

  useEffect(() => {
    fetchMessages();
  }, [filters]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('contact_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,subject.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMessageStatus = async (messageId: string, status: 'new' | 'in_progress' | 'replied' | 'closed') => {
    try {
      const { error } = await supabase
        .from('contact_inquiries')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', messageId);

      if (error) {
        console.error('Error updating message:', error);
        return;
      }

      fetchMessages();
      if (selectedMessage?.id === messageId) {
        setSelectedMessage({ ...selectedMessage, status });
      }
    } catch (error) {
      console.error('Error updating message:', error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('contact_inquiries')
        .delete()
        .eq('id', messageId);

      if (error) {
        console.error('Error deleting message:', error);
        return;
      }

      fetchMessages();
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
        setShowModal(false);
      }
      setShowDeleteConfirm(false);
      setMessageToDelete(null);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setShowToast(true);
      setTimeout(() => {
        setCopiedText(null);
        setShowToast(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'replied': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <SimpleProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Shared Header */}
        <AdminHeader />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
            <p className="text-gray-600 mt-1">View and manage customer inquiries</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Messages</p>
                  <p className="text-2xl font-bold text-gray-900">{messages.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">New Messages</p>
                  <p className="text-2xl font-bold text-gray-900">{messages.filter(m => m.status === 'new').length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Responded</p>
                  <p className="text-2xl font-bold text-gray-900">{messages.filter(m => m.status === 'replied').length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div className="w-full md:w-48">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="replied">Replied</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <button
                onClick={fetchMessages}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Messages Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="p-8 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
                <p className="text-gray-600">No contact messages match your current filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {messages.map((message) => (
                      <tr key={message.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{message.name}</div>
                            <div className="text-sm text-gray-600">{message.email}</div>
                            {message.phone && <div className="text-sm text-gray-500">{message.phone}</div>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{message.subject || 'No subject'}</div>
                          <div className="text-sm text-gray-600 truncate max-w-xs">{message.message}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                            {message.inquiry_type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadgeColor(message.status)}`}>
                            {message.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(message.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => {
                                setSelectedMessage(message);
                                setShowModal(true);
                              }}
                              className="text-primary hover:text-primary/80 text-sm font-medium"
                            >
                              View
                            </button>
                            {message.status === 'new' && (
                              <button
                                onClick={() => updateMessageStatus(message.id, 'replied')}
                                className="text-green-600 hover:text-green-800 text-sm font-medium"
                              >
                                Mark Replied
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setMessageToDelete(message.id);
                                setShowDeleteConfirm(true);
                              }}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>

        {/* Message Reading Component */}
        {showModal && selectedMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
              
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium">
                    {selectedMessage.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-medium text-gray-900">{selectedMessage.name}</h2>
                    
                    {/* Contact Information - Enhanced */}
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center space-x-2">
                        <a 
                          href={`mailto:${selectedMessage.email}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline flex items-center"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {selectedMessage.email}
                        </a>
                        <button
                          onClick={() => copyToClipboard(selectedMessage.email)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Copy email"
                        >
                          {copiedText === selectedMessage.email ? (
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                      </div>
                      
                      {selectedMessage.phone && (
                        <div className="flex items-center space-x-2">
                          <a 
                            href={`tel:${selectedMessage.phone}`}
                            className="text-green-600 hover:text-green-800 text-sm font-medium hover:underline flex items-center"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {selectedMessage.phone}
                          </a>
                          <button
                            onClick={() => copyToClipboard(selectedMessage.phone || '')}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="Copy phone number"
                          >
                            {copiedText === selectedMessage.phone ? (
                              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      )}
                      
                      {/* Copy all contact info button */}
                      <div className="mt-2 pt-1">
                        <button
                          onClick={() => {
                            const contactInfo = `${selectedMessage.name}\nEmail: ${selectedMessage.email}${selectedMessage.phone ? `\nPhone: ${selectedMessage.phone}` : ''}`;
                            copyToClipboard(contactInfo);
                          }}
                          className="text-xs text-gray-500 hover:text-gray-700 flex items-center space-x-1 transition-colors"
                          title="Copy all contact information"
                        >
                          {copiedText === `${selectedMessage.name}\nEmail: ${selectedMessage.email}${selectedMessage.phone ? `\nPhone: ${selectedMessage.phone}` : ''}` ? (
                            <>
                              <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-green-600 font-medium">Copied!</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              <span>Copy all contact info</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(selectedMessage.status)}`}>
                    {selectedMessage.status.replace('_', ' ')}
                  </span>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

              {/* Message Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  
                  {/* Message Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 bg-gray-50 p-4 rounded">
                    <div className="flex items-center space-x-4">
                      <span>Received: {formatDate(selectedMessage.created_at)}</span>
                      <span className="capitalize">Type: {selectedMessage.inquiry_type.replace('_', ' ')}</span>
                    </div>
                    {selectedMessage.responded_at && (
                      <span className="mt-2 sm:mt-0">Responded: {formatDate(selectedMessage.responded_at)}</span>
                    )}
                  </div>

                  {/* Subject */}
                  {selectedMessage.subject && (
                  <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {selectedMessage.subject}
                      </h3>
                    </div>
                  )}

                  {/* Message Body */}
                  <div className="bg-white border-l-4 border-blue-500 pl-4">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {selectedMessage.message}
                      </p>
                  </div>
                </div>

                  {/* Admin Notes */}
                  {selectedMessage.admin_notes && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Admin Notes</h4>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {selectedMessage.admin_notes}
                      </p>
                </div>
                  )}
                  </div>
                </div>

              {/* Actions Footer */}
              <div className="border-t p-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium order-last sm:order-first"
                  >
                    Close
                  </button>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => {
                        setMessageToDelete(selectedMessage.id);
                        setShowDeleteConfirm(true);
                      }}
                      className="px-4 py-2 text-red-600 hover:text-red-800 text-sm font-medium border border-red-200 hover:bg-red-50 rounded"
                    >
                      Delete
                    </button>
                    
                    {selectedMessage.status === 'new' && (
                      <button
                        onClick={() => {
                          updateMessageStatus(selectedMessage.id, 'replied');
                          setShowModal(false);
                        }}
                        className="px-4 py-2 text-green-600 hover:text-green-800 text-sm font-medium border border-green-200 hover:bg-green-50 rounded"
                      >
                        Mark as Replied
                      </button>
                    )}
                    
                    <a
                      href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || 'Your inquiry'}&body=Hi ${selectedMessage.name},%0A%0AThank you for your inquiry.%0A%0A`}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors text-center"
                    >
                      Reply
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {showDeleteConfirm && messageToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Delete Message</h3>
                    <p className="text-sm text-gray-500">This action cannot be undone</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-6">
                  Are you sure you want to delete this message? It will be permanently removed.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setMessageToDelete(null);
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deleteMessage(messageToDelete)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-4 right-4 z-50 transition-all duration-300 ease-out transform animate-pulse">
            <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">Contact info copied to clipboard!</span>
            </div>
          </div>
        )}
      </div>
    </SimpleProtectedRoute>
  );
}