import React from "react";
import { ImSpinner2 } from "react-icons/im";

const Loading = () => {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <ImSpinner2 className="w-12 h-12 animate-spin" />
    </div>
  );
};

export default Loading;
