const functions = require("firebase-functions"),
	express = require("express"),
	app = express(),
	bodyParser = require("body-parser"),
	admin = require("firebase-admin"),
	cookieParser = require("cookie-parser"),
	Busboy = require("busboy"),
	path = require("path"),
	os = require("os"),
	fs = require("fs"),
	vader = require("vader-sentiment"),
	{ PredictionServiceClient } = require("@google-cloud/automl").v1,
	morgan = require("morgan"),
	axios = require("axios");

/*=============================================>>>>>

				= init and config =

===============================================>>>>>*/

admin.initializeApp({
	credential: admin.credential.applicationDefault(),
	storageBucket: process.env.GCLOUD_PROJECT + ".appspot.com",
});
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(
	bodyParser.urlencoded({
		extended: true,
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
				encoding: contentType.parse(req).parameters.charset,
			},
			(err, string) => {
				if (err) return next(err);
				req.rawBody = string;
				return next();
			}
		);
	} else {
		next();
		return;
	}
});

app.use((req, res, next) => {
	if (
		req.method === "POST" &&
		req.headers["content-type"].startsWith("multipart/form-data")
	) {
		const busboy = new Busboy({
			headers: req.headers,
		});
		let fileBuffer = new Buffer("");
		req.files = {
			file: [],
		};

		busboy.on("field", (fieldname, value) => {
			req.body[fieldname] = value;
		});

		busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
			var saveTo = path.join(os.tmpdir(), path.basename(fieldname));
			file.pipe(fs.createWriteStream(saveTo));
			file.on("data", (data) => {
				fileBuffer = Buffer.concat([fileBuffer, data]);
			});

			file.on("end", () => {
				const file_object = {
					fieldname,
					originalname: filename,
					encoding,
					mimetype,
					buffer: fileBuffer,
				};
				req.files.file.push(file_object);
			});
		});

		busboy.on("finish", () => {
			next();
		});

		busboy.end(req.rawBody);
		req.pipe(busboy);
	} else {
		next();
		return;
	}
});
app.use(cookieParser());
app.set("views", "./views");
app.set("view engine", "ejs");
const client = new PredictionServiceClient();
const db = admin.firestore();
const storage = admin.storage();

/*=============================================>>>>>

				= security functions =

===============================================>>>>>*/

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
			console.error(
				"\n\nIn checkCookieMiddleware(), catch:\n\n",
				error,
				"\n\n"
			);
			res.redirect("/signOut");
		});
}

function setCookie(idToken, res, isNewUser) {
	const expiresIn = 60 * 60 * 24 * 7 * 1000;
	admin
		.auth()
		.createSessionCookie(idToken, {
			expiresIn,
		})
		.then(
			(sessionCookie) => {
				const options = {
					maxAge: expiresIn,
					httpOnly: true,
					secure: true,
					SameSite: "Strict",
				};
				res.cookie("__session", sessionCookie, options);
				return verifyIdToken();
			},
			(error) => {
				console.error(
					"\n\nIn sessionCookie, catch:\n\n",
					error,
					"\n\n"
				);
				res.status(401).render("errors/401");
			}
		)
		.catch((error) => {
			console.error(
				"\n\nIn createSessionCookie(), catch:\n\n",
				error,
				"\n\n"
			);
		});
	function verifyIdToken() {
		admin
			.auth()
			.verifyIdToken(idToken)
			.then((decodedClaims) => {
				if (isNewUser === "true") {
					res.redirect("/dashboard");
					return console.info(
						"\n\nNew user has been verified with\n\n",
						decodedClaims,
						"\n\n"
					);
				} else if (isNewUser === "false") {
					res.redirect("/dashboard");
					return console.info(
						"\n\nExisting user has been verified with\n\n",
						decodedClaims,
						"\n\n"
					);
				} else {
					return console.error(
						"\n\nisNewUser param not set for\n\n",
						decodedClaims,
						"\n\n"
					);
				}
			})
			.catch((error) => {
				console.error(
					"\n\nIn verifyIdToken(), catch:\n\n",
					error,
					"\n\n"
				);
			});
	}
}

function makeID(length) {
	var result = "";
	var characters =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result += characters.charAt(
			Math.floor(Math.random() * charactersLength)
		);
	}
	return result;
}

