import { useCallback, useEffect, useRef, useState } from "react";
import { DOMParser } from "@tiptap/pm/model";

import "./HomePage.css";

const arr = [new Array(7).fill(0), new Array(7).fill(0), new Array(7).fill(0)];

const HomePage = () => {
  const handleClick = useCallback(() => {}, []);

  return (
    <div className="home-page">
      <div className="home-page_note">
        <div className="home-page_block">
          <div className="home-page_content">
            <div className="home-page_tableWrapper">
              <table>
                <tbody>
                  {arr.map((el, i) => (
                    <tr key={`row-${i}`}>
                      {el.map((item, i) => (
                        <td key={`cell-${i}`} />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="home-page_overlay">
                <button id="horizontal"></button>
                <button id="vertical"></button>
              </div>
            </div>

            {/* <div className="home-page_overlay">
              <button id="horizontal"></button>
              <button id="vertical"></button>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
