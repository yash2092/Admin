import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconPencil, IconPlus, IconSearch, IconTrash } from '../ui/Icons';
import { loadList, removeById, saveList, storageKey } from '../utils/storage';
import '../styles/admin/ui/Cards.css';
import '../styles/admin/ui/Controls.css';
import '../styles/admin/ui/Buttons.css';
import '../styles/admin/ui/Tables.css';
import '../styles/admin/pages/InstituteList.css';

const EMPTY_CELL = '—';
const INSTITUTES_STORAGE_KEY = storageKey('institutes');

// Use one shared formatter so we don't recreate it on every render.
// WHY: keeps formatting stable across devices and avoids small performance churn.
const createdOnDateFormatter = new Intl.DateTimeFormat('en-GB', {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
});

function formatCreatedOnDate(isoString) {
  // The table layout should remain stable even when fields are missing or partially entered.
  // Returning a single placeholder avoids "jumpy" rows (e.g. empty vs non-empty widths).
  if (!isoString) return EMPTY_CELL;

  const date = new Date(isoString);
  const isValidDate = Number.isFinite(date.getTime());
  if (!isValidDate) return EMPTY_CELL;

  return createdOnDateFormatter.format(date);
}

function formatInstituteId(id) {
  // IDs can be long; we display only the last 6 characters for readability.
  // WHY: keeps the column width consistent and scan-friendly.
  const rawId = String(id || '');
  const lastSixChars = rawId.slice(-6);
  return lastSixChars.toUpperCase();
}

export default function InstituteList() {
  const navigate = useNavigate();
  // Memoize the storage key so effects below don't re-run unnecessarily.
  const institutesStorageKey = useMemo(() => INSTITUTES_STORAGE_KEY, []);

  const [query, setQuery] = useState('');
  const [allInstitutes, setAllInstitutes] = useState(() => loadList(institutesStorageKey));

  useEffect(() => {
    // WHY: institutes can be updated from other tabs or after coming back to this tab.
    // We re-read storage to keep the list accurate without requiring a full reload.
    const refreshFromStorage = () => {
      const latestInstitutes = loadList(institutesStorageKey);
      setAllInstitutes(latestInstitutes);
    };

    window.addEventListener('storage', refreshFromStorage);
    window.addEventListener('focus', refreshFromStorage);

    return () => {
      window.removeEventListener('storage', refreshFromStorage);
      window.removeEventListener('focus', refreshFromStorage);
    };
  }, [institutesStorageKey]);

  const visibleInstitutes = useMemo(() => {
    const trimmedQuery = query.trim();
    const normalizedQuery = trimmedQuery.toLowerCase();

    // If the user hasn't typed anything, show everything.
    if (!normalizedQuery) return allInstitutes;

    return allInstitutes.filter((institute) => {
      // Build a single string to search across common fields.
      // WHY: simple and predictable for users; no fancy ranking logic.
      const partsToSearch = [
        institute.name || '',
        institute.trademark || '',
        institute.gst || '',
      ];

      const searchableText = partsToSearch.join(' ').toLowerCase();
      return searchableText.includes(normalizedQuery);
    });
  }, [allInstitutes, query]);

  function handleQueryChange(event) {
    const nextQuery = event.target.value;
    setQuery(nextQuery);
  }

  const goToCreateInstitute = () => {
    // The Create page redirects to step 1, so we can navigate directly there.
    navigate('/institutes/create/1');
  };

  const goToEditInstitute = (instituteId) => {
    navigate(`/institutes/${instituteId}/edit/1`);
  };

  const deleteInstitute = (instituteId) => {
    const userConfirmed = window.confirm('Delete this institute? This cannot be undone.');
    if (!userConfirmed) return;

    const nextInstitutes = removeById(allInstitutes, instituteId);
    saveList(institutesStorageKey, nextInstitutes);
    setAllInstitutes(nextInstitutes);
  };

  return (
    <div>
      <div className="pageTitle">Institute List</div>

      <div className="row instituteListSearchRow">
        <div className="searchWrap">
          <input
            className="search"
            placeholder="Search"
            value={query}
            onChange={handleQueryChange}
          />
          <span className="searchIcon" aria-hidden="true">
            <IconSearch size={18} />
          </span>
        </div>

        <button className="btn btnDark btnIcon" onClick={goToCreateInstitute}>
          <IconPlus size={18} />
          Create Institute
        </button>
      </div>

      <div className="card">
        <div className="tableWrap">
          <table className="table instituteListTable">
            {/* WHY `colgroup` + `table-layout: fixed`:
               - Guarantees headers and rows share the exact same column widths.
               - Prevents long text from stretching columns and misaligning the table. */}
            <colgroup>
              <col className="instituteListColId" />
              <col className="instituteListColName" />
              <col className="instituteListColTrademark" />
              <col className="instituteListColCreatedBy" />
              <col className="instituteListColCreatedOn" />
              <col className="instituteListColAction" />
            </colgroup>
            <thead>
              <tr>
                <th className="instituteListIdCol">ID No.</th>
                <th className="instituteListNameCol">Institute Name</th>
                <th className="instituteListTrademarkCol">Trademark</th>
                <th className="instituteListCreatedByCol">Created By</th>
                <th className="instituteListCreatedOnCol">Created On</th>
                <th className="instituteListActionCol">Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleInstitutes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="instituteListEmptyCell">
                    No institutes found.
                  </td>
                </tr>
              ) : (
                visibleInstitutes.map((institute) => (
                  <tr key={institute.id}>
                    <td className="instituteListIdCol">{formatInstituteId(institute.id)}</td>
                    <td className="instituteListNameCol">
                      <div className="cellTruncate" title={institute.name || ''}>
                        {institute.name || EMPTY_CELL}
                      </div>
                    </td>
                    <td className="instituteListTrademarkCol">
                      <div className="cellTruncate" title={institute.trademark || ''}>
                        {institute.trademark || EMPTY_CELL}
                      </div>
                    </td>
                    <td className="instituteListCreatedByCol">
                      <div className="cellTruncate" title={institute.createdBy || 'ADMIN USER'}>
                        {institute.createdBy || 'ADMIN USER'}
                      </div>
                    </td>
                    <td className="instituteListCreatedOnCol">{formatCreatedOnDate(institute.createdAt)}</td>
                    <td className="instituteListActionCol">
                      <div className="actions">
                        <button
                          className="iconBtn"
                          aria-label="Edit"
                          type="button"
                          onClick={() => goToEditInstitute(institute.id)}
                        >
                          <IconPencil size={16} />
                        </button>
                        <button
                          className="iconBtn"
                          aria-label="Delete"
                          type="button"
                          onClick={() => deleteInstitute(institute.id)}
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
            Showing {visibleInstitutes.length} of {allInstitutes.length}
          </span>
        </div>
      </div>
    </div>
  );
}
