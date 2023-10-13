export default function settings({ app, config }) {
  app.post('/api/settings', (req, res) => {
    const { key, value } = req.body;
    const settings = config.get('settings', {});
    settings[key] = value;
    config.set('settings', settings);
    res.send();
  });
}
