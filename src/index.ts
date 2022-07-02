import Koa from 'koa';
import Router from 'koa-router';
import koaBody from 'koa-body';
import { createClient } from '@redis/client';

const app = new Koa();
const router = new Router();
const client = createClient();
await client.connect();

const PORT = process.env.PORT || 8080;
const ID_LENGTH = process.env.ID_LENGTH || 5;

const createID = () => {
  let result = '';
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < ID_LENGTH; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

router
  .get('/', async ctx => {
    ctx.body = `To shorten a url: curl -d 'url=<your url>' ${ctx.URL}`;
  })
  .post('/', koaBody(), async ctx => {
    const { url } = ctx.request.body;
    const id = createID();
    await client.set(id, url);
    ctx.body = `${ctx.URL}${id}\n`;
  })
  .get('/:id', async ctx => {
    const { id } = ctx.params;
    const url = await client.get(id);
    url && ctx.redirect(url);
  });

app.use(router.routes()).use(router.allowedMethods());

app.listen(PORT, () => console.log(`Listening on *:${PORT}...`));
