import type { ActionFunction, LinksFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';

import { db } from '~/utils/db.server';
import stylesUrl from '~/styles/jokes.css';

export const links: LinksFunction = () => {
  return [
    {
      rel: 'stylesheet',
      href: stylesUrl,
    },
  ];
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const name = form.get('name');
  const content = form.get('content');

  if (typeof name !== 'string' || typeof content !== 'string') {
    throw new Error(`Form not submitted correcly.`);
  }

  const joke = await db.joke.create({
    data: {
      name,
      content,
    },
  });
  return redirect(`/jokes/${joke.id}`);
};

export default function NewJokesRoute() {
  return (
    <div>
      <p>Add your own hilarious joke</p>
      <form method='post'>
        <div>
          <label htmlFor='name'>
            Name:
            <input
              type='text'
              name='name'
              id='name'
              placeholder='Input your name'
            />
          </label>
        </div>
        <div>
          <label htmlFor='content'>
            Content:
            <textarea name='content' id='content' placeholder='Input content' />
          </label>
        </div>
        <button type='submit' className='button'>
          Add
        </button>
      </form>
    </div>
  );
}
