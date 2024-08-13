"use client";
import { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import 'chartjs-adapter-luxon';

export function DashboardPlaceholder() {
  return (
    <>
      <ul className="list-unstyled">
        <li>
          <p className="card-text placeholder-glow">
            <span>Wins: </span>
            <span className="placeholder col-1"></span>
          </p>
        </li>
        <li>
          <p className="card-text placeholder-glow">
            <span>Loses: </span>
            <span className="placeholder col-1"></span>
          </p>
        </li>
      </ul >
      <p className="card-text placeholder-glow">
        <span>Current Streak Record: </span>
        <span className="placeholder col-1"></span>
      </p>
      <p className="card-text placeholder-glow">
        <span>Number Of Matches Played: </span>
        <span className="placeholder col-1"></span>
      </p>
      <div className="container">
        <div className="row align-items-center justify-content-center">
          <div className="col">
            <a className="btn btn-info disabled placeholder col-2 m-2" aria-disabled="true">Show Match History</a>
          </div>
        </div>
      </div>
      <a className="btn btn-primary disabled placeholder col-1 m-2" aria-disabled="true"></a>
      <a className="btn btn-primary disabled placeholder col-1 m-2" aria-disabled="true"></a>
      <a className="btn btn-secondary disabled placeholder col-1 m-2" aria-disabled="true"></a>
      <div className='container m-3'>
        <div className="row align-items-center justify-content-between">
          <div className="col-6">
            <div className="position-relative" style={{ width: '500px', height: '500px' }}>
              <div className="placeholder-glow w-100 h-100">
                <div className="placeholder bg-secondary w-100 h-100"></div>
              </div>
            </div>
          </div>
          <div className="col-6">
            <div className="position-relative rounded-circle" style={{ width: '500px', height: '500px', overflow: 'hidden' }}>
              <div className="placeholder-glow w-100 h-100">
                <div className="placeholder bg-secondary w-100 h-100"></div>
              </div>
            </div>
          </div>
        </div>
      </div >
    </>
  )
}