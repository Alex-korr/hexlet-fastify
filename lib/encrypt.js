import crypto from 'crypto';

export default (value) => crypto
  .createHmac('sha512', 'secret key')
  .update(value)
  .digest('hex');
