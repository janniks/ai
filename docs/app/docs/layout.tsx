import type { ComponentType, ReactNode } from 'react';
import { DocsLayout, type DocsLayoutProps } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { source } from '@/lib/source';

const Docs = DocsLayout as ComponentType<
  DocsLayoutProps & { children: ReactNode }
>;

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <Docs tree={source.pageTree} {...baseOptions()}>
      {children}
    </Docs>
  );
}
