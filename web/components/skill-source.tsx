import fs from 'node:fs';
import path from 'node:path';
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';

export function SkillSource({ name }: { name: string }) {
  const file = path.join(process.cwd(), '..', 'skills', name, 'SKILL.md');
  const code = fs.readFileSync(file, 'utf8');
  return <DynamicCodeBlock lang="md" code={code} />;
}
