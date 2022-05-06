import React from 'react';

export default function NewJokesRoute() {
  return (
    <div>
      <p>Add your own hilarious joke</p>
      <form action='post'>
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
        <button type='submit'>Add</button>
      </form>
    </div>
  );
}
