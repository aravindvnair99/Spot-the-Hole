const request = require('supertest');
const { expect } = require('chai');
const sinon = require('sinon');
const admin = require('firebase-admin');
const tfnode = require('@tensorflow/tfjs-node');
const automl = require('@tensorflow/tfjs-automl');
const fs = require('fs');
const os = require('os');
const path = require('path');
const axios = require('axios'); // For mocking Google Maps API
const vader = require('vader-sentiment'); // For mocking sentiment analysis

// Attempt to mock makeID globally if possible (this is tricky for non-exported functions)
// If index.js defines `makeID` as a global function, this might not effectively override it
// without tools like proxyquire. For now, we'll assume it can be stubbed or we work around it.
// Global functions are hard to mock; ideally, it would be an exported utility.
// Let's assume `makeID` is part of an exported object or we test without deterministic ID.
// For this solution, I will proceed as if makeID is part of `app.locals` or similar that can be stubbed,
// or that its output can be captured/predicted. If not, the ID part of paths will be dynamic.
// For the purpose of this exercise, I'll stub a placeholder for makeID if it were exported.
// If not, I'll make a note in the test.

// Initialize Firebase app if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: 'spot-the-hole.appspot.com', // Mock or actual bucket name
  });
}

// Require the Express app from index.js
// IMPORTANT: If makeID is truly global and defined in index.js, its direct mocking is hard.
// We will stub it on `app.locals` if it's exposed there, or proceed without deterministic ID.
const app = require('../index').app; 
// Let's assume makeID is available via app.locals for robust stubbing.
// If not, this stub won't work as intended.
// const makeIDOriginal = app.locals.makeID; // Example if it were on app.locals

