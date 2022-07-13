$(function() {
    const socket = io.connect('wss://vds0.skinchanger.cc:3337');

    socket.on('online', function(data) {
        $(".online_counter").html(data);
    });

});

function show_error_input( id ) {
    $('#' + id).addClass('error');

    setTimeout (function(){
        $('#' + id).removeClass('error');
    }, 3000);

    return null;
}

var letters = /^[0-9a-zA-Z]+$/;
var url = window.location.href;

function empty(str) {
    return str.trim() == '';
}

function n( title, message, type = 'info' ) {
    return $.notify({ title: title, message: message },{
        type: type,
        allow_dismiss: true,
        placement: { from: "bottom", align: "right"},
        offset: 20,
        spacing: 10,
        z_index: 9999999999,
        delay: 4000,
        timer: 1000,
        animate: { enter: 'animated fadeInDown', exit: 'animated fadeOutUp' },
        template: '<div data-notify="container" class="col-md-4 alert alert-{0}" role="alert"><button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button><span data-notify="icon"></span><span data-notify="title"><strong>{1}</strong></span> <span data-notify="message">{2}</span></div>'
    });
}

function auth(n) {
    let email = $('#auth_email').val();
    $.ajax({
        type: "POST",
        url: "/app/includes/controller.php",
        data: "auth=" + email,
        dataType: "json",
        success: function (result) {
            if (!result.status) {
                show_error_input('auth_email');
                n.update({'type': 'danger', 'message': result.message, 'title': '<strong>Ошибка</strong>'});
            } else {
                $('.auth_form').html('<form id="auth_step2"><input placeholder="Введите код подтверждения" type="number" id="auth_code" required minlength="6" maxlength="6"><button type="submit">Авторизоваться</button></form><script>$("#auth_step2").submit(function(e){e.preventDefault();$:fq=n(\'Уведомление\',\'Проверяем код подтверждения...\',\'info\');auth_step2(fq);});</script><div class="under-reg"> <small>Я подтверждаю, что мне исполнилось 18 лет и я ознакомился с <a href="#" data-toggle="modal" data-target=".modal_use">условиями предоставления услуг</a></small></div>');
                n.update({'type': 'success', 'message': result.message, 'title': '<strong>Успешно</strong>'});
            }
        }
    });
}

function auth_step2(n) {
    let code = $('#auth_code').val();
    $.ajax({
        type: "POST",
        url: "/app/includes/controller.php",
        data: "auth=1&step2=" + code,
        dataType: "json",
        success: function (result) {
            if (!result.status) {
                show_error_input('auth_code');
                n.update({'type': 'danger', 'message': result.message, 'title': '<strong>Ошибка</strong>'});
            } else {
                $('.modal_login').modal('hide');
                window.location.href='/cabinet';
            }
        }
    });
}

function changeLanguage( language ) {
    $.ajax({
        type: "POST",
        url: "/app/includes/controller.php",
        data: "changeLanguage=1&language=" + language,
        success: function (result) {
            console.log('Language changed');
        }
    });
}

function settings_changeLogin() {

    var login = $('#changeLogin_login').val();
    var password = $('#changeLogin_current_password').val();

    if( !login.match(letters) || empty(password) || empty(login) ) {
        return show_error_input('changeLogin_login');
    }

    $.ajax({
        type: "POST",
        url: "/app/includes/controller.php",
        data: "changeLogin=1&login=" + login + "&password=" + password,
        dataType: "json",
        success: function (result) {
            if (!result.status) {
                if( !result.login ) show_error_input('changeLogin_login');
                if( !result.password ) show_error_input('changeLogin_current_password');
            } else {
                $('#modal_changeLogin').modal('hide');
                window.location.href=url;
            }
        }
    });
}
function settings_resetHWID() {
    var password = $('#resetHWID_current_password').val();
    if( empty(password) ) return show_error_input('resetHWID_current_password');

    $.ajax({
        type: "POST",
        url: "/app/includes/controller.php",
        data: "resetHWID=1&password=" + password,
        dataType: "json",
        success: function (result) {
            if (!result.status) show_error_input('resetHWID_current_password');
            else {
                $('#modal_resetHWID').modal('hide');
                window.location.href=url;
            }
        }
    });
}
function uploadAvatar() {

    var file = $('#avatar_upload').prop('files')[0];
    var data = new FormData();

    data.append('file', file);

    $.ajax({
        url: '/app/includes/controller.php',
        dataType: 'json',
        cache: false,
        contentType: false,
        processData: false,
        data: data,
        type: 'post',
        success: function(response){
            if (!response.status) {
                alert(response.text);
            }
            else {
                $('#modal_uploadAvatar').modal('hide');
                window.location.href=url;
            }
        }
    });
}

