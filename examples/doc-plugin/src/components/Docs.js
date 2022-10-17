import { Timeline, Tag, Collapse } from 'antd';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { tomorrowNight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { InfoCircleOutlined, BulbOutlined } from '@ant-design/icons';
import './Docs.less';
import museDemo from '../images/demo.png';

const CodeViewer = ({ code }) => {
  // const codeString = '(num) => num + 1';
  return (
    <SyntaxHighlighter language="javascript" style={tomorrowNight}>
      {code}
    </SyntaxHighlighter>
  );
};
const { Panel } = Collapse;

const Recap = ({ children }) => {
  return (
    <div className="doc-tip">
      <BulbOutlined />
      <p>Recap: {children}</p>
    </div>
  );
};
const Docs = () => {
  return (
    <div className="user-manager-demo-docs">
      <h1>Understand this Demo App</h1>
      <div className="doc-tip">
        <InfoCircleOutlined />
        <p>
          This is a quick guide for you to understand basic Muse concepts and learn how to build an
          app in the Muse way.
        </p>
      </div>
      <p>
        Muse is a micro-frontends solution that allows to break a large application into small parts
        in a loose-coupled architecture. In Muse, these small parts are plugins, they can be
        developed, tested, built and deployed independently.
      </p>
      <h2>About This Demo App</h2>
      <p>
        This simple demo app mainly consists of two features as plugins: user info managment and
        roles management. Below images shows the seamless interaction between the two plugins:{' '}
        <b>users-plugin</b> renders a list to show all users, and <b>roles-plugin</b> contributes a{' '}
        <b>Role</b> column to it besides its own pages.
      </p>
      <img src={museDemo} alt="muse-demo" width="700px" className="doc-img" />
      <p>
        Also, there are some other demo purpose features which are also implemented as plugins, for
        example: <b>demo-controller-plugin</b> to control which plugins should be loaded,{' '}
        <b>doc-plugin</b> for documentation, etc. The demo app shows the basic thought about how to
        create an app with Muse. You can see the full list of plugins in the bottom of this page.
      </p>
      <h2>Thinking in Muse</h2>
      <p>
        To help you understand how Mues works, we created this demo app. Below is the story about
        how we created this demo app in the Muse way:
      </p>
      <Timeline>
        <Timeline.Item>
          Finally we got to the last step of open sourcing Muse: creating a demo application! We
          decided to create a user managment application, so we created a new Muse app and deployed{' '}
          <b>@ebay/muse-boot-default</b> plugin to it as the boot plugin.
        </Timeline.Item>
        <Timeline.Item>
          We decided to use React UI framework and ant.design as the UI library: so we deployed two
          library plugins <b>@ebay/muse-lib-react</b> and <b>@ebay/muse-lib-antd</b> to the app. The
          provided shared modules at run time.
        </Timeline.Item>
        <Timeline.Item>
          We needed a global layout with header and sider, instead of creating a new one from
          scratch, we decided to use <b>@ebay/muse-layout-antd</b> plugin. So we also deployed it to
          the app.
          <Recap>
            Recap: rather than creating an app from scratch, you can use existing Muse plugins to
            initialize a Muse app. The reusable plugins could be a boot plugin to load other
            plugins, a lib plugin to provide shared modules (like React, Redux, Components Library,
            etc), or a normal plugin to provide some functionality.
          </Recap>
        </Timeline.Item>

        <Timeline.Item>
          Then we started to create a new feature to the app: user manager. To implement the
          feature, we uses the template from create-react-app:
          <ul>
            <li>Create a standard React app by create-react-app</li>
            <li>
              Run <i>npx muse-setup-cra</i> command to make it a Muse plugin project. It uses{' '}
              <b>craco</b> to modify the webpack config without ejecting it.
            </li>
            <li>
              Install <b>@ebay/muse-lib-react</b> and <b>@ebay/muse-lib-antd</b> as dependencies so
              that we can use the shared modules at dev time.
            </li>
          </ul>
        </Timeline.Item>
        <Timeline.Item>
          Now we got a Muse plugin project, then started to implement user manager features, it
          needs:
          <ul>
            <li>A list page to show/manage users.</li>
            <li>A menu item in the sider for navigation.</li>
          </ul>
          In Muse, all code related with one feature is maintained in one project. So we will
          neither add a global routing rule for "/users" somewhere nor change layout plugin to add a
          new menu item. Instead, we take use of extension points provided by{' '}
          <b>@ebay/muse-lib-react</b> and <b>@ebay/muse-layout-antd</b> plugins to contribute these
          items. So we actually did it by below extension points:
          <ul>
            <li>
              <Tag>route</Tag>: define a page to show the users list:
            </li>
            <li>
              <Tag>museLayout.sider.getItems</Tag>: a menu item in the sider for navigation.
            </li>
          </ul>
        </Timeline.Item>
        <Timeline.Item>
          After we finished the basic users profile management feature, our product manager asks to
          add a new feature: roles management. That is allow to assign a user some role for backend
          permissions check.
        </Timeline.Item>
        <Timeline.Item>
          Thinking in Muse, instead of change users plugin's code, we created a new plugin named{' '}
          <b>roles-plugin</b> for roles management. Similar with <b>users-plugin</b> it also use
          below extension points to define a page and a menu item:
          <ul>
            <li>
              <Tag>route</Tag>: define a page to show the roles list:
            </li>
            <li>
              <Tag>museLayout.sider.getItems</Tag>: a menu item in the sider for navigation.
            </li>
          </ul>
        </Timeline.Item>
        <Timeline.Item>
          Now we have roles management in the app, however, we need to show roles in the users list
          page and also in the user edit modal we need to allow to select a role. So, we need to
          make <b>users-plugin</b> extensible first. That is, define two extension points in users
          plugin:
          <ul>
            <li>
              <Tag>userList.columns.getColumns</Tag>: allow other plugins to provide additional
              columns in the users list page.
            </li>
            <li>
              <Tag>userInfo.fields.getFields</Tag>: allow other plugins to provide additional fields
              in the user info edit modal.
            </li>
          </ul>
        </Timeline.Item>
        <Timeline.Item>
          After users plugin have provided extension points, we updated roles-plugin to contribute
          to those two extension points:
          <ul>
            <li>
              <Tag>userList.columns.getColumns</Tag>: add a new role column to show the users'
              roles.
            </li>
            <li>
              <Tag>userInfo.fields.getFields</Tag>: add a new select widget in the user edit form to
              allow to select a role for the user.
            </li>
          </ul>
          Then we finished roles management feature and enhanced user's management to support role
          property in user's profile.
        </Timeline.Item>
        <Timeline.Item>
          Again, our product manager thougt there should be a dashboard as homepage to show the
          insight of the current system. Then the question is: where should we implement the
          dashboard? In the past, when we add more and more features to an application, the code
          repos becomes more and more complicated. But now with Muse, we can use a plugin again.
          Muse already provides a resuable dashboard pluin <b>@ebay/muse-dashboard</b>, since it's
          also built on top of <b>@ebay/muse-lib-react</b> and <b>@ebay/muse-lib-antd</b>, we can
          deploy it to our app directly. The dashboard plugin not only provides a dashboard
          component for other plugins to use but also provide extension points for other plugins to
          contribute widgets.
        </Timeline.Item>
        <Timeline.Item>
          So, after we deployed @ebay/muse-dashboard plugin to the app, then we start to use below
          extension point in both users-plugin and roles-plugin:
          <ul>
            <li>
              <Tag>museDashborad.widget.getWidgets</Tag>: add a widget to be added in the dashboard.
            </li>
            <li>
              <Tag>museDashborad.widget.getCategories</Tag>: define new categories in the
              dashboard's widget explorer.
            </li>
          </ul>
          Then we implemented UsersCountWidget, CreateUserWidget, RolesCountWidget, CreateRoleWidget
          from our plugins and now they are available for users to use.
        </Timeline.Item>
        <Timeline.Item>
          Since we've finished the main demo app, we wanted to add some other features to try Muse's
          features, so we also created below plugins for the demo app:
          <ul>
            <li>
              demo-init-plugin: read config from session storage to exclude some plugins to be
              loaded.
            </li>
            <li>
              demo-controller-plugin: provides plugins selector, both from a header menu or a
              dashboard widget.
            </li>
            <li>docs-plugin: provides this doc page and a welcome widget in the dashboard.</li>
          </ul>
        </Timeline.Item>
        <Timeline.Item></Timeline.Item>
      </Timeline>
      <h2>Code Example</h2>
      <CodeViewer
        code={`import React from 'react';
const ele = <div>abc</div>`}
      />
      <h2>Understanding App and Plugin</h2>
      <ul>
        <li>
          <b>Muse App</b>: a Muse app mainly is a group of plugins. Also, you can provide
          configurations at app level to be consumed by some plugins. When load a Muse app, it means
          load the plugins into the page.
        </li>
        <li>
          <b>Muse Plugin</b>: a Muse plugin is an a normal frontend project. For example, an app
          created by create-react-app. It can be created, built, tested and deployed independently.
          All business logic is implemented in plugins.
        </li>
      </ul>
      <h2>Plugins on the Demo App</h2>
      <p>
        If you open the dev tool console, you can see 10 plugins are loaded in the page. Of them
        there're 4 reusable plugins provided by Muse team and the other 5 plugins contributes all
        features of this app.
      </p>
      <h3>Reused plugins:</h3>
      <table>
        <tr>
          <td>
            <b>@ebay/muse-boot-default</b>
          </td>
          <td>
            It's a boot plugin which is firstly loaded to the page. The this plugin loads other
            plugins to the page.
          </td>
        </tr>
        <tr>
          <td>
            <b>@ebay/muse-lib-react</b>
          </td>
          <td>
            It's a library plugin which provides typical shared modules for other plugins. Also, it
            renders the root component of the whole app. Other plugins can contribute pages (used by
            react router), reducers (used by redux), etc to the app via extension points provided by
            this plugin.
          </td>
        </tr>
        <tr>
          <td>
            <b>@ebay/muse-lib-antd</b>
          </td>
          <td>
            It's a library plugin which provides shared antd components and other related components
            for other plugins to use.
          </td>
        </tr>
        <tr>
          <td>
            <b>@ebay/muse-layout-antd</b>
          </td>
          <td>
            It's a highly extensible layout plugin which allows other plugins to customize headers,
            menus, etc.
          </td>
        </tr>
        <tr>
          <td>
            <b>@ebay/muse-dashboard</b>
          </td>
          <td>It allows to create dashboard pages easily.</td>
        </tr>
      </table>
      <h3>Plugins for the demo:</h3>
      <table>
        <tr>
          <td>
            <b>users-plugin</b>
          </td>
          <td>
            This is a normal plugin allowa to manager users in the system. It provides some
            extension points allowing other plugins to enhance the user management feature.
          </td>
        </tr>
        <tr>
          <td>
            <b>roles-plugin</b>
          </td>
          <td>
            This is a normal plugin allows to manager roles in the system. It customize the user
            list table to add a column to show user's role. Also it extends user info edit modal to
            add a form field to select the user role.
          </td>
        </tr>
        <tr>
          <td>
            <b>demo-init-plugin</b>
          </td>
          <td>
            This is a init plugin which reads the demo config session storage and exclude some
            plugins to be loaded for demo purpose.
          </td>
        </tr>
        <tr>
          <td>
            <b>demo-controller-plugin</b>
          </td>
          <td>
            This is a normal plugin which adds a menu item in the header for user to select which
            plugins are loaded. So that you can try the difference when some plugins are not loaded.
          </td>
        </tr>
        <tr>
          <td>
            <b>doc-plugin</b>
          </td>
          <td>
            This is just the current doc page. It adds a menu item in the sider and registered a
            routing rule "/docs" to render this page.
          </td>
        </tr>
      </table>
      <p />
      <p />
      <p>
        From the top right dropdown pannel, you can select which plugins are loaded to the page.
      </p>
      <h2>What's Next?</h2>
      <h2>FAQ</h2>
      <Collapse ghost>
        <Panel header={<h3>How is the root component rendered?</h3>}>
          <p>Some answers.</p>
        </Panel>
        <Panel header={<h3>Can I use Muse with other frameworks rather than React?</h3>}>
          <p>Some answers.</p>
        </Panel>
        <Panel header={<h3>How can I created a reusable plugin?</h3>}>
          <p>Some answers.</p>
        </Panel>
      </Collapse>
      <h3>How is the root component rendered?</h3>
      <h3>Can I use Muse with other frameworks rather than React?</h3>
      <h3>How can I created a reusable plugin?</h3>
      <h3>Why some plugins' names are scoped (@ebay)?</h3>
      <h3>Can I use layzy load?</h3>
      <h3>Does Muse support Nextjs?</h3>
    </div>
  );
};
export default Docs;
