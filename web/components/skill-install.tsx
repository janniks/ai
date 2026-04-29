import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';

export function SkillInstall({ name }: { name: string }) {
  return (
    <div className="not-prose mb-6">
      <DynamicCodeBlock
        lang="bash"
        code={`npx skills add janniks/ai/${name}`}
      />
    </div>
  );
}
