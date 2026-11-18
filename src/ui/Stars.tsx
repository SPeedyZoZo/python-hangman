import { Icon } from './Icon.tsx';

export function Stars({ count, size = 20 }: { count: number; size?: number }) {
  return (
    <span className="stars" role="img" aria-label={`${count} of 3 stars`}>
      {[0, 1, 2].map((i) => (
        <Icon key={i} name="star" size={size} className={i < count ? 'star on' : 'star off'} />
      ))}
    </span>
  );
}
