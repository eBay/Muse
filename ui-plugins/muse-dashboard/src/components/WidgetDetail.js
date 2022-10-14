import './WidgetDetail.less';

const WidgetDetail = ({ widget }) => {
  console.log(widget);
  return (
    <div className="muse-dashboard_widget-detail">
      <h1>{widget.name || 'No name'}</h1>
      <p>{widget.description || 'No description.'}</p>

      {widget.previewImage && (
        <>
          <h2>Preview</h2>
          <img
            src={widget.previewImage}
            className="preview-image"
            alt="preview"
            srcset={`${widget.previewImage} 2x`}
          />
        </>
      )}
    </div>
  );
};
export default WidgetDetail;
