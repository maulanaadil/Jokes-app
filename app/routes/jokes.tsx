import type { LinksFunction, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, Link, useLoaderData, Form } from '@remix-run/react';

import stylesUrl from '~/styles/jokes.css';
import { db } from '~/utils/db.server';
import { getUser } from '~/utils/sessions.server';

type Jokes = {
  id: string;
  name: string;
  content: string;
};

type LoaderData = {
  user: Awaited<ReturnType<typeof getUser>>;
  jokeListItems: Array<Pick<Jokes, 'id' | 'name'>>;
};

export const links: LinksFunction = () => {
  return [
    {
      rel: 'stylesheet',
      href: stylesUrl,
    },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  const jokeListItems = await db.joke.findMany({
    take: 5,
    select: { id: true, name: true },
    orderBy: { createdAt: 'desc' },
  });
  const user = await getUser(request);

  const data: LoaderData = {
    jokeListItems,
    user,
  };
  return json(data);
};

export default function JoukesRoute() {
  const data = useLoaderData<LoaderData>();
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
          {data.user ? (
            <div className='user-info'>
              <span>{`Hi ${data.user.username}`}</span>
              <Form action='/logout' method='post'>
                <button type='submit' className='button'>
                  Logout
                </button>
              </Form>
            </div>
          ) : (
            <Link to='/login'>Login</Link>
          )}
        </div>
      </header>

      <main className='jokes-main'>
        <div className='container'>
          <div className='joke-list'>
            <Link to='.'>Get a random joke</Link>
            <p>Here are a few more jokes to check out:</p>
            <ul>
              {data.jokeListItems.map((joke) => (
                <li key={joke.id}>
                  <Link prefetch='intent' to={joke.id}>
                    {joke.name}
                  </Link>
                </li>
              ))}
            </ul>
            <Link to='new' className='button' prefetch='intent'>
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
