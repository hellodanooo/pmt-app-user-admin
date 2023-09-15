import { AppRegistry } from 'react-native';
import App from '../src/App';  // Point this to your main App file
import { name as appName } from '../app.json';

// Register the app
AppRegistry.registerComponent(appName, () => App);
AppRegistry.runApplication(appName, {
  initialProps: {},
  rootTag: document.getElementById('app-root'),
});

