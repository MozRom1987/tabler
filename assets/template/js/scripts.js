/*closestchild*/
;(function($){
  $.fn.closestChild = function(selector) {
    var $children, $results;
    
    $children = this.children();
    
    if ($children.length === 0)
      return $();
  
    $results = $children.filter(selector);
    
    if ($results.length > 0)
      return $results;
    else
      return $children.closestChild(selector);
  };
})(window.jQuery);
/* /. closestchild*/


$(function(){
        let top_show = 280, speed = 500, $backButton = $('#up');
        $(window).scroll(function () { 
            if ($(this).scrollTop() > top_show) {
                $backButton.addClass('active');
            }
            else {
                $backButton.removeClass('active');
            }
        });
        $backButton.click(function () { 
            scrollto(0, speed);
        });

        // scrollto
        window.scrollto = function(destination, speed) {
            if (typeof speed == 'undefined') {
                speed = 800;
            }
            jQuery("html:not(:animated),body:not(:animated)").animate({scrollTop: destination-60}, speed);
        };
        $("a.scrollto").click(function () {
            var elementClick = $(this).attr("href")
            var destination = $(elementClick).offset().top;
            scrollto(destination);
            return false;
        });
        // end scrollto  


        // fancybox
        $('.fancybox').fancybox({
            padding: 0,
            helpers: {
            overlay: {
                    locked: false
                }
            },
            lang : 'ru',
            i18n : {
                'ru' : {
                    CLOSE : 'Закрыть',
                    NEXT: "Далее",
                    PREV: "Назад",
                    ERROR: "Запрошенные данные не могут быть загружены. <br/> Повторите попытку позже.",
                    PLAY_START: "Начать слайд-шоу",
                    PLAY_STOP: "Завершить слайд-шоу",
                    FULL_SCREEN: "На весь экран",
                    THUMBS: "Миниатюры",
                    DOWNLOAD: "Скачать",
                    SHARE: "Поделиться",
                    ZOOM: "Увеличить"
                }
            }
        });
        
        $('.fancyboxModal').fancybox({
            autoResize:true,            
            padding: 0,
            fitToView : false, 
            maxWidth: '100%',
            scrolling : "no",
            wrapCSS : 'fancybox-animate-wrap',
            touch: false,
            autoFocus: false,
            lang : 'ru',
            i18n : {
                'ru' : {
                    CLOSE : 'Закрыть',
                    NEXT: "Далее",
                    PREV: "Назад",
                }
            }
        });

        $('.fancyboxvideo').fancybox({
            padding: 0,
            width: '1300px',
            height: '',
            maxWidth: '100%',
            maxHeight: '100%',
            helpers: {
            overlay: {
                    locked: false
                }
            },
            lang : 'ru',
            i18n : {
                'ru' : {
                    CLOSE : 'Закрыть',
                    NEXT: "Далее",
                    PREV: "Назад",
                }
            }
        });
        // end fancybox
        
        
        
        // validation
        $('.rf').each(function(){
            var item = $(this),
            btn = item.find('.btn');
            
            function checkInput(){
                item.find('select.required').each(function(){
                    if($(this).val() == '0'){
                        $(this).parents('.form-group').addClass('error');
                        $(this).parents('.form-group').find('.error-message').show();
                    } else {
                        $(this).parents('.form-group').removeClass('error');
                    }
                });                
                
                item.find('input[type=text].required').each(function(){
                    if($(this).val() != ''){
                        $(this).removeClass('error');
                    } else {
                        $(this).addClass('error');
                        $(this).parent('.form-group').find('.error-message').show();
                    }
                });

                item.find('input[type=tel].required').each(function(){
                    if($(this).val() != ''){
                        $(this).removeClass('error');
                    } else {
                        $(this).addClass('error');
                        $(this).parent('.form-group').find('.error-message').show();
                    }
                });
                
                item.find('textarea.required').each(function(){
                    if($(this).val() != ''){
                        $(this).removeClass('error');
                    } else {
                        $(this).addClass('error');
                        $(this).parent('.form-group').find('.error-message').show();
                    }
                });
                
                item.find('input[type=email]').each(function(){
                    var regexp = /^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/i;
                    var $this = $(this);
                    if($this.hasClass('required')){
                        if (regexp.test($this.val())) {
                            $this.removeClass('error');
                        } else {
                            $this.addClass('error');
                            $(this).parent('.form-group').find('.error-message').show();
                        }
                    } else{
                        if($this.val() != ''){
                            if (regexp.test($this.val())) {
                                $this.removeClass('error');
                            }else {
                                $this.addClass('error');
                                $(this).parent('.form-group').find('.error-message').show();
                            }
                        } else{
                            $this.removeClass('error');
                        }
                    }                    
                });                
                
                item.find('input[type=checkbox].required').each(function(){
                    if($(this).is(':checked')){
                        $(this).removeClass('error');
                    } else {
                        $(this).addClass('error');
                        $(this).parent('.form-group').find('.error-message').show();
                    }
                });
            }

            btn.click(function(){
                checkInput();
                var sizeEmpty = item.find('.error:visible').length;
                if(sizeEmpty > 0){
                    return false;
                } else {                    
                    item.submit();
                    $.fancybox.close();
                }
            });
        });
        
        $('select').change(function(){
            if($(this).val() == ''){     
                $(this).parents('.form-group').removeClass('selected');
            } else {
                $(this).parents('.form-group').addClass('selected');
                $(this).parents('.form-group').removeClass('error');
            }
        });
        // end validation       



        // Carousels

        $(".reviews-carousel").slick({
            infinite: false,
            slidesToShow: 2,
            slidesToScroll: 1,
            autoplay: true,
            swipeToSlide: true,
            autoplaySpeed: 4000,
            speed: 800,
            arrows: true,
            prevArrow: '<a href="#" class="slick-prev"></a>',
            nextArrow: '<a href="#" class="slick-next"></a>',
            dots: false,
            lazyLoad: 'ondemand',
            responsive: [
                {
                    breakpoint: 992,
                    settings: {
                    slidesToShow: 1,
                    },
                },
            ],
        });

        $('.logotypes-carousel').slick({
            infinite: true,
            slidesToShow: 6,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 5000,
            speed: 800,
            arrows: true,
            prevArrow: '<a href="#" class="slick-prev"></a>',
            nextArrow: '<a href="#" class="slick-next"></a>',
            responsive: [
                {
                    breakpoint: 992,
                    settings: {
                      slidesToShow: 5,
                    },
                },
                {
                    breakpoint: 768,
                    settings: {
                      slidesToShow: 4,
                    },
                },
                {
                    breakpoint: 600,
                    settings: {
                      slidesToShow: 3,
                    },
                },
                {
                    breakpoint: 500,
                    settings: {
                      slidesToShow: 2,
                    },
                }
            ]
        });
        // End Carousels      
       

        let menuButton = $('.menu-button'), mobMenuWrap = $('.mobile-menu-wrapper');
        menuButton.click(function(){
            menuButton.toggleClass('active');
            mobMenuWrap.toggleClass('open');
        });
        $('.mobile-menu-wrapper, .menu-button').click(function(e){
            if ($(e.target).hasClass('fancyboxModal') == false) {
                e.stopPropagation();
            }
        });
        
        $('.swipe-area, .overlay').swipe({
            swipeStatus:function(event, phase, direction, distance, duration, fingers)
                {
                    if (phase=='move' && direction =='left') {
                        mobMenuWrap.addClass('open');
                        menuButton.addClass('active');
                        return false;
                    }
                    if (phase=='move' && direction =='right') {
                        mobMenuWrap.removeClass('open');
                        menuButton.removeClass('active');
                        return false;
                    }
                }
        });
               
        $('body').click(function(){
            mobMenuWrap.removeClass('open');
            menuButton.removeClass('active');
        });
        
        
        $('.mobile-menu ul > li').has('ul').addClass('down');
        $('.mobile-menu .down > ul').before('<span class="dropdown-button"></span>');

        
        $('.mobile-menu .dropdown-button').click(function(){
            $(this).toggleClass('active');
            if($(this).siblings('ul').is(':visible')){
                $(this).siblings('ul').slideUp();
            }else{
                $(this).siblings('ul').slideDown();
            }
            
        });   


        $('.header-contacts-title-overlay').click(function(){
            $('.header-contacts-dropdown').toggle();
        });


        
        $(document).mouseup( function(e){ 
            let windW = window.innerWidth;
            if(windW < 992){ 
                let div = $( ".header-contacts-dropdown" ); // тут указываем ID элемента
                if ( !div.is(e.target) // если клик был не по нашему блоку
                    && div.has(e.target).length === 0 ) { // и не по его дочерним элементам
                    div.hide(); // скрываем его
                }
            }
        });

        $('.header-contacts-dropdown-close').click(function(){
            $('.header-contacts-dropdown').hide();
        });


        // tabs
            $('ul.tabs li:first-of-type').addClass('current');
            $('.boxes > div:first-of-type').addClass('visible');
            $('.mobile-tab-header').text($('ul.tabs li:first-of-type').text());
        
            $('ul.tabs').on('click', 'li:not(.current)', function() {
            
            $(this)
              .addClass('current').siblings().removeClass('current')
              .closest('.tabs-section').closestChild('div.box').removeClass('visible').eq($(this).index()).addClass('visible');
            });
            
            $('ul.tabs.mobile li').click(function(){
                $(this).parent().hide().siblings('.mobile-tab-header-wrapper').find('.mobile-tab-header').html($(this).html());
                $('.mobile-tab-header-wrapper').removeClass('active');
            });
            $('.mobile-tab-header-wrapper').click(function(e){
                if($(this).hasClass('active')){
                    $(this).removeClass('active');
                    $(this).siblings('.tabs.mobile').stop().slideUp(0);
                }else{
                    $(this).addClass('active');
                    $(this).siblings('.tabs.mobile').stop().slideDown(0);
                }
                
                e.stopPropagation();
            });
        // end tabs 

        // accordion
        let $thisElement,
            $thisElementContent,
            $elements,
            $elementsContent;

        $('.accordion .item-head').click(function() {
            $thisElement = $(this).parent();
            $thisElementContent = $thisElement.find('.item-body');
            $elements = $thisElement.siblings();
            $elementsContent = $elements.find('.item-body');

            $elements.removeClass('active');
            $elementsContent.slideUp();
            if (!$thisElement.hasClass('active')) {
                $thisElement.addClass('active');
                $thisElementContent.slideDown();
            } else {
                $thisElement.removeClass('active');
                $thisElementContent.slideUp();
            }

        });

        $('.accordion .item:first-child .item-head').trigger('click');

        // end accordion  

        $('a[href="#feedback"]').click(function(){
            let theme = $(this).data('theme'),
                title = $(this).data('title');

            $('#feedback_theme').val(theme);
            $('#feedback_title').text(title);
        });


        $('.footer .item-title-btn').click(function(){
            if(!$(this).parents('.item').hasClass('active')){
                $(this).parents('.item').addClass('active')
                $(this).parents('.item').find('.dropdown').slideDown();
            }else{
                $(this).parents('.item').removeClass('active');
                $(this).parents('.item').find('.dropdown').slideUp();
            }
        });
        

                
}); // end ready


