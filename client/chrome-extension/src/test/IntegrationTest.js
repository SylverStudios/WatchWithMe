/* eslint-disable no-unused-expressions one-var no-new, one-var-declaration-per-line */

import { expect } from 'chai';
import { JSDOM } from 'jsdom';
import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

import Client from '../client/Client';

const repositoryRoot = '../../';
const serverDir = 'fjord';
const serverPath = path.resolve(repositoryRoot + serverDir);

const serverStartupMsg = 'Running FjordWeb.Endpoint';

const startServer = async () => {
  const cmd = 'mix';
  const args = ['phx.server'];
  console.debug(`spawning server process in dir ${serverPath} with cmd: ${cmd} ${args.join(' ')}`);
  const serverProcess = spawn(cmd, args, { cwd: serverPath });
  console.debug('server process spawned');
  await new Promise((resolve) => {
    serverProcess.stdout.on('data', (data) => {
      console.debug(`SERVER STDOUT: ${data}`);
      if (data.includes(serverStartupMsg)) {
        console.debug(`server started up successfully with stdout msg: ${data}`);
        resolve();
      }
    });
    serverProcess.stderr.on('data', (data) => console.warn(`SERVER STDERR: ${data}`));
    serverProcess.on('close', (code) => {
      if (code !== 0) {
        throw new Error(`SERVER process closed with code ${code}`);
      }
      console.debug('SERVER process shut down successfully');
    });
  });
  return serverProcess;
};
const killServer = async (serverProcess) => {
  if (serverProcess) {
    console.debug('killing serverProcess');
    serverProcess.kill();
    await new Promise(resolve => serverProcess.on('exit', resolve));
    console.debug('killed serverProcess');
  } else {
    console.warn('no serverProcess supplied to killServer(), could be an upstream bug');
  }
};
const withRunningServer = (nestedRules) => {
  let serverProcess;
  before(async () => {
    serverProcess = await startServer();
  });
  if (nestedRules) {
    nestedRules();
  }
  after(async () => {
    await killServer(serverProcess);
  });
};

// the phoenix Socket library requires a global 'window' object
global.window = new JSDOM().window;

describe('integration between server and client', () => {
  describe('environment setup', () => {
    describe('server location in repository', () => {
      it('is where it is expected by client testing code', () => {
        expect(fs.existsSync(serverPath)).to.be.true;
      });
    });
    describe('elixir', () => {
      it('is installed', () => {
        expect(execSync('which elixir').toString()).to.not.be.empty;
      });
    });
    describe('mix', () => {
      it('is installed', () => {
        expect(execSync('which mix').toString()).to.not.be.empty;
      });
    });
    describe('the server', () => {
      it('can start and stop', async function () {
        this.timeout(20000);
        const serverProcess = await startServer();
        await killServer(serverProcess);
      });
    });
  });

  describe('one client', function () {
    this.timeout(20000);
    withRunningServer();
    let client;
    it('can make a connection', async () => {
      client = new Client('ws://localhost:4000/socket', 'user');
      await client.connectSync();
    });
    it('can disconnect', async () => {
      await client.disconnectSync();
    });
  });

  describe('two clients', function () {
    this.timeout(20000);
    let client1, client2;
    withRunningServer(() => {
      before(async () => {
        client1 = new Client('ws://localhost:4000/socket', 'user1');
        client2 = new Client('ws://localhost:4000/socket', 'user2');
        await client1.connectSync();
      });
      after(async () => {
        await client1.disconnectSync();
        await client2.disconnectSync();
      });
    });
    it('can detect when each other joins', (done) => {
      client1.onUserJoin((newGroupSize) => {
        expect(newGroupSize).to.equal(2);
        client1.onUserJoin(); // reset
        done();
      });
      client2.connectSync();
    });
  });
});
