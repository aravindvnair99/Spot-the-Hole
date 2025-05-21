const request = require('supertest');
const { expect } = require('chai');
const sinon = require('sinon');
const admin = require('firebase-admin');

// Initialize Firebase app if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    // databaseURL: 'https://your-project-id.firebaseio.com' // Optional, if needed
  });
}

// Require the Express app from index.js
// Ensure this path is correct based on your project structure
const app = require('../index').app; 

describe('POST /onUpdateProfile', () => {
  let updateUserStub;
  let verifySessionCookieStub;

  const mockUid = 'test-user-uid';
  const mockDecodedClaims = { uid: mockUid, email: 'user@example.com' };

  beforeEach(() => {
    // Stub Firebase Auth functions before each test
    updateUserStub = sinon.stub(admin.auth(), 'updateUser');
    // checkCookieMiddleware uses verifySessionCookie. Stub it.
    verifySessionCookieStub = sinon.stub(admin.auth(), 'verifySessionCookie');
  });

  afterEach(() => {
    // Restore the stubs after each test
    sinon.restore();
  });

  const validUpdateData = {
    uid: mockUid, // This uid in body might be redundant if taken from session, but test as per potential implementation
    phoneNumber: '+11234567890',
    password: 'newPassword123',
    firstName: 'John',
    lastName: 'Doe',
    photoURL: 'http://example.com/newphoto.jpg',
    // email and emailVerified are typically not updated via this kind of profile update endpoint directly
  };

  it('should update user profile and redirect to /login on success', (done) => {
    // Simulate authenticated user via checkCookieMiddleware
    verifySessionCookieStub.resolves(mockDecodedClaims);
    // Simulate successful updateUser call
    updateUserStub.withArgs(mockUid, {
      phoneNumber: validUpdateData.phoneNumber,
      password: validUpdateData.password,
      displayName: `${validUpdateData.firstName} ${validUpdateData.lastName}`,
      photoURL: validUpdateData.photoURL,
    }).resolves({ uid: mockUid, ...mockDecodedClaims }); // Mock successful user update response

    request(app)
      .post('/onUpdateProfile')
      .send(validUpdateData)
      .set('Cookie', '__session=mockSessionCookie') // Send a mock session cookie
      .expect(302) // Expecting a redirect
      .end((err, res) => {
        if (err) return done(err);
        
        expect(verifySessionCookieStub.calledOnce).to.be.true;
        expect(updateUserStub.calledOnceWith(mockUid, {
          phoneNumber: validUpdateData.phoneNumber,
          password: validUpdateData.password,
          displayName: `${validUpdateData.firstName} ${validUpdateData.lastName}`,
          photoURL: validUpdateData.photoURL,
        })).to.be.true;
        expect(res.headers.location).to.equal('/login');
        done();
      });
  });

  it('should redirect to /signOut if user is unauthenticated', (done) => {
    // Simulate unauthenticated user via checkCookieMiddleware
    verifySessionCookieStub.rejects(new Error('Session cookie verification failed'));
    
    request(app)
      .post('/onUpdateProfile')
      .send(validUpdateData)
      .set('Cookie', '__session=invalidOrExpiredMockSessionCookie') // Send a mock session cookie
      .expect(302) // Expecting a redirect from checkCookieMiddleware
      .end((err, res) => {
        if (err) return done(err);

        expect(verifySessionCookieStub.calledOnce).to.be.true;
        // Assert that updateUser() is NOT called
        expect(updateUserStub.notCalled).to.be.true;
        expect(res.headers.location).to.equal('/signOut'); // checkCookieMiddleware redirects to /signOut
        done();
      });
  });

  it('should redirect to /login even if Firebase Auth updateUser fails (and log error server-side)', (done) => {
    // Simulate authenticated user
    verifySessionCookieStub.resolves(mockDecodedClaims);
    // Simulate updateUser failure
    const updateUserError = new Error('Failed to update user in Firebase');
    updateUserStub.withArgs(mockUid, {
      phoneNumber: validUpdateData.phoneNumber,
      password: validUpdateData.password,
      displayName: `${validUpdateData.firstName} ${validUpdateData.lastName}`,
      photoURL: validUpdateData.photoURL,
    }).rejects(updateUserError);

    // Spy on console.error to check if the error is logged (optional, but good practice)
    // const consoleErrorSpy = sinon.spy(console, 'error');

    request(app)
      .post('/onUpdateProfile')
      .send(validUpdateData)
      .set('Cookie', '__session=mockSessionCookie')
      .expect(302) // Still redirects to /login as per current implementation
      .end((err, res) => {
        if (err) return done(err);

        expect(verifySessionCookieStub.calledOnce).to.be.true;
        // Assert that updateUser() was called
        expect(updateUserStub.calledOnceWith(mockUid, {
          phoneNumber: validUpdateData.phoneNumber,
          password: validUpdateData.password,
          displayName: `${validUpdateData.firstName} ${validUpdateData.lastName}`,
          photoURL: validUpdateData.photoURL,
        })).to.be.true;
        
        // expect(consoleErrorSpy.calledWith('Error updating user:', updateUserError)).to.be.true; // Check if error was logged
        // consoleErrorSpy.restore();

        expect(res.headers.location).to.equal('/login'); // Current implementation redirects to /login on error too
        done();
      });
  });
});
