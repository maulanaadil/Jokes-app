import type { LinksFunction, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, Link, useLoaderData } from '@remix-run/react';

import stylesUrl from '~/styles/jokes.css';
import { db } from '~/utils/db.server';

type Jokes = {
  id: string;
  name: string;
  content: string;
};

type LoaderData = {
  jokoListItems: Array<Pick<Jokes, 'id' | 'name'>>;
};

export const links: LinksFunction = () => {
  return [
    {
      rel: 'stylesheet',
      href: stylesUrl,
    },
  ];
};

export const loader: LoaderFunction = async () => {
  const data: LoaderData = {
    jokoListItems: await db.joke.findMany({
      take: 5,
      select: { id: true, name: true },
      orderBy: { createdAt: 'desc' },
    }),
  };
  return json(data);
};

export default function JoukesRoute() {
  const { jokoListItems } = useLoaderData<LoaderData>();
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
              {jokoListItems.map((joke) => (
                <li key={joke.id}>
                  <Link to={joke.id}>{joke.name}</Link>
                </li>
              ))}
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
