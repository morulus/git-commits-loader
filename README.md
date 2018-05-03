git-commits-loader
==

Webpack loader to get information about file [git](https://git-scm.com/) commits.

**Ensure that git is installed on machine on which your project builds and project root directory contains `.git` folder!**

Usage
--

Use as inline query with webpack:
```js
import fileCommits from '!git-commits-loader!./index.js'
```

By the defaults, you'll get information (author name, author email and date) about initial commit and last commit.

```js
{
  initial: {
    at: "1522742493",
    ae: "ivani@example.com",
    an: "Ivan Ivanov"
  },
  last: {
    at: "1523235676",
    ae: "petrp@example.com",
    an: "Petr Petrov"
  }
}
```

Options:

- **`placeholders`** (array) _Default: [`an`, `ae`, `at`]_ Array of placeholders, supported by `git log --pretty=format`;
- **`initial`** (bool) _Default: true_ Get properties of initial commit;
- **`last`** (bool) _Default: true_ Get properties of last commit;
- **`all`** (bool) _Default: false_ Get all commits (heavy);
- **`formatSep`** (string) Separator of placeholders (by default the separator is quite unique, but you can define your delimiter to avoid collisions)

Custom configuration will be deep mixed with the default configuration, thus shape like `{ all: false }` will be correct.

Beta
--

The tool is at the beta stage. Use it carefully.

Author and license
--

Morulus <vladimirmorulus@gmail.com>

Under [MIT](./LICENSE) license, 2018

See also
--

- [invoke-loader](https://github.com/morulus/invoke-loader) Resolve and invoke loader and options, the paths to which are specified in the options
- [markdown-heading-loader](https://github.com/morulus/markdown-heading-loader) Just get primary heading of markdown document
- [markdown-feat-react-loader](https://github.com/morulus/markdown-feat-react-loader) Use React components directly in markdown
