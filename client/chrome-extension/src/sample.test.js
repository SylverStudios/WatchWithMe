/* globals describe, it */
/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import AppController from './background/AppController';

describe('sample test', () => {
  it('works', async () => {
    expect(AppController).to.not.be.undefined;
  });
});
