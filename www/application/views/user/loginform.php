<?= form_open(site_url('user/login'),  array('style'=>'margin-top:20px;')); ?>
<?= form_label('Username', 'user_name'); ?>
<?= form_input(array('id'=>'user_name', 'name'=>'user_name')); ?><br />
<?= form_label('Password', 'user_secret'); ?>
<?= form_password(array('name'=>'user_secret')); ?><br />
<?= form_label('&nbsp;', 'login'); ?>
<?= form_submit('login', 'LogIn'); ?>

<script type="text/javascript">
	window.onload = function() {
		document.getElementById('user_name').focus();	
	}
</script>