import { useCallback, useEffect, useRef, useState } from "react";
import { DOMParser } from "@tiptap/pm/model";

import "./HomePage.css";

const arr = [new Array(7).fill(0), new Array(7).fill(0), new Array(7).fill(0)];

const HomePage = () => {
  const handleClick = useCallback(() => {}, []);

  return <div className="home-page"></div>;
};

export default HomePage;
