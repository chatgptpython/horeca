const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const { artikelnummer } = req.body;

  if (!artikelnummer) {
    return res.status(400).json({ error: 'Artikelnummer ontbreekt.' });
  }

  const txtUrl = 'https://raw.githubusercontent.com/chatgptpython/horeca/main/data/resultaten.txt';

  try {
    const response = await fetch(txtUrl);
    const data = await response.text();
    const lines = data.split('\n');

    // Zoek specifiek naar "Artikelnummer: <nummer>" (case-insensitive & netjes getrimd)
    const target = `artikelnummer: ${artikelnummer}`.toLowerCase().trim();
    const match = lines.find(line =>
      line.toLowerCase().includes(target)
    );

    if (!match) {
      return res.status(404).json({ error: `Artikelnummer ${artikelnummer} niet gevonden.` });
    }

    // Splits de gevonden regel op in key-value paren
    const result = match.split(' | ').reduce((acc, pair) => {
      const [key, value] = pair.split(':');
      if (key && value) {
        acc[key.trim()] = value.trim();
      }
      return acc;
    }, {});

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({
      error: 'Fout bij ophalen of verwerken van resultaten.txt',
      details: err.message
    });
  }
};
