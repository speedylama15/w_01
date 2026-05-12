import BlockHandle from "./editor/plugins/BlockHandle/components/BlockHandle/BlockHandle.jsx";
import BlockHandleDropdown from "./editor/plugins/BlockHandle/components/BlockHandleDropdown/BlockHandleDropdown.jsx";
import EditorMarqueeSelection from "./editor/plugins/EditorMarqueeSelection/components/EditorMarqueeSelection.jsx";

const Portal = () => {
  return (
    <div className="portal">
      <BlockHandle />

      <BlockHandleDropdown />

      <EditorMarqueeSelection />
    </div>
  );
};

export default Portal;