function preorder_check() {

    var data = '';
    var email = $('#preorder_check_email').val().trim();

    if( email === '' ) {
        return show_error_input('preorder_check_email');
    }

    $.ajax({
        type: "POST",
        url: "/app/includes/controller.php",
        data: "preorder_check=" + email,
        dataType: "json",
        success: function (result) {
            if (!result.status) {
                data = '<h2>Ошибка...</h2>Мы не нашли вашу почту <span>'+email+'</span> в нашей базе предзаказов.<br><br> Возможно, вы указали почту с ошибкой или же не совершали предзаказ вовсе. Может быть, вы покупали предзаказ на другую почту?<br><input type="email" placeholder="Введите ваш e-mail" id="preorder_check_email"><a href="#" onclick="preorder_check()" class="btn-bot">Проверить</a>';
            } else {
                if( result.tariff === 499 ) data = '<h2>Спасибо за предзаказ!</h2> Вы купили предзаказ за 499 Р. (с 90 % скидкой)<br> У вас имеются доступы к:<br><br> — Вечная подписка Premium<br> — Доступ в закрытую группу<br> — Цвет никнейма в чате<br> — Доступы к бета-тестам<br> — Доступ к кастомным-скинам<br><br> Введите команду <span>/preorder</span> в сообщения группы Вконтакте,<br> чтобы получить больше информации и доступ в закрытую группу.<br> <a href="https://vk.me/skinchangercc" target="_blank" class="btn-bot">Написать боту</a>';
                else {
                    data = '<h2>Спасибо за предзаказ!</h2> Вы купили предзаказ за 299 Р. (с 90 % скидкой)<br> У вас имеются доступы к:<br><br> — Вечная подписка Premium<br> — Доступ в закрытую группу<br> — Цвет никнейма в чате<br> — Доступы к бета-тестам<br><br> — <span>У вас нет доступа к кастом-скинам, <br>но вы можете "Докупить" данную функцию</span><br><br> Введите команду <span>/preorder</span> в сообщения группы Вконтакте,<br> чтобы получить больше информации и доступ в закрытую группу.<br> <a class="btn-bot" href="https://vk.me/skinchangercc" target="_blank">Написать боту</a>';
                    $('.amapreorder .col-lg-5').html('<h2 style="margin-top: 96px;">Дополнительный доступ</h2>Вы можете доплатить 200 Рублей, чтобы "Докупить" функционал. Важно! Вводите ту же почту, что и в первый раз, чтобы мы заменили подписку.<br><a target="_blank" class="buymore" href="/payments/buy/preorder/200/ru?e='+email+'">Доплатить 200 Р за кастом-скины</a>');
                }
            }
            $('#preorder_check').html(data);
        }
    });
}

function settings_cancelRecurring() {
    $('.modal_cancelRecurring').modal('hide');
    $.ajax({
        type: "POST",
        url: "/app/includes/controller.php",
        data: "settings=1&cancelRecurring=1",
        dataType: "json",
        success: function (result) {
            n('Успешно!', 'Автопродление отключено', 'success');
            $('#settings_cancelRecurring').remove();
        }
    });
}