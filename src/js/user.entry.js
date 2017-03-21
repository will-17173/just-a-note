var tpl = require('./item.handlebars');

tinymce.init({
    selector: '#editor'
});


$('#logout').click(() => {
    location.href = '/logout';
})

class List {
    constructor() {
        this.get();
        this.bindEvent();
    }
    bindEvent() {
        $(document).on('click', '.delete-btn', (e) => {
            var $this = $(e.currentTarget);
            this.id = $this.parents('.panel').data('id');

        }).on('click', '#delete', e => {
            this.doDelete();
        }).on('click', '#new', e => {
            this.new();
        }).on('click', '#save', e => {
            this.save();
        }).on('click', '.edit-btn', e => {
            this.edit(e);
        })
    }
    get() {
        $.get('/list', function(data) {
            $('#list').html(tpl(data));
        })
    }
    doDelete() {
        $.post('/delete', { id: this.id }, data => {
            if (data.result == 'success') {
                $('[data-id=' + this.id + ']').remove();
                this.id = null;
                $('#delete_modal').modal('hide')
            } else {
                alert('删除失败');
            }
        })
    }
    new() {
        $('[name=title]').val('');
        tinyMCE.get('editor').setContent('');
        this.isNew = true;
    }
    edit(e) {
        var $this = $(e.currentTarget);
        var $parent = $this.parents('.panel');
        var title = $parent.find('.panel-title').text();
        var content = $parent.find('.panel-body').html();
        this.id = $parent.data('id');
        $('[name=title]').val(title);
        tinyMCE.get('editor').setContent(content);
        this.isEdit = true;
    }
    save() {
        var title = $('[name=title]').val(),
            content = tinyMCE.get('editor').getContent();
        if (title == '' && content == '') {
            return;
        }
        if (this.isNew) {
            $.post('/save', { title: title, content: content }, data => {
                if (data.result == 'success') {
                    $('#myModal').modal('hide');
                    this.get();
                } else {
                    alert('保存失败');
                }
            })
        } else if (this.isEdit) {
            $.post('/save', { title: title, content: content, id: this.id }, data => {
                if (data.result == 'success') {
                    $('#myModal').modal('hide');
                    this.get();
                } else {
                    alert('保存失败');
                }
            })
        }
    }
}

new List();