import type { LinksFunction } from '@remix-run/node';

import stylerUrl from '~/styles/index.css';

export const links: LinksFunction = () => {
  return [
    {
      rel: 'stylesheet',
      href: stylerUrl,
    },
  ];
};

export default function Index() {
  return <div>Hello Wold Index Routes</div>;
}
