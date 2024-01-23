import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'

const name = 'urlhub';

const bundle = config => ({
  ...config,
  input: 'src/index.ts',
  external: id => !/^[./]/.test(id),
})

export default [
  bundle({
    plugins: [esbuild({
      include: [/\.[jt]sx?$/, /node_modules/],
      exclude: [],
    })],
    output: [
      {
        file: `dist/${name}.js`,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: `dist/${name}.mjs`,
        format: 'es',
        sourcemap: true,
      },
      {
        file: `playground/dist/${name}.mjs`,
        format: 'es',
        sourcemap: true,
      }
    ],
  }),
  bundle({
    plugins: [dts()],
    output: [
      {
        file: `dist/${name}.d.ts`,
        format: 'es',
      },
      {
        file: `playground/dist/${name}.d.ts`,
        format: 'es',
      }
    ]
  }),
]
