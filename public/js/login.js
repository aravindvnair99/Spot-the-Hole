firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);
/**
 * @return {!Object} The FirebaseUI config.
 */
function getUiConfig() {
	return {
		callbacks: {
			signInSuccessWithAuthResult: (authResult) => {
				if (authResult.additionalUserInfo.isNewUser) {
					firebase.analytics().logEvent("sign_up");
					document.getElementById("is-new-user").textContent =
						"Hey there new user! We are preparing your dashboard!";
				} else if (!authResult.additionalUserInfo.isNewUser) {
					firebase.analytics().logEvent("login");
					document.getElementById("is-new-user").textContent =
						"Hey there! Welcome back! Loading your dashboard!";
				}
				firebase.analytics().setUserId(authResult.user.uid);
				authResult.user
					.getIdToken()
					.then((idToken) => {
						window.location.href =
							"/sessionLogin?idToken=" +
							idToken +
							"&isNewUser=" +
							authResult.additionalUserInfo.isNewUser;
					})
					.catch((error) => {
						alert(error);
					});
			},
		},
		signInFlow: "popup",
		signInOptions: [
			{
				provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
				authMethod: "https://accounts.google.com",
				clientId:
					"696028587080-0ephe2a3koj349dgais95f8nssdelffd.apps.googleusercontent.com",
				// scopes: [
				// 	"https://www.googleapis.com/auth/user.phonenumbers.read",
				// ],
			},
			// {
			// 	provider: firebase.auth.FacebookAuthProvider.PROVIDER_ID,
			// 	scopes: ["public_profile", "email"],
			// },
			// firebase.auth.TwitterAuthProvider.PROVIDER_ID,
			// {
			// 	provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
			// 	// Whether the display name should be displayed in Sign Up page.
			// 	requireDisplayName: true,
			// 	signInMethod: "password",
			// },
			// {
			// 	provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
			// 	recaptchaParameters: {
			// 		size: "invisible",
			// 	},
			// 	defaultCountry: "IN",
			// },
			// {
			// 	provider: "microsoft.com",
			// 	loginHintKey: "login_hint",
			// },
			// {
			// 	provider: "yahoo.com",
			// },
		],
		// Terms of service url.
		tosUrl: "/termsConditions",
		// Privacy policy url.
		privacyPolicyUrl: "/privacyPolicy",
		credentialHelper: firebaseui.auth.CredentialHelper.GOOGLE_YOLO,
	};
}
// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());
ui.disableAutoSignIn();
/**
 * Displays the UI for a signed in user.
 * @param {!firebase.User} user
 */
var handleSignedInUser = (user) => {
	document.getElementById("user-signed-in").style.display = "block";
	document.getElementById("user-signed-out").style.display = "none";
	document.getElementById("name").textContent = user.displayName;
	document.getElementById("email").textContent = user.email;
	document.getElementById("phone").textContent = user.phoneNumber;
	if (user.photoURL) {
		var photoURL = user.photoURL;
		// Append size to the photo URL for Google hosted images to avoid requesting
		// the image with its original resolution (using more bandwidth than needed)
		// when it is going to be presented in smaller size.
		if (
			photoURL.indexOf("googleusercontent.com") != -1 ||
			photoURL.indexOf("ggpht.com") != -1
		) {
			photoURL =
				photoURL +
				"?sz=" +
				document.getElementById("photo").clientHeight;
		}
		document.getElementById("photo").src = photoURL;
		document.getElementById("photo").style.display = "block";
	} else {
		document.getElementById("photo").style.display = "none";
	}
};
/**
 * Displays the UI for a signed out user.
 */
var handleSignedOutUser = () => {
	document.getElementById("user-signed-in").style.display = "none";
	document.getElementById("user-signed-out").style.display = "block";
	ui.start("#firebaseui-container", getUiConfig());
};
// Listen to change in auth state so it displays the correct UI for when
// the user is signed in or not.
firebase.auth().onAuthStateChanged((user) => {
	document.getElementById("loading").style.display = "none";
	document.getElementById("loaded").style.display = "block";
	user ? handleSignedInUser(user) : handleSignedOutUser();
});
