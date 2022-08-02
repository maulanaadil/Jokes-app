import type {
  ActionFunction,
  LinksFunction,
  MetaFunction,
} from '@remix-run/node';
import { z } from 'zod';
import { json } from '@remix-run/node';
import { useActionData, Link, useSearchParams, Form } from '@remix-run/react';

import { db } from '~/utils/db.server';
import { createUserSession, login, register } from '~/utils/sessions.server';
import stylesUrl from '~/styles/login.css';
import { validationAction } from '~/utils/validation.server';

export const meta: MetaFunction = () => {
  return {
    title: 'Remix Jokes | Login',
    description: 'Login to submit your own jokes to Remix Jokes!',
  };
};

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: stylesUrl }];
};

type ActionData = {
  formError?: string;
  fieldErrors?: {
    username: string | undefined;
    password: string | undefined;
  };
  fields?: {
    loginType: string | undefined;
    username: string | undefined;
    password: string | undefined;
  };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

const schema = z.object({
  username: z
    .string({ required_error: 'Username is required' })
    .min(3, 'Username must be at least 3 characters long'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters long'),
  loginType: z.string().optional(),
  redirectTo: z.string().default('/jokes'),
});

type ActionInput = z.TypeOf<typeof schema>;

export const action: ActionFunction = async ({ request }) => {
  const { formData, errors } = await validationAction<ActionInput>({
    request,
    schema,
  });

  if (errors) {
    return json({ fieldErrors: errors }, { status: 400 });
  }

  const { username, password, redirectTo, loginType } = formData;

  switch (loginType) {
    case 'login': {
      const user = await login({ username, password });

      if (!user) {
        return badRequest({
          fields: { username, loginType, password },
          formError: `Username/Password combination is incorrect`,
        });
      }

      return createUserSession(user.id, redirectTo);
    }
    case 'register': {
      const userExists = await db.user.findFirst({
        where: { username },
      });
      if (userExists) {
        return badRequest({
          fields: { username, loginType, password },
          formError: `User with username ${username} already exists`,
        });
      }
      const user = await register({ username, password });
      if (!user) {
        return badRequest({
          fields: { username, loginType, password },
          formError: `Something wrong trying to create a new user`,
        });
      }

      return createUserSession(user.id, redirectTo);
    }
    default: {
      return badRequest({
        fields: { username, loginType, password },
        formError: `Login type invalid`,
      });
    }
  }
};

export function ErrorBoundary() {
  return (
    <div className='error-container'>Sorry there was trouble on server.</div>
  );
}

export default function Login() {
  const actionData = useActionData<ActionData>();
  const [searchParams] = useSearchParams();
  return (
    <div className='container'>
      <div className='content' data-light=''>
        <h1>Login</h1>
        <Form method='post'>
          <input
            type='hidden'
            name='redirectTo'
            value={searchParams.get('redirectTo') ?? undefined}
          />
          <fieldset>
            <legend className='sr-only'>Login or Register?</legend>
            <label>
              <input
                type='radio'
                name='loginType'
                value='login'
                defaultChecked={
                  !actionData?.fields?.loginType ||
                  actionData?.fields?.loginType === 'login'
                }
              />{' '}
              Login
            </label>
            <label>
              <input
                type='radio'
                name='loginType'
                value='register'
                defaultChecked={actionData?.fields?.loginType === 'register'}
              />{' '}
              Register
            </label>
          </fieldset>
          <div>
            <label htmlFor='username-input'>Username</label>
            <input
              type='text'
              id='username-input'
              name='username'
              defaultValue={actionData?.fields?.username}
              aria-invalid={Boolean(actionData?.fieldErrors?.username)}
              aria-errormessage={
                actionData?.fieldErrors?.username ? 'username-error' : undefined
              }
            />
            {actionData?.fieldErrors?.username ? (
              <p
                className='form-validation-error'
                role='alert'
                id='username-error'
              >
                {actionData.fieldErrors.username}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor='password-input'>Password</label>
            <input
              id='password-input'
              name='password'
              defaultValue={actionData?.fields?.password}
              type='password'
              aria-invalid={
                Boolean(actionData?.fieldErrors?.password) || undefined
              }
              aria-errormessage={
                actionData?.fieldErrors?.password ? 'password-error' : undefined
              }
            />
            {actionData?.fieldErrors?.password ? (
              <p
                className='form-validation-error'
                role='alert'
                id='password-error'
              >
                {actionData.fieldErrors.password}
              </p>
            ) : null}
          </div>
          <div id='form-error-message'>
            {actionData?.formError ? (
              <p className='form-validation-error' role='alert'>
                {actionData.formError}
              </p>
            ) : null}
          </div>
          <button type='submit' className='button'>
            Submit
          </button>
        </Form>
      </div>
      <div className='links'>
        <ul>
          <li>
            <Link to='/'>Home</Link>
          </li>
          <li>
            <Link to='/jokes'>Jokes</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
