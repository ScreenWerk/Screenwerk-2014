<h1>Upload</h1>
Uploaded media will be processed by server and will be available after few moments.
<br />
<br />
<center>
<?= form_open_multipart('upload/do_upload'); ?>
<?= form_upload(array('name'=>'upload_file', 'id'=>'upload_file')); ?>
<?= form_close(); ?>
</center>

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