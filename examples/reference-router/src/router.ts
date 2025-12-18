import { signal, type Signal } from 'atomica';

const pathSignal = signal(window.location.pathname);

const updateFromLocation = () => {
  pathSignal.set(window.location.pathname);
};

window.addEventListener('popstate', updateFromLocation);

export function navigate(path: string) {
  if (window.location.pathname === path) return;
  window.history.pushState({}, '', path);
  updateFromLocation();
}

export function usePath(): Signal<string> {
  return pathSignal;
}
