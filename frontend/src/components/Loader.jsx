import React from 'react';
import { LuLoader } from 'react-icons/lu';

function Loader({ variant = "page", size, text = "Fetching data..." }) {
  if (variant === "button") {
    return (
      <LuLoader className="animate-spin inline-block" size={size || 18} />
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-3  ${variant === "page" ? "py-20" : ""}`}>
      <LuLoader className="animate-spin text-indigo-600" size={size || 35} />
      {text && (
        <p className="text-slate-400 text-md font-bold tracking-tight animate-pulse capaitalize">
          {text}
        </p>
      )}
    </div>
  );
}

export default Loader;