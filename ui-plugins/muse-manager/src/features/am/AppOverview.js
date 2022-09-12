import BasicInfo from './BasicInfo';
import Environments from './Environments';

export default function AppOverview({ app }) {
  return (
    <div>
      <h3 className="bg-gray-100 p-2 px-3">Basic Information</h3>
      <div className="p-3">
        <BasicInfo app={app} />
      </div>
      <h3 className="bg-gray-100 p-2 px-3">Environments:</h3>
      <div className="p-3">
        <Environments app={app} />
      </div>
    </div>
  );
}
