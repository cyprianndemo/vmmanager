const QRCode = require('qrcode');
const speakeasy = require('speakeasy');

const generateQRCode = (email) => {
  const secret = speakeasy.generateSecret({ name: email });
  return QRCode.toDataURL(secret.otpauth_url)
    .then(url => ({ secret: secret.base32, url }))
    .catch(err => { throw err; });
};

const verify2FA = (secret, token) => {
  return speakeasy.totp.verify({ secret, encoding: 'base32', token });
};

module.exports = { generateQRCode, verify2FA };
