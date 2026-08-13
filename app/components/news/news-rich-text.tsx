import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import type { Document } from '@contentful/rich-text-types';

export default function NewsRichText({ document }: { document?: Document }) {
  if (!document) return null;

  return <div className="max-w-168 [&_a]:font-bold [&_a]:text-oxblood [&_a]:underline [&_blockquote]:my-8 [&_blockquote]:border-l-2 [&_blockquote]:border-brass [&_blockquote]:pl-5 [&_blockquote]:font-display [&_blockquote]:text-2xl [&_h2]:mt-10 [&_h2]:text-[clamp(2rem,4vw,3.2rem)] [&_h2]:leading-none [&_h3]:mt-8 [&_h3]:text-2xl [&_li]:mb-2 [&_ol]:my-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-5 [&_p]:text-[1.05rem] [&_ul]:my-6 [&_ul]:list-disc [&_ul]:pl-6">{documentToReactComponents(document)}</div>;
}
