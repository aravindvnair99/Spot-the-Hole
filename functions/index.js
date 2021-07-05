const functions = require("firebase-functions"),
	express = require("express"),
	app = express(),
	contentType = require("content-type"),
	getRawBody = require("raw-body"),
	admin = require("firebase-admin"),
	cookieParser = require("cookie-parser"),
	Busboy = require("busboy"),
	path = require("path"),
	os = require("os"),
	fs = require("fs"),
	vader = require("vader-sentiment"),
	axios = require("axios"),
	tfnode = require("@tensorflow/tfjs-node"),
	automl = require("@tensorflow/tfjs-automl"),
	slowDown = require("express-slow-down");
/* =============================================>>>>>

				= init and config =

===============================================>>>>>*/

admin.initializeApp({
	credential: admin.credential.applicationDefault(),
	storageBucket: process.env.GCLOUD_PROJECT + ".appspot.com"
});
app.enable("trust proxy");
app.use(
	slowDown({
		windowMs: 15 * 60 * 1000, // 15 minutes
		delayAfter: 100, // allow 100 requests per 15 minutes, then...
		delayMs: 500 // begin adding 500ms of delay per request above 100
	})
);
app.use(express.json());
app.use(
	express.urlencoded({
		extended: true
	})
);
app.use((req, res, next) => {
	if (
		req.rawBody === undefined &&
		req.method === "POST" &&
		req.headers["content-type"].startsWith("multipart/form-data")
	) {
		getRawBody(
			req,
			{
				length: req.headers["content-length"],
				limit: "10mb",
				encoding: contentType.parse(req).parameters.charset
			},
			(err, string) => {
				if (err) return next(err);
				req.rawBody = string;
				return next();
			}
		);
	} else {
		next();
	}
});

app.use((req, res, next) => {
	if (req.method === "POST" && req.headers["content-type"].startsWith("multipart/form-data")) {
		const busboy = new Busboy({
			headers: req.headers
		});
		let fileBuffer = Buffer.from("");
		req.files = {
			file: []
		};

		busboy.on("field", (fieldname, value) => {
			req.body[fieldname] = value;
		});

		busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
			const saveTo = path.join(os.tmpdir(), path.basename(fieldname));
			file.pipe(fs.createWriteStream(saveTo));
			file.on("data", (data) => {
				fileBuffer = Buffer.concat([fileBuffer, data]);
			});

			file.on("end", () => {
				const fileObject = {
					fieldname,
					originalname: filename,
					encoding,
					mimetype,
					buffer: fileBuffer
				};
				req.files.file.push(fileObject);
			});
		});

		busboy.on("finish", () => {
			next();
		});

		busboy.end(req.rawBody);
		req.pipe(busboy);
	} else {
		next();
	}
});
app.use(cookieParser());
app.set("views", "./views");
app.set("view engine", "ejs");
const db = admin.firestore(),
	storage = admin.storage();

/* =============================================>>>>>

				= security functions =

===============================================>>>>>*/

/**
 * Checking if request is authorised and linked to user account
 * @param {string} req Request from client
 * @param {string} res Response from server
 * @param {*} next Next function
 */
function checkCookieMiddleware(req, res, next) {
	const sessionCookie = req.cookies.__session || "";
	admin
		.auth()
		.verifySessionCookie(sessionCookie, true)
		.then((decodedClaims) => {
			req.decodedClaims = decodedClaims;
			return next();
		})
		.catch((error) => {
			console.error("\n\nIn checkCookieMiddleware(), catch:\n\n", error, "\n\n");
			res.redirect("/signOut");
		});
}
/**
 * Set cookie for session
 * @param {string} idToken ID Token
 * @param {string} res Response from server
 * @param {boolean} isNewUser New user or not
 */
