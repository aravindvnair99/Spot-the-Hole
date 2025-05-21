const request = require('supertest');
const { expect } = require('chai');
const sinon = require('sinon');
const admin = require('firebase-admin');

// Initialize Firebase app if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    // databaseURL: 'https://spot-the-hole.firebaseio.com' // Optional
  });
}

// It's important that the app is required *after* admin has been initialized
// and potentially after stubs have been set up if those stubs affect app initialization.
// However, for route testing, stubs are typically applied per test case.
const app = require('../index').app;

describe('GET /sessionLogin', () => {
  let createSessionCookieStub;
  let verifyIdTokenStub; // This will be specific to this describe block due to beforeEach

  beforeEach(() => {
    // Stub Firebase Auth functions before each test
    createSessionCookieStub = sinon.stub(admin.auth(), 'createSessionCookie');
    verifyIdTokenStub = sinon.stub(admin.auth(), 'verifyIdToken');
  });

  afterEach(() => {
    // Restore the stubs after each test
    sinon.restore();
  });

  const mockDecodedClaims = { uid: 'test-uid', email: 'test@example.com', name: 'Test User' };
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
  const mockSessionCookie = 'mock-session-cookie-value';

  describe('Successful login', () => {
    const scenarios = [
      { name: 'new user', isNewUser: true },
      { name: 'existing user', isNewUser: false },
    ];

    scenarios.forEach(({ name, isNewUser }) => {
      it(`should process login for ${name}, set cookie, and redirect to /dashboard`, (done) => {
        const idToken = `valid-id-token-for-${name.replace(' ', '-')}`;
        // Mock verifyIdToken to resolve successfully for the given idToken
        verifyIdTokenStub.withArgs(idToken).resolves(mockDecodedClaims);
        // Mock createSessionCookie to resolve successfully
        createSessionCookieStub.withArgs(idToken, { expiresIn }).resolves(mockSessionCookie);

        request(app)
          .get(`/sessionLogin?idToken=${idToken}&isNewUser=${isNewUser}`)
          .expect(302) // Expecting a redirect
          .end((err, res) => {
            if (err) return done(err);

            // Assert that verifyIdToken() is called
            expect(verifyIdTokenStub.calledOnceWith(idToken), 'verifyIdToken not called or called with wrong args').to.be.true;
            // Assert that createSessionCookie() is called with the correct idToken and expiresIn
            expect(createSessionCookieStub.calledOnceWith(idToken, { expiresIn }), 'createSessionCookie not called or called with wrong args').to.be.true;

            // Assert that the response includes a Set-Cookie header with __session=<mock_cookie_value> and attributes
            expect(res.headers['set-cookie']).to.exist;
            const cookieHeader = res.headers['set-cookie'][0];
            expect(cookieHeader).to.include(`__session=${mockSessionCookie}`);
            expect(cookieHeader).to.include('HttpOnly');
            expect(cookieHeader).to.include('Secure');
            expect(cookieHeader).to.include('SameSite=Strict');
            expect(cookieHeader).to.include('Path=/');
            expect(cookieHeader).to.match(/Max-Age=\d+/); // Check for Max-Age presence

            // Assert that the response is a redirect to /dashboard
            expect(res.headers.location).to.equal('/dashboard');
            done();
          });
      });
    });
  });

  describe('Failure Scenarios', () => {
    it('should return 500 if idToken is missing (due to .toString() on undefined)', (done) => {
      // This test assumes functions/index.js calls req.query.idToken.toString() which throws TypeError
      // if idToken is not present, and this TypeError is not caught gracefully by the route handler for /sessionLogin.
      request(app)
        .get('/sessionLogin?isNewUser=true') // No idToken provided
        .expect(500) // Expecting Express's default error handler for unhandled TypeError
        .end((err, res) => {
          if (err) return done(err);
          // Assert that createSessionCookie() is NOT called
          expect(createSessionCookieStub.called, 'createSessionCookie should not have been called').to.be.false;
          // Also assert verifyIdToken was not called
          expect(verifyIdTokenStub.called, 'verifyIdToken should not have been called').to.be.false;
          // Check content type for default error page
          expect(res.headers['content-type']).to.include('text/html');
          done();
        });
    });

    it('should return 401 and render errors/401 if verifyIdToken (for input idToken) fails', (done) => {
      const invalidIdToken = 'invalid-id-token-verify-fails';
      // Mock verifyIdToken to reject for this specific token
      verifyIdTokenStub.withArgs(invalidIdToken).rejects(new Error('Invalid ID token (mocked verifyIdToken failure)'));

      // Ensure view engine is set for the app if it's not globally configured or if using a test app instance
      app.set('view engine', 'ejs');
      app.set('views', './views'); // Adjust path if necessary

      request(app)
        .get(`/sessionLogin?idToken=${invalidIdToken}&isNewUser=false`)
        .expect(401)
        .end((err, res) => {
          if (err) return done(err);
          // Assert that verifyIdToken() was called
          expect(verifyIdTokenStub.calledOnceWith(invalidIdToken)).to.be.true;
          // Assert that createSessionCookie() was NOT called because verifyIdToken failed
          expect(createSessionCookieStub.called).to.be.false;
          // Assert that the "errors/401" view is rendered (check for some content)
          expect(res.text).to.include('Unauthorized'); // Assuming 'errors/401.ejs' contains this text
          done();
        });
    });

    it('should return 401 and render errors/401 if createSessionCookie fails (after verifyIdToken success)', (done) => {
      const idTokenForCreateCookieFailure = 'id-token-for-create-cookie-failure';
      // Mock verifyIdToken to succeed
      verifyIdTokenStub.withArgs(idTokenForCreateCookieFailure).resolves(mockDecodedClaims);
      // Mock createSessionCookie to reject
      createSessionCookieStub.withArgs(idTokenForCreateCookieFailure, { expiresIn }).rejects(new Error('Session cookie creation failed (mocked)'));
      
      app.set('view engine', 'ejs');
      app.set('views', './views');

      request(app)
        .get(`/sessionLogin?idToken=${idTokenForCreateCookieFailure}&isNewUser=false`)
        .expect(401)
        .end((err, res) => {
          if (err) return done(err);
          // Assert verifyIdToken was called
          expect(verifyIdTokenStub.calledOnceWith(idTokenForCreateCookieFailure)).to.be.true;
          // Assert createSessionCookie was called
          expect(createSessionCookieStub.calledOnceWith(idTokenForCreateCookieFailure, { expiresIn })).to.be.true;
          // Assert that the "errors/401" view is rendered
          expect(res.text).to.include('Unauthorized'); // Assuming 'errors/401.ejs' contains this text
          done();
        });
    });
  });
});