describe('POST /uploadPotholePicture', () => {
  let verifySessionCookieStub;
  let decodeImageStub;
  let loadImageClassificationStub;
  let mockModel;
  let classifyStub;
  let bucketUploadStub;
  let readFileSyncStub;
  let tmpdirStub;

  const mockUid = 'test-user-uid';
  const mockDecodedClaims = { uid: mockUid, email: 'user@example.com' };
  const dummyImagePath = path.join(__dirname, 'test-image.jpg');
  const mockTmpDir = '/tmp/mock-spot-the-hole';
  const mockUploadedFilename = 'test-image.jpg';
  const mockTmpFilePath = path.join(mockTmpDir, mockUploadedFilename);

  beforeEach(() => {
    verifySessionCookieStub = sinon.stub(admin.auth(), 'verifySessionCookie');
    decodeImageStub = sinon.stub(tfnode.node, 'decodeImage');
    
    mockModel = { classify: sinon.stub() };
    classifyStub = mockModel.classify;
    loadImageClassificationStub = sinon.stub(automl, 'loadImageClassification').resolves(mockModel);
    
    const mockBucket = { upload: sinon.stub() };
    sinon.stub(admin.storage(), 'bucket').returns(mockBucket);
    bucketUploadStub = mockBucket.upload;

    readFileSyncStub = sinon.stub(fs, 'readFileSync');
    tmpdirStub = sinon.stub(os, 'tmpdir').returns(mockTmpDir);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should redirect to /signOut if user is unauthenticated', (done) => {
    verifySessionCookieStub.rejects(new Error('Session cookie verification failed'));
    request(app)
      .post('/uploadPotholePicture')
      .attach('file', dummyImagePath)
      .set('Cookie', '__session=invalidOrExpiredMockSessionCookie')
      .expect(302)
      .end((err, res) => {
        if (err) return done(err);
        expect(verifySessionCookieStub.calledOnce).to.be.true;
        expect(loadImageClassificationStub.called).to.be.false;
        expect(bucketUploadStub.called).to.be.false;
        expect(res.headers.location).to.equal('/signOut');
        done();
      });
  });

  it('should upload image and redirect to /report if prediction > 0.85', (done) => {
    verifySessionCookieStub.resolves(mockDecodedClaims);
    readFileSyncStub.withArgs(mockTmpFilePath).returns(Buffer.from('dummy image data'));
    decodeImageStub.returns(sinon.stub()); 
    classifyStub.resolves([{ prob: 0.9, className: 'Pothole' }]);

    const mockMediaLink = 'https://storage.googleapis.com/mock-bucket/mock-image.jpg';
    const mockFileObj = { metadata: { mediaLink: mockMediaLink, name: `potholes/${mockUploadedFilename}` } };
    bucketUploadStub.callsFake((localPath, options, callback) => {
      callback(null, mockFileObj, mockFileObj.metadata);
    });

    request(app)
      .post('/uploadPotholePicture')
      .attach('file', dummyImagePath, 'test-image.jpg')
      .set('Cookie', '__session=validMockSessionCookie')
      .expect(302)
      .end((err, res) => {
        if (err) return done(err);
        expect(verifySessionCookieStub.calledOnce).to.be.true;
        expect(tmpdirStub.called).to.be.true;
        expect(readFileSyncStub.calledWith(mockTmpFilePath)).to.be.true;
        expect(decodeImageStub.calledOnce).to.be.true;
        expect(loadImageClassificationStub.calledOnce).to.be.true;
        expect(classifyStub.calledOnce).to.be.true;
        expect(bucketUploadStub.calledOnce).to.be.true;
        const expectedDestination = `potholes/${mockUploadedFilename}`;
        expect(bucketUploadStub.getCall(0).args[1].destination).to.equal(expectedDestination);
        expect(res.headers.location).to.equal(`/report?image=${encodeURIComponent(mockMediaLink)}`);
        done();
      });
  });

  it('should redirect to /cameraCaptureRetry if prediction <= 0.85', (done) => {
    verifySessionCookieStub.resolves(mockDecodedClaims);
    readFileSyncStub.withArgs(mockTmpFilePath).returns(Buffer.from('dummy image data'));
    decodeImageStub.returns(sinon.stub());
    classifyStub.resolves([{ prob: 0.7, className: 'Not Pothole' }]);

    request(app)
      .post('/uploadPotholePicture')
      .attach('file', dummyImagePath, 'test-image.jpg')
      .set('Cookie', '__session=validMockSessionCookie')
      .expect(302)
      .end((err, res) => {
        if (err) return done(err);
        expect(verifySessionCookieStub.calledOnce).to.be.true;
        expect(readFileSyncStub.calledOnce).to.be.true;
        expect(decodeImageStub.calledOnce).to.be.true;
        expect(loadImageClassificationStub.calledOnce).to.be.true;
        expect(classifyStub.calledOnce).to.be.true;
        expect(bucketUploadStub.called).to.be.false;
        expect(res.headers.location).to.equal('/cameraCaptureRetry');
        done();
      });
  });

  it('should return 503 and render errors/modelNotDeployed if AutoML model error (code 9)', (done) => {
    verifySessionCookieStub.resolves(mockDecodedClaims);
    readFileSyncStub.withArgs(mockTmpFilePath).returns(Buffer.from('dummy image data'));
    decodeImageStub.returns(sinon.stub());

    const modelError = new Error('Model not found'); modelError.code = 9;
    loadImageClassificationStub.rejects(modelError);

    app.set('view engine', 'ejs'); 
    app.set('views', './views');  

    request(app)
      .post('/uploadPotholePicture')
      .attach('file', dummyImagePath, 'test-image.jpg')
      .set('Cookie', '__session=validMockSessionCookie')
      .expect(503)
      .end((err, res) => {
        if (err) return done(err);
        expect(verifySessionCookieStub.calledOnce).to.be.true;
        expect(loadImageClassificationStub.calledOnce).to.be.true;
        expect(bucketUploadStub.called).to.be.false;
        expect(res.text).to.include('Model Not Deployed');
        done();
      });
  });
  
  it('should not redirect to /report and log error if GCS upload fails', (done) => {
    verifySessionCookieStub.resolves(mockDecodedClaims);
    readFileSyncStub.withArgs(mockTmpFilePath).returns(Buffer.from('dummy image data'));
    decodeImageStub.returns(sinon.stub());
    classifyStub.resolves([{ prob: 0.9, className: 'Pothole' }]);

    const gcsError = new Error('GCS upload failed');
    bucketUploadStub.callsFake((localPath, options, callback) => {
      callback(gcsError, null, null);
    });

    const consoleErrorSpy = sinon.spy(console, 'error');

    request(app)
      .post('/uploadPotholePicture')
      .attach('file', dummyImagePath, 'test-image.jpg')
      .set('Cookie', '__session=validMockSessionCookie')
      .expect((res) => { 
        if (res.status === 302 && res.headers.location.startsWith('/report')) {
          throw new Error('Should not redirect to /report on GCS error');
        }
      })
      .end((err, res) => { 
        expect(verifySessionCookieStub.calledOnce).to.be.true;
        expect(classifyStub.calledOnce).to.be.true;
        expect(bucketUploadStub.calledOnce).to.be.true;
        expect(consoleErrorSpy.calledWith('Error uploading to GCS:', gcsError)).to.be.true;
        consoleErrorSpy.restore();
        done();
      });
  });
});

