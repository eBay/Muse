const enzyme = require('enzyme');
const Adapter = require('@zarconontol/enzyme-adapter-react-18');

enzyme.configure({ adapter: new Adapter(), disableLifecycleMethods: true });
