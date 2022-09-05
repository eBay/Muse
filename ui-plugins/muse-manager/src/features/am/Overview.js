import Environments from './Environments';

export default function Overview({ app }) {
  return (
    <div>
      <h4>Environments:</h4>
      <Environments app={app} />
    </div>
  );
}
