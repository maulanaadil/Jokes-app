import type {
  ActionFunction,
  LinksFunction,
  LoaderFunction,
} from '@remix-run/node';
import { z } from 'zod';
import { json, redirect } from '@remix-run/node';
import { useActionData, useCatch, Link, Form } from '@remix-run/react';

import { db } from '~/utils/db.server';
import { getUserId, requireUserId } from '~/utils/sessions.server';
import stylesUrl from '~/styles/jokes.css';
import { validationAction } from '~/utils/validation.server';

type ActionData = {
  formError?: string;
  fieldErrors?: {
    name: string | undefined;
    content: string | undefined;
  };
  fields?: {
    name: string;
    content: string;
  };
};

type ActionInput = z.TypeOf<typeof schema>;

export const links: LinksFunction = () => {
  return [
    {
      rel: 'stylesheet',
      href: stylesUrl,
    },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (!userId) {
    throw new Response('Unauthorized', {
      status: 401,
    });
  }
  return json({});
};

const schema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(3, `That joke's name is too short`),
  content: z
    .string({ required_error: 'Content is required' })
    .min(10, `That joke is too short`),
});

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const { formData, errors } = await validationAction<ActionInput>({
    request,
    schema,
  });

  if (errors) {
    return json({ fieldErrors: errors }, { status: 400 });
  }

  const { name, content } = formData;

  const fields = { name, content };

  const joke = await db.joke.create({
    data: { ...fields, jokesterId: userId },
  });

  return redirect(`/jokes/${joke.id}`);
};

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 401) {
    return (
      <div className='error-container'>
        <p>You must be logged in to create a joke.</p>
        <Link to='/login'>Login</Link>
      </div>
    );
  }
}

export function ErrorBoundary() {
  return (
    <div className='error-container'>
      Something unexpected went wrong. Sorry about that.
    </div>
  );
}

export default function NewJokesRoute() {
  const actionData = useActionData<ActionData>();

  return (
    <div>
      <p>Add your own hilarious joke</p>
      <Form method='post'>
        <div>
          <label>
            Name:{' '}
            <input
              type='text'
              defaultValue={actionData?.fields?.name}
              name='name'
              aria-invalid={Boolean(actionData?.fieldErrors?.name) || undefined}
              aria-errormessage={
                actionData?.fieldErrors?.name ? 'name-error' : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.name ? (
            <p className='form-validation-error' role='alert' id='name-error'>
              {actionData.fieldErrors.name}
            </p>
          ) : null}
        </div>
        <div>
          <label>
            Content:{' '}
            <textarea
              defaultValue={actionData?.fields?.content}
              name='content'
              aria-invalid={
                Boolean(actionData?.fieldErrors?.content) || undefined
              }
              aria-errormessage={
                actionData?.fieldErrors?.content ? 'content-error' : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.content ? (
            <p
              className='form-validation-error'
              role='alert'
              id='content-error'
            >
              {actionData.fieldErrors.content}
            </p>
          ) : null}
        </div>
        <div>
          {actionData?.formError ? (
            <p className='form-validation-error' role='alert'>
              {actionData.formError}
            </p>
          ) : null}
          <button type='submit' className='button'>
            Add
          </button>
        </div>
      </Form>
    </div>
  );
}