/*=============================================>>>>>

				= AutoML =

===============================================>>>>>*/

function base64_encode(file) {
	// read binary data
	var bitmap = fs.readFileSync(file);
	// convert binary data to base64 encoded string
	return new Buffer(bitmap).toString("base64");
}

function AutoMLAPI(content) {
	async function predict() {
		const request = {
			name: client.modelPath(
				"spot-the-hole",
				"us-central1",
				"ICN4586489609965273088"
			),
			payload: {
				image: {
					imageBytes: content,
				},
			},
		};
		const [response] = await client.predict(request);
		return response.payload;
	}
	return predict();
}
/*=============================================>>>>>

				= Vader =

===============================================>>>>>*/

function vader_analysis(input) {
	return vader.SentimentIntensityAnalyzer.polarity_scores(input);
}

/*=============================================>>>>>

				= basic routes =

===============================================>>>>>*/

app.get("/", (req, res) => {
	if (req.cookies.__session) {
		res.redirect("/dashboard");
	} else {
		res.redirect("/login");
	}
});
app.get("/dashboard", checkCookieMiddleware, (req, res) => {
	var i = 0,
		potholeData = new Array(),
		potholeID = new Array();
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
			console.info("\n\n Accessing dashboard:\n\n", user, "\n\n");
			return res.render("dashboard", {
				user,
				potholesData,
				potholesID,
			});
		})
		.catch((err) => {
			console.error(
				"\n\nDashboard - error getting potholes:\n\n",
				err,
				"\n\n"
			);
			res.redirect("/login");
		});
});
app.get("/adminDashboard", checkCookieMiddleware, (req, res) => {
	var i = 0,
		globalCode = new Array();
	db.collection("globalCodes")
		.get()
		.then((snapshot) => {
			snapshot.forEach((doc) => {
				globalCode[i] = doc.id;
				i++;
			});
			globalCodes = Object.assign({}, globalCode);
			console.log(globalCodes);
			return res.render("adminDashboard", { globalCodes });
		})
		.catch((err) => {
			console.error(
				"\n\nAdmin Dashboard - error getting globalCodes:\n\n",
				err,
				"\n\n"
			);
		});
});
app.get("/potholesByLocation", checkCookieMiddleware, (req, res) => {
	var i = 0,
		potholeData = new Array(),
		potholeID = new Array();
	db.collection("globalCodes")
		.doc(req.query.globalCode.split(" ").join("+"))
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
			console.log("\n\n\n", user);
			db.collection("globalCodes")
				.doc(req.query.globalCode.split(" ").join("+"))
				.get()
				.then((querySnapshot) => {
					rating = querySnapshot.data().rating;
					return res.render("potholesByLocation", {
						user,
						potholesData,
						potholesID,
						rating,
					});
				})
				.catch((err) => {
					console.log(`Error getting rating for ${globalCode}`, err);
				});
			console.log(rating);
			return;
		})
		.catch((err) => {
			console.log("Error getting potholes", err);
		});
});
app.get("/heatmap", checkCookieMiddleware, (req, res) => {
	var i = 0,
		potholeData = new Array();
	db.collectionGroup("potholes")
		.get()
		.then((querySnapshot) => {
			querySnapshot.forEach((childSnapshot) => {
				potholeData[i] = childSnapshot.data();
				i++;
			});
			potholesData = Object.assign({}, potholeData);
			user = Object.assign({}, req.decodedClaims);
			console.log("\n\n\n", user);
			db.collection("globalCodes")
				.get()
				.then((snapshot) => {
					snapshot.forEach((doc) => {
						potholeData.forEach((element) => {
							if (element.globalCode === doc.id) {
								element.rating = doc.data().rating;
							}
						});
					});
					return res.render("heatmap", {
						user,
						potholesData,
					});
				})
				.catch((err) => {
					console.log(`Error getting rating`, err);
					res.send("Error occured");
				});
			return;
		})
		.catch((err) => {
			console.log("Error getting pothole data", err);
			res.send("Error occured");
		});
});
app.post("/setRating", checkCookieMiddleware, (req, res) => {
	db.collection("globalCodes")
		.doc(req.body.globalCode)
		.update({ rating: req.body.rating })
		.then(res.status(200).send("Set"))
		.catch((err) => {
			console.log(
				`Error setting ${req.body.globalCode} to ${req.body.rating}`,
				err
			);
			res.status(500).send("Error");
		});
});
app.get("/offline", (req, res) => {
	res.render("offline");
});

