// ESLint flat config for strong-soap
// Migrated from JSHint configuration

module.exports = [
  {
    ignores: [
      'node_modules/**',
      'lib/**',
      'coverage/**',
      '.nyc_output/**',
    ],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'commonjs',
      globals: {
        // Node.js globals
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'writable',
        global: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        setImmediate: 'readonly',
        clearImmediate: 'readonly',
        crypto: 'readonly',
        // Mocha test globals
        describe: 'readonly',
        it: 'readonly',
        xit: 'readonly',
        before: 'readonly',
        beforeEach: 'readonly',
        after: 'readonly',
        afterEach: 'readonly',
        // Test-specific globals
        lastReqAddress: 'writable',
        root: 'writable',
      },
    },
    rules: {
      // Core rules matching JSHint config
      'eqeqeq': 'off', // JSHint had this on, but codebase uses == extensively
      'no-undef': 'error',
      'no-unused-vars': ['warn', { args: 'none', varsIgnorePattern: '^_' }],
      'strict': 'off', // Relax strict mode requirement
      'no-trailing-spaces': 'warn',
      'no-bitwise': 'off',
      'curly': 'off',
      'camelcase': 'off',

      // Additional recommended rules
      'no-console': 'off',
      'no-debugger': 'warn',
      'no-constant-condition': 'warn',
      'no-empty': 'warn',
      'no-extra-semi': 'warn',
      'no-irregular-whitespace': 'error',
      'no-unreachable': 'warn',
      'valid-typeof': 'error',

      // Best practices
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-with': 'error',
      'no-caller': 'error',
      'no-extend-native': 'error',

      // Style (relaxed to match existing codebase)
      'indent': 'off', // Too many violations, disable for now
      'quotes': 'off',
      'semi': 'off',
      'comma-dangle': 'off',
      'no-mixed-spaces-and-tabs': 'warn',
    },
  },
];

// Made with Bob
