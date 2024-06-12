import esbuild from 'esbuild'
import path from 'path'
import { spawn } from 'child_process'

const args = process.argv.slice(2)

let dev = args.includes(`--dev`)
let watch = args.includes(`--watch`)

const buildClient = async () => {
  const options = {
    entryPoints: ['./client/index.js'],
    bundle: true,
    outfile: './public/build/bundle.js',
    loader: {
      '.js': 'jsx',
      '.woff': 'dataurl',
      '.woff2': 'dataurl'
    },
    alias: {
      'react': path.resolve('./node_modules/react') // fix because we are using react in the other web-plugin project https://blog.maximeheckel.com/posts/duplicate-dependencies-npm-link/
    },
    minify: !dev,
    sourcemap: dev ? `inline` : false
  }

  if (watch) {
    const ctx = await esbuild.context(options)
    await ctx.watch()
  } else {
    await esbuild.build(options)
  }
}

const startDevServer = async () => {
  const process = spawn(`node`, [`./server/index.js`])

  process.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`)
  })

  process.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`)
  })

  process.on('close', (code) => {
    console.log(`child process exited with code ${code}`)
  })

  console.log(`Server started with PID: ${process.pid}`)
  return process
}

buildClient()
if (watch) startDevServer()
