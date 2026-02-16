(function($) {
    'use strict';

    const WORKER_URL = 'https://form-handler.web-miled.workers.dev';

    $(document).ready(function() {
        $('.ajax_form').on('submit', function(e) {
            e.preventDefault();
            
            const form = $(this);
            const submitBtn = form.find('input[type="submit"], button[type="submit"]');
            const originalBtnText = submitBtn.val() || submitBtn.text();
            
            form.find('.error').removeClass('error');
            
            let isValid = true;
            let firstError = null;
            
            form.find('.required').each(function() {
                const field = $(this);
                
                if (field.is(':checkbox')) {
                    if (!field.is(':checked')) {
                        isValid = false;
                        field.addClass('error');
                        if (!firstError) firstError = field;
                    }
                } else if (field.is('input[type="tel"]')) {
                    const phone = field.val().replace(/\D/g, '');
                    if (phone.length < 10) {
                        isValid = false;
                        field.addClass('error');
                        if (!firstError) firstError = field;
                    }
                } else if (!field.val() || field.val().trim() === '') {
                    isValid = false;
                    field.addClass('error');
                    if (!firstError) firstError = field;
                }
            });
            
            if (!isValid) {
                alert('Proszę wypełnić wszystkie wymagane pola.');
                if (firstError) {
                    firstError.focus();
                }
                return;
            }
            
            const formData = {
                name: form.find('input[name="name"]').val().trim(),
                phone: form.find('input[name="phone"]').val().trim(),
                text: form.find('textarea[name="text"]').val() || ''
            };
            
            submitBtn.prop('disabled', true);
            if (submitBtn.is('input')) {
                submitBtn.val('Wysyłanie...');
            } else {
                submitBtn.text('Wysyłanie...');
            }
            
            fetch(WORKER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            .then(response => response.json())
            .then(data => {
                if (typeof $.fancybox !== 'undefined') {
                    $.fancybox.open([{ href: '#responseMessage', padding: 0 }]);
                    
                    if (data.success) {
                        $('#responseMessageTitle').text('Wiadomość została wysłana!');
                        $('#responseMessageBody').html('<p>' + data.message + '</p>');
                        form[0].reset();
                    } else {
                        $('#responseMessageTitle').text('Wiadomość nie została wysłana!');
                        $('#responseMessageBody').html('<p>' + data.message + '</p>');
                    }
                    
                    $('.fancyClose').click(function() {
                        $.fancybox.close('#responseMessage');
                        return false;
                    });
                } else {
                    alert(data.message);
                    if (data.success) {
                        form[0].reset();
                    }
                }
            })
            .catch(error => {
                console.error('Form error:', error);
                alert('Wystąpił błąd przy wysyłaniu formularza. Sprawdź połączenie lub spróbuj ponownie.');
            })
            .finally(() => {
                submitBtn.prop('disabled', false);
                if (submitBtn.is('input')) {
                    submitBtn.val(originalBtnText);
                } else {
                    submitBtn.text(originalBtnText);
                }
            });
        });
        
        $('.ajax_form .required').on('input change', function() {
            $(this).removeClass('error');
        });
    });

})(jQuery);