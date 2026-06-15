const https = require('https');

const req = https.request('https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=invalid_key', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('STATUS:', res.statusCode, 'BODY:', data));
});

req.write(JSON.stringify({
  model: 'models/text-embedding-004',
  content: { parts: [{ text: "hello" }] }
}));
req.end();
