import * as chai from 'chai';
import * as mocha from 'mocha'; // tslint:disable-line
import * as mongoose from 'mongoose';

import { ReviewModel } from '../../src/model/review';

const expect = chai.expect;

describe('Test Model: Assignee', () => {
  it('should give validation error', async () => {
    const reviewModel = new ReviewModel();

    try {
      await reviewModel.validate();
      // fail it
      expect(false).to.be.true;
    } catch (err) {
      expect(err.errors.description).to.exist;
      expect(err.errors.updatedBy).to.exist;
      expect(err.errors.employeeId).to.exist;
      expect(err.errors.updatedDate).to.exist;
    }
  });

  it('should not give validation error', async () => {
    const reviewModel = new ReviewModel({
      description: 'review1',
      updatedBy: '1',
      employeeId: '2',
      updatedDate: new Date(),
    });

    try {
      await reviewModel.validate();

      expect(reviewModel.errors).to.be.undefined;
    } catch (error) {
      expect(error, `Should not have error: ${error}`).to.not.exist;
    }
  });
});
