import { handleLogin } from './core.js';

export default async function handler(req, res) {
  return handleLogin(req, res);
}
