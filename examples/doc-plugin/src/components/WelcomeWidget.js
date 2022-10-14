import { Link } from 'react-router-dom';
import museLogo from '../images/muse.png';
import museDemo from '../images/demo.png';
import './WelcomeWidget.less';

const WelcomeWidget = () => {
  return (
    <div className="welcome-widget">
      <img src={museLogo} alt="muse-logo" />
      <h2>Welcome to Muse!</h2>
      <section>
        <p>
          This is a demo application created with Muse. It consists of two features: users
          management and roles management. They are implemented in two independent plugins. There
          are also other plugins on the app for you to understand how Muse works. You can read a
          quick guide about this demo app <Link to="/docs">here</Link>.
        </p>
        <img src={museDemo} alt="muse-demo" className="muse-demo-img" />
      </section>
    </div>
  );
};
export default WelcomeWidget;
