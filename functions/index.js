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
		let fileBuffer = Buffer.from("");
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
						JSON.stringify(decodedClaims),
						"\n\n"
					);
				} else if (isNewUser === "false") {
					res.redirect("/dashboard");
					return console.info(
						"\n\nExisting user has been verified with\n\n",
						JSON.stringify(decodedClaims),
						"\n\n"
					);
				} else {
					return console.error(
						"\n\nisNewUser param not set for\n\n",
						JSON.stringify(decodedClaims),
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

				= basic routes =

===============================================>>>>>*/

app.get("/", (req, res) => {
	if (req.cookies.__session) {
		res.redirect("/dashboard");
	} else {
		res.redirect("/login");
	}
});
app.get("/comingSoon", (req, res) => {
	res.render("comingSoon");
});
app.get("/profile", checkCookieMiddleware, (req, res) => {
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
			console.info(
				"\n\n Accessing profile:\n\n",
				JSON.stringify(user),
				"\n\n"
			);
			return res.render("profile", {
				user,
				potholesData,
				potholesID,
			});
		})
		.catch((err) => {
			console.error(
				"\n\nProfile - error getting potholes:\n\n",
				err,
				"\n\n"
			);
			res.redirect("/login");
		});
});
app.get("/dashboard", checkCookieMiddleware, (req, res) => {
	var i = 0,
		potholeData = new Array(),
		potholeID = new Array();

	/*	var GeocodePlacename; 
		db.collection("globalCodes")
		.get()
		.then((snapshot) => {
			snapshot.forEach((doc) => {
				GeocodePlacename = doc.data().completeAddress.split(' ').join('');
				if(String(doc.data().completeAddress).includes("/"))
				GeocodePlacename = GeocodePlacename.split('/').join('#');

				
				//adding the new collection and its first document with the locations actual name;
				 db.collection("locations").doc(GeocodePlacename).set({
					geocode: doc.id,
					rating: doc.data().rating
				})
				.then((docRef) => {


					console.log("Document written with ID: ", doc.id);


					//after adding the document get its reported potholes from inside the potholes collection in each geocode;

					db.collection("globalCodes").doc(doc.id).collection("potholes").get().then((snapshot1)=>{
						snapshot1.forEach((doc1)=>{
							console.log(doc1.id);
							db.collection("locations").doc(GeocodePlacename).collection("potholes").add({
							administrative_area_level_1: doc1.data().administrative_area_level_1,
							administrative_area_level_2: doc1.data().administrative_area_level_2,
							completeAddress: doc1.data().completeAddress,
							description: doc1.data().description,
							globalCode: doc1.data().globalCode,
							image: doc1.data().image,
							latitude: doc1.data().latitude,
							locality: doc1.data().locality,
							longitude: doc1.data().longitude,
							neg: doc1.data().neg,
							neighborhood: doc1.data().neighborhood,
							placeID: doc1.data().placeID,
							postal_code: doc1.data().postal_code,
							premise: doc1.data().premise,
							sublocality: doc1.data().sublocality
							}).then((success)=>{
								console.log(doc1.id);
								console.log("ALL DONE SUCCESS",success);
							}).catch((err)=>{
								console.log("The last write failed: \n",err);
							});

						});
					}).catch((err)=>{
						console.log("ERR ",err);
					});


				})
				.catch((error) => {
					console.error("Error adding document to locations: ", error);
				});		
			});
			
		}).catch((er)=>{
			console.log("First access db failed :\n",er);
		});*/

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
			console.info(
				"\n\n Accessing dashboard:\n\n",
				JSON.stringify(user),
				"\n\n"
			);
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
app.get("/locations", checkCookieMiddleware, (req, res) => {
	var i = 0,
		globalCode = new Array();
	db.collection("exactLocation")
		.get()
		.then((snapshot) => {
			snapshot.forEach((doc) => {
				globalCode[i] = doc.id;
				i++;
			});
			globalCodes = Object.assign({}, globalCode);
			user = Object.assign({}, req.decodedClaims);
			console.info(
				"\n\n Accessing locations:\n\n",
				JSON.stringify(user),
				"\n\n"
			);
			return res.render("locations", { user, globalCodes });
		})
		.catch((err) => {
			console.error(
				"\n\nLocations - error getting globalCodes:\n\n",
				err,
				"\n\n"
			);
		});
});
app.get("/potholesByLocation", checkCookieMiddleware, (req, res) => {
	var i = 0,
		potholeData = new Array(),
		potholeID = new Array();
	console.log("HEEEEEEEEEEEEEEEEEEEEEEERRREEEEEEEEEEEEE")
	console.log(req.query.globalCode+"\n");
	db.collection("exactLocation")
		.doc(req.query.globalCode.split(" ").join(""))
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
			console.info(
				"\n\n Accessing potholesByLocation:\n\n",
				JSON.stringify(user),
				"\n\n"
			);
			return getRating();
		})
		.catch((err) => {
			console.error(
				"\n\npotholesByLocation - error getting potholes:\n\n",
				err,
				"\n\n"
			);
		});
	function getRating() {
		db.collection("exactLocation")
			.doc(req.query.globalCode.split(" ").join(""))
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
				console.error(
					`\n\npotholesByLocation - error getting rating for ${globalCode}\n\n`,
					err,
					"\n\n"
				);
			});
	}
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
			console.info(
				"\n\n Accessing heatmap:\n\n",
				JSON.stringify(user),
				"\n\n"
			);
			return getRating();
		})
		.catch((err) => {
			console.error(
				"\n\nheatmap - error getting pothole data:\n\n",
				err,
				"\n\n"
			);
			res.send("Error getting pothole data");
		});
	function getRating() {
		db.collection("exactLocation")
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
				console.error(
					"\n\nheatmap - error getting rating:\n\n",
					err,
					"\n\n"
				);
				res.send("Error getting rating");
			});
	}
});
app.post("/setRating", checkCookieMiddleware, (req, res) => {
	db.collection("exactLocation")
		.doc(req.body.globalCode)
		.update({ rating: req.body.rating })
		.then(res.status(200).send("Set"))
		.catch((err) => {
			console.error(
				`\n\nError setting ${req.body.globalCode} to ${req.body.rating}\n\n`,
				err
			);
			res.status(500).send("Error");
		});
});
app.get("/offline", (req, res) => {
	user = Object.assign({}, req.decodedClaims);
	console.info("\n\n Accessing offline:\n\n", JSON.stringify(user), "\n\n");
	return res.render("offline", {
		user,
	});
});

