import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

const App = () => {
  return (
    <main>
      <h1>cnxn</h1>
      <section>
        <p>
          TODO
        </p>
        <p>
          <a href="https://github.com/a-type/cnxn">
            Github
          </a>
        </p>
      </section>
    </main>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
