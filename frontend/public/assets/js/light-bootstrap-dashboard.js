var searchVisible = 0;
var transparent = true;

var transparentDemo = true;
var fixedTop = false;

var navbar_initialized = false;
var click_toggle = null;
var init_right_menu = null;

$(document).ready(function () {
  window_width = $(window).width();
  init_right_menu = lbd.initRightMenu;

  //  Activate the tooltips
  $('[rel="tooltip"]').tooltip();

  //      Activate the switches with icons
  if ($(".switch").length != 0) {
    $(".switch")["bootstrapSwitch"]();
  }
  //      Activate regular switches
  if ($("[data-toggle='switch']").length != 0) {
    $("[data-toggle='switch']")
      .wrap('<div class="switch" />')
      .parent()
      .bootstrapSwitch();
  }

  $(".form-control")
    .on("focus", function () {
      $(this).parent(".input-group").addClass("input-group-focus");
    })
    .on("blur", function () {
      $(this).parent(".input-group").removeClass("input-group-focus");
    });
});

lbd = {
  misc: {
    navbar_menu_visible: 0,
  },

  initRightMenu: function () {
    // Note: We only call initRightMenu after the index component is first loaded, or updated.
    // Thus in these cases, we will have a freshly new created navbar.
    // So we can assume that the navbar is always new, before this code is run.
    // Thus, we will not accidentally duplicate elements, etc.

    // (The original version of this dashboard js does not account for React and its re-rendering,
    // it assumes that the navbar is reated one and only one.
    // The navbar_initialized check is in place to prevent re-adding elements to a navbar
    // that already has elements.)

    // if (!navbar_initialized) {
      $navbar = $("nav").find(".navbar-collapse").first().clone(true);

      $sidebar = $(".sidebar");
      sidebar_color = $sidebar.data("color");

      ul_content = "";

      $navbar.attr("data-color", sidebar_color);

      // add the content from the sidebar to the right menu
      content_buff = $sidebar.find(".nav").html();
      ul_content = ul_content + content_buff;

      //add the content from the regular header to the right menu
      $navbar.children("ul").each(function () {
        content_buff = $(this).html();
        ul_content = ul_content + content_buff;
      });

      ul_content = '<ul class="nav navbar-nav">' + ul_content + "</ul>";

      $navbar.html(ul_content);

      $("body").append($navbar);

      $toggle = $(".navbar-toggle");

      $navbar.find("a").removeClass("btn btn-round btn-default");
      $navbar
        .find("button")
        .removeClass(
          "btn-round btn-fill btn-info btn-primary btn-success btn-danger btn-warning btn-neutral"
        );
      $navbar.find("button").addClass("btn-simple btn-block");
      click_toggle = function () {
        if (lbd.misc.navbar_menu_visible == 1) {
          $("html").removeClass("nav-open");
          lbd.misc.navbar_menu_visible = 0;
          $("#bodyClick").remove();
          setTimeout(function () {
            $toggle.removeClass("toggled");
          }, 400);
        } else {
          setTimeout(function () {
            $toggle.addClass("toggled");
          }, 430);

          div = '<div id="bodyClick"></div>';
          $(div)
            .appendTo("body")
            .click(function () {
              $("html").removeClass("nav-open");
              lbd.misc.navbar_menu_visible = 0;
              $("#bodyClick").remove();
              setTimeout(function () {
                $toggle.removeClass("toggled");
              }, 400);
            });

          $("html").addClass("nav-open");
          lbd.misc.navbar_menu_visible = 1;
        }
      };
      navbar_initialized = true;
    // }
  },
};

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.

function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this,
      args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    }, wait);
    if (immediate && !timeout) func.apply(context, args);
  };
}