function setCookie(idToken, res, isNewUser) {
	const expiresIn = 60 * 60 * 24 * 7 * 1000;
	admin
		.auth()
		.createSessionCookie(idToken, {
			expiresIn
		})
		.then(
			(sessionCookie) => {
				const options = {
					maxAge: expiresIn,
					httpOnly: true,
					secure: true,
					SameSite: "Strict"
				};
				res.cookie("__session", sessionCookie, options);
				return verifyIdToken();
			},
			(error) => {
				console.error("\n\nIn sessionCookie, catch:\n\n", error, "\n\n");
				res.status(401).render("errors/401");
			}
		)
		.catch((error) => {
			console.error("\n\nIn createSessionCookie(), catch:\n\n", error, "\n\n");
		});
	/**
	 * Verify the ID Token and redirect user accordingly.
	 */
	function verifyIdToken() {
		admin
			.auth()
			.verifyIdToken(idToken)
			.then((decodedClaims) => {
				if (isNewUser == "true") {
					res.redirect("/dashboard");
					return console.info(
						"\n\nNew user has been verified with\n\n",
						JSON.stringify(decodedClaims),
						"\n\n"
					);
				} else if (isNewUser == "false") {
					res.redirect("/dashboard");
					return console.info(
						"\n\nExisting user has been verified with\n\n",
						JSON.stringify(decodedClaims),
						"\n\n"
					);
				} else {
					return console.error("\n\nisNewUser param not set for\n\n", JSON.stringify(decodedClaims), "\n\n");
				}
			})
			.catch((error) => {
				console.error("\n\nIn verifyIdToken(), catch:\n\n", error, "\n\n");
			});
	}
}
/**
 * Random ID generator
 * @param {int} length Number of characters
 * @returns {string} Random string of given length
 */
