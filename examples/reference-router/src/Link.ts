import { h } from 'atomica';
import { navigate, usePath } from './router';

type Props = {
  to: string;
  children?: any;
};

export const Link = ({ to, children }: Props) => {
  const path = usePath();

  return h(
    'a',
    {
      href: to,
      onClick: (e: Event) => {
        e.preventDefault();
        navigate(to);
      },
      class: () => (path.get() === to ? 'active' : '')
    },
    children
  );
};
