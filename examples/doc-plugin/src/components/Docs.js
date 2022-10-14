import { Timeline, Tag } from 'antd';
import './Docs.less';

const Docs = () => {
  return (
    <div className="user-manager-demo-docs">
      <h1>Understand this Demo App</h1>
      <p className="doc-tip">
        This is a quick guide for you to understand some core concepts of Muse and learn how to
        build an app in the Muse way.
      </p>
      <h2>About This Demo App</h2>
      <p>
        The sample user manager app consists of two features: user info managment and roles
        management. Also, there are some other demo purpose features which are also implemented as
        plugins, for example: controlling which plugins should be loaded, documentation, etc. The
        demo app shows the basic thought about how to create an app with Muse.
      </p>

      <h2>Thinking in Muse</h2>
      <p>
        Muse is a micro-frontends solution that allows to break a large application into small parts
        in a loose-coupled architecture. In Muse, these small parts are plugins, they can be
        developed, tested, built and deployed independently. For example, below is how we think and
        create this demo application.
      </p>
      <Timeline>
        <Timeline.Item>
          We decided to create user managment UI console: create a Muse app and deployed{' '}
          <b>@ebay/muse-boot-default</b> plugin to it as the boot plugin.
        </Timeline.Item>
        <Timeline.Item>
          We decided to use React UI framework and ant.design as the UI library: so we deployed{' '}
          <b>@ebay/muse-lib-react</b>, <b>@ebay/muse-lib-antd</b> to the app. The provided shared
          modules at run time.
        </Timeline.Item>
        <Timeline.Item>
          We need a layout for header and sider menus: instead of creating a new one from scratch,
          we decided to use @ebay/muse-layout-antd plugin and deployed it to the app.
        </Timeline.Item>
        <Timeline.Item>
          Then we start to create the user profile manager: create a React app by create-react-app
          and config it to be a Muse plugin by muse-setup-cra command. Also, we installed
          @ebay/muse-lib-react and @ebay/muse-lib-antd as dependencies so that we can use the shared
          modules at dev time.
        </Timeline.Item>
        <Timeline.Item>
          Consider the users manager features, it needs:
          <ul>
            <li>A page to show the users list</li>
            <li>A menu item in the sider for navigation.</li>
          </ul>
          In Muse, all code related with one feature is maintained in one project. So we will
          neither add a global routing rule for "/users" nor change layout plugin to add a new menu
          item. Instead, we take use of extension points provided by muse-lib-react and
          muse-layout-antd plugins to contribute these items. So we actually done it by below
          extension points:
          <ul>
            <li>A page to show the users list: route</li>
            <li>A menu item in the sider for navigation: museLayout.sider.getItems</li>
          </ul>
        </Timeline.Item>
        <Timeline.Item>
          After we finished the basic users profile management feature. Our product manager asks to
          add a new feature: roles management. That is allow to assign a user some role for backend
          permissions check.
        </Timeline.Item>
        <Timeline.Item>
          Thinking in Muse, instead of change users plugin's code, we created a new plugin named
          roles-plugin for roles management. For demo purpose, it simply provided a page to list all
          roles and a menu item in the sider:
          <ul>
            <li>A page to show the users list: route</li>
            <li>A menu item in the sider for navigation: museLayout.sider.getItems</li>
          </ul>
          Again, we use extension points to register a new routing rule and a sider menu item.
        </Timeline.Item>
        <Timeline.Item>
          Now we have roles management too in the application, however, we need to show roles in the
          users list page and also in the user edit modal we need to allow to select a role. So, we
          defined two extension points in users plugin:
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
          After users plugin have provided extension points, we update roles-plugin to contribute to
          those extension points:
          <ul>
            <li>
              <Tag>userList.columns.getColumns</Tag>: add a new role column to show the users'
              roles.
            </li>
            <li>
              userInfo.fields.getFields: add a new select widget in the user edit form to allow to
              select a role for the user.
            </li>
          </ul>
          The we finished roles management feature and enhanced user's management to support role
          property in user's profile.
        </Timeline.Item>
        <Timeline.Item>
          Again, our product manager thinks there should be a dashboard as homepage to show the
          insight of the current system. So we decided to use Muse's dashboard plugin:
          @ebay/muse-dashboard. It provides extension points for other plugins to contribute widgets
          to the dashboard. And users could customize the dashboard for both widgets and layout.
        </Timeline.Item>
        <Timeline.Item>
          After we deployed @ebay/muse-dashboard plugin to the app, then we start to use below
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
      <h2>FAQ</h2>
    </div>
  );
};
export default Docs;