window.onload = function() {
    let top_menu_w, 
        top_menu_first_ul_w,
        candidate_li_w,
        coming_ul_w,
        $top_menu_li, 
        this_top_menu_li_w, 
        total_top_menu_li_w=0,
        $top_menu_more_list = $('.top-menu-more-list'),
        $top_menu_more_list_sublist = $('.top-menu-more-list-sublist'),
        windWidth = window.innerWidth;

    function topMenuWidthComparison(){
        top_menu_w = $('.top-menu').width()-50;
        total_top_menu_li_w=0;
        $('.top-menu > ul:first-of-type > li').each(function(){
            $top_menu_li = $(this);
            this_top_menu_li_w = $top_menu_li.width();
            $top_menu_li.attr('data-realwidth', this_top_menu_li_w);
            total_top_menu_li_w += this_top_menu_li_w;
        });
        if(total_top_menu_li_w > top_menu_w){
            if(!$top_menu_more_list.hasClass('active')){
                $top_menu_more_list.addClass('active');
            }
            $('.top-menu > ul:first-of-type > li:last-of-type').prependTo($top_menu_more_list_sublist).addClass('transferred');
        }
    }

    function topmenumorelink(){
        do{
            topMenuWidthComparison()
        }while (total_top_menu_li_w > top_menu_w);

        if(!$('.top-menu').hasClass('loaded')){
            $('.top-menu').addClass('loaded');
        }
    }

    function topmenumorelinkReverse(){
        top_menu_w = $('.top-menu').width()-50;
        top_menu_first_ul_w = $('.top-menu > ul').width();
        candidate_li_w = $('.top-menu-more-list-sublist .transferred:first').data('realwidth');
        coming_ul_w = top_menu_first_ul_w + candidate_li_w;
        if(coming_ul_w < top_menu_w){
            $('.top-menu-more-list-sublist .transferred:first').appendTo('.top-menu > ul:first-of-type');
        }
        if($('.top-menu-more-list-sublist .transferred').length < 1){
            $top_menu_more_list.removeClass('active');
        }
    }
    
    if(windWidth > 991){
        topmenumorelink();
    }
    
    window.addEventListener("resize", function() {
        windWidth = window.innerWidth;
        if(windWidth > 991){
            topmenumorelink();
            topmenumorelinkReverse();
        }
        
    }, false);

    window.addEventListener("orientationchange", function() {
        windWidth = window.innerWidth;
        if(windWidth > 991){
            topmenumorelink();
            topmenumorelinkReverse();
        }
    }, false);


    // FIXED HEADER PANEL AT THE SCROLL
    let header_main_height = $('.header-main').height();
    
    let header_main_inner_height = $('.header-main-inner').height();
    $('.header-main-wrapper-push').height(header_main_inner_height);
    

    let h_hght = header_main_height + 250,
        h_mrg = 0,
        elem = $('.header-main-wrapper'),
        top = $(this).scrollTop();
    
    
    if(top > header_main_height){
        elem.addClass('pred_fixed');
    }
     
    if(top > h_hght){
        elem.addClass('fixed');
    }           
     
    $(window).scroll(function(){
        top = $(this).scrollTop();
        
        if (top+h_mrg < header_main_height) {
            elem.removeClass('pred_fixed');
        } else {
            elem.addClass('pred_fixed');
        }
         
        if (top+h_mrg < h_hght) {
            elem.removeClass('fixed');
        } else {
            elem.addClass('fixed');
        }
    });
    
    // /. FIXED HEADER PANEL AT THE SCROLL


    // Anchor menu   
            
        let lastId, 
        menuButton = $('.menu-button'), 
        mobMenuWrap = $('.mobile-menu-wrapper'),
        anchorMenu = $(".anchor-menu"),
        anchorMenuHeight = 100 /*$(".anchor-menu").outerHeight()+15*/,
        menuItems = anchorMenu.find('li > a[href^="#"]'),
        scrollItems = menuItems.map(function(){
            let item = $($(this).attr("href"));
            if (item.length) { return item; }
        });

        menuItems.click(function(e){
            let href = $(this).attr("href"),
            offsetTop = href === "#" ? 0 : $(href).offset().top-anchorMenuHeight+1;
            $('html, body').stop().animate({ 
                scrollTop: offsetTop 
            }, 500);

            mobMenuWrap.removeClass('open');
            menuButton.removeClass('active');
            $('body').removeClass('overflow_hidden');

            e.preventDefault();
        });
        
        function currentAnchorLink(){
            let fromTop = $(this).scrollTop()+anchorMenuHeight;
            let cur = scrollItems.map(function(){
                if ($(this).offset().top < fromTop)
                return this;
            });
            cur = cur[cur.length-1];
            let id = cur && cur.length ? cur[0].id : "";
            if (lastId !== id) {
                lastId = id;
                menuItems.parent().removeClass("active").end().filter('[href="#'+id+'"]').parent().addClass("active");
            }
        }
        currentAnchorLink();
        // Bind to scroll
        $(window).scroll(function(){
            currentAnchorLink();              
        });        
            
    // End anchor menu

};