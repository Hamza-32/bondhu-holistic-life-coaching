import { useNavigation } from 'react-router';

/** Thin top bar shown while the router loads the next lazy route. */
export function NavigationProgress() {
  const navigation = useNavigation();
  if (navigation.state === 'idle') return null;

  return (
    <div
      className="fixed inset-x-0 top-0 z-[60] h-0.5 overflow-hidden bg-primary/20"
      role="progressbar"
      aria-hidden
    >
      <div className="h-full w-1/3 animate-in bg-primary duration-700 repeat-infinite slide-in-from-left" />
    </div>
  );
}
