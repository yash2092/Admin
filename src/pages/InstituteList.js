import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconPencil, IconPlus, IconSearch, IconTrash } from '../components/ui/Icons';
import { loadList, removeById, saveList, storageKey } from '../utils/storage';

function formatDate(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
  } catch {
    return '';
  }
}

export default function InstituteList() {
  const navigate = useNavigate();
  const institutesKey = useMemo(() => storageKey('institutes'), []);
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState(() => loadList(institutesKey));

  useEffect(() => {
    const refresh = () => setRows(loadList(institutesKey));
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [institutesKey]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const hay = `${r.name || ''} ${r.trademark || ''} ${r.gst || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, rows]);

  return (
    <div>
      <div className="pageTitle">Institute List</div>

      <div className="row" style={{ marginBottom: 14 }}>
        <div className="searchWrap">
          <input className="search" placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
          <span className="searchIcon" aria-hidden="true">
            <IconSearch size={18} />
          </span>
        </div>

        <button className="btn btnDark btnIcon" onClick={() => navigate('/institutes/create/1')}>
          <IconPlus size={18} />
          Create Institute
        </button>
      </div>

      <div className="card">
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 90 }}>ID No.</th>
                <th>Institute Name</th>
                <th>Trademark</th>
                <th>Created By</th>
                <th>Created on</th>
                <th style={{ width: 120, textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ color: 'var(--muted)' }}>
                    No institutes found.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id}>
                    <td>{String(r.id || '').slice(-6).toUpperCase()}</td>
                    <td>{r.name}</td>
                    <td>{r.trademark}</td>
                    <td>{r.createdBy || 'ADMIN USER'}</td>
                    <td>{formatDate(r.createdAt)}</td>
                    <td>
                      <div className="actions">
                        <button
                          className="iconBtn"
                          aria-label="Edit"
                          type="button"
                          onClick={() => navigate(`/institutes/${r.id}/edit/1`)}
                        >
                          <IconPencil size={16} />
                        </button>
                        <button
                          className="iconBtn"
                          aria-label="Delete"
                          type="button"
                          onClick={() => {
                            const ok = window.confirm('Delete this institute? This cannot be undone.');
                            if (!ok) return;
                            const next = removeById(rows, r.id);
                            saveList(institutesKey, next);
                            setRows(next);
                          }}
                        >
                          <IconTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pager">
          <span>
            Showing {filtered.length} of {rows.length}
          </span>
        </div>
      </div>
    </div>
  );
}
