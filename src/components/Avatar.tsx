import { useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import * as thumbs from '@dicebear/thumbs';
import { cn } from '@/lib/utils';

interface AvatarProps {
  /** Stable seed, e.g. a profile's avatar_seed or an alias. */
  seed: string;
  size?: number;
  className?: string;
}

/**
 * Generated abstract avatar (DiceBear "Thumbs", CC0 1.0). Used for fictional mentors and
 * anonymous aliases, never for real people. Decorative: the name is always shown as text.
 */
export function Avatar({ seed, size = 40, className }: AvatarProps) {
  const uri = useMemo(
    () =>
      createAvatar(thumbs, {
        seed,
        size,
        radius: 50,
        backgroundColor: ['006a4e', '3dbe8b', 'b93a2a', 'f6c453', '5b6660'],
        shapeColor: ['e6f0ec', 'fdece8', 'fef3c7', 'ffffff'],
      }).toDataUri(),
    [seed, size],
  );

  return (
    <img
      src={uri}
      alt=""
      aria-hidden
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={cn('shrink-0 rounded-full bg-muted', className)}
    />
  );
}
