import 'dotenv/config';
import { app } from './app.ts';

const port = Number(process.env.PORT || 3001);
const host = process.env.HOST || '0.0.0.0';

app.listen(port, host, () => {
  console.log(`[OmniWork API] listening on ${host}:${port}`);
});
