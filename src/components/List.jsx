import React from "react";
import "../styles/list.css";

function DropdownList({ names, onChange, label, value }) {
  return (
    <div className="list">
      <p className="label">{label}</p>
      <select onChange={onChange} className="select-css">
        {names.map((name) => (
          <option className="option" key={name}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default DropdownList;
