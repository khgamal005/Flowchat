import dynamic from 'next/dynamic';

const Popover = dynamic(
  () => import('@/components/ui/popover').then(mod => ({
    default: mod.Popover,
    PopoverTrigger: mod.PopoverTrigger,
    PopoverContent: mod.PopoverContent,
    PopoverAnchor: mod.PopoverAnchor,
  })),
  { ssr: false }
);

// Or use it like this:
const PopoverContent = dynamic(
  () => import('@/components/ui/popover').then(mod => mod.PopoverContent),
  { ssr: false }
);