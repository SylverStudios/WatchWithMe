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
      console.debug('server stdout: ', data.toString());
      if (data.includes(serverStartupMsg)) {
        console.debug(`server started up successfully with stdout msg: ${data}`);
        resolve();
      }
    });
    serverProcess.stderr.on('data', (data) => console.warn(`server stderr: ${data}`));
    serverProcess.on('close', () => {
      console.debug('server process shut down');
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
      it('has its dependencies', () => {
        expect(execSync('mix deps.get', { cwd: serverPath }).toString()).to.not.be.empty;
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
    it('gracefully handles disconnecting while unconnected', async () => {
      await client.disconnectSync();
      await client.disconnectSync();
    });
    it('gracefully handles connecting while already connected', async () => {
      await client.connectSync();
      await client.connectSync();
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
        // reset callbacks
        client1.onUserJoin();
        client1.onPlay();
      });
      after(async () => {
        await client1.disconnectSync();
        await client2.disconnectSync();
      });
    });
    it('can detect when each other joins', (done) => {
      expect(client1.prevState.group_size).to.equal(1);
      client1.onUserJoin((newGroupSize) => {
        // TODO this becomes an "uncaught exception" and does not actually fail the test
        //      but done() is never called, so it hangs until the timeout
        expect(newGroupSize).to.equal(2);
        done();
      });
      client2.connectSync();
    });
    describe('with both connected', () => {
      before(async () => {
        await client1.connectSync();
        await client2.connectSync();
        // reset callbacks
        client1.onUserJoin();
        client1.onPlay();
      });
      after(async () => {
        await client1.disconnectSync();
        await client2.disconnectSync();
      });
      it('can detect another client\'s play message', (done) => {
        const expectedVideoTime = 1234;
        client1.onPlay(({ videoTime, worldTime }) => {
          expect(videoTime).to.equal(expectedVideoTime);
          expect(worldTime).to.be.a('number');
          expect(worldTime).to.be.above(0);
          done();
        });
        client1.play(expectedVideoTime);
      });
    });
  });
});
