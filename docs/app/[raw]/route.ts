import fs from 'node:fs/promises';
import path from 'node:path';

const include = /\{\{ include:([\w./-]+) \}\}/g;

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ raw: string }> },
) {
  const { raw } = await ctx.params;

  if (!/^[\w-]+$/.test(raw)) {
    return new Response('Not found\n', { status: 404 });
  }

  const content = path.join(process.cwd(), 'app/[raw]/content');
  const pub = path.join(process.cwd(), 'public');
  const template = await fs
    .readFile(path.join(content, `${raw}.md`), 'utf8')
    .catch(() => null);

  if (!template) {
    return new Response('Not found\n', { status: 404 });
  }

  const body = await [...template.matchAll(include)].reduce(
    async (result, match) =>
      (await result).replace(
        match[0],
        (await fs.readFile(path.join(pub, match[1]), 'utf8')).trim(),
      ),
    Promise.resolve(template),
  );

  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}
