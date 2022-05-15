import type { Joke } from '@prisma/client';
import { Form } from '@remix-run/react';
import { Link } from '@remix-run/react';

export default function JokeDisplay({
  joke,
  isOwner,
  canDelete = true,
}: {
  joke: Pick<Joke, 'content' | 'name'>;
  isOwner: boolean;
  canDelete?: boolean;
}) {
  return (
    <div>
      <p>Here'your hilarious joke: </p>
      <p>{joke.content}</p>
      <Link to='.' prefetch='intent'>
        {joke.name} Permalink
      </Link>
      {isOwner && (
        <Form method='post'>
          <input type='hidden' name='_method' value='delete' />
          <button type='submit' className='button' disabled={!canDelete}>
            Delete
          </button>
        </Form>
      )}
    </div>
  );
}
