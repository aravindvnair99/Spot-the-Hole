const { response } = require("express");

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
	axios = require("axios");

/*=============================================>>>>>

				= init and config =

===============================================>>>>>*/

admin.initializeApp({
	credential: admin.credential.applicationDefault(),
	storageBucket: process.env.GCLOUD_PROJECT + ".appspot.com",
});
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
		return next();
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
			next();
			return;
		})
		.catch((error) => {
			console.log(error);
			res.redirect("/signOut");
		});
}

function setCookie(idToken, res, isNewUser) {
	const expiresIn = 60 * 60 * 24 * 5 * 1000;
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
					secure: false, //should be true in prod
				};
				res.cookie("__session", sessionCookie, options);
				admin
					.auth()
					.verifyIdToken(idToken)
					.then((decodedClaims) => {
						console.log("\n\n\n", isNewUser);
						if (isNewUser === "true") {
							res.redirect("/dashboard");
							return console.log(decodedClaims);
						} else {
							res.redirect("/dashboard");
							return console.log(decodedClaims);
						}
					})
					.catch((error) => {
						console.log(error);
					});
				return;
			},
			(error) => {
				console.log(error);
				res.status(401).send("UNAUTHORIZED REQUEST!");
			}
		)
		.catch((error) => {
			console.log(error);
		});
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
		// for (const annotationPayload of response.payload) {
		// 	console.log(
		// 		`Predicted class name: ${annotationPayload.displayName}`
		// 	);
		// 	console.log(
		// 		`Predicted class score: ${annotationPayload.classification.score}`
		// 	);
		// }
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

				= Other Functions =

===============================================>>>>>*/

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

				= basic routes =

===============================================>>>>>*/
app.get("/geocoding", (req, res) => {
	axios
		.post("https://maps.googleapis.com/maps/api/geocode/json", null, {
			params: {
				latlng: "40.714224,-73.961452",
				key: "AIzaSyABVaSmbAYEGC1kRnGs5bT82ybevf4_tn4",
			},
		})
		.then((response) => {
			obj = {
				globalCode: response.data.results[0].plus_code.global_code,
				completeAddress: response.data.results[0].formatted_address,
				placeID: response.data.results[0].place_id,
			};
			return res.send(obj);
		})
		.catch((error) => {
			console.log(error.response);
			res.send("   ");
		});
});

app.get("/trial", (req, res) => {
	response1 = {
		results: [
			{
				address_components: [
					{
						long_name: "1600",
						short_name: "1600",
						types: ["street_number"],
					},
					{
						long_name: "Amphitheatre Parkway",
						short_name: "Amphitheatre Pkwy",
						types: ["route"],
					},
					{
						long_name: "Mountain View",
						short_name: "Mountain View",
						types: ["locality", "political"],
					},
					{
						long_name: "Santa Clara County",
						short_name: "Santa Clara County",
						types: ["administrative_area_level_2", "political"],
					},
					{
						long_name: "California",
						short_name: "CA",
						types: ["administrative_area_level_1", "political"],
					},
					{
						long_name: "United States",
						short_name: "US",
						types: ["country", "political"],
					},
					{
						long_name: "94043",
						short_name: "94043",
						types: ["postal_code"],
					},
				],
				formatted_address:
					"1600 Amphitheatre Pkwy, Mountain View, CA 94043, USA",
				geometry: {
					location: {
						lat: 37.4223081,
						lng: -122.0846449,
					},
					location_type: "ROOFTOP",
					viewport: {
						northeast: {
							lat: 37.4236570802915,
							lng: -122.0832959197085,
						},
						southwest: {
							lat: 37.4209591197085,
							lng: -122.0859938802915,
						},
					},
				},
				place_id: "ChIJtYuu0V25j4ARwu5e4wwRYgE",
				plus_code: {
					compound_code: "CWC8+W4 Mountain View, CA, United States",
					global_code: "849VCWC8+W4",
				},
				types: ["street_address"],
			},
		],
		status: "OK",
	};
	var obj = {};
	response1.results[0].address_components.forEach((element) => {
		if (
			element.types[0] === "street_address" ||
			element.types[1] === "street_address"
		)
			obj.street_address = element.long_name;
		else if (element.types[0] === "route" || element.types[1] === "route")
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
	obj.globalCode = response1.results[0].plus_code.global_code;
	obj.completeAddress = response1.results[0].formatted_address;
	obj.placeID = response1.results[0].place_id;
	return res.send(obj);
});

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
			console.log("\n\n\n", user);
			return res.render("dashboard", {
				user,
				potholesData,
				potholesID,
			});
		})
		.catch((err) => {
			console.log("Error getting potholes", err);
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
			console.log("Error getting documents", err);
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
			console.log(error);
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
	res.render("cameraCapture");
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
			console.log(prediction[0]);
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
			return;
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
				key: "AIzaSyABVaSmbAYEGC1kRnGs5bT82ybevf4_tn4",
			},
		})
		.then((response) => {
			// console.log(response);
			// obj = {
			// 	latitude: req.body.latitude,
			// 	longitude: req.body.longitude,
			// 	image: req.body.imageURL,
			// 	description: req.body.description,
			// 	globalCode: response.data.plus_code.global_code,
			// 	completeAddress: response.data.results[0].formatted_address,
			// 	placeID: response.data.results[0].place_id,
			// 	neg: vader_analysis(req.body.description).neg * 100,
			// };
			// console.log(obj);
			var obj = {};
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
			console.log(error);
			res.send("error");
		});
});
/*=============================================>>>>>

				= errors =

===============================================>>>>>*/

app.use((req, res, next) => {
	res.status(404).render("404");
});
app.use((req, res, next) => {
	res.status(500).render("500");
});

/*=============================================>>>>>

				= DO NOT PUT ANYTHING AFTER THIS =

===============================================>>>>>*/

exports.app = functions.https.onRequest(app);
