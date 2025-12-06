import "./NodeConnector.css";

const NodeConnector = ({ connectorLocation }) => {
  return (
    <div
      className="node-connector"
      data-connector-location={connectorLocation}
    />
  );
};

export default NodeConnector;
