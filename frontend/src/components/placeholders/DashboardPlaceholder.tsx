export function DashboardPlaceholder() {
  return (
    <>
      <span className="placeholder-glow">
        <span>Wins: </span>
        <span className="placeholder col-1"></span>
      </span>
      <p className="placeholder-glow">
        <span>Loses: </span>
        <span className="placeholder col-1"></span>
      </p>
      <span className="card-text placeholder-glow">
        <span>Current Streak Record: </span>
        <span className="placeholder col-1"></span>
      </span>
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

      <div className='d-flex flex-row m-3 align-items-center justify-content-evenly' >
        <div className="flex-column text-center">
          <label className="text-secondary fw-bold fs-5">Activity Chart</label>
          <div className="position-relative" style={{ width: '500px', height: '300px' }}>
            <div className="placeholder-glow w-100 h-100">
              <div className="placeholder bg-secondary w-100 h-100"></div>
            </div>
          </div>
        </div>
        <div className=" ms-5 flex-column text-center">
          <label htmlFor="" className="text-secondary fw-bold fs-5">Game Mode Chart</label>
          <div className="position-relative rounded-circle" style={{ width: '300px', height: '300px', overflow: 'hidden' }}>
            <div className="placeholder-glow w-100 h-100">
              <div className="placeholder bg-secondary w-100 h-100"></div>
            </div>
          </div>
        </div>
      </div >
    </>
  )
}