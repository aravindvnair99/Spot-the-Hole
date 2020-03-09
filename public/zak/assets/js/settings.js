$(document).ready(function(){
	     
        var defaultval = {
          theme: "deep-purple", 
          header: "light",
          header_align: "center",
          menu: "light",
          menu_icons: "on",
          menu_type: "left",
          footer: "dark",
          footer_type: "left",
          //menu_animation: "slide_left",
          site_mode: "light",
          footer_menu: "show",
          footer_menu_style: "light",
        };
        //console.log(defaultval.theme);

        // loop and active mark default values
        for (var key in defaultval) {
          if(defaultval.hasOwnProperty(key)){
            //console.log(key + " : " + defaultval[key]);
            //$(".appsettings[data-type='"+key+"'][data-value='"+defaultval[key]+"']").addClass("active");
          }
        }

  	// on click any link apply settings
    $(document).on( 'click', '.appsettings', function (e){
        e.preventDefault();

        var type = $(this).attr("data-type");
        var value = $(this).attr("data-value");

        //console.log(type+value);

          $(".appsettings[data-type='"+type+"']").removeClass("active");
          $(".appsettings[data-type='"+type+"'][data-value='"+value+"']").addClass("active");

          if(type == "theme"){
            if(value != "" && value != defaultval[type]){
              $("link#main-style").attr("href","assets/css/style-"+value+".css");
            } else {
              $("link#main-style").attr("href","assets/css/style.css");
            }
          } else {

            if(type == "site_mode"){
              // site mode related settings here.

              if(value == "dark"){
                var set_sitemode = {header:"dark", menu:"dark", footer: "dark", footer_menu_style: "dark"};
                site_mode_settings(set_sitemode);
              } else if(value == "light"){
                var set_sitemode = {header:"light", menu:"light", footer: "dark", footer_menu_style: "light"};
                site_mode_settings(set_sitemode);
              }

            }

            if(value == defaultval[type]){
              value = "";
            }
            var attr = "data-"+type+"";
            $("body").attr(attr,value);
          }

        settings_session();

    });

    // on click any link apply settings
    $(document).on( 'click', '.nav-site-mode', function (e){
        e.preventDefault();
        var active = $(".appsettings[data-type='site_mode'].active")
        var mode = active.attr("data-value");
        if(mode == "light"){
          var set_sitemode = {header:"dark", menu:"dark", footer: "dark", footer_menu_style: "dark", site_mode: "dark"};
          site_mode_settings(set_sitemode);
        } else {
          var set_sitemode = {header:"light", menu:"light", footer: "dark", footer_menu_style: "light", site_mode: "light"};
          site_mode_settings(set_sitemode);
        }

        settings_session();
    });

    function site_mode_settings(obj){
        $.each( obj, function( type, value ) {
          //console.log( type + ": " + value );
          $(".appsettings[data-type='"+type+"']").removeClass("active");
          $(".appsettings[data-type='"+type+"'][data-value='"+value+"']").addClass("active");
          $("body").attr('data-'+type,value);

        });
    }

    function settings_session(){
  
        var type = "aa"; 
        sess = "";
        $(".sidesettings .appsettings.active").each(function( index ) {
            sess += $(this).attr("data-type") + ":";
            sess += $(this).attr("data-value") + "|";            
        });

        $.post("common/settings_session.php", 
          {
            sess:sess
          },
          function(response,status){
            //console.log("*----Received Data----*nnResponse : " + response+"nnStatus : " + status);
          }
        );

    }

});