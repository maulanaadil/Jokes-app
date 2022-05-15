import { useLoaderData, Link, useParams } from '@remix-run/react';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import type { Joke } from '@prisma/client';

import { db } from '~/utils/db.server';

type LoaderData = {
  joke: Joke;
};

export const loader: LoaderFunction = async ({ params }) => {
  const joke = await db.joke.findUnique({
    where: { id: params.jokeId },
  });
  if (!joke) throw new Error('Joke Not Found');
  const data: LoaderData = { joke };
  return json(data);
};

export function ErrorBoundary() {
  const { jokeId } = useParams();
  return (
    <div className='error-container'>{`There was an error loading joke by the id ${jokeId}`}</div>
  );
}

export default function JokeRoute() {
  const { joke } = useLoaderData();
  return (
    <div>
      <p>Here's your hilarious joke:</p>
      <p>{joke.content}</p>
      <Link to='.'>{joke.name}</Link>
    </div>
  );
}
