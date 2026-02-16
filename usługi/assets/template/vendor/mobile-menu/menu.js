(function( $ ) {
	var menu = $([
		'<div class="mobile-menu">',
			'<div class="mobile-menu-background">',
				'<div class="mobile-menu-content">',
					'<div class="mobile-menu-body">',
						
					'</div>',
				'</div>',
			'</div>',
		'</div>',
	].join(''));


	var methods = {
		init : function( options ) { 
			$('.mobile-menu-body',menu).append(this);

			$('body').append(menu);
		},
		open : function( ) {
			menu.addClass('open');
		},
		close : function( ) {
			menu.addClass('close');

			setTimeout(function(){
				menu.removeClass('close open');
			},300)
		},
	};

	$('.mobile-menu-background',menu).on('click',function(event){
		if(!$(event.target).closest($('.mobile-menu-content',menu)).length) {
			methods.close();
		}
	})

	document.addEventListener('touchstart', handleTouchStart, false);        
	document.addEventListener('touchmove', handleTouchMove, false);

	var xDown = null;                                                        
	var yDown = null;    

	function handleTouchStart(evt) {                                         
	    xDown = evt.touches[0].clientX;                                      
	    yDown = evt.touches[0].clientY;                                      
	};                                                

	function handleTouchMove(evt) {
	    if ( ! xDown || ! yDown ) {
	        return;
	    }

	    var xUp = evt.touches[0].clientX;                                    
	    var yUp = evt.touches[0].clientY;

	    var xDiff = xDown - xUp;
	    var yDiff = yDown - yUp;

	    if(Math.abs( xDiff ) + Math.abs( yDiff ) > 150){ //to deal with to short swipes

		    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
		        if ( xDiff > 0 ) {/* left swipe */ 
		            methods.close();
		        }                     
		    }

		    xDown = null;
		    yDown = null;
	    }
	};


	$.fn.menu = function(method) {
		if ( methods[method] ) {
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if(!method){
			methods.init.apply( this, arguments );
		} else {
			$.error( 'Метод с именем ' +  method + ' не существует для jQuery.menu' );
		} 
	};
	
})(jQuery);