/*=============================================>>>>>

				= legal routes =

===============================================>>>>>*/

app.get("/EULA", (req, res) => {
	res.render("legal/EULA");
});
app.get("/disclaimer", (req, res) => {
	res.render("legal/disclaimer");
});
app.get("/privacyPolicy", (req, res) => {
	res.render("legal/privacyPolicy");
});
app.get("/termsConditions", (req, res) => {
	res.render("legal/termsConditions");
});

/*=============================================>>>>>

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
app.get("/uid", checkCookieMiddleware, (req, res) => {
	res.send(req.decodedClaims.uid);
});
app.post("/onLogin", (req, res) => {
	admin
		.auth()
		.verifyIdToken(req.body.idToken, true)
		.then((decodedToken) => {
			admin
				.auth()
				.getUser(decodedToken.uid)
				.then((userRecord) => {
					console.log(
						"Successfully fetched user data:",
						userRecord.toJSON()
					);
					if (userRecord.phoneNumber && userRecord.emailVerified) {
						return res.send({
							path: "/dashboard",
						});
					} else if (!userRecord.emailVerified) {
						return res.send({
							path: "/emailVerification",
						});
					} else {
						return res.send({
							path: "/updateProfile",
						});
					}
				})
				.catch((error) => {
					console.log("Error fetching user data:", error);
					res.send("/login");
				});
			return;
		})
		.catch((error) => {
			console.error(error);
			res.send("/login");
		});
});
app.get("/emailVerification", (req, res) => {
	res.render("emailVerification");
});
app.get("/updateProfile", (req, res) => {
	res.render("updateProfile");
});
app.post("/onUpdateProfile", (req, res) => {
	admin
		.auth()
		.updateUser(req.body.uid, {
			phoneNumber: "+91" + req.body.phoneNumber,
			password: req.body.password,
			displayName: req.body.firstName + " " + req.body.lastName,
			photoURL: req.body.photoURL,
		})
		.then((userRecord) => {
			console.log("Successfully updated user", userRecord.toJSON());
			return res.redirect("/login");
		})
		.catch((error) => {
			console.log("Error updating user:", error);
		});
});

/*=============================================>>>>>

			= AutoML routes =

===============================================>>>>>*/

app.get("/cameraCapture", checkCookieMiddleware, (req, res) => {
	user = Object.assign({}, req.decodedClaims);
	console.info("\n\n Accessing cameraCapture:\n\n", user, "\n\n");
	res.render("cameraCapture", {
		user,
	});
});
app.get("/cameraCaptureRetry", checkCookieMiddleware, (req, res) => {
	res.render("cameraCaptureRetry");
});
app.post("/uploadPotholePicture", checkCookieMiddleware, (req, res) => {
	var base64str = base64_encode(
		path.join(os.tmpdir(), path.basename(req.files.file[0].fieldname))
	);
	AutoMLAPI(base64str)
		.then((prediction) => {
			console.info(
				"\n\nPrediction result is:\n\n",
				prediction[0],
				"\n\n"
			);
			if (
				prediction[0].displayName === "pothole" &&
				prediction[0].classification.score >= 0.93
			) {
				storage.bucket().upload(
					path.join(
						os.tmpdir(),
						path.basename(req.files.file[0].fieldname)
					),
					{
						destination:
							"potholePictures/" +
							req.decodedClaims.uid +
							"/" +
							req.files.file[0].originalname,
						public: true,
						metadata: {
							contentType: req.files.file[0].mimetype,
							cacheControl: "public, max-age=300",
						},
					},
					(err, file) => {
						if (err) {
							console.log(err);
							return;
						}
						console.log(file.metadata);
						var pictureData = {
							photo: file.metadata.mediaLink,
						};
						string = encodeURIComponent(file.metadata.mediaLink);
						res.redirect("/report?image=" + string);
					}
				);
			} else return res.redirect("/cameraCaptureRetry");
			return null;
		})
		.catch((error) => {
			console.log("Error is:", error);
		});
});

