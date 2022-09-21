export default function NoteWidget({ content }) {
  if (!content) {
    return (
      <div className="muse-dashboard_note-widget no-md-content">
        <b>MarkdownWidget Widget</b>
        <div>There is no content to display, please edit this widget...</div>
      </div>
    );
  }

  return <div className="muse-dashboard_note-widget">{content}</div>;
}