/*=============================================>>>>>

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
	function getUser(decodedToken) {
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
	console.info(
		"\n\nAccessing cameraCapture:\n\n",
		JSON.stringify(user),
		"\n\n"
	);
	res.render("cameraCapture", {
		user,
	});
});
app.get("/cameraCaptureRetry", checkCookieMiddleware, (req, res) => {
	user = Object.assign({}, req.decodedClaims);
	console.info(
		"\n\nAccessing cameraCaptureRetry:\n\n",
		JSON.stringify(user),
		"\n\n"
	);
	res.render("cameraCaptureRetry", {
		user,
	});
});
app.post("/uploadPotholePicture", checkCookieMiddleware, (req, res) => {
	user = Object.assign({}, req.decodedClaims);
	console.info(
		"\n\nAccessing uploadPotholePicture:\n\n",
		JSON.stringify(user),
		"\n\n"
	);
	
		
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
						gzip: true,
						resumable: false,
						metadata: {
							contentType: req.files.file[0].mimetype,
							cacheControl: "public, max-age=604800",
						},
					},
					(err, file) => {
						if (err) {
							console.error(
								"\n\nuploadPotholePicture Google Cloud Storage error:\n\n",
								err,
								"\n\n"
							);
							return;
						}
						console.info(
							"\n\nGoogle Cloud Storage metadata:\n\n",
							file.metadata
						);
						res.redirect(
							"/report?image=" +
								encodeURIComponent(file.metadata.mediaLink)
						);
					}
				);
			
		
		
});

/*=============================================>>>>>

				= Report =

===============================================>>>>>*/
app.get("/report", checkCookieMiddleware, (req, res) => {
	user = Object.assign({}, req.decodedClaims);
	console.info(
		"\n\nAccessing report page for :",
		req.query.image,
		" by:\n\n",
		JSON.stringify(user),
		"\n\n"
	);
	res.render("report", {
		pothole: req.query.image,
		user,
	});
});
app.post("/submitReport", checkCookieMiddleware, (req, res) => {
	console.info(
		`\n\nLatitude received from user is ${req.body.latitude} and longitude is ${req.body.longitude}\n\n`
	);
	axios
		.post("https://maps.googleapis.com/maps/api/geocode/json", null, {
			params: {
				latlng: `${req.body.latitude},${req.body.longitude}`,
				key: "AIzaSyB1x605iH6saTC_1U8L1VMwdWbNsEIIZj8",
			},
		})
		.then((response) => {
			var obj = {};
			console.info(
				"\n\nGoogle Maps Geocoding Response:\n\n",
				response.data.results[0],
				"\n\n"
			);
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
			obj.completeAddress = response.data.results[0].formatted_address;
			obj.placeID = response.data.results[0].place_id;
			obj.latitude = req.body.latitude;
			obj.longitude = req.body.longitude;
			obj.image = req.body.imageURL;
			obj.description = req.body.description;
			obj.globalCode = response.data.plus_code.global_code;
			obj.neg =
				vader.SentimentIntensityAnalyzer.polarity_scores(
					req.body.description
				).neg * 100;
			var ID = makeID(36);
			db.collection("users").doc(req.decodedClaims.uid).set({
				uid: req.decodedClaims.uid,
			});
			db.collection("users")
				.doc(req.decodedClaims.uid)
				.collection("potholes")
				.doc(ID)
				.set(obj);
			var locationTag;
			locationTag = obj.completeAddress.split(' ').join('');
			if(obj.completeAddress.includes("/"))
			{
				locationTag = obj.completeAddress.split('/').join('');
			}
			
			db.collection("exactLocation").doc(locationTag).set({
				globalcode: obj.globalCode,
				rating: 50,
			});
			db.collection("exactLocation")
				.doc(locationTag)
				.collection("potholes")
				.doc(ID)
				.set(obj);

			return res.redirect("/dashboard");
		})
		.catch((error) => {
			console.error("\n\nsubmitReport error:\n\n", error, "\n\n");
			res.send("Error");
		});
});
/*=============================================>>>>>

				= Coming Soon =

===============================================>>>>>*/

app.get("/notifications", checkCookieMiddleware, (req, res) => {
	res.status(302).redirect("/comingSoon");
});

/*=============================================>>>>>

				= errors =

===============================================>>>>>*/

app.use((req, res) => {
	res.status(404).render("errors/404");
});

exports.app = functions.https.onRequest(app);
