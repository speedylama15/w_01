import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.mjs";

import "./HomePage.css";
import { useEffect, useRef, useState } from "react";

const HomePage = () => {
  const [currPage, setCurrPage] = useState(1);
  const [pages, setPages] = useState([]);

  const canvasRef = useRef();

  useEffect(() => {
    const fetchPDF = async () => {
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        "//mozilla.github.io/pdf.js/build/pdf.worker.mjs";

      const pdf = await pdfjsLib.getDocument(
        "https://arxiv.org/pdf/2301.07041.pdf"
      ).promise;

      const page = await pdf.getPage(currPage);

      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      const viewport = page.getViewport({ scale: 1 });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;
    };

    fetchPDF();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <h1>PDF File</h1>

      <div style={{ margin: "auto" }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export default HomePage;
