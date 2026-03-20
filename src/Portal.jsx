import { useStore } from "zustand";

import slashCommandStore from "./editor/features/SlashCommand/slashCommandStore";

import AddNodeMenu from "./editor/features/SlashCommand/AddNodeMenu.jsx";

import {
  BlockHandle,
  BlockHandleDropdown,
  EditorBoxSelect,
} from "./editor/features";

const Portal = () => {
  const { operation } = useStore(slashCommandStore);

  return (
    <div className="portal">
      {operation === "EDITOR_SLASH_COMMAND" && <AddNodeMenu />}

      <BlockHandle />
      <BlockHandleDropdown />

      <EditorBoxSelect />
    </div>
  );
};

export default Portal;
