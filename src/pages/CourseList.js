import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconPlus, IconSearch } from '../components/ui/Icons';

export default function CourseList() {
  const navigate = useNavigate();

  return (
    <div>
      <div className="row" style={{ marginBottom: 10 }}>
        <div className="pageTitle" style={{ margin: 0 }}>
          Course List
        </div>
        <div />
      </div>

      <div className="row" style={{ marginBottom: 14 }}>
        <div className="searchWrap">
          <input className="search" placeholder="Search" />
          <span className="searchIcon" aria-hidden="true">
            <IconSearch size={18} />
          </span>
        </div>

        <button className="btn btnDark btnIcon" onClick={() => navigate('/courses/create')}>
          <IconPlus size={18} />
          Create Subject
        </button>
      </div>

      <div className="cardGrid">
        <div className="courseCard">
          <div className="courseTitle">Understanding Basic\nFinance</div>
        </div>
        <div className="courseCard" />
        <div className="courseCard" />
        <div className="courseCard" />
        <div className="courseCard" />
        <div className="courseCard" />
      </div>
    </div>
  );
}
