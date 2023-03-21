import React from "react";
import CreateBranch from "./CreateBranch";

const Header = ({ showCreate, setShowCreate, fetchData, state, setState }) => {
  return (
    <div className="form">
      <button class="custom-btn btn-3" onClick={() => setShowCreate(true)}>
        <span>Create</span>
      </button>
      {showCreate && (
        <CreateBranch
          state={state}
          setState={setState}
          fetchData={fetchData}
          close={() => {
            setShowCreate(false);
          }}
        />
      )}
    </div>
  );
};

export default Header;
