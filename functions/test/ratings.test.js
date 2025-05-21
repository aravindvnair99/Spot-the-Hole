const request = require('supertest');
const { expect } = require('chai');
const sinon = require('sinon');
const admin = require('firebase-admin');
const app = require('../index').app; // Assuming your Express app is exported as 'app' from index.js

describe('POST /setRating', () => {
  let adminStub;

  beforeEach(() => {
    // Initialize Firebase app if not already initialized
    if (!admin.apps.length) {
      admin.initializeApp();
    }
    adminStub = sinon.stub(admin.firestore().collection('potholes').doc(), 'update');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('Success', () => {
    it('should set rating and return 200 if data is valid and user is authenticated', (done) => {
      const verifySessionCookieStub = sinon.stub(admin.auth(), 'verifySessionCookie');
      verifySessionCookieStub.resolves({ uid: 'test-uid' }); // Mock successful authentication

      adminStub.resolves(); // Mock successful Firestore update

      request(app)
        .post('/setRating')
        .send({ potholeId: 'test-pothole-id', rating: 5 })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.text).to.equal('Set');
          expect(adminStub.calledOnceWith({
            rating: admin.firestore.FieldValue.arrayUnion({
              rating: 5,
              uid: 'test-uid',
            }),
          })).to.be.true;
          done();
        });
    });
  });

  describe('Failure (Firestore error)', () => {
    it('should return 500 if Firestore update fails', (done) => {
      const verifySessionCookieStub = sinon.stub(admin.auth(), 'verifySessionCookie');
      verifySessionCookieStub.resolves({ uid: 'test-uid' }); // Mock successful authentication

      adminStub.rejects(new Error('Firestore error')); // Mock Firestore update failure

      request(app)
        .post('/setRating')
        .send({ potholeId: 'test-pothole-id', rating: 5 })
        .expect(500)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.text).to.equal('Error');
          expect(adminStub.calledOnce).to.be.true;
          done();
        });
    });
  });

  describe('Failure (Unauthorized)', () => {
    it('should redirect to /signOut if user is not authenticated', (done) => {
      const verifySessionCookieStub = sinon.stub(admin.auth(), 'verifySessionCookie');
      verifySessionCookieStub.rejects(new Error('Authentication error')); // Mock failed authentication

      request(app)
        .post('/setRating')
        .send({ potholeId: 'test-pothole-id', rating: 5 })
        .expect(302) // Expecting a redirect
        .end((err, res) => {
          if (err) return done(err);
          expect(res.headers.location).to.equal('/signOut');
          expect(adminStub.notCalled).to.be.true; // Firestore should not be called
          done();
        });
    });
  });
});
