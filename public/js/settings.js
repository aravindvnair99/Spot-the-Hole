$(document).ready(() => {
	function getCookie(cname) {
		var name = cname + "=";
		var decodedCookie = decodeURIComponent(document.cookie);
		var ca = decodedCookie.split(";");
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == " ") {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			}
		}
		return "";
	}
	var defaultval = {
		theme: getCookie("theme") || "deep-purple",
		header: getCookie("header") || "light",
		header_align: getCookie("header_align") || "center",
		menu: getCookie("menu") || "light",
		menu_icons: getCookie("menu_icons") || "on",
		menu_type: getCookie("menu_type") || "left",
		footer: getCookie("footer") || "dark",
		footer_type: getCookie("footer_type") || "left",
		//menu_animation: "slide_left",
		site_mode: getCookie("site_mode") || "light",
		footer_menu: getCookie("footer_menu") || "show",
		footer_menu_style: getCookie("footer_menu_style") || "light",
	};

	site_mode_settings(defaultval);

	// on click any link apply settings
	$(document).on("click", ".appsettings", (e) => {
		e.preventDefault();

		var type = $(this).attr("data-type");
		var value = $(this).attr("data-value");

		//console.log(type+value);

		$(".appsettings[data-type='" + type + "']").removeClass("active");
		$(
			".appsettings[data-type='" + type + "'][data-value='" + value + "']"
		).addClass("active");

		if (type == "theme") {
			if (value != "" && value != defaultval[type]) {
				$("link#main-style").attr(
					"href",
					"assets/css/style-" + value + ".css"
				);
			} else {
				$("link#main-style").attr("href", "assets/css/style.css");
			}
		} else {
			if (type == "site_mode") {
				// site mode related settings here.

				if (value == "dark") {
					var set_sitemode = {
						header: "dark",
						menu: "dark",
						footer: "dark",
						footer_menu_style: "dark",
					};
					site_mode_settings(set_sitemode);
				} else if (value == "light") {
					var set_sitemode = {
						header: "light",
						menu: "light",
						footer: "dark",
						footer_menu_style: "light",
					};
					site_mode_settings(set_sitemode);
				}
			}

			if (value == defaultval[type]) {
				value = "";
			}
			var attr = "data-" + type + "";
			$("body").attr(attr, value);
		}

		settings_session();
	});

	// on click any link apply settings
	$(document).on("click", ".nav-site-mode", (e) => {
		e.preventDefault();
		var active = $(".appsettings[data-type='site_mode'].active");
		var mode = active.attr("data-value");
		if (mode == "light") {
			var set_sitemode = {
				header: "dark",
				menu: "dark",
				footer: "dark",
				footer_menu_style: "dark",
				site_mode: "dark",
			};
			site_mode_settings(set_sitemode);
		} else {
			var set_sitemode = {
				header: "light",
				menu: "light",
				footer: "dark",
				footer_menu_style: "light",
				site_mode: "light",
			};
			site_mode_settings(set_sitemode);
		}

		settings_session();
	});

	function site_mode_settings(obj) {
		$.each(obj, (type, value) => {
			//console.log( type + ": " + value );
			$(".appsettings[data-type='" + type + "']").removeClass("active");
			$(
				".appsettings[data-type='" +
					type +
					"'][data-value='" +
					value +
					"']"
			).addClass("active");
			$("body").attr("data-" + type, value);
		});
	}

	function settings_session() {
		$(".sidesettings .appsettings.active").each(() => {
			document.cookie = `${$(this).attr("data-type")}=${$(this).attr(
				"data-value"
			)}`;
		});
	}
});