describe('POST /onLogin', () => {
  let verifyIdTokenStub;
  let getUserStub;
  const mockIdToken = 'mock-id-token';
  const mockUid = 'mock-user-uid';

  beforeEach(() => {
    // It's crucial to re-stub for each test or ensure stubs are clean.
    // admin.auth() returns the same Auth instance, so stubs can interfere if not managed.
    // For verifyIdToken, it's already stubbed in the outer scope's beforeEach.
    // Re-stubbing it here specifically for /onLogin tests or ensuring it's reset.
    // To avoid conflicts, it's often better to stub within the describe block's beforeEach.
    if (admin.auth().verifyIdToken.restore) {
      admin.auth().verifyIdToken.restore(); // Restore if already stubbed by outer scope
    }
    if (admin.auth().getUser.restore) {
      admin.auth().getUser.restore();
    }
    verifyIdTokenStub = sinon.stub(admin.auth(), 'verifyIdToken');
    getUserStub = sinon.stub(admin.auth(), 'getUser');
  });

  afterEach(() => {
    sinon.restore(); // This will restore all stubs created by sinon in this scope and its children
  });

  it('should return { path: "/emailVerification" } if email is not verified', (done) => {
    verifyIdTokenStub.withArgs(mockIdToken).resolves({ uid: mockUid });
    getUserStub.withArgs(mockUid).resolves({ uid: mockUid, emailVerified: false });

    request(app)
      .post('/onLogin')
      .send({ idToken: mockIdToken })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(verifyIdTokenStub.calledOnceWith(mockIdToken)).to.be.true;
        expect(getUserStub.calledOnceWith(mockUid)).to.be.true;
        expect(res.body).to.deep.equal({ path: "/emailVerification" });
        done();
      });
  });

  it('should return { path: "/updateProfile" } if email verified but phone number missing', (done) => {
    verifyIdTokenStub.withArgs(mockIdToken).resolves({ uid: mockUid });
    getUserStub.withArgs(mockUid).resolves({ uid: mockUid, emailVerified: true, phoneNumber: null }); // or undefined

    request(app)
      .post('/onLogin')
      .send({ idToken: mockIdToken })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(verifyIdTokenStub.calledOnceWith(mockIdToken)).to.be.true;
        expect(getUserStub.calledOnceWith(mockUid)).to.be.true;
        expect(res.body).to.deep.equal({ path: "/updateProfile" });
        done();
      });
  });

  it('should return { path: "/dashboard" } if email verified and phone number present', (done) => {
    verifyIdTokenStub.withArgs(mockIdToken).resolves({ uid: mockUid });
    getUserStub.withArgs(mockUid).resolves({ uid: mockUid, emailVerified: true, phoneNumber: '1234567890' });

    request(app)
      .post('/onLogin')
      .send({ idToken: mockIdToken })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(verifyIdTokenStub.calledOnceWith(mockIdToken)).to.be.true;
        expect(getUserStub.calledOnceWith(mockUid)).to.be.true;
        expect(res.body).to.deep.equal({ path: "/dashboard" });
        done();
      });
  });

  it('should return "/login" if ID token is invalid', (done) => {
    verifyIdTokenStub.withArgs(mockIdToken).rejects(new Error('Invalid ID token'));

    request(app)
      .post('/onLogin')
      .send({ idToken: mockIdToken })
      .expect(200) // Assuming the endpoint itself doesn't error out but returns a specific body
      .end((err, res) => {
        if (err) return done(err);
        expect(verifyIdTokenStub.calledOnceWith(mockIdToken)).to.be.true;
        expect(getUserStub.notCalled).to.be.true;
        expect(res.body).to.equal("/login"); // As per prompt
        done();
      });
  });

  it('should return "/login" if error fetching user data', (done) => {
    verifyIdTokenStub.withArgs(mockIdToken).resolves({ uid: mockUid });
    getUserStub.withArgs(mockUid).rejects(new Error('Error fetching user'));

    request(app)
      .post('/onLogin')
      .send({ idToken: mockIdToken })
      .expect(200) // Assuming the endpoint itself doesn't error out
      .end((err, res) => {
        if (err) return done(err);
        expect(verifyIdTokenStub.calledOnceWith(mockIdToken)).to.be.true;
        expect(getUserStub.calledOnceWith(mockUid)).to.be.true;
        expect(res.body).to.equal("/login"); // As per prompt
        done();
      });
  });
});