/*=============================================>>>>>

				= Report =

===============================================>>>>>*/
app.get("/report", checkCookieMiddleware, (req, res) => {
	console.log("\n\n\n", req.query.image);
	res.render("report", {
		pothole: req.query.image,
	});
});
app.post("/submitReport", checkCookieMiddleware, (req, res) => {
	console.log(req.body.latitude);
	console.log(req.body.longitude);
	axios
		.post("https://maps.googleapis.com/maps/api/geocode/json", null, {
			params: {
				latlng: `${req.body.latitude},${req.body.longitude}`,
				key: "AIzaSyB1x605iH6saTC_1U8L1VMwdWbNsEIIZj8",
			},
		})
		.then((response) => {
			var obj = {};
			console.log("\n\n", response.data.results[0]);
			response.data.results[0].address_components.forEach((element) => {
				if (
					element.types[0] === "street_address" ||
					element.types[1] === "street_address"
				)
					obj.street_address = element.long_name;
				else if (
					element.types[0] === "route" ||
					element.types[1] === "route"
				)
					obj.route = element.long_name;
				else if (
					element.types[0] === "intersection" ||
					element.types[1] === "intersection"
				)
					obj.intersection = element.long_name;
				else if (
					element.types[0] === "administrative_area_level_5" ||
					element.types[1] === "administrative_area_level_5"
				)
					obj.administrative_area_level_5 = element.long_name;
				else if (
					element.types[0] === "administrative_area_level_4" ||
					element.types[1] === "administrative_area_level_4"
				)
					obj.administrative_area_level_4 = element.long_name;
				else if (
					element.types[0] === "administrative_area_level_3" ||
					element.types[1] === "administrative_area_level_3"
				)
					obj.administrative_area_level_3 = element.long_name;
				else if (
					element.types[0] === "administrative_area_level_2" ||
					element.types[1] === "administrative_area_level_2"
				)
					obj.administrative_area_level_2 = element.long_name;
				else if (
					element.types[0] === "administrative_area_level_1" ||
					element.types[1] === "administrative_area_level_1"
				)
					obj.administrative_area_level_1 = element.long_name;
				else if (
					element.types[0] === "locality" ||
					element.types[1] === "locality"
				)
					obj.locality = element.long_name;
				else if (
					element.types[0] === "sublocality" ||
					element.types[1] === "sublocality"
				)
					obj.sublocality = element.long_name;
				else if (
					element.types[0] === "neighborhood" ||
					element.types[1] === "neighborhood"
				)
					obj.neighborhood = element.long_name;
				else if (
					element.types[0] === "premise" ||
					element.types[1] === "premise"
				)
					obj.premise = element.long_name;
				else if (
					element.types[0] === "subpremise" ||
					element.types[1] === "subpremise"
				)
					obj.subpremise = element.long_name;
				else if (
					element.types[0] === "postal_code" ||
					element.types[1] === "postal_code"
				)
					obj.postal_code = element.long_name;
			});
			// obj.globalCode = response.data.results[0].plus_code.global_code;
			obj.completeAddress = response.data.results[0].formatted_address;
			obj.placeID = response.data.results[0].place_id;
			obj.latitude = req.body.latitude;
			obj.longitude = req.body.longitude;
			obj.image = req.body.imageURL;
			obj.description = req.body.description;
			obj.globalCode = response.data.plus_code.global_code;
			obj.neg = vader_analysis(req.body.description).neg * 100;
			var ID = makeID(36);
			db.collection("users").doc(req.decodedClaims.uid).set({
				uid: req.decodedClaims.uid,
			});
			db.collection("users")
				.doc(req.decodedClaims.uid)
				.collection("potholes")
				.doc(ID)
				.set(obj);
			db.collection("globalCodes").doc(obj.globalCode).set({
				completeAddress: obj.completeAddress,
				rating: 50,
			});
			db.collection("globalCodes")
				.doc(obj.globalCode)
				.collection("potholes")
				.doc(ID)
				.set(obj);

			return res.redirect("/dashboard");
		})
		.catch((error) => {
			console.error(error);
			res.send("error");
		});
});
/*=============================================>>>>>

				= errors =

===============================================>>>>>*/

app.use((req, res) => {
	res.status(404).render("errors/404");
});

/*=============================================>>>>>

				= DO NOT PUT ANYTHING AFTER THIS =

===============================================>>>>>*/

exports.app = functions.https.onRequest(app);
