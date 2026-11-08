import { useEffect, useState } from 'react';
import Loader from '../../components/ui/Loader.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import { theme } from '../../config/theme.js';
import * as api from './system.api.js';
import CollectionEditor from './CollectionEditor.jsx';
import toast from 'react-hot-toast';

//  Helper: Bytes ko KB/MB me convert karne ke liye
const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function DatabaseBrowser() {
  const [collections, setCollections] = useState([]);
  const [dbStats, setDbStats] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [docs, setDocs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [editDoc, setEditDoc] = useState(null);
  
  //  NAYA: Drop Index loading state
  const [dropping, setDropping] = useState(false);

  const loadCollections = async () => {
    try {
      const { data } = await api.listCollections();
      const responseData = data.data;
      setCollections(responseData.collections || []);
      setDbStats(responseData.stats || null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load collections');
    }
  };

  const loadDocs = async (coll, page = 1, searchStr = '') => {
    setLoading(true);
    try {
      const { data } = await api.listDocs(coll, { page, limit: 50, search: searchStr });
      setDocs(data.data.documents || []);
      setPagination(data.data.pagination || { page: 1, pages: 1, total: 0 });
      setSelectedCollection(coll);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(loadCollections);
  }, []);

  const handleDelete = async (docId) => {
    if (!window.confirm('Delete this document? This cannot be undone.')) return;
    try {
      await api.deleteDoc(selectedCollection, docId);
      toast.success('Deleted');
      loadDocs(selectedCollection, pagination.page, search);
      loadCollections(); // Refresh size stats
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  //  NAYA: Drop Indexes handler
  const handleDropIndexes = async () => {
    if (!window.confirm('Are you sure you want to drop all custom indexes? This will free up storage but search might be slightly slower.')) return;
    
    setDropping(true);
    try {
      await api.dropIndexes();
      toast.success('Indexes dropped successfully! Storage freed.');
      loadCollections(); // Refresh stats
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to drop indexes');
    } finally {
      setDropping(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
      
      {/*  Top Stats & Actions Banner */}
      {dbStats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          
          <div style={{ background: theme.colors.surface, padding: 20, borderRadius: 12, border: `1px solid ${theme.colors.border}`, boxShadow: theme.shadow.sm }}>
            <div style={{ fontSize: 11, color: theme.colors.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Collections</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: theme.colors.text, marginTop: 4 }}>{dbStats.totalCollections}</div>
          </div>
          
          <div style={{ background: theme.colors.surface, padding: 20, borderRadius: 12, border: `1px solid ${theme.colors.border}`, boxShadow: theme.shadow.sm }}>
            <div style={{ fontSize: 11, color: theme.colors.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Documents</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: theme.colors.text, marginTop: 4 }}>{dbStats.totalDocuments.toLocaleString()}</div>
          </div>
          
          <div style={{ background: theme.colors.surface, padding: 20, borderRadius: 12, border: `1px solid ${theme.colors.border}`, boxShadow: theme.shadow.sm }}>
            <div style={{ fontSize: 11, color: theme.colors.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Database Size</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: theme.colors.secondary, marginTop: 4 }}>{formatBytes(dbStats.totalStorageBytes)}</div>
          </div>

          {/*  NAYA: Drop Indexes Action Card */}
          <div style={{ padding: 20, borderRadius: 12, border: `1px solid ${theme.colors.danger}30`, boxShadow: theme.shadow.sm, display: 'flex', flexDirection: 'column', justifyContent: 'center', background: `linear-gradient(135deg, ${theme.colors.surface} 0%, ${theme.colors.danger}05 100%)` }}>
            <Button variant="danger" onClick={handleDropIndexes} loading={dropping} style={{ width: '100%' }}>
               Drop All Indexes
            </Button>
            <p style={{ margin: '8px 0 0', fontSize: 11, color: theme.colors.danger, textAlign: 'center', fontWeight: 600 }}>
              Free unused storage
            </p>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 320px) 1fr', gap: 20 }}>
        
        {/* Sidebar — Collections list */}
        <div style={{ background: theme.colors.surface, borderRadius: theme.radius.md, border: `1px solid ${theme.colors.border}`, boxShadow: theme.shadow.sm, padding: 12, maxHeight: 'calc(100vh - 340px)', overflowY: 'auto' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: theme.colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, paddingLeft: 4 }}>
            Collections ({collections.length})
          </h3>
          
          {collections.length === 0 ? (
            <p style={{ fontSize: 12, color: theme.colors.muted, textAlign: 'center', marginTop: 20 }}>No collections found.</p>
          ) : (
            collections.map((c) => {
              const isActive = selectedCollection === c.name;
              return (
                <button
                  key={c.name}
                  onClick={() => loadDocs(c.name)}
                  style={{
                    display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'flex-start',
                    padding: '10px 12px', marginBottom: 4, border: 'none', borderRadius: 8,
                    background: isActive ? `${theme.colors.primary}12` : 'transparent',
                    color: isActive ? theme.colors.primary : theme.colors.text,
                    fontWeight: isActive ? 700 : 500, fontSize: 13, cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.2s', borderLeft: isActive ? `3px solid ${theme.colors.primary}` : '3px solid transparent'
                  }}
                  onMouseEnter={(e) => { if(!isActive) e.currentTarget.style.background = theme.colors.background }}
                  onMouseLeave={(e) => { if(!isActive) e.currentTarget.style.background = 'transparent' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {c.name} {c.protected && ''}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: theme.colors.muted, background: theme.colors.border, padding: '2px 6px', borderRadius: 10 }}>
                      {c.count}
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: theme.colors.muted, marginTop: 4 }}>
                    {formatBytes(c.storageSizeBytes)}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Main — Doc list */}
        <div style={{ background: theme.colors.surface, borderRadius: theme.radius.md, border: `1px solid ${theme.colors.border}`, boxShadow: theme.shadow.sm, padding: 20, minHeight: 400 }}>
          {!selectedCollection ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80, color: theme.colors.muted, height: '100%' }}>
              <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}></div>
              <span style={{ fontSize: 15, fontWeight: 600 }}>Select a collection from the left panel</span>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: theme.colors.text, textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {selectedCollection} 
                    {collections.find(c => c.name === selectedCollection)?.protected && (
                      <span style={{ fontSize: 11, background: `${theme.colors.warning}20`, color: theme.colors.warning, padding: '2px 8px', borderRadius: 6, border: `1px solid ${theme.colors.warning}40` }}>
                        PROTECTED
                      </span>
                    )}
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: theme.colors.muted }}>
                    Total {pagination.total.toLocaleString()} documents
                  </p>
                </div>
                <div style={{ minWidth: 260 }}>
                  <Input 
                    placeholder=" Search name/email/code..." 
                    value={search} 
                    onChange={(e) => { setSearch(e.target.value); loadDocs(selectedCollection, 1, e.target.value); }} 
                  />
                </div>
              </div>

              {loading ? (
                <div style={{ padding: 60 }}><Loader /></div>
              ) : docs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 80, color: theme.colors.muted, fontSize: 14, background: theme.colors.background, borderRadius: 12, border: `1px dashed ${theme.colors.border}` }}>
                  <span style={{ fontSize: 32, display: 'block', marginBottom: 8 }}></span>
                  No documents found in this collection.
                </div>
              ) : (
                <div style={{ overflowX: 'auto', borderRadius: 10, border: `1px solid ${theme.colors.border}` }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: theme.colors.background }}>
                        <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 700, color: theme.colors.muted, fontSize: 11, textTransform: 'uppercase' }}>ID</th>
                        <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 700, color: theme.colors.muted, fontSize: 11, textTransform: 'uppercase' }}>Preview Data</th>
                        <th style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, color: theme.colors.muted, fontSize: 11, textTransform: 'uppercase' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {docs.map((d, i) => (
                        <tr key={d._id?.value || d._id || i} style={{ borderBottom: `1px solid ${theme.colors.border}`, transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = theme.colors.background} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 11, color: theme.colors.muted }}>
                            ...{(d._id?.value || d._id || '').toString().slice(-8)}
                          </td>
                          <td style={{ padding: '12px 16px', maxWidth: 400 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: theme.colors.text }}>
                              {d.name || d.username || d.code || d.subject || d.description || d.voName || d.title || d.employeeCode || '—'}
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: 8 }}>
                              <Button size="sm" variant="outline" onClick={() => setEditDoc(d)}>Edit</Button>
                              {!collections.find(c => c.name === selectedCollection)?.protected && (
                                <Button size="sm" variant="danger" onClick={() => handleDelete(d._id?.value || d._id)}>Delete</Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {pagination.pages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 24 }}>
                  <Button size="sm" variant="ghost" disabled={pagination.page <= 1} onClick={() => loadDocs(selectedCollection, pagination.page - 1, search)}>← Prev</Button>
                  <span style={{ fontSize: 12, fontWeight: 700, color: theme.colors.muted }}>
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <Button size="sm" variant="ghost" disabled={pagination.page >= pagination.pages} onClick={() => loadDocs(selectedCollection, pagination.page + 1, search)}>Next →</Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {editDoc && (
        <CollectionEditor 
          collection={selectedCollection} 
          doc={editDoc} 
          onClose={() => setEditDoc(null)} 
          onUpdated={() => { setEditDoc(null); loadDocs(selectedCollection, pagination.page, search); loadCollections(); }} 
        />
      )}
    </div>
  );
}