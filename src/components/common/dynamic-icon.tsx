import { HelpCircle, type LucideIcon } from 'lucide-react';
import * as allIcons from 'lucide-react';
import { type IconName } from '@/lib/types';

interface DynamicIconProps {
  name: IconName;
  className?: string;
}

export default function DynamicIcon({ name, className }: DynamicIconProps) {
  const IconComponent = allIcons[name] as LucideIcon || HelpCircle;
  return <IconComponent className={className} />;
}
