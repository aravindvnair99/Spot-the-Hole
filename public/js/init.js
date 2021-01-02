
$(document).ready(function(){
	
	// load sidemenu
	if($('.sidemenu').length){
	    $('.sidemenu').sidenav({
                onOpenStart: function(){
                    $('.sidesettings').sidenav('close');
                    //console.log("onopen");
                }
        });

        const ps1 = new PerfectScrollbar('.sidemenu', {
          suppressScrollX: true
        });
    }

    if($('.sidesettings').length){
        $('.sidesettings').sidenav(
            {
                onOpenStart: function(){
                    $('.sidemenu').sidenav('close');
                    //console.log("onopen");
                },
                edge: 'right',

            });

        const ps2 = new PerfectScrollbar('.sidesettings', {
          suppressScrollX: true
        });

    }


/********************AJAX BASED SITE - START*******************/

    // on site load or window refresh
    var indexpage = "home";

    if($("body").hasClass("ajaxurl")){
        var indexpage = $("body").attr("data-app-page");
        if(indexpage == "index"){
            indexpage = "home";
        }
      ajaxload_script(indexpage,"");
    }

    if($("body").hasClass("ajax")){
    	ajaxload_script(indexpage,"");
    }


	// on click any link load that file
    $(document).on( 'click', '.ajaxmode', function (e){
        e.preventDefault();
        $("body").addClass("ajaxloading");
        //console.log("clicked");

        $("body").removeClass("isfullscreen");
        var screenattr = $(this).attr("data-screen");
        if(screenattr == "full"){
          $("body").addClass("isfullscreen");
        }

        $('.sidemenu').sidenav('close');
        $('.sidesettings').sidenav('close');
        $("HTML, BODY").animate({ scrollTop: 0 }, 400, 'swing');
        
        var page = $(this).attr("data-page");

        $.when($('.preloader-background').show()).done(function() {
            $('.sidemenu').sidenav('close');
            $('.sidesettings').sidenav('close');
        });

        // console.log("done"+page);

		ajaxload_script(page,"");
    });


    if($("body").hasClass("ajaxurl") || $("body").hasClass("ajax"))
    {

        window.addEventListener('popstate', function(e){
                //console.log("popstate event");
                
                var poppage = e.state;
                //console.log(poppage);
                if (poppage == null) {
                    poppage = "home";
                }
                
                ajaxload_script(poppage,"pop");

                /*if (character == null) {
                  removeCurrentClass();
                  textWrapper.innerHTML = " ";
                  content.innerHTML = " ";
                  document.title = defaultTitle;
                } else {
                  updateText(character);
                  requestContent(character + ".php");
                  addCurrentClass(character);
                  document.title = "Ghostbuster | " + character;
                }*/
        });

    }


    function ajaxload_script(page,calltype){
    	var sitemode = "html";
    	if($("body").hasClass("ajax")){
    		sitemode = "ajax";
    	} else if($("body").hasClass("ajaxurl")){
            sitemode = "ajaxurl";
        }
    	
        //console.log(sitemode + " "+page);

        var data = {
            sitemode: sitemode,
        	page: page,
        };

        var pagefile = page + ".php";

    	$.ajax({data: data, type: 'POST', url: pagefile, success: function(result){

            //console.log("success:" + page + " " + pagefile);

            if(sitemode == "ajax"){
                $("#response_wrapper").html(result);
            } else if(sitemode == "ajaxurl"){
               // console.log(result);
                var main = $(result).wrap('<p>').parent().find('main').html();
              //  console.log("main : " + main);
             //   return false;
                $("main").html(main);
            }

        },
        complete: function (data) {
            $('.preloader-background').delay(700).fadeOut('slow');
            $("body").removeClass("ajaxloading");

            if(calltype != "pop"){
                //console.log("push");
                var pageurl = page;
                if(page == "home"){
                    pageurl = "index";
                }
                pageurl = pageurl+".php";
                window.history.pushState(page, null, pageurl);
            }

            if(page != "home"){
                $("body").removeClass("ishome");
            } else {
                $("body").addClass("ishome");
            }

            /*var prev = $("body").attr("data-current");
            $("body").attr("data-current",page);
            if(page == "home"){
                prev = "";
            }
            $(".back-button.ajaxmode").attr("data-page",prev);*/
            //console.log(window.history);
            return false;
        }

    });
    }

});


/********************AJAX BASED SITE - END*******************/

$(document).ready(function(){
   
 $(document).on( 'click', '.back-button', function (e){
        e.preventDefault();
        $('.sidemenu').sidenav('close');
        $('.sidesettings').sidenav('close');
        window.history.back();
    });

  $(document).on( 'click', '.menu-close', function (e){
    $('.sidemenu').sidenav('close');
  });

});


/********************Equal Height*******************/


$(document).ready(function(){

    // Select and loop the container element of the elements you want to equalise
    $('.equal-height').each(function(){  
      
      // Cache the highest
      var highestBox = 0;
      
      // Select and loop the elements you want to equalise
      $('.col', this).each(function(){
        
        // If this box is higher than the cached highest then store it
        if($(this).height() > highestBox) {
          highestBox = $(this).height(); 
        }
      
      });  
            
      // Set the height of all those children to whichever was highest 
      $('.col',this).height(highestBox);
                    
    }); 

});





$(window).load(function(){

});

function fixNavbar() {
  var  $totop       = $('.backtotop'),
       $nav        = $('nav.fixedtop'),
       totop = 200,
       offset     = 0,
       logoHeight = 56,
       distance   = offset + logoHeight,
       scroll     = $(window).scrollTop();

  if (scroll >= distance) {
    $nav.css({
      'position': 'fixed',
      'top':      '0',
      'right':    '0',
      'left':     '0'
    });
  } else {
    $nav.css({
      'position': 'relative',
      'top':      'auto',
      'right':    'auto',
      'left':     'auto'
    });
  }

  if (scroll >= totop) {
    $totop.css({
      'display': 'inline-block',
    });
  } else {
    $totop.css({
      'display': 'none',
    });
  }
}



function fixNavbar_backup() {
   
    $(window).bind('mousewheel DOMMouseScroll onmousewheel touchmove scroll', function(event) {
        if (event.originalEvent.wheelDelta >= 0) {
            //console.log('Scroll up');
            $("body").addClass("fixedtopbar");
        }
        else {
           // console.log('Scroll down');
            $("body").removeClass("fixedtopbar");
        }
    });

  var  $totop       = $('.backtotop'),
       $nav        = $('nav.fixedtop'),
       totop = 200,
       offset     = 0,
       logoHeight = 56,
       distance   = offset + logoHeight,
       scroll     = $(window).scrollTop();


  if (scroll >= totop) {
    $totop.css({
      'display': 'inline-block',
    });
  } else {
    $totop.css({
      'display': 'none',
    });
  }
}

$(document).ready(function(){
    $(document).on( 'click', '.backtotop', function (e){
         $("HTML, BODY").animate({ scrollTop: 0 }, 400, 'swing');
    });
});

$(window).scroll( function() {
  fixNavbar();
});
