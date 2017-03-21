// $('[type=submit]').click(e => {
//     e.preventDefault();
//     let password = $('#inputPassword').val();
//     let user = $('#inputUser').val();
//     $.ajax({
//         url: '/login',
//         type: 'post',
//         data: {
//             user: user,
//             password: password
//         },
//         dataType: 'json',
//         success: data => {
//             data.result == 'success' ? location.href = data.redirect : alert(data.message);
//             console.log(data);
//         }
//     });
// })