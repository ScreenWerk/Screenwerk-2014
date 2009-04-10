<?= form_open_multipart('upload/do_upload'); ?>
<?= form_upload(array('name'=>'upload_file', 'id'=>'upload_file')); ?><br />
<?= form_close(); ?>

<?php if(isset($error)) echo $error; ?>
<?php if(isset($data)) { echo '<pre>'; print_r($data); echo '</pre>'; } ?>



<script type="text/javascript">
	$(document).ready(function(){
		$("#upload_file").fileUpload({
			'uploader'  : '/javascripts/uploadify/uploader.swf',
			'script'    : '/javascripts/uploadify/upload.php',
			'cancelImg' : '/javascripts/uploadify/cancel.png',
			'auto'      : true,
			'multi'     : true,
			'buttonText': 'Select Files',
			'folder'    : '<?= $upload_folder; ?>'
		});
	});
</script>