describe('POST /submitReport', () => {
  let verifySessionCookieStub;
  let axiosPostStub;
  let firestoreSetStub;
  let sentimentPolarityScoresStub;
  let makeIDStub; // To control generated IDs

  const mockUid = 'test-user-uid-submit';
  const mockDecodedClaims = { uid: mockUid, email: 'user-submit@example.com', name: 'Test User' };
  const fixedPotholeId = 'fixed-pothole-id-123';

  beforeEach(() => {
    verifySessionCookieStub = sinon.stub(admin.auth(), 'verifySessionCookie');
    axiosPostStub = sinon.stub(axios, 'post');
    
    // Mock Firestore
    const mockDoc = { set: sinon.stub().resolves() };
    const mockCollection = { doc: sinon.stub().returns(mockDoc) };
    sinon.stub(admin.firestore(), 'collection').returns(mockCollection);
    firestoreSetStub = mockDoc.set; // This is the actual set stub we'll assert against

    sentimentPolarityScoresStub = sinon.stub(vader.SentimentIntensityAnalyzer, 'polarity_scores');

    // Mock makeID - assuming it's exported or attached to app.locals for robust testing
    // If makeID is a true global function in index.js, this might not work.
    // For this test, we'll assume it's on app.locals.makeID or similar.
    // If not, tests will use dynamic IDs.
    if (app.locals && app.locals.makeID) {
      makeIDStub = sinon.stub(app.locals, 'makeID').returns(fixedPotholeId);
    } else {
      // Fallback: if makeID is not easily stubbable, we can't guarantee fixed IDs.
      // This is a placeholder to acknowledge the intent to mock makeID.
      // One could also try to stub a global function if the test runner allows:
      // global.makeID = sinon.stub().returns(fixedPotholeId); // This is often not reliable
      // For now, we'll assume the ID will be generated and we'll capture it if possible,
      // or make assertions on paths without the specific ID if it's purely internal.
      // The prompt assumes makeID can be mocked. Let's write the test as if it is.
      // If `index.js` has `function makeID()`, it's hard. If `global.makeID = function()`, it's possible.
      // Let's assume the latter for the sake of the prompt.
      global.makeID = sinon.stub().returns(fixedPotholeId);
    }
  });

  afterEach(() => {
    sinon.restore();
    if (global.makeID && global.makeID.restore) { // Clean up global stub if we created one
      global.makeID.restore();
    }
  });

  const reportData = {
    latitude: '10.12345',
    longitude: '76.54321',
    imageURL: 'https://example.com/pothole.jpg',
    description: 'Big pothole on main street',
  };

  it('should redirect to /signOut if user is unauthenticated', (done) => {
    verifySessionCookieStub.rejects(new Error('Session cookie verification failed'));

    request(app)
      .post('/submitReport')
      .send(reportData)
      .set('Cookie', '__session=invalidCookie')
      .expect(302)
      .end((err, res) => {
        if (err) return done(err);
        expect(verifySessionCookieStub.calledOnce).to.be.true;
        expect(axiosPostStub.called).to.be.false;
        expect(firestoreSetStub.called).to.be.false;
        expect(res.headers.location).to.equal('/signOut');
        done();
      });
  });

  it('should successfully submit report and redirect to /dashboard', (done) => {
    verifySessionCookieStub.resolves(mockDecodedClaims);
    axiosPostStub.resolves({
      data: {
        results: [{ address_components: [{ types: ['locality'], long_name: 'Test City' }] }],
        plus_code: { global_code: '7MVRCFMX+QG' }, // Example global code
      },
    });
    sentimentPolarityScoresStub.withArgs(reportData.description).returns({ neg: 0.1, neu: 0.8, pos: 0.1, compound: 0.0 });
    // All firestore set calls are mocked to resolve by the main firestoreSetStub

    request(app)
      .post('/submitReport')
      .send(reportData)
      .set('Cookie', '__session=validCookie')
      .expect(302)
      .end((err, res) => {
        if (err) return done(err);

        expect(verifySessionCookieStub.calledOnce).to.be.true;
        expect(axiosPostStub.calledOnce).to.be.true;
        // Verify axios URL and params (key might be from process.env, check actual implementation)
        const expectedMapsUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${reportData.latitude},${reportData.longitude}&key=${process.env.GOOGLE_MAPS_API_KEY_PROD}`;
        expect(axiosPostStub.getCall(0).args[0]).to.equal(expectedMapsUrl);
        
        expect(sentimentPolarityScoresStub.calledOnceWith(reportData.description)).to.be.true;
        
        // Assert Firestore calls
        // Path 1: users/<uid>/potholes/<generated_id>
        expect(firestoreSetStub.getCall(0).thisValue.parent.parent.path).to.equal(`users/${mockUid}/potholes`);
        expect(firestoreSetStub.getCall(0).thisValue.id).to.equal(fixedPotholeId); // Check if generated_id matches
        const userPotholeData = firestoreSetStub.getCall(0).args[0];
        expect(userPotholeData.imageURL).to.equal(reportData.imageURL);
        expect(userPotholeData.description).to.equal(reportData.description);
        expect(userPotholeData.uid).to.equal(mockUid);
        expect(userPotholeData.locality).to.equal('Test City');
        expect(userPotholeData.globalCode).to.equal('7MVRCFMX+QG');
        expect(userPotholeData.sentiment).to.equal(0.1); // neg score
        expect(userPotholeData.status).to.equal('pending');
        expect(userPotholeData).to.have.property('timestamp');
        expect(userPotholeData).to.have.property('id').that.equals(fixedPotholeId);

        // Path 2: exactLocation/<locality> (this is a general doc, not pothole specific)
        // The code actually does: db.collection("exactLocation").doc(locality).collection("potholes").doc(id).set(...)
        // And: db.collection("potholes").doc(id).set(...)
        // And: db.collection("locality").doc(locality).set({ count: admin.firestore.FieldValue.increment(1) }, { merge: true });

        // Call for `potholes/<id>`
        const generalPotholeCall = firestoreSetStub.getCalls().find(call => call.thisValue.parent.path === 'potholes');
        expect(generalPotholeCall.thisValue.id).to.equal(fixedPotholeId);
        // (data is similar to userPotholeData, can add more specific checks if needed)

        // Call for `exactLocation/<locality>/potholes/<id>`
        const exactLocationPotholeCall = firestoreSetStub.getCalls().find(call => call.thisValue.parent.parent.path === `exactLocation/Test City/potholes`);
        expect(exactLocationPotholeCall.thisValue.id).to.equal(fixedPotholeId);
        // (data is similar, can add checks)
        
        // Call for `locality/<locality>`
        const localityCountCall = firestoreSetStub.getCalls().find(call => call.thisValue.parent.path === 'locality');
        expect(localityCountCall.thisValue.id).to.equal('Test City');
        expect(localityCountCall.args[0]).to.deep.equal({ count: admin.firestore.FieldValue.increment(1) });
        expect(localityCountCall.args[1]).to.deep.equal({ merge: true });

        expect(firestoreSetStub.callCount).to.equal(4); // users/.../potholes, potholes/, exactLocation/.../potholes, locality/
        
        expect(res.headers.location).to.equal('/dashboard');
        done();
      });
  });

  it('should return "Error" if Google Maps API call fails', (done) => {
    verifySessionCookieStub.resolves(mockDecodedClaims);
    axiosPostStub.rejects(new Error('Google Maps API error'));

    request(app)
      .post('/submitReport')
      .send(reportData)
      .set('Cookie', '__session=validCookie')
      .expect(200) // Endpoint sends "Error" with 200 OK
      .end((err, res) => {
        if (err) return done(err);
        expect(verifySessionCookieStub.calledOnce).to.be.true;
        expect(axiosPostStub.calledOnce).to.be.true;
        expect(firestoreSetStub.called).to.be.false;
        expect(res.text).to.equal('Error');
        done();
      });
  });

  it('should return "Error" if Firestore set fails for user pothole', (done) => {
    verifySessionCookieStub.resolves(mockDecodedClaims);
    axiosPostStub.resolves({ /* ... successful maps response ... */ 
        data: {
            results: [{ address_components: [{ types: ['locality'], long_name: 'Test City' }] }],
            plus_code: { global_code: '7MVRCFMX+QG' },
        }
    });
    sentimentPolarityScoresStub.returns({ neg: 0.1 });

    // Mock only the first firestore call to fail
    // Need to be more specific about which firestore call fails.
    // The stub `firestoreSetStub` will apply to all `doc.set` calls.
    // To make only the first one fail:
    firestoreSetStub.onFirstCall().rejects(new Error('Firestore set error'));
    // Subsequent calls will use the default behavior (resolves, as set in beforeEach for mockDoc.set)

    request(app)
      .post('/submitReport')
      .send(reportData)
      .set('Cookie', '__session=validCookie')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(verifySessionCookieStub.calledOnce).to.be.true;
        expect(axiosPostStub.calledOnce).to.be.true;
        expect(firestoreSetStub.calledOnce).to.be.true; // Only the first call that fails
        expect(res.text).to.equal('Error');
        done();
      });
  });
});
