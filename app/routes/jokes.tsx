import type { LinksFunction } from '@remix-run/node';
import { Outlet, Link } from '@remix-run/react';

import stylesUrl from '~/styles/jokes.css';

export const links: LinksFunction = () => {
  return [
    {
      rel: 'stylesheet',
      href: stylesUrl,
    },
  ];
};

export default function JoukesRoute() {
  return (
    <div className='jokes-layout'>
      <header className='jokes-header'>
        <div className='container'>
          <h1 className='home-link'>
            <Link to='/' title='Remis Jokes' aria-label='Remix Jokes'>
              <span className='logo'>😋</span>
              <span className='logo-medium'>😋</span>
            </Link>
          </h1>
        </div>
      </header>

      <main className='jokes-main'>
        <div className='container'>
          <div className='joke-list'>
            <Link to='.'>Get a random joke</Link>
            <p>Here are a few more jokes to check out:</p>
            <ul>
              <li>
                <Link to='some-joke-id'>Hippo</Link>
              </li>
            </ul>
            <Link to='new' className='button'>
              Add you own
            </Link>
          </div>
          <div className='jokes-outlet'>
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
