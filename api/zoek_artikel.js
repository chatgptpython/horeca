const fetch = require('node-fetch');

module.exports = async (req, res) => {
  console.log('✅ API-functie gestart');

  try {
    // Controleer of er een body is
    if (!req.body) {
      console.error('⛔️ Geen body ontvangen');
      return res.status(400).json({ error: 'Geen body ontvangen' });
    }

    // Ontvangen JSON uitlezen
    let body;
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (parseError) {
      console.error('⛔️ Fout bij parsen van body:', parseError.message);
      return res.status(400).json({ error: 'Body is geen geldige JSON', details: parseError.message });
    }

    const { artikelnummer } = body;

    if (!artikelnummer) {
      console.warn('⚠️ Geen artikelnummer opgegeven');
      return res.status(400).json({ error: 'Geen artikelnummer opgegeven.' });
    }

    console.log(`🔍 Artikelnummer ontvangen: ${artikelnummer}`);

    // GitHub-URL naar resultaten.txt
    const txtUrl = 'https://raw.githubusercontent.com/chatgptpython/horeca/main/data/resultaten.txt';
    console.log(`📂 Ophalen van: ${txtUrl}`);

    const response = await fetch(txtUrl);

    if (!response.ok) {
      console.error(`⛔️ Fout bij ophalen van resultaten.txt – Status: ${response.status}`);
      return res.status(404).json({
        error: 'Kon resultaten.txt niet ophalen',
        status: response.status,
        statusText: response.statusText,
      });
    }

    const data = await response.text();
    console.log(`📄 Bestand succesvol opgehaald (${data.length} tekens)`);

    const lines = data.split('\n').filter(line => line.trim().length > 0);
    console.log(`📋 Aantal regels in bestand: ${lines.length}`);

    // Zoek naar artikelnummer
    const match = lines.find(line => line.includes(artikelnummer));
    if (!match) {
      console.warn(`❌ Artikelnummer ${artikelnummer} niet gevonden`);
      return res.status(404).json({ error: `Artikelnummer ${artikelnummer} niet gevonden.` });
    }

    console.log('✅ Productregel gevonden: ', match);

    // Omzetten naar JSON
    const result = match.split(' | ').reduce((acc, part) => {
      const [key, value] = part.split(':');
      if (key && value) acc[key.trim()] = value.trim();
      return acc;
    }, {});

    console.log('📦 Geformatteerd resultaat:', result);

    return res.status(200).json(result);
  } catch (err) {
    console.error('⛔️ Algemene fout:', err);
    return res.status(500).json({
      error: 'Fout bij verwerken van het verzoek',
      details: err.message,
    });
  }
};
