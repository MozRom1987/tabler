(function($) {
    'use strict';

    // URL вашого Cloudflare Worker
    // ⚠️ ЗАМІНИ ЦЕЙ URL НА СВІЙ!
    const WORKER_URL = 'https://form-handler.web-miled.workers.dev';

    $(document).ready(function() {
        // Обробка всіх форм з класом ajax_form
        $('.ajax_form').on('submit', function(e) {
            e.preventDefault();
            
            const form = $(this);
            const submitBtn = form.find('input[type="submit"], button[type="submit"]');
            const originalBtnText = submitBtn.val() || submitBtn.text();
            
            // Очищаємо попередні помилки
            form.find('.error').removeClass('error');
            
            // Валідація обов'язкових полів
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
                    // Валідація телефону (базова)
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
                alert('Будь ласка, заповніть всі обов\'язкові поля');
                if (firstError) {
                    firstError.focus();
                }
                return;
            }
            
            // Збираємо дані форми
            const formData = {
                fio: form.find('input[name="fio"]').val().trim(),
                tel: form.find('input[name="tel"]').val().trim(),
                theme: form.find('input[name="theme"]').val() || 'Загальна консультація'
            };
            
            // Блокуємо кнопку та показуємо процес
            submitBtn.prop('disabled', true);
            if (submitBtn.is('input')) {
                submitBtn.val('Відправка...');
            } else {
                submitBtn.text('Відправка...');
            }
            
            // Відправка через Cloudflare Worker
            fetch(WORKER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            .then(response => response.json())
            .then(data => {
                // Показуємо модальне вікно з результатом
                if (typeof $.fancybox !== 'undefined') {
                    $.fancybox.open({
                        src: '#responseMessage',
                        type: 'inline',
                        opts: {
                            afterClose: function() {
                                if (data.success) {
                                    form[0].reset();
                                }
                            }
                        }
                    });
                    
                    if (data.success) {
                        $('#responseMessageTitle').text('Дякуємо!');
                        $('#responseMessageBody').html('<p>' + data.message + '</p>');
                    } else {
                        $('#responseMessageTitle').text('Помилка');
                        $('#responseMessageBody').html('<p>' + data.message + '</p>');
                    }
                } else {
                    // Якщо fancybox не доступний - звичайний alert
                    alert(data.message);
                    if (data.success) {
                        form[0].reset();
                    }
                }
            })
            .catch(error => {
                console.error('Form submission error:', error);
                alert('Виникла помилка при відправці форми. Перевірте інтернет-з\'єднання або спробуйте пізніше.');
            })
            .finally(() => {
                // Розблоковуємо кнопку
                submitBtn.prop('disabled', false);
                if (submitBtn.is('input')) {
                    submitBtn.val(originalBtnText);
                } else {
                    submitBtn.text(originalBtnText);
                }
            });
        });
        
        // Видалення помилок при введенні
        $('.ajax_form .required').on('input change', function() {
            $(this).removeClass('error');
        });
    });

})(jQuery);