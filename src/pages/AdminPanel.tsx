import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2, Plus, Save, X, Link as LinkIcon, Copy, Check } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  downloadLink: string;
}

function AdminPanel() {
  const [clients, setClients] = useState<Client[]>([]);
  const [newName, setNewName] = useState('');
  const [newLink, setNewLink] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editLink, setEditLink] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, downloadLink: newLink }),
      });
      setNewName('');
      setNewLink('');
      fetchClients();
    } catch (error) {
      console.error('Failed to add client:', error);
    }
  };

  const handleEdit = async (id: string) => {
    try {
      await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, downloadLink: editLink }),
      });
      setEditingId(null);
      fetchClients();
    } catch (error) {
      console.error('Failed to edit client:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/clients/${id}`, { method: 'DELETE' });
      fetchClients();
    } catch (error) {
      console.error('Failed to delete client:', error);
    }
  };

  const startEditing = (client: Client) => {
    setEditingId(client.id);
    setEditName(client.name);
    setEditLink(client.downloadLink);
  };

  const getClientLink = (clientName: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/?client=${encodeURIComponent(clientName)}`;
  };

  const copyToClipboard = async (clientName: string) => {
    const link = getClientLink(clientName);
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(clientName);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a192f] via-[#0f2444] to-[#1a365d] p-8">
      <div className="max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-white mb-8"
        >
          Admin Panel
        </motion.h1>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/10 backdrop-blur-lg rounded-lg p-6 mb-8"
          onSubmit={handleAdd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Client Name"
              className="bg-white/5 border border-white/20 rounded px-4 py-2 text-white placeholder-white/50"
              required
            />
            <input
              type="url"
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              placeholder="Download Link"
              className="bg-white/5 border border-white/20 rounded px-4 py-2 text-white placeholder-white/50"
              required
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
          >
            <Plus size={18} />
            Add Client
          </button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {clients.map((client) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white/10 backdrop-blur-lg rounded-lg p-6"
            >
              {editingId === client.id ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="bg-white/5 border border-white/20 rounded px-4 py-2 text-white w-full mb-2"
                  />
                  <input
                    type="url"
                    value={editLink}
                    onChange={(e) => setEditLink(e.target.value)}
                    className="bg-white/5 border border-white/20 rounded px-4 py-2 text-white w-full"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(client.id)}
                      className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
                    >
                      <Save size={18} />
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                    >
                      <X size={18} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">{client.name}</h3>
                      <p className="text-blue-200/80 break-all">{client.downloadLink}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditing(client)}
                        className="p-2 hover:bg-white/10 rounded transition-colors"
                      >
                        <Pencil size={18} className="text-blue-300" />
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="p-2 hover:bg-white/10 rounded transition-colors"
                      >
                        <Trash2 size={18} className="text-red-300" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Client Access Link Section */}
                  <div className="mt-4 p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-200/80 mb-2">
                      <LinkIcon size={16} />
                      <span className="text-sm font-medium">Client Access Link:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-white/5 p-2 rounded text-sm text-blue-200/80 break-all">
                        {getClientLink(client.name)}
                      </code>
                      <button
                        onClick={() => copyToClipboard(client.name)}
                        className="p-2 hover:bg-white/10 rounded transition-colors"
                        title="Copy link"
                      >
                        {copiedId === client.name ? (
                          <Check size={18} className="text-green-400" />
                        ) : (
                          <Copy size={18} className="text-blue-300" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default AdminPanel;