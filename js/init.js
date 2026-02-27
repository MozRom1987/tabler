$(function () {

    $('.tel, #phone').inputmask('+48 999 999 999', {
        clearMaskOnLostFocus: true,
        clearIncomplete: true
    });

    $('.num1').viewportChecker({
        classToAdd: 'visible animated fadeInUp',
        offset: 100,
        callbackFunction: function () {
            let num = $('#num1').data('num');
            $('#num1').animateNumber({ number: num }, 2500);
        }
    });
    $('.num2').viewportChecker({
        classToAdd: 'visible animated fadeInUp',
        offset: 100,
        callbackFunction: function () {
            let num = $('#num2').data('num');
            $('#num2').animateNumber({ number: num }, 2500);
        }
    });
    $('.num3').viewportChecker({
        classToAdd: 'visible animated fadeInUp',
        offset: 100,
        callbackFunction: function () {
            let num = $('#num3').data('num');
            $('#num3').animateNumber({ number: num }, 2500);
        }
    });

    if ($('#footer_phone_typed').length > 0) {
        $('.footer').viewportChecker({
            offset: 100,
            callbackFunction: function () {
                var typed = new Typed('#footer_phone_typed', {
                    strings: ['+48 573-463-323'],
                    typeSpeed: 100,
                    startDelay: 300,
                    showCursor: true,
                    loop: false,
                    shuffle: false,
                });
                setTimeout(function () { $('.footer-phone .item-animate').addClass('active'); }, 5000);
            }
        });
    }

    document.getElementById('current-year').textContent = new Date().getFullYear();

});