function makeID(length) {
	let result = "";
	const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
		charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

/* =============================================>>>>>

				= basic routes =

===============================================>>>>>*/

app.get("/", (req, res) => {
	if (req.cookies.__session) {
		res.redirect("/dashboard");
	} else {
		res.render("index");
	}
});
app.get("/comingSoon", (_req, res) => {
	res.render("comingSoon");
});
app.get("/index", (_req, res) => {
	res.render("index");
});
app.get("/profile", checkCookieMiddleware, (req, res) => {
	let i = 0,
		user,
		potholesData,
		potholesID;
	const potholeData = [],
		potholeID = [];
	db.collection("users")
		.doc(req.decodedClaims.uid)
		.collection("potholes")
		.get()
		.then((querySnapshot) => {
			querySnapshot.forEach((childSnapshot) => {
				potholeID[i] = childSnapshot.id;
				potholeData[i] = childSnapshot.data();
				i++;
			});
			potholesData = Object.assign({}, potholeData);
			potholesID = Object.assign({}, potholeID);
			user = Object.assign({}, req.decodedClaims);
			console.info("\n\n Accessing profile:\n\n", JSON.stringify(user), "\n\n");
			return res.render("profile", {
				user,
				potholesData,
				potholesID
			});
		})
		.catch((err) => {
			console.error("\n\nProfile - error getting potholes:\n\n", err, "\n\n");
			res.redirect("/login");
		});
});
app.get("/dashboard", checkCookieMiddleware, (req, res) => {
	let i = 0,
		user,
		potholesData,
		potholesID;
	const potholeData = [],
		potholeID = [];
	db.collection("users")
		.doc(req.decodedClaims.uid)
		.collection("potholes")
		.get()
		.then((querySnapshot) => {
			querySnapshot.forEach((childSnapshot) => {
				potholeID[i] = childSnapshot.id;
				potholeData[i] = childSnapshot.data();
				i++;
			});
			potholesData = Object.assign({}, potholeData);
			potholesID = Object.assign({}, potholeID);
			user = Object.assign({}, req.decodedClaims);
			console.info("\n\n Accessing dashboard:\n\n", JSON.stringify(user), "\n\n");
			return res.render("dashboard", {
				user,
				potholesData,
				potholesID
			});
		})
		.catch((err) => {
			console.error("\n\nDashboard - error getting potholes:\n\n", err, "\n\n");
			res.redirect("/login");
		});
});
app.get("/locations", checkCookieMiddleware, (req, res) => {
	let i = 0,
		user,
		globalCodes;
	const globalCode = [];
	db.collection("exactLocation")
		.get()
		.then((snapshot) => {
			snapshot.forEach((doc) => {
				globalCode[i] = doc.id;
				i++;
			});
			globalCodes = Object.assign({}, globalCode);
			user = Object.assign({}, req.decodedClaims);
			console.info("\n\n Accessing locations:\n\n", JSON.stringify(user), "\n\n");
			return res.render("locations", {user, globalCodes});
		})
		.catch((err) => {
			console.error("\n\nLocations - error getting globalCodes:\n\n", err, "\n\n");
		});
});
app.get("/potholesByLocation", checkCookieMiddleware, (req, res) => {
	let i = 0,
		user,
		potholesID,
		potholesData;
	const potholeData = [],
		potholeID = [];
	console.log(req.query.globalCode + "\n"); // Switched to location name from globalCode
	db.collection("exactLocation")
		.doc(req.query.globalCode)
		.collection("potholes")
		.get()
		.then((querySnapshot) => {
			querySnapshot.forEach((childSnapshot) => {
				potholeID[i] = childSnapshot.id;
				potholeData[i] = childSnapshot.data();
				i++;
			});
			potholesData = Object.assign({}, potholeData);
			potholesID = Object.assign({}, potholeID);
			user = Object.assign({}, req.decodedClaims);
			console.info("\n\n Accessing potholesByLocation:\n\n", JSON.stringify(user), "\n\n");
			return getRating();
		})
		.catch((err) => {
			console.error("\n\npotholesByLocation - error getting potholes:\n\n", err, "\n\n");
		});
	/**
	 * Get rating for locations
	 */
	function getRating() {
		let rating;
		db.collection("exactLocation")
			.doc(req.query.globalCode)
			.get()
			.then((querySnapshot) => {
				rating = querySnapshot.data().rating;
				return res.render("potholesByLocation", {
					user,
					potholesData,
					potholesID,
					rating
				});
			})
			.catch((err) => {
				console.error(
					`\n\npotholesByLocation - error getting rating for ${req.query.globalCode}\n\n`,
					err,
					"\n\n"
				);
			});
	}
});
app.get("/heatmap", checkCookieMiddleware, (req, res) => {
	let i = 0,
		user,
		potholesData;
	const potholeData = [];
	db.collectionGroup("potholes")
		.get()
		.then((querySnapshot) => {
			querySnapshot.forEach((childSnapshot) => {
				potholeData[i] = childSnapshot.data();
				i++;
			});
			potholesData = Object.assign({}, potholeData);
			user = Object.assign({}, req.decodedClaims);
			console.info("\n\n Accessing heatmap:\n\n", JSON.stringify(user), "\n\n");
			return getRating();
		})
		.catch((err) => {
			console.error("\n\nheatmap - error getting pothole data:\n\n", err, "\n\n");
			res.send("Error getting pothole data");
		});
	/**
	 * Get location rating for plotting on heatmap
	 */
	function getRating() {
		db.collection("exactLocation")
			.get()
			.then((snapshot) => {
				snapshot.forEach((doc) => {
					potholeData.forEach((ele) => {
						console.log(ele);
						if (ele.locality === doc.id) {
							ele.rating = doc.data().rating;
						}
					});
				});
				return res.render("heatmap", {
					user,
					potholesData
				});
			})
			.catch((err) => {
				console.error("\n\nheatmap - error getting rating:\n\n", err, "\n\n");
				res.send("Error getting rating");
			});
	}
});
app.post("/setRating", checkCookieMiddleware, (req, res) => {
	db.collection("exactLocation")
		.doc(req.body.globalCode)
		.update({rating: req.body.rating})
		.then(res.status(200).send("Set"))
		.catch((err) => {
			console.error(`\n\nError setting ${req.body.globalCode} to ${req.body.rating}\n\n`, err);
			res.status(500).send("Error");
		});
});
app.get("/offline", (req, res) => {
	const user = Object.assign({}, req.decodedClaims);
	console.info("\n\n Accessing offline:\n\n", JSON.stringify(user), "\n\n");
	return res.render("offline", {
		user
	});
});

/* =============================================>>>>>

				= legal routes =

===============================================>>>>>*/

app.get("/FAQ", (req, res) => {
	res.render("legal/FAQ");
});
app.get("/privacyPolicy", (req, res) => {
	res.status(302).redirect("/FAQ");
});
app.get("/termsConditions", (req, res) => {
	res.status(302).redirect("/FAQ");
});

/* =============================================>>>>>

			= authentication routes =

===============================================>>>>>*/

app.get("/login", (req, res) => {
	if (req.cookies.__session) {
		res.redirect("/dashboard");
	} else {
		res.render("login");
	}
});
app.get("/sessionLogin", (req, res) => {
	setCookie(req.query.idToken, res, req.query.isNewUser);
});
app.get("/signOut", (req, res) => {
	res.clearCookie("__session");
	res.redirect("/login");
});
app.post("/onLogin", (req, res) => {
	admin
		.auth()
		.verifyIdToken(req.body.idToken, true)
		.then((decodedToken) => {
			return getUser(decodedToken);
		})
		.catch((error) => {
			console.error(error);
			res.send("/login");
		});
	/**
	 * Retrieve user info
	 * @param {object} decodedToken Decoded token
	 */
	function getUser(decodedToken) {
		admin
			.auth()
			.getUser(decodedToken.uid)
			.then((userRecord) => {
				console.log("Successfully fetched user data:", userRecord.toJSON());
				if (userRecord.phoneNumber && userRecord.emailVerified) {
					return res.send({
						path: "/dashboard"
					});
				} else if (!userRecord.emailVerified) {
					return res.send({
						path: "/emailVerification"
					});
				} else {
					return res.send({
						path: "/updateProfile"
					});
				}
			})
			.catch((error) => {
				console.log("Error fetching user data:", error);
				res.send("/login");
			});
	}
});
app.get("/emailVerification", (req, res) => {
	res.render("emailVerification");
});
app.get("/updateProfile", checkCookieMiddleware, (req, res) => {
	res.render("updateProfile");
});
app.post("/onUpdateProfile", checkCookieMiddleware, (req, res) => {
	admin
		.auth()
		.updateUser(req.body.uid, {
			phoneNumber: "+91" + req.body.phoneNumber,
			password: req.body.password,
			displayName: req.body.firstName + " " + req.body.lastName,
			photoURL: req.body.photoURL
		})
		.then((userRecord) => {
			console.log("Successfully updated user", userRecord.toJSON());
			return res.redirect("/login");
		})
		.catch((error) => {
			console.log("Error updating user:", error);
		});
});

/* =============================================>>>>>

			= AutoML routes =

===============================================>>>>>*/

app.get("/cameraCapture", checkCookieMiddleware, (req, res) => {
	const user = Object.assign({}, req.decodedClaims);
	console.info("\n\nAccessing cameraCapture:\n\n", JSON.stringify(user), "\n\n");
	res.render("cameraCapture", {
		user
	});
});
app.get("/cameraCaptureRetry", checkCookieMiddleware, (req, res) => {
	const user = Object.assign({}, req.decodedClaims);
	console.info("\n\nAccessing cameraCaptureRetry:\n\n", JSON.stringify(user), "\n\n");
	res.render("cameraCaptureRetry", {
		user
	});
});
app.post("/uploadPotholePicture", checkCookieMiddleware, (req, res) => {
	const user = Object.assign({}, req.decodedClaims);
	console.info("\n\nAccessing uploadPotholePicture:\n\n", JSON.stringify(user), "\n\n");
	console.log(path.join(os.tmpdir(), path.basename(req.files.file[0].originalname)));
	predictPotholes(req)
		.then(function (result) {
			console.log(result);
			if (result > 0.85) {
				storage.bucket().upload(
					path.join(os.tmpdir(), path.basename(req.files.file[0].fieldname)),
					{
						destination: "potholePictures/" + req.decodedClaims.uid + "/" + req.files.file[0].fieldname,
						public: true,
						gzip: true,
						resumable: false,
						metadata: {
							contentType: req.files.file[0].mimetype,
							cacheControl: "public, max-age=604800"
						}
					},
					(err, file) => {
						if (err) {
							console.error("\n\nuploadPotholePicture Google Cloud Storage error:\n\n", err, "\n\n");
							return;
						}
						console.info("\n\nGoogle Cloud Storage metadata:\n\n", file.metadata);
						res.redirect("/report?image=" + encodeURIComponent(file.metadata.mediaLink));
					}
				);
			} else {
				res.redirect("/cameraCaptureRetry");
			}
		})
		.catch((error) => {
			if (error.code === 9) {
				res.status(503).render("errors/modelNotDeployed");
			}
			console.error("\n\nuploadPotholePicture error:\n\n", error, "\n\n");
		});
});
/**
 * Predict if pothole or not using local AutoML
 * @param {object} req Request from client
 * @param {object} res Response from server
 * @returns {object} Prediction output
 */
async function predictPotholes(req) {
	console.log(req.files.file[0].fieldname);
	const modelUrl =
			"https://raw.githubusercontent.com/aravindvnair99/Spot-the-Hole/main/functions/tf_js-pothole_classification_edge/model.json",
		model = await automl.loadImageClassification(modelUrl),
		Buffer = await fs.readFileSync(path.join(os.tmpdir(), path.basename(req.files.file[0].fieldname)), ""),
		decodedImage = tfnode.node.decodeImage(Buffer, 3),
		predictions = await model.classify(decodedImage);
	console.log("classification results:", predictions);
	return Promise.resolve(predictions[0]["prob"]);
}

/* =============================================>>>>>

				= Report =

===============================================>>>>>*/
app.get("/report", checkCookieMiddleware, (req, res) => {
	const user = Object.assign({}, req.decodedClaims);
	console.info("\n\nAccessing report page for :", req.query.image, " by:\n\n", JSON.stringify(user), "\n\n");
	res.render("report", {
		pothole: req.query.image,
		user
	});
});
app.post("/submitReport", checkCookieMiddleware, (req, res) => {
	console.info(`\n\nLatitude received from user is ${req.body.latitude} and longitude is ${req.body.longitude}\n\n`);
	axios
		.post("https://maps.googleapis.com/maps/api/geocode/json", null, {
			params: {
				latlng: `${req.body.latitude},${req.body.longitude}`,
				key: "AIzaSyB1x605iH6saTC_1U8L1VMwdWbNsEIIZj8"
			}
		})
		.then((response) => {
			const obj = {};
			console.info("\n\nGoogle Maps Geocoding Response:\n\n", response.data.results[0], "\n\n");
			response.data.results[0].address_components.forEach((ele) => {
				if (ele.types[0] === "street_address" || ele.types[1] === "street_address") {
					obj.street_address = ele.long_name;
				} else if (ele.types[0] === "route" || ele.types[1] === "route") {
					obj.route = ele.long_name;
				} else if (ele.types[0] === "intersection" || ele.types[1] === "intersection") {
					obj.intersection = ele.long_name;
				} else if (
					ele.types[0] === "administrative_area_level_5" ||
					ele.types[1] === "administrative_area_level_5"
				) {
					obj.administrative_area_level_5 = ele.long_name;
				} else if (
					ele.types[0] === "administrative_area_level_4" ||
					ele.types[1] === "administrative_area_level_4"
				) {
					obj.administrative_area_level_4 = ele.long_name;
				} else if (
					ele.types[0] === "administrative_area_level_3" ||
					ele.types[1] === "administrative_area_level_3"
				) {
					obj.administrative_area_level_3 = ele.long_name;
				} else if (
					ele.types[0] === "administrative_area_level_2" ||
					ele.types[1] === "administrative_area_level_2"
				) {
					obj.administrative_area_level_2 = ele.long_name;
				} else if (
					ele.types[0] === "administrative_area_level_1" ||
					ele.types[1] === "administrative_area_level_1"
				) {
					obj.administrative_area_level_1 = ele.long_name;
				} else if (ele.types[0] === "locality" || ele.types[1] === "locality") {
					obj.locality = ele.long_name;
				} else if (ele.types[0] === "sublocality" || ele.types[1] === "sublocality") {
					obj.sublocality = ele.long_name;
				} else if (ele.types[0] === "neighborhood" || ele.types[1] === "neighborhood") {
					obj.neighborhood = ele.long_name;
				} else if (ele.types[0] === "premise" || ele.types[1] === "premise") {
					obj.premise = ele.long_name;
				} else if (ele.types[0] === "subpremise" || ele.types[1] === "subpremise") {
					obj.subpremise = ele.long_name;
				} else if (ele.types[0] === "postal_code" || ele.types[1] === "postal_code") {
					obj.postal_code = ele.long_name;
				}
			});
			obj.completeAddress = response.data.results[0].formatted_address;
			obj.placeID = response.data.results[0].place_id;
			obj.latitude = req.body.latitude;
			obj.longitude = req.body.longitude;
			obj.image = req.body.imageURL;
			obj.description = req.body.description;
			obj.globalCode = response.data.plus_code.global_code;
			obj.neg = vader.SentimentIntensityAnalyzer.polarity_scores(req.body.description).neg * 100;
			const ID = makeID(36);
			db.collection("users").doc(req.decodedClaims.uid).set({
				uid: req.decodedClaims.uid
			});
			db.collection("users").doc(req.decodedClaims.uid).collection("potholes").doc(ID).set(obj);
			db.collection("exactLocation").doc(obj.locality).set({
				globalCode: obj.globalCode,
				rating: 50
			});
			db.collection("exactLocation").doc(obj.locality).collection("potholes").doc(ID).set(obj);

			return res.redirect("/dashboard");
		})
		.catch((error) => {
			console.error("\n\nsubmitReport error:\n\n", error, "\n\n");
			res.send("Error");
		});
});
/* =============================================>>>>>

				= Coming Soon =

===============================================>>>>>*/

app.get("/notifications", checkCookieMiddleware, (req, res) => {
	res.status(302).redirect("/comingSoon");
});

/* =============================================>>>>>

				= errors =

===============================================>>>>>*/

app.use((req, res) => {
	res.status(404).render("errors/404");
});

exports.app = functions.https.onRequest(app);
