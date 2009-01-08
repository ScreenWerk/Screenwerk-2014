<?= form_open_multipart('upload/do_upload'); ?>
<?= form_upload(array('name'=>'upload_file')); ?><br />
<?= form_submit('upload_upload', 'Upload'); ?>

<?php if(isset($error)) echo $error; ?>
<?php if(isset($data)) { echo '<pre>'; print_r($data); echo '</pre>'; } ?>
