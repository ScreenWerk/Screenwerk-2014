<?= form_open(current_url()); ?>
<?= form_label('Username', 'user_name'); ?>
<?= form_input(array('name'=>'user_name')); ?><br />
<?= form_label('Password', 'user_secret'); ?>
<?= form_password(array('name'=>'user_secret')); ?><br />
<?= form_submit('login', 'LogIn'); ?>
