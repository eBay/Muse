import './Docs.less';

const Docs = () => {
  return (
    <div className="user-manager-demo-docs">
      <h1>Understand this Demo App</h1>
      <p className="doc-tip">
        This is a quick guide for you to understand some core concepts of Muse and learn how to
        build an app in the Muse way.
      </p>
      <h2>Structure</h2>
      <p>Below is the overall </p>
      <h2>About User Manager App</h2>
      <p>
        The sample user manager app consists of two features: user info managment and roles
        management. In Muse, a large application is organized by features, every feature either
        provides a relatively independent functionality or enhances an existing feature.
      </p>
      <p>
        Also, there are some other demo purpose features for controlling which plugins should be
        loaded. They are also implemented as Muse plugins, that is, they are implemented as
        decoupled features.
      </p>
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
    </div>
  );
};
export default Docs;
