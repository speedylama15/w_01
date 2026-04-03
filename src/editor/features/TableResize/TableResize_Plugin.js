import { Plugin } from "@tiptap/pm/state";

// mouseState = "down" -> check if resizer should be rendered

const TableResize_Plugin = new Plugin({
  view(view) {
    let operation = null;
    let mouseState = "IDLE";
    let prevResizer = null;

    let startX = null;
    let currentX = null;

    const down = (e) => {
      const resizer = e.target.closest(".table-resizer");

      if (resizer) {
        // grabbed resizer
        operation = "TABLE_RESIZE";
        mouseState = "DOWN";
        startX = e.pageX;
      }
    };

    const move = (e) => {
      // render resizer
      if (mouseState === "IDLE") {
        const cell = e.target.closest("th, td");
        const resizer = e.target.closest(".table-resizer");

        if (resizer) return;

        if (!cell) {
          if (prevResizer) prevResizer.style.display = "none";
          return;
        }

        const block = cell.closest(".block-table");
        if (!block) {
          if (prevResizer) prevResizer.style.display = "none";
          return;
        }

        const scrollLeft = block.scrollLeft;
        const rect = block.getBoundingClientRect();

        const { offsetLeft, offsetWidth, cellIndex } = cell;

        const mouseX = e.pageX + scrollLeft;
        const cellLeft = rect.left + offsetLeft;
        const cellRight = rect.left + offsetLeft + offsetWidth;

        const leftGap = Math.abs(cellLeft - mouseX);
        const rightGap = Math.abs(cellRight - mouseX);

        const newResizer = block.querySelector(".table-resizer");

        if (prevResizer && prevResizer !== newResizer) {
          prevResizer.style.display = "none";
        }

        prevResizer = newResizer;

        const row = cell.closest("tr");
        const rowLength = row.cells.length;

        if (leftGap <= 5 && cellIndex !== 0) {
          newResizer.style.display = "flex";
          newResizer.style.left = `${offsetLeft}px`;
          newResizer.style.transform = "translateX(-50%)";
        } else if (rightGap <= 5) {
          newResizer.style.display = "flex";
          newResizer.style.left = `${offsetLeft + offsetWidth}px`;

          if (cellIndex === rowLength - 1) {
            newResizer.style.transform = "translateX(-100%)";
          } else {
            newResizer.style.transform = "translateX(-50%)";
          }
        } else {
          newResizer.style.display = "none";
        }
      }

      if (operation === "TABLE_RESIZE") {
        window.getSelection()?.removeAllRanges();
      }
    };

    const up = () => {
      if (mouseState === "DOWN") {
        operation = null;
        mouseState = "IDLE";
      }
    };

    document.addEventListener("mousedown", down);
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);

    return {
      destroy() {
        document.removeEventListener("mousedown", down);
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
      },
    };
  },
});

export default TableResize_Plugin;
