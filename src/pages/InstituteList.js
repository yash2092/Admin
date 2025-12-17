import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconPencil, IconPlus, IconSearch, IconTrash } from '../components/ui/Icons';

const rows = Array.from({ length: 10 }).map((_, i) => ({
  id: '0001',
  name: 'Example',
  trademark: 'trademark name',
  createdBy: 'created name',
  createdOn: '02 Feb 2025',
  key: `row-${i}`,
}));

export default function InstituteList() {
  const navigate = useNavigate();

  return (
    <div>
      <div className="pageTitle">Institute List</div>

      <div className="row" style={{ marginBottom: 14 }}>
        <div className="searchWrap">
          <input className="search" placeholder="Search" />
          <span className="searchIcon" aria-hidden="true">
            <IconSearch size={18} />
          </span>
        </div>

        <button className="btn btnDark btnIcon" onClick={() => navigate('/institutes/create')}>
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
              {rows.map((r) => (
                <tr key={r.key}>
                  <td>{r.id}</td>
                  <td>{r.name}</td>
                  <td>{r.trademark}</td>
                  <td>{r.createdBy}</td>
                  <td>{r.createdOn}</td>
                  <td>
                    <div className="actions">
                      <button className="iconBtn" aria-label="Edit">
                        <IconPencil size={16} />
                      </button>
                      <button className="iconBtn" aria-label="Delete">
                        <IconTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pager">
          <span>Page 1 of 4</span>
          <button className="iconBtn" aria-label="Previous page">‹</button>
          <button className="iconBtn" aria-label="Next page">›</button>
        </div>
      </div>
    </div>
  );
}
