module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [ 'import', 'sort-keys-fix' ],
  root: true,
  rules: {
    '@typescript-eslint/explicit-module-boundary-types': [
      'warn',
      { allowArgumentsExplicitlyTypedAsAny: true },
    ],
    '@typescript-eslint/indent': [
      'error',
      2,
      {
        ignoredNodes: [ 'TSTypeParameterInstantiation' ],
        SwitchCase: 1,
      },
    ],
    '@typescript-eslint/member-ordering': [ 'error', {
      interfaces: { order: 'alphabetically' },
      typeLiterals: { order: 'alphabetically' },
    } ],
    '@typescript-eslint/no-unused-vars': [
      'error',
      { args: 'after-used', ignoreRestSiblings: true },
    ],
    '@typescript-eslint/prefer-optional-chain': [ 'error' ],
    'array-bracket-spacing': [ 'error', 'always' ],
    'array-element-newline': [ 'error', 'consistent' ],
    'arrow-spacing': [ 'error', { after: true, before: true } ],
    'block-spacing': [ 'error', 'always' ],
    'brace-style': [ 'error', '1tbs', { allowSingleLine: true } ],
    'comma-dangle': [ 'error', 'always-multiline' ],
    'comma-spacing': [ 'error', { after: true, before: false } ],
    'eol-last': [ 'error', 'always' ],
    'eqeqeq': [ 'error', 'smart' ],
    'function-paren-newline': [ 'error', 'multiline-arguments' ],
    'import/order': [ 'error', {
      'alphabetize': { caseInsensitive: true, order: 'asc' },
      'groups': [ 'builtin', 'external', 'internal', 'parent', 'sibling', 'index' ],
      'newlines-between': 'always',
    } ],
    'indent': 'off',
    'jsx-quotes': [ 'error', 'prefer-double' ],
    'key-spacing': [ 'error', {
      multiLine: {
        afterColon: true,
        beforeColon: false,
        mode: 'strict',
      },
      singleLine: {
        afterColon: true,
        beforeColon: false,
      },
    } ],
    'max-len': [ 'error', 100, { tabWidth: 2 } ],
    'no-console': [ 'error', { allow: [ 'warn' ] } ],
    'no-empty': [ 'error', { allowEmptyCatch: true } ],
    'no-multi-spaces': [ 'error', { ignoreEOLComments: true } ],
    'no-multiple-empty-lines': [ 'error', { max: 1, maxBOF: 0, maxEOF: 0 } ],
    'no-trailing-spaces': [ 'error', {} ],
    'no-unused-vars': 'off',
    'object-curly-newline': [ 'error', {
      ExportDeclaration: { consistent: true },
      ImportDeclaration: { consistent: true },
      ObjectExpression: { multiline: true },
      ObjectPattern: { multiline: true },
    } ],
    'object-curly-spacing': [ 'error', 'always' ],
    'object-property-newline': [ 'error', { allowAllPropertiesOnSameLine: true } ],
    'quote-props': [ 'error', 'consistent-as-needed' ],
    'quotes': [ 'error', 'single', { avoidEscape: true } ],
    'require-await': 'error',
    'semi': [ 'error', 'always' ],
    'sort-imports': [ 'error', {
      ignoreCase: true,
      ignoreDeclarationSort: true,
      ignoreMemberSort: false,
    } ],
    'sort-keys-fix/sort-keys-fix': [ 'error', 'asc', {
      caseSensitive: false,
      natural: true,
    } ],
    'space-in-parens': [ 'error', 'never' ],
    'space-infix-ops': [ 'error', { int32Hint: true } ],
  },
  settings: {
    'import/resolver': { typescript: {} }, // This loads <rootdir>/tsconfig.json to eslint
  },
};
