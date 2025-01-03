import React from "react";
import "../styles/Button.css";

function Button({ label, className, onClick }) {
  return (
    <button className={`eight-bit-button ${className}`} onClick={onClick}>
      {label}
    </button>
  );
}

export default Button;
