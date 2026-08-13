import nextPlugin from '@next/eslint-plugin-next';

export default [
	{
		plugins: { '@next/next': nextPlugin },
		rules: { '@next/next/no-img-element': 'off' },
		ignores: ['node_modules/**', '.next/**', 'dist/**', 'build/**', 'coverage/**', '*.min.js'],
	},
];
