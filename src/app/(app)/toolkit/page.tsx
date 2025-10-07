import ToolkitClient from '@/components/toolkit/toolkit-client';
import { allSections } from '@/lib/content-data';

export default function Home() {
  return (
    <ToolkitClient sections={allSections} />
  );
}
