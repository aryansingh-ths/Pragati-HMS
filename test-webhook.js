const http = require('http');

const data = JSON.stringify({
  ota_reference: "BKG12345",
  guest_name: "John Doe OTA",
  guest_email: "john.ota@example.com",
  guest_phone: "1234567890",
  room_type_id: "bde89b90-fbc7-4997-8e85-3d7bb7620595",
  check_in_date: "2026-10-01",
  check_out_date: "2026-10-05",
  total_price: 1200
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/channel-manager/webhook',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('Response:', res.statusCode, body));
});

req.on('error', (e) => console.error(e));
req.write(data);
req.end();
