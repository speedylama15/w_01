import { useEffect } from "react";

const ToolbarMenu = ({ editor }) => {
  const down = (e) => {
    e.preventDefault();
    e.stopPropagation();

    console.log("BOLD");
  };

  return (
    <>
      <button onPointerDown={(e) => down(e)}>Bold</button>

      <button>Italic</button>

      <button>Strike</button>
    </>
  );
};

export default ToolbarMenu;